"""python -m backend.seed: создать БД и вызвать load_all."""

from __future__ import annotations

from backend.app import db as dbmod
from backend.app.config import get_settings
from backend.seed import load


def main() -> None:
    settings = get_settings()
    conn = dbmod.connect(settings.db_path)
    try:
        dbmod.init_schema(conn)
        load.load_all(conn)
    finally:
        conn.close()
    print(f"seed ok: {settings.db_path}")


if __name__ == "__main__":
    main()
