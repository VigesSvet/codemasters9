"""Админ-CRUD новостей: создание, правка, публикация/снятие, удаление."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request

from .. import audit, permissions, security
from ..db import get_db, rows

router = APIRouter(prefix="/api/admin/news", tags=["admin-news"])

_FIELDS = ("date", "title_ru", "title_kk", "lead_ru", "lead_kk", "html_ru", "html_kk", "image")
_STATUSES = ("draft", "published")

DbDep = Annotated[Any, Depends(get_db)]
UserDep = Annotated[Any, Depends(security.require_user())]


def _check(db, request: Request, user, action: str, news_id) -> None:
    if not permissions.can(user, action):
        audit.log(db, user, action, "news", str(news_id), result="denied", ip=_ip(request))
        raise HTTPException(status_code=403, detail="Недостаточно прав")


def _ip(request: Request) -> str | None:
    return request.client.host if request.client else None


def _row(db, news_id: int) -> dict:
    row = db.execute("SELECT * FROM news WHERE id = ?", (news_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    return dict(row)


def _values(body: dict) -> dict:
    return {f: str(body[f]) if body[f] is not None else "" for f in _FIELDS if f in body}


@router.get("")
def list_news(db: DbDep, user: UserDep, page: int = 1, per_page: int = 20):
    page = max(1, min(page, 100_000))
    per_page = max(1, min(per_page, 100))
    total = db.execute("SELECT COUNT(*) AS n FROM news").fetchone()["n"]
    cur = db.execute(
        "SELECT id, date, title_ru, title_kk, image, pub_status FROM news"
        " ORDER BY date DESC, id DESC LIMIT ? OFFSET ?",
        (per_page, (page - 1) * per_page),
    )
    return {"total": total, "page": page, "per_page": per_page, "items": rows(cur)}


@router.get("/{news_id}")
def get_news(news_id: int, db: DbDep, user: UserDep):
    return _row(db, news_id)


@router.post("")
def create_news(request: Request, body: dict, db: DbDep, user: UserDep):
    _check(db, request, user, "news.create", "new")
    vals = _values(body)
    if not vals.get("title_ru", "").strip():
        raise HTTPException(status_code=422, detail="Укажите заголовок (RU)")
    vals = {**dict.fromkeys(_FIELDS, ""), **vals}
    vals["date"] = vals["date"] or security.now().date().isoformat()
    status = body.get("pub_status", "draft")
    if status not in _STATUSES:
        raise HTTPException(status_code=422, detail="Недопустимый статус")
    if status == "published":
        _check(db, request, user, "news.publish", "new")
    vals["pub_status"] = status
    cols = ", ".join(vals)
    cur = db.execute(f"INSERT INTO news ({cols}) VALUES ({', '.join('?' * len(vals))})", list(vals.values()))
    db.commit()
    audit.log(
        db, user, "news.create", "news", str(cur.lastrowid), details={"status": status}, ip=_ip(request)
    )
    return _row(db, cur.lastrowid)


@router.put("/{news_id}")
def update_news(news_id: int, request: Request, body: dict, db: DbDep, user: UserDep):
    _row(db, news_id)
    _check(db, request, user, "news.edit", news_id)
    vals = _values(body)
    if not vals:
        raise HTTPException(status_code=400, detail="Нет полей для обновления")
    if "title_ru" in vals and not vals["title_ru"].strip():
        raise HTTPException(status_code=422, detail="Заголовок (RU) не может быть пустым")
    sets = ", ".join(f"{k} = ?" for k in vals)
    db.execute(f"UPDATE news SET {sets} WHERE id = ?", [*vals.values(), news_id])
    db.commit()
    audit.log(db, user, "news.edit", "news", str(news_id), details={"fields": sorted(vals)}, ip=_ip(request))
    return _row(db, news_id)


def _set_status(db, request, user, news_id: int, status: str) -> dict:
    _row(db, news_id)
    _check(db, request, user, "news.publish", news_id)
    db.execute("UPDATE news SET pub_status = ? WHERE id = ?", (status, news_id))
    db.commit()
    action = "news.publish" if status == "published" else "news.unpublish"
    audit.log(db, user, action, "news", str(news_id), ip=_ip(request))
    return _row(db, news_id)


@router.post("/{news_id}/publish")
def publish_news(news_id: int, request: Request, db: DbDep, user: UserDep):
    return _set_status(db, request, user, news_id, "published")


@router.post("/{news_id}/unpublish")
def unpublish_news(news_id: int, request: Request, db: DbDep, user: UserDep):
    return _set_status(db, request, user, news_id, "draft")


@router.delete("/{news_id}")
def delete_news(news_id: int, request: Request, db: DbDep, user: UserDep):
    row = _row(db, news_id)
    _check(db, request, user, "news.delete", news_id)
    db.execute("DELETE FROM news WHERE id = ?", (news_id,))
    db.commit()
    audit.log(
        db, user, "news.delete", "news", str(news_id), details={"title_ru": row["title_ru"]}, ip=_ip(request)
    )
    return {"ok": True}
