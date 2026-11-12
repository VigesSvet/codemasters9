"""Ретривер локального ИИ: поиск фрагментов по catalog_fts + news + branches."""

from __future__ import annotations

import re
import sqlite3

from .. import textnorm


def _pick(ru, kk, en, lang):
    """Заголовок на нужном языке с фолбэком на ru."""
    if lang == "kk" and kk:
        return kk
    if lang == "en" and en:
        return en
    return ru or kk or en or ""


def _fts_query(variants):
    """Собрать FTS5-запрос: уникальные токены с префиксом (морфология) через OR."""
    tokens = set()
    for v in variants:
        tokens.update(re.findall(r"[0-9A-Za-zА-Яа-яЁё]+", v.lower()))
    parts = []
    for t in sorted(tokens):
        if not t:
            continue
        parts.append(t + "*")
    return " OR ".join(parts)


def _unit_hits(db, match, lang, k):
    cur = db.execute(
        "SELECT u.id, u.code, u.title_ru, u.title_kk, u.title_en, u.place, u.author,"
        " bm25(catalog_fts) AS rank,"
        " EXISTS(SELECT 1 FROM files f WHERE f.unit_id = u.id AND f.access = 'public') AS has_public_file"
        " FROM catalog_fts JOIN units u ON u.id = catalog_fts.unit_id"
        " WHERE catalog_fts MATCH ? AND u.pub_status = 'published'"
        " ORDER BY rank LIMIT ?",
        (match, k),
    )
    out = []
    for r in cur.fetchall():
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


def _news_hits(db, nq, lang, k):
    like = "%" + nq + "%"
    cur = db.execute(
        "SELECT id, title_ru, title_kk, lead_ru, lead_kk FROM news"
        " WHERE pub_status = 'published' AND"
        " (title_ru LIKE ? OR title_kk LIKE ? OR lead_ru LIKE ? OR lead_kk LIKE ?)"
        " LIMIT ?",
        (like, like, like, like, k),
    )
    out = []
    for r in cur.fetchall():
        out.append(
            {
                "type": "news",
                "id": r["id"],
                "code": "",
                "title": _pick(r["title_ru"], r["title_kk"], None, lang),
                "url": "/novost.html?id=" + str(r["id"]),
                "snippet": r["lead_ru"] or "",
                "score": 1.0,
                "has_public_file": False,
            }
        )
    return out


def _branch_hits(db, nq, lang, k):
    like = "%" + nq + "%"
    cur = db.execute(
        "SELECT id, slug, name_ru, name_kk, name_en, address_ru, address_kk, address_en FROM branches"
        " WHERE visible = 1 AND"
        " (name_ru LIKE ? OR name_kk LIKE ? OR name_en LIKE ?"
        "  OR address_ru LIKE ? OR address_kk LIKE ? OR address_en LIKE ?)"
        " LIMIT ?",
        (like, like, like, like, like, like, k),
    )
    out = []
    for r in cur.fetchall():
        out.append(
            {
                "type": "branch",
                "id": r["id"],
                "code": "",
                "title": _pick(r["name_ru"], r["name_kk"], r["name_en"], lang),
                "url": "/filialy.html",
                "snippet": r["address_ru"] or "",
                "score": 0.8,
                "has_public_file": False,
            }
        )
    return out


def search(db, q, lang, k=5):
    """Поиск релевантных фрагментов: единицы (FTS), новости и филиалы (LIKE)."""
    q = (q or "").strip()
    if not q:
        return []
    nq = textnorm.norm(q)
    hits = []

    variants = [v for v in textnorm.expand_query(q) if v]
    match = _fts_query(variants)
    if match:
        try:
            hits.extend(_unit_hits(db, match, lang, k))
        except sqlite3.OperationalError:
            # FTS5 недоступен в сборке - пропускаем единицы, оставляем LIKE-поиск
            pass

    hits.extend(_news_hits(db, nq, lang, k))
    hits.extend(_branch_hits(db, nq, lang, k))

    hits.sort(key=lambda h: h["score"], reverse=True)
    return hits[:k]
