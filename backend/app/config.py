"""Настройки приложения из переменных окружения."""

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


# демо-пароль seed - только для стенда; вход с ним помечается флагом password_is_default(SEC-08)
DEMO_PASSWORD = "Demo-2026!"


@dataclass
class Settings:
    db_path: str = field(default_factory=lambda: os.environ.get("DB_PATH", "backend/data/archive.db"))
    web_dir: str = field(default_factory=lambda: os.environ.get("WEB_DIR", "web"))
    files_dir: str = field(default_factory=lambda: os.environ.get("FILES_DIR", "backend/data/files"))
    ai_provider: str = field(default_factory=lambda: os.environ.get("AI_PROVIDER", "local"))
    # модель и адрес DeepSeek; ключ(DEEPSEEK_API_KEY) читается только из окружения
    deepseek_model: str = field(default_factory=lambda: os.environ.get("DEEPSEEK_MODEL", "deepseek-chat"))
    deepseek_base_url: str = field(
        default_factory=lambda: os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    )
    # локальная LLM через Ollama на сервере архива - данные не покидают сервер
    ollama_base_url: str = field(
        default_factory=lambda: os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    )
    ollama_model: str = field(default_factory=lambda: os.environ.get("OLLAMA_MODEL", "gemma4:26b"))
    ollama_vision_model: str = field(
        default_factory=lambda: os.environ.get("OLLAMA_VISION_MODEL", "gemma4:26b")
    )
    ollama_timeout: int = field(default_factory=lambda: _env_int("OLLAMA_TIMEOUT", 60))
    session_ttl_min: int = field(default_factory=lambda: _env_int("SESSION_TTL_MIN", 30))
    login_max_attempts: int = field(default_factory=lambda: _env_int("LOGIN_MAX_ATTEMPTS", 5))
    login_window_min: int = field(default_factory=lambda: _env_int("LOGIN_WINDOW_MIN", 10))
    # счётчик по одному IP на все логины(SEC-05) - перебор имён с одного адреса
    login_ip_max_attempts: int = field(default_factory=lambda: _env_int("LOGIN_IP_MAX_ATTEMPTS", 30))
    cookie_secure: bool = field(default_factory=lambda: _env_bool("COOKIE_SECURE", False))
    # Swagger и схема OpenAPI раскрывают всю поверхность API - на проде выключены(SEC-11)
    api_docs: bool = field(default_factory=lambda: _env_bool("API_DOCS", False))


def get_settings() -> Settings:
    return Settings()
