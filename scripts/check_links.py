#!/usr/bin/env python3
"""Проверка локальных ссылок (href/src) во всех .html каталога; битые -> exit 1."""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from urllib.parse import unquote, urlparse

# внешние/служебные схемы и протокол-относительные — не проверяем
_SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "javascript:", "data:", "//")
_SKIP_PATH_PREFIXES = ("/api/", "/api", "/docs")
# блоки, внутри которых href/src не являются статическими ссылками
_BLOCK_RE = re.compile(r"<(script|style|template)\b[^>]*>.*?</\1>", re.S | re.I)
_LINK_RE = re.compile(r"\b(?:href|src)=([\"'])(.*?)\1", re.I)


def _extract_links(text: str) -> list[str]:
    body = _BLOCK_RE.sub("", text)
    return [m.group(2) for m in _LINK_RE.finditer(body)]


def _normalize(raw: str) -> str | None:
    """Локальный путь без query/hash; None — пропустить."""
    raw = raw.strip()
    if not raw or raw.startswith(_SKIP_PREFIXES):
        return None
    # динамические шаблоны (JS-склейка, плейсхолдеры) пропускаем
    if any(ch in raw for ch in ("'", '"', "+", "{", "}")):
        return None
    path = urlparse(raw).path
    if not path:
        return None
    return unquote(path)


def _resolve(root: Path, html: Path, path: str) -> Path | None:
    if path.startswith(_SKIP_PATH_PREFIXES):
        return None
    p = Path(path)
    if p.is_absolute():
        return root / str(p).lstrip("/")
    return html.parent / p


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Проверка локальных ссылок")
    parser.add_argument("dir", nargs="?", default="web", help="каталог с .html")
    args = parser.parse_args(argv)

    root = Path(args.dir)
    html_files = sorted(root.rglob("*.html"))
    broken: list[tuple[str, str]] = []
    checked = 0

    for hf in html_files:
        text = hf.read_text(encoding="utf-8", errors="replace")
        for raw in _extract_links(text):
            path = _normalize(raw)
            if path is None:
                continue
            target = _resolve(root, hf, path)
            if target is None:
                continue
            checked += 1
            if not target.exists():
                rel = str(hf.relative_to(root))
                broken.append((rel, raw))

    if broken:
        for src, link in broken:
            print(f"BROKEN  {src}  ->  {link}")
        print(f"битых ссылок: {len(broken)}")
        return 1

    print(f"OK: проверено {checked} локальных ссылок в {len(html_files)} файлах")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
