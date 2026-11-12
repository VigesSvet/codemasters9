"""Тесты SEO-эндпоинтов."""

from __future__ import annotations


def test_robots(client):
    resp = client.get("/robots.txt")
    assert resp.status_code == 200
    text = resp.text
    assert "Disallow: /admin/" in text
    assert "Disallow: /api/admin/" in text
    assert "Sitemap:" in text


def test_sitemap_static_pages(client):
    resp = client.get("/sitemap.xml")
    assert resp.status_code == 200
    text = resp.text
    assert "katalog.html" in text
    assert "404.html" not in text
    assert "nedostupno.html" not in text
    assert "/admin/" not in text


def test_sitemap_no_draft(client):
    text = client.get("/sitemap.xml").text
    assert "delo.html?id=1" in text
    assert "delo.html?id=4" not in text
