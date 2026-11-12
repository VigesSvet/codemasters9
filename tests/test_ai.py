"""Тесты ИИ-помощника: режимы source/no_data/restricted, валидация, провайдер."""

from __future__ import annotations


def _add_unit(db, code, title, pub_status="published", access=None, fond_id=1):
    cur = db.execute(
        "INSERT INTO units (fond_id, level, code, title_ru, title_kk, title_en, pub_status, is_demo)"
        " VALUES (?,?,?,?,?,?,?,0)",
        (fond_id, "delo", code, title, title, title, pub_status),
    )
    unit_id = cur.lastrowid
    db.execute(
        "INSERT INTO catalog_fts (unit_id, title, code, keywords, author, place) VALUES (?,?,?,?,?,?)",
        (unit_id, title, code, "", "", ""),
    )
    if access is not None:
        db.execute(
            "INSERT INTO files (unit_id, filename, mime, size, kind, access) VALUES (?,?,?,?,?,?)",
            (unit_id, code + ".pdf", "application/pdf", 100, "view", access),
        )
    db.commit()
    return unit_id


def _ask(client, question, lang="ru"):
    return client.post("/api/ai/ask", json={"question": question, "lang": lang})


def test_ai_source_with_published_ids(client, db):
    uid = _add_unit(db, "ИМП-101", "Обзор Семипалатинской области за 1893 год", access="public")
    resp = _ask(client, "обзор Семипалатинской области")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    assert data["generated"] is True
    assert data["provider"] == "local-demo"
    assert data["disclaimer"]
    unit_ids = [s["id"] for s in data["sources"] if s["type"] == "unit"]
    assert uid in unit_ids


def test_ai_no_data(client, db):
    resp = _ask(client, "сведений о таком предмете нет нигде 404")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "no_data"
    assert data["sources"] == []


def test_ai_restricted_intent(client, db):
    resp = _ask(client, "как получить личное дело деда")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "restricted"
    assert data["sources"] == []
    # без шифров: в ответе нет кодов вроде "ИМП-"
    assert "ИМП-" not in data["answer"]


def test_ai_restricted_no_public_file_download(client, db):
    _add_unit(db, "ИМП-102", "Обзор области", pub_status="published", access=None)
    resp = _ask(client, "скачать обзор области")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "restricted"
    assert data["sources"] == []


def test_ai_excludes_draft_and_closed(client, db):
    pub = _add_unit(db, "ИМП-201", "Материалы о руднике", pub_status="published", access="public")
    _add_unit(db, "ИМП-202", "Черновик о руднике", pub_status="draft")
    _add_unit(db, "ИМП-203", "Архив о руднике", pub_status="archived")
    resp = _ask(client, "рудник")
    assert resp.status_code == 200
    data = resp.json()
    unit_ids = [s["id"] for s in data["sources"] if s["type"] == "unit"]
    assert pub in unit_ids
    codes = [s["code"] for s in data["sources"] if s["type"] == "unit"]
    assert "ИМП-202" not in codes
    assert "ИМП-203" not in codes


def test_ai_422_empty_question(client):
    resp = _ask(client, "   ")
    assert resp.status_code == 422


def test_ai_422_long_question(client):
    resp = _ask(client, "а" * 501)
    assert resp.status_code == 422


def test_ai_anthropic_no_key_503(client, settings, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    settings.ai_provider = "anthropic"
    resp = _ask(client, "обзор")
    assert resp.status_code == 503


def test_ai_local_no_network(client, db, monkeypatch):
    import socket

    _add_unit(db, "ИМП-301", "Обзор области", access="public")

    def _boom(*args, **kwargs):
        raise RuntimeError("сеть отключена")

    monkeypatch.setattr(socket, "socket", _boom)
    monkeypatch.setattr(socket, "create_connection", _boom)
    resp = _ask(client, "обзор")
    assert resp.status_code == 200
    assert resp.json()["mode"] == "source"
