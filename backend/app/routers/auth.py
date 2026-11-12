"""Аутентификация по cookie-сессии: login/logout/me."""

from __future__ import annotations

from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from .. import audit, security
from ..config import DEMO_PASSWORD
from ..db import get_db
from ..models import LoginRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _ip(request: Request) -> str | None:
    return request.client.host if request.client else None


def _user_dict(row) -> dict:
    return {
        "id": row["id"],
        "username": row["username"],
        "role": row["role"],
        "branch_id": row["branch_id"],
        "display_name": row["display_name"],
    }


@router.post("/login")
def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: Annotated[Any, Depends(get_db)],
):
    settings = request.app.state.settings
    username = body.username
    password = body.password
    ip = _ip(request)

    ts = security.now()
    # журнал попыток нужен только за окно лимита - старые строки не копятся(SEC-05)
    db.execute("DELETE FROM login_attempts WHERE ts < ?", ((ts - timedelta(days=1)).isoformat(),))
    window_start = (ts - timedelta(minutes=settings.login_window_min)).isoformat()
    failures = db.execute(
        "SELECT COUNT(*) AS n FROM login_attempts WHERE username = ? AND ip = ? AND ok = 0 AND ts >= ?",
        (username, ip, window_start),
    ).fetchone()["n"]
    # второй счётчик - по IP на все логины: перебор имён с одного адреса упирается в 429
    ip_failures = db.execute(
        "SELECT COUNT(*) AS n FROM login_attempts WHERE ip IS ? AND ok = 0 AND ts >= ?",
        (ip, window_start),
    ).fetchone()["n"]
    if failures >= settings.login_max_attempts or ip_failures >= settings.login_ip_max_attempts:
        db.commit()
        audit.log(db, None, "login", "auth", username, result="denied", details={"reason": "limit"}, ip=ip)
        raise HTTPException(status_code=429, detail="Слишком много попыток входа")

    row = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if row is None:
        # scrypt и для неизвестного логина - по времени ответа не видно, есть ли пользователь
        security.burn_password_check(password)
        ok = False
    else:
        ok = bool(row["is_active"]) and security.verify_password(password, row["password_hash"])

    db.execute(
        "INSERT INTO login_attempts (username, ip, ts, ok) VALUES (?,?,?,?)",
        (username, ip, ts.isoformat(), 1 if ok else 0),
    )
    db.commit()

    if not ok:
        audit.log(db, None, "login", "auth", username, result="denied", ip=ip)
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")

    token = security.create_session(db, row["id"], settings.session_ttl_min)
    response.set_cookie(
        key=security.SESSION_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=settings.session_ttl_min * 60,
        path="/",
    )
    audit.log(db, _user_dict(row), "login", "auth", username, result="ok", ip=ip)
    return {"user": _user_dict(row), "password_is_default": password == DEMO_PASSWORD}


@router.post("/logout")
def logout(request: Request, response: Response, db: Annotated[Any, Depends(get_db)]):
    token = request.cookies.get(security.SESSION_COOKIE)
    if token:
        db.execute("DELETE FROM sessions WHERE token_hash = ?", (security._sha256(token),))
        db.commit()
    response.delete_cookie(security.SESSION_COOKIE, path="/")
    return {"ok": True}


@router.get("/me")
def me(request: Request, db: Annotated[Any, Depends(get_db)]):
    user = security._resolve_session(request, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Требуется вход")
    row = db.execute("SELECT password_hash FROM users WHERE id = ?", (user["id"],)).fetchone()
    is_default = row is not None and security.is_default_password(row["password_hash"], DEMO_PASSWORD)
    return {"user": user, "password_is_default": is_default}
