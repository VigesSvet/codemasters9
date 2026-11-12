"""Тесты полнотекстового поиска."""

from __future__ import annotations

import pytest

from backend.app.search import reindex_all, reindex_unit, search_units


@pytest.fixture
def rich_db(db):
    """Дополнительные published-единицы для проверок синонимов, ё/казахских букв и фильтров."""
    fond_id = db.execute("SELECT id FROM fonds LIMIT 1").fetchone()["id"]
    ridder = db.execute("SELECT id FROM branches WHERE slug='ridder'").fetchone()["id"]
    zaisan = db.execute("SELECT id FROM branches WHERE slug='zaisan'").fetchone()["id"]
    rows = [
        # code, title_ru, place, theme, doc_type, years_from, years_to, branch_id
        (
            "T-101",
            "Приказы по личному составу Риддерского рудника",
            "Риддер",
            "industry",
            "org",
            1938,
            1945,
            ridder,
        ),
        ("T-102", "Ёлочные игрушки из фольги", "Семей", "city", "photo", 1950, 1950, None),
        ("T-103", "Қазақстан тарихы мен өлкесі", "Өскемен", "hist", "written", 1900, 1900, None),
        (
            "T-104",
            "Список населённых мест Зайсанского уезда",
            "Зайсан",
            "hist",
            "written",
            1901,
            1901,
            zaisan,
        ),
    ]
    for code, title, place, theme, doc_type, yf, yt, bid in rows:
        db.execute(
            "INSERT INTO units (fond_id, level, code, title_ru, place, theme, doc_type,"
            " years_from, years_to, branch_id, pub_status, is_demo, lang)"
            " VALUES (?,?,?,?,?,?,?,?,?,?,?,1,'ru')",
            (fond_id, "delo", code, title, place, theme, doc_type, yf, yt, bid, "published"),
        )
    reindex_all(db)
    return db


def _codes(result: dict) -> list[str]:
    return [i["code"] for i in result["items"]]


def test_search_by_title(db):
    r = search_units(db, {"q": "Единица"})
    assert r["total"] == 3
    assert set(_codes(r)) == {"T-001", "T-002", "T-003"}


def test_search_synonym_leninogorsk(rich_db):
    r = search_units(rich_db, {"q": "Лениногорск"})
    assert "T-101" in _codes(r)
    assert "риддер" in r["query_variants"]


def test_search_yo_normalization(rich_db):
    r = search_units(rich_db, {"q": "ёлочные"})
    assert "T-102" in _codes(r)


def test_search_kazakh_normalization(rich_db):
    r = search_units(rich_db, {"q": "қазақстан"})
    assert "T-103" in _codes(r)


def test_filter_years(rich_db):
    r = search_units(rich_db, {"year_from": 1938, "year_to": 1945})
    codes = _codes(r)
    assert "T-101" in codes
    assert "T-104" not in codes


def test_filter_type(rich_db):
    r = search_units(rich_db, {"type": "org"})
    assert r["total"] == 1
    assert _codes(r) == ["T-101"]


def test_filter_branch(rich_db):
    r = search_units(rich_db, {"branch": "ridder"})
    assert r["total"] == 1
    assert _codes(r) == ["T-101"]


def test_pagination(rich_db):
    all_items = search_units(rich_db, {"per_page": 50})
    total = all_items["total"]
    page1 = search_units(rich_db, {"per_page": 1, "page": 1})
    page2 = search_units(rich_db, {"per_page": 1, "page": 2})
    assert page1["total"] == total
    assert len(page1["items"]) == 1
    assert len(page2["items"]) == 1
    assert page1["items"][0]["id"] != page2["items"][0]["id"]


def test_per_page_clamped(rich_db):
    r = search_units(rich_db, {"per_page": 999})
    assert r["per_page"] == 50


def test_sort_by_code(rich_db):
    r = search_units(rich_db, {"sort": "code"})
    codes = _codes(r)
    assert codes == sorted(codes)


def test_facets(rich_db):
    r = search_units(rich_db, {})
    assert r["facets"]["level"]["delo"] == r["total"]
    assert r["facets"]["branch"]["ridder"] == 1
    assert r["facets"]["type"]["org"] == 1


def test_draft_review_archived_not_searchable(db):
    r = search_units(db, {})
    codes = _codes(r)
    for code in ("T-004", "T-005", "T-006"):
        assert code not in codes


def test_reindex_unit_only_published(db):
    reindex_unit(db, 4)  # T-004 — draft
    ids = [r["unit_id"] for r in db.execute("SELECT unit_id FROM catalog_fts").fetchall()]
    assert 4 not in ids


def test_empty_q_returns_variants_empty(rich_db):
    r = search_units(rich_db, {"q": "   "})
    assert r["query_variants"] == []
