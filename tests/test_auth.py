"""Тесты аутентификации: вход, лимит попыток, выход, сессия."""

from __future__ import annotations

from datetime import timedelta

from backend.app import security

H = {"X-Requested-With": "gos"}


def test_login_ok(client, login):
    r = login("admin")
    assert r.status_code == 200
    data = r.json()
    assert data["user"]["username"] == "admin"
    assert data["user"]["role"] == "admin"
    assert "gos_session" in client.cookies


def test_login_wrong_password_401(client):
    r = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"}, headers=H)
    assert r.status_code == 401


def test_login_6th_attempt_429(client):
    for _ in range(5):
        r = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"}, headers=H)
        assert r.status_code == 401
    r = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"}, headers=H)
    assert r.status_code == 429


def test_logout(client, login):
    assert login("admin").status_code == 200
    assert client.post("/api/auth/logout", headers=H).status_code == 200
    assert client.get("/api/auth/me").status_code == 401


def test_me_401(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_ok(client, login):
    login("editor")
    r = client.get("/api/auth/me")
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "editor"


def test_session_expiry(client, login, monkeypatch):
    login("editor")
    assert client.get("/api/auth/me").status_code == 200
    future = security.now() + timedelta(minutes=31)
    monkeypatch.setattr(security, "now", lambda: future)
    assert client.get("/api/auth/me").status_code == 401
