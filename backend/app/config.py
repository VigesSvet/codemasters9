"""Настройки приложения из переменных окружения (этап 0)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


def _env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on", "y"}


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None or raw.strip() == "":
        return default
    return int(raw)


@dataclass
class Settings:
    db_path: str = field(default_factory=lambda: os.environ.get("DB_PATH", "backend/data/archive.db"))
    web_dir: str = field(default_factory=lambda: os.environ.get("WEB_DIR", "web"))
    files_dir: str = field(default_factory=lambda: os.environ.get("FILES_DIR", "backend/data/files"))
    ai_provider: str = field(default_factory=lambda: os.environ.get("AI_PROVIDER", "local"))
    session_ttl_min: int = field(default_factory=lambda: _env_int("SESSION_TTL_MIN", 30))
    login_max_attempts: int = field(default_factory=lambda: _env_int("LOGIN_MAX_ATTEMPTS", 5))
    login_window_min: int = field(default_factory=lambda: _env_int("LOGIN_WINDOW_MIN", 10))
    cookie_secure: bool = field(default_factory=lambda: _env_bool("COOKIE_SECURE", False))


def get_settings() -> Settings:
    """Собрать настройки из окружения."""
    return Settings()
