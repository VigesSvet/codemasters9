#!/usr/bin/env python3
"""Бэкап SQLite БД архива в backend/data/backups/, храним последние 10."""

from __future__ import annotations

import argparse
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

DEFAULT_DB = "backend/data/archive.db"
DEFAULT_DIR = "backend/data/backups"
KEEP = 10


def backup(db_path: Path, backups_dir: Path, keep: int = KEEP) -> Path:
    """Сделать бэкап через sqlite3.Connection.backup, удалить старые (кроме последних keep)."""
    if not db_path.exists():
        raise FileNotFoundError(f"нет БД: {db_path}")
    backups_dir.mkdir(parents=True, exist_ok=True)
    target = backups_dir / f"archive-{datetime.now():%Y%m%d-%H%M%S}.db"

    src = sqlite3.connect(str(db_path))
    try:
        dst = sqlite3.connect(str(target))
        try:
            src.backup(dst)
        finally:
            dst.close()
    finally:
        src.close()

    # ротация: оставить последние keep файлов
    for old in sorted(backups_dir.glob("archive-*.db"))[:-keep]:
        old.unlink()
    return target


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Бэкап БД архива")
    parser.add_argument("--db", default=DEFAULT_DB, help="путь к БД")
    parser.add_argument("--dir", default=DEFAULT_DIR, help="каталог бэкапов")
    parser.add_argument("--keep", type=int, default=KEEP, help="сколько хранить")
    args = parser.parse_args(argv)

    try:
        target = backup(Path(args.db), Path(args.dir), args.keep)
    except Exception as exc:  # noqa: BLE001
        print(f"ошибка бэкапа: {exc}", file=sys.stderr)
        return 1
    print(f"бэкап создан: {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
