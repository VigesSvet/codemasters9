"""Тесты админ-эндпоинтов: валидация, загрузка файла."""

from __future__ import annotations

H = {"X-Requested-With": "gos"}


def test_create_unit_missing_fields_422(client, login):
    login("editor")
    r = client.post("/api/admin/units", json={"code": "only-code"}, headers=H)
    assert r.status_code == 422


def test_upload_mime_spoof_rejected(client, login, db):
    unit_id = db.execute("SELECT id FROM units WHERE code = 'T-004'").fetchone()["id"]
    login("editor")
    r = client.post(
        f"/api/admin/units/{unit_id}/files",
        files={"file": ("fake.png", b"this is not a real image", "image/png")},
        headers=H,
    )
    assert r.status_code == 422


def test_upload_pdf_ok(client, login, db):
    unit_id = db.execute("SELECT id FROM units WHERE code = 'T-004'").fetchone()["id"]
    login("editor")
    r = client.post(
        f"/api/admin/units/{unit_id}/files",
        files={"file": ("doc.pdf", b"%PDF-1.4 fake pdf content", "application/pdf")},
        headers=H,
    )
    assert r.status_code == 200
    data = r.json()
    assert data["mime"] == "application/pdf"
    assert data["access"] == "needs_check"
