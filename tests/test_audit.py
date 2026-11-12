"""Тест: в журнале не сохраняется пароль."""

from __future__ import annotations

H = {"X-Requested-With": "gos"}


def test_no_password_in_audit_log(client, login, db):
    login("admin")
    assert (
        client.post(
            "/api/admin/units",
            json={"code": "A-1", "title_ru": "тест", "level": "delo", "fond_id": 1, "years_from": 1900},
            headers=H,
        ).status_code
        == 200
    )
    client.post("/api/auth/login", json={"username": "admin", "password": "SECRET-PW-123"}, headers=H)
    rows = db.execute("SELECT * FROM audit_log").fetchall()
    blob = " ".join(str(dict(r)) for r in rows)
    assert "SECRET-PW-123" not in blob
    assert "Demo-2026!" not in blob
