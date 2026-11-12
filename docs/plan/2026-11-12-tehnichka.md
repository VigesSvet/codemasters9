# План «техничка» до 19:45 12.11.2026 (защита 13.11)

Ветка `main` = `ba5f002` на момент составления. Цель: за ~3 часа превратить статический прототип в рабочий сайт с бэкендом, правами на сервере, тестами и CI, не трогая дизайн варианта A.

## 0. Аудит (что есть сейчас)

**Структура.** В репо только `docs/`: нет `backend/`, тестов, `.github/`, Dockerfile, Makefile. Сайт — `docs/mockups-v2/a-gos/` (40 html, `app.js` 337 строк, `style.css`, `news-data.js`, `preyskurant-data.js`, `admin/`).

**Что имитация (по коду):**
- `katalog.html`: ~20 выдуманных записей в инлайн-массиве `R=[...]`, фильтрация в браузере; карточки `delo.html`/`fond.html` — одна захардкоженная карточка без `?id=`; вьюер — листание одной картинки.
- `ii.html` + `app.js` `answer()`: ответы по регуляркам, «демо-режим» подписан.
- `admin/index.html`: кнопки «Принято/Отклонено» меняют класс; `admin/delo-edit.html`: «На проверке» — текст. Нет входа, ролей, журнала, сервера.
- `nedostupno.html` — страница есть, но закрытый файл ничем не защищён.
- Опрос — локальный счётчик; погода — open-meteo.

**Что тяжёлое (29 МБ):** `img/old/` 13 МБ (96 jpg, не сжаты), `files/` 4,5 МБ (3 PDF), `news-data.js` 3,1 МБ (638 новостей целиком), `fonts/` 1 МБ TTF (не woff2), 2 МБ скриншотов `*.png` в раздаваемой папке, `publikacii.html` 1,7 МБ, `istoriya-kraya.html` 1,4 МБ, `lichnye-fondy.html` 0,5 МБ. Leaflet с unpkg.

**Критичные требования ТЗ:** §3.1 доп. — права на карточку и файл проверяются на сервере (прямая ссылка и API); раздельные статусы описания и файла; FTS только по разрешённому; §3.4 — ИИ только по открытым материалам, источники, «нет данных», не слать запросы внешнему провайдеру; §3.5 — права на операцию и объект, филиалы разграничены, версии/согласующий/дата, импорт с предпросмотром и протоколом ошибок, журнал (тип операции/ID/результат, без секретов); §3.6 — тесты ошибочного входа, закрытого файла, сбоя внешнего сервиса; §6.7 статусы Черновик → На проверке → Требует доработки → Одобрено → Опубликовано → Архивировано; §7.2 Lighthouse ≥ 80, сжатие, пагинация; §7.3 хеши паролей, лимит попыток, XSS/CSRF, автовыход, бэкап БД, журнал; §7.5 sitemap/robots; §5 — инструкция запуска, архитектура, таблица готовности.

## 1. Целевая архитектура

**Стек:** FastAPI + stdlib `sqlite3` (+ FTS5) + Pydantic, без ORM. Один процесс `uvicorn` раздаёт `web/` (`StaticFiles(html=True)` на `/`) и `/api/*`. Статика ходит в API через `fetch` (`web/api.js`). Python в CI/Docker — 3.12.

```
backend/app/
  main.py          # create_app(): роутеры, install_security(app), install_static(app)
  config.py        # Settings (DB_PATH, WEB_DIR, AI_PROVIDER=local, SESSION_TTL_MIN=30, ...)
  db.py            # connect(), init_schema(), get_db (Depends), rows()
  schema.sql
  textnorm.py      # norm(), SYNONYMS, expand_query() — порт из katalog.html
  models.py        # Pydantic-схемы
  permissions.py   # can(user, action, obj) -> bool ; ROLES
  audit.py         # log(db, user, action, object_type, object_id, result, details=None, ip=None)
  security.py      # scrypt, сессии, лимит попыток, CSRF, заголовки, install_security()
  static.py        # install_static(): GZip, Cache-Control, mount web/
  search.py        # search_units(db, params) -> dict; reindex_unit/reindex_all
  workflow.py      # TRANSITIONS, transition(db, user, unit_id, to, comment)
  importer.py      # preview(), apply()
  ai/{retriever.py, local.py, providers.py}
  routers/{catalog,branches,news,auth,admin,imports,ai,seo}.py
backend/seed/{__init__.py, __main__.py, load.py, demo_units.json, users.json}
backend/data/      # archive.db, files/ (gitignore)
web/               # бывший docs/mockups-v2/a-gos (git mv), + api.js
tests/
scripts/{check_links.py, optimize_images.py, backup_db.py}
.github/workflows/ci.yml, Dockerfile, docker-compose.yml, Makefile, pyproject.toml, requirements*.txt
docs/api.md, docs/ARCHITECTURE.md, docs/EDITOR-GUIDE.md
```

**Схема БД:**
```sql
users(id PK, username UNIQUE, password_hash, role CHECK(role IN('admin','moderator','editor','branch_admin')),
      branch_id NULL REFERENCES branches, display_name, is_active DEFAULT 1, created_at)
sessions(token_hash PK, user_id, created_at, last_seen_at, expires_at)
login_attempts(username, ip, ts, ok)
branches(id PK, slug UNIQUE, kind, name_ru,name_kk,name_en, address_ru,address_kk,address_en, phones, email,
      hours_ru,hours_kk,hours_en, lat, lon, coords_verified DEFAULT 0, visible DEFAULT 1, head, note, updated_at)
fonds(id PK, code UNIQUE, kind CHECK(kind IN('org','personal','collection','print')), title_ru,title_kk,title_en,
      years_from, years_to, extent, description_ru, description_kk, branch_id, source, is_demo DEFAULT 0, updated_at)
inventories(id PK, fond_id, number, title_ru,title_kk,title_en, years_from, years_to, units_count, UNIQUE(fond_id,number))
units(id PK, fond_id, inventory_id NULL, level CHECK(level IN('fond','opis','delo','doc')), code UNIQUE,
      number, title_ru,title_kk,title_en, years_from, years_to, doc_type, place, theme, author, keywords, lang, extent,
      branch_id, pub_status CHECK(pub_status IN('draft','review','needs_work','approved','published','archived')) DEFAULT 'draft',
      access_note, version DEFAULT 1, created_by, status_changed_at, status_changed_by, is_demo DEFAULT 0, updated_at)
unit_versions(id PK, unit_id, version, data_json, author_id, reviewer_id NULL, pub_status, comment, created_at)
files(id PK, unit_id, filename, mime, size, sha256, kind CHECK(kind IN('master','view')) DEFAULT 'view',
      source_file_id NULL, access CHECK(access IN('public','no_publish','needs_check')) DEFAULT 'needs_check',
      origin, uploaded_by, uploaded_at)
news(id PK, date, title_ru, title_kk, lead_ru, lead_kk, html_ru, html_kk, image, pub_status DEFAULT 'published')
audit_log(id PK, ts, user_id NULL, username, ip, action, object_type, object_id, result CHECK(result IN('ok','denied','error')), details_json)
import_jobs(id PK, user_id, filename, mapping_json, rows_total, rows_ok, errors_json, status CHECK(status IN('preview','applied')), created_at)
CREATE VIRTUAL TABLE catalog_fts USING fts5(unit_id UNINDEXED, title, code, keywords, author, place, tokenize='unicode61 remove_diacritics 2');
```
Раздельные статусы: `units.pub_status` (описание) и `files.access` (файл). Публично видно только `published`; файл отдаётся только если `files.access='public'` и описание published; `needs_check` → отказ. В `catalog_fts` только published, `search_units` дополнительно JOIN-ит `units` по статусу.

**Матрица `permissions.can(user, action, obj)`** (проверка на сервере в каждом хендлере):

| action | admin | moderator | editor | branch_admin |
|---|---|---|---|---|
| unit.create / unit.edit (только draft/review/needs_work) | ✓ | ✓ | ✓ | ✗ |
| unit.edit published | ✓ | ✓ | ✗ | ✗ |
| unit.submit (draft/needs_work → review) | ✓ | ✓ | ✓ | ✗ |
| unit.review (review → approved/needs_work), unit.publish, unit.archive | ✓ | ✓ | ✗ | ✗ |
| unit.delete | ✓ | ✗ | ✗ | ✗ |
| file.upload | ✓ | ✓ | ✓ | ✗ |
| file.set_access | ✓ | ✓ | ✗ | ✗ |
| branch.edit | ✓ все | ✗ | ✗ | только `obj.id == user.branch_id` |
| import.preview/apply (apply создаёт draft) | ✓ | ✗ | ✓ | ✗ |
| audit.read | ✓ | ✓ | ✗ | ✗ |
| users.manage | ✓ | ✗ | ✗ | ✗ |

Переход статуса не меняет `files.access`. Каждое изменение `units` → строка в `unit_versions`. Любой отказ (403) пишется в `audit_log` с `result='denied'`.

**Безопасность:** `hashlib.scrypt`; сессия — случайный токен, в БД sha256, cookie `gos_session` HttpOnly/SameSite=Lax, автовыход 30 мин неактивности; 5 неудачных входов за 10 мин на username+IP → 429; CSRF: SameSite=Lax + заголовок `X-Requested-With: gos` на mutating `/api/*` (403 без него); CSP и прочие заголовки; `/admin/*`, `/api/admin/*` — `X-Robots-Tag: noindex`; SQL только с параметрами; фронт выводит через `textContent`/`esc()`.

**API (контракт `docs/api.md`, фиксируется этапом 0):**

Публичное:
- `GET /api/health` → `{status, fts5: true, units: n}`
- `GET /api/catalog/search?q&level&fond&opis&delo&period&year_from&year_to&type&branch&place&theme&author&keywords&lang&digitized&open&sort=rel|d1|d2|code&page=1&per_page=10` → `{total, page, per_page, items:[UnitCard], facets:{type:{k:n}, branch:{k:n}, level:{k:n}}, query_variants:[...]}`; `UnitCard = {id, level, code, fond_id, inventory_id, title:{ru,kk,en}, years:[y1,y2], doc_type, place, theme, author, extent, branch:{id,slug,name}, has_public_file, access_note, is_demo, url:"/delo.html?id=N"}`
- `GET /api/catalog/units/{id}` → UnitCard + `{description, files:[{id, filename, mime, size, access, downloadable}], versions_public:{version, status_changed_at}, parents:{fond, inventory}}`; не published → 404 (без утечки существования)
- `GET /api/catalog/fonds/{id}`, `GET /api/catalog/fonds/{id}/inventories`, `GET /api/catalog/fonds?kind=personal&q&page`
- `GET /api/files/{id}/download` → файл или `403 {"error":"restricted","reason":"no_publish|needs_check|unpublished","howto":"reading_room"}`
- `GET /api/branches`, `GET /api/branches/{slug}`
- `GET /api/news?lang&q&page&per_page=12`, `GET /api/news/{id}`
- `POST /api/ai/ask {question, lang}` → `{mode:"source"|"no_data"|"restricted", answer, sources:[{type:"unit"|"news"|"branch"|"page", id, code, title, url}], generated:true, provider:"local-demo", disclaimer}`
- `GET /sitemap.xml` (статические страницы + published units), `GET /robots.txt` (Disallow `/admin/`, `/api/admin/`)

Админ (cookie-сессия, mutating-запросы с заголовком `X-Requested-With: gos`):
- `POST /api/auth/login {username,password}` → `{user:{id,username,role,branch_id,display_name}}`; `POST /api/auth/logout`; `GET /api/auth/me`
- `GET /api/admin/units?status&branch&q&page`; `POST /api/admin/units`; `GET/PUT/DELETE /api/admin/units/{id}`; `POST /api/admin/units/{id}/transition {to, comment}` (недопустимый переход → 409); `GET /api/admin/units/{id}/versions`
- `POST /api/admin/units/{id}/files` (multipart, ≤20 МБ, mime pdf/jpg/png/webp/tiff, sha256, `access=needs_check`); `PUT /api/admin/files/{id}/access {access}`
- `GET /api/admin/branches`, `PUT /api/admin/branches/{id}`
- `GET /api/admin/audit?user&action&object_type&result&page`
- `POST /api/admin/import/preview` (multipart csv/xlsx + `mapping` JSON) → `{job_id, columns, mapping_suggested, rows_preview:[...≤20], errors:[{row, field, message}], duplicates:[{row, code, existing_id}], total}`; `POST /api/admin/import/{job_id}/apply {mapping}` → `{inserted, updated:0, skipped, errors}` (построчно, ошибка строки не откатывает ранее вставленные; создаются `draft`; иерархия fond→opis→delo по колонкам `fond_code, opis_no, delo_no`)
- `GET /api/admin/export.csv?status=published`
- `GET/POST /api/admin/users` (admin)

**ИИ:** `AI_PROVIDER=local` по умолчанию — ретривер по `catalog_fts` (published) + news + branches, компоновщик ответа по шаблонам ru/kk/en со ссылками; режимы `source` / `no_data` / `restricted`; `AI_PROVIDER=anthropic` только по env и ключу. Всегда `generated:true` + disclaimer.

**Must / Should / Could**
- **Must:** этап 0; каталог/карточки/файлы из БД с проверкой прав; auth + роли + журнал + workflow + версии; каталог/дело/фонд/ИИ на API; админка: вход, список, правка, переход статуса, журнал; ИИ локальный RAG с 3 режимами; pytest ≥ 35; ruff; CI; Dockerfile/compose; Makefile/README; READINESS.
- **Should:** импорт CSV/XLSX; branch_admin правит свой филиал; загрузка файла с sha256; sitemap/robots; gzip + Cache-Control; woff2; пережатие jpg; PNG-макеты вон из `web/`; новости через API; check_links + html-validate в CI; backup_db.
- **Could:** Playwright smoke; разбивка `publikacii`/`istoriya-kraya`; экспорт CSV; diff версий; Lighthouse CI; санитайзер HTML новостей; внешний LLM-адаптер.

## 2. Качество

- pytest + `TestClient`, `tests/conftest.py`: фикстуры `app` (tmp БД, `init_schema`, `seed.load.load_fixture(db)` — 3 филиала, 2 фонда, 6 units: published-public, published-no_publish, published-needs_check, draft, review, archived; 4 пользователя по ролям), `client`, `login(client, role)`, `db`.
- ruff (`line-length 110`, select E,F,I,B,UP), `scripts/check_links.py web`, `npx html-validate` с мягким конфигом.
- GZip, Cache-Control, woff2-подмножества, jpg ≤1600 px q78, `loading="lazy"`.
- Dockerfile (python:3.12-slim), docker-compose, Makefile (`install seed dev test lint check-web backup docker-build docker-up`), CI: jobs backend / web / docker.

## 3. Задачи

- **Этап 0 — каркас** (в `main`): `git mv docs/mockups-v2/a-gos web`, скриншоты и брифы вон из `web/`, все модули с зафиксированными сигнатурами и заглушками, `schema.sql`, `models.py`, `db.py`, `config.py`, `audit.py`, `textnorm.py`, `static.py` рабочие, `main.py` больше не меняется; seed-заготовки, `conftest.py`, `test_health.py`, `web/api.js`, `docs/api.md`, pyproject/requirements/Makefile/CI/Docker.
- **Волна 1 (параллельно):** T1 каталог/данные/SEO (`tech/t1-catalog`); T2 auth/права/workflow/журнал/безопасность (`tech/t2-admin`); T3 ИИ + импорт (`tech/t3-ai-import`); T4 публичный фронт на API (`tech/t4-web-public`); T6 статика/производительность/проверки фронта (`tech/t6-perf`).
- **Волна 2:** T5 админка на API (`tech/t5-web-admin`) после слияния T2.
- **Интеграция:** порядок слияния T1 → T2 → T3 → T4 → T6 → T5, после каждого `make test lint check-web`; README, ARCHITECTURE, EDITOR-GUIDE, READINESS, push, зелёный CI.

Владение файлами и критерии приёмки — в описании каждой задачи; при ревью `git diff --stat` сверяется с владением.

**Риски:** FTS5 нет в sqlite — фолбэк `LIKE`; парсинг `news-data.js`; T4 работает по контракту до слияния бэкенда; конфликт в `app.js` (блоки ИИ и ADMTOP) — мерж руками; нехватка времени — режем T5 (импорт/журнал показывать через Swagger), затем T6, затем импорт. Must-ядро не режем.

## 4. Демо «техничка» (4 мин)

1. GitHub Actions зелёный: ruff, pytest, html-validate, docker build.
2. `/docs` (Swagger); `curl /api/files/{closed}/download` → 403 — «проверяет сервер».
3. Каталог: «Лениногорск» → Риддер; карточки с открытым и закрытым файлом.
4. Админка: неверный пароль (401, после 5 — 429, строка в журнале); editor создаёт → «На проверку» → пытается опубликовать → отказ (`denied` в журнале); moderator публикует → запись в поиске, файл закрыт; журнал и версии.
5. Админ филиала Риддер правит свой филиал, чужой → 403.
6. Импорт `sample_import.csv`: 1 ошибка, 1 дубль, 8 черновиков.
7. ИИ: 3 режима, «сформировано автоматически», `provider: local-demo`.
8. `docker compose up`, заголовки и gzip, Lighthouse.
