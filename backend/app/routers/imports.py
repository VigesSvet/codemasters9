"""Импорт CSV/XLSX: предпросмотр и применение (проверка прав на сервере)."""

from __future__ import annotations

import json
import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from .. import db as dbmod
from .. import importer, permissions, security
from ..models import ImportPreview, ImportResult

router = APIRouter(prefix="/api/admin/import", tags=["imports"])

MAX_FILE_BYTES = 5 * 1024 * 1024


def _require_import(action: str):
    """Зависимость: текущий пользователь с правом на действие импорта."""

    def _dep(user: Annotated[dict | None, Depends(security.get_current_user)]) -> dict:
        if not permissions.can(user, action, None):
            raise HTTPException(status_code=403, detail="нет прав на операцию импорта")
        return user

    return _dep


def _parse_mapping(raw):
    if not raw:
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="mapping должен быть валидным JSON-объектом") from None
    if not isinstance(data, dict):
        raise HTTPException(status_code=422, detail="mapping должен быть JSON-объектом")
    return data


@router.post("/preview", response_model=ImportPreview)
def import_preview(
    file: Annotated[UploadFile, File()],
    mapping: Annotated[str | None, Form()] = None,
    user: Annotated[dict, Depends(_require_import("import.preview"))] = None,
    db: Annotated[sqlite3.Connection, Depends(dbmod.get_db)] = None,
):
    content = file.file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="файл слишком большой (максимум 5 МБ)")
    mapping_dict = _parse_mapping(mapping)
    try:
        result = importer.preview(db, user, file.filename or "", content, mapping_dict)
    except importer.ImporterError as e:
        raise HTTPException(status_code=422, detail=str(e)) from None
    return result


@router.post("/{job_id}/apply", response_model=ImportResult)
def import_apply(
    job_id: str,
    body: dict,
    user: Annotated[dict, Depends(_require_import("import.apply"))] = None,
    db: Annotated[sqlite3.Connection, Depends(dbmod.get_db)] = None,
):
    mapping = body.get("mapping") if isinstance(body, dict) else None
    try:
        result = importer.apply(db, user, job_id, mapping)
    except importer.ImporterError as e:
        raise HTTPException(status_code=404, detail=str(e)) from None
    return result
