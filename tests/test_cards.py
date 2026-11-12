"""Тесты карточек единиц и скачивания файлов."""

from __future__ import annotations

from pathlib import Path


def _make_file(settings, name: str, content: bytes = b"%PDF-1.4 fake") -> None:
    fd = Path(settings.files_dir)
    fd.mkdir(parents=True, exist_ok=True)
    (fd / name).write_bytes(content)


def test_published_card_200(client):
    resp = client.get("/api/catalog/units/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["code"] == "T-001"
    assert data["has_public_file"] is True
    assert data["url"] == "/delo.html?id=1"
    assert data["files"][0]["downloadable"] is True


def test_draft_card_404(client):
    assert client.get("/api/catalog/units/4").status_code == 404


def test_review_card_404(client):
    assert client.get("/api/catalog/units/5").status_code == 404


def test_archived_card_404(client):
    assert client.get("/api/catalog/units/6").status_code == 404


def test_download_public_200(client, settings):
    _make_file(settings, "T-001.pdf")
    resp = client.get("/api/files/1/download")
    assert resp.status_code == 200
    assert resp.content == b"%PDF-1.4 fake"


def test_download_no_publish_403(client):
    resp = client.get("/api/files/2/download")
    assert resp.status_code == 403
    body = resp.json()
    assert body["error"] == "restricted"
    assert body["reason"] == "no_publish"
    assert body["howto"] == "reading_room"


def test_download_needs_check_403(client):
    resp = client.get("/api/files/3/download")
    assert resp.status_code == 403
    assert resp.json()["reason"] == "needs_check"


def test_download_unpublished_404(client, db):
    draft_id = db.execute("SELECT id FROM units WHERE code='T-004'").fetchone()["id"]
    db.execute(
        "INSERT INTO files (unit_id, filename, mime, size, kind, access) VALUES (?,?,?,?,?,?)",
        (draft_id, "T-004.pdf", "application/pdf", 100, "view", "public"),
    )
    db.commit()
    file_id = db.execute("SELECT id FROM files WHERE unit_id=?", (draft_id,)).fetchone()["id"]
    resp = client.get(f"/api/files/{file_id}/download")
    # SEC-06: ответ как у несуществующего файла, без reason
    assert resp.status_code == 404
    assert "reason" not in resp.json()


def test_download_nonexistent_404(client):
    assert client.get("/api/files/9999/download").status_code == 404
