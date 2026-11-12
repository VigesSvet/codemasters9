# Code Masters Hackathon 9.0 — Государственный архив ВКО

Переосмысление сайта http://e-arhiv.vko.gov.kz/ru. Защита: 13.11.2026.

[![CI](https://github.com/saylaukhan/codemasters9/actions/workflows/ci.yml/badge.svg)](https://github.com/saylaukhan/codemasters9/actions/workflows/ci.yml)

Рабочий прототип: публичный сайт + JSON API + админка с ролями, согласованием,
журналом и локальным ИИ-поиском. Один процесс FastAPI раздаёт и статику web/, и /api/*.

- ТЗ: docs/tz/ (основное ТЗ и дополнения от 10.11.2026)
- Материалы заказчика: docs/materials/
- План и варианты концепции: docs/plan/
- Архитектура: docs/ARCHITECTURE.md
- Контракт API: docs/api.md
- Инструкция редактора: docs/EDITOR-GUIDE.md
- Готовность модулей: docs/READINESS.md

## Быстрый старт

Требуется Python 3.12 и uv (или обычный python3 -m venv).

    make install   # создаёт .venv (Python 3.12) и ставит зависимости
    make seed      # загружает демо-данные в backend/data/archive.db
    make dev       # uvicorn на http://localhost:8000

Откройте http://localhost:8000 — сайт, и http://localhost:8000/docs — Swagger (OpenAPI).

## Docker Compose

    docker compose up --build   # http://localhost:8000

БД и файлы сохраняются в томе ./backend/data.

## Тестовые учётные записи

| Логин | Роль |
|---|---|
| admin | администратор |
| moderator | модератор |
| editor | редактор |
| ridder | администратор филиала Риддер |

Пароль по умолчанию: Demo-2026! (переопределяется переменной SEED_PASSWORD).

## Переменные окружения

См. .env.example:

| Переменная | По умолчанию | Назначение |
|---|---|---|
| DB_PATH | backend/data/archive.db | путь к SQLite |
| WEB_DIR | web | каталог статики |
| FILES_DIR | backend/data/files | каталог файлов |
| AI_PROVIDER | local | local / anthropic |
| SESSION_TTL_MIN | 30 | автовыход, минут |
| LOGIN_MAX_ATTEMPTS | 5 | лимит неудачных входов |
| LOGIN_WINDOW_MIN | 10 | окно лимита, минут |
| COOKIE_SECURE | false | Secure-флаг cookie (за reverse proxy — true) |
| SEED_PASSWORD | Demo-2026! | пароль демо-пользователей |

## Команды make

- make install — venv + зависимости
- make seed — загрузить демо-данные
- make dev — запуск сервера
- make test — прогон pytest
- make lint — ruff check + format
- make check-web — проверка ссылок и html-validate
- make backup — резервная копия БД (scripts/backup_db.py)
- make docker-build / make docker-up

## Структура репозитория

- backend/app/ — FastAPI: роутеры, права, workflow, поиск, ИИ, импорт
- backend/seed/ — демо-данные и загрузчик (load.py)
- web/ — публичный статический сайт (HTML/JS/шрифты/картинки)
- web/admin/ — экраны админки (обновляются отдельной задачей)
- tests/ — pytest (unit + e2e-смоук)
- docs/ — ТЗ, план, материалы, API, архитектура, готовность
- scripts/ — check_links.py, backup_db.py, optimize_images.py
- .github/workflows/ — CI (backend, web, docker)

## Тесты

Тесты лежат в tests/ и используют TestClient на временной БД (фикстуры в
tests/conftest.py). Два уровня:

- unit/API — права, workflow, поиск, ИИ, импорт, безопасность;
- e2e-смоук — сквозной сценарий «редактор → модератор → публикация → поиск →
  доступ к файлу → журнал → ИИ» (tests/test_e2e_smoke.py);
- seed — полная демо-загрузка и её идемпотентность (tests/test_seed.py).

Запуск: make test (или .venv/bin/pytest -q).

## Условия тестирования

По требованиям ТЗ проверка должна воспроизводиться на:

- современных браузерах (Chrome/Firefox/Safari последних версий);
- Python 3.12;
- SQLite со включённым полнотекстовым модулем FTS5 (если FTS5 нет — поиск
  автоматически переключается на LIKE);
- демо-наборе данных: 13 филиалов, 84 личных фонда, демо-единицы каталога,
  638 новостей со старого сайта.

