"""Тесты полной демо-загрузки load_all: счётчики, идемпотентность, синонимы поиска."""

from __future__ import annotations

from pathlib import Path

from backend.app import db as dbmod
from backend.app.config import Settings
from backend.app.search import search_units
from backend.seed import load

ROOT = Path(__file__).resolve().parent.parent


def _settings(tmp_path) -> Settings:
    """Настройки, изолирующие тест: БД и файлы в tmp, статика - реальная web/."""
    return Settings(
        db_path=str(tmp_path / "archive.db"),
        files_dir=str(tmp_path / "files"),
        web_dir=str(ROOT / "web"),
    )


def _load(tmp_path, monkeypatch) -> tuple[dbmod.sqlite3.Connection, dict]:
    settings = _settings(tmp_path)
    # load_all() вызывает get_settings() внутри - подменяем на тестовые настройки
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


def test_showcase_delo_has_public_file_and_description(tmp_path, monkeypatch):
    """Витринное дело id 83: публичный скан и непустое описание на карточке."""
    from backend.app.routers.catalog import get_unit

    conn, _summary = _load(tmp_path, monkeypatch)
    try:
        row = conn.execute(
            "SELECT id FROM units WHERE code = ?",
            ("Ф. 1-П, оп. 1, д. 245",),
        ).fetchone()
        assert row is not None
        assert row["id"] == 83

        files = conn.execute(
            "SELECT filename, access FROM files WHERE unit_id = ?",
            (row["id"],),
        ).fetchall()
        public = [f for f in files if f["access"] == "public"]
        assert public, "у витринного дела должен быть публичный файл"
        assert any("obzor-semipalatinskoy-oblasti-1893" in f["filename"] for f in public)

        detail = get_unit(row["id"], conn)
        desc = detail["description"]
        assert desc["ru"].strip(), "описание не должно быть пустым"
        assert desc["kk"].strip(), "казахское описание не должно быть пустым"
    finally:
        conn.close()


def test_delo_does_not_inherit_foreign_description(tmp_path, monkeypatch):
    """Соседнее дело того же фонда не показывает аннотацию витринного дела."""
    from backend.app.routers.catalog import get_unit

    conn, _summary = _load(tmp_path, monkeypatch)
    try:
        ids = {
            code: conn.execute("SELECT id FROM units WHERE code = ?", (code,)).fetchone()["id"]
            for code in ("Ф. 1-П", "Ф. 1-П, оп. 1, д. 245", "Ф. 1-П, оп. 1, д. 244")
        }
        assert ids["Ф. 1-П, оп. 1, д. 244"] == 84

        showcase = get_unit(ids["Ф. 1-П, оп. 1, д. 245"], conn)["description"]
        neighbour = get_unit(ids["Ф. 1-П, оп. 1, д. 244"], conn)["description"]
        fond = get_unit(ids["Ф. 1-П"], conn)["description"]

        assert "1893" in showcase["ru"]
        assert neighbour == {"ru": "", "kk": "", "en": ""}
        # запись уровня «фонд» показывает описание фонда, а не аннотацию одного дела
        assert fond["ru"].strip()
        assert "1893" not in fond["ru"]
    finally:
        conn.close()


def test_schema_upgrade_adds_unit_description(tmp_path):
    """База, созданная до появления описания у дел, дополняется колонками при запуске."""
    conn = dbmod.connect(str(tmp_path / "old.db"))
    try:
        dbmod.init_schema(conn)
        conn.execute("ALTER TABLE units DROP COLUMN description_ru")
        conn.execute("ALTER TABLE units DROP COLUMN description_kk")
        conn.commit()
        dbmod.init_schema(conn)
        cols = {r[1] for r in conn.execute("PRAGMA table_info(units)")}
        assert {"description_ru", "description_kk"} <= cols
    finally:
        conn.close()
