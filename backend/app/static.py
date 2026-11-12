"""Раздача статики web/ на "/" (после /api) + кастомная 404. Рабочий (этап 0)."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


def install_static(app: FastAPI) -> None:
    """Монтировать WEB_DIR на "/" последним и отдавать web/404.html для не-/api путей."""
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

    app.mount("/", StaticFiles(directory=str(web_dir), html=True), name="static")
