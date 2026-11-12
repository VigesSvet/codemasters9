"""Тесты открытых данных: только published, без служебных полей, защита CSV."""

from __future__ import annotations

import csv
import io


def _csv_rows(body: str) -> list[list[str]]:
    return list(csv.reader(io.StringIO(body.lstrip("\ufeff"))))


def test_opendata_json_published_only(client):
    resp = client.get("/api/opendata/catalog.json")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    codes = {r["code"] for r in data}
    # черновик(T-004), на проверке(T-005) и архивная(T-006) не попадают
    assert codes == {"T-001", "T-002", "T-003"}


def test_opendata_csv_published_only_and_bom(client):
    resp = client.get("/api/opendata/catalog.csv")
    assert resp.status_code == 200
    assert resp.headers["content-disposition"].startswith("attachment")
    body = resp.text
    assert body.startswith("\ufeff")  # UTF-8 BOM для Excel
    rows = _csv_rows(body)
    assert rows[0][0] == "id"
    codes = {r[2] for r in rows[1:] if r}
    assert codes == {"T-001", "T-002", "T-003"}


def test_opendata_no_service_fields(client):
    data = client.get("/api/opendata/catalog.json").json()
    service = {
        "created_by",
        "status_changed_by",
        "status_changed_at",
        "filename",
        "sha256",
        "origin",
        "source_file_id",
        "uploaded_by",
        "uploaded_at",
        "files",
    }
    for item in data:
        assert not (service & set(item.keys())), item.keys()
        assert "has_public_file" in item

    header = _csv_rows(client.get("/api/opendata/catalog.csv").text)[0]
    assert "created_by" not in header
    assert "status_changed_by" not in header
    assert "filename" not in header
    assert "has_public_file" in header


def test_opendata_has_public_file_flag(client):
    data = client.get("/api/opendata/catalog.json").json()
    by_code = {r["code"]: r for r in data}
    assert by_code["T-001"]["has_public_file"] is True
    assert by_code["T-002"]["has_public_file"] is False
    assert by_code["T-003"]["has_public_file"] is False


def test_opendata_csv_formula_neutralized(client, db):
    db.execute(
        "INSERT INTO units (fond_id, level, code, title_ru, title_kk, title_en,"
        " branch_id, pub_status, is_demo) VALUES (?,?,?,?,?,?,?,?,?)",
        (1, "delo", "F-001", '=HYPERLINK("http://evil.example")', "=2+2", "@cmd", 1, "published", 1),
    )
    db.commit()
    body = client.get("/api/opendata/catalog.csv").text.lstrip("\ufeff")
    # ячейки, начинающиеся с = @ и т.п., экранируются апострофом, а не выполняются
    assert "'=HYPERLINK" in body
    assert "'=2+2" in body
    assert "'@cmd" in body


def test_opendata_json_csv_same_count(client):
    j = client.get("/api/opendata/catalog.json").json()
    rows = _csv_rows(client.get("/api/opendata/catalog.csv").text)
    data_rows = [r for r in rows[1:] if r]
    assert len(j) == len(data_rows)
