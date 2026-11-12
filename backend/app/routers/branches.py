"""Публичные эндпоинты филиалов."""

from __future__ import annotations

import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..models import Branch

router = APIRouter(prefix="/api/branches", tags=["branches"])

DbDep = Annotated[sqlite3.Connection, Depends(get_db)]

_COLS = (
    "id, slug, kind, name_ru, name_kk, name_en, address_ru, address_kk, address_en, "
    "phones, email, hours_ru, hours_kk, hours_en, lat, lon, head, note"
)

_TEXT_FIELDS = (
    "slug",
    "kind",
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
    "head",
    "note",
)


def _payload(row: sqlite3.Row) -> dict:
    d = dict(row)
    for key in _TEXT_FIELDS:
        d[key] = d.get(key) or ""
    return d


@router.get("", response_model=list[Branch])
def list_branches(db: DbDep):
    rows = db.execute(f"SELECT {_COLS} FROM branches WHERE visible = 1 ORDER BY id").fetchall()
    return [_payload(r) for r in rows]


@router.get("/{slug}", response_model=Branch)
def get_branch(slug: str, db: DbDep):
    row = db.execute(f"SELECT {_COLS} FROM branches WHERE slug = ? AND visible = 1", (slug,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="not found")
    return _payload(row)
