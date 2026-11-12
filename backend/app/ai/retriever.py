"""Ретривер для локального ИИ. Заглушка этапа 0."""

from __future__ import annotations


def search(db, q: str, lang: str, k: int = 5) -> list[dict]:
    """Поиск релевантных фрагментов по catalog_fts + news + branches. Заглушка."""
    raise NotImplementedError
