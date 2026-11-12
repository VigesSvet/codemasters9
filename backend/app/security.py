"""Безопасность: scrypt, сессии, лимит попыток, CSRF, заголовки. Заглушки этапа 0."""

from __future__ import annotations


def hash_password(password: str) -> str:
    """Хеш пароля (scrypt). Заглушка этапа 0."""
    raise NotImplementedError


def verify_password(password: str, password_hash: str) -> bool:
    """Проверка пароля. Заглушка этапа 0."""
    raise NotImplementedError


def create_session(db, user_id: int) -> str:
    """Создать сессию и вернуть токен. Заглушка этапа 0."""
    raise NotImplementedError


def get_current_user(request, db):
    """FastAPI-зависимость: текущий пользователь из cookie-сессии. Заглушка -> None."""
    return None


def require_user():
    """Зависимость: требует авторизацию. Заглушка этапа 0."""

    def _dep() -> None:
        return None

    return _dep


def require_role(*roles):
    """Зависимость: требует одну из ролей. Заглушка этапа 0."""

    def _dep() -> None:
        return None

    return _dep


def install_security(app) -> None:
    """CSP/заголовки/лимит попыток/CSRF — реализация в T2. Заглушка: ничего не делает."""
    return None
