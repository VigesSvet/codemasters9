"""Публичные эндпоинты новостей. Заглушки этапа 0."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("")
def list_news(lang: str = "ru", q: str | None = None, page: int = 1, per_page: int = 12):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/{news_id}")
def get_news(news_id: int):
    raise HTTPException(status_code=501, detail="not implemented")
