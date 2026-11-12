"""Аутентификация по cookie-сессии. Заглушки этапа 0."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..models import LoginRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(body: LoginRequest):
    raise HTTPException(status_code=501, detail="not implemented")


@router.post("/logout")
def logout():
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/me")
def me():
    raise HTTPException(status_code=501, detail="not implemented")
