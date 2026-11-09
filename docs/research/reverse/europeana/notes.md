# Europeana (europeana.eu) — факты с живых страниц, 2026-11-09

Chrome/CDP, desktop 1440x900 (обычный Chrome, 403 нет — открылось). Mobile: 390x844 dpr2 **без подмены UA**: с iPhone UA Cloudflare показал challenge (скрин был, перезаписан). Скрины `shots/`, сырьё `raw/`, токены `tokens.json`.
Страницы: главная /en, выдача /en/search?query=vermeer, объект /en/item/90402/SK_A_2344 (тот же Milkmaid), gallery /en/galleries/9045-autumn-in-art, exhibition /en/exhibitions/weimar-cinema + глава /expressionism.

## Стек (подтверждён package.json репо)
- **Nuxt 2.18.1 + Vue 2.7.16 + Bootstrap 4.6 / bootstrap-vue 2.22**, дизайн-система `@europeana/style`, swiper 12, Contentful CMS, Klaro (куки), Matomo + Elastic APM. Репо: https://github.com/europeana/portal.js (EUPL-1.2, живое; есть папка `styleguide/`).
- **Вьюер изображений: OpenLayers (ol ^10.5, ol/source/IIIF) — `MediaImageViewer.vue`**, не OSD/Mirador/UV. IIIF **Presentation API 2** манифест: `https://iiif.europeana.eu/presentation/90402/SK_A_2344/manifest` (sc:Manifest, label/description на нескольких языках). Управление: rotate L/R, zoom in, reset, zoom out, fullscreen, кнопка "Extra large image: load full-size", загрузка JPEG 4.78 MB.
- Публичные API: record/search.json, entity/suggest (автоподсказки), entity/retrieve, set/search. Ключ wskey виден в запросах (в notes не копирую).

## Токены
- Шрифты: Open Sans (400/500/600/700, italic; woff2 в /_nuxt/fonts/, есть cyrillic/cyrillic-ext) + Ubuntu для заголовков; иконки icomoon.woff.
- Шкала (1440): body 16/24; hero h1 46/69 bold; h1 галереи/выставки 34/51 w500; h1 объекта 28/42 w400; подзаголовок выставки 24/36; текст выставки 18/27 колонка 730px; nav 14px 600 caps; футер-заголовки 14 bold caps; small 12/18.
- Палитра (светлая, одна): текст #1a1a1a, вторичный #4d4d4d, фон #fff, чип #f1f1ee, ссылка/primary #0a72cc, футер #000, вьюер #000, hero с тёмно-синим дуотоном.
- Радиусы 4px (кнопки, карточки), инпуты 6–8px; тень карточки 0 1px 3px rgba(0,0,0,.25), hover через box-shadow .25s.
- Шапка sticky 56px, белая: бургер, лого, HOME / COLLECTIONS / STORIES / SHARE YOUR COLLECTIONS / LOG IN / JOIN, лупа справа; активный пункт — синее подчёркивание. Брейкпоинты Bootstrap 576/768/992/1200 + 1400/1880/2520/3020/3600.
- Переходы: 0.3s ease-in-out по умолчанию, кнопки 0.15s, карточки box-shadow .25s, аккордеоны max-height 1s; скелетонов нет (белые плейсхолдеры карточек у related items, спиннер во вьюере).
- Футер чёрный: OUR MISSION (курсив), MORE INFO, язык (селект English), соцсети, HELP, EU-лого + юр.текст, синяя диагональная полоса справа сверху.

## Страницы
- Главная: hero на весь экран 844px с фото-дуотоном, H1 46px bold по центру, подзаголовок ~28px, поисковая строка 644x56 radius 8px, лого EU "Funded by". 5265px высоты.
- Выдача (`search-desktop.png`): строка поиска под шапкой с CLEAR, "1,616 RESULTS FOR [vermeer x]", переключатель вида (выбор / masonry), 3 колонки masonry-карточек, справа панель фильтров ~320px (THEME, TYPE OF MEDIA, CAN I USE THIS?, "+ SHOW ADDITIONAL FILTERS", "< SHOW ADVANCED SEARCH"). Автоподсказки — через entity/suggest.
- Объект (`item-desktop-full.png`, `item-fullsize-desktop.png`): чёрный вьюер ~660px сверху, под ним в колонке 920px: лицензия, действия (в галерею, лайк, SHARE, синий DOWNLOAD JPEG), H1, описание, провайдер-чип, табы "Good to know" | "All metadata" (таблица), другие языки, related collections (чипы) и related items.
- Gallery (`gallery-desktop.png`): eyebrow GALLERY, H1 34px, описание, "Curated by europeana", SHARE, "50 ITEMS", masonry 4 колонки.
- Exhibition (`exhibition-desktop-full.png`): eyebrow, H1, hero 920px с (i)-атрибуцией, дата/просмотры, интро из 3 абзацев, блок CHAPTERS: 6 плашек "01 Expressionism"… с тёмным фоном-картинкой главы, Credits светлая. Глава (`exhibition-chapter-desktop-full.png`, 7397px): breadcrumbs "Exhibition: Weimar cinema > Expressionism", колонка текста 730px 18/27, между абзацами крупные изображения и встроенное видео (ленивая загрузка), курсивные цитаты, внизу тот же список глав с активной синей. Никакого scroll-jacking/parallax — чистая вертикальная лента.

## Что украсть для Госархива ВКО
1. Выставка = лендинг + плашки глав с номерами 01..06 и фоном-картинкой (`exhibition-desktop-full.png`): для «Онлайн-выставок архива», плашка h~40px, текст 16px 600.
2. Читаемая колонка 730px, 18/27 для текста глав (`exhibition-chapter-desktop-full.png`), breadcrumbs «Выставка > Глава», список глав внизу с активной подсвеченной.
3. Карточка объекта: чёрный viewer сверху ~660px + белая колонка 920px, табы "Good to know / All metadata" (ключ-значение с тонкими разделителями), бейдж лицензии (`item-desktop-full.png`) — для «Основные сведения / Все метаданные» дела.
4. Панель управления вьюера: rotate L/R | zoom in | reset | zoom out | fullscreen (`item-fullsize-desktop.png`), кнопка «Загрузить JPEG (4.78 MB)» с размером файла — для сканов.
5. Вьюер на OpenLayers + IIIF (ol ^10.5 ol/source/IIIF) — можно взять паттерн MediaImageViewer.vue (EUPL-1.2 — лицензию учесть) и IIIF Presentation-манифест на документ.
6. Поиск: строка под шапкой с chip активного запроса "vermeer x", счётчик "1,616 RESULTS FOR", справа фильтры-селекты (`search-desktop.png`); автоподсказки по сущностям (agent/concept/place/timespan) — для фондов/персон/мест.
7. Masonry-карточки: radius 4px, тень 0 1px 3px rgba(0,0,0,.25), превью в натуральной пропорции, под ним название + организация (`gallery-desktop.png`).
8. Чипы связанных коллекций с круглой иконкой («Discover related collections») — для связей фонд -> темы.
9. Шапка 56px sticky, uppercase 14px/600 меню, синее подчёркивание активного (`home-desktop.png`).
10. Футер: миссия курсивом + EU-лого + селект языка (`item-desktop-full.png`), плавающая кнопка Feedback.

## Не удалось / ограничения
- Mobile с iPhone UA: Cloudflare challenge (зафиксировано, `raw/home-mobile.json` старого прогона перезаписан); использовал мобильный viewport без смены UA.
- Видео/медиа в главе при снимке не успели подгрузиться (пустые блоки на full-page скрине).
- Брейкпоинты/цвета брались из computed style и media; значения @europeana/style (SCSS-переменные) не читались из репо.
- Глубокий зум во вьюере (тайлы IIIF Image API) не снят — загрузка full-size не завершилась за 5 с (виден спиннер).
- Gallery mobile full-page 19 949px обрезана до 9000px.
