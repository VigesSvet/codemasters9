"""Нормализация текста и синонимы для поиска - порт из web/katalog.html."""

from __future__ import annotations

import re

_SYNONYMS_RAW = [
    ["лениногорск", "риддер"],
    ["зыряновск", "алтай"],
    ["семипалатинск", "семей"],
    ["усть-каменогорск", "оскемен"],
    ["серебрянск"],
    ["шемонаиха"],
]

_TRANS = str.maketrans(
    {
        "ё": "е",
        "ә": "а",
        "і": "и",
        "ң": "н",
        "ғ": "г",
        "ү": "у",
        "ұ": "у",
        "қ": "к",
        "ө": "о",
        "һ": "х",
    }
)


def norm(s: str | None) -> str:
    """Нижний регистр, ё→е, казахские буквы→латиница, дефисы→пробелы."""
    if s is None:
        return ""
    s = str(s).lower().translate(_TRANS)
    s = re.sub(r"[-–—]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


SYNONYMS = [[norm(w) for w in group] for group in _SYNONYMS_RAW]


def expand_query(q: str) -> list[str]:
    """Развернуть запрос синонимами (порт synExpand из katalog.html)."""
    nq = norm(q)
    out = [nq]
    for group in SYNONYMS:
        for i, term in enumerate(group):
            idx = nq.find(term)
            if idx < 0:
                continue
            for j in range(len(group)):
                if j == i:
                    continue
                nv = nq[:idx] + group[j] + nq[idx + len(term) :]
                if nv not in out:
                    out.append(nv)
    return out
