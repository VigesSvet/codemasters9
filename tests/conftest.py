"""Фикстуры pytest для этапа 0 и будущих задач."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import db as dbmod
from backend.app.config import Settings
from backend.app.main import create_app
from backend.seed import load

ROOT = Path(__file__).resolve().parent.parent

_SEED_USERS = {
    "admin": ("admin", "Demo-2026!"),
    "moderator": ("moderator", "Demo-2026!"),
    "editor": ("editor", "Demo-2026!"),
    "branch_admin": ("ridder", "Demo-2026!"),
}


@pytest.fixture
def settings(tmp_path):
    return Settings(
        db_path=str(tmp_path / "archive.db"),
        files_dir=str(tmp_path / "files"),
        web_dir=str(ROOT / "web"),
    )


@pytest.fixture
def app(settings):
    return create_app(settings)


@pytest.fixture
def db(settings):
    conn = dbmod.connect(settings.db_path)
    dbmod.init_schema(conn)
    load.load_fixture(conn)
    yield conn
    conn.close()


@pytest.fixture
def client(app, db):
    with TestClient(app) as c:
        yield c


@pytest.fixture
def login(client):
    """Вход по роли. На этапе 0 /api/auth/login — 501, поэтому пока падает."""

    def _login(role: str):
        username, password = _SEED_USERS[role]
        return client.post(
            "/api/auth/login",
            json={"username": username, "password": password},
            headers={"X-Requested-With": "gos"},
        )

    return _login
