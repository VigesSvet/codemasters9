"""Точка входа FastAPI: create_app() собирает роутеры, безопасность и статику."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import db as dbmod
from .config import Settings, get_settings
from .routers import admin, ai, auth, branches, catalog, imports, news, seo
from .security import install_security
from .static import install_static


@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = dbmod.connect(app.state.settings.db_path)
    try:
        dbmod.init_schema(conn)
    finally:
        conn.close()
    yield


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    # /docs, /redoc, /openapi.json - только при API_DOCS=true(SEC-11), иначе 404
    docs = settings.api_docs
    app = FastAPI(
        title="Госархив ВКО API",
        lifespan=lifespan,
        docs_url="/docs" if docs else None,
        redoc_url="/redoc" if docs else None,
        openapi_url="/openapi.json" if docs else None,
    )
    app.state.settings = settings

    app.include_router(catalog.router)
    app.include_router(catalog.files_router)
    app.include_router(branches.router)
    app.include_router(news.router)
    app.include_router(auth.router)
    app.include_router(admin.router)
    app.include_router(imports.router)
    app.include_router(ai.router)
    app.include_router(seo.router)

    @app.get("/api/health")
    def health() -> dict:
        conn = dbmod.connect(app.state.settings.db_path)
        try:
            fts5 = dbmod.fts5_available(conn)
            cur = conn.execute("SELECT COUNT(*) AS n FROM units")
            units = cur.fetchone()["n"]
        finally:
            conn.close()
        return {"status": "ok", "fts5": fts5, "units": units}

    install_security(app)
    install_static(app)
    return app


app = create_app()
