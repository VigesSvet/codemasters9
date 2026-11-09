# Бриф: живой реверс топ-сайтов архивов/музеев (US/EU)

Контекст: хакатон Code Masters 9.0 — новый сайт Госархива ВКО (Казахстан), репо ~/work/codemasters9, ТЗ в docs/tz/TZ.txt.
Прошлые макеты (docs/mockups) получились AI-слопом, придуманным из головы. Нужны ФАКТЫ с реальных топ-сайтов,
чтобы потом собрать дизайн-систему на их основе. Никаких «по памяти»: всё, что пишешь, должно быть снято с живой страницы.

## Инструменты (обязательно, так уже делали)
- Свой Chrome на своём порту (порт дан в задаче):
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=PORT --user-data-dir=/tmp/rea-chrome-PORT --no-first-run about:blank &` (в фоне).
- REA: `rea` (/opt/homebrew/bin/rea, см. `rea --help`; полезно `capture-web-screenshot`, `analyze-web-bundle`, `capture-browser-scenario`) или `npx rea-agents@6.8.0 list-browser-targets / inspect-web-page`.
- Прямой CDP через node/python (websocket к http://127.0.0.1:PORT/json): Page.navigate, Page.captureScreenshot (desktop 1440×900 и mobile 390×844 через Emulation.setDeviceMetricsOverride + iPhone UA), Runtime.evaluate для getComputedStyle.
- Если сайт режет бота/капча — зафиксируй и возьми соседнюю страницу того же сайта, не выдумывай.

## Что снять по каждому сайту (страницы указаны в задаче)
1. Скриншоты desktop + mobile каждой страницы (первый экран + полностраничный, если реально) → `shots/*.png`.
2. Токены (через getComputedStyle и CSS-переменные :root): шрифты (family, где грузятся — woff2 URL), шкала размеров/межстрочных/весов для h1–h4, body, мелкого текста; палитра (фон, текст, акцент, ссылки, бордеры, тёмная тема если есть); радиусы, тени, отступы секций, ширина контейнера, колонки сетки, брейкпоинты (из CSS @media). → `tokens.json`.
3. Компоненты: шапка (высота, состав, sticky?), поиск (где, как выглядит, автоподсказки?), фильтры/фасеты, карточка в выдаче, карточка документа/дела (метаданные, иерархия/хлебные крошки фонд→опись→дело, просмотрщик скана — IIIF? какой вьюер: OpenSeadragon/Mirador/UV, найди в бандлах/network), футер, переключатель языка.
4. Движение/взаимодействия: hover, переходы, анимации (длительности/easing из CSS transition/animation), есть ли skeleton-загрузка.
5. Стек: фреймворк (Next/Nuxt/Drupal/…), дизайн-система (например TNA Frontend, USWDS), открытые репо на GitHub если есть (ссылки).
6. 5–10 конкретных приёмов «что украсть для Госархива ВКО», каждый со ссылкой на скрин и цифрами.

## Выход
Папка `~/work/codemasters9/docs/research/reverse/<site>/`: `notes.md` (по-русски, сжато, только факты + цифры), `tokens.json`, `shots/`.
В финальном ответе — 10–15 строк: главное по каждому сайту + что не удалось снять. Не трогай другие папки и docs/mockups. Не коммить. Закрой свой Chrome в конце.
