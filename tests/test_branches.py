"""Тесты филиалов."""

from __future__ import annotations


def test_branches_list(client):
    resp = client.get("/api/branches")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    assert data[0]["slug"] == "uka-main"


def test_branch_by_slug(client):
    resp = client.get("/api/branches/ridder")
    assert resp.status_code == 200
    assert resp.json()["slug"] == "ridder"
    assert resp.json()["name_ru"] == "Риддерский филиал"


def test_branch_not_found(client):
    assert client.get("/api/branches/nonexistent").status_code == 404
