"""Публичные эндпоинты филиалов. Заглушки этапа 0."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("")
def list_branches():
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/{slug}")
def get_branch(slug: str):
    raise HTTPException(status_code=501, detail="not implemented")
