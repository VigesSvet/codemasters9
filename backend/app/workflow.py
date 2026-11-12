"""Переходы статусов публикации с проверкой TRANSITIONS и прав."""

from __future__ import annotations

import json

from fastapi import HTTPException

from . import audit, permissions
from .search import reindex_unit
from .security import now

TRANSITIONS = {
    "draft": ["review"],
    "review": ["approved", "needs_work"],
    "needs_work": ["review"],
    "approved": ["published", "needs_work"],
    "published": ["archived"],
    "archived": ["draft"],
}

# Действие, требуемое для целевого статуса (для проверки прав).
_ACTION_FOR = {
    "review": "unit.submit",
    "approved": "unit.review",
    "needs_work": "unit.review",
    "published": "unit.publish",
    "archived": "unit.archive",
    "draft": "unit.archive",  # восстановление из архива — те же права
}


def _reviewer_for(to: str) -> bool:
    """Пометка reviewer_id ставится на решениях ревью/публикации, не на отправке."""
    return to in ("approved", "needs_work", "published", "archived")


def transition(db, user, unit_id: int, to: str, comment: str = "") -> dict:
    """Сменить статус единицы: проверка TRANSITIONS (409), прав (403), версии, audit."""
    row = db.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Единица не найдена")

    current = row["pub_status"]
    if to not in TRANSITIONS.get(current, []):
        audit.log(
            db,
            user,
            "unit.transition",
            "unit",
            str(unit_id),
            result="denied",
            details={"from": current, "to": to, "reason": "invalid_transition"},
        )
        raise HTTPException(status_code=409, detail=f"Недопустимый переход {current} -> {to}")

    action = _ACTION_FOR.get(to, "unit.review")
    if not permissions.can(user, action, row):
        audit.log(
            db,
            user,
            "unit.transition",
            "unit",
            str(unit_id),
            result="denied",
            details={"from": current, "to": to, "required": action},
        )
        raise HTTPException(status_code=403, detail="Недостаточно прав для перехода")

    new_version = row["version"] + 1
    ts = now()
    reviewer_id = user["id"] if _reviewer_for(to) else None

    db.execute(
        "INSERT INTO unit_versions"
        " (unit_id, version, data_json, author_id, reviewer_id, pub_status, comment, created_at)"
        " VALUES (?,?,?,?,?,?,?,?)",
        (
            unit_id,
            new_version,
            json.dumps(dict(row), ensure_ascii=False, default=str),
            user["id"],
            reviewer_id,
            to,
            comment,
            ts.isoformat(),
        ),
    )
    db.execute(
        "UPDATE units SET pub_status = ?, version = ?, status_changed_at = ?, status_changed_by = ?,"
        " updated_at = ? WHERE id = ?",
        (to, new_version, ts.isoformat(), user["id"], ts.isoformat(), unit_id),
    )
    db.commit()

    try:
        reindex_unit(db, unit_id)
    except NotImplementedError:
        pass

    audit.log(
        db,
        user,
        "unit.transition",
        "unit",
        str(unit_id),
        result="ok",
        details={"from": current, "to": to, "comment": comment},
    )

    return {
        "id": unit_id,
        "pub_status": to,
        "version": new_version,
        "status_changed_at": ts.isoformat(),
    }
