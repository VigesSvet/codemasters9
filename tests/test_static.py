"""Проверки статики: gzip, Cache-Control, 404, MIME woff2, check_links."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def test_gzip_on_large_html(client):
    resp = client.get("/", headers={"Accept-Encoding": "gzip"})
    assert resp.status_code == 200
    assert resp.headers.get("content-encoding") == "gzip"


def test_cache_control_css(client):
    resp = client.get("/style.css")
    assert resp.status_code == 200
    assert resp.headers.get("cache-control") == "public, max-age=604800"


def test_cache_control_html(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.headers.get("cache-control") == "no-cache"


def test_unknown_path_returns_404_html(client):
    resp = client.get("/nesushestvuet")
    assert resp.status_code == 404
    assert "text/html" in resp.headers.get("content-type", "")


def test_woff2_content_type(client):
    resp = client.get("/fonts/RC500.woff2")
    assert resp.status_code == 200
    assert resp.headers.get("content-type", "").startswith("font/woff2")


def test_check_links_passes():
    proc = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "check_links.py"), str(ROOT / "web")],
        capture_output=True,
        text=True,
    )
    assert proc.returncode == 0, proc.stdout + proc.stderr
