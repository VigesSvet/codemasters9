"""Тесты матрицы прав через API."""

from __future__ import annotations

H = {"X-Requested-With": "gos"}


def _unit_id(db, code):
    return db.execute("SELECT id FROM units WHERE code = ?", (code,)).fetchone()["id"]


def test_editor_cannot_publish(client, login, db):
    unit_id = _unit_id(db, "T-004")
    login("moderator")
    client.post(f"/api/admin/units/{unit_id}/transition", json={"to": "review"}, headers=H)
    client.post(f"/api/admin/units/{unit_id}/transition", json={"to": "approved"}, headers=H)
    login("editor")
    r = client.post(f"/api/admin/units/{unit_id}/transition", json={"to": "published"}, headers=H)
    assert r.status_code == 403
    denied = db.execute("SELECT COUNT(*) AS n FROM audit_log WHERE result = 'denied'").fetchone()["n"]
    assert denied >= 1


def test_moderator_can_publish(client, login, db):
    unit_id = _unit_id(db, "T-004")
    login("moderator")
    for to in ("review", "approved", "published"):
        assert (
            client.post(f"/api/admin/units/{unit_id}/transition", json={"to": to}, headers=H).status_code
            == 200
        )
    status = db.execute("SELECT pub_status FROM units WHERE id = ?", (unit_id,)).fetchone()["pub_status"]
    assert status == "published"


def test_editor_can_edit_draft(client, login, db):
    unit_id = _unit_id(db, "T-004")  # draft
    login("editor")
    r = client.put(
        f"/api/admin/units/{unit_id}", json={"title_ru": "Новое название", "version": 1}, headers=H
    )
    assert r.status_code == 200
    assert r.json()["title_ru"] == "Новое название"
    assert r.json()["version"] == 2


def test_editor_cannot_edit_published(client, login, db):
    unit_id = _unit_id(db, "T-001")  # published
    login("editor")
    r = client.put(f"/api/admin/units/{unit_id}", json={"title_ru": "хак", "version": 1}, headers=H)
    assert r.status_code == 403


def test_branch_admin_edit_own_branch(client, login, db):
    ridder_id = db.execute("SELECT id FROM branches WHERE slug = 'ridder'").fetchone()["id"]
    login("branch_admin")
    r = client.put(f"/api/admin/branches/{ridder_id}", json={"phones": "+7 777 000 00 00"}, headers=H)
    assert r.status_code == 200


def test_branch_admin_edit_other_branch(client, login, db):
    main_id = db.execute("SELECT id FROM branches WHERE slug = 'uka-main'").fetchone()["id"]
    login("branch_admin")
    r = client.put(f"/api/admin/branches/{main_id}", json={"phones": "x"}, headers=H)
    assert r.status_code == 403


def test_set_access_only_moderator(client, login, db):
    file_id = db.execute(
        "SELECT id FROM files WHERE unit_id = (SELECT id FROM units WHERE code = 'T-001') LIMIT 1"
    ).fetchone()["id"]
    login("editor")
    r = client.put(f"/api/admin/files/{file_id}/access", json={"access": "public"}, headers=H)
    assert r.status_code == 403
    login("moderator")
    r = client.put(f"/api/admin/files/{file_id}/access", json={"access": "public"}, headers=H)
    assert r.status_code == 200
