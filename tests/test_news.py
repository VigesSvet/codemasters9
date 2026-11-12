"""Тесты новостей."""

from __future__ import annotations

import pytest

_INSERT_SQL = (
    "INSERT INTO news (date, title_ru, title_kk, lead_ru, lead_kk, html_ru, html_kk, image, pub_status)"
    " VALUES (?,?,?,?,?,?,?,?,'published')"
)


@pytest.fixture
def news_db(db):
    db.execute(
        _INSERT_SQL,
        ("2026-01-01", "Новость 1", "Жаңалық 1", "Лид 1", "Лид 1", "<p>html 1</p>", "<p>html 1</p>", ""),
    )
    db.execute(
        _INSERT_SQL,
        ("2026-01-02", "Новость 2", "Жаңалық 2", "Лид 2", "Лид 2", "<p>html 2</p>", "<p>html 2</p>", ""),
    )
    db.commit()
    return db


@pytest.fixture
def news_years_db(db):
    """Новости за разные годы (для проверки серверного фильтра по году)."""
    rows = [
        ("2024-01-10", "Старая 1"),
        ("2024-02-20", "Старая 2"),
        ("2025-03-01", "Новая 1"),
        ("2025-04-02", "Новая 2"),
        ("2025-05-03", "Новая 3"),
    ]
    for date, title in rows:
        db.execute(_INSERT_SQL, (date, title, "", "", "", "", "", ""))
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


def test_news_year_filter(client, news_years_db):
    resp = client.get("/api/news", params={"year": "2025"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 3
    assert all(i["date"].startswith("2025") for i in data["items"])


def test_news_years_list(client, news_years_db):
    resp = client.get("/api/news")
    data = resp.json()
    years = {y["year"]: y["count"] for y in data["years"]}
    assert years["2024"] == 2
    assert years["2025"] == 3


def test_news_years_with_search(client, news_years_db):
    resp = client.get("/api/news", params={"q": "Новая"})
    data = resp.json()
    years = {y["year"]: y["count"] for y in data["years"]}
    assert years == {"2025": 3}


def test_news_year_with_search(client, news_years_db):
    resp = client.get("/api/news", params={"year": "2024", "q": "Старая"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert all(i["date"].startswith("2024") for i in data["items"])
