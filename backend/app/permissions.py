"""Матрица прав доступа (проверяется на сервере в каждом хендлере)."""

from __future__ import annotations

ROLES = ("superadmin", "admin", "moderator", "editor", "branch_admin", "staff", "analyst")

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


PERMISSIONS = (
    "unit.create",
    "unit.submit",
    "unit.edit",
    "unit.review",
    "unit.publish",
    "unit.archive",
    "unit.delete",
    "file.upload",
    "file.set_access",
    "branch.edit",
    "branch.create",
    "import",
    "import.preview",
    "import.apply",
    "audit.read",
    "stats.read",
    "admin.read",
    "users.manage",
    "roles.manage",
)

_DEFAULTS = {
    "moderator": (
        "unit.create unit.submit unit.edit unit.review unit.publish unit.archive "
        "file.upload file.set_access audit.read stats.read admin.read"
    ).split(),
    "editor": (
        "unit.create unit.submit unit.edit file.upload import import.preview import.apply admin.read"
    ).split(),
    "branch_admin": ["branch.edit"],
    "staff": ["admin.read"],
    "analyst": ["audit.read", "stats.read"],
}


def default_matrix() -> dict[str, set[str]]:
    """Права по умолчанию: admin - всё, кроме roles.manage; superadmin - всё."""
    m = {r: set(v) for r, v in _DEFAULTS.items()}
    m["admin"] = set(PERMISSIONS) - {"roles.manage"}
    m["superadmin"] = set(PERMISSIONS)
    return m


_cache: dict[str, set[str]] | None = None


def seed_defaults(db) -> None:
    """Заполнить role_permissions значениями по умолчанию для ролей без записей."""
    have = {r[0] for r in db.execute("SELECT DISTINCT role FROM role_permissions")}
    for role, perms in default_matrix().items():
        if role in have:
            continue
        db.executemany(
            "INSERT OR IGNORE INTO role_permissions (role, permission) VALUES (?,?)",
            [(role, p) for p in sorted(perms)],
        )
    db.commit()


def reload(db=None) -> None:
    """Перечитать матрицу из БД в кэш (db=None - сбросить на карту по умолчанию)."""
    global _cache
    if db is None:
        _cache = None
        return
    m: dict[str, set[str]] = {r: set() for r in ROLES}
    for row in db.execute("SELECT role, permission FROM role_permissions"):
        m.setdefault(row[0], set()).add(row[1])
    _cache = m


def matrix() -> dict[str, set[str]]:
    return _cache if _cache is not None else default_matrix()


def can(user, action: str, obj=None) -> bool:
    """Проверить право пользователя на действие (таблица role_permissions, фолбэк - карта)."""
    if not user or not user.get("role"):
        return False
    role = user.get("role")
    if role == "superadmin" and action == "roles.manage":
        return True
    if action not in matrix().get(role, ()):
        return False
    if action == "unit.edit" and role == "editor":
        return _get(obj, "pub_status") in _EDITABLE_STATUSES
    if action == "branch.edit" and role == "branch_admin":
        return _get(obj, "id") == user.get("branch_id")
    return True
