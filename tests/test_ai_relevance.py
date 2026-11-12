"""Тесты релевантности ИИ-помощника: посторонние вопросы не дают источников, положительные - дают."""

from __future__ import annotations

import pytest

from backend.app import textnorm

# заголовок защиты от CSRF: без него сервер отклоняет любые изменяющие запросы
CSRF = {"X-Requested-With": "gos"}


def _add_unit(db, code, title_ru, title_kk=None, title_en=None, access="public", pub_status="published"):
    title_kk = title_kk or title_ru
    title_en = title_en or title_ru
    cur = db.execute(
        "INSERT INTO units (fond_id, level, code, title_ru, title_kk, title_en, pub_status, is_demo)"
        " VALUES (1,'delo',?,?,?,?,?,0)",
        (code, title_ru, title_kk, title_en, pub_status),
    )
    unit_id = cur.lastrowid
    # индекс как в проде: нормализованный текст из всех языков заголовка
    db.execute(
        "INSERT INTO catalog_fts (unit_id, title, code, keywords, author, place) VALUES (?,?,?,?,?,?)",
        (unit_id, textnorm.norm(" ".join((title_ru, title_kk, title_en))), code, "", "", ""),
    )
    if access is not None:
        db.execute(
            "INSERT INTO files (unit_id, filename, mime, size, kind, access) VALUES (?,?,?,?,?,?)",
            (unit_id, code + ".pdf", "application/pdf", 100, "view", access),
        )
    db.commit()
    return unit_id


def _ask(client, question, lang="ru"):
    return client.post("/api/ai/ask", json={"question": question, "lang": lang}, headers=CSRF)


@pytest.mark.parametrize(
    ("question", "lang"),
    [
        ("погода на Марсе", "ru"),
        ("рецепт бешбармака", "ru"),
        ("курс доллара", "ru"),
        ("кто выиграл чемпионат мира", "ru"),
        ("как приготовить бешбармак", "ru"),
        ("what is the weather on Mars", "en"),
        ("how to cook beshbarmak", "en"),
        ("Марстағы ауа райы", "kk"),
        ("доллар курсы қандай", "kk"),
    ],
)
def test_ai_offtopic_no_data(client, question, lang):
    resp = _ask(client, question, lang)
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "no_data"
    assert data["sources"] == []


def test_metric_books_semipalatinsk(client, db):
    uid = _add_unit(
        db,
        "Ф. 18",
        "Метрические книги приходов Семипалатинской области",
        "Семей облысы приходтарының метрикалық кітаптары",
    )
    resp = _ask(client, "метрические книги Семипалатинска")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    unit_ids = [s["id"] for s in data["sources"] if s["type"] == "unit"]
    assert uid in unit_ids


def test_semipalatinsk_1885_year_filter(client, db):
    hit = _add_unit(db, "Ф. 77-Ф, д. 14", "Семипалатинск. Базар, 1885")
    other = _add_unit(db, "Ф. 77-Ф, д. 12", "Вид города Усть-Каменогорска, гравюра, 1885")
    resp = _ask(client, "Семипалатинск 1885")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    unit_ids = [s["id"] for s in data["sources"] if s["type"] == "unit"]
    assert hit in unit_ids
    # совпадение только по году (без "Семипалатинск") не тянется
    assert other not in unit_ids


def test_leningorsk_synonym(client, db):
    uid = _add_unit(db, "Ф. 61, д. 38", "Приказы по личному составу Риддерского рудника, 1938-1945")
    resp = _ask(client, "Лениногорск")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    assert uid in [s["id"] for s in data["sources"] if s["type"] == "unit"]


def test_ridder_synonym(client, db):
    uid = _add_unit(db, "Ф. 61, д. 38", "Приказы по личному составу Риддерского рудника, 1938-1945")
    resp = _ask(client, "Риддер")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    assert uid in [s["id"] for s in data["sources"] if s["type"] == "unit"]


def test_branch_address(client, db):
    # филиал Риддера есть в фикстуре (load_fixture)
    resp = _ask(client, "адрес Риддерского филиала")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    branches = [s for s in data["sources"] if s["type"] == "branch"]
    assert branches
    assert any("Риддер" in s["title"] for s in branches)


def test_obzor_semipalatinsk_oblast(client, db):
    uid = _add_unit(db, "Ф. 1-П, д. 245", "Обзор Семипалатинской области за 1893 год")
    resp = _ask(client, "Обзор Семипалатинской области")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    assert uid in [s["id"] for s in data["sources"] if s["type"] == "unit"]


def test_kazakh_semey(client, db):
    uid = _add_unit(
        db,
        "Ф. 18",
        "Метрические книги приходов Семипалатинской области",
        "Семей облысы приходтарының метрикалық кітаптары",
    )
    resp = _ask(client, "Семей туралы", lang="kk")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "source"
    assert uid in [s["id"] for s in data["sources"] if s["type"] == "unit"]


def test_restricted_unchanged(client, db):
    resp = _ask(client, "личное дело Иванова")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "restricted"
    assert data["sources"] == []
    assert "ИМП-" not in data["answer"]


def test_deepseek_offtopic_stays_local(client, db, settings, monkeypatch):
    # посторонний вопрос не уходит наружу даже при настроенном deepseek
    from backend.app.ai import providers

    sent = []

    def fake_post(url, headers, payload, timeout):
        sent.append(payload)
        return {"choices": [{"message": {"role": "assistant", "content": "не должен вызываться"}}]}

    monkeypatch.setenv("DEEPSEEK_API_KEY", "test-key")
    monkeypatch.setattr(providers, "_post_json", fake_post)
    settings.ai_provider = "deepseek"
    resp = _ask(client, "погода на Марсе")
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "no_data"
    assert sent == []
