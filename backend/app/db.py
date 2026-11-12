"""Работа с SQLite: подключение, схема, зависимость FastAPI."""

from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from pathlib import Path
from typing import Any

from fastapi import Request

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def connect(path: str) -> sqlite3.Connection:
    """Открыть соединение SQLite с нужными прагмами (Row, WAL, foreign_keys)."""
    parent = Path(path).parent
    if str(parent) and not parent.exists():
        parent.mkdir(parents=True, exist_ok=True)
    # FastAPI выполняет sync-зависимости/хендлеры в threadpool: соединение создаётся
    # в одном потоке, а закрывается в другом -> check_same_thread=False.
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def init_schema(conn: sqlite3.Connection) -> None:
    """Применить schema.sql к соединению (идемпотентно)."""
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    _ensure_unit_description(conn)
    _relax_user_roles(conn)
    if "deleted_at" not in {r[1] for r in conn.execute("PRAGMA table_info(users)")}:
        conn.execute("ALTER TABLE users ADD COLUMN deleted_at TEXT NULL")
    conn.commit()
    from . import permissions

    permissions.seed_defaults(conn)
    permissions.reload(conn)


def _ensure_unit_description(conn: sqlite3.Connection) -> None:
    """Добавить units.description_ru/kk в базу, созданную до появления этих колонок."""
    have = {r[1] for r in conn.execute("PRAGMA table_info(units)")}
    for col in ("description_ru", "description_kk"):
        if col not in have:
            conn.execute(f"ALTER TABLE units ADD COLUMN {col} TEXT")


def _relax_user_roles(conn: sqlite3.Connection) -> None:
    """Старая БД: убрать CHECK по role в users (новые роли), пересоздав таблицу."""
    sql = conn.execute("SELECT sql FROM sqlite_master WHERE name = 'users'").fetchone()
    if not sql or "CHECK (role IN" not in sql[0]:
        return
    conn.commit()
    conn.execute("PRAGMA foreign_keys = OFF")
    conn.executescript(
        "CREATE TABLE users_new (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL,"
        " password_hash TEXT NOT NULL, role TEXT NOT NULL,"
        " branch_id INTEGER NULL REFERENCES branches(id), display_name TEXT,"
        " is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')));"
        "INSERT INTO users_new (id, username, password_hash, role, branch_id, display_name,"
        " is_active, created_at) SELECT id, username, password_hash, role, branch_id, display_name,"
        " is_active, created_at FROM users;"
        "DROP TABLE users; ALTER TABLE users_new RENAME TO users;"
    )
    conn.execute("PRAGMA foreign_keys = ON")


def get_db(request: Request) -> Iterator[sqlite3.Connection]:
    """FastAPI-зависимость: соединение из app.state.settings.db_path."""
    settings = request.app.state.settings
    conn = connect(settings.db_path)
    try:
        yield conn
    finally:
        conn.close()


def rows(cur: sqlite3.Cursor) -> list[dict[str, Any]]:
    cols = [d[0] for d in cur.description] if cur.description else []
    return [dict(zip(cols, r, strict=False)) for r in cur.fetchall()]


def fts5_available(conn: sqlite3.Connection) -> bool:
    """Проверить, что в сборке SQLite доступен модуль FTS5."""
    try:
        conn.execute("CREATE VIRTUAL TABLE IF NOT EXISTS __fts5_probe__ USING fts5(x)")
        conn.execute("DROP TABLE IF EXISTS __fts5_probe__")
        conn.commit()
        return True
    except sqlite3.OperationalError:
        return False
