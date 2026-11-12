"""OCR через Ollama (ТЗ 5.8 Г): сеть подменена."""

from __future__ import annotations

import io

from backend.app.ai import ocr

H = {"X-Requested-With": "gos"}
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32


def _fake(monkeypatch, text="Текст документа"):
    seen = {}

    def post(url, headers, payload, timeout):
        seen["url"] = url
        seen["payload"] = payload
        return {"message": {"content": text}}

    monkeypatch.setattr(ocr, "_post_json", post)
    return seen


def _post(client, **data):
    return client.post(
        "/api/admin/ocr", files={"file": ("s.png", io.BytesIO(PNG), "image/png")}, data=data, headers=H
    )


def test_ocr_ok(client, login, monkeypatch):
    seen = _fake(monkeypatch)
    login("editor")
    r = _post(client)
    assert r.status_code == 200
    body = r.json()
    assert body["text"] == "Текст документа"
    assert "требует проверки" in body["note"]
    assert seen["url"].endswith("/api/chat")
    assert seen["payload"]["messages"][0]["images"]


def test_ocr_unavailable_503(client, login, monkeypatch):
    def boom(*a, **k):
        raise OSError("down")

    monkeypatch.setattr(ocr, "_post_json", boom)
    login("editor")
    assert _post(client).status_code == 503
    assert client.get("/api/health").status_code == 200


def test_ocr_rejects_non_image_and_branch_admin(client, login, monkeypatch):
    _fake(monkeypatch)
    login("branch_admin")
    assert _post(client).status_code == 403
    login("editor")
    r = client.post(
        "/api/admin/ocr", files={"file": ("a.txt", io.BytesIO(b"hello"), "text/plain")}, headers=H
    )
    assert r.status_code == 422


def test_ocr_save_draft_only(client, login, db, monkeypatch):
    _fake(monkeypatch)
    login("admin")
    r = client.post(
        "/api/admin/units",
        json={"code": "OCR-1", "title_ru": "тест", "level": "delo", "fond_id": 1, "years_from": 1900},
        headers=H,
    )
    uid = r.json()["id"]
    r = _post(client, unit_id=str(uid), save_draft="true")
    assert r.status_code == 200 and r.json()["saved_draft"]
    desc = db.execute("SELECT description_ru, pub_status FROM units WHERE id=?", (uid,)).fetchone()
    assert "требует проверки" in desc["description_ru"] and desc["pub_status"] == "draft"
    db.execute("UPDATE units SET pub_status='published' WHERE id=?", (uid,))
    db.commit()
    assert _post(client, unit_id=str(uid), save_draft="true").status_code == 409
