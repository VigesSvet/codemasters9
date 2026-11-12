"""Полнотекстовый поиск и переиндексация catalog_fts. Заглушки этапа 0."""

from __future__ import annotations


def search_units(db, params: dict) -> dict:
    """Поиск по опубликованным единицам (catalog_fts + units). Заглушка."""
    return {
        "total": 0,
        "page": int(params.get("page", 1) or 1),
        "per_page": int(params.get("per_page", 10) or 10),
        "items": [],
        "facets": {"type": {}, "branch": {}, "level": {}},
        "query_variants": [],
    }


def reindex_unit(db, unit_id: int) -> None:
    """Переиндексировать одну единицу в catalog_fts. Заглушка."""
    raise NotImplementedError


def reindex_all(db) -> None:
    """Полная переиндексация catalog_fts. Заглушка."""
    raise NotImplementedError
