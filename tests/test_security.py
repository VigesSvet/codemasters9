"""Регрессионные тесты по находкам аудита docs/security/2026-11-12-audit.md(SEC-01...SEC-13)."""

from __future__ import annotations

import csv
import io

import pytest
from openpyxl import Workbook

from backend.app import security
from backend.app.config import DEMO_PASSWORD, Settings
from backend.app.main import create_app
from backend.app.search import reindex_all

H = {"X-Requested-With": "gos"}


# ---------- SEC-01 поиск FTS5 ----------

# строки из аудита: до исправления 11 из 17 давали sqlite3.OperationalError -> 500
FTS_HOSTILE = [
    "ф.1",
    '"',
    'a"b',
    "a(b",
    "(",
    ")",
    "x*",
    "*",
    "col:x",
    "title:риддер",
    "o'neil",
    "привет!",
    "NEAR(a b)",
    "a AND",
    "OR",
    "^a",
    "-a +b",
]


@pytest.mark.parametrize("q", FTS_HOSTILE)
def test_search_special_chars_no_500(client, q):
    r = client.get("/api/catalog/search", params={"q": q})
    assert r.status_code == 200, r.text
    assert "items" in r.json()


def test_search_quoted_token_matches(client, db):
    db.execute(
        "INSERT INTO units (fond_id, level, code, title_ru, branch_id, pub_status, is_demo, lang)"
        " VALUES (1, 'opis', 'ф.1, оп.2', 'Опись фонда управления', 1, 'published', 1, 'ru')"
    )
    db.commit()
    reindex_all(db)
    r = client.get("/api/catalog/search", params={"q": "ф.1"})
    assert r.status_code == 200
    assert "ф.1, оп.2" in [i["code"] for i in r.json()["items"]]


def test_search_long_query_no_500(client):
    r = client.get("/api/catalog/search", params={"q": "архив " * 1000})
    assert r.status_code == 200


def test_search_fts_error_falls_back_to_like(client, monkeypatch):
    from backend.app import search

    # заведомо битое выражение MATCH - сервер должен уйти в LIKE, а не в 500
    monkeypatch.setattr(search, "_fts_expr", lambda q: '"unterminated')
    r = client.get("/api/catalog/search", params={"q": "Единица"})
    assert r.status_code == 200
    assert r.json()["total"] == 3


# ---------- SEC-02 лимит тела и длины полей ----------


def test_body_too_large_413(client):
    big = b"x" * (security.MAX_BODY_BYTES + 1)
    r = client.post("/api/ai/ask", content=big, headers={**H, "Content-Type": "application/json"})
    assert r.status_code == 413
    assert r.json()["error"] == "too_large"


def test_upload_over_limit_413(client, login, db):
    from backend.app.routers.admin import MAX_FILE_SIZE

    login("editor")
    unit_id = db.execute("SELECT id FROM units WHERE code='T-004'").fetchone()["id"]
    data = b"%PDF" + b"0" * MAX_FILE_SIZE
    r = client.post(
        f"/api/admin/units/{unit_id}/files",
        files={"file": ("big.pdf", data, "application/pdf")},
        headers=H,
    )
    assert r.status_code == 413


def test_login_overlong_fields_422(client):
    r = client.post("/api/auth/login", json={"username": "a" * 65, "password": "x"}, headers=H)
    assert r.status_code == 422
    r = client.post("/api/auth/login", json={"username": "admin", "password": "x" * 257}, headers=H)
    assert r.status_code == 422


# ---------- SEC-03 XLSX ----------


def _xlsx(rows: list[list]) -> bytes:
    wb = Workbook()
    ws = wb.active
    for row in rows:
        ws.append(row)
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def _preview_xlsx(client, content: bytes):
    files = {
        "file": ("reestr.xlsx", content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    }
    return client.post("/api/admin/import/preview", files=files, headers=H)


def test_import_xlsx_too_many_rows_422(client, login):
    from backend.app.importer import MAX_ROWS

    login("editor")
    rows = [["code", "title_ru", "fond_code"]] + [[f"X-{i}", "t", "18"] for i in range(MAX_ROWS + 5)]
    r = _preview_xlsx(client, _xlsx(rows))
    assert r.status_code == 422
    assert "строк" in r.json()["detail"]


def test_import_xlsx_too_many_columns_422(client, login):
    from backend.app.importer import MAX_COLUMNS

    login("editor")
    r = _preview_xlsx(client, _xlsx([[f"c{i}" for i in range(MAX_COLUMNS + 1)]]))
    assert r.status_code == 422
    assert "колонок" in r.json()["detail"]


def test_import_bad_xlsx_422(client, login):
    login("editor")
    r = _preview_xlsx(client, b"PK\x03\x04 not really a zip")
    assert r.status_code == 422


# ---------- SEC-04 владелец задачи импорта ----------


def _add_user(db, username: str, role: str) -> None:
    db.execute(
        "INSERT INTO users (username, password_hash, role, display_name) VALUES (?,?,?,?)",
        (username, security.hash_password(DEMO_PASSWORD), role, username),
    )
    db.commit()


def _login_as(client, username: str):
    return client.post("/api/auth/login", json={"username": username, "password": DEMO_PASSWORD}, headers=H)


def test_import_apply_other_user_403(client, login, db):
    csv_body = "code,title_ru,fond_code,years_from\nIMP-1,Дело,18,1950\n".encode()
    login("editor")
    job_id = client.post(
        "/api/admin/import/preview", files={"file": ("a.csv", csv_body, "text/csv")}, headers=H
    ).json()["job_id"]

    _add_user(db, "editor2", "editor")
    assert _login_as(client, "editor2").status_code == 200
    r = client.post(f"/api/admin/import/{job_id}/apply", json={}, headers=H)
    assert r.status_code == 403
    denied = db.execute(
        "SELECT COUNT(*) AS n FROM audit_log WHERE action='import.apply' AND result='denied' AND object_id=?",
        (job_id,),
    ).fetchone()["n"]
    assert denied == 1
    assert db.execute("SELECT COUNT(*) AS n FROM units WHERE code='IMP-1'").fetchone()["n"] == 0

    # автор задачи применяет свой preview
    login("editor")
    assert client.post(f"/api/admin/import/{job_id}/apply", json={}, headers=H).status_code == 200


# ---------- SEC-05 вход ----------


def test_login_ip_limit_across_usernames(client, settings):
    settings.login_ip_max_attempts = 3
    for i in range(3):
        r = client.post("/api/auth/login", json={"username": f"nobody{i}", "password": "x"}, headers=H)
        assert r.status_code == 401
    # новый логин с того же IP - уже 429, хотя для этого имени неудач не было
    r = client.post("/api/auth/login", json={"username": "admin", "password": DEMO_PASSWORD}, headers=H)
    assert r.status_code == 429


def test_login_unknown_user_401_same_message(client, monkeypatch):
    calls = []
    real = security.burn_password_check
    monkeypatch.setattr(security, "burn_password_check", lambda p: calls.append(p) or real(p))
    unknown = client.post("/api/auth/login", json={"username": "ghost", "password": "x"}, headers=H)
    wrong = client.post("/api/auth/login", json={"username": "admin", "password": "x"}, headers=H)
    assert unknown.status_code == wrong.status_code == 401
    assert unknown.json() == wrong.json()
    # для неизвестного логина scrypt тоже выполняется - тайминг не выдаёт существование
    assert calls == ["x"]


def test_login_attempts_pruned(client, db):
    db.execute(
        "INSERT INTO login_attempts (username, ip, ts, ok)"
        " VALUES ('old', '1.2.3.4', '2000-01-01T00:00:00+00:00', 0)"
    )
    db.commit()
    client.post("/api/auth/login", json={"username": "admin", "password": "x"}, headers=H)
    assert db.execute("SELECT COUNT(*) AS n FROM login_attempts WHERE username='old'").fetchone()["n"] == 0


# ---------- SEC-06 файл черновика ----------
# тест test_download_unpublished_404 - в tests/test_cards.py


# ---------- SEC-07 CSV-инъекция ----------


def test_export_csv_neutralizes_formulas(client, login, db):
    db.execute(
        "UPDATE units SET title_ru = ?, author = ? WHERE code = 'T-001'",
        ('=HYPERLINK("http://x","y")', "@SUM(1)"),
    )
    db.commit()
    login("moderator")
    r = client.get("/api/admin/export.csv")
    assert r.status_code == 200
    rows = list(csv.DictReader(io.StringIO(r.text)))
    row = next(x for x in rows if x["code"] == "T-001")
    assert row["title_ru"] == '\'=HYPERLINK("http://x","y")'
    assert row["author"] == "'@SUM(1)"


# ---------- SEC-08 демо-пароль ----------


def test_login_and_me_report_default_password(client, login, db):
    assert login("admin").json()["password_is_default"] is True
    assert client.get("/api/auth/me").json()["password_is_default"] is True
    db.execute(
        "UPDATE users SET password_hash = ? WHERE username = 'admin'",
        (security.hash_password("Other-Pass-2026"),),
    )
    db.commit()
    assert client.get("/api/auth/me").json()["password_is_default"] is False


# ---------- SEC-09 scrypt ----------


def test_scrypt_params_owasp():
    h = security.hash_password("secret")
    _, n, r, p, _salt, _dk = h.split("$")
    assert (int(n), int(r), int(p)) == (16384, 8, 5)
    assert security.verify_password("secret", h)


def test_legacy_p1_hash_still_verifies():
    import base64
    import hashlib

    salt = b"0123456789abcdef"
    dk = hashlib.scrypt(b"legacy", salt=salt, n=16384, r=8, p=1, dklen=32)
    legacy = f"scrypt$16384$8$1${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"
    assert security.verify_password("legacy", legacy)
    assert not security.verify_password("wrong", legacy)


# ---------- SEC-10 заголовки ----------


def test_coop_corp_headers(client):
    r = client.get("/api/health")
    assert r.headers["Cross-Origin-Opener-Policy"] == "same-origin"
    assert r.headers["Cross-Origin-Resource-Policy"] == "same-origin"
    assert "Strict-Transport-Security" not in r.headers


def test_hsts_when_cookie_secure(settings, db):
    from fastapi.testclient import TestClient

    settings.cookie_secure = True
    with TestClient(create_app(settings)) as c:
        assert c.get("/api/health").headers["Strict-Transport-Security"].startswith("max-age=")


# ---------- SEC-11 документация API ----------


def test_api_docs_disabled_by_default(client):
    for path in ("/docs", "/redoc", "/openapi.json"):
        assert client.get(path).status_code == 404, path


def test_api_docs_enabled_with_flag(tmp_path, db):
    from fastapi.testclient import TestClient

    s = Settings(db_path=str(tmp_path / "archive.db"), files_dir=str(tmp_path / "f"), api_docs=True)
    with TestClient(create_app(s)) as c:
        assert c.get("/openapi.json").status_code == 200


# ---------- SEC-12 пагинация админки ----------


def test_admin_pagination_clamped(client, login):
    login("admin")
    data = client.get("/api/admin/units", params={"page": -5, "per_page": 10**9}).json()
    assert data["page"] == 1
    assert data["per_page"] == 100
    data = client.get("/api/admin/audit", params={"page": 0, "per_page": 0}).json()
    assert (data["page"], data["per_page"]) == (1, 1)
    assert client.get("/api/catalog/search", params={"page": 10**12}).status_code == 200


# ---------- SEC-13 branch_admin и чужие филиалы ----------


def test_branch_admin_foreign_unit_404(client, login, db):
    # все единицы фикстуры - в головном архиве(branch_id=1), ridder - филиал 2
    unit_id = db.execute("SELECT id FROM units WHERE code='T-004'").fetchone()["id"]
    login("branch_admin")
    assert client.get("/api/admin/units").json()["total"] == 0
    for path in (
        f"/api/admin/units/{unit_id}",
        f"/api/admin/units/{unit_id}/versions",
        f"/api/admin/units/{unit_id}/files",
    ):
        assert client.get(path).status_code == 404, path

    login("admin")
    assert client.get(f"/api/admin/units/{unit_id}").status_code == 200


def test_branch_admin_own_unit_visible(client, login, db):
    ridder = db.execute("SELECT id FROM branches WHERE slug='ridder'").fetchone()["id"]
    db.execute("UPDATE units SET branch_id = ? WHERE code='T-004'", (ridder,))
    db.commit()
    login("branch_admin")
    data = client.get("/api/admin/units").json()
    assert [u["code"] for u in data["items"]] == ["T-004"]
