"""Базовые проверки: health, статика, 404."""

from __future__ import annotations


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["fts5"] is True
    assert isinstance(data["units"], int)


def test_index_serves_html(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")


def test_unknown_path_returns_404_html(client):
    resp = client.get("/nesushestvuet")
    assert resp.status_code == 404
    assert "text/html" in resp.headers.get("content-type", "")
