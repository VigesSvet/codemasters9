"""Компоновщик локального ответа ИИ: шаблоны ru/kk/en, режимы source/no_data/restricted."""

from __future__ import annotations

from .. import textnorm

DISCLAIMER = {
    "ru": "Ответ сформирован автоматически по открытым материалам архива, проверьте по источнику.",
    "kk": ("Жауап мұрағаттың ашық материалдары бойынша автоматты түрде құрылды; дереккөзден тексеріңіз."),
    "en": (
        "This answer was generated automatically from the archive's open materials; "
        "please verify against the source."
    ),
}

# Интенты о персональных данных (уже в нормализованном виде — textnorm.norm).
_RESTRICTED_INTENTS = (
    "личное дело",
    "личные данные",
    "личных данных",
    "личных дел",
    "персональн",
    "паспорт",
    "иин",
    "жсн",
    "адрес проживания",
    "адреса проживания",
    "судимост",
    "медицинск",
    "усыновлен",
    "усыновление",
    "жеке ис",
    "жеке дерек",
    "толкужат",
    "тургылыкты мекенжай",
    "соттылык",
    "медицина",
    "асырап алу",
    "personal file",
    "personal data",
    "passport",
    "residence address",
    "address of residence",
    "criminal record",
    "medical",
    "adoption",
)

# Интенты про скачивание/копию файла.
_DOWNLOAD_INTENTS = (
    "скачать",
    "скачивание",
    "скачивания",
    "копию",
    "копия",
    "копии",
    "файл",
    "download",
    "copy",
    "жуктеу",
    "кошірме",
    "коширме",
)


def _mode_text(lang, texts):
    return texts.get(lang) or texts["ru"]


_RESTRICTED_ANSWER = {
    "ru": (
        "Такие сведения выдаются только по запросу в читальном зале архива или через "
        "государственную услугу (eGov). В открытых материалах сайта они не публикуются."
    ),
    "kk": (
        "Мұндай мәліметтер тек мұрағаттың оқу залында немесе мемлекеттік қызмет (eGov) "
        "арқылы сұрау бойынша беріледі. Сайттың ашық материалдарында жарияланбайды."
    ),
    "en": (
        "Such information is provided only upon request in the archive reading room or via "
        "the government e-service (eGov). It is not published in the open materials of the site."
    ),
}

_NO_DATA_ANSWER = {
    "ru": (
        "В открытых материалах архива ответа на ваш вопрос нет. Обратитесь в читальный зал "
        "архива или через государственную услугу (eGov)."
    ),
    "kk": (
        "Мұрағаттың ашық материалдарында сұрағыңызға жауап жоқ. Мұрағаттың оқу залына немесе "
        "мемлекеттік қызмет (eGov) арқылы жүгініңіз."
    ),
    "en": (
        "There is no answer to your question in the archive's open materials. Please contact "
        "the archive reading room or use the government e-service (eGov)."
    ),
}


def build_sources(hits, lang):
    """Хиты ретривера -> список источников AiSource."""
    sources = []
    for h in hits:
        sources.append(
            {
                "type": h.get("type") or "unit",
                "id": h.get("id"),
                "code": h.get("code") or "",
                "title": h.get("title") or "",
                "url": h.get("url") or "",
            }
        )
    return sources


def _source_answer(hits, lang):
    titles = [h.get("title") for h in hits if h.get("title")]
    joined = "; ".join(titles)
    if lang == "kk":
        return (
            "Сұрау бойынша мұрағаттың ашық материалдарында "
            + str(len(hits))
            + " жазба табылды: "
            + joined
            + ". Дереккөздер төменде берілген."
        )
    if lang == "en":
        return (
            "Found "
            + str(len(hits))
            + " record(s) in the archive's open materials: "
            + joined
            + ". Sources are listed below."
        )
    return (
        "По вашему запросу в открытых материалах архива найдено записей: "
        + str(len(hits))
        + ". "
        + joined
        + " Источники приведены ниже."
    )


def _result(mode, answer, sources, lang):
    return {
        "mode": mode,
        "answer": answer,
        "sources": sources,
        "generated": True,
        "provider": "local-demo",
        "disclaimer": _mode_text(lang, DISCLAIMER),
    }


def compose(q, hits, lang):
    """Собрать ответ по шаблону ru/kk/en по хиту ретривера."""
    lang = lang if lang in ("ru", "kk", "en") else "ru"
    nq = textnorm.norm(q)
    units = [h for h in hits if h.get("type") == "unit"]

    # Запрос о персональных данных.
    if any(t in nq for t in _RESTRICTED_INTENTS):
        return _result("restricted", _mode_text(lang, _RESTRICTED_ANSWER), [], lang)

    # Все найденные единицы закрыты + вопрос про скачивание/копию.
    if units and all(not h.get("has_public_file") for h in units) and any(t in nq for t in _DOWNLOAD_INTENTS):
        return _result("restricted", _mode_text(lang, _RESTRICTED_ANSWER), [], lang)

    if not hits:
        return _result("no_data", _mode_text(lang, _NO_DATA_ANSWER), [], lang)

    return _result("source", _source_answer(hits, lang), build_sources(hits, lang), lang)
