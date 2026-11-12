"""Журналы для аналитики: search_log и ai_log. Без IP, без текста ответов."""

from __future__ import annotations

import sqlite3

MAX_QUERY = 200


def log_search(db, q, total) -> None:
    q = " ".join((q or "").split())[:MAX_QUERY].lower()
    if not q:
        return
    try:
        db.execute("INSERT INTO search_log (query, results) VALUES (?,?)", (q, int(total or 0)))
        db.commit()
    except sqlite3.Error:
        pass  # журнал не должен ронять поиск


def log_ai(db, mode, provider) -> None:
    try:
        db.execute("INSERT INTO ai_log (mode, provider) VALUES (?,?)", (mode or "unknown", provider))
        db.commit()
    except sqlite3.Error:
        pass
