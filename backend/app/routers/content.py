"""Редактируемые блоки контента (страницы, FAQ): публичное чтение и правка из админки."""

from __future__ import annotations

import re
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request

from .. import audit, permissions, security
from ..db import get_db

LANGS = ("ru", "kk", "en")
_KEY = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")

router = APIRouter(prefix="/api/content", tags=["content"])
admin_router = APIRouter(prefix="/api/admin/content", tags=["admin-content"])

DbDep = Annotated[Any, Depends(get_db)]
UserDep = Annotated[Any, Depends(security.require_user())]


def _key(key: str) -> str:
    if not _KEY.match(key):
        raise HTTPException(status_code=404, detail="Блок не найден")
    return key


def _lang(lang: str) -> str:
    if lang not in LANGS:
        raise HTTPException(status_code=422, detail="lang: ru, kk или en")
    return lang


def _block(db, key: str, lang: str) -> dict | None:
    row = db.execute(
        "SELECT key, lang, title, body, updated_by, updated_at FROM content_blocks"
        " WHERE key = ? AND lang = ?",
        (key, lang),
    ).fetchone()
    return dict(row) if row else None


@router.get("/{key}")
def public_block(key: str, db: DbDep, lang: str = "ru"):
    block = _block(db, _key(key), _lang(lang))
    if block is None:
        raise HTTPException(status_code=404, detail="Блок не найден")
    return {"key": key, "lang": lang, "title": block["title"], "body": block["body"]}


@admin_router.get("/{key}")
def admin_blocks(key: str, db: DbDep, user: UserDep):
    _key(key)
    out = {}
    for lang in LANGS:
        out[lang] = _block(db, key, lang) or {
            "key": key,
            "lang": lang,
            "title": "",
            "body": "",
            "updated_by": None,
            "updated_at": None,
        }
    return {"key": key, "blocks": out}


@admin_router.put("/{key}")
def put_block(key: str, request: Request, body: dict, db: DbDep, user: UserDep):
    _key(key)
    ip = request.client.host if request.client else None
    if not permissions.can(user, "content.edit"):
        audit.log(db, user, "content.edit", "content", key, result="denied", ip=ip)
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    lang = _lang(str(body.get("lang", "ru")))
    title = str(body.get("title") or "")
    text = str(body.get("body") or "")
    if len(title) > 500 or len(text) > 100_000:
        raise HTTPException(status_code=422, detail="Слишком длинный текст")
    db.execute(
        "INSERT INTO content_blocks (key, lang, title, body, updated_by, updated_at) VALUES (?,?,?,?,?,?)"
        " ON CONFLICT(key, lang) DO UPDATE SET title=excluded.title, body=excluded.body,"
        " updated_by=excluded.updated_by, updated_at=excluded.updated_at",
        (key, lang, title, text, user["username"], security.now().isoformat()),
    )
    db.commit()
    audit.log(db, user, "content.edit", "content", key, details={"lang": lang, "len": len(text)}, ip=ip)
    return _block(db, key, lang)
