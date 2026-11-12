"""Аналитика (ТЗ 5.8 Д): журналы поиска и помощника."""

from __future__ import annotations

H = {"X-Requested-With": "gos"}


def test_search_and_ai_logged_without_pii(client, login, db):
    client.get("/api/catalog/search", params={"q": "несуществующийзапросxyz"})
    client.post("/api/ai/ask", json={"question": "несуществующийзапросxyz", "lang": "ru"}, headers=H)
    s = db.execute("SELECT * FROM search_log").fetchall()
    assert s and s[0]["results"] == 0 and set(s[0].keys()) == {"id", "ts", "query", "results"}
    a = db.execute("SELECT * FROM ai_log").fetchall()
    assert a and set(a[0].keys()) == {"id", "ts", "mode", "provider"}


def test_analytics_admin(client, login):
    client.get("/api/catalog/search", params={"q": "ничегонет"})
    client.get("/api/catalog/search", params={"q": "ничегонет"})
    login("admin")
    r = client.get("/api/admin/analytics")
    assert r.status_code == 200
    body = r.json()
    assert body["empty_queries"][0] == {"query": "ничегонет", "n": 2}
    assert body["top_queries"][0]["query"] == "ничегонет"
    assert "синоним" in body["recommendations"][0]
    assert body["summary"]


def test_analytics_forbidden_for_others(client, login):
    assert client.get("/api/admin/analytics").status_code == 401
    for role in ("editor", "moderator"):
        login(role)
        assert client.get("/api/admin/analytics").status_code == 403
