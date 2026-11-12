"""Тесты импорта CSV/XLSX: предпросмотр, права, применение, лимиты."""

from __future__ import annotations

import io
import json
from pathlib import Path

import pytest
from openpyxl import Workbook

from backend.app import permissions, security

# заголовок защиты от CSRF: без него сервер отклоняет любые изменяющие запросы
CSRF = {"X-Requested-With": "gos"}

ROOT = Path(__file__).resolve().parent.parent
SAMPLE_CSV = ROOT / "backend" / "seed" / "sample_import.csv"


def _editor_user():
    return {"id": 3, "username": "editor", "role": "editor", "branch_id": None, "display_name": "Редактор"}


@pytest.fixture
def authorized(app, monkeypatch):
    app.dependency_overrides[security.get_current_user] = _editor_user
    monkeypatch.setattr(permissions, "can", lambda user, action, obj=None: True)
    yield app
    app.dependency_overrides.clear()


def _preview(client, content, filename="import.csv", mapping=None):
    files = {"file": (filename, content, "text/csv")}
    data = {}
    if mapping is not None:
        data["mapping"] = json.dumps(mapping)
    return client.post("/api/admin/import/preview", files=files, data=data, headers=CSRF)


def _apply(client, job_id, mapping=None):
    body = {"mapping": mapping} if mapping is not None else {}
    return client.post("/api/admin/import/" + job_id + "/apply", json=body, headers=CSRF)


def test_import_csv_preview_no_write(client, authorized, db):
    before = db.execute("SELECT COUNT(*) AS n FROM units").fetchone()["n"]
    resp = _preview(client, SAMPLE_CSV.read_bytes())
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 10
    assert data["job_id"]
    after = db.execute("SELECT COUNT(*) AS n FROM units").fetchone()["n"]
    assert after == before


def test_import_preview_shows_error_and_duplicate(client, authorized, db):
    data = _preview(client, SAMPLE_CSV.read_bytes()).json()
    assert data["total"] == 10
    assert any(e["field"] == "title_ru" for e in data["errors"])
    assert any(d["code"] == "ИМП-001" for d in data["duplicates"])


def test_import_apply_inserts_8_drafts(client, authorized, db):
    preview = _preview(client, SAMPLE_CSV.read_bytes()).json()
    result = _apply(client, preview["job_id"]).json()
    assert result["inserted"] == 8
    n = db.execute(
        "SELECT COUNT(*) AS n FROM units WHERE code LIKE 'ИМП-%' AND pub_status = 'draft'"
    ).fetchone()["n"]
    assert n == 8
    # созданы недостающий фонд и опись
    assert db.execute("SELECT id FROM fonds WHERE code = '900'").fetchone() is not None


def test_import_apply_idempotent(client, authorized, db):
    p1 = _preview(client, SAMPLE_CSV.read_bytes()).json()
    r1 = _apply(client, p1["job_id"]).json()
    assert r1["inserted"] == 8
    p2 = _preview(client, SAMPLE_CSV.read_bytes()).json()
    r2 = _apply(client, p2["job_id"]).json()
    assert r2["inserted"] == 0
    assert r2["skipped"] >= 8
    n = db.execute("SELECT COUNT(*) AS n FROM units WHERE code LIKE 'ИМП-%'").fetchone()["n"]
    assert n == 8


def test_import_xlsx(client, authorized, db):
    wb = Workbook()
    ws = wb.active
    ws.append(
        [
            "шифр",
            "фонд",
            "опись",
            "дело",
            "название",
            "годы",
            "вид документа",
            "место",
            "автор",
            "ключевые слова",
            "язык",
        ]
    )
    ws.append(
        ["XLSX-001", "901", "1", "1", "Дело из Excel", "1950-1960", "org", "Риддер", "Автор", "ключ", "ru"]
    )
    ws.append(
        ["XLSX-002", "901", "1", "2", "Второе дело", "1961-1970", "org", "Риддер", "Автор", "ключ", "ru"]
    )
    buf = io.BytesIO()
    wb.save(buf)
    content = buf.getvalue()

    preview = _preview(client, content, filename="import.xlsx").json()
    assert preview["total"] == 2
    result = _apply(client, preview["job_id"]).json()
    assert result["inserted"] == 2


def test_import_cp1251(client, authorized, db):
    text = (
        "шифр;фонд;опись;дело;название;годы;вид документа;место;автор;ключевые слова;язык\n"
        "CP-001;902;1;1;Дело в cp1251;1950-1960;org;Риддер;Автор;ключ;ru\n"
    )
    content = text.encode("cp1251")
    preview = _preview(client, content).json()
    assert preview["total"] == 1
    result = _apply(client, preview["job_id"]).json()
    assert result["inserted"] == 1


def test_import_file_too_large(client, authorized):
    content = b"x" * (5 * 1024 * 1024 + 1)
    resp = _preview(client, content)
    assert resp.status_code == 413


def test_import_no_permission_403(client, app, db, monkeypatch):
    app.dependency_overrides[security.get_current_user] = _editor_user
    monkeypatch.setattr(permissions, "can", lambda user, action, obj=None: False)
    resp = _preview(client, SAMPLE_CSV.read_bytes())
    assert resp.status_code == 403
