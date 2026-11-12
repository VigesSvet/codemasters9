"""Импорт CSV/XLSX с предпросмотром. Заглушки этапа 0."""

from __future__ import annotations


def preview(db, user, filename: str, content: bytes, mapping: dict | None = None) -> dict:
    """Предпросмотр импорта. Заглушка."""
    raise NotImplementedError


def apply(db, user, job_id: str, mapping: dict) -> dict:
    """Применить импорт. Заглушка."""
    raise NotImplementedError
