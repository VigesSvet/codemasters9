"""Загрузка демо-данных: load_fixture (для тестов) и load_all (заглушка)."""

from __future__ import annotations

import os
import sqlite3

DEFAULT_SEED_PASSWORD = "Demo-2026!"


def _seed_password() -> str:
    return os.environ.get("SEED_PASSWORD", DEFAULT_SEED_PASSWORD)


def _placeholder_hash(password: str) -> str:
    """Заглушка-хеш до реализации scrypt в T2 (security.hash_password)."""
    return "stub$" + password


def load_fixture(db: sqlite3.Connection) -> None:
    """Минимальный набор данных для тестов: 3 филиала, 2 фонда, 6 units, 4 пользователя."""
    branches = [
        ("uka-main", "main", "ГАВКО, Усть-Каменогорск", "ШҚО МА, Өскемен", "SAEK, Ust-Kamenogorsk"),
        ("ridder", "branch", "Риддерский филиал", "Риддер филиалы", "Ridder branch"),
        ("zaisan", "branch", "Зайсанский филиал", "Зайсан филиалы", "Zaisan branch"),
    ]
    for slug, kind, ru, kk, en in branches:
        db.execute(
            "INSERT INTO branches (slug, kind, name_ru, name_kk, name_en) VALUES (?,?,?,?,?)",
            (slug, kind, ru, kk, en),
        )

    db.execute(
        "INSERT INTO fonds (code, kind, title_ru, title_kk, title_en, branch_id, is_demo)"
        " VALUES ('1-П','print','Фонд 1-П','Фонд 1-П','Fonds 1-П',1,1)"
    )
    db.execute(
        "INSERT INTO fonds (code, kind, title_ru, title_kk, title_en, branch_id, is_demo)"
        " VALUES ('18','org','Фонд 18','Фонд 18','Fonds 18',1,1)"
    )

    ridder_id = db.execute("SELECT id FROM branches WHERE slug='ridder'").fetchone()["id"]

    units = [
        # (code, level, pub_status, access)
        ("T-001", "delo", "published", "public"),
        ("T-002", "delo", "published", "no_publish"),
        ("T-003", "delo", "published", "needs_check"),
        ("T-004", "delo", "draft", None),
        ("T-005", "delo", "review", None),
        ("T-006", "delo", "archived", None),
    ]
    for code, level, pub_status, access in units:
        cur = db.execute(
            "INSERT INTO units"
            " (fond_id, level, code, title_ru, title_kk, title_en, branch_id, pub_status, is_demo)"
            " VALUES (?,?,?,?,?,?,?,?,1)",
            (1, level, code, f"Единица {code}", f"Бірлік {code}", f"Unit {code}", 1, pub_status),
        )
        unit_id = cur.lastrowid
        if access is not None:
            db.execute(
                "INSERT INTO files (unit_id, filename, mime, size, kind, access) VALUES (?,?,?,?,?,?)",
                (unit_id, f"{code}.pdf", "application/pdf", 1234, "view", access),
            )

    users = [
        ("admin", "admin", None, "Администратор"),
        ("moderator", "moderator", None, "Модератор"),
        ("editor", "editor", None, "Редактор"),
        ("ridder", "branch_admin", ridder_id, "Администратор филиала Риддер"),
    ]
    password = _seed_password()
    for username, role, branch_id, display_name in users:
        db.execute(
            "INSERT INTO users (username, password_hash, role, branch_id, display_name) VALUES (?,?,?,?,?)",
            (username, _placeholder_hash(password), role, branch_id, display_name),
        )

    db.commit()


def load_all(db: sqlite3.Connection) -> None:
    """Полная загрузка демо-данных (demo_units.json + users.json). Заглушка этапа 0."""
    return None
