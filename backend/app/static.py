"""Раздача статики web/ на "/" (после /api) + кастомная 404, GZip, Cache-Control."""

from __future__ import annotations

import mimetypes
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.gzip import GZipMiddleware

# MIME для woff2/webp (подстраховка, если в системе нет)
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("image/webp", ".webp")


def install_static(app: FastAPI) -> None:
    """Монтировать WEB_DIR на "/" последним: GZip, Cache-Control, 404.html."""
    settings = app.state.settings
    web_dir = Path(settings.web_dir)

    @app.middleware("http")
    async def _not_found_html(request: Request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and not request.url.path.startswith("/api"):
            not_found = web_dir / "404.html"
            if not_found.exists():
                return FileResponse(str(not_found), status_code=404)
        return response

    @app.middleware("http")
    async def _cache_control(request: Request, call_next):
        response = await call_next(request)
        path = request.url.path
        # /api без заголовка (no-store для admin ставит T2); не перетираем уже выставленное
        if path.startswith("/api") or "cache-control" in response.headers:
            return response
        if response.status_code >= 400 or path.endswith(".html") or path.endswith("/"):
            response.headers["Cache-Control"] = "no-cache"
        else:
            response.headers["Cache-Control"] = "public, max-age=604800"
        return response

    app.add_middleware(GZipMiddleware, minimum_size=1024)

    app.mount("/", StaticFiles(directory=str(web_dir), html=True), name="static")
