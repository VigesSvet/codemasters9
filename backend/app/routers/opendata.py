"""Открытые данные: публичная выгрузка каталога целиком (CSV и JSON).

Отдаёт только опубликованные записи (pub_status='published') без служебных полей
(created_by, status_changed_by, путей файлов). CSV идёт с защитой от формул
и UTF-8 BOM, чтобы Excel открывал кириллицу корректно.
"""

from __future__ import annotations

import csv
import io
import sqlite3
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Response

from ..db import get_db, rows
from .admin import _csv_safe

router = APIRouter(prefix="/api/opendata", tags=["opendata"])

DbDep = Annotated[sqlite3.Connection, Depends(get_db)]

# потолок строк в одной выгрузке - страховка от раздувания ответа
MAX_ROWS = 10_000

# публичные поля записи: без created_by, status_changed_by и путей файлов
_COLS = (
    "units.id",
    "units.level",
    "units.code",
    "units.fond_id",
    "units.inventory_id",
    "units.title_ru",
    "units.title_kk",
    "units.title_en",
    "units.years_from",
    "units.years_to",
    "units.doc_type",
    "units.place",
    "units.theme",
    "units.author",
    "units.extent",
    "units.is_demo",
    "branches.name_ru AS branch_name",
    "EXISTS (SELECT 1 FROM files f WHERE f.unit_id = units.id AND f.access = 'public') AS has_public_file",
)

_CSV_HEADERS = (
    "id",
    "level",
    "code",
    "fond_id",
    "inventory_id",
    "title_ru",
    "title_kk",
    "title_en",
    "years_from",
    "years_to",
    "doc_type",
    "place",
    "theme",
    "author",
    "extent",
    "branch",
    "has_public_file",
    "is_demo",
)


def _published_rows(db: sqlite3.Connection) -> list[dict[str, Any]]:
    cur = db.execute(
        f"SELECT {', '.join(_COLS)} FROM units "
        "LEFT JOIN branches ON branches.id = units.branch_id "
        "WHERE units.pub_status = 'published' ORDER BY units.id LIMIT ?",
        (MAX_ROWS,),
    )
    return rows(cur)


def _record(r: dict[str, Any]) -> dict[str, Any]:
    """Плоская запись каталога без служебных полей (булевы - настоящие bool для JSON)."""
    return {
        "id": r["id"],
        "level": r["level"],
        "code": r["code"],
        "fond_id": r["fond_id"],
        "inventory_id": r["inventory_id"],
        "title_ru": r["title_ru"] or "",
        "title_kk": r["title_kk"] or "",
        "title_en": r["title_en"] or "",
        "years_from": r["years_from"],
        "years_to": r["years_to"],
        "doc_type": r["doc_type"] or "",
        "place": r["place"] or "",
        "theme": r["theme"] or "",
        "author": r["author"] or "",
        "extent": r["extent"] or "",
        "branch": r["branch_name"] or "",
        "has_public_file": bool(r["has_public_file"]),
        "is_demo": bool(r["is_demo"]),
    }


def _csv_row(r: dict[str, Any]) -> list[Any]:
    """Строка CSV: текст экранируется от формул, булевы - true/false."""
    return [
        _csv_safe(r["id"]),
        _csv_safe(r["level"]),
        _csv_safe(r["code"]),
        _csv_safe(r["fond_id"]),
        _csv_safe(r["inventory_id"]),
        _csv_safe(r["title_ru"] or ""),
        _csv_safe(r["title_kk"] or ""),
        _csv_safe(r["title_en"] or ""),
        _csv_safe(r["years_from"]),
        _csv_safe(r["years_to"]),
        _csv_safe(r["doc_type"] or ""),
        _csv_safe(r["place"] or ""),
        _csv_safe(r["theme"] or ""),
        _csv_safe(r["author"] or ""),
        _csv_safe(r["extent"] or ""),
        _csv_safe(r["branch_name"] or ""),
        "true" if r["has_public_file"] else "false",
        "true" if r["is_demo"] else "false",
    ]


@router.get("/catalog.json")
def catalog_json(db: DbDep = None) -> list[dict[str, Any]]:
    return [_record(r) for r in _published_rows(db)]


@router.get("/catalog.csv")
def catalog_csv(db: DbDep = None) -> Response:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(_CSV_HEADERS)
    for r in _published_rows(db):
        writer.writerow(_csv_row(r))
    # BOM в начале, чтобы Excel/LibreOffice сами определили UTF-8
    content = "\ufeff" + output.getvalue()
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=catalog.csv"},
    )
