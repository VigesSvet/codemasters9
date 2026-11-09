# Library of Congress (loc.gov) — факты с живых страниц, 2026-11-09
Chrome 156, CDP :9341, desktop 1440×900 / mobile 390×844 @2x. Скрины `shots/`, сырьё `tokens.json` (`_raw_computed`).
Страницы: `home` /; `search` /search/?q=maps; `item` /item/99447025/ (Western border states, карта); `viewer` /resource/g3700.cw0012700/ (тот же объект во вьюере); `collection` /collections/civil-war-maps/.

## Что не вышло / оговорки
- loc.gov режет частоту: один раз вместо страницы "Один момент…" (интерстишл), несколько раз `503 Service-Unavailable` (в т.ч. на /item/99447025 и /resource/…) — перезапросил с паузой, итоговые скрины чистые. `curl` без браузера получает 403.
- Первая выбранная item-страница (2003629611 "Ask USGS maps") оказалась каталожной записью без скана — заменил на карту с вьюером. Вьюер OpenSeadragon живёт **только на /resource/<id>/**, на /item/ — превью + кнопка "View Enlarged Image".
- Автоподсказки поиска, hover-состояния и тёмная тема на внутренних страницах не снимал (тёмная — только на главной).
- Точные URL woff2 из resource timing не получились (шрифты из кэша); путь выведен из `base.css` и проверен: `https://www.loc.gov/static/ui2/dist/css/OpenSans-Regular.woff2` → 200.

## Стек
Два поколения UI одновременно: **главная = «ui2»** (Bootstrap 5.3: `--bs-*`, `data-bs-theme="dark"` на `<html>`, 291 CSS-переменная на :root, htmx, Splide-карусели, Fancybox `--f-button-*`, Font Awesome 6; css `/static/ui2/dist/css/base.css`); **внутренние (search/item/resource/collection) = старый** `/static/stylesheets/base.css` + jQuery 1.8.2. Везде OpenSeadragon **2.3.1**. Аналитика Adobe DTM. Бэкенд не определил (Django-подобный, не доказано). Дизайн-система нигде не названа.
Репо github.com/LibraryOfCongress: `concordia` (краудсорс-транскрипция crowd.loc.gov, Django, 175★), `coding-standards` (JS), `fetch-vue`, `chronam`, `data-exploration`; репо самого loc.gov UI не нашёл.

## Токены
**Шрифты**: Open Sans 400/700 (+italic), Roboto Slab 400/700 (`--font-serif`), Sharp Grotesk Bold/SemiBold/Book/Light 20 (логотип/display), FA6 Free. Все woff2 лежат рядом с css.
**Внутренние страницы**: body Open Sans 14/21 `#242424` на `#f6f6f6`; шапка белая 145 px (140 + 4px оранжевая полоса `#f05129`); h1 item Roboto Slab 35/42 w700; h1 коллекции 21/25.2 w700; h2 17.5/21 w700; h3 14/16.8 w700; лейбл формата ("MAP") 12px w700; ссылки `#0076ad` w700; кнопки 18px w700 белый на `#242424`, h30; фон боковых блоков "Part of/Format" `#f6f6f6`/серые панели.
**Главная (ui2, dark)**: body 16/24 `#efefef` на `#121212`; h1/h2 Roboto Slab 36/43.2 w700; карточки `#242424`; footer `#1b1b1b` padding 32; ссылки на тёмном `#66adce`; кнопка `#0076ad`, радиус 6px, padding 6/12 h38.
**Палитра (:root)**: primary `#0076ad` (hover `#005e8a`), secondary `#545454`, success `#218739`, info `#00bde3`, warning `#face00`, danger `#d1332e`, border `gray`, light surface `#efefef`; радиус `.375rem` (sm .25, lg .625, pill 50rem), но реально доминирует **0** (23–33 места) — острые углы. Тени почти нет: фокус `0 0 0 .25rem rgba(0,118,173,.25)`, inset `0 1px 4px rgba(0,0,0,.2)`.
**Контейнер/сетка**: ui2 max 1320 (xxl), брейкпоинты BS 576/768/992/1200/1400; старые: 480/768/800/992/1040/1200 (+880 на коллекции). Контент внутренних страниц 1144 px (x=148…1292). Выдача: сайдбар фасетов 265 + отступ 27 + колонка результатов 851.
**Размеры**: поиск в шапке — форма 509×32 с рамкой 1px чёрной, без радиуса: select "Everything" 190 px (12px) + input 278 px + чёрная кнопка с лупой 39 px; бургер 36px справа. Результат: padding 21px 0, превью 200×200 `object-fit: contain` слева, hairline между строками; breadcrumb-полоса 39 px; футер 186 px (`#f6f6f6`, padding 35/40).
**Переменные ui2 для карточек**: `--card-image-aspect-ratio 1/1` (contain), `--card-list-columns 1fr 3fr`, `--card-label-font-size .8125rem` bold, `--card-title-font-size 1rem` bold, `--card-gallery-item-width 180px` (md 225), `--grid-view-item-width 150px`, `--rotating-featured-banner-width/height 1200×560` (xl 851×287), `--splide-arrow-size 2.5rem`, `--figure-max-width-desktop 33rem`.

## Компоненты
- **Шапка**: логотип LIBRARY OF CONGRESS (Sharp Grotesk, чёрный + оранжевый) слева, справа поисковая форма и гамбургер "Global Menu" (пункты: Discover, Services, Visit, Education, Connect, About, Ask a Librarian, Help, Contact). Не sticky (position static/relative). Мобайл: лого + чёрная кнопка-лупа (~38×32 css px по скрину) + бургер.
- **Поиск**: выпадающий scope ("Everything" / на коллекции "This Collection") + строка; на главной блок Trending ("Top Searches: World War II / Newspapers / Veterans / Civil War / Constitution / Civil Rights").
- **Фасеты** (search): "Refine your results", переключатель "Available Online 1 657 258 / All Items 3 228 833", затем сворачиваемые группы (Original Format: Newspaper 1 393 876, Book/Printed 123 993, Map 60 235…; Online Format, Date, Location…) — каждая ссылка с числом справа; сворачивание кнопкой "−" 14 px. Выбранные фильтры — "Refined by:" пилюли с × (радиус 99px, рамка `#0076ad`). Над выдачей "Results: 1-25 of 1,657,258", селекты **View** (List/Gallery/Grid) и **Sort By** с кнопкой "Go" (`#0076ad`).
- **Карточка выдачи**: слева превью 200×200 (если скана нет — серый плейсхолдер-иконка типа "Map"), справа лейбл формата (MAP, 12px bold caps) → заголовок-ссылка `#0076ad` bold → "Maps | Catalog Record - Electronic Resource Available" → 3 строки описания → Contributor/Date/Resource жирными лейблами.
- **Страница item**: h1 Roboto Slab, превью на серой плашке `#f6f6f6` с синей кнопкой на всю ширину "View Enlarged Image" и селектом скачивания "Download: JPEG (1060×1422px) Go"; затем "About this Item" (Title/Names/Created/Subjects… лейбл bold над значением) и справа сайдбар `#f6f6f6` "Part of" (Civil War Maps (2,338), Military Battles and Campaigns (4,557), Geography and Map Division (57,374)…), Format, Contributor, Dates, Location, Language, Subject — все значения ссылками-фасетами.
- **Вьюер**: **OpenSeadragon 2.3.1 + IIIF Image API** на `tile.loc.gov`: `…/image-services/iiif/service:gmd:gmd370:g3700:g3700:cw0012700/info.json`, тайлы `/0,0,8192,8192/512,/0/default.jpg` (size `w,`), превью `/full/266,/0/default.jpg`. Контейнер 675 px чёрный, сверху таб "Image" (синий), справа сверху 6 квадратных кнопок 38 px, белая обводка на чёрном: сброс/zoom−/zoom+/поворот/fullscreen/**вырезка (crop)**. Mirador/UV не используются.
- **Коллекция**: заголовок "COLLECTION / Civil War Maps", вкладки "About this Collection | Collection Items | Articles and Essays" (активная — подчёркнута 2px чёрным), потом та же выдача 2 338 объектов с фасетами. Хлебные крошки "Library of Congress » Digital Collections » Civil War Maps".
- **Главная**: ротатор 1280×~600 (Splide, стрелки 2.5rem, кнопка паузы синяя, подпись на полупрозрачной плашке `rgba(18,18,18,.75)`, счётчик "1/5"), под ним строка ссылок-подчёркнутых (Library Catalog / Digital Collections / Researchers / Visitors / Teachers / Blogs / More…), Trending, карточки.
- **Язык**: переключателя нет (только "Ask a Librarian"/Help).
- **Футер**: светлый `#f6f6f6` на внутренних, чёрный `#1b1b1b` на главной.

## Движение
Bootstrap-кнопки: `color/background/border/box-shadow .15s ease-in-out`; offcanvas `var(--bs-offcanvas-transition)`; `opacity .6s`; старое `0.3s` (меню), `height .1s cubic-bezier(.44,0,1,1)`. Keyframes — только спиннеры (`f-spinner-rotate 2s`, `fa-spin 1s steps(8)`). Есть `prefers-reduced-motion` в ui2. **Skeleton не используется** (классов skeleton/shimmer нет).

## Что украсть для Госархива ВКО
1. **Фасетная выдача 265 + 851 px**: переключатель "Available Online / All Items" с числами, группы Format/Date/Location со сворачиванием, пилюли "Refined by ×" (shots/search-desktop.png). Для ВКО: "Оцифровано / Все", Фонд, Период, Тип документа.
2. **Лейбл формата над заголовком** (12px bold caps) + заголовок-ссылка + мета жирными лейблами — самая компактная карточка выдачи; превью 200×200 `contain`.
3. **Сайдбар "Part of"** на карточке: счётчик в скобках у каждой родительской коллекции, все значения мета — ссылки-фасеты (shots/item-desktop-full.png). Это навигация фонд→опись из одной карточки.
4. **Крупная синяя кнопка "View Enlarged Image" на плашке превью + выбор формата скачивания** (JPEG 1060×1422) — открывает вьюер на отдельной странице, лёгкая страница item.
5. **Вьюер OSD 2.3.1 с 6 крупными квадратными кнопками 38 px, включая crop** (shots/viewer-desktop.png) — мобильный вариант (shots/viewer-mobile.png) оставляет те же кнопки в одну линию над сканом: удобно для пальца.
6. **Поиск со scope-селектом ("Everything" / "This Collection")** одной полоской 509×32, чёрная кнопка-лупа 39 px.
7. **Табы коллекции** "About / Collection Items / Articles and Essays" с чёрным underline 2px — простой паттерн для раздела "фонд".
8. **Тёмная главная + светлые внутренние** (`data-bs-theme=dark`, `#121212`, ссылки `#66adce`) — приём для витрины с крупными фото документов.
9. **Строка "Trending: Top Searches"** под ротатором (6 запросов ссылками) — замена блоку "популярные запросы" для ВКО (Метрические книги, ревизские сказки…).
10. **Пара Roboto Slab (h1 35/42 w700) + Open Sans 14/21**, ссылки `#0076ad`, острые углы (radius 0) — «библиотечный» строгий вид без декоративности.
