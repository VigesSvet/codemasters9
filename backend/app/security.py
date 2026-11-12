"""Безопасность: scrypt, сессии, лимит попыток, CSRF, заголовки."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from .audit import log as audit_log
from .db import get_db

SCRYPT_N = 16384
SCRYPT_R = 8
SCRYPT_P = 1
SALT_BYTES = 16
SESSION_COOKIE = "gos_session"
DEFAULT_TTL_MIN = 30

CSP = (
    "default-src 'self'; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "frame-ancestors 'none'; "
    "form-action 'self'; "
    # карта филиалов: Leaflet с unpkg и тайлы OpenStreetMap; видео - встраивание YouTube
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org "
    "https://unpkg.com https://i.ytimg.com; "
    "style-src 'self' 'unsafe-inline' https://unpkg.com; "
    "script-src 'self' 'unsafe-inline' https://unpkg.com; "
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com; "
    "font-src 'self' data:; "
    "connect-src 'self' https://unpkg.com https://api.open-meteo.com https://nominatim.openstreetmap.org"
)
PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=()"


def now() -> datetime:
    """Текущее время в UTC (обёртка для monkeypatch в тестах)."""
    return datetime.now(UTC)


def hash_password(password: str) -> str:
    """Хеш пароля scrypt в формате scrypt$n$r$p$salt$hash."""
    salt = secrets.token_bytes(SALT_BYTES)
    dk = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P, dklen=32)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    dk_b64 = base64.b64encode(dk).decode("ascii")
    return f"scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${salt_b64}${dk_b64}"


def verify_password(password: str, password_hash: str) -> bool:
    """Сравнить пароль с сохранённым хешем (compare_digest)."""
    try:
        parts = password_hash.split("$")
        if len(parts) != 6 or parts[0] != "scrypt":
            return False
        _, n, r, p, salt_b64, hash_b64 = parts
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        dk = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=int(n),
            r=int(r),
            p=int(p),
            dklen=len(expected),
        )
        return hmac.compare_digest(dk, expected)
    except (ValueError, TypeError, OSError):
        return False


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def create_session(db, user_id: int, ttl_min: int = DEFAULT_TTL_MIN) -> str:
    """Создать сессию: в БД хранится sha256 токена; вернуть сам токен."""
    token = secrets.token_urlsafe(32)
    token_hash = _sha256(token)
    ts = now()
    expires = ts + timedelta(minutes=ttl_min)
    db.execute(
        "INSERT INTO sessions (token_hash, user_id, created_at, last_seen_at, expires_at) VALUES (?,?,?,?,?)",
        (token_hash, user_id, ts.isoformat(), ts.isoformat(), expires.isoformat()),
    )
    db.commit()
    return token


def _resolve_session(request: Request, db) -> dict[str, Any] | None:
    """Вернуть пользователя по cookie-сессии или None (просрочка/неактивность)."""
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    token_hash = _sha256(token)
    row = db.execute(
        "SELECT s.expires_at, u.id, u.username, u.role, u.branch_id, u.display_name, u.is_active"
        " FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
        (token_hash,),
    ).fetchone()
    if row is None:
        return None
    try:
        expires_at = datetime.fromisoformat(row["expires_at"])
    except (TypeError, ValueError):
        return None
    if now() >= expires_at:
        db.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
        db.commit()
        return None
    if not row["is_active"]:
        return None
    settings = request.app.state.settings
    ttl = timedelta(minutes=settings.session_ttl_min)
    new_expires = now() + ttl
    db.execute(
        "UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE token_hash = ?",
        (now().isoformat(), new_expires.isoformat(), token_hash),
    )
    db.commit()
    return {
        "id": row["id"],
        "username": row["username"],
        "role": row["role"],
        "branch_id": row["branch_id"],
        "display_name": row["display_name"],
    }


def get_current_user(request: Request, db: Annotated[Any, Depends(get_db)]) -> dict[str, Any] | None:
    """Зависимость: текущий пользователь (None если нет сессии)."""
    return _resolve_session(request, db)


def require_user():
    """Зависимость: требует авторизацию (401 иначе)."""

    def _dep(request: Request, db: Annotated[Any, Depends(get_db)]) -> dict[str, Any]:
        user = _resolve_session(request, db)
        if user is None:
            raise HTTPException(status_code=401, detail="Требуется вход")
        return user

    return _dep


def require_role(*roles: str):
    """Зависимость: требует одну из ролей (403 + audit denied иначе)."""

    def _dep(request: Request, db: Annotated[Any, Depends(get_db)]) -> dict[str, Any]:
        user = _resolve_session(request, db)
        if user is None:
            raise HTTPException(status_code=401, detail="Требуется вход")
        if user["role"] not in roles:
            ip = request.client.host if request.client else None
            audit_log(
                db,
                user,
                "access",
                "role",
                str(user["id"]),
                result="denied",
                details={"required": list(roles), "actual": user["role"]},
                ip=ip,
            )
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        return user

    return _dep


def detect_mime(data: bytes) -> str | None:
    """Определить MIME по сигнатуре байтов (pdf/jpeg/png/webp/tiff), иначе None."""
    if data.startswith(b"%PDF"):
        return "application/pdf"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    if data[:4] in (b"II*\x00", b"MM\x00*"):
        return "image/tiff"
    return None


def _apply_headers(response, path: str) -> None:
    response.headers["Content-Security-Policy"] = CSP
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Permissions-Policy"] = PERMISSIONS_POLICY
    if path.startswith("/admin") or path.startswith("/api/admin"):
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
        response.headers["Cache-Control"] = "no-store"


def install_security(app) -> None:
    """CSRF-проверка mutating /api/* и заголовки безопасности на всех ответах."""

    @app.middleware("http")
    async def _security_middleware(request: Request, call_next):
        path = request.url.path
        if request.method in {"POST", "PUT", "PATCH", "DELETE"} and path.startswith("/api/"):
            if request.headers.get("X-Requested-With") != "gos":
                resp = JSONResponse(
                    status_code=403,
                    content={"error": "csrf", "detail": "Требуется заголовок X-Requested-With: gos"},
                )
                _apply_headers(resp, path)
                return resp
        response = await call_next(request)
        _apply_headers(response, path)
        return response
