"""Полнотекстовый поиск и переиндексация catalog_fts."""

from __future__ import annotations

import re
import sqlite3
from typing import Any

from .db import fts5_available
from .textnorm import expand_query, norm


def _normalized_variants(q: Any) -> list[str]:
    """Синонимичные варианты запроса (нормализованные). Пустой запрос — пусто."""
    if not q or not str(q).strip():
        return []
    return expand_query(str(q))


def _fts_expr(q: Any) -> str | None:
    """FTS5-выражение: варианты через OR, внутри варианта токены через AND с префиксом."""
    parts: list[str] = []
    for variant in _normalized_variants(q):
        tokens = [t for t in re.split(r"\s+", variant) if t]
        if tokens:
            parts.append(" AND ".join(f"{t}*" for t in tokens))
    if not parts:
        return None
    return " OR ".join(f"({p})" for p in parts)


def _as_int(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _period_bounds(period: Any) -> tuple[int | None, int | None]:
    """Годы из свободной строки period (для пересечения интервалов)."""
    if not period:
        return None, None
    years = [int(m) for m in re.findall(r"\d{4}", str(period))]
    if not years:
        return None, None
    return min(years), max(years)


def unit_card(row: sqlite3.Row | dict) -> dict:
    """Собрать UnitCard из строки выборки (units + branches + has_public_file)."""

    def get(key: str) -> Any:
        return row[key]

    years = [y for y in (get("years_from"), get("years_to")) if y is not None]
    return {
        "id": get("id"),
        "level": get("level"),
        "code": get("code"),
        "fond_id": get("fond_id"),
        "inventory_id": get("inventory_id"),
        "title": {"ru": get("title_ru") or "", "kk": get("title_kk") or "", "en": get("title_en") or ""},
        "years": years,
        "doc_type": get("doc_type") or "",
        "place": get("place") or "",
        "theme": get("theme") or "",
        "author": get("author") or "",
        "extent": get("extent") or "",
        "branch": {
            "id": get("branch_id"),
            "slug": get("branch_slug") or "",
            "name": get("branch_name") or "",
        },
        "has_public_file": bool(get("has_public_file")),
        "access_note": get("access_note") or "",
        "is_demo": bool(get("is_demo")),
        "url": f"/delo.html?id={get('id')}",
    }


_PUBLIC_FILE_SQL = "EXISTS (SELECT 1 FROM files f WHERE f.unit_id = units.id AND f.access = 'public')"

_FROM_SQL = (
    "FROM units "
    "LEFT JOIN branches ON branches.id = units.branch_id "
    "LEFT JOIN fonds ON fonds.id = units.fond_id "
    "LEFT JOIN inventories ON inventories.id = units.inventory_id "
)

_FTS_FROM_SQL = (
    "FROM units "
    "JOIN catalog_fts ON catalog_fts.unit_id = units.id AND catalog_fts MATCH ? "
    "LEFT JOIN branches ON branches.id = units.branch_id "
    "LEFT JOIN fonds ON fonds.id = units.fond_id "
    "LEFT JOIN inventories ON inventories.id = units.inventory_id "
)

_COLS_SQL = (
    "units.id, units.level, units.code, units.fond_id, units.inventory_id, "
    "units.title_ru, units.title_kk, units.title_en, "
    "units.years_from, units.years_to, units.doc_type, units.place, units.theme, "
    "units.author, units.extent, units.access_note, units.is_demo, "
    "branches.id AS branch_id, branches.slug AS branch_slug, branches.name_ru AS branch_name, "
    f"{_PUBLIC_FILE_SQL} AS has_public_file"
)

_LIKE_SQL = (
    "(units.title_ru LIKE ? OR units.title_kk LIKE ? OR units.title_en LIKE ? "
    "OR units.code LIKE ? OR units.keywords LIKE ? OR units.author LIKE ? OR units.place LIKE ?)"
)


def _filters(params: dict) -> tuple[list[str], list[Any]]:
    """Только фильтры (без FTS/запроса). Возвращает (where, args)."""
    where = ["units.pub_status = 'published'"]
    args: list[Any] = []

    level = params.get("level")
    if level:
        where.append("units.level = ?")
        args.append(level)

    fond = params.get("fond")
    if fond:
        where.append("(fonds.code = ? OR CAST(fonds.id AS TEXT) = ?)")
        args.extend([str(fond), str(fond)])

    opis = params.get("opis")
    if opis:
        where.append("inventories.number = ?")
        args.append(str(opis))

    delo = params.get("delo")
    if delo:
        where.append("units.number = ?")
        args.append(str(delo))

    doc_type = params.get("type")
    if doc_type:
        where.append("units.doc_type = ?")
        args.append(doc_type)

    branch = params.get("branch")
    if branch:
        where.append("branches.slug = ?")
        args.append(str(branch))

    lang = params.get("lang")
    if lang:
        where.append("units.lang = ?")
        args.append(lang)

    for key, column in (
        ("place", "units.place"),
        ("theme", "units.theme"),
        ("author", "units.author"),
        ("keywords", "units.keywords"),
    ):
        value = params.get(key)
        if value:
            where.append(f"{column} LIKE ?")
            args.append(f"%{value}%")

    year_from = _as_int(params.get("year_from"))
    year_to = _as_int(params.get("year_to"))
    period_from, period_to = _period_bounds(params.get("period"))
    if year_from is None:
        year_from = period_from
    if year_to is None:
        year_to = period_to
    if year_from is not None:
        where.append("(units.years_to IS NULL OR units.years_to >= ?)")
        args.append(year_from)
    if year_to is not None:
        where.append("(units.years_from IS NULL OR units.years_from <= ?)")
        args.append(year_to)

    for key in ("digitized", "open"):
        value = params.get(key)
        if value is None:
            continue
        if value:
            where.append(_PUBLIC_FILE_SQL)
        else:
            where.append(f"NOT {_PUBLIC_FILE_SQL}")

    return where, args


def search_units(db: sqlite3.Connection, params: dict) -> dict:
    """Поиск по опубликованным единицам (FTS5, фолбэк — LIKE)."""
    q = params.get("q")
    variants = _normalized_variants(q)
    fts_expr = _fts_expr(q)

    where, args = _filters(params)

    use_fts = fts_expr is not None and fts5_available(db)
    if use_fts:
        from_sql = _FTS_FROM_SQL
        leading: list[Any] = [fts_expr]
    else:
        from_sql = _FROM_SQL
        leading = []
        if variants:
            like_parts = []
            for v in variants:
                like_parts.append(_LIKE_SQL)
                args.extend([f"%{v}%"] * 7)
            where.append("(" + " OR ".join(like_parts) + ")")

    where_sql = " AND ".join(where)
    all_args = leading + args

    page = max(1, _as_int(params.get("page")) or 1)
    per_page = _as_int(params.get("per_page")) or 10
    per_page = max(1, min(per_page, 50))

    total = db.execute(f"SELECT COUNT(*) AS n {from_sql} WHERE {where_sql}", all_args).fetchone()["n"]

    sort = params.get("sort") or "rel"
    order_map = {
        "rel": ("bm25(catalog_fts), units.code" if use_fts else "units.code"),
        "d1": "units.years_from DESC, units.code",
        "d2": "units.years_from ASC, units.code",
        "code": "units.code",
    }
    order_expr = order_map.get(sort, "units.code")

    rows = db.execute(
        f"SELECT {_COLS_SQL} {from_sql} WHERE {where_sql} ORDER BY {order_expr} LIMIT ? OFFSET ?",
        all_args + [per_page, (page - 1) * per_page],
    ).fetchall()

    facets = {"type": {}, "branch": {}, "level": {}}
    for key, column in (("type", "units.doc_type"), ("branch", "branches.slug"), ("level", "units.level")):
        facet_rows = db.execute(
            f"SELECT {column} AS k, COUNT(*) AS n {from_sql} WHERE {where_sql} GROUP BY {column}",
            all_args,
        ).fetchall()
        facets[key] = {r["k"]: r["n"] for r in facet_rows if r["k"]}

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": [unit_card(r) for r in rows],
        "facets": facets,
        "query_variants": variants,
    }


def _insert_fts(db: sqlite3.Connection, row: sqlite3.Row | dict) -> None:
    """Вставить одну строку в catalog_fts (нормализованный текст)."""

    def get(key: str) -> Any:
        return row[key]

    title = " ".join(filter(None, (get("title_ru"), get("title_kk"), get("title_en"))))
    db.execute(
        "INSERT INTO catalog_fts (unit_id, title, code, keywords, author, place) VALUES (?,?,?,?,?,?)",
        (
            get("id"),
            norm(title),
            norm(get("code")),
            norm(get("keywords")),
            norm(get("author")),
            norm(get("place")),
        ),
    )


def reindex_unit(db: sqlite3.Connection, unit_id: int) -> None:
    """Переиндексировать одну единицу: вставлять только published."""
    if not fts5_available(db):
        return
    db.execute("DELETE FROM catalog_fts WHERE unit_id = ?", (unit_id,))
    row = db.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
    if row is not None and row["pub_status"] == "published":
        _insert_fts(db, row)
    db.commit()


def reindex_all(db: sqlite3.Connection) -> None:
    """Полная переиндексация catalog_fts (только published)."""
    if not fts5_available(db):
        return
    db.execute("DELETE FROM catalog_fts")
    rows = db.execute("SELECT * FROM units WHERE pub_status = 'published'").fetchall()
    for row in rows:
        _insert_fts(db, row)
    db.commit()
