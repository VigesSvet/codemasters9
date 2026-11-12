"""Матрица прав доступа (проверяется на сервере в каждом хендлере)."""

from __future__ import annotations

ROLES = ("admin", "moderator", "editor", "branch_admin")

_EDITABLE_STATUSES = ("draft", "review", "needs_work")


def _get(obj, key):
    if obj is None:
        return None
    if isinstance(obj, dict):
        return obj.get(key)
    try:
        return obj[key]  # sqlite3.Row / Mapping
    except (TypeError, KeyError, IndexError):
        return getattr(obj, key, None)


def can(user, action: str, obj=None) -> bool:
    """Проверить право пользователя на действие. admin — всё."""
    if not user or not user.get("role"):
        return False
    role = user.get("role")
    if role == "admin":
        return True

    if action in ("unit.create", "unit.submit"):
        return role in ("moderator", "editor")
    if action == "unit.edit":
        if role == "editor":
            return _get(obj, "pub_status") in _EDITABLE_STATUSES
        return role == "moderator"
    if action in ("unit.review", "unit.publish", "unit.archive"):
        return role == "moderator"
    if action == "unit.delete":
        return False
    if action == "file.upload":
        return role in ("moderator", "editor")
    if action == "file.set_access":
        return role == "moderator"
    if action == "branch.edit":
        if role == "branch_admin":
            return _get(obj, "id") == user.get("branch_id")
        return False
    if action in ("import", "import.preview", "import.apply"):
        return role == "editor"
    if action == "audit.read":
        return role == "moderator"
    if action == "users.manage":
        return False
    return False
