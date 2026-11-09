# The National Archives (UK) - живой реверс, 2026-11-09

Снято в своём Chrome (CDP 9342): desktop 1440x900, mobile 390x844 (iPhone UA, DPR 2). Числа - getComputedStyle и CSS-правила живых страниц; палитра/шкалы сверены с открытым SCSS https://github.com/nationalarchives/tna-frontend (v1.6.3, MIT). Сырьё - `raw/`, токены - `tokens.json`, скрины - `shots/`.

Страницы (скрины `shots/<name>-{desktop,mobile}-{fold,full}.png`):
- `tna-home` - https://www.nationalarchives.gov.uk/ (+ `tna-home-desktop-fold-dark.png`, тёмная тема)
- `tna-explore` - /explore-the-collection/
- `tna-story` - /explore-the-collection/stories/freddie-mercurys-naturalisation-certificate/
- `disc-search` - https://discovery.nationalarchives.gov.uk/results/r?_q=domesday book&_hb=tna (старый Discovery)
- `disc-record` - Discovery /details/r/C10829294 (запись с иерархией PRO -> Division -> PRO 57 -> Subseries -> запись)
- `cat-search` - beta.nationalarchives.gov.uk/catalogue/search/?q=domesday+book (новый каталог "etna")
- `cat-record` - /catalogue/id/C6530/ (уровень SERIES, E 31)
- `cat-piece` - /catalogue/id/D7310477/ (уровень ITEM, E 31/2/2/3498)

## 1. Стек и дизайн-система
- Главный сайт: Wagtail/Django (репо https://github.com/nationalarchives/ds-wagtail), вёрстка на **TNA Frontend** (https://github.com/nationalarchives/tna-frontend, MIT, доки https://nationalarchives.github.io/tna-frontend/, сайт https://design-system.nationalarchives.gov.uk/, репо https://github.com/nationalarchives/design-system). JS без фреймворка: `main.min.js`, модули через `data-module="tna-global-header"`. Версионированные статика `static/main.css?v=26.11.06.2040`.
- Новый каталог (beta.nationalarchives.gov.uk/catalogue): те же `tna-*` классы + свой `etna-accordion`; плашка "Beta / This is a new service".
- Старый Discovery: ASP.NET, jQuery 3.4.1, jQuery UI autocomplete (CSS подключён), hopscotch-тур ("Would you like to see a tour of this page?"), React-компоненты с cdn.nationalarchives.gov.uk/react-components/dist/discovery-1.2.9.js. Версия в футере "Version 7.16 - October 2026". На записях висит баннер "We're working on a new version of this page - View in our new-look catalogue" (ссылка на beta/catalogue/id/<ID>).
- Другие открытые репо TNA: discovery-api, annosearch (IIIF content search), front-end-development-guide, ds-caselaw-frontend.
- Состав компонентов в tna-frontend (из репо): accordion, back-link, breadcrumbs, button, card, checkboxes, compound-filters, cookie-banner, date-input, date-search, details, error-summary, files-list, footer, gallery, global-header, hero, index-grid, pagination, panel, phase-banner, picture, radios, search-field, secondary-navigation, select, sidebar, skip-link, tabs, tags, text-input, textarea, warning.

## 2. Токены (факты)
Шрифты:
- Заголовки: **Supria Sans Condensed** 500 (Adobe Typekit, https://use.typekit.net/kaq6qqh.css; платная лицензия) - fallback "Arial Narrow".
- Текст: **Open Sans** 400-700 (Google Fonts variable). Моно-деталь: **Roboto Mono** 400/500 (чипы, подзаголовок героя, шифр дела, поиск по датам; в Discovery - h1/h2).
- Иконки: Font Awesome 7 Free woff2 с /static/assets/fonts/.

Шкала (px): body 19/33.25 (lh 1.75; 18 на <=1024, 17 на <=480); h1(xl) 64/70.4 (48 на medium, 36 на small); h-l 36 (32/29) lh 1.15; h-m 22 (21) lh 1.4; h-s 19 lh 1.5; кнопка 18/32 bold; фаза-баннер 16/28.
Палитра: чёрный #010101, тёмно-серый #26262a, светло-серый #d9d9d6, фон страницы #f4f4f4, текст #343338, ссылка #005fa3 (visited #634abb), контрастный хедер/футер #1e1e1e; акценты forest #00623b, navy #004c7e, blue #00b0ff, yellow #fc0 (подсветка совпадений и фокус); пастели cream #f9f7e2, pastel-green #dde5d5, pastel-blue #d4e5ef, pastel-pink #fad3d4, pastel-orange #f9e1bc. Три темы: светлая, тёмная (#212223, ссылки #00b0ff), high-contrast; переключатель System/Light/Dark в футере (полоска 48px).
Сетка: контейнер max **1280**, padding 16; 12 колонок (6 на <=1024, 4 на <=768, 2 на <=480), gutter 32; брейкпоинты 480/768/1024 (30/48/64em; CSS-переменные `--media-breakpoint-*`). Секция padding 48px 16px. Шаг отступов 16px (xs .5, s 1, m 2, l 3, xl 5, xxl 8 единиц; на мобиле мельче).
Формы: радиус 2px (и "0.1px" почти везде), **теней нет вообще** (box-shadow none на выборке 2500 узлов), бордеры 1px keyline, толстые акценты 5px/8px; кнопка 48px, border 4px solid в цвет фона, padding 4/16.
Ссылки: underline, толщина 1.5px (4.5px у крупных заголовков карточек), offset 0.125em.

## 3. Компоненты
- Шапка: фаза-баннер 44px (BETA + текст) + верхняя утилитная строка (Search, Shop - иконка+16px) + логотип-квадрат 96x96 слева + навигация справа в 2 колонки, 6 пунктов (Visit, What's on, Explore the collection, Help using the archive, Education, Professional guidance and services), каждый пункт с нижней линией, строка 36px. Высота шапки 234px вместе с баннером. Не sticky (position static). Мобайл: баннер в 3 строки (~100px), логотип ~56px + "Menu" и бургер.
- Поиск: на www - иконка "Search" в шапке; в каталоге - поле 48px (рамка 2px #010101) + чёрная квадратная кнопка 48x48 с лупой; под полем ссылки "Start new search / Start new advanced search". Автоподсказок на новом каталоге не обнаружено (не проверял ввод вручную); в старом Discovery подключён jQuery UI autocomplete.
- Фасеты/фильтры: Discovery - "Filter results", аккордеоны "Held by (The National Archives (24,363) > Available for download only (24,233) | Other archives (2,634))", "Date" с чекбоксами диапазонов (Dates unknown (447), 1950+ (80)...); вкладки "Records 26,997 | Record creators 0". Новый каталог: левая колонка фильтров, вкладки "Records at the National Archives (24,383)" / "Records at other UK archives (2,199)", "Sort by" select, переключатель список/сетка, "Showing results 1-20 of 24,383".
- Карточка в выдаче (новый каталог): рамка 1px, моно-чип уровня (**PIECE / ITEM / SERIES**), заголовок-ссылка с шевроном, подсветка совпадений жёлтым #fc0, таблица "Held by / Date / Reference".
- Карточка дела: чип уровня, h1 64px supria, "Catalogue reference: [E 31/2/2/3498]" моно-плашкой, два бокса pastel-green ("What's it about?" и "View options"), аккордеон "Full description and record details" с переключателем "Hide field descriptions" - у каждого поля своя подсказка в скобках (напр. "Reference (The unique identifier to the record described...)"), блоки "How to order it", "Series information", "Catalogue hierarchy" (счётчик "Over 27 million records"), "Related records", вторичная навигация-вкладки "About this record | What is this page?".
- Иерархия: Discovery - блок `#hierarchy` "You are in": The National Archives' catalogue -> PRO (Department) -> Division -> PRO 57 (Series) -> Subseries -> "This record (browse from here by hierarchy or by reference)", у каждого уровня ссылка /browse/r/h/<ID>. Уровни называются прямо в тексте ("Division within PRO", "Subseries within PRO 57"). Номера: C235 -> C656 -> C12096 -> C85042 -> C10829294.
- Скан/просмотрщик: **IIIF-вьюера на каталожных страницах не найдено** - у item E 31/2/2/3498 написано "This record is available online and can be downloaded. How to view it". Для историй - галерея "Image 1 of 3" на тёмной полосе #1e1e1e с крупным статичным фото и подписью (`tna-gallery`).
- Хлебные крошки: "Home > Explore the collection > Stories from the collection", высота 33px, подчёркнутые ссылки, шеврон-разделитель.
- Футер: высота 802px, адрес (Kew, Richmond TW9 4DU), соцсети, Quick links, Other websites (включая ссылку на Design System), подписка на рассылку, юр-ссылки, "All content is available under the Open Government Licence v3.0", полоса темы.
- Переключатель языка: нет (одноязычный). Есть ссылка Accessibility/FOI/T&C/Privacy/Cookies.
- Cookie-баннер: свой компонент `tna-cookie-banner` (padding 32px, кнопки Accept/Reject cookies + "Set cookie preferences").

## 4. Движение
Минимум: transition только `outline-offset .1s, box-shadow .1s` (кольцо фокуса). hover кнопки = инверсия цветов (чёрная -> белая) без анимации. Единственная анимация - `image-loader-background 1.2s ease-in-out infinite` (пульсирующая серая подложка под ленивыми картинками - по сути image-skeleton); skeleton-блоков для текста нет. Учитывает `prefers-reduced-motion`, `prefers-contrast: more`, `forced-colors`.

## 5. Что украсть для Госархива ВКО (с цифрами)
1. **Моно-чипы уровня описи**: PIECE/ITEM/SERIES - Roboto Mono 16px, uppercase, фон forest #00623b, белый текст, padding 0 10px (`cat-piece-desktop-fold.png`, `cat-search-desktop-fold.png`). Для ВКО: ФОНД / ОПИСЬ / ДЕЛО / ДОКУМЕНТ (кириллица в Roboto Mono есть).
2. **Шифр дела крупно в моно-плашке** под h1: "Catalogue reference: E 31/2/2/3498" (`cat-piece-desktop-fold.png`) - у нас "Шифр: Ф. 12 / Оп. 1 / Д. 345".
3. **Аккордеон "Full description" + переключатель "Hide field descriptions"** - каждое поле с пояснением, что оно значит (`cat-record`). Для ТЗ (доступность для неспециалистов) - сильный ход.
4. **Блок "You are in" с уровнями иерархии и ссылкой "browse from here by hierarchy | by reference"** (`disc-record-desktop-fold.png`) + счётчик "Over 27 million records" в блоке иерархии нового каталога.
5. **Два бокса pastel-green #dde5d5 "What's it about?" / "View options"** на карточке дела: человеческое объяснение + как получить копию ("available online and can be downloaded. How to view it"). Для ВКО: "О чём дело" + "Как заказать / читальный зал".
6. **Вкладки-счётчики над выдачей** "Records at TNA (24,383) | at other archives (2,199)": активная = подчёркивание 5px forest, неактивная = синяя ссылка. Аналог: "Госархив ВКО / Региональные архивы".
7. **Бескомпромиссная плоскость**: 0 теней, радиус 2px, бордеры 1px keyline #26262a/25%, толстые 5px акценты. Для гос-сайта: меньше "слопа", больше читаемости.
8. **Типографика для читаемости**: body 19px/1.75, h1 64/70.4 condensed 500, контейнер 1280, ширина читаемой колонки ~816px у featured-card (`tna-home-desktop-fold.png`). Condensed-гротеск (аналог - свободные Roboto Condensed / PT Sans Narrow с кириллицей) + Open Sans (кириллица есть).
9. **Три темы** (System/Light/Dark + high-contrast) через переключатель-полоску 48px в футере; дёшево на CSS-переменных и сильно для a11y в ТЗ.
10. **Hover кнопки без анимации - инверсия** (чёрная #010101 <-> белая) + кольцо фокуса 4px border + outline-offset .1s: понятно слабовидящим, нет "анимационного слопа".

## Не удалось / оговорки
- IIIF/OpenSeadragon-вьюер у TNA не обнаружен ни в DOM, ни в network на страницах каталога (отдают скачивание); для Image-вьюера смотреть Nationaal Archief.
- Автоподсказки поиска на новом каталоге не проверял вводом; открытое меню мобайла (Menu) не снимал; тёмную тему снимал только на главной (fold).
- Часть computed-значений в `raw/` снята в dark scheme (системная тема Chrome); светлые значения взяты из SCSS и светлых скринов.
- Discovery показывает свой cookie-баннер (синяя полоса) на скринах - это реальное состояние при заходе с другого поддомена.
