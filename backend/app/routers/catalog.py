"""Публичные эндпоинты каталога и скачивания файлов."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse

from .. import audit, searchlog
from ..db import get_db
from ..models import SearchResponse, UnitDetail
from ..search import search_units, unit_card

router = APIRouter(prefix="/api/catalog", tags=["catalog"])
files_router = APIRouter(prefix="/api/files", tags=["files"])

DbDep = Annotated[sqlite3.Connection, Depends(get_db)]

_UNIT_SELECT = (
    "units.id, units.level, units.code, units.fond_id, units.inventory_id, "
    "units.title_ru, units.title_kk, units.title_en, "
    "units.years_from, units.years_to, units.doc_type, units.place, units.theme, "
    "units.author, units.extent, units.access_note, units.is_demo, "
    "units.pub_status, units.version, units.status_changed_at, "
    "branches.id AS branch_id, branches.slug AS branch_slug, branches.name_ru AS branch_name, "
    "EXISTS (SELECT 1 FROM files f WHERE f.unit_id = units.id AND f.access = 'public') AS has_public_file"
)


@router.get("/search", response_model=SearchResponse)
def search(
    q: str | None = None,
    level: str | None = None,
    fond: str | None = None,
    opis: str | None = None,
    delo: str | None = None,
    period: str | None = None,
    year_from: int | None = None,
    year_to: int | None = None,
    type: str | None = None,
    branch: str | None = None,
    place: str | None = None,
    theme: str | None = None,
    author: str | None = None,
    keywords: str | None = None,
    lang: str | None = None,
    digitized: bool | None = None,
    open: bool | None = None,
    sort: str = "rel",
    page: int = 1,
    per_page: int = 10,
    db: DbDep = None,
):
    params = {
        "q": q,
        "level": level,
        "fond": fond,
        "opis": opis,
        "delo": delo,
        "period": period,
        "year_from": year_from,
        "year_to": year_to,
        "type": type,
        "branch": branch,
        "place": place,
        "theme": theme,
        "author": author,
        "keywords": keywords,
        "lang": lang,
        "digitized": digitized,
        "open": open,
        "sort": sort,
        "page": page,
        "per_page": per_page,
    }
    result = search_units(db, params)
    searchlog.log_search(db, q, result.get("total", 0))
    return result


def _get_published_unit(db: sqlite3.Connection, unit_id: int) -> sqlite3.Row:
    row = db.execute(
        f"SELECT {_UNIT_SELECT} FROM units "
        "LEFT JOIN branches ON branches.id = units.branch_id WHERE units.id = ?",
        (unit_id,),
    ).fetchone()
    if row is None or row["pub_status"] != "published":
        raise HTTPException(status_code=404, detail="not found")
    return row


@router.get("/units/{unit_id}", response_model=UnitDetail)
def get_unit(unit_id: int, db: DbDep = None):
    row = _get_published_unit(db, unit_id)

    files = db.execute(
        "SELECT id, filename, mime, size, access FROM files WHERE unit_id = ? ORDER BY id",
        (unit_id,),
    ).fetchall()
    file_infos = [
        {
            "id": f["id"],
            "filename": f["filename"],
            "mime": f["mime"] or "",
            "size": f["size"] or 0,
            "access": f["access"],
            "downloadable": f["access"] == "public",
        }
        for f in files
    ]

    versions = db.execute(
        "SELECT version, created_at AS status_changed_at FROM unit_versions "
        "WHERE unit_id = ? AND pub_status = 'published' ORDER BY version",
        (unit_id,),
    ).fetchall()
    if versions:
        versions_public = [
            {"version": v["version"], "status_changed_at": v["status_changed_at"] or ""} for v in versions
        ]
    else:
        versions_public = [{"version": row["version"], "status_changed_at": row["status_changed_at"] or ""}]

    fond = db.execute(
        "SELECT id, code, title_ru, title_kk, title_en FROM fonds WHERE id = ?",
        (row["fond_id"],),
    ).fetchone()
    inventory = db.execute(
        "SELECT id, number, title_ru, title_kk, title_en FROM inventories WHERE id = ?",
        (row["inventory_id"],),
    ).fetchone()

    # у дела и описи - только собственное описание: аннотация фонда относится к фонду,
    # а не к каждому делу в нём; описание фонда отдаём лишь для записи уровня «фонд»
    own = db.execute(
        "SELECT description_ru, description_kk FROM units WHERE id = ?",
        (unit_id,),
    ).fetchone()
    desc_ru = (own["description_ru"] or "") if own else ""
    desc_kk = (own["description_kk"] or "") if own else ""
    if row["level"] == "fond" and not (desc_ru or desc_kk):
        fond_desc = db.execute(
            "SELECT description_ru, description_kk FROM fonds WHERE id = ?",
            (row["fond_id"],),
        ).fetchone()
        if fond_desc:
            desc_ru = fond_desc["description_ru"] or ""
            desc_kk = fond_desc["description_kk"] or ""
    description = {"ru": desc_ru, "kk": desc_kk, "en": desc_ru}

    parents = {
        "fond": {
            "id": fond["id"],
            "code": fond["code"],
            "title": _localized(fond),
        }
        if fond
        else None,
        "inventory": {
            "id": inventory["id"],
            "number": inventory["number"] or "",
            "title": _localized(inventory),
        }
        if inventory
        else None,
    }

    card = unit_card(row)
    card.update(
        description=description,
        files=file_infos,
        versions_public=versions_public,
        parents=parents,
    )
    return card


def _localized(row: sqlite3.Row) -> dict:
    return {"ru": row["title_ru"] or "", "kk": row["title_kk"] or "", "en": row["title_en"] or ""}


def _fond_payload(row: sqlite3.Row) -> dict:
    years = [y for y in (row["years_from"], row["years_to"]) if y is not None]
    return {
        "id": row["id"],
        "code": row["code"],
        "kind": row["kind"],
        "title": {"ru": row["title_ru"] or "", "kk": row["title_kk"] or "", "en": row["title_en"] or ""},
        "years": years,
        "extent": row["extent"] or "",
        "description": row["description_ru"] or "",
        "branch": {
            "id": row["branch_id"],
            "slug": row["branch_slug"] or "",
            "name": row["branch_name"] or "",
        }
        if row["branch_id"]
        else None,
        "is_demo": bool(row["is_demo"]),
    }


_FOND_SELECT = (
    "fonds.id, fonds.code, fonds.kind, fonds.title_ru, fonds.title_kk, fonds.title_en, "
    "fonds.years_from, fonds.years_to, fonds.extent, fonds.description_ru, "
    "fonds.branch_id, fonds.is_demo, branches.slug AS branch_slug, branches.name_ru AS branch_name"
)


@router.get("/fonds/{fond_id}")
def get_fond(fond_id: int, db: DbDep = None):
    row = db.execute(
        f"SELECT {_FOND_SELECT} FROM fonds "
        "LEFT JOIN branches ON branches.id = fonds.branch_id WHERE fonds.id = ?",
        (fond_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="not found")
    return _fond_payload(row)


@router.get("/fonds/{fond_id}/inventories")
def get_fond_inventories(fond_id: int, db: DbDep = None):
    rows = db.execute(
        "SELECT id, fond_id, number, title_ru, title_kk, title_en, years_from, years_to, units_count "
        "FROM inventories WHERE fond_id = ? ORDER BY number",
        (fond_id,),
    ).fetchall()
    out = []
    for r in rows:
        years = [y for y in (r["years_from"], r["years_to"]) if y is not None]
        out.append(
            {
                "id": r["id"],
                "fond_id": r["fond_id"],
                "number": r["number"] or "",
                "title": {"ru": r["title_ru"] or "", "kk": r["title_kk"] or "", "en": r["title_en"] or ""},
                "years": years,
                "units_count": r["units_count"],
            }
        )
    return out


@router.get("/fonds")
def list_fonds(
    kind: str | None = None,
    q: str | None = None,
    page: int = 1,
    per_page: int = 10,
    db: DbDep = None,
):
    where = ["1=1"]
    args: list = []
    if kind:
        where.append("fonds.kind = ?")
        args.append(kind)
    if q:
        where.append("(fonds.code LIKE ? OR fonds.title_ru LIKE ? OR fonds.title_kk LIKE ?)")
        like = f"%{q}%"
        args.extend([like, like, like])

    where_sql = " AND ".join(where)
    total = db.execute(f"SELECT COUNT(*) AS n FROM fonds WHERE {where_sql}", args).fetchone()["n"]

    page = max(1, min(page, 100_000))
    per_page = max(1, min(per_page, 50))
    rows = db.execute(
        f"SELECT {_FOND_SELECT} FROM fonds "
        "LEFT JOIN branches ON branches.id = fonds.branch_id "
        f"WHERE {where_sql} ORDER BY fonds.code LIMIT ? OFFSET ?",
        args + [per_page, (page - 1) * per_page],
    ).fetchall()

    return {"total": total, "page": page, "per_page": per_page, "items": [_fond_payload(r) for r in rows]}


@files_router.get("/{file_id}/download")
def download_file(
    file_id: int,
    request: Request,
    db: DbDep = None,
):
    row = db.execute(
        "SELECT f.id, f.unit_id, f.filename, f.mime, f.access, u.pub_status "
        "FROM files f JOIN units u ON u.id = f.unit_id WHERE f.id = ?",
        (file_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="not found")

    def _denied(reason: str) -> JSONResponse:
        audit.log(db, None, "file.download", "file", file_id, result="denied", details={"reason": reason})
        return JSONResponse(
            status_code=403,
            content={"error": "restricted", "reason": reason, "howto": "reading_room"},
        )

    if row["pub_status"] != "published":
        # черновик неотличим от несуществующего файла(SEC-06) - иначе перебором id видно, что файл есть
        audit.log(
            db, None, "file.download", "file", file_id, result="denied", details={"reason": "unpublished"}
        )
        raise HTTPException(status_code=404, detail="not found")
    if row["access"] != "public":
        return _denied(row["access"])

    settings = request.app.state.settings
    files_dir = Path(settings.files_dir).resolve()
    name = Path(row["filename"] or "").name
    path = (files_dir / name).resolve()
    if not name or not path.is_file() or path.parent != files_dir:
        raise HTTPException(status_code=404, detail="not found")

    return FileResponse(str(path), media_type=row["mime"] or None, filename=name)
