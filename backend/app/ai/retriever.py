"""Ретривер локального ИИ: поиск фрагментов по catalog_fts + news + branches."""

from __future__ import annotations

import re
import sqlite3

from .. import textnorm

_WORD_RE = re.compile(r"[0-9a-zа-яё]+")

# внутренние метки <<<...>>> - не термины поиска (защита от подделки границ фрагмента)
_MARKER_RE = re.compile(r"<<<.*?>>>")

# сколько единиц брать из FTS до фильтра релевантности - с запасом, чтобы не потерять нужное
_CANDIDATE_FACTOR = 4


def _pick(ru, kk, en, lang):
    """Заголовок на нужном языке с фолбэком на ru."""
    if lang == "kk" and kk:
        return kk
    if lang == "en" and en:
        return en
    return ru or kk or en or ""


def _fts_terms(q):
    """Термы для FTS: значимые слова запроса + их синонимы-основы (для морфологии)."""
    terms = set()
    for t in textnorm.significant_tokens(q):
        for alt in textnorm.token_alternatives(t):
            terms.update(alt)
    return terms


def _fts_query(q):
    """Собрать FTS5-запрос: значимые токены с префиксом через OR (короткие и стоп-слова уже отсеяны)."""
    terms = _fts_terms(q)
    if not terms:
        return ""
    return " OR ".join(t + "*" for t in sorted(terms))


def _word_matches(word, token):
    """Слово из текста совпало со значимым словом, если одно - префикс другого (падежные окончания)."""
    short, long_ = (word, token) if len(word) <= len(token) else (token, word)
    if len(short) < 4:
        return False
    return long_.startswith(short)


def _token_matches(token, words):
    """Совпал ли значимый токен (с синонимами) хотя бы с одним словом текста хите."""
    for alt in textnorm.token_alternatives(token):
        if all(any(_word_matches(w, t) for w in words) for t in alt):
            return True
    return False


def _matched_count(sig, text):
    """Сколько значимых слов запроса совпало с нормализованным текстом хите."""
    words = _WORD_RE.findall(text or "")
    return sum(1 for t in sig if _token_matches(t, words))


def _relevant(sig, text):
    """Хит релевантен, если совпало больше половины значимых слов запроса.

    Порог строго "больше половины": при двух значимых словах нужны оба, иначе одно
    общее слово ("курс" в "курс доллара") тянет посторонние новости/дела. Абсолютный
    bm25 не подходит - он зависит от размера корпуса и не даёт стабильного отсечения.
    """
    if not sig:
        return False
    matched = _matched_count(sig, text)
    if matched < 1:
        return False
    return matched * 2 > len(sig)


def _unit_hits(db, match, sig, lang, k):
    cur = db.execute(
        "SELECT u.id, u.code, u.title_ru, u.title_kk, u.title_en,"
        " f.title AS fts_title, f.code AS fts_code, f.keywords AS fts_keywords,"
        " f.author AS fts_author, f.place AS fts_place,"
        " bm25(catalog_fts) AS rank,"
        " EXISTS(SELECT 1 FROM files f WHERE f.unit_id = u.id AND f.access = 'public') AS has_public_file"
        " FROM catalog_fts AS f JOIN units u ON u.id = f.unit_id"
        " WHERE catalog_fts MATCH ? AND u.pub_status = 'published'"
        " ORDER BY rank LIMIT ?",
        (match, k * _CANDIDATE_FACTOR),
    )
    out = []
    for r in cur.fetchall():
        # текст для сверки значимых слов - тот же набор полей, что индексирует FTS
        text = textnorm.norm(
            " ".join(
                filter(
                    None,
                    (r["fts_title"], r["fts_code"], r["fts_keywords"], r["fts_author"], r["fts_place"]),
                )
            )
        )
        if not _relevant(sig, text):
            continue
        out.append(
            {
                "type": "unit",
                "id": r["id"],
                "code": r["code"] or "",
                "title": _pick(r["title_ru"], r["title_kk"], r["title_en"], lang),
                "url": "/delo.html?id=" + str(r["id"]),
                "snippet": r["title_ru"] or "",
                "score": float(-(r["rank"] or 0.0)),
                "has_public_file": bool(r["has_public_file"]),
            }
        )
    return out


def _news_hits(db, sig, lang, k):
    rows = db.execute(
        "SELECT id, title_ru, title_kk, lead_ru, lead_kk FROM news WHERE pub_status = 'published'"
    ).fetchall()
    out = []
    for r in rows:
        text = textnorm.norm(
            " ".join(filter(None, (r["title_ru"], r["title_kk"], r["lead_ru"], r["lead_kk"])))
        )
        if not _relevant(sig, text):
            continue
        out.append(
            {
                "type": "news",
                "id": r["id"],
                "code": "",
                "title": _pick(r["title_ru"], r["title_kk"], None, lang),
                "url": "/novost.html?id=" + str(r["id"]),
                "snippet": r["lead_ru"] or "",
                # новость ниже филиала: филиал - более точный и авторитетный ответ
                "score": 0.8,
                "has_public_file": False,
            }
        )
        if len(out) >= k:
            break
    return out


def _branch_hits(db, sig, lang, k):
    rows = db.execute(
        "SELECT id, slug, name_ru, name_kk, name_en, address_ru, address_kk, address_en FROM branches"
        " WHERE visible = 1"
    ).fetchall()
    out = []
    for r in rows:
        text = textnorm.norm(
            " ".join(
                filter(
                    None,
                    (
                        r["name_ru"],
                        r["name_kk"],
                        r["name_en"],
                        r["address_ru"],
                        r["address_kk"],
                        r["address_en"],
                    ),
                )
            )
        )
        if not _relevant(sig, text):
            continue
        out.append(
            {
                "type": "branch",
                "id": r["id"],
                "code": "",
                "title": _pick(r["name_ru"], r["name_kk"], r["name_en"], lang),
                "url": "/filialy.html",
                "snippet": r["address_ru"] or "",
                "score": 1.0,
                "has_public_file": False,
            }
        )
        if len(out) >= k:
            break
    return out


def search(db, q, lang, k=5):
    """Поиск релевантных фрагментов: единицы (FTS), новости и филиалы (значимые слова)."""
    q = (q or "").strip()
    if not q:
        return []
    q = _MARKER_RE.sub(" ", q).strip()
    sig = textnorm.significant_tokens(q)
    if not sig:
        # запрос из одних стоп-слов или коротких слов - нечего искать
        return []
    hits = []

    match = _fts_query(q)
    if match:
        try:
            hits.extend(_unit_hits(db, match, sig, lang, k))
        except sqlite3.OperationalError:
            # FTS5 недоступен в сборке - пропускаем единицы, оставляем LIKE-поиск
            pass

    hits.extend(_news_hits(db, sig, lang, k))
    hits.extend(_branch_hits(db, sig, lang, k))

    hits.sort(key=lambda h: h["score"], reverse=True)
    return hits[:k]
