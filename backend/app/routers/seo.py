"""SEO-эндпоинты без префикса /api."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response

from ..db import get_db

router = APIRouter(tags=["seo"])

DbDep = Annotated[sqlite3.Connection, Depends(get_db)]

_EXCLUDED_PAGES = {"404.html", "nedostupno.html"}


def _static_pages(web_dir: str) -> list[str]:
    base = Path(web_dir)
    if not base.is_dir():
        return []
    return sorted(p.name for p in base.glob("*.html") if p.name not in _EXCLUDED_PAGES)


@router.get("/sitemap.xml")
def sitemap(request: Request, db: DbDep):
    settings = request.app.state.settings
    base = str(request.base_url).rstrip("/")
    pages = _static_pages(settings.web_dir)

    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for name in pages:
        loc = f"{base}/{name}"
        lines.append(f"  <url><loc>{_esc(loc)}</loc></url>")
    unit_ids = db.execute("SELECT id FROM units WHERE pub_status = 'published' ORDER BY id").fetchall()
    for u in unit_ids:
        loc = f"{base}/delo.html?id={u['id']}"
        lines.append(f"  <url><loc>{_esc(loc)}</loc></url>")
    lines.append("</urlset>")
    return Response(content="\n".join(lines) + "\n", media_type="application/xml")


@router.get("/robots.txt")
def robots(request: Request):
    base = str(request.base_url).rstrip("/")
    lines = [
        "User-agent: *",
        "Disallow: /admin/",
        "Disallow: /api/admin/",
        f"Sitemap: {base}/sitemap.xml",
    ]
    return Response(content="\n".join(lines) + "\n", media_type="text/plain")


def _esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
