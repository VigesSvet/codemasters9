"""ИИ-аналитика по журналам сайта (ТЗ 5.8 Д)."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request

from .. import audit, permissions, security
from ..db import get_db, rows

router = APIRouter(prefix="/api/admin", tags=["analytics"])

TOP_N = 10


def recommendations(empty: list[dict]) -> list[str]:
    return [
        f"Запрос «{r['query']}» искали {r['n']} раз без результата: добавьте синоним или описание."
        for r in empty[:5]
    ]


def template_summary(total: int, empty_total: int, ai: dict) -> str:
    ai_total = sum(ai.values())
    share = round(100 * empty_total / total) if total else 0
    return (
        f"Поисковых запросов: {total}, без результатов: {empty_total} ({share}%). "
        f"Обращений к помощнику: {ai_total} "
        f"(по источникам: {ai.get('source', 0)}, нет данных: {ai.get('no_data', 0)}, "
        f"ограничено: {ai.get('restricted', 0)})."
    )


@router.get("/analytics")
def get_analytics(
    request: Request,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
    days: int = 30,
):
    if not permissions.can(user, "analytics.read"):
        audit.log(db, user, "analytics.read", "analytics", "", result="denied")
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    days = max(1, min(days, 365))
    since = f"-{days} days"
    top = rows(
        db.execute(
            "SELECT query, COUNT(*) AS n FROM search_log WHERE ts >= datetime('now', ?)"
            " GROUP BY query ORDER BY n DESC, query LIMIT ?",
            (since, TOP_N),
        )
    )
    empty = rows(
        db.execute(
            "SELECT query, COUNT(*) AS n FROM search_log WHERE results = 0 AND ts >= datetime('now', ?)"
            " GROUP BY query ORDER BY n DESC, query LIMIT ?",
            (since, TOP_N),
        )
    )
    total, empty_total = db.execute(
        "SELECT COUNT(*), COALESCE(SUM(results = 0), 0) FROM search_log WHERE ts >= datetime('now', ?)",
        (since,),
    ).fetchone()
    ai = {
        r["mode"]: r["n"]
        for r in rows(
            db.execute(
                "SELECT mode, COUNT(*) AS n FROM ai_log WHERE ts >= datetime('now', ?) GROUP BY mode",
                (since,),
            )
        )
    }
    audit.log(db, user, "analytics.read", "analytics", "", ip=request.client.host if request.client else None)
    return {
        "days": days,
        "searches_total": total,
        "searches_empty": empty_total,
        "top_queries": top,
        "empty_queries": empty,
        "assistant": {"source": 0, "no_data": 0, "restricted": 0, **ai},
        "recommendations": recommendations(empty),
        "summary": template_summary(total, empty_total, ai),
        "summary_provider": "local-template",
    }
