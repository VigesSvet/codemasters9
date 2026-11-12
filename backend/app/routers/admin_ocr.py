"""OCR для сотрудников (ТЗ 5.8 Г): черновой текст, публикации нет."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile

from .. import audit, permissions, security
from ..ai import ocr
from ..db import get_db

router = APIRouter(prefix="/api/admin", tags=["ocr"])

MAX_SIZE = 20 * 1024 * 1024
IMAGE_MIMES = ("image/jpeg", "image/png")
UNIT_FIELD = "description_ru"


def _deny(db, user, request, action, oid):
    audit.log(db, user, action, "ocr", str(oid), result="denied", ip=_ip(request))
    raise HTTPException(status_code=403, detail="Недостаточно прав")


def _ip(request):
    return request.client.host if request.client else None


@router.post("/ocr")
def run_ocr(
    request: Request,
    db: Annotated[Any, Depends(get_db)],
    user: Annotated[Any, Depends(security.require_user())],
    file: Annotated[UploadFile | None, File()] = None,
    file_id: Annotated[int | None, Form()] = None,
    unit_id: Annotated[int | None, Form()] = None,
    save_draft: Annotated[bool, Form()] = False,
):
    if not permissions.can(user, "ocr.use"):
        _deny(db, user, request, "ocr.use", unit_id or "")
    settings = request.app.state.settings
    unit = None
    if file is not None:
        data = file.file.read(MAX_SIZE + 1)
        source = {"upload": file.filename}
    elif file_id is not None:
        row = db.execute("SELECT * FROM files WHERE id = ?", (file_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Файл не найден")
        path = Path(settings.files_dir) / row["filename"]
        if not path.is_file():
            raise HTTPException(status_code=404, detail="Файл не найден")
        data = path.read_bytes()[: MAX_SIZE + 1]
        source = {"file_id": file_id}
        unit_id = unit_id or row["unit_id"]
    else:
        raise HTTPException(status_code=422, detail="Нужен файл или file_id")
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="Файл больше 20 МБ")
    if security.detect_mime(data) not in IMAGE_MIMES:
        raise HTTPException(status_code=422, detail="Поддерживаются только jpg и png")

    if save_draft:
        if unit_id is None:
            raise HTTPException(status_code=422, detail="Для сохранения нужен unit_id")
        unit = db.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
        if unit is None:
            raise HTTPException(status_code=404, detail="Единица не найдена")
        if unit["pub_status"] != "draft" or not permissions.can(user, "unit.edit", unit):
            raise HTTPException(status_code=409, detail="Сохранять можно только в черновик единицы")

    try:
        text = ocr.recognize(settings, data)
    except ocr.OcrUnavailable as exc:
        audit.log(db, user, "ocr.run", "ocr", str(unit_id or ""), result="error", ip=_ip(request))
        raise HTTPException(
            status_code=503, detail="Сервис распознавания (Ollama) недоступен. Попробуйте позже."
        ) from exc

    saved = False
    if unit is not None:
        old = unit[UNIT_FIELD] or ""
        new = (old + "\n\n" if old else "") + "[" + ocr.OCR_NOTE + "]\n" + text
        db.execute(f"UPDATE units SET {UNIT_FIELD} = ? WHERE id = ?", (new, unit["id"]))
        db.commit()
        saved = True
    audit.log(
        db,
        user,
        "ocr.run",
        "ocr",
        str(unit_id or ""),
        details={**source, "chars": len(text), "saved_draft": saved},
        ip=_ip(request),
    )
    return {"text": text, "note": ocr.OCR_NOTE, "saved_draft": saved, "unit_id": unit_id}
