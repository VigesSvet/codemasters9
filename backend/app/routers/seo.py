"""SEO-эндпоинты без префикса /api. Заглушки этапа 0."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["seo"])


@router.get("/sitemap.xml")
def sitemap():
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/robots.txt")
def robots():
    raise HTTPException(status_code=501, detail="not implemented")
