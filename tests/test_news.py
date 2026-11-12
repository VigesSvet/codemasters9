"""Тесты новостей."""

from __future__ import annotations

import pytest


@pytest.fixture
def news_db(db):
    db.execute(
        "INSERT INTO news (date, title_ru, title_kk, lead_ru, lead_kk, html_ru, html_kk, image, pub_status)"
        " VALUES (?,?,?,?,?,?,?,?,'published')",
        ("2026-01-01", "Новость 1", "Жаңалық 1", "Лид 1", "Лид 1", "<p>html 1</p>", "<p>html 1</p>", ""),
    )
    db.execute(
        "INSERT INTO news (date, title_ru, title_kk, lead_ru, lead_kk, html_ru, html_kk, image, pub_status)"
        " VALUES (?,?,?,?,?,?,?,?,'published')",
        ("2026-01-02", "Новость 2", "Жаңалық 2", "Лид 2", "Лид 2", "<p>html 2</p>", "<p>html 2</p>", ""),
    )
    db.commit()
    return db


def test_news_list_no_html(client, news_db):
    resp = client.get("/api/news")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    assert data["items"][0]["html_ru"] == ""


def test_news_detail_with_html(client, news_db):
    resp = client.get("/api/news/1")
    assert resp.status_code == 200
    assert resp.json()["html_ru"] == "<p>html 1</p>"


def test_news_search(client, news_db):
    resp = client.get("/api/news", params={"q": "Новость 1"})
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
