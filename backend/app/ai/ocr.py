"""OCR через локальную модель Ollama со зрением (tesseract не используется)."""

from __future__ import annotations

import base64

from .providers import _post_json

OCR_PROMPT = (
    "Распознай весь текст на изображении архивного документа. "
    "Верни только распознанный текст, сохраняя строки и орфографию оригинала, "
    "без комментариев. Неразборчивые места помечай [?]."
)
OCR_NOTE = "Распознано автоматически, требует проверки."


class OcrUnavailable(Exception):
    """Ollama недоступна или вернула пустой ответ."""


def recognize(settings, data: bytes) -> str:
    payload = {
        "model": settings.ollama_vision_model,
        "messages": [{"role": "user", "content": OCR_PROMPT, "images": [base64.b64encode(data).decode()]}],
        "stream": False,
        "think": False,
        "options": {"temperature": 0},
    }
    try:
        resp = _post_json(
            settings.ollama_base_url.rstrip("/") + "/api/chat",
            {"Content-Type": "application/json", "Accept": "application/json"},
            payload,
            max(settings.ollama_timeout, 300),
        )
    except Exception as exc:
        raise OcrUnavailable(str(exc)) from exc
    text = ((resp.get("message") or {}).get("content") or "").strip()
    if not text:
        raise OcrUnavailable("пустой ответ модели")
    return text
