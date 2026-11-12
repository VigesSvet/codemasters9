"""Админ-эндпоинты (кроме импорта — см. imports.py). Заглушки этапа 0."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..models import Transition

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/units")
def list_units(status: str | None = None, branch: str | None = None, q: str | None = None, page: int = 1):
    raise HTTPException(status_code=501, detail="not implemented")


@router.post("/units")
def create_unit(body: dict):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/units/{unit_id}")
def get_unit(unit_id: int):
    raise HTTPException(status_code=501, detail="not implemented")


@router.put("/units/{unit_id}")
def update_unit(unit_id: int, body: dict):
    raise HTTPException(status_code=501, detail="not implemented")


@router.delete("/units/{unit_id}")
def delete_unit(unit_id: int):
    raise HTTPException(status_code=501, detail="not implemented")


@router.post("/units/{unit_id}/transition")
def transition_unit(unit_id: int, body: Transition):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/units/{unit_id}/versions")
def unit_versions(unit_id: int):
    raise HTTPException(status_code=501, detail="not implemented")


@router.post("/units/{unit_id}/files")
def upload_unit_file(unit_id: int, file: Annotated[UploadFile, File()]):
    raise HTTPException(status_code=501, detail="not implemented")


@router.put("/files/{file_id}/access")
def set_file_access(file_id: int, body: dict):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/branches")
def list_branches():
    raise HTTPException(status_code=501, detail="not implemented")


@router.put("/branches/{branch_id}")
def update_branch(branch_id: int, body: dict):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/audit")
def list_audit(
    user: str | None = None,
    action: str | None = None,
    object_type: str | None = None,
    result: str | None = None,
    page: int = 1,
):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/export.csv")
def export_csv(status: str = "published"):
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/users")
def list_users():
    raise HTTPException(status_code=501, detail="not implemented")


@router.post("/users")
def create_user(body: dict):
    raise HTTPException(status_code=501, detail="not implemented")
