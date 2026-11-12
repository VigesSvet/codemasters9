"""Переходы статусов публикации. Заглушка этапа 0."""

from __future__ import annotations

TRANSITIONS = {
    "draft": ["review"],
    "review": ["approved", "needs_work"],
    "needs_work": ["review"],
    "approved": ["published", "needs_work"],
    "published": ["archived"],
    "archived": ["draft"],
}


def transition(db, user, unit_id: int, to: str, comment: str = "") -> dict:
    """Сменить статус единицы с проверкой TRANSITIONS и прав. Заглушка."""
    raise NotImplementedError
