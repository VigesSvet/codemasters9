"""Журнал операций (audit_log): запись действий с вырезанием секретов из details."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any

SENSITIVE_KEYS = ("password", "token", "secret")


def _redact(value: Any) -> Any:
    """Рекурсивно вырезать чувствительные ключи из деталей."""
    if isinstance(value, dict):
        out: dict[str, Any] = {}
        for k, v in value.items():
            if any(s in str(k).lower() for s in SENSITIVE_KEYS):
                out[str(k)] = "[redacted]"
            else:
                out[str(k)] = _redact(v)
        return out
    if isinstance(value, (list, tuple)):
        return [_redact(v) for v in value]
    return value


def _identity(user: Any) -> tuple[int | None, str | None]:
    if user is None:
        return None, None
    if isinstance(user, dict):
        return user.get("id"), user.get("username")
    return getattr(user, "id", None), getattr(user, "username", None)


def log(db, user, action, object_type, object_id, result="ok", details=None, ip=None) -> None:
    """Записать строку в audit_log, вырезав секреты из details."""
    user_id, username = _identity(user)
    details_json = json.dumps(_redact(details), ensure_ascii=False) if details is not None else None
    ts = datetime.now(UTC).isoformat()
    db.execute(
        "INSERT INTO audit_log"
        " (ts, user_id, username, ip, action, object_type, object_id, result, details_json)"
        " VALUES (?,?,?,?,?,?,?,?,?)",
        (ts, user_id, username, ip, action, object_type, object_id, result, details_json),
    )
    db.commit()
