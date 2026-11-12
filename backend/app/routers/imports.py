"""Импорт CSV/XLSX. Заглушки этапа 0."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/api/admin/import", tags=["imports"])


@router.post("/preview")
def import_preview(file: Annotated[UploadFile, File()], mapping: Annotated[str | None, Form()] = None):
    raise HTTPException(status_code=501, detail="not implemented")


@router.post("/{job_id}/apply")
def import_apply(job_id: str, body: dict):
    raise HTTPException(status_code=501, detail="not implemented")
