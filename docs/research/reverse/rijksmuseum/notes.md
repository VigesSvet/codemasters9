# Rijksmuseum (rijksmuseum.nl) — факты с живых страниц, 2026-11-09

Снято в Chrome/CDP: desktop 1440x900, mobile 390x844 (iPhone UA). Скрины в `shots/`, сырые выгрузки getComputedStyle/CSS/network в `raw/`, токены в `tokens.json`.
Страницы: главная /en, выдача /en/collection/search?query=vermeer, объект /en/collection/object/The-Milkmaid--42dd0e658c2979aec8e144d2357c55c0 (SK-A-2344), история /en/story/10-things-about-carel-visser, список /en/stories.

## Стек
- Главная/stories/CMS-страницы: ASP.NET (заголовок x-powered-by), один CSS `rijksmuseum-app.css` (179 KB), без фреймворка на фронте. Коллекция (поиск, объект): Nuxt/Vue (`/_collection/*.css`, `/_collection/builds/meta/*.json`), API `GET /api/v1/collection/search?language=en&page=1&sortingType=Popularity&collectionSearchContext=Art&query=`.
- Дизайн-системы из открытых нет; в CSS-переменных `--ub*` (Unbranded-тема кнопок/типографики). Открытых репо не найдено (не искал глубже).
- Зум-вьюер: **Micrio** (`<micr-io>`, один `<canvas>`, WebGL). Картинки — **IIIF Image API 3.0 level2**: `https://viewer.micr.io/QkOGy/info.json` (tiles 1024, scaleFactors 1/2/4/8, форматы jpg/png/webp, 4649x5177, tileBasePath micrio.rijksmuseum.nl). Превью — `iiif.micr.io/{id}/{region}/{size}/0/default.webp`. Presentation manifest не используется. Это IIIF, но не OSD/Mirador/UV.
- Куки-баннер: Accept / "No, rather not". Трекеров много (GA4, Clarity, Meta, TikTok, Snap).

## Токены (подробно в tokens.json)
- Шрифт RijksText (свой), woff2 в /statics/fonts/, веса 400/700, кириллический фолбэк RijksCyrillicText. Заголовки UPPERCASE bold, lh 0.9–1.375.
- Флюидная типографика: body = calc(1rem + .125*((100vw-20rem)/100)) -> 17.4px при 1440, 16.09px при 390; h2 21.8px, h3 31.8px, h4 23.3px, h1 hero до ~106px (lh .9).
- Палитра (тёмная, единственная): фон #40474f, панели #343b42/#202327, футер #000, текст #fff, вторичный #c2ccce, акцент #cc4c28 (оранж.-терракота), бейдж #746100, серый #8c9095.
- Радиусы 2px везде (кнопки, инпуты, бейджи), теней почти нет. Кнопки h 50px, pad 0 20px, bold; hover = инверсия в белый/чёрный за 0.5s; focus = 0 0 0 3px #cc4c28.
- Сетка: полноширинная, без max-width; отступы по бокам 2.75vw (39.6px при 1440), flex-колонки 100/50/30/70%. Брейкпоинты (rem): 35.5 (568px), 50.75 (812px), 80 (1280), 90 (1440).
- Шапка 90px (20px 39.6px): бургер, лупа, Visit and tickets / Collection / Stories, справа Language / Login / Giftshop + оранжевая кнопка Rijksmuseum tickets. На главной прозрачная поверх hero, на коллекции — фиксированная панель #343b42 с кнопкой "< Collection", "Discover", "Art Explorer".
- Футер чёрный 447px: Visitor information (Open daily 9 to 17h, адрес), About/Press/Careers/Contact, Donate today/Newsletter, соцсети, логотипы партнёров, юр.ссылки.
- Движение: transitions 0.25–0.5s linear/ease; keyframes fade-in, slide-in (0.5s ease-in), spinner-*. Скелетонов нет: вместо них размытые превью (blur) -> webp, спиннер во вьюере.

## Страницы
- Главная (`shots/home-*`): hero на всю высоту экрана — картина (Ночной дозор) + гигантский логотип RIJKS MUSEUM 1280px шириной, бейдж OPEN TODAY, строка CTA 22px bold, логотипы спонсоров. Высота страницы 4047px (desktop).
- Выдача (`shots/search-results-*`, `search-filters-*`, `search-desktop.png`): 4 колонки по 360px, masonry-галерея вплотную без зазоров и подписей, на весь экран; поиск — плавающая плашка внизу окна (bg #343b42) с табами ARTWORKS (842779) / LIBRARY (360561) / VISITOR STORIES (211144) и кнопкой Filter 54x54. Фильтры: правая панель 552px — Sort on, View as, чекбоксы, 15 аккордеонов фасетов (Maker, People, Place, Subject, Event, Century, Period, Object type, Material, Technique, Asian art school, Catalogue, Museum hall, Exhibition, Maker role). Автоподсказок при вводе "vermeer" не появилось. Мобильная версия: 1 колонка, табы и поиск прижаты к низу.
- Объект (`shots/object-*`, `object-deepzoom-desktop.png`): шапка с бургером, "< Search", Discover, Art Explorer; на весь экран Micrio-вьюер (картинка, 3 кнопки зума справа внизу, зум по кнопке работает, колесо мыши — нет); ниже табы ABOUT/DATA, название 23.3px, описание 23.3px #c2ccce, бейдж "On display in Gallery of Honour", справа блок метаданных (Artwork type, Object number SK-A-2344, Dimensions, Physical characteristics), STORIES (3 карточки), DISCOVER MORE (3 больших размытых блока), CTA-полоса "Getting started with the collection".
- История (`shots/story-*`): полноэкранный hero с фото, H1 caps 31.8px на нём, лид 18.4px; дальше длинная лента блоков `story-page-block` (17 451px), цифры-индексы "01" 106px bold (heading-1.index) для 10 пунктов. Мобильная — та же вертикаль (17 000px).

## Что украсть для Госархива ВКО
1. Zoom-вьюер на весь экран над метаданными (`object-desktop-full.png`): картина 100vw x 100vh, метаданные ниже. Для сканов — IIIF Image API + плитки 1024 (`viewer.micr.io/.../info.json`).
2. Вьюер: 3 кнопки 50x50 стеком справа внизу на чёрном (zoom in/out/fullscreen) (`object-deepzoom-desktop.png`).
3. Плавающая поисковая плашка у нижнего края с табами и счётчиками ARTWORKS (842779) / LIBRARY (360561) — для архива: ДОКУМЕНТЫ / ФОНДЫ / ИСТОРИИ (`search-desktop.png`, `search-results-mobile.png`).
4. Фасеты в правой панели 552px: 15 аккордеонов, заголовки caps 18px bold, 1px разделители; на мобиле на весь экран (`search-filters-desktop.png`).
5. Кнопки: h 50px, radius 2px, акцент #cc4c28, hover-инверсия 0.5s (`home-desktop.png`).
6. Флюидная типографика: body = calc(1rem + .125*((100vw-20rem)/100)); h2 21.8px caps bold (токены).
7. Blur-превью вместо скелетонов + подмена на webp через IIIF-размер.
8. Лонгрид с гигантскими номерами 01..10 (106px) для хронологии/«10 фактов о фонде» (`story-desktop-full.png`).
9. Бейдж-статус на карточке ("On display in Gallery of Honour": bg #746100, 14.8px, pad 4px 10px, r 2px) — можно под «Оцифровано / В читальном зале».
10. Метаданные справа колонкой 4 пары ключ/значение + ссылка "View all data" и вкладки ABOUT/DATA (`object-desktop-full.png`).

## Не удалось / ограничения
- Автоподсказок поиска нет (не баг скрипта: ввод через Input.insertText, панель не появилась).
- Скролл-эффекты longread (parallax и т.п.) не исследовались, только статичные скрины; тёмная/светлая тема — одна тёмная.
- Колесо мыши во вьюере не зумит (только кнопки/жесты); тайловые запросы Micrio в логе network не поймал.
- Открытые GitHub-репо не искал.
- Крупные полностраничные PNG для story/search обрезаны на 9000px.
