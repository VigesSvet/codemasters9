"""Тесты заголовков безопасности и CSRF."""

from __future__ import annotations

H = {"X-Requested-With": "gos"}


def test_security_headers_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.headers.get("content-security-policy")
    assert r.headers.get("x-content-type-options") == "nosniff"
    assert r.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert r.headers.get("x-frame-options") == "DENY"
    assert r.headers.get("permissions-policy")


def test_security_headers_api_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.headers.get("content-security-policy")
    assert r.headers.get("x-content-type-options") == "nosniff"


def test_noindex_api_admin(client):
    r = client.get("/api/admin/units")
    assert r.status_code == 401
    assert "noindex" in r.headers.get("x-robots-tag", "")
    assert r.headers.get("cache-control") == "no-store"


def test_csrf_without_header_403(client):
    r = client.post("/api/admin/units", json={"code": "x"})
    assert r.status_code == 403
    assert r.json().get("error") == "csrf"
