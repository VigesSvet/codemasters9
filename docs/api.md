# API-контракт

Источник: docs/plan/2026-11-12-tehnichka.md, раздел «API», сверен с роутерами
`backend/app/routers/`. Все ответы — JSON в UTF-8. Mutating-запросы `/api/*`
(POST/PUT/PATCH/DELETE) требуют cookie-сессию и заголовок `X-Requested-With: gos`
(иначе 403 с `{"error":"csrf",...}`).

## Коды ответов и формат ошибок

| Код | Когда | Формат тела |
|---|---|---|
| 401 | Нет сессии / неверный пароль | `{"detail":"..."}` |
| 403 | Нет прав на действие / объект | `{"detail":"..."}` (обычно «Недостаточно прав») |
| 403 | Отказ в скачивании файла опубликованной единицы | `{"error":"restricted","reason":"no_publish\|needs_check","howto":"reading_room"}` |
| 403 | Нет заголовка CSRF на mutating `/api/*` | `{"error":"csrf","detail":"Требуется заголовок X-Requested-With: gos"}` |
| 404 | Объект не найден или скрыт (черновик, файл черновика, единица чужого филиала для branch_admin) | `{"detail":"not found"}` / `{"detail":"Единица не найдена"}` и т. п. |
| 409 | Конфликт: недопустимый переход статуса, дубль code/username, устаревшая version | `{"detail":"..."}` |
| 411 | Изменяющий `/api/*` в chunked-кодировке без Content-Length | `{"error":"too_large","detail":"Требуется заголовок Content-Length"}` |
| 413 | Тело запроса больше 25 МБ | `{"error":"too_large","detail":"Тело запроса больше 25 МБ"}` |
| 413 | Файл больше лимита (20 МБ загрузка / 5 МБ импорт) | `{"detail":"..."}` |
| 422 | Не заполнены обязательные поля / недопустимое значение / ошибка валидации FastAPI | `{"detail":"..."}` либо `{"detail":[{"loc":[...],"msg":"...","type":"..."}]}` |
| 429 | Превышен лимит попыток входа (5 за 10 минут на username+IP или 30 на IP) | `{"detail":"Слишком много попыток входа"}` |
| 503 | `AI_PROVIDER=deepseek` или `anthropic` без ключа | `{"detail":"ИИ-провайдер настроен как deepseek, но ключ DEEPSEEK_API_KEY не задан. Укажите ключ или переключите AI_PROVIDER=local."}` |

## Публичное

GET /api/health
  -> {status: "ok", fts5: true, units: n}

GET /api/catalog/search
  Параметры: q, level, fond, opis, delo, period, year_from, year_to, type, branch,
  place, theme, author, keywords, lang, digitized, open,
  sort (rel|d1|d2|code, по умолчанию rel), page=1 (макс. 100000), per_page=10 (макс. 50).
  q - до 200 символов и 16 слов, операторы FTS5 в q не действуют.
  -> {total, page, per_page, items: [UnitCard],
      facets: {type:{k:n}, branch:{k:n}, level:{k:n}}, query_variants: [...]}

UnitCard = {id, level, code, fond_id, inventory_id,
            title:{ru,kk,en}, years:[y1,y2], doc_type, place, theme, author, extent,
            branch:{id,slug,name}, has_public_file, access_note, is_demo, url}

GET /api/catalog/units/{id}
  -> UnitCard + {description, files:[{id, filename, mime, size, access, downloadable}],
                 versions_public:[{version, status_changed_at}],
                 parents:{fond, inventory}}
  Не published -> 404 (без утечки существования).

GET /api/catalog/fonds/{id}
GET /api/catalog/fonds/{id}/inventories
GET /api/catalog/fonds?kind=personal&q&page&per_page

GET /api/files/{id}/download
  Единица не published -> 404, как у несуществующего файла.
  -> файл, либо 403 {error:"restricted", reason:"no_publish|needs_check",
                    howto:"reading_room"}

GET /api/branches
GET /api/branches/{slug}

GET /api/news?lang&q&page&per_page=12
GET /api/news/{id}

POST /api/ai/ask  {question, lang}
  -> {mode:"source"|"no_data"|"restricted", answer,
      sources:[{type:"unit"|"news"|"branch"|"page", id, code, title, url}],
      generated:true, provider:"local-demo"|"deepseek"|"anthropic", disclaimer}
  restricted и no_data всегда локально (provider "local-demo"); сбой внешнего
  провайдера -> локальный ответ с пометкой

GET /sitemap.xml  (статические страницы + published units)
GET /robots.txt   (Disallow /admin/, /api/admin/)

## Админ (cookie-сессия)

POST /api/auth/login  {username, password}
  -> {user:{id, username, role, branch_id, display_name}, password_is_default}
  username до 64 символов, password до 256.
  401 при неверных учётных данных (одно сообщение для неизвестного логина и неверного пароля),
  429 после 5 неудач за 10 минут на username+IP или 30 неудач с IP.
POST /api/auth/logout  -> {ok:true}
GET  /api/auth/me  -> {user:{...}, password_is_default} | 401

GET    /api/admin/units?status&branch&q&page&per_page  (per_page 1..100; branch_admin - только свой филиал)
POST   /api/admin/units
GET    /api/admin/units/{id}
PUT    /api/admin/units/{id}
DELETE /api/admin/units/{id}
POST   /api/admin/units/{id}/transition  {to, comment}  (недопустимый переход -> 409)
GET    /api/admin/units/{id}/versions

POST /api/admin/units/{id}/files  (multipart, <=20 МБ, pdf/jpg/png/webp/tiff, sha256, access=needs_check)
PUT  /api/admin/files/{id}/access  {access}

GET /api/admin/branches
PUT /api/admin/branches/{id}

GET /api/admin/audit?user&action&object_type&result&page

POST /api/admin/import/preview  (multipart csv/xlsx + mapping JSON)
  -> {job_id, columns, mapping_suggested, rows_preview:[...<=20],
      errors:[{row, field, message}], duplicates:[{row, code, existing_id}], total}
POST /api/admin/import/{job_id}/apply  {mapping}
  -> {inserted, updated:0, skipped, errors}
  (применяет только автор preview или admin, иначе 403; XLSX до 5000 строк и 64 колонок,
   битый файл -> 422)
  (построчно; ошибка строки не откатывает ранее вставленные; создаются draft;
   иерархия fond->opis->delo по колонкам fond_code, opis_no, delo_no)

GET /api/admin/export.csv?status=published
  (значения, начинающиеся с = + - @ TAB CR, экранируются апострофом - защита от CSV-инъекции)

GET  /api/admin/users  (admin)
POST /api/admin/users  (admin)

## Примечания

- Раздельные статусы: units.pub_status (описание) и files.access (файл).
- Публично видно только published; файл отдаётся только если files.access='public'
  и описание published; needs_check -> отказ.
- catalog_fts содержит только published.
- Загруженный файл хранится на диске под случайным именем (в `files.filename`),
  исходное имя клиента сохраняется в `files.origin`.
