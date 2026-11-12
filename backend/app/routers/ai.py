"""Эндпоинт ИИ-помощника: валидация вопроса, выбор провайдера, фолбэк."""

from __future__ import annotations

import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request

from .. import db as dbmod
from ..ai import local, providers, retriever
from ..models import AiRequest, AiResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])

MAX_QUESTION = 500


@router.post("/ask", response_model=AiResponse)
def ask(body: AiRequest, request: Request, db: Annotated[sqlite3.Connection, Depends(dbmod.get_db)]):
    question = (body.question or "").strip()
    if not question:
        raise HTTPException(status_code=422, detail="question не может быть пустым")
    if len(question) > MAX_QUESTION:
        raise HTTPException(status_code=422, detail="question слишком длинный (максимум 500 символов)")
    lang = body.lang if body.lang in ("ru", "kk", "en") else "ru"

    settings = request.app.state.settings
    provider = providers.get_provider(settings)
    if provider is None:
        raise HTTPException(
            status_code=503,
            detail="ИИ-провайдер настроен как anthropic, но ключ ANTHROPIC_API_KEY не задан. "
            "Укажите ключ или переключите AI_PROVIDER=local.",
        )

    hits = retriever.search(db, question, lang)
    try:
        result = provider.answer(question, hits, lang)
    except Exception:
        # ошибка внешнего провайдера -> фолбэк на локальный шаблон
        result = local.compose(question, hits, lang)
        result["provider"] = "local-demo"
        result["answer"] = (
            result["answer"] + "\n\n(Внешний ИИ-провайдер недоступен, ответ сформирован локально.)"
        )
    return result
