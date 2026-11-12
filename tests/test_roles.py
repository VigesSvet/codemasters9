"""Роли, настраиваемые права, управление пользователями, добавление филиала."""

from __future__ import annotations

import pytest

from backend.app import permissions

H = {"X-Requested-With": "gos"}
PW = "Demo-2026!"


@pytest.fixture(autouse=True)
def _reset_cache():
    yield
    permissions.reload(None)


def _as(client, username):
    r = client.post("/api/auth/login", json={"username": username, "password": PW}, headers=H)
    assert r.status_code == 200
    return r


def _uid(db, username):
    return db.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()["id"]


def test_defaults_seeded(db):
    n = db.execute("SELECT COUNT(*) AS n FROM role_permissions").fetchone()["n"]
    assert n > 20


def test_analyst_only_audit(client):
    _as(client, "analyst")
    assert client.get("/api/admin/audit").status_code == 200
    assert client.get("/api/admin/users").status_code == 403
    assert client.post("/api/admin/units", json={"title_ru": "x"}, headers=H).status_code == 403


def test_staff_read_only(client, db):
    _as(client, "staff")
    assert client.get("/api/admin/units").status_code == 200
    assert client.post("/api/admin/units", json={"title_ru": "x"}, headers=H).status_code == 403
    assert client.get("/api/admin/audit").status_code == 403


def test_matrix_only_superadmin(client):
    _as(client, "admin")
    assert client.get("/api/admin/roles").status_code == 200
    r = client.put("/api/admin/roles", json={"matrix": {"staff": []}}, headers=H)
    assert r.status_code == 403


def test_matrix_edit_changes_access_and_audited(client, db):
    _as(client, "superadmin")
    m = client.get("/api/admin/roles").json()["matrix"]
    assert "audit.read" not in m["staff"]
    r = client.put("/api/admin/roles", json={"matrix": {"staff": ["admin.read", "audit.read"]}}, headers=H)
    assert r.status_code == 200
    assert "audit.read" in r.json()["matrix"]["staff"]
    assert db.execute("SELECT COUNT(*) AS n FROM audit_log WHERE action='roles.manage'").fetchone()["n"] == 1
    client.post("/api/auth/logout", headers=H)
    _as(client, "staff")
    assert client.get("/api/admin/audit").status_code == 200


def test_superadmin_keeps_roles_manage(client):
    _as(client, "superadmin")
    r = client.put("/api/admin/roles", json={"matrix": {"superadmin": ["users.manage"]}}, headers=H)
    assert r.status_code == 400
    assert client.put("/api/admin/roles", json={"matrix": {"staff": ["nope"]}}, headers=H).status_code == 422


def test_user_role_block_delete(client, db):
    _as(client, "admin")
    eid = _uid(db, "editor")
    r = client.put(f"/api/admin/users/{eid}", json={"role": "staff"}, headers=H)
    assert r.status_code == 200 and r.json()["role"] == "staff"
    r = client.put(f"/api/admin/users/{eid}", json={"is_active": False}, headers=H)
    assert r.json()["is_active"] == 0
    client.post("/api/auth/logout", headers=H)
    bad = client.post("/api/auth/login", json={"username": "editor", "password": PW}, headers=H)
    assert bad.status_code in (401, 403)
    _as(client, "admin")
    assert client.delete(f"/api/admin/users/{eid}", headers=H).status_code == 200
    assert eid not in [u["id"] for u in client.get("/api/admin/users").json()]
    row = db.execute("SELECT deleted_at FROM users WHERE id = ?", (eid,)).fetchone()
    assert row["deleted_at"]
    assert client.put(f"/api/admin/users/{eid}", json={"role": "editor"}, headers=H).status_code == 404


def test_cannot_touch_self(client, db):
    _as(client, "admin")
    me = _uid(db, "admin")
    assert client.delete(f"/api/admin/users/{me}", headers=H).status_code == 400
    assert client.put(f"/api/admin/users/{me}", json={"role": "staff"}, headers=H).status_code == 400
    assert client.put(f"/api/admin/users/{me}", json={"is_active": False}, headers=H).status_code == 400


def test_admin_cannot_manage_superadmin(client, db):
    _as(client, "admin")
    sid = _uid(db, "superadmin")
    assert client.put(f"/api/admin/users/{sid}", json={"is_active": False}, headers=H).status_code == 403
    assert client.delete(f"/api/admin/users/{sid}", headers=H).status_code == 403
    r = client.post(
        "/api/admin/users", json={"username": "x", "password": "Pw-12345!x", "role": "superadmin"}, headers=H
    )
    assert r.status_code == 403


def test_user_changes_need_csrf(client):
    _as(client, "admin")
    assert client.put("/api/admin/users/1", json={"role": "staff"}).status_code == 403


def test_create_branch(client, db):
    _as(client, "admin")
    r = client.post("/api/admin/branches", json={"slug": "new-fil", "name_ru": "Новый филиал"}, headers=H)
    assert r.status_code == 200 and r.json()["slug"] == "new-fil"
    assert (
        client.post("/api/admin/branches", json={"slug": "new-fil", "name_ru": "Д"}, headers=H).status_code
        == 409
    )
    assert client.post("/api/admin/branches", json={"name_ru": "Д"}, headers=H).status_code == 422
    assert db.execute("SELECT COUNT(*) AS n FROM audit_log WHERE action='branch.create'").fetchone()["n"] == 1
    client.post("/api/auth/logout", headers=H)
    _as(client, "editor")
    assert (
        client.post("/api/admin/branches", json={"slug": "z", "name_ru": "Z"}, headers=H).status_code == 403
    )
