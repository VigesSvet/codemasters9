# NARA (US National Archives) — факты с живых страниц, 2026-11-09
Снято: Chrome 156, CDP :9341, desktop 1440×900 и mobile 390×844 (@2x, iPhone UA). Скрины `shots/`, сырьё в `tokens.json` (`_raw_computed`).
Страницы: `home` = www.archives.gov; `cat-home` = catalog.archives.gov; `cat-search` = /search?q=census; `cat-record` = /id/299998 (Emancipation Proclamation, 16 сканов); `cat-series` = /id/299955 (серия, уровень иерархии выше).

## Что НЕ удалось
- Выдача каталога по "census" не отрисовалась: фронт зовёт `/proxy/records/search?page=1&limit=20&q=census&abbreviated=true&debug=true&datesAgg=TRUE`, сервер (CloudFront/S3) отдаёт `index.html` вместо JSON (проверено curl, 3 попытки, 15–20 с ожидания). Остался `shots/cat-search-*.png` в состоянии skeleton (это тоже факт). Карточку выдачи/фасеты не снять. Рабочий API: `/proxy/v3/records/search?q=census&limit=2` (JSON, 37 320 340 записей), но UI его не использует.
- Dark theme нет ни у www, ни у каталога.

## Два разных сайта
| | www.archives.gov | catalog.archives.gov |
|---|---|---|
| Стек | Drupal 7 (`Drupal.settings`, модуль `archives_ui`) + Bootstrap 3 + jQuery 1.7.2 | React 17.0.2 SPA (CRA, `main.e03ca2f1.chunk.js` 815 КБ + vendor 2.3 МБ) + USWDS (336 `.usa-*` селекторов, `usa-button/input/card/pill/modal/alert`) |
| Шрифты | Source Sans Pro (body) + Merriweather (h), Google Fonts; FontAwesome 4.4 | Source Sans Pro Web, Merriweather Web, Trajan Pro (логотип), Roboto Mono Web; woff2 лежат в `/static/media/*.woff2` |
| Шапка | 118 px, static, логотип 1400-контейнер | 76 px, padding 8/32, фон `#162e51`, position relative (не sticky) |

## Токены (getComputedStyle)
**www**: body 16/22.86 400 `#050505`; h1 Merriweather 36/39.6 w500; плитка-h2 Merriweather 22/30 w700 белый на `rgba(0,0,0,.65)`, padding 24; ссылки `#1368ba`; input 18px h34 (BS3 padding 6/12); кнопка Search `#1e5799`, 14/20, radius 0 4 4 0; фон страницы `#2d4d76` вокруг белой 1400-колонки; новостная панель `#2a2a2a`; радиусы 3/4/6; тень `rgba(42,42,42,.1) 0 0 20px 10px` (только share-попап). Брейкпоинты: max 639, 437–318, 317.
**catalog**: body `-apple-system…` 16/18.4 `#1b1b1b`; h1 записи Merriweather Web 31.2/35.88 w400; h2 Source Sans 18.08/20.8 w700 `#3d4551`; поле поиска h39.3, radius 4 0 0 4, padding 0 12; ссылки `#005ea2`; muted `#71767a`; border `#dfe1e2`; кнопки `#276dc1`/`#1a4480`; футер `#162e51` текст `#dfe1e2`, высота 263; радиусы 0.25rem(12), 0.5rem, 99rem(pill, 17), 50%; USWDS-focus `inset 0 0 0 2px #71767a`. Контейнер записи max-width **1200**, колонка заголовка/мета **880**. Брейкпоинты (rem/em): 30, 40, 55, 64, 75em (+600px, max 29.99/39.99em).
Каталог не использует CSS-переменные :root (0 штук) — всё собрано в USWDS-классах.

## Компоненты
- **Поиск**: в шапке каталога на всю ширину (694×39 px + кнопка 75×47, радиус только с внешней стороны). Автоподсказки не проверены (выдача не работает). На www — справа вверху в белой шапке, placeholder "Search Archives.gov", 18px.
- **Хлебные крошки фонд→серия→единица** (cat-record): "Record Group 11: General Records of the US Government » Series: Presidential Proclamations", 16px `#005ea2`, h=20, на мобиле кнопка "Collapse". Над заголовком бейдж уровня "Item" (иконка слоёв).
- **Карточка записи**: h1 31px → "Other title:" bold → строка мета-иконок: NAID, тип (Textual Records), Produced (дата), "16 Images", "1 File", "17/17 have Transcriptions", разделители — вертикальные штрихи. На странице серии: Creators, NAID, Collected/Covers, "7 File Units / 47 Items", плашка "Partially Available in the Catalog", блоки Description/Arrangement/Dates/Languages/Access/Use/Subjects.
- **Просмотрщик**: **OpenSeadragon + IIIF Image API 3** (`/iiif/3/<lz%2Fdc-metro%2Frg-011%2F299955%2F299998%2F…at_ac.jpg>/info.json`: ImageService3 level2, tiles 512×512, scaleFactors 1–16, sizes 84…1351, maxArea 10 000 000; пример тайла `/0,0,4096,4096/512,512/0/default.jpg`). Не Mirador/UV. Полноширинный чёрный `#1b1b1b` блок 1264×656, слева круглые OSD-кнопки (+/−/home PNG из `/images/openseadragon/`, 4 состояния rest/grouphover/hover/pressed), справа рейка миниатюр 176 px с номерами страниц и кнопка "Show Details", сверху таб-бар "Transcription Available | Tags 0 | Comments 0 | Extracted Text 0".
- **Футер**: каталог — `#162e51`, ссылки Help/Veterans/FOIA/USA.gov/API Documentation/Contact/Privacy/Accessibility. www — 10 колонок-заголовков ("Information For… / Publications / Orgs. & Offices / About Us / I Want To… / Participate"), серый фон `#f5f5f5`, высота 721.
- **Язык**: только ссылка "En Español" (www). В каталоге переключателя нет.
- **Мобайл** (cat-record-mobile): шапка = лого + "Menu" + "Log in/Sign Up", поиск второй строкой, синяя полоса с иконками Print/Share/Options, OSD-контролы в левом верхнем углу, рейка миниатюр уходит. www-mobile: 5 цветных плиток-ссылок по 60 px высоты в столбик с фото справа.

## Движение
Каталог: `opacity .15s ease-in-out`, `right .1s ease-in-out .1s`, `transform .6s ease-in-out`, `width 1s`; keyframes `slidein-left .3s ease-in-out`, `toast-in-right .7s ease`, `spin 1s linear infinite`, **`shine 2s linear infinite`** (класс `.block-load/.block-load-anim`). **Skeleton есть**: на выдаче 4 карточки (превью 80×80 + заголовок + 3 строки) и скелет фасетов слева (shots/cat-search-desktop.png). www: только `a2aFadeIn .2s` от виджета шеринга.

## Репозитории
github.com/usnationalarchives: `Catalog-API` (Python, 168★), `catalog-source` (Java, исходники старого каталога, 2022), `NARA-web-components` (monorepo), `nara-iiif` (эксперименты с IIIF, 2019), `sandbox` (демо страниц archives.gov). Фронта нового React-каталога в открытом доступе не нашёл.

## Что украсть для Госархива ВКО
1. **Хлебные крошки как путь фонд→серия→единица + бейдж уровня** (shots/cat-record-desktop.png): 16px `#005ea2`, над h1 бейдж "Item" с иконкой. Прямо ложится на фонд→опись→дело.
2. **Мета-строка с иконками** под заголовком (NAID | тип | дата | кол-во сканов | файлы | транскрипции), 16px, тонкие вертикальные разделители; на мобиле переносится в 3–4 строки.
3. **Тёмный полноширинный вьюер** `#1b1b1b`, 656 px высотой, справа рейка миниатюр 176 px с номерами, над ним таб-бар счётчиков (Транскрипция/Теги/Комментарии/Текст). IIIF 3 + OpenSeadragon = можно взять как есть.
4. **Счётчик "17/17 have Transcriptions" и таб Transcription** — идея для краудсорс-расшифровки рукописей/метрик.
5. **Skeleton выдачи**: серые `#f0f0f0` блоки, `shine 2s linear infinite`, 4 карточки + фасеты; снимает пустой экран при медленном API.
6. **Плашка полноты оцифровки** на уровне серии: "Partially Available in the Catalog — 53 Items (198 digital objects) ready to view" (shots/cat-series-desktop.png). Для ВКО: "оцифровано N из M дел".
7. **Пять цветных плиток-входов на главной** (www, 5×280×320 px, duotone-фото + Merriweather 22/30 caps в плашке `rgba(0,0,0,.65)`; на мобиле стек по 60 px). Быстрые сценарии: исследовать / справки / педагогам / посетить / документы.
8. **Шапка каталога**: тёмно-синяя 76 px с огромным полем поиска (694 px) и кнопкой в одну линию; под ней вторая полоса действий (Print/Export/Share/Options). Не sticky — экономит высоту экрана.
9. **USWDS-подобная палитра**: `#162e51` шапка/футер, `#005ea2` ссылки, `#1b1b1b` текст, `#dfe1e2` бордеры — готовая контрастная гос-палитра (WCAG), радиусы 0.25rem.
10. Пара шрифтов **Merriweather (h1 31/36, w400) + Source Sans (UI 16/18, h2 18 w700)**: serif только для названия документа, всё остальное — гротеск.
