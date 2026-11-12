"""Тесты админ-CRUD новостей."""

from __future__ import annotations

H = {"X-Requested-With": "gos"}
NEWS = {
    "title_ru": "Выставка",
    "title_kk": "Көрме",
    "lead_ru": "Анонс",
    "html_ru": "<p>Текст</p>",
    "date": "2026-11-01",
}


def _create(client, **extra):
    r = client.post("/api/admin/news", json={**NEWS, **extra}, headers=H)
    assert r.status_code == 200, r.text
    return r.json()


def test_requires_auth(client):
    assert client.get("/api/admin/news").status_code == 401


def test_csrf_required(client, login):
    login("admin")
    assert client.post("/api/admin/news", json=NEWS).status_code == 403


def test_create_draft_hidden_then_publish_visible(client, login):
    login("admin")
    n = _create(client)
    assert n["pub_status"] == "draft"
    assert client.get(f"/api/news/{n['id']}").status_code == 404
    assert all(i["id"] != n["id"] for i in client.get("/api/news").json()["items"])

    r = client.post(f"/api/admin/news/{n['id']}/publish", headers=H)
    assert r.json()["pub_status"] == "published"
    pub = client.get(f"/api/news/{n['id']}")
    assert pub.status_code == 200 and pub.json()["title_ru"] == "Выставка"
    assert any(i["id"] == n["id"] for i in client.get("/api/news").json()["items"])

    client.post(f"/api/admin/news/{n['id']}/unpublish", headers=H)
    assert client.get(f"/api/news/{n['id']}").status_code == 404


def test_update_and_delete(client, login, db):
    login("admin")
    n = _create(client, pub_status="published")
    r = client.put(f"/api/admin/news/{n['id']}", json={"title_ru": "Новое"}, headers=H)
    assert r.json()["title_ru"] == "Новое"
    assert client.delete(f"/api/admin/news/{n['id']}", headers=H).status_code == 200
    assert client.get(f"/api/admin/news/{n['id']}").status_code == 404
    actions = [r["action"] for r in db.execute("SELECT action FROM audit_log").fetchall()]
    for a in ("news.create", "news.edit", "news.delete"):
        assert a in actions


def test_validation(client, login):
    login("admin")
    assert client.post("/api/admin/news", json={"title_ru": " "}, headers=H).status_code == 422
    assert client.post("/api/admin/news", json={**NEWS, "pub_status": "x"}, headers=H).status_code == 422
    assert client.put("/api/admin/news/999999", json={"title_ru": "a"}, headers=H).status_code == 404


def test_editor_can_create_not_publish_or_delete(client, login, db):
    login("editor")
    n = _create(client)
    assert client.post(f"/api/admin/news/{n['id']}/publish", headers=H).status_code == 403
    assert client.delete(f"/api/admin/news/{n['id']}", headers=H).status_code == 403
    assert (
        client.post("/api/admin/news", json={**NEWS, "pub_status": "published"}, headers=H).status_code == 403
    )
    denied = db.execute("SELECT COUNT(*) AS n FROM audit_log WHERE result = 'denied'").fetchone()["n"]
    assert denied >= 3


def test_branch_admin_forbidden(client, login):
    login("branch_admin")
    assert client.post("/api/admin/news", json=NEWS, headers=H).status_code == 403
