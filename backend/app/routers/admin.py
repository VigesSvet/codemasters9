"""Админ-эндпоинты: units, files, branches, audit, export, users."""

from __future__ import annotations

import csv
import hashlib
import io
import json
import secrets
import sqlite3
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import Response

from .. import audit, permissions, security
from ..db import get_db, rows
from ..models import Transition
from ..workflow import transition as do_transition

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED_LEVELS = ("fond", "opis", "delo", "doc")
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 МБ
PER_PAGE = 20

_EDITABLE_UNIT_FIELDS = (
    "number",
    "title_ru",
    "title_kk",
    "title_en",
    "years_from",
    "years_to",
    "doc_type",
    "place",
    "theme",
    "author",
    "keywords",
    "lang",
    "extent",
    "branch_id",
    "access_note",
)

_BRANCH_EDITABLE_FIELDS = (
    "name_ru",
    "name_kk",
    "name_en",
    "address_ru",
    "address_kk",
    "address_en",
    "phones",
    "email",
    "hours_ru",
    "hours_kk",
    "hours_en",
    "lat",
    "lon",
    "coords_verified",
    "head",
    "note",
)


def _ip(request: Request) -> str | None:
    return request.client.host if request.client else None


def _check(db, user, action: str, obj, object_type: str, object_id) -> None:
    """Проверить право; отказ -> audit denied + 403."""
    if not permissions.can(user, action, obj):
        audit.log(db, user, action, object_type, str(object_id), result="denied")
        raise HTTPException(status_code=403, detail="Недостаточно прав")


def _years(body: dict) -> tuple[int | None, int | None]:
    years_from = body.get("years_from")
    years_to = body.get("years_to")
    years = body.get("years")
    if years_from is None and isinstance(years, (list, tuple)) and years:
        years_from = years[0]
        if len(years) >= 2:
            years_to = years[1]
    return years_from, years_to


def _resolve_fond(db, body: dict) -> int:
    if body.get("fond_id"):
        row = db.execute("SELECT id FROM fonds WHERE id = ?", (body["fond_id"],)).fetchone()
    elif body.get("fond_code"):
        row = db.execute("SELECT id FROM fonds WHERE code = ?", (body["fond_code"],)).fetchone()
    else:
        row = None
    if row is None:
        raise HTTPException(status_code=422, detail="Фонд не найден")
    return row["id"]


def _unit_row(db, unit_id: int) -> dict:
    row = db.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Единица не найдена")
    return dict(row)


# --- units ---


@router.get("/units")
def list_units(
    request: Request,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
    status: str | None = None,
    branch: str | None = None,
    q: str | None = None,
    page: int = 1,
    per_page: int = PER_PAGE,
):
    where: list[str] = []
    params: list[Any] = []
    if status:
        where.append("u.pub_status = ?")
        params.append(status)
    if branch:
        if str(branch).isdigit():
            where.append("u.branch_id = ?")
            params.append(int(branch))
        else:
            where.append("u.branch_id IN (SELECT id FROM branches WHERE slug = ?)")
            params.append(branch)
    if q:
        where.append("(u.code LIKE ? OR u.title_ru LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like])
    where_sql = (" WHERE " + " AND ".join(where)) if where else ""
    total = db.execute(f"SELECT COUNT(*) AS n FROM units u{where_sql}", params).fetchone()["n"]
    offset = (page - 1) * per_page
    cur = db.execute(
        f"SELECT u.* FROM units u{where_sql} ORDER BY u.id LIMIT ? OFFSET ?",
        params + [per_page, offset],
    )
    return {"total": total, "page": page, "per_page": per_page, "items": rows(cur)}


@router.post("/units")
def create_unit(
    request: Request,
    body: dict,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    _check(db, user, "unit.create", None, "unit", None)
    missing = []
    if not body.get("code"):
        missing.append("code")
    if not body.get("title_ru"):
        missing.append("title_ru")
    if not body.get("level"):
        missing.append("level")
    if not body.get("fond_id") and not body.get("fond_code"):
        missing.append("fond_id/fond_code")
    years_from, _ = _years(body)
    if years_from is None:
        missing.append("years")
    if missing:
        raise HTTPException(status_code=422, detail=f"Отсутствуют обязательные поля: {', '.join(missing)}")

    level = body.get("level")
    if level not in ALLOWED_LEVELS:
        raise HTTPException(status_code=422, detail="Недопустимый level")

    fond_id = _resolve_fond(db, body)
    years_from, years_to = _years(body)

    try:
        cur = db.execute(
            "INSERT INTO units"
            " (fond_id, inventory_id, level, code, number, title_ru, title_kk, title_en,"
            "  years_from, years_to, doc_type, place, theme, author, keywords, lang, extent,"
            "  branch_id, pub_status, access_note, version, created_by)"
            " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (
                fond_id,
                body.get("inventory_id"),
                level,
                body["code"],
                body.get("number"),
                body["title_ru"],
                body.get("title_kk"),
                body.get("title_en"),
                years_from,
                years_to,
                body.get("doc_type"),
                body.get("place"),
                body.get("theme"),
                body.get("author"),
                body.get("keywords"),
                body.get("lang"),
                body.get("extent"),
                body.get("branch_id"),
                "draft",
                body.get("access_note"),
                1,
                user["id"],
            ),
        )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Такой code уже существует") from None
    unit_id = cur.lastrowid
    db.commit()

    row = db.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
    db.execute(
        "INSERT INTO unit_versions (unit_id, version, data_json, author_id, pub_status, comment, created_at)"
        " VALUES (?,?,?,?,?,?,?)",
        (
            unit_id,
            1,
            json.dumps(dict(row), ensure_ascii=False, default=str),
            user["id"],
            "draft",
            "Создание",
            security.now().isoformat(),
        ),
    )
    db.commit()
    audit.log(db, user, "unit.create", "unit", str(unit_id), result="ok", ip=_ip(request))
    return dict(row)


@router.get("/units/{unit_id}")
def get_unit(
    request: Request,
    unit_id: int,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    return _unit_row(db, unit_id)


@router.put("/units/{unit_id}")
def update_unit(
    request: Request,
    unit_id: int,
    body: dict,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    row = db.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Единица не найдена")
    _check(db, user, "unit.edit", row, "unit", unit_id)

    if body.get("version") is not None and body["version"] != row["version"]:
        raise HTTPException(status_code=409, detail="Версия устарела, обновите данные")

    updates: list[str] = []
    params: list[Any] = []
    for field in _EDITABLE_UNIT_FIELDS:
        if field in body:
            updates.append(f"{field} = ?")
            params.append(body[field])
    if not updates:
        raise HTTPException(status_code=400, detail="Нет полей для обновления")

    new_version = row["version"] + 1
    updates.append("version = ?")
    params.append(new_version)
    updates.append("updated_at = ?")
    params.append(security.now().isoformat())
    params.append(unit_id)
    db.execute(f"UPDATE units SET {', '.join(updates)} WHERE id = ?", params)

    new_row = db.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
    db.execute(
        "INSERT INTO unit_versions (unit_id, version, data_json, author_id, pub_status, comment, created_at)"
        " VALUES (?,?,?,?,?,?,?)",
        (
            unit_id,
            new_version,
            json.dumps(dict(new_row), ensure_ascii=False, default=str),
            user["id"],
            new_row["pub_status"],
            body.get("comment", ""),
            security.now().isoformat(),
        ),
    )
    db.commit()
    audit.log(db, user, "unit.edit", "unit", str(unit_id), result="ok", ip=_ip(request))
    return dict(new_row)


@router.delete("/units/{unit_id}")
def delete_unit(
    request: Request,
    unit_id: int,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    row = db.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Единица не найдена")
    _check(db, user, "unit.delete", row, "unit", unit_id)
    db.execute("DELETE FROM files WHERE unit_id = ?", (unit_id,))
    db.execute("DELETE FROM unit_versions WHERE unit_id = ?", (unit_id,))
    db.execute("DELETE FROM catalog_fts WHERE unit_id = ?", (unit_id,))
    db.execute("DELETE FROM units WHERE id = ?", (unit_id,))
    db.commit()
    audit.log(db, user, "unit.delete", "unit", str(unit_id), result="ok", ip=_ip(request))
    return {"ok": True}


@router.post("/units/{unit_id}/transition")
def transition_unit(
    request: Request,
    unit_id: int,
    body: Transition,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    return do_transition(db, user, unit_id, body.to, body.comment)


@router.get("/units/{unit_id}/versions")
def unit_versions(
    request: Request,
    unit_id: int,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    row = db.execute("SELECT id FROM units WHERE id = ?", (unit_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Единица не найдена")
    # имена автора и согласующего для истории версий
    cur = db.execute(
        "SELECT v.*, a.username AS author_name, r.username AS reviewer_name"
        " FROM unit_versions v"
        " LEFT JOIN users a ON a.id = v.author_id"
        " LEFT JOIN users r ON r.id = v.reviewer_id"
        " WHERE v.unit_id = ? ORDER BY v.version DESC",
        (unit_id,),
    )
    return {"unit_id": unit_id, "items": rows(cur)}


# --- files ---


@router.post("/units/{unit_id}/files")
def upload_unit_file(
    request: Request,
    unit_id: int,
    file: Annotated[UploadFile, File()],
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    _check(db, user, "file.upload", None, "unit", unit_id)
    row = db.execute("SELECT id FROM units WHERE id = ?", (unit_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Единица не найдена")

    data = file.file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Файл больше 20 МБ")

    mime = security.detect_mime(data)
    if mime is None:
        raise HTTPException(status_code=422, detail="Недопустимый тип файла")

    sha256 = hashlib.sha256(data).hexdigest()
    files_dir = Path(request.app.state.settings.files_dir)
    files_dir.mkdir(parents=True, exist_ok=True)
    stored_name = secrets.token_hex(16)
    (files_dir / stored_name).write_bytes(data)

    cur = db.execute(
        "INSERT INTO files (unit_id, filename, mime, size, sha256, kind, access, origin, uploaded_by)"
        " VALUES (?,?,?,?,?,?,?,?,?)",
        (unit_id, stored_name, mime, len(data), sha256, "view", "needs_check", file.filename, user["id"]),
    )
    db.commit()
    audit.log(
        db,
        user,
        "file.upload",
        "file",
        str(cur.lastrowid),
        result="ok",
        details={"unit_id": unit_id, "sha256": sha256},
        ip=_ip(request),
    )
    return {
        "id": cur.lastrowid,
        "filename": file.filename,
        "mime": mime,
        "size": len(data),
        "sha256": sha256,
        "access": "needs_check",
    }


@router.put("/files/{file_id}/access")
def set_file_access(
    request: Request,
    file_id: int,
    body: dict,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    row = db.execute("SELECT * FROM files WHERE id = ?", (file_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Файл не найден")
    _check(db, user, "file.set_access", None, "file", file_id)
    access = body.get("access")
    if access not in ("public", "no_publish", "needs_check"):
        raise HTTPException(status_code=422, detail="Недопустимый access")
    db.execute("UPDATE files SET access = ? WHERE id = ?", (access, file_id))
    db.commit()
    audit.log(
        db,
        user,
        "file.set_access",
        "file",
        str(file_id),
        result="ok",
        details={"access": access},
        ip=_ip(request),
    )
    return {"id": file_id, "access": access}


@router.get("/units/{unit_id}/files")
def list_unit_files(
    request: Request,
    unit_id: int,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    """Список файлов единицы для админки (доступ и загрузчик)."""
    row = db.execute("SELECT id FROM units WHERE id = ?", (unit_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Единица не найдена")
    cur = db.execute(
        "SELECT f.id, f.filename, f.mime, f.size, f.access, f.kind, f.sha256,"
        " f.uploaded_by, f.uploaded_at, u.username AS uploader"
        " FROM files f LEFT JOIN users u ON u.id = f.uploaded_by"
        " WHERE f.unit_id = ? ORDER BY f.id",
        (unit_id,),
    )
    return {"unit_id": unit_id, "items": rows(cur)}


# --- branches ---


@router.get("/branches")
def list_branches(
    request: Request,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    cur = db.execute("SELECT * FROM branches ORDER BY id")
    return rows(cur)


@router.put("/branches/{branch_id}")
def update_branch(
    request: Request,
    branch_id: int,
    body: dict,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
):
    row = db.execute("SELECT * FROM branches WHERE id = ?", (branch_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Филиал не найден")
    _check(db, user, "branch.edit", row, "branch", branch_id)

    updates: list[str] = []
    params: list[Any] = []
    for field in _BRANCH_EDITABLE_FIELDS:
        if field in body:
            updates.append(f"{field} = ?")
            params.append(body[field])
    if not updates:
        raise HTTPException(status_code=400, detail="Нет полей для обновления")
    updates.append("updated_at = ?")
    params.append(security.now().isoformat())
    params.append(branch_id)
    db.execute(f"UPDATE branches SET {', '.join(updates)} WHERE id = ?", params)
    db.commit()
    audit.log(db, user, "branch.edit", "branch", str(branch_id), result="ok", ip=_ip(request))
    new_row = db.execute("SELECT * FROM branches WHERE id = ?", (branch_id,)).fetchone()
    return dict(new_row)


# --- audit ---


@router.get("/audit")
def list_audit(
    request: Request,
    db: Annotated[Any, Depends(get_db)],
    current_user: Annotated[Any, Depends(security.require_role("admin", "moderator"))],
    user: str | None = None,
    action: str | None = None,
    object_type: str | None = None,
    result: str | None = None,
    page: int = 1,
    per_page: int = PER_PAGE,
):
    where: list[str] = []
    params: list[Any] = []
    if user:
        where.append("(username LIKE ? OR user_id = ?)")
        params.extend([f"%{user}%", user if str(user).isdigit() else -1])
    if action:
        where.append("action = ?")
        params.append(action)
    if object_type:
        where.append("object_type = ?")
        params.append(object_type)
    if result:
        where.append("result = ?")
        params.append(result)
    where_sql = (" WHERE " + " AND ".join(where)) if where else ""
    total = db.execute(f"SELECT COUNT(*) AS n FROM audit_log{where_sql}", params).fetchone()["n"]
    offset = (page - 1) * per_page
    cur = db.execute(
        f"SELECT * FROM audit_log{where_sql} ORDER BY id DESC LIMIT ? OFFSET ?",
        params + [per_page, offset],
    )
    return {"total": total, "page": page, "per_page": per_page, "items": rows(cur)}


# --- export ---


@router.get("/export.csv")
def export_csv(
    request: Request,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
    status: str = "published",
):
    if status != "published":
        status = "published"
    cur = db.execute(
        "SELECT id, code, level, title_ru, title_kk, title_en, years_from, years_to,"
        " doc_type, place, theme, author, pub_status FROM units WHERE pub_status = ? ORDER BY id",
        (status,),
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "code",
            "level",
            "title_ru",
            "title_kk",
            "title_en",
            "years_from",
            "years_to",
            "doc_type",
            "place",
            "theme",
            "author",
            "pub_status",
        ]
    )
    for r in rows(cur):
        writer.writerow(
            [
                r[c]
                for c in (
                    "id",
                    "code",
                    "level",
                    "title_ru",
                    "title_kk",
                    "title_en",
                    "years_from",
                    "years_to",
                    "doc_type",
                    "place",
                    "theme",
                    "author",
                    "pub_status",
                )
            ]
        )
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=export.csv"},
    )


# --- users ---


@router.get("/users")
def list_users(
    request: Request,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_role("admin"))],
):
    cur = db.execute("SELECT id, username, role, branch_id, display_name, is_active FROM users ORDER BY id")
    return rows(cur)


@router.post("/users")
def create_user(
    request: Request,
    body: dict,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_role("admin"))],
):
    username = body.get("username")
    password = body.get("password")
    role = body.get("role")
    if not username or not password or not role:
        raise HTTPException(status_code=422, detail="username, password, role обязательны")
    if role not in permissions.ROLES:
        raise HTTPException(status_code=422, detail="Недопустимая роль")
    password_hash = security.hash_password(password)
    branch_id = body.get("branch_id")
    display_name = body.get("display_name", username)
    try:
        cur = db.execute(
            "INSERT INTO users (username, password_hash, role, branch_id, display_name) VALUES (?,?,?,?,?)",
            (username, password_hash, role, branch_id, display_name),
        )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Пользователь уже существует") from None
    db.commit()
    audit.log(
        db,
        user,
        "users.manage",
        "user",
        str(cur.lastrowid),
        result="ok",
        details={"username": username},
        ip=_ip(request),
    )
    return {
        "id": cur.lastrowid,
        "username": username,
        "role": role,
        "branch_id": branch_id,
        "display_name": display_name,
    }
