# Wellcome Collection (wellcomecollection.org) — реверс 2026-11-09

Снято живым Chrome (CDP, порт 9344), 1440x900 и 390x844 (@2x, iPhone UA), cookies = "Essential only".
Токены: `tokens.json` (getComputedStyle + npm-пакет `@wellcometrust/wellcome-design-system@2.1.0` + `common/views/themes/config.ts` из GitHub).
Страницы: главная; поиск по каталогу `/search/works?query=cholera`; карточка архивного работа `/works/h3t6hfqt` (Rogers, Sir Leonard > Clinical Notebooks > PP/ROG/B.11, 167 сканов); вьюер `/works/h3t6hfqt/items`; story `/stories/how-writing-helps-me-manage-schizophrenia`.

## Скрины (`shots/`)
- `home-desktop.png`, `home-desktop-full.png`, `home-mobile.png`, `home-mobile-full.png`, `home-card-hover-desktop.png`
- `search-desktop.png`, `search-desktop-full.png`, `search-mobile*.png`, `search-filter-open-desktop.png` (раскрытый фасет Formats)
- `work-desktop.png`, `work-desktop-full.png`, `work-mobile*.png` (карточка с иерархией)
- `viewer-desktop.png`, `viewer-grid-desktop*.png`, `viewer-zoomed-desktop.png`, `viewer-mobile.png`
- `story-desktop*.png`, `story-mobile*.png`
Ограничение: полностраничные кадры режутся на 9000 px.

## Стек (факты)
- Next.js 16.4.2 (pages router, `__NEXT_DATA__`), React 19, styled-components 6.4.2 (классы `sc-xxxx`), Prismic CMS. Источник: `content/webapp/package.json` в репо.
- Репо открыт, MIT: https://github.com/wellcomecollection/wellcomecollection.org (43 звезды, main). Дизайн-токены вынесены в npm `@wellcometrust/wellcome-design-system` 2.1.0 (https://github.com/wellcometrust/wellcome-design-system, MIT, только theme.json/css/js/d.ts).
- "cardigan" = Storybook витрина компонентов: каталог `cardigan/` в репо, Storybook 10.6.2 + nextjs-vite, 246 story-файлов; живой: https://cardigan.wellcomecollection.org (HTTP 200). Компоненты в `cardigan/stories/components/`: Accordion, Breadcrumb, Buttons, Cards, Footer, Header, Inputs, Pagination, Tabs, Tags, WorksSearchResults, NestedLists, Modals, SectionHeader, PageHeader, Quote, Tables, и др. (~55 папок).
- Вьюер: OpenSeadragon ^4.0.0 + `@iiif/presentation-3` ^2.2.4. Подтверждено в рантайме: `.openseadragon-container`, 1 `<canvas>`, после zoom запросы тайлов IIIF Image API `.../image/b32259931_0001.jp2/info.json`, `/0,0,3200,3200/400,/0/default.jpg`, `/1600,1600,1600,1600/400,/0/default.jpg` (тайлы 400 px), miniatury `/thumbs/<id>.jp2/full/max/0/default.jpg`, страница `/image/<id>.jp2/full/880,/0/default.jpg`.
- IIIF: манифест Presentation v3 `https://iiif.wellcomecollection.org/presentation/v3/b32259931`; доступ через IIIF Auth v2 (`/auth/v2/access/token?messageId=h3t6hfqt`). Сервер изображений DLCS.
- Cookie-баннер: Civic Cookie Control 9.x. Шрифты на `i.wellcomecollection.org/assets/fonts/`.
- Язык: только английский, переключателя нет.

## Дизайн-система (токены)
Шрифты (woff2: `Inter-Regular`, `Inter-SemiBold`, `wellcome-bold`):
- Wellcome (фирменный, только bold 700) — h1/h2/h3 и навигация; Inter 400/600 — текст и UI; IBM Plex Mono — подписи "Contains: 167 images".
- Размеры флюидные (clamp): f0 = `clamp(1rem, .25vw+.95rem, 1.25rem)` -> на 1440 = 18.8px; шкала f-3..f6: 0.69-0.75 / 0.81-0.88 / 0.88-1.06 / 1-1.25 / 1.13-1.5 / 1.25-1.81 / 1.44-2.19 / 1.63-2.56 / 1.81-3.13 / 2-3.75 rem.
- Измерено на 1440: body Inter 400 18.8/28.2 (line-height 1.5); h1 Wellcome 700 31.44/40.87, ls -0.5px; h2 26.3/34.2; h3 карточки 22.27/28.95; результат поиска h3 Inter 600 18.8/28.2; мета 13.66/20.5; метка/тег Inter 600 13.66/13.66; лид story 22.27/33.4; line-height: 1 / 1.3 / 1.5.
Палитра (живой сайт = "brand update", из theme.json):
- текст #223438 (neutral.70), фон страницы #FAFBF7 (neutral.05), шапка/панели #F5F6EE (neutral.10), hairline #D2D6D0, футер #223438 с текстом #F5F6EE.
- акцент primary #3B44BA (indigo.50; hover/active #242B7D), secondary #8FC7FF (blue.30), розовый #FFA5DC (pink.30, тег Exhibition/Article), зелёный #D9E3B3 (green.20, тег формата Books/Archives), оранжевый #F2824A (orange.40, плашка-акцент над заголовком секции 64x14px), фокус #FFEA00 (box-shadow 0 0 0 3px).
- Шкалы по 7-9 ступеней: neutral/pink/yellow/blue/indigo/teal/orange/green + ui.(blue|green|grey|yellow|red). Тёмной темы на сайте нет; тёмный только вьюер (#223438 панель, холст #111A1C).
Отступы/сетка: space.static 4/6/8/12/16/24/32/48/64/72/96 px; responsive space.sm = 8/12/16, md = 16/24/32, lg = 24/32/48, xl = 32/48/64 (mobile/768+/1024+). Сетка 6 колонок (mobile) / 12 (>=768), gutter 12/24/48, margin 16/20/72. Контейнер на 1440: 72..1368 = 1296 px (padding 5%).
Брейкпоинты: 20rem, 48rem (768), 64rem (1024), 90rem (1440), 120rem; для шапки 51.56rem и 65rem.
Радиусы: кнопки, теги, инпуты = 0 (квадратные), чипы/select = 20px (пилюля), иконочные кнопки 50%, модалка 6px; токены 0/2/4/8/16/9999.
Тени: единственная `0 2px 8px 0 rgba(18,18,18,.4)` (модалка).

## Компоненты (измерено)
- Шапка: высота 85px, `position: static` (НЕ sticky; fixed только при открытом мобильном меню), нижняя граница 1px #D2D6D0, логотип 128px, пункты Visit us / What's on / Stories / Collections / Get involved / About us — Wellcome 700 16.2px, padding 16px 4.8px, активный пункт подчёркнут синей полосой; справа иконка поиска (44px круг) и аккаунт. Mobile: бургер + логотип по центру + поиск, та же высота 85.
- Поиск: отдельная полоса над каталогом, label "Search the catalogue" (Inter 600), input h44 с рамкой 1px, внутри крестик очистки, кнопка Search primary 46px. Автоподсказок нет (проверено: после ввода "chol" listbox/combobox не появился). Вкладки All / Catalogue / Images / Events and exhibitions / Stories (активная жирная + синяя подчёркивающая полоса).
- Фасеты: ряд пилюль-чипов (Formats, Dates, Locations, Subjects, Types/Techniques, Contributors, Languages + "All filters" с иконкой-ползунками), border 1px #223438, radius 20px, h32, padding 8/8/8/16, переход background/border-color .15s ease; выпадающая панель (см. `search-filter-open-desktop.png`). Строка "3,310 results", select Relevance (тоже пилюля), пагинация "Page 1 of 133" + круглая стрелка.
- Строка выдачи (не карточка): без рамки/тени; тег формата (зелёный #D9E3B3, 13.7px/600, padding 4px) + тег "Online" (контур 1px) -> заголовок Inter 600 18.8px -> серая мета "Date: 1914-1919 | Reference: PP/ROG/B.11" -> "Part of: Rogers, Sir Leonard". Hover: подчёркивание заголовка.
- Карточка work (архивный объект): хлебные крошки с иконками уровней (архив > серия > единица, референс-код в конце: "Clinical Notebooks PP/ROG/B"), h1 Inter 600 26.3px, под ним "Date / Reference / Part of", теги, hairline. Две колонки: слева "Collection contents" 375px (дерево role=tree: кружки-шевроны, название + шифр PP/ROG/B.1 мелким серым; раскрытая ветка с тонкой синей направляющей), справа (x=480, w=856) "Available online" -> mono "Contains: 167 images" -> primary "View" с иконкой глаза -> "Licence and re-use" -> About this work -> Where to find it -> Permanent link. На mobile дерево заменено полноширинной кнопкой "Collection contents".
- Вьюер: сначала модалка Content advisory (белая 720px, radius 6px, кнопка "Show the content"); затем тёмная оболочка под шапкой: панель 52px #223438 = [Hide info] [переключатель Page|Grid] [счётчик 1/167 по центру] [Downloads (blue.30)] [Full screen]; левая инфопанель 330px (название, Date, Reference, "Catalogue details ->", аккордеон "Licence and re-use"); холст с изображением и две круглые белые кнопки справа внизу (Zoom in, Rotate). Сверху розовая полоска прогресса загрузки.
- Story: breadcrumbs "Home | Stories", h1 Wellcome 31.44px, лид 22.27px, строка "Words by ... | average reading time 6 minutes", дата, розовый тег Article, широкие фото, колонка текста 851px на 1440.
- Футер: #223438, padding-top 64px, высота 632px, 5 колонок ссылок, кнопка Back to top, форма Subscribe.
- Кнопки: primary #3B44BA/текст #F5F6EE, border 2px, padding 13px 20px, radius 0, Inter 18.8px; secondary #8FC7FF; tertiary — контур #223438.

## Движение
- Дефолт `transitionProperties: 150ms ease` (на ~135 узлах `all .15s ease`); ссылки навигации и заголовки карточек `color .4s ease`; `opacity,transform .35s ease`; keyframes fade-in / slide-up (.4s ease), slide-left/right/down, box-slide-up, hoverBounce (top 0 -> -0.4em -> 0).
- Skeleton-экранов нет (SSR + ленивая подгрузка); во вьюере индикатор загрузки (z-index 1000) и розовая полоса.
- z-index шкала: header 6, skipLink 7, modalOverlay 1002, modalWindow 1003, headerSearch 9999.

## Что украсть для Госархива ВКО (конкретно)
1. Хлебные крошки с иконкой уровня и шифром: Фонд > Опись > Дело, шифр в конце названия (`work-desktop.png`, 13.7-16px, иконки архив/папка). Прямая замена для иерархии фонд-опись-дело.
2. Дерево "Collection contents" в левой колонке 375px (шифр под названием серым мелким, раскрытая ветка с направляющей линией); на mobile сворачивать в одну кнопку на всю ширину (`work-mobile.png`).
3. Вьюер скана: OpenSeadragon + IIIF Image API (тайлы 400px, info.json) в тёмной оболочке: панель 52px, инфопанель 330px сворачиваемая "Hide info", переключатель Page/Grid, счётчик "1/167" (`viewer-desktop.png`). Для ВКО: свой IIIF-слой (Cantaloupe/ImageMagick -> pyvips) + manifest v3.
4. Модалка Content advisory перед показом чувствительных сканов (white 720px, radius 6px, primary + текстовая ссылка "назад") — годится для документов с персональными данными.
5. Выдача без карточек: тег формата + заголовок 600 + серая мета в одну строку через "|" + "Part of:"; тег "Online" контуром = "есть скан" (`search-desktop.png`).
6. Чипы-фасеты в ряд (пилюля 32px, radius 20, border 1px, шеврон) + "All filters" вместо левого сайдбара; счётчик результатов и сортировка в одной строке с пагинацией.
7. Палитра: тёплый off-white #FAFBF7 + угольно-зелёный текст #223438 вместо чёрного + один насыщенный индиго #3B44BA для действий + пастельные теги (#D9E3B3, #FFA5DC). Контраст #223438/#FAFBF7 около 12:1 (оценка по значениям).
8. Флюидная типографика на clamp (body 16-20px, h1 32-60px), Inter 400/600 + один фирменный display-шрифт только в bold; line-height 1.5 текст / 1.3 заголовки. Для кириллицы: Inter поддерживает.
9. Оранжевая плашка 64x14px над заголовком секции (`home-desktop.png`) как единственный декоративный приём; квадратные кнопки радиус 0 — строгий "архивный" вид.
10. Репозиторий дизайн-токенов отдельным npm-пакетом (theme.json -> css/js/d.ts) + Storybook (cardigan) — повторить в миниатюре: tokens.json + страница компонентов для жюри.

## Что не удалось / оговорки
- Hover-состояние карточки снято только через getComputedStyle (подчёркивание заголовка, color .4s); визуальной разницы кроме подчёркивания нет.
- Переключение Page/Grid и zoom во вьюере выполнены (grid, zoom in), тайлы IIIF подтверждены; мобильный вьюер (`viewer-mobile.png`): инфопанель скрыта по умолчанию (кнопка "Show info" + Downloads сверху), изображения идут вертикальной лентой, внизу переключатель Page/Grid и "Full screen". Счётчик страниц на mobile не виден.
- Cookie-баннер скрыт принудительным выбором "Essential only" в профиле Chrome.
