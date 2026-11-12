"""Сквозной сценарий на TestClient: от создания до публикации и проверки доступа.

Шаги:
1. Редактор входит и создаёт дело (черновик).
2. Редактор отправляет дело на проверку.
3. Модератор одобряет (review -> approved).
4. Редактор пытается опубликовать — получает 403 (публикует только модератор).
5. Модератор публикует (approved -> published).
6. Запись находится в публичном поиске /api/catalog/search.
7. Файл с access=needs_check не скачивается (403).
8. Модератор открывает файл (public) — скачивание 200.
9. В журнале есть записи ok и denied с типом операции и ID.
10. ИИ-помощник в режиме source находит опубликованную запись.
"""

from __future__ import annotations

H = {"X-Requested-With": "gos"}

PDF_BYTES = b"%PDF-1.4\n% demo\n"


def _create_unit(client, code: str, title: str):
    return client.post(
        "/api/admin/units",
        json={
            "code": code,
            "title_ru": title,
            "level": "delo",
            "fond_id": 1,
            "years_from": 1930,
            "years_to": 1940,
            "place": "Риддер",
            "lang": "ru",
        },
        headers=H,
    )


def test_e2e_smoke(client, login, db, settings):
    # 1. Редактор входит и создаёт дело.
    assert login("editor").status_code == 200
    resp = _create_unit(client, "E2E-001", "Сводки Риддерского рудника за 1930-е годы")
    assert resp.status_code == 200, resp.text
    unit = resp.json()
    unit_id = unit["id"]
    assert unit["pub_status"] == "draft"

    # 2. Редактор отправляет на проверку (draft -> review).
    resp = client.post(f"/api/admin/units/{unit_id}/transition", json={"to": "review"}, headers=H)
    assert resp.status_code == 200, resp.text

    # 3. Модератор одобряет (review -> approved).
    login("moderator")
    resp = client.post(f"/api/admin/units/{unit_id}/transition", json={"to": "approved"}, headers=H)
    assert resp.status_code == 200, resp.text

    # 4. Редактор пытается опубликовать — 403 (право unit.publish есть только у модератора).
    login("editor")
    resp = client.post(f"/api/admin/units/{unit_id}/transition", json={"to": "published"}, headers=H)
    assert resp.status_code == 403, resp.text

    # 5. Модератор публикует (approved -> published).
    login("moderator")
    resp = client.post(f"/api/admin/units/{unit_id}/transition", json={"to": "published"}, headers=H)
    assert resp.status_code == 200, resp.text

    # 6. Запись находится в публичном поиске.
    resp = client.get("/api/catalog/search", params={"q": "Риддерского"})
    assert resp.status_code == 200
    codes = [i["code"] for i in resp.json()["items"]]
    assert "E2E-001" in codes

    # 7. Загружаем файл (mime pdf), по умолчанию access=needs_check — скачать нельзя.
    resp = client.post(
        f"/api/admin/units/{unit_id}/files",
        files={"file": ("e2e.pdf", PDF_BYTES, "application/pdf")},
        headers=H,
    )
    assert resp.status_code == 200, resp.text
    file_id = resp.json()["id"]
    assert resp.json()["access"] == "needs_check"

    resp = client.get(f"/api/files/{file_id}/download")
    assert resp.status_code == 403
    assert resp.json()["reason"] == "needs_check"

    # 8. Модератор открывает файл (access=public) — скачивание 200.
    resp = client.put(f"/api/admin/files/{file_id}/access", json={"access": "public"}, headers=H)
    assert resp.status_code == 200, resp.text
    resp = client.get(f"/api/files/{file_id}/download")
    assert resp.status_code == 200
    assert resp.content == PDF_BYTES

    # 9. Журнал: есть denied (попытка публикации редактором) и ok (переходы),
    #    с типом операции и ID объекта.
    denied = db.execute(
        "SELECT action, object_type, object_id FROM audit_log WHERE result='denied' AND object_id=?",
        (str(unit_id),),
    ).fetchall()
    assert denied
    assert all(r["action"] == "unit.transition" for r in denied)
    assert all(r["object_type"] == "unit" for r in denied)
    ok_rows = db.execute(
        "SELECT action, object_type, object_id FROM audit_log WHERE result='ok' AND object_id=?",
        (str(unit_id),),
    ).fetchall()
    assert ok_rows
    assert any(r["action"] == "unit.transition" for r in ok_rows)

    # 10. ИИ-помощник находит опубликованную запись (режим source).
    resp = client.post(
        "/api/ai/ask", json={"question": "Сводки Риддерского рудника", "lang": "ru"}, headers=H
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    unit_ids = [s["id"] for s in data["sources"] if s["type"] == "unit"]
    assert unit_id in unit_ids
