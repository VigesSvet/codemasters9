"""Тесты полной демо-загрузки load_all на временной БД.

Проверяем не только количество записей, но и что повторный запуск ничего
не дублирует (идемпотентность) и что нормализация/синонимы поиска
находят запись по старому названию города («лениногорск» -> «риддер»).
"""

from __future__ import annotations

from pathlib import Path

from backend.app import db as dbmod
from backend.app.config import Settings
from backend.app.search import search_units
from backend.seed import load

ROOT = Path(__file__).resolve().parent.parent


def _settings(tmp_path) -> Settings:
    """Настройки, изолирующие тест: БД и файлы в tmp, статика — реальная web/."""
    return Settings(
        db_path=str(tmp_path / "archive.db"),
        files_dir=str(tmp_path / "files"),
        web_dir=str(ROOT / "web"),
    )


def _load(tmp_path, monkeypatch) -> tuple[dbmod.sqlite3.Connection, dict]:
    settings = _settings(tmp_path)
    # load_all() вызывает get_settings() внутри — подменяем на тестовые настройки.
    monkeypatch.setattr(load, "get_settings", lambda: settings)
    conn = dbmod.connect(settings.db_path)
    dbmod.init_schema(conn)
    summary = load.load_all(conn)
    return conn, summary


def test_load_all_counts(tmp_path, monkeypatch):
    conn, summary = _load(tmp_path, monkeypatch)
    try:
        assert summary["branches"] == 13
        assert summary["personal_funds"] >= 80
        assert summary["news"] > 0
        assert summary["units"] > 0
        assert summary["files"] > 0
        assert summary["users"] >= 4
    finally:
        conn.close()


def test_load_all_idempotent(tmp_path, monkeypatch):
    conn, first = _load(tmp_path, monkeypatch)
    try:
        second = load.load_all(conn)
        assert first == second
    finally:
        conn.close()


def test_search_leninogorsk_finds_record(tmp_path, monkeypatch):
    conn, _summary = _load(tmp_path, monkeypatch)
    try:
        result = search_units(conn, {"q": "Лениногорск"})
        assert result["total"] >= 1
        # «лениногорск» развёрнут синонимом «риддер»
        assert "риддер" in result["query_variants"]
    finally:
        conn.close()
