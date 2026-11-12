#!/usr/bin/env python3
"""Пережатие изображений web/img: jpg ≤1600px q78 progressive, png - оптимизация (имена сохраняем)."""

from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

MAX_SIDE = 1600
JPEG_QUALITY = 78
PNG_MIN_SAVING = 0.05  # не трогаем png, если выигрыш < 5%
_FALLBACK_QUALITY = (70, 60, 50, 40)


def _fit(w: int, h: int) -> tuple[int, int]:
    """Размеры после ограничения длинной стороны."""
    long_side = max(w, h)
    if long_side <= MAX_SIDE:
        return w, h
    scale = MAX_SIDE / long_side
    return max(1, round(w * scale)), max(1, round(h * scale))


def optimize(path: Path) -> tuple[str, int]:
    """Пережать файл, вернуть (статус, экономия байт). Имя не меняем."""
    original = path.stat().st_size
    with Image.open(path) as im:
        im.load()
        fmt = im.format or ""
        w, h = im.size
        new_w, new_h = _fit(w, h)
        resized = (new_w, new_h) != (w, h)
        img = im.resize((new_w, new_h), Image.LANCZOS) if resized else im

        if fmt == "PNG":
            if img.mode not in ("RGB", "P", "L", "RGBA"):
                img = img.convert("RGB")
            buf = io.BytesIO()
            img.save(buf, "PNG", optimize=True)
        elif fmt in ("JPEG", "JPG"):
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=JPEG_QUALITY, progressive=True, optimize=True)
            # пережатый исходник: после ресайза понижаем качество, чтобы не вырос размер
            if resized and len(buf.getvalue()) >= original:
                for q in _FALLBACK_QUALITY:
                    buf = io.BytesIO()
                    img.save(buf, "JPEG", quality=q, progressive=True, optimize=True)
                    if len(buf.getvalue()) < original:
                        break
        else:
            return "skip", 0

    new_size = len(buf.getvalue())

    if fmt == "PNG" and not resized and (original - new_size) / original < PNG_MIN_SAVING:
        return "skip", 0
    if fmt in ("JPEG", "JPG") and not resized and new_size >= original:
        return "skip", 0

    path.write_bytes(buf.getvalue())
    return "resize" if resized else "ok", original - new_size


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Пережать jpg/png в каталоге")
    parser.add_argument("dir", nargs="?", default="web/img", help="каталог с изображениями")
    args = parser.parse_args(argv)

    root = Path(args.dir)
    files = sorted(
        p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png"}
    )

    saved = 0
    processed = 0
    for p in files:
        try:
            status, delta = optimize(p)
        except (OSError, ValueError) as exc:
            print(f"skip {p}: {exc}", file=sys.stderr)
            continue
        if status == "skip":
            continue
        processed += 1
        saved += delta
        print(f"{status:6} {delta:>9}  {p}")

    print(f"итого: {processed} файлов, экономия {saved / 1048576:.2f} МБ")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
