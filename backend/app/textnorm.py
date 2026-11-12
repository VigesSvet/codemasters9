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


# стоп-слова ru/kk/en: предлоги, союзы, частицы, вопросительные слова - отсекают шум в поиске ИИ
_STOPWORDS_RAW = (
    # русские
    "на в во о об по с со от до из за над под у к ко про при через без для между перед "
    "после около и а но да или либо то что чтобы если ли же бы не ни как где куда когда "
    "откуда почему зачем сколько какой какая какое какие каким каком каких который которая "
    "которое которые кто кого кому кем ком чей чья чьё чьи чего чему чем чём я ты он она оно "
    "мы вы они меня мне мной тебя тебе тобой его ему им её ей нас нам нами вас вам вами их них "
    "себя себе собой это этот эта эти тот та те такой такая такое такие так тут там здесь вот вон "
    "есть был была было были буду будет будут нет можно нужно надо "
    # английские
    "a an the of in on at by for with about from to and or but not no is are was were be been "
    "being am do does did have has had will would can could should may might must what where when "
    "who whom whose which why how this that these those i you he she it we they me my mine your "
    "yours his her hers its our ours their theirs there here "
    # казахские
    "қалай қайда қашан кім не неге неліктен қандай қанша туралы жайлы және мен сен ол біз сіз "
    "олар жоқ ғой үшін дейін арқылы бойынша сияқты секілді қарай бірақ немесе болады болды деген "
    "осы мына бұл өз өзі екен еді емес барлық"
).split()

STOPWORDS = frozenset(norm(w) for w in _STOPWORDS_RAW)


def significant_tokens(q: str) -> list[str]:
    """Значимые слова запроса: после norm, длина не меньше 4 и не стоп-слово."""
    s = norm(q)
    seen: set[str] = set()
    out: list[str] = []
    for t in re.findall(r"[0-9a-zа-яё]+", s):
        if len(t) >= 4 and t not in STOPWORDS and t not in seen:
            seen.add(t)
            out.append(t)
    return out


def token_alternatives(token: str) -> list[list[str]]:
    """Варианты значимого токена: сам токен + синонимы(фразы разбиты по словам)."""
    alts = [[token]]
    for group in SYNONYMS:
        # токен - форма основы("риддерского" содержит "риддер") - берём всю группу
        if any(base in token for base in group):
            for other in group:
                parts = other.split()
                if parts and parts != [token]:
                    alts.append(parts)
            break
    return alts
