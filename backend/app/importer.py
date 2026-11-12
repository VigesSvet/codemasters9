"""Импорт CSV/XLSX: предпросмотр, валидация, автоподбор колонок, применение."""

from __future__ import annotations

import csv
import io
import json
import re
from datetime import datetime

from . import audit, textnorm

MAX_FILE_BYTES = 5 * 1024 * 1024
MAX_ROWS = 5000
MAX_PREVIEW_ROWS = 20

CURRENT_YEAR = datetime.now().year


class ImporterError(Exception):
    """Ошибка импорта (формат/лимит), показывается пользователю."""


# Синонимы колонок: каноническое поле -> возможные заголовки.
COLUMN_SYNONYMS = {
    "code": ["шифр", "шифр дела", "архивный шифр", "code", "код", "шифр единицы"],
    "fond_code": ["фонд", "номер фонда", "фонд №", "fond", "fond_code", "код фонда"],
    "opis_no": ["опись", "номер описи", "opis", "opis_no"],
    "delo_no": ["дело", "номер дела", "delo", "delo_no"],
    "title_ru": ["название", "заголовок", "наименование", "title", "title_ru", "заголовок дела"],
    "title_kk": ["название_kk", "заголовок_kk", "title_kk", "атауы"],
    "title_en": ["название_en", "заголовок_en", "title_en"],
    "years": ["годы", "даты", "крайние даты", "years", "дата", "годы (крайние даты)"],
    "years_from": ["год начала", "год начальный", "years_from", "начало", "год начала периода"],
    "years_to": ["год конца", "год конечный", "years_to", "конец", "год конца периода"],
    "doc_type": ["вид документа", "тип документа", "doc_type", "вид"],
    "place": ["место", "место создания", "place", "населённый пункт"],
    "author": ["автор", "author"],
    "keywords": ["ключевые слова", "keywords", "ключевые_слова", "теги"],
    "lang": ["язык", "lang"],
}

_REVERSE: dict[str, str] = {}
for _field, _aliases in COLUMN_SYNONYMS.items():
    for _a in _aliases:
        _REVERSE[textnorm.norm(_a)] = _field


def suggest_mapping(columns):
    """Автоподбор колонок по словарю синонимов."""
    mapping: dict[str, str] = {}
    used: set[str] = set()
    for col in columns:
        field = _REVERSE.get(textnorm.norm(col))
        if field and field not in used:
            mapping[field] = col
            used.add(field)
    return mapping


def _cell_str(value):
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def _decode_csv(content):
    for enc in ("utf-8-sig", "cp1251"):
        try:
            return content.decode(enc)
        except UnicodeDecodeError:
            continue
    return content.decode("utf-8", errors="replace")


def _sniff_delimiter(text):
    sample = text[:65536]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=";,")
        return dialect.delimiter
    except csv.Error:
        lines = sample.splitlines()
        first = lines[0] if lines else ""
        return ";" if ";" in first else ","


def _parse_csv(content):
    text = _decode_csv(content)
    delimiter = _sniff_delimiter(text)
    reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)
    columns = list(reader.fieldnames or [])
    rows = []
    for row in reader:
        rows.append({k: (v or "").strip() for k, v in row.items()})
    return columns, rows


def _parse_xlsx(content):
    from openpyxl import load_workbook

    wb = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    ws = wb.active
    it = ws.iter_rows(values_only=True)
    try:
        header = next(it)
    except StopIteration:
        wb.close()
        return [], []
    columns = [_cell_str(c) for c in header]
    rows = []
    for raw in it:
        row: dict[str, str] = {}
        for i, col in enumerate(columns):
            row[col] = _cell_str(raw[i]) if i < len(raw) else ""
        rows.append(row)
    wb.close()
    return columns, rows


def _parse_rows(filename, content):
    lower = (filename or "").lower()
    if lower.endswith(".xlsx"):
        return _parse_xlsx(content)
    return _parse_csv(content)


def _map_row(row, mapping):
    mapped: dict[str, str] = {}
    for field, col in mapping.items():
        if col and col in row:
            mapped[field] = (row.get(col) or "").strip()
    return mapped


def _parse_int(value):
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def _parse_years(value):
    value = (value or "").strip()
    m = re.match(r"^([0-9]{3,4}) *[-–—] *([0-9]{3,4})$", value)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.match(r"^([0-9]{3,4})$", value)
    if m:
        y = int(m.group(1))
        return y, y
    return None


def _validate_row(mapped):
    """Вернуть (years_from, years_to, error). error = (field, message) или None."""
    if not mapped.get("code"):
        return None, None, ("code", "не указан шифр")
    if not mapped.get("title_ru"):
        return None, None, ("title_ru", "не указано название")
    if not mapped.get("fond_code"):
        return None, None, ("fond_code", "не указан фонд")

    years_from = None
    years_to = None
    if mapped.get("years"):
        parsed = _parse_years(mapped.get("years"))
        if parsed is None:
            return None, None, ("years", "неверный формат годов (ожидается 1900-1910)")
        years_from, years_to = parsed
    else:
        if mapped.get("years_from"):
            v = _parse_int(mapped.get("years_from"))
            if v is None:
                return None, None, ("years_from", "год начала должен быть числом")
            years_from = v
        if mapped.get("years_to"):
            v = _parse_int(mapped.get("years_to"))
            if v is None:
                return None, None, ("years_to", "год конца должен быть числом")
            years_to = v

    if years_from is not None and not (1700 <= years_from <= CURRENT_YEAR):
        return None, None, ("years_from", "год начала вне диапазона 1700..текущий")
    if years_to is not None and not (1700 <= years_to <= CURRENT_YEAR):
        return None, None, ("years_to", "год конца вне диапазона 1700..текущий")
    if years_from is not None and years_to is not None and years_from > years_to:
        return None, None, ("years", "год начала больше года конца")
    return years_from, years_to, None


def preview(db, user, filename, content, mapping=None):
    """Предпросмотр: парсинг, автоподбор, валидация, дубликаты. Пишет только import_jobs."""
    if len(content) > MAX_FILE_BYTES:
        raise ImporterError("файл слишком большой (максимум 5 МБ)")
    columns, rows = _parse_rows(filename, content)
    if not columns:
        raise ImporterError("не удалось разобрать колонки файла")
    if len(rows) > MAX_ROWS:
        raise ImporterError("слишком много строк (максимум 5000)")

    effective_mapping = mapping if mapping else suggest_mapping(columns)

    errors: list[dict] = []
    duplicates: list[dict] = []
    seen_codes: dict[str, int] = {}
    rows_ok = 0
    mapped_rows: list[dict] = []
    for i, row in enumerate(rows, 1):
        mapped = _map_row(row, effective_mapping)
        mapped_rows.append(mapped)
        code = mapped.get("code")
        _yf, _yt, err = _validate_row(mapped)
        if err:
            errors.append({"row": i, "field": err[0], "message": err[1]})
            continue
        existing = db.execute("SELECT id FROM units WHERE code = ?", (code,)).fetchone()
        if existing is not None:
            duplicates.append({"row": i, "code": code, "existing_id": existing["id"]})
            continue
        if code in seen_codes:
            duplicates.append({"row": i, "code": code, "existing_id": None})
            continue
        seen_codes[code] = i
        rows_ok += 1

    payload = {"mapping": effective_mapping, "rows": rows}
    cur = db.execute(
        "INSERT INTO import_jobs (user_id, filename, mapping_json, rows_total, rows_ok, errors_json, status)"
        " VALUES (?,?,?,?,?,?, 'preview')",
        (
            user.get("id") if user else None,
            filename or "",
            json.dumps(payload, ensure_ascii=False),
            len(rows),
            rows_ok,
            json.dumps(errors, ensure_ascii=False),
        ),
    )
    db.commit()
    job_id = str(cur.lastrowid)

    audit.log(
        db,
        user,
        "import.preview",
        "import_job",
        job_id,
        "ok",
        {"rows_total": len(rows), "rows_ok": rows_ok, "errors": len(errors), "duplicates": len(duplicates)},
    )

    return {
        "job_id": job_id,
        "columns": columns,
        "mapping_suggested": effective_mapping,
        "rows_preview": mapped_rows[:MAX_PREVIEW_ROWS],
        "errors": errors,
        "duplicates": duplicates,
        "total": len(rows),
    }


def _ensure_fond(db, code):
    code = (code or "").strip()
    if not code:
        raise ValueError("не указан код фонда")
    row = db.execute("SELECT id FROM fonds WHERE code = ?", (code,)).fetchone()
    if row is not None:
        return row["id"]
    cur = db.execute(
        "INSERT INTO fonds (code, kind, title_ru, title_kk, title_en) VALUES (?,?,?,?,?)",
        (code, "org", "Фонд " + code, "Фонд " + code, "Fonds " + code),
    )
    return cur.lastrowid


def _ensure_inventory(db, fond_id, number):
    number = (number or "").strip()
    if not number:
        return None
    row = db.execute(
        "SELECT id FROM inventories WHERE fond_id = ? AND number = ?", (fond_id, number)
    ).fetchone()
    if row is not None:
        return row["id"]
    cur = db.execute("INSERT INTO inventories (fond_id, number) VALUES (?,?)", (fond_id, number))
    return cur.lastrowid


def apply(db, user, job_id, mapping=None):
    """Применить импорт: построчно, каждая строка в своём SAVEPOINT."""
    try:
        jid = int(job_id)
    except (TypeError, ValueError):
        raise ImporterError("неверный job_id") from None
    job = db.execute("SELECT * FROM import_jobs WHERE id = ?", (jid,)).fetchone()
    if job is None:
        raise ImporterError("задача импорта не найдена")
    if job["status"] == "applied":
        raise ImporterError("импорт уже применён")

    payload = json.loads(job["mapping_json"] or "{}")
    eff_mapping = mapping if mapping else payload.get("mapping", {})
    rows = payload.get("rows", [])

    inserted = 0
    skipped = 0
    errors: list[dict] = []
    for i, raw in enumerate(rows, 1):
        mapped = _map_row(raw, eff_mapping)
        code = (mapped.get("code") or "").strip()
        _yf, _yt, err = _validate_row(mapped)
        if err:
            errors.append({"row": i, "field": err[0], "message": err[1]})
            continue
        if db.execute("SELECT id FROM units WHERE code = ?", (code,)).fetchone() is not None:
            skipped += 1
            continue
        try:
            db.execute("SAVEPOINT imp_row")
            fond_id = _ensure_fond(db, mapped.get("fond_code"))
            inv_id = _ensure_inventory(db, fond_id, mapped.get("opis_no"))
            db.execute(
                "INSERT INTO units"
                " (fond_id, inventory_id, level, code, number, title_ru, title_kk, title_en,"
                "  years_from, years_to, doc_type, place, author, keywords, lang, branch_id,"
                "  pub_status, created_by, is_demo)"
                " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 0)",
                (
                    fond_id,
                    inv_id,
                    "delo",
                    code,
                    (mapped.get("delo_no") or "").strip() or None,
                    (mapped.get("title_ru") or "").strip(),
                    (mapped.get("title_kk") or "").strip() or None,
                    (mapped.get("title_en") or "").strip() or None,
                    _yf,
                    _yt,
                    (mapped.get("doc_type") or "").strip() or None,
                    (mapped.get("place") or "").strip() or None,
                    (mapped.get("author") or "").strip() or None,
                    (mapped.get("keywords") or "").strip() or None,
                    (mapped.get("lang") or "").strip() or None,
                    user.get("branch_id") if user else None,
                    "draft",
                    user.get("id") if user else None,
                ),
            )
            db.execute("RELEASE SAVEPOINT imp_row")
            inserted += 1
        except Exception as e:  # ошибка строки не откатывает ранее вставленные
            db.execute("ROLLBACK TO SAVEPOINT imp_row")
            db.execute("RELEASE SAVEPOINT imp_row")
            errors.append({"row": i, "field": None, "message": str(e)})

    db.execute(
        "UPDATE import_jobs SET status = 'applied', rows_ok = ?, errors_json = ? WHERE id = ?",
        (inserted, json.dumps(errors, ensure_ascii=False), jid),
    )
    db.commit()
    audit.log(
        db,
        user,
        "import.apply",
        "import_job",
        job_id,
        "ok",
        {"inserted": inserted, "skipped": skipped, "errors": len(errors)},
    )
    return {"inserted": inserted, "updated": 0, "skipped": skipped, "errors": errors}
