"""Публичные эндпоинты новостей."""

from __future__ import annotations

import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..models import NewsItem

router = APIRouter(prefix="/api/news", tags=["news"])

DbDep = Annotated[sqlite3.Connection, Depends(get_db)]


@router.get("")
def list_news(
    lang: str = "ru",
    q: str | None = None,
    year: str | None = None,
    page: int = 1,
    per_page: int = 12,
    db: DbDep = None,
):
    # базовые условия (опубликованные + поиск) - без фильтра по году
    base_where = ["pub_status = 'published'"]
    base_args: list = []
    if q:
        base_where.append("(title_ru LIKE ? OR title_kk LIKE ? OR lead_ru LIKE ? OR lead_kk LIKE ?)")
        like = f"%{q}%"
        base_args.extend([like, like, like, like])

    # счётчики по годам (по всей базе, с учётом поиска, но без фильтра по году)
    years_rows = db.execute(
        f"SELECT substr(date, 1, 4) AS y, COUNT(*) AS n FROM news "
        f"WHERE {' AND '.join(base_where)} GROUP BY y ORDER BY y DESC",
        base_args,
    ).fetchall()
    years = [{"year": r["y"], "count": r["n"]} for r in years_rows if r["y"]]

    where = list(base_where)
    args = list(base_args)
    if year:
        where.append("substr(date, 1, 4) = ?")
        args.append(str(year))

    where_sql = " AND ".join(where)
    total = db.execute(f"SELECT COUNT(*) AS n FROM news WHERE {where_sql}", args).fetchone()["n"]

    page = max(1, page)
    per_page = max(1, min(per_page, 50))
    rows = db.execute(
        "SELECT id, date, title_ru, title_kk, lead_ru, lead_kk, image, pub_status "
        f"FROM news WHERE {where_sql} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?",
        args + [per_page, (page - 1) * per_page],
    ).fetchall()

    items = [
        {
            "id": r["id"],
            "date": r["date"] or "",
            "title_ru": r["title_ru"] or "",
            "title_kk": r["title_kk"] or "",
            "lead_ru": r["lead_ru"] or "",
            "lead_kk": r["lead_kk"] or "",
            "html_ru": "",
            "html_kk": "",
            "image": r["image"] or "",
            "pub_status": r["pub_status"] or "published",
        }
        for r in rows
    ]
    return {"total": total, "page": page, "per_page": per_page, "years": years, "items": items}


@router.get("/{news_id}", response_model=NewsItem)
def get_news(news_id: int, db: DbDep):
    row = db.execute(
        "SELECT id, date, title_ru, title_kk, lead_ru, lead_kk, html_ru, html_kk, image, pub_status "
        "FROM news WHERE id = ? AND pub_status = 'published'",
        (news_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="not found")
    return dict(row)
