"""Загрузка данных: load_fixture (для тестов) и load_all (полная демо-загрузка)."""

from __future__ import annotations

import csv
import hashlib
import json
import os
import re
import shutil
import sqlite3
from pathlib import Path

from backend.app import security
from backend.app.config import DEMO_PASSWORD, get_settings
from backend.app.search import reindex_all
from backend.app.textnorm import norm

SEED_DIR = Path(__file__).resolve().parent

DEFAULT_SEED_PASSWORD = DEMO_PASSWORD

_FUND_CODE_RE = re.compile(r"ф\.\s*(\d+)\s*,?\s*(?:оп\.?\s*(\d+))?", re.IGNORECASE)

_BRANCH_SLUGS = [
    ("личному составу", "uka-pers"),
    ("алтай", "altai"),
    ("глубоков", "glubokoe"),
    ("зайсан", "zaisan"),
    ("катон", "katon-karagay"),
    ("курчум", "kurchum"),
    ("маркакол", "markakol"),
    ("риддер", "ridder"),
    ("самар", "samar"),
    ("тарбагатай", "tarbagatay"),
    ("улкен", "ulken-naryn"),
    ("улан", "ulan"),
    ("шемонаих", "shemonaiha"),
]


def _seed_password() -> str:
    return os.environ.get("SEED_PASSWORD", DEFAULT_SEED_PASSWORD)


_FIXTURE_HASHES: dict[str, str] = {}


def _fixture_hash(password: str) -> str:
    """Один хеш на пароль для тестовой фикстуры: scrypt(p=5) - около 0,15 с на хеш."""
    if password not in _FIXTURE_HASHES:
        _FIXTURE_HASHES[password] = security.hash_password(password)
    return _FIXTURE_HASHES[password]


def _branch_slug(name: str) -> str | None:
    n = norm(name)
    for keyword, slug in _BRANCH_SLUGS:
        if keyword in n:
            return slug
    return None


def _clear(db: sqlite3.Connection) -> None:
    """Удалить все данные (идемпотентная перезагрузка), соблюдая порядок внешних ключей."""
    for table in (
        "unit_versions",
        "files",
        "units",
        "inventories",
        "fonds",
        "sessions",
        "login_attempts",
        "audit_log",
        "import_jobs",
        "news",
        "users",
        "branches",
    ):
        db.execute(f"DELETE FROM {table}")
    db.execute("DELETE FROM catalog_fts")
    db.commit()


def load_fixture(db: sqlite3.Connection) -> None:
    """Минимальный набор данных для тестов: 3 филиала, 2 фонда, 6 units, 4 пользователя."""
    branches = [
        ("uka-main", "main", "ГАВКО, Усть-Каменогорск", "ШҚО МА, Өскемен", "SAEK, Ust-Kamenogorsk"),
        ("ridder", "branch", "Риддерский филиал", "Риддер филиалы", "Ridder branch"),
        ("zaisan", "branch", "Зайсанский филиал", "Зайсан филиалы", "Zaisan branch"),
    ]
    for slug, kind, ru, kk, en in branches:
        db.execute(
            "INSERT INTO branches (slug, kind, name_ru, name_kk, name_en) VALUES (?,?,?,?,?)",
            (slug, kind, ru, kk, en),
        )

    db.execute(
        "INSERT INTO fonds (code, kind, title_ru, title_kk, title_en, branch_id, is_demo)"
        " VALUES ('1-П','print','Фонд 1-П','Фонд 1-П','Fonds 1-П',1,1)"
    )
    db.execute(
        "INSERT INTO fonds (code, kind, title_ru, title_kk, title_en, branch_id, is_demo)"
        " VALUES ('18','org','Фонд 18','Фонд 18','Fonds 18',1,1)"
    )

    ridder_id = db.execute("SELECT id FROM branches WHERE slug='ridder'").fetchone()["id"]

    units = [
        # (code, level, pub_status, access)
        ("T-001", "delo", "published", "public"),
        ("T-002", "delo", "published", "no_publish"),
        ("T-003", "delo", "published", "needs_check"),
        ("T-004", "delo", "draft", None),
        ("T-005", "delo", "review", None),
        ("T-006", "delo", "archived", None),
    ]
    for code, level, pub_status, access in units:
        cur = db.execute(
            "INSERT INTO units"
            " (fond_id, level, code, title_ru, title_kk, title_en, branch_id, pub_status, is_demo, lang)"
            " VALUES (?,?,?,?,?,?,?,?,1,'ru')",
            (1, level, code, f"Единица {code}", f"Бірлік {code}", f"Unit {code}", 1, pub_status),
        )
        unit_id = cur.lastrowid
        if access is not None:
            db.execute(
                "INSERT INTO files (unit_id, filename, mime, size, kind, access) VALUES (?,?,?,?,?,?)",
                (unit_id, f"{code}.pdf", "application/pdf", 1234, "view", access),
            )

    users = [
        ("superadmin", "superadmin", None, "Главный администратор"),
        ("analyst", "analyst", None, "Аналитик"),
        ("staff", "staff", None, "Сотрудник архива"),
        ("admin", "admin", None, "Администратор"),
        ("moderator", "moderator", None, "Модератор"),
        ("editor", "editor", None, "Редактор"),
        ("ridder", "branch_admin", ridder_id, "Администратор филиала Риддер"),
    ]
    password_hash = _fixture_hash(_seed_password())
    for username, role, branch_id, display_name in users:
        db.execute(
            "INSERT INTO users (username, password_hash, role, branch_id, display_name) VALUES (?,?,?,?,?)",
            (username, password_hash, role, branch_id, display_name),
        )

    db.commit()
    reindex_all(db)


def _load_branches(db: sqlite3.Connection, branch_by_slug: dict[str, int]) -> None:
    """13 филиалов из CSV + главный архив (uka-main)."""
    path = SEED_DIR / "data" / "filialy-2026.csv"
    if path.exists():
        with open(path, encoding="utf-8-sig", newline="") as fh:
            reader = csv.DictReader(fh)
            idx = 0
            for row in reader:
                idx += 1
                name = (row.get("Наименование организации") or "").strip()
                if not name:
                    continue
                slug = _branch_slug(name) or f"branch-{idx}"
                if slug in branch_by_slug:
                    slug = f"{slug}-{idx}"
                cur = db.execute(
                    "INSERT INTO branches (slug, kind, name_ru, address_ru, phones, email,"
                    " head, coords_verified, visible) VALUES (?,?,?,?,?,?,?,0,1)",
                    (
                        slug,
                        "branch",
                        name,
                        row.get("Фактический адрес") or "",
                        row.get("Контактный телефон") or "",
                        row.get("Электронная почта") or "",
                        row.get("Директор") or "",
                    ),
                )
                branch_by_slug[slug] = cur.lastrowid

    cur = db.execute(
        "INSERT INTO branches (slug, kind, name_ru, name_kk, name_en, coords_verified, visible)"
        " VALUES (?,?,?,?,?,0,1)",
        ("uka-main", "main", "ГАВКО, Усть-Каменогорск", "ШҚО МА, Өскемен", "SAEK, Ust-Kamenogorsk"),
    )
    branch_by_slug["uka-main"] = cur.lastrowid
    db.commit()


def _years_from_line(first_line: str, code_span: tuple[int, int]) -> tuple[int | None, int | None]:
    """Годы из первой строки, исключая шифр фонда (там тоже 4 цифры)."""
    rest = first_line[: code_span[0]] + first_line[code_span[1] :]
    years = [int(y) for y in re.findall(r"\d{4}", rest)]
    if not years:
        return None, None
    return min(years), max(years)


def _extent_from_line(first_line: str) -> str:
    m = re.search(r"(\d+\s*ед\.?\s*хр\.?)", first_line, re.IGNORECASE)
    return m.group(1).strip() if m else ""


def _load_personal_funds(db: sqlite3.Connection) -> None:
    """84 личных фонда из personal_funds.json: fond + published-unit уровня fond."""
    path = SEED_DIR / "data" / "personal_funds.json"
    if not path.exists():
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    for x in data:
        ru = x.get("ru") or {}
        kk = x.get("kk") or {}
        en = x.get("en") or {}
        md = ru.get("markdown") or ""
        first_line = md.split("\n", 1)[0] if md else ""
        m = _FUND_CODE_RE.search(first_line)
        if not m:
            continue
        fond_num = m.group(1)
        opis_num = m.group(2)
        code = f"ф.{fond_num}"
        if opis_num:
            code += f", оп.{opis_num}"
        years_from, years_to = _years_from_line(first_line, m.span())
        extent = _extent_from_line(first_line)
        title_ru = (ru.get("title") or "").strip()
        title_kk = (kk.get("title") or "").strip()
        title_en = (en.get("title") or "").strip()
        cur = db.execute(
            "INSERT INTO fonds (code, kind, title_ru, title_kk, title_en, years_from, years_to,"
            " extent, description_ru, description_kk, source)"
            " VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (
                code,
                "personal",
                title_ru,
                title_kk,
                title_en,
                years_from,
                years_to,
                extent,
                md,
                kk.get("markdown") or "",
                "personal_funds.json",
            ),
        )
        fond_id = cur.lastrowid
        db.execute(
            "INSERT INTO units (fond_id, level, code, title_ru, title_kk, title_en,"
            " years_from, years_to, doc_type, theme, author, keywords, lang, extent, pub_status, is_demo)"
            " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)",
            (
                fond_id,
                "fond",
                code,
                title_ru,
                title_kk,
                title_en,
                years_from,
                years_to,
                "personal",
                "people",
                title_ru,
                f"личный фонд {title_ru}",
                "ru",
                extent,
                "published",
            ),
        )
    db.commit()


def _demo_fond_kind(doc_type: str | None) -> str:
    return {"print": "print", "personal": "personal", "photo": "collection"}.get(doc_type or "", "org")


def _load_demo_units(db: sqlite3.Connection, branch_by_slug: dict[str, int]) -> None:
    """Демо-единицы из demo_units.json (published, is_demo=1) с фондами."""
    path = SEED_DIR / "demo_units.json"
    if not path.exists():
        return
    demo = json.loads(path.read_text(encoding="utf-8"))

    fond_by_code: dict[str, int] = {}
    for u in demo:
        code = u.get("fond_code")
        if not code or code in fond_by_code:
            continue
        title_ru = title_kk = title_en = ""
        description_ru = description_kk = ""
        kind = "org"
        for fu in demo:
            if fu.get("fond_code") == code and fu.get("level") == "fond":
                title_ru = fu.get("title_ru") or ""
                title_kk = fu.get("title_kk") or ""
                title_en = fu.get("title_en") or ""
                description_ru = fu.get("description_ru") or ""
                description_kk = fu.get("description_kk") or ""
                kind = _demo_fond_kind(fu.get("doc_type"))
                break
        if not title_ru:
            title_ru = f"Фонд {code}"
        cur = db.execute(
            "INSERT INTO fonds (code, kind, title_ru, title_kk, title_en,"
            " description_ru, description_kk, is_demo)"
            " VALUES (?,?,?,?,?,?,?,1)",
            (code, kind, title_ru, title_kk, title_en, description_ru, description_kk),
        )
        fond_by_code[code] = cur.lastrowid

    for u in demo:
        cur = db.execute(
            "INSERT INTO units (fond_id, level, code, number, title_ru, title_kk, title_en,"
            " years_from, years_to, doc_type, place, theme, author, keywords, lang, extent,"
            " branch_id, pub_status, access_note, description_ru, description_kk, is_demo)"
            " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)",
            (
                fond_by_code.get(u.get("fond_code")),
                u.get("level"),
                u.get("code"),
                u.get("number") or "",
                u.get("title_ru") or "",
                u.get("title_kk") or "",
                u.get("title_en") or "",
                u.get("years_from"),
                u.get("years_to"),
                u.get("doc_type") or "",
                u.get("place") or "",
                u.get("theme") or "",
                u.get("author") or "",
                u.get("keywords") or "",
                u.get("lang") or "ru",
                u.get("extent") or "",
                branch_by_slug.get(u.get("branch_slug")),
                "published",
                u.get("access_note") or "",
                # описание уровня фонда хранится в fonds, у дела - своё
                "" if u.get("level") == "fond" else (u.get("description_ru") or ""),
                "" if u.get("level") == "fond" else (u.get("description_kk") or ""),
            ),
        )
    db.commit()


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _load_demo_files(db: sqlite3.Connection, web_dir: str, files_dir: Path) -> None:
    """Сканы демо-дел: титульный лист обзора и фото 1885 года открыты, одно дело закрыто."""
    img_dir = Path(web_dir) / "img"
    files_dir.mkdir(parents=True, exist_ok=True)

    # (шифр дела, исходный файл в web/img, имя в хранилище, доступ)
    plan = [
        ("Ф. 1-П, оп. 1, д. 245", "survey1893.jpg", "obzor-semipalatinskoy-oblasti-1893.jpg", "public"),
        ("Ф. 77-Ф, оп. 1, д. 12", "siberia.jpg", "vid-ust-kamenogorska-gravyura-1885.jpg", "public"),
        ("Ф. 77-Ф, оп. 1, д. 14", "bazaar.jpg", "semipalatinsk-bazar-1885.jpg", "public"),
        ("Ф. 77-Ф, оп. 1, д. 15", "ferry.jpg", "irtyshskiy-parom-1885.jpg", "public"),
        ("Ф. 77-Ф, оп. 1, д. 16", "aul.jpg", "kazahskiy-aul-1885.jpg", "public"),
        ("Ф. 61, оп. 2, д. 38", "town.jpg", "prikazy-po-lichnomu-sostavu-1938-1945.jpg", "no_publish"),
    ]
    for code, src_name, dst_name, access in plan:
        unit = db.execute("SELECT id FROM units WHERE code = ?", (code,)).fetchone()
        src = img_dir / src_name
        if unit is None or not src.exists():
            continue
        shutil.copy2(src, files_dir / dst_name)
        size = src.stat().st_size
        sha = _sha256(files_dir / dst_name)
        db.execute(
            "INSERT INTO files (unit_id, filename, mime, size, sha256, kind, access, origin)"
            " VALUES (?,?,?,?,?,?,?,?)",
            (unit["id"], dst_name, "image/jpeg", size, sha, "view", access, "demo"),
        )
    db.commit()


def _load_news(db: sqlite3.Connection, web_dir: str) -> None:
    """Новости из web/news-data.js (window.NEWS=...;)."""
    path = Path(web_dir) / "news-data.js"
    if not path.exists():
        return
    raw = path.read_text(encoding="utf-8").strip()
    prefix = "window.NEWS="
    if not raw.startswith(prefix):
        return
    body = raw[len(prefix) :]
    if body.endswith(";"):
        body = body[:-1]
    try:
        items = json.loads(body)
    except json.JSONDecodeError:
        items = []
    for it in items:
        t = it.get("t") or []
        a = it.get("a") or []
        h = it.get("h") or []
        db.execute(
            "INSERT INTO news (date, title_ru, title_kk, lead_ru, lead_kk, html_ru, html_kk,"
            " image, pub_status) VALUES (?,?,?,?,?,?,?,?,'published')",
            (
                it.get("d") or "",
                t[0] if len(t) > 0 else "",
                t[1] if len(t) > 1 else "",
                a[0] if len(a) > 0 else "",
                a[1] if len(a) > 1 else "",
                h[0] if len(h) > 0 else "",
                h[1] if len(h) > 1 else "",
                it.get("i") or "",
            ),
        )
    db.commit()


def _load_users(db: sqlite3.Connection, branch_by_slug: dict[str, int]) -> None:
    """Пользователи из users.json; пароль хешируется через security.hash_password."""
    path = SEED_DIR / "users.json"
    if not path.exists():
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    password = _seed_password()
    if password == DEMO_PASSWORD:
        # SEC-08: общий демо-пароль у всех ролей допустим только на стенде
        print(
            "ВНИМАНИЕ: пользователи созданы с демо-паролем по умолчанию. "
            "Перед развёртыванием задайте SEED_PASSWORD или смените пароли."
        )
    for u in data:
        branch_id = branch_by_slug.get(u["branch_slug"]) if u.get("branch_slug") else None
        password_hash = security.hash_password(password)
        db.execute(
            "INSERT INTO users (username, password_hash, role, branch_id, display_name) VALUES (?,?,?,?,?)",
            (u["username"], password_hash, u["role"], branch_id, u.get("display_name") or ""),
        )
    db.commit()


def _counts(db: sqlite3.Connection) -> dict:
    def n(query: str) -> int:
        return db.execute(query).fetchone()[0]

    return {
        "branches": n("SELECT COUNT(*) FROM branches WHERE kind = 'branch'"),
        "fonds": n("SELECT COUNT(*) FROM fonds"),
        "personal_funds": n("SELECT COUNT(*) FROM fonds WHERE kind = 'personal'"),
        "units": n("SELECT COUNT(*) FROM units"),
        "news": n("SELECT COUNT(*) FROM news"),
        "files": n("SELECT COUNT(*) FROM files"),
        "users": n("SELECT COUNT(*) FROM users"),
    }


def load_all(db: sqlite3.Connection) -> dict:
    """Полная загрузка демо-данных (идемпотентно). Возвращает сводку счётчиков."""
    settings = get_settings()
    files_dir = Path(settings.files_dir)
    files_dir.mkdir(parents=True, exist_ok=True)
    web_dir = settings.web_dir

    _clear(db)

    branch_by_slug: dict[str, int] = {}
    _load_branches(db, branch_by_slug)
    _load_personal_funds(db)
    _load_demo_units(db, branch_by_slug)
    _load_demo_files(db, web_dir, files_dir)
    _load_news(db, web_dir)
    _load_users(db, branch_by_slug)
    reindex_all(db)

    return _counts(db)
