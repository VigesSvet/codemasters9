"""Выбор провайдера ИИ: local по умолчанию, anthropic только по ключу."""

from __future__ import annotations

import os

from . import local


class LocalProvider:
    """Локальный компоновщик (шаблоны + ретривер). Сеть не используется."""

    name = "local-demo"

    def answer(self, q, hits, lang):
        return local.compose(q, hits, lang)


class AnthropicProvider:
    """Внешний провайдер (ленивый импорт SDK). Наружу — только вопрос и открытые фрагменты."""

    name = "anthropic"

    def __init__(self, api_key):
        self.api_key = api_key

    def answer(self, q, hits, lang):
        import anthropic  # ленивый импорт

        client = anthropic.Anthropic(api_key=self.api_key)
        open_fragments = [
            h.get("snippet") for h in hits if h.get("type") == "unit" and h.get("has_public_file")
        ]
        prompt = (
            "Ответь кратко на русском по открытым материалам архива. "
            "Если данных нет, скажи прямо.\n\nВопрос: "
            + q
            + "\n\nОткрытые материалы:\n"
            + "\n".join(open_fragments)
        )
        msg = client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = (msg.content[0].text if msg.content else "") if msg else ""
        mode = "source" if hits else "no_data"
        return {
            "mode": mode,
            "answer": text.strip(),
            "sources": local.build_sources(hits, lang),
            "generated": True,
            "provider": "anthropic",
            "disclaimer": local.DISCLAIMER.get(lang, local.DISCLAIMER["ru"]),
        }


def get_provider(settings):
    """Вернуть провайдера по settings.ai_provider. Без ключа для anthropic — None."""
    if settings.ai_provider == "anthropic":
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if api_key:
            return AnthropicProvider(api_key)
        return None
    return LocalProvider()
