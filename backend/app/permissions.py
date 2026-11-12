"""Матрица прав доступа. Реализация — в T2, здесь заглушка + полная матрица."""

from __future__ import annotations

ROLES = ("admin", "moderator", "editor", "branch_admin")


def can(user, action, obj=None) -> bool:
    """
    Проверить право пользователя на действие (проверяется на сервере в каждом хендлере).

    Полная матрица (docs/plan/2026-11-12-tehnichka.md §1):

    | action | admin | moderator | editor | branch_admin |
    |---|---|---|---|---|
    | unit.create / unit.edit (draft/review/needs_work) | v | v | v | - |
    | unit.edit published | v | v | - | - |
    | unit.submit (draft/needs_work -> review) | v | v | v | - |
    | unit.review / unit.publish / unit.archive | v | v | - | - |
    | unit.delete | v | - | - | - |
    | file.upload | v | v | v | - |
    | file.set_access | v | v | - | - |
    | branch.edit | v (все) | - | - | только obj.id == user.branch_id |
    | import.preview / import.apply | v | - | v | - |
    | audit.read | v | v | - | - |
    | users.manage | v | - | - | - |

    Заглушка этапа 0: разрешено только admin.
    """
    return user is not None and user.get("role") == "admin"
