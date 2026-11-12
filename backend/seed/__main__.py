"""python -m backend.seed: создать БД и вызвать load_all."""

from __future__ import annotations

from backend.app import db as dbmod
from backend.app.config import get_settings
from backend.seed import load


def main() -> None:
    settings = get_settings()
    conn = dbmod.connect(settings.db_path)
    summary: dict = {}
    try:
        dbmod.init_schema(conn)
        summary = load.load_all(conn)
    finally:
        conn.close()
    print(f"seed ok: {settings.db_path}")
    if summary:
        print(f"филиалов: {summary['branches']}")
        print(f"фондов: {summary['fonds']} (личных: {summary['personal_funds']})")
        print(f"единиц: {summary['units']}")
        print(f"новостей: {summary['news']}")
        print(f"файлов: {summary['files']}")
        print(f"пользователей: {summary['users']}")


if __name__ == "__main__":
    main()
