"""Тесты блоков контента (страницы, FAQ)."""

from __future__ import annotations

H = {"X-Requested-With": "gos"}


def test_public_404_when_absent(client):
    assert client.get("/api/content/faq").status_code == 404
    assert client.get("/api/content/BAD KEY").status_code == 404
    assert client.get("/api/content/faq", params={"lang": "de"}).status_code == 422


def test_put_then_public_read(client, login, db):
    login("admin")
    r = client.put("/api/admin/content/faq", json={"lang": "ru", "title": "FAQ", "body": "Q?\nA."}, headers=H)
    assert r.status_code == 200 and r.json()["updated_by"] == "admin"
    pub = client.get("/api/content/faq", params={"lang": "ru"}).json()
    assert pub == {"key": "faq", "lang": "ru", "title": "FAQ", "body": "Q?\nA."}
    assert client.get("/api/content/faq", params={"lang": "kk"}).status_code == 404

    client.put("/api/admin/content/faq", json={"lang": "ru", "title": "FAQ", "body": "Q2?\nA2."}, headers=H)
    assert client.get("/api/content/faq").json()["body"] == "Q2?\nA2."
    adm = client.get("/api/admin/content/faq").json()["blocks"]
    assert adm["ru"]["body"] == "Q2?\nA2." and adm["kk"]["body"] == ""
    assert (
        db.execute("SELECT COUNT(*) AS n FROM audit_log WHERE action = 'content.edit'").fetchone()["n"] == 2
    )


def test_permissions_and_csrf(client, login):
    assert client.get("/api/admin/content/faq").status_code == 401
    login("editor")
    assert client.put("/api/admin/content/faq", json={"body": "x"}, headers=H).status_code == 403
    login("moderator")
    assert client.put("/api/admin/content/faq", json={"body": "x"}).status_code == 403  # CSRF
    assert client.put("/api/admin/content/faq", json={"body": "x"}, headers=H).status_code == 200
    assert client.put("/api/admin/content/faq", json={"lang": "zz"}, headers=H).status_code == 422
