"""Публичные эндпоинты каталога и скачивания файлов. Заглушки этапа 0."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/catalog", tags=["catalog"])
files_router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/search")
def search(
    q: str | None = None,
    level: str | None = None,
    fond: str | None = None,
    opis: str | None = None,
    delo: str | None = None,
    period: str | None = None,
    year_from: int | None = None,
    year_to: int | None = None,
    type: str | None = None,
    branch: str | None = None,
    place: str | None = None,
    theme: str | None = None,
    author: str | None = None,
    keywords: str | None = None,
    lang: str = "ru",
    digitized: bool | None = None,
    open: bool | None = None,
    sort: str = "rel",
    page: int = 1,
    per_page: int = 10,
):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/units/{unit_id}")
def get_unit(unit_id: int):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/fonds/{fond_id}")
def get_fond(fond_id: int):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/fonds/{fond_id}/inventories")
def get_fond_inventories(fond_id: int):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/fonds")
def list_fonds(kind: str | None = None, q: str | None = None, page: int = 1, per_page: int = 10):
    raise HTTPException(status_code=501, detail="not implemented")


@files_router.get("/{file_id}/download")
def download_file(file_id: int):
    raise HTTPException(status_code=501, detail="not implemented")
