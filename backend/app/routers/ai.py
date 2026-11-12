"""Эндпоинты ИИ-помощника. Заглушка этапа 0."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..models import AiRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/ask")
def ask(body: AiRequest):
    raise HTTPException(status_code=501, detail="not implemented")
