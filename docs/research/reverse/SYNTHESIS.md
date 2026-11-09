# Синтез реверса 8 сайтов → дизайн-система Госархива ВКО v1

Источник: `docs/research/reverse/<site>/{notes.md,tokens.json,shots/}`, снято 2026-11-09. Скрины указаны как `<site>/<file>`. Всё, что ниже не помечено «наше», взято с живых страниц. Старые `docs/mockups` и `docs/brainstorm` не использовались.
Проверено отдельно (2026-11-09): казахские буквы в Google Fonts (fontTools по файлам cyrillic + cyrillic-ext), лицензии репозиториев через GitHub API и npm.

---

## 1. Сводная таблица

| | Стек | Шрифты | Базовый текст | Контейнер | Радиус | Тени | Акцент | Вьюер | Тёмная тема | Скелетоны |
|---|---|---|---|---|---|---|---|---|---|---|
| **NARA** (US) | www: Drupal 7 + BS3; каталог: React 17 CRA + USWDS | Source Sans Pro + Merriweather (заголовок документа), Roboto Mono | 16/18.4 (каталог), 16/22.9 (www) | 1200, колонка мета 880 | 4px, pill | почти нет | `#005ea2`, шапка/футер `#162e51` | OpenSeadragon + IIIF Image 3, тайлы 512, рейка превью 176 | нет | **есть**: `shine 2s linear`, 4 карточки + фасеты |
| **LoC** (US) | главная: BS 5.3 + htmx; внутренние: jQuery 1.8 | Open Sans + Roboto Slab | 14/21 (внутр.), 16/24 (главная) | 1144 (внутр.), 1320 | **0** (токены .375rem не используются) | только фокус | `#0076ad`, полоса 4px `#f05129` | OSD 2.3.1 + IIIF, тайлы 512, кнопки 38px + crop | только главная (`data-bs-theme=dark`, `#121212`) | нет |
| **TNA** (UK) | Wagtail/Django + **TNA Frontend** (MIT), без JS-фреймворка | Supria Sans Condensed 500 (Typekit, платный) + Open Sans + Roboto Mono | **19/33.25** (lh 1.75; 17 на ≤480) | **1280**, 12 кол., gutter 32 | 2px | **ноль** (2500 узлов) | forest `#00623b`, ссылка `#005fa3`, жёлтый `#fc0` | IIIF нет, скачивание; галерея на `#1e1e1e` | **System/Light/Dark + high-contrast** | только пульс под картинкой 1.2s |
| **Nationaal Archief** (NL) | Drupal 10 + jQuery; выдача — Angular; вьюер — Vite-модуль | Source Sans 3 + Source Serif 4 | 16/24 | 1376 (внутри 1344, поля 48) | 0 | мягкие `0 0 3px rgba(0,0,0,.09)` | `#01689b` + `#cce0f1` | OSD + IIIF (IIPsrv), тайлы 256, свой тулбар, вкладка «Транскрипция» | нет | нет |
| **Rijksmuseum** (NL) | ASP.NET + Nuxt (коллекция) | RijksText (свой, кириллица отдельным файлом) | fluid 16→17.4 | во всю ширину, поля 2.75vw | 2px | нет | `#cc4c28` на `#40474f` | **Micrio** (WebGL) + IIIF Image 3, тайлы 1024 | только тёмная (одна) | нет (размытое превью) |
| **Europeana** (EU) | Nuxt 2 / Vue 2 + BS 4.6, `@europeana/style`, Contentful | Open Sans + Ubuntu | 16/24; выставка 18/27 | колонка 920 / текст **730** | 4px (инпуты 6–8) | `0 1px 3px rgba(0,0,0,.25)` | `#0a72cc` | **OpenLayers** `ol/source/IIIF`, Presentation 2 | нет | нет |
| **Wellcome** (UK) | **Next.js 16 + React 19** + styled-components, Prismic, Storybook «cardigan» | Wellcome (bold) + **Inter** 400/600 + IBM Plex Mono | **clamp 16→20** (18.8 на 1440), lh 1.5 | 1296 (поля 5%), 6/12 кол. | 0; чипы 20px; модалка 6 | одна: модалка `0 2px 8px rgba(18,18,18,.4)` | indigo `#3B44BA`, текст `#223438` | **OSD 4 + IIIF Presentation 3 + Auth 2**, тайлы 400 | нет (только вьюер тёмный) | нет |
| **Riksarkivet** (SE) | ASP.NET MVC + Bootstrap 2 + jQuery | Open Sans + Roboto | 14/18.2 | 940 | 4–4.8px | `0 1px 2px rgba(0,0,0,.25)` | `#0D5C91` + золото `#E8A621` | **Universal Viewer 4.2.1** (OSD внутри), IIIF, тайлы ~679 | нет | нет |

Что из таблицы следует:
- **Вьюер:** 6 из 7 сайтов с вьюером используют IIIF Image API, 5 — через OpenSeadragon. Mirador не у кого.
- **Форма:** у 6 из 8 радиус 0–2px, теней нет или они почти незаметны. Стиль «карточки со скруглением 16px и мягкой тенью» не встречается ни у кого, у нас его не будет.
- **Тёмная тема:** полноценная только у TNA. Скелетоны: только у NARA. У ВКО есть и то и другое — это наше отличие.
- **Чего нет ни у кого:** карты филиалов, ИИ-помощника и казахского языка. Эти экраны собираем из наших токенов, без референса 1в1 (см. §5).
- **Пробелы съёмки:** выдача и карточка Riksarkivet закрыты капчей ALTCHA. Выдача NARA не отрисовалась, есть только скелетон. Digitalarkivet не работал (5xx).

---

## 2. Паттерны: как сделано у лучших и что берём

### 2.1 Шапка + поиск
| Сайт | Как | Скрин |
|---|---|---|
| TNA | фаза-баннер 44 + утилиты (Search, Shop) + лого 96×96 + меню в 2 колонки с линиями, всего 234px, тёмная `#1e1e1e`, не sticky | `tna/tna-home-desktop-fold.png` |
| NA | белая утилитная строка (корзина, вход, Contact, **глобус + язык**, Zoeken) + лого справа → синяя полоса меню **46px**, активный пункт `#cce0f1` → полоса крошек 53px | `nationaalarchief/na-inventaris-desktop-fold.png` |
| NARA каталог | тёмно-синяя `#162e51` 76px: лого + **поле 694×39** + Search + Advanced + Help; ниже полоса действий Print/Share/Options | `nara/cat-record-desktop.png` |
| LoC | поиск со **scope-селектом** «Everything / This Collection» 509×32 + чёрная лупа 39px; сверху 4px оранжевая полоса | `loc/search-desktop.png` |
| Wellcome | 85px, `#F5F6EE`, линия 1px `#D2D6D0`, меню 16px, активный пункт подчёркнут; на страницах каталога под шапкой отдельная полоса «Search the catalogue» (input 44 + кнопка 46) | `wellcome/search-desktop.png` |

Не sticky у 7 из 8 сайтов, sticky только у Europeana (56px).
**Берём для ВКО:**
- **Утилитная строка 40px (NA):** телефон и часы работы, соцсети, `KZ | RU | EN`, переключатель темы. Из ТЗ закрываются пункты «контакты», «соцсети», «языки», «тема».
- **Основная строка 80px (между NARA 76 и Wellcome 85):** герб, полное название в две строки (Riksarkivet: лого + подпись), меню из 6 пунктов (Wellcome 16px, активный пункт подчёркнут 4px), справа золотая кнопка «Электронный каталог» (Riksarkivet `#E8A621`, тёмный текст).
- **Над шапкой полоса 4px `--gold`** (LoC 4px, Riksarkivet 6px).
- **Поиск в шапке:** на обычных страницах — компактная форма со scope-селектом «Везде / Каталог / Выставки / История региона» (LoC). На страницах каталога — полноширинная полоса поиска под шапкой: input 48 и чёрная квадратная кнопка 48×48 (TNA `cat-search`), под ней ссылка «Расширенный поиск» (TNA).
- **Шапка не sticky** (большинство сайтов).
- **Мобайл 64px:** лого, лупа, «Меню» (TNA/NARA). Языки и тема — внутри меню первой строкой.

### 2.2 Выдача + фасеты
| Сайт | Как | Скрин |
|---|---|---|
| LoC | сайдбар фасетов **265 + 27 + 851**; радио «Available Online 1 657 258 / All Items»; группы со счётчиками справа и кнопкой сворачивания; «Refined by:» — пилюли с × (рамка `#0076ad`); View/Sort; превью 200×200 `contain`; лейбл формата 12px caps | `loc/search-desktop.png` |
| NA | **8 вкладок-типов со счётчиками** «Archieven (83) \| Fotocollectie (2) …»; слева 312px: «Periode» — **два number-поля + двухручковый слайдер**, чекбоксы со счётчиками; результат = код фонда + название + годы, «Snel overzicht zoekresultaten (11)» раскрывает совпавшие единицы описи; на мобиле «Filters» и «Weergave» 2×48 | `nationaalarchief/na-zoeken-desktop-fold.png`, `-mobile-fold.png` |
| TNA | вкладки «Records at TNA (24,383) \| other archives (2,199)», активная = подчёркивание 5px; «Showing results 1–20 of 24,383»; Sort + переключатель список/сетка; карточка с рамкой 1px, **моно-чип уровня** PIECE/ITEM, **подсветка `#fc0`**, таблица Held by / Date / Reference | `tna/cat-search-desktop-fold.png` |
| Wellcome | фасеты-пилюли в ряд (h32, r20) + «All filters»; строки без рамок: тег формата `#D9E3B3` + «Online» контуром → заголовок 600 → мета через « \| » → «Part of:»; «Page 1 of 133» | `wellcome/search-desktop.png` |
| NARA | скелетон: 4 карточки (превью 80×80 + 3 строки) + фасеты, `shine 2s linear infinite` | `nara/cat-search-desktop.png` |

**Берём для ВКО:**
- **Сайдбар фасетов 280px слева (LoC/NA).** Пилюли Wellcome не берём: в ТЗ 12 параметров поиска, ряд пилюль их не вместит. Состав сайдбара:
  - сверху переключатель «Только с цифровой копией N / Все N» (LoC, Riksarkivet);
  - «Период»: два поля «с/по» и слайдер (NA);
  - чекбоксы со счётчиками: Фонд, Тип документа, Филиал, Населённый пункт, Тематика, Язык, Доступ (LoC/NA).
- **Над выдачей:**
  - вкладки-типы со счётчиками: «Дела (N) | Фонды (N) | Фото (N) | Карты и чертежи (N) | Выставки (N) | История региона (N)» (NA). Активная вкладка подчёркнута 5px `--accent` (TNA);
  - строка «Найдено 1 234 · Сортировка · Список/Сетка» (TNA);
  - пилюли «Выбрано: … ×» и «Сбросить всё» (LoC, требование ТЗ «сброс фильтров»).
- **Строка результата (без карточной рамки, как у Wellcome):**
  - моно-чип уровня ДЕЛО / ФОНД / ОПИСЬ (TNA) и тег «Оцифровано» контуром (Wellcome «Online»);
  - заголовок-ссылка 600, совпадения подсвечены `--mark` (TNA);
  - мета одной строкой: «Ф. 12 · Оп. 1 · Д. 345 | 1928–1931 | 48 л. | Усть-Каменогорск» (Wellcome);
  - «Входит в: Фонд 12 …» (Wellcome «Part of»);
  - для фондов — раскрывашка «Совпадения в описи (11)» (NA);
  - миниатюра 96×96 `contain` справа, если есть скан (LoC 200×200, уменьшено).
- **Пагинация** «Стр. 1 из 133» и номера страниц (Wellcome, TNA).
- **Скелетон NARA:** блоки `--skeleton`, `shine 2s linear infinite`, 4 строки и сайдбар.
- **Мобайл:** «Фильтры» и «Сортировка» 2×48px (NA) открывают полноэкранную панель (Rijks `search-filters-mobile.png`).

### 2.3 Карточка дела + иерархия фонд → опись → дело
| Сайт | Как | Скрин |
|---|---|---|
| TNA (beta) | **моно-чип уровня ITEM** → h1 64 condensed → «Catalogue reference: **E 31/2/2/3498**» в моно-плашке → два бокса pastel-green `#dde5d5` «What's it about?» / «View options» → аккордеон «Full description» с переключателем **«Hide field descriptions»** (у каждого поля пояснение) → «Catalogue hierarchy» | `tna/cat-piece-desktop-fold.png`, `tna/cat-record-desktop-full.png` |
| TNA Discovery | блок «You are in»: уровни подписаны текстом («Division within PRO», «Subseries within PRO 57») + «browse from here by hierarchy \| by reference» | `tna/disc-record-desktop-fold.png` |
| Wellcome | крошки **с иконками уровней** и шифром в конце; h1 26px; Date / Reference / Part of; теги; слева дерево «Collection contents» **375px** (шеврон в кружке, шифр серым под названием, синяя направляющая у раскрытой ветки); справа «Available online · Contains: 167 images» (mono) + кнопка «View»; на мобиле дерево сворачивается в одну кнопку | `wellcome/work-desktop.png`, `work-mobile.png` |
| NARA | крошки Record Group → Series, **бейдж уровня «Item» с иконкой** над h1 (serif 31); **мета-строка с иконками** NAID \| тип \| дата \| 16 Images \| 17/17 Transcriptions; на уровне серии плашка «Partially Available — 53 Items ready to view» | `nara/cat-record-desktop.png`, `nara/cat-series-desktop.png` |
| LoC | сайдбар `#f6f6f6` «Part of» со счётчиками родителей; все значения мета — ссылки-фасеты; «View Enlarged Image» + «Download: JPEG (1060×1422)» | `loc/item-desktop-full.png` |
| Riksarkivet | готовая библиографическая ссылка «Källhänvisning» + IIIF-манифест + права CC PDM | `riksarkivet/viewer-info-open-desktop.png` |

**Берём для ВКО (карточка дела, сверху вниз):**
1. **Крошки с иконками уровней (Wellcome):** Каталог › 🗄 Ф. 12 «Название фонда» › 📁 Оп. 1 › Д. 345.
2. **Моно-чип уровня** ДЕЛО / ІС / FILE (TNA, 14px caps, фон `--level`) и статус-тег «Оцифровано» или «Ограниченный доступ».
3. **h1 condensed** `--fs-doc` (28→40px).
4. **Моно-плашка шифра** «ГА ВКО. Ф. 12. Оп. 1. Д. 345» (TNA) и кнопка «Копировать» (ТЗ: «копирование архивного шифра»). Рядом «Как ссылаться» — готовая цитата с копированием (Riksarkivet Källhänvisning).
5. **Мета-строка с иконками (NARA):** Даты | Тип | Листов: 48 | Язык | Сканов: 48 | Хранится: филиал.
6. **Два пастельных бокса (TNA):** «О чём дело» (`--ok-bg`) и «Как ознакомиться» (читальный зал, филиал, условия доступа). Без «заказать»: ТЗ запрещает услуги на сайте.
7. **Две колонки:**
   - слева «Состав фонда» 375px — дерево Фонд › Опись › Дело с подсветкой текущего (Wellcome);
   - справа превью скана, кнопка «Открыть просмотр (48 л.)» (Wellcome «View») и «Поделиться».
8. **Аккордеон «Все сведения»** с тумблером «Скрыть пояснения полей» (TNA). Закрывает пункт ТЗ «справка по полям карточки».
9. **«Входит в»** со счётчиками: «Фонд 12 (1 240 дел)», «Опись 1 (312 дел)» (LoC «Part of»). Значения полей — ссылки-фасеты (LoC).
10. **Ограниченный доступ:** вместо превью — информационный бокс `--restricted-bg` с условиями доступа (ТЗ). Для дел с персональными данными перед сканом — модалка-предупреждение 720px, радиус 6px (Wellcome Content advisory).
11. **Страница фонда/описи (NA inventaris):**
    - h1 с номером фонда, лид с «Читать далее», «Скачать опись: PDF»;
    - справа серые кнопки-ссылки «Путеводители по фонду» (NA Zoekhulpen `#deded9`);
    - строка поиска внутри описи со счётчиком «0 / 0» и стрелками;
    - дерево слева, раскрытый раздел справа;
    - плашка «Оцифровано 120 из 312 дел» (NARA).
    Вкладки «О фонде | Состав | Публикации» (LoC collection, чёрная линия 2px).
12. **Список фондов А–Я** без поиска (Riksarkivet `/a-o`): полоса букв, секции, двухколонник «название | описание».

Скрины: `nationaalarchief/na-inventaris-desktop-fold.png`, `riksarkivet/a-o-desktop.png`, `loc/collection-desktop.png`.

### 2.4 Вьюер скана
| Сайт | Как | Скрин |
|---|---|---|
| Wellcome | тёмная оболочка: панель **52px `#223438`**: [Hide info] [Page\|Grid] [**1/167** по центру] [Downloads] [Full screen]; инфопанель **330px**; холст `#111A1C`; 2 круглые кнопки (zoom, rotate) справа внизу; розовая полоса загрузки; режим Grid | `wellcome/viewer-desktop.png`, `viewer-grid-desktop.png` |
| NA | синяя полоса 48 (скачать / Закрыть) → чёрная 56 со вкладками **Informatie \| Transcriptie** и поиском по транскрипции; **плавающий тулбар по центру**: поворот ±90, яркость/контраст, zoom −, «7% ▾», zoom +; стрелки **64×64** по бокам; внизу «Scan **[1]** van 11» с полем ввода | `nationaalarchief/na-scan-desktop-fold.png` |
| NARA | чёрный `#1b1b1b` 1264×656 в странице, **рейка миниатюр 176px** с номерами, сверху таб-бар «Transcription \| Tags \| Comments \| Extracted Text» | `nara/cat-record-desktop.png` |
| Riksarkivet | UV: верх 40px `\|< −5 < [Bild N ▾] > +5 >\|`; правая панель 255px «Mer information»: Arkiv / Serie / Referenskod / Datering / Källhänvisning / права / IIIF-манифест; состояние в URL `#?cv=4&xywh=…`; мобайл — 6 иконок одной строкой внизу | `riksarkivet/viewer-info-open-desktop.png`, `viewer-mobile.png` |
| LoC | 6 квадратных кнопок 38px с белой обводкой, включая **crop** | `loc/viewer-desktop.png` |

**Берём для ВКО:**
- **Оболочка — Wellcome:** верхняя панель 52px `--viewer-panel`, слева инфопанель 330px (сворачивается), холст `--viewer-bg`. Переключатель «Лист | Сетка».
- **Содержимое инфопанели — Riksarkivet:** Фонд / Опись / Шифр / Даты / Как ссылаться [копировать] / Права использования / IIIF-манифест.
- **Тулбар — NA:** плавающий по центру сверху — поворот ±90, контраст, zoom −, «%», zoom +, плюс crop (LoC). Стрелки 64×64 по бокам.
- **Навигация по листам:** внизу «Лист [5] из 48» с полем ввода (NA). Для дел больше 100 листов — кнопки ±5 (Riksarkivet).
- **Вкладки «Сведения | Текст (OCR)» (NA/NARA):** OCR-модуль из ТЗ показывается тут же, с поиском по тексту.
- **Ссылка на лист и область:** `/view/<id>?l=5#xywh=…` (Riksarkivet). Закрывает ТЗ «поделиться ссылкой».
- **Мобайл:** инструменты одной строкой из 6 иконок внизу (Riksarkivet, LoC), инфопанель по кнопке «i».
- **Движок:** OpenSeadragon + IIIF Image API (подробно в §4).

### 2.5 Онлайн-выставка / «Цифровая история региона»
| Сайт | Как | Скрин |
|---|---|---|
| Europeana | лендинг: eyebrow EXHIBITION → h1 34 → hero 920 с (i)-атрибуцией → дата/просмотры/Share → интро → **плашки глав 01…06** с фоном-картинкой; глава: крошки «Exhibition › Chapter», **колонка 730, 18/27**, картинки и видео между абзацами, внизу список глав (активная выделена); без параллакса | `europeana/exhibition-desktop.png`, `exhibition-desktop-full.png`, `exhibition-chapter-desktop-full.png` |
| Rijksmuseum | лонгрид: полноэкранный hero, h1 caps на фото; **номера 01…10 размером 106px** | `rijksmuseum/story-desktop-full.png` |
| TNA | история: галерея «Image 1 of 3» на тёмной полосе `#1e1e1e` с подписью | `tna/tna-story-desktop-fold.png` |
| Europeana gallery | masonry 4 колонки, r4, тень `0 1px 3px .25`, «50 ITEMS» | `europeana/gallery-desktop.png` |
| LoC collection | вкладки «About / Items / Articles and Essays» | `loc/collection-desktop.png` |

**Берём для ВКО:**
- **Выставка 1в1 по структуре Europeana:**
  - лендинг и главы, текст колонкой 730px (`--measure`), 18px/1.6;
  - каждый экспонат — фигура с подписью и ссылкой «Карточка дела →» (ТЗ: «просмотр отдельных экспонатов», «привязка к фондам»);
  - галерея внутри главы — тёмная полоса «Изображение 1 из 3» (TNA);
  - для подборок вида «10 фактов» — гигантские номера (Rijks), размер `--fs-index`.
- **«Цифровая история региона»:**
  - вход — тематические коллекции, вкладки «О коллекции | Материалы | Статьи» (LoC);
  - материалы — masonry-галерея (Europeana), фильтры «тема / период / населённый пункт» (ТЗ) в том же сайдбаре, что и в каталоге.

### 2.6 Футер, языки, темы
- **Футер:**
  - тёмный `#223438`, текст `#F5F6EE`, padding-top 64, 4–5 колонок (Wellcome);
  - содержимое по TNA: адрес, часы, соцсети, быстрые ссылки, госресурсы (egov.kz и др.), юр-ссылки, «© …»;
  - телефон крупно и «Наверх» (NA);
  - **последняя полоса 48px «Тема: Системная / Светлая / Тёмная»** (TNA).
- **Языки:** у TNA, LoC и Wellcome переключателя нет; NA — дропдаун с глобусом на 10 языков (машинный перевод), Riksarkivet — «Other languages» и префикс `/en/`. Для ВКО:
  - три языка без дропдауна: сегмент `KZ | RU | EN` в утилитной строке;
  - префиксы `/kk/ /ru/ /en/` (Riksarkivet), `<html lang="kk|ru|en">`;
  - переводы настоящие, а не gtranslate.
- **Тема (TNA):** режимы system / light / dark через `data-theme` на `<html>`. Инлайн-скрипт в `<head>` до отрисовки читает `localStorage` (ТЗ: «сохранение выбора», «без перезагрузки»). В шапке — иконка-переключатель (ТЗ), в футере — полный выбор из трёх. Дополнительно `@media (prefers-contrast: more)` (TNA high-contrast) — бонус для WCAG.
- **Cookie-баннер (Riksarkivet):** две равновесные кнопки «Принять все» / «Только необходимые».

---

## 3. Дизайн-система ВКО v1

### 3.1 Шрифты (казахская кириллица проверена)
Проверены 18 букв `әғқңөұүһі` + заглавные по cmap реальных woff2 из Google Fonts (подмножества cyrillic + cyrillic-ext).

| Роль | Шрифт | Казахский | Откуда |
|---|---|---|---|
| Заголовки (display) | **Roboto Condensed** 500/600, variable | ✅ все 18 | аналог Supria Sans Condensed у TNA (h1 64 condensed 500); узость нужна, потому что казахские названия на 20–30% длиннее английских |
| Текст и UI | **Inter** 400/600, variable | ✅ | Wellcome (Inter 400/600 текст + UI) |
| Шифры, чипы уровня, счётчики | **Roboto Mono** 400/500 | ✅ | TNA (Roboto Mono — чипы, шифр); у Wellcome IBM Plex Mono тоже ✅ |

- Отвергнуты из-за отсутствия казахских букв: **Manrope** (нет ә ғ қ ң ұ), **JetBrains Mono** (нет ә ғ қ ң ұ һ), **IBM Plex Sans Condensed** (нет кириллицы вообще), **Unbounded**, **Tenor Sans**.
- Тоже ✅, запасные варианты: Open Sans, Source Sans 3, Source Serif 4, Merriweather, Roboto Slab, PT Sans/Serif/Sans Narrow, Fira Sans Condensed, IBM Plex Sans/Mono/Serif, Literata, Noto Sans/Serif, Golos Text, Onest, Montserrat, Ubuntu, Oswald.
- Подключение: `@fontsource-variable/inter`, `@fontsource-variable/roboto-condensed`, `@fontsource/roboto-mono` (все OFL-1.1, v5.3.0), self-host.
- **Нужны оба подмножества — `cyrillic` и `cyrillic-ext`.** і (U+0456) и ұ (U+04B1) лежат в `cyrillic`, а ә ғ қ ң ө ү һ — в `cyrillic-ext`. Если отрезать cyrillic-ext ради Lighthouse, казахский сломается.

### 3.2 Цвет
Светлая тема:

| Токен | Значение | Откуда | Контраст |
|---|---|---|---|
| `--bg` | `#FAFBF7` | Wellcome neutral.05 | — |
| `--bg-tint` (шапка, панели) | `#F5F6EE` | Wellcome neutral.10 | — |
| `--bg-panel` (фасеты, боксы) | `#EFEFEA` | NA (поля/панели) | текст 11.3 |
| `--surface` (инпуты, карточки) | `#FFFFFF` | все | — |
| `--text` | `#223438` | Wellcome neutral.70 | **12.5** на bg |
| `--text-muted` | `#657373` | Wellcome neutral.50 | 4.75 ✅. Для сравнения: NARA `#71767a` даёт 4.42 ❌ |
| `--line` | `#D2D6D0` | Wellcome hairline | декоративная |
| `--line-strong` | `#26262A` | TNA keyline-dark (инпуты 2px) | — |
| `--accent` (ссылки, кнопки) | `#01689B` | NA | 5.85 на bg, белый на нём 6.08 |
| `--accent-hover` | `#004C7E` | TNA navy | 8.65 |
| `--gold` (CTA «Каталог», полоса 4px) | `#E8A621` | Riksarkivet | тёмный текст `#212223` на нём 7.52 |
| `--mark` (подсветка совпадений, фокус) | `#FFCC00` | TNA yellow | `#223438` на нём 8.59 |
| `--level` (чип уровня) / `--ok` | `#00623B` | TNA forest | белый 7.47; на bg 7.19 |
| `--ok-bg` | `#DDE5D5` | TNA pastel-green | текст 10.05 |
| `--restricted` / `--restricted-bg` | `#80393A` / `#FAD3D4` | Riksarkivet error / TNA pastel-pink | 7.88 |
| `--info-bg` | `#D4E5EF` | TNA pastel-blue | — |
| `--footer-bg` / `--footer-text` | `#223438` / `#F5F6EE` | Wellcome | 11.94 |
| `--skeleton` | `#F0F0F0` | NARA `.block-load` | — |

Тёмная тема (база TNA dark):

| Токен | Значение | Откуда | Контраст |
|---|---|---|---|
| `--bg` | `#212223` | TNA dark background | — |
| `--bg-tint` | `#323334` | TNA dark background-tint | — |
| `--surface` | `#26262A` | TNA dark input-background | — |
| `--text` | `#F2F2F2` (≈ rgba(255,255,255,.95)) | TNA dark | 14.24 |
| `--text-muted` | `#AFB5B1` | Wellcome neutral.30 | 7.64 |
| `--accent` | `#00B0FF` | TNA dark link | 6.57; текст `#212223` на нём 6.57 |
| `--gold` | `#E8A621` | без изменений | 7.52 на bg |
| `--mark` | `#FFCC00` | TNA | 10.54 |
| `--ok` | `#9BC0AF` | Wellcome collection green.200 | 8.01 |
| `--restricted` | `#FF9585` | Wellcome salmon.200 | 7.50 |
| `--line` | `rgba(255,255,255,.16)` | наше (TNA keyline = чёрный 25%, инвертирован) | — |

Вьюер всегда тёмный: панель `#223438`, холст `#111A1C` (Wellcome). Вторичная кнопка во вьюере `#8FC7FF` (Wellcome blue.30, Downloads).

### 3.3 Типошкала (clamp, линейно между 390 и 1440px)
| Токен | Мобайл → десктоп | Откуда |
|---|---|---|
| `--fs-body` | 16 → 19 | TNA 17/19, Wellcome 16→20 |
| `--fs-hero` | 36 → 64 | TNA h1 36/48/64 |
| `--fs-doc` (заголовок дела) | 28 → 40 | между NARA 31 и TNA 64; Wellcome 26 |
| `--fs-h2` | 28 → 36 | TNA heading-l 29/32/36 |
| `--fs-h3` | 20 → 24 | TNA h-m 22, Wellcome h3 22.3 |
| `--fs-lead` | 18 → 22 | Wellcome lead 22.3 |
| `--fs-read` (текст выставки) | 17 → 18 | Europeana 18/27 |
| `--fs-small` | 14 | Wellcome мета 13.7 |
| `--fs-label` (caps-лейбл, чип) | 13 | LoC `--card-label-font-size .8125rem` |
| `--fs-index` (номера 01…10) | 64 → 106 | Rijksmuseum 106 |

Межстрочные интервалы:
- текст 1.6 — между TNA 1.75 и Wellcome/Europeana 1.5; у ұ қ ң есть хвосты вниз, ниже 1.5 не опускать;
- заголовки 1.15 (TNA h-l);
- hero 1.1 (TNA 70.4/64).

Веса: заголовки 600, текст 400/600 (Wellcome), моно 400/500 (TNA).

### 3.4 Сетка и размеры
- **Контейнер и колонки:**
  - контейнер `80rem` = 1280 (TNA);
  - поля `clamp(16px, 3.33vw, 48px)` — 48 на 1440 (NA), 16 на мобиле (TNA);
  - 12 колонок, gutter `clamp(16px, 2.2vw, 32px)` (TNA 32, Wellcome 12/24/48).
- **Ширины блоков:**
  - колонка чтения `46rem` (736; Europeana 730, TNA featured 816);
  - сайдбар фасетов 280 (LoC 265, NA 312);
  - дерево фонда 375 (Wellcome);
  - инфопанель вьюера 330 (Wellcome);
  - рейка миниатюр 176 (NARA).
- **Брейкпоинты:** 480 / 768 / 1024 / 1280 (TNA 30/48/64em + контейнер).
- **Высоты:**
  - контролы (кнопка, инпут) 48 (TNA, NA; Rijks 50, Wellcome 46);
  - утилитная строка 40, шапка 80, мобильная шапка 64;
  - панель вьюера 52 (Wellcome);
  - стрелки вьюера 64 (NA).
- **Отступы:**
  - шаг 4: 4/8/12/16/24/32/48/64/96 (Wellcome space.static);
  - вертикаль секции `clamp(32px, 4vw, 64px)` (Wellcome xl 32/48/64, TNA 48).

### 3.5 Радиусы, линии, тени
- **Радиусы:**
  - 0 — кнопки, инпуты, карточки, теги (Wellcome, LoC, NA);
  - 2px — моно-чипы уровня (TNA, Rijks);
  - pill — пилюли «Выбрано ×» (LoC 99px);
  - 6px — модалки (Wellcome).
- **Линии:**
  - 1px `--line` — разделители;
  - 2px `--line-strong` у инпута (TNA);
  - **5px** — активная вкладка (TNA 5px, Riksarkivet 5px);
  - 4px — полоса над шапкой (LoC).
- **Тени — по умолчанию нет (TNA).** Исключения:
  - поповер `1px 2px 8px rgba(0,0,0,.2)` (NA);
  - модалка `0 2px 8px rgba(18,18,18,.4)` (Wellcome);
  - кнопки вьюера поверх скана `0 4px 8px rgba(0,0,0,.2)` (NA).
- **Фокус:** `outline 3px solid var(--mark)`, offset 2px. Анимируется только `outline-offset .1s` (TNA). Жёлтое кольцо у TNA `#fc0` и у Wellcome `#FFEA00`.

### 3.6 Motion
- **Длительности:**
  - `--dur-1: 100ms` — фокус (TNA);
  - `--dur-2: 150ms` — hover цвета и фона (Wellcome 150ms ease, NA 150ms, LoC .15s);
  - `--dur-3: 350ms` — панели, аккордеон, инфопанель вьюера (Wellcome opacity/transform .35s, NA .3s).
- **Кривые:** `ease` и `ease-in-out`.
- **Hover кнопки:** инверсия цвета без анимации движения (TNA, Rijks).
- **Скелетон:** `shine 2s linear infinite` (NARA). Пульс под ленивыми картинками `1.2s ease-in-out` (TNA).
- **Ограничения:** никакого параллакса и scroll-jacking (Europeana, TNA). `prefers-reduced-motion` отключает всё (TNA, NA, LoC).
- **z-index (Wellcome):** header 6, skip-link 7, overlay 1002, modal 1003.

### 3.7 Блок CSS custom properties
```css
/* Госархив ВКО — design tokens v1. Источники значений — SYNTHESIS.md §3 */
:root {
  color-scheme: light;
  /* fonts (все проверены на әғқңөұүһі; грузить cyrillic + cyrillic-ext) */
  --font-display: "Roboto Condensed Variable", "Roboto Condensed", "Arial Narrow", sans-serif; /* ~TNA Supria Condensed */
  --font-text: "Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", sans-serif;        /* Wellcome */
  --font-mono: "Roboto Mono", ui-monospace, Menlo, Consolas, monospace;                           /* TNA */

  /* type scale: линейно 390→1440 */
  --fs-body:  clamp(1rem, 0.93rem + 0.286vw, 1.1875rem);   /* 16→19 TNA/Wellcome */
  --fs-hero:  clamp(2.25rem, 1.6rem + 2.667vw, 4rem);      /* 36→64 TNA */
  --fs-doc:   clamp(1.75rem, 1.47rem + 1.143vw, 2.5rem);   /* 28→40 NARA/TNA */
  --fs-h2:    clamp(1.75rem, 1.56rem + 0.762vw, 2.25rem);  /* 28→36 TNA */
  --fs-h3:    clamp(1.25rem, 1.157rem + 0.381vw, 1.5rem);  /* 20→24 TNA/Wellcome */
  --fs-lead:  clamp(1.125rem, 1.032rem + 0.381vw, 1.375rem);/* 18→22 Wellcome */
  --fs-read:  clamp(1.0625rem, 1.04rem + 0.095vw, 1.125rem);/* 17→18 Europeana */
  --fs-small: 0.875rem;                                     /* 14 Wellcome */
  --fs-label: 0.8125rem;                                    /* 13 LoC */
  --fs-index: clamp(4rem, 3.025rem + 4vw, 6.625rem);        /* 64→106 Rijks */
  --lh-text: 1.6; --lh-head: 1.15; --lh-hero: 1.1;
  --fw-text: 400; --fw-strong: 600; --fw-head: 600;

  /* colour — light */
  --bg: #FAFBF7;            /* Wellcome n05 */
  --bg-tint: #F5F6EE;       /* Wellcome n10 */
  --bg-panel: #EFEFEA;      /* NA */
  --surface: #FFFFFF;
  --text: #223438;          /* Wellcome n70, 12.5:1 */
  --text-muted: #657373;    /* Wellcome n50, 4.75:1 */
  --line: #D2D6D0;          /* Wellcome */
  --line-strong: #26262A;   /* TNA */
  --accent: #01689B;        /* NA, 5.85:1 */
  --accent-hover: #004C7E;  /* TNA navy */
  --on-accent: #FFFFFF;
  --gold: #E8A621;          /* Riksarkivet */
  --on-gold: #212223;
  --mark: #FFCC00;          /* TNA */
  --level: #00623B;         /* TNA forest — чип уровня */
  --on-level: #FFFFFF;
  --ok: #00623B;  --ok-bg: #DDE5D5;                 /* TNA */
  --restricted: #80393A; --restricted-bg: #FAD3D4;  /* Riksarkivet / TNA */
  --info-bg: #D4E5EF;                               /* TNA */
  --footer-bg: #223438; --footer-text: #F5F6EE;     /* Wellcome */
  --skeleton: #F0F0F0;                              /* NARA */
  --viewer-bg: #111A1C; --viewer-panel: #223438; --viewer-text: #F5F6EE; --viewer-btn2: #8FC7FF; /* Wellcome */

  /* layout */
  --container: 80rem;                       /* 1280 TNA */
  --pad-x: clamp(1rem, 3.33vw, 3rem);       /* 16 TNA → 48 NA */
  --gutter: clamp(1rem, 2.2vw, 2rem);       /* TNA 32 / Wellcome */
  --measure: 46rem;                         /* ~Europeana 730 */
  --w-facets: 17.5rem;                      /* 280 LoC/NA */
  --w-tree: 23.4375rem;                     /* 375 Wellcome */
  --w-viewer-info: 20.625rem;               /* 330 Wellcome */
  --w-thumbs: 11rem;                        /* 176 NARA */
  --h-control: 3rem;                        /* 48 TNA/NA */
  --h-utility: 2.5rem; --h-header: 5rem; --h-header-m: 4rem;
  --h-viewer-bar: 3.25rem;                  /* 52 Wellcome */
  --section-y: clamp(2rem, 4vw, 4rem);      /* Wellcome xl / TNA */
  --s-1: .25rem; --s-2: .5rem; --s-3: .75rem; --s-4: 1rem; --s-5: 1.5rem;
  --s-6: 2rem; --s-7: 3rem; --s-8: 4rem; --s-9: 6rem; /* Wellcome space.static */
  /* breakpoints (только в @media/@container, переменные там не работают): 480 / 768 / 1024 / 1280 — TNA */

  /* shape */
  --r-0: 0;          /* кнопки, поля, карточки — Wellcome/LoC/NA */
  --r-chip: 2px;     /* TNA/Rijks */
  --r-modal: 6px;    /* Wellcome */
  --r-pill: 999px;   /* LoC refined-by */
  --bw: 1px; --bw-input: 2px; --bw-accent: 5px; --bw-topband: 4px; /* TNA / LoC */
  --shadow-none: none;                                  /* TNA default */
  --shadow-pop: 1px 2px 8px rgba(0,0,0,.2);             /* NA */
  --shadow-modal: 0 2px 8px 0 rgba(18,18,18,.4);        /* Wellcome */
  --shadow-float: 0 4px 8px rgba(0,0,0,.2);             /* NA viewer */
  --focus-ring: 3px solid var(--mark); --focus-offset: 2px;

  /* motion */
  --dur-1: 100ms;  /* TNA focus */
  --dur-2: 150ms;  /* Wellcome/NA/LoC hover */
  --dur-3: 350ms;  /* Wellcome/NA panels */
  --ease: ease; --ease-io: ease-in-out;
  --skeleton-anim: shine 2s linear infinite;            /* NARA */

  /* z-index — Wellcome */
  --z-header: 6; --z-skip: 7; --z-overlay: 1002; --z-modal: 1003;
}

/* dark — TNA dark theme */
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #212223; --bg-tint: #323334; --bg-panel: #323334; --surface: #26262A;
  --text: #F2F2F2; --text-muted: #AFB5B1;
  --line: rgba(255,255,255,.16); --line-strong: #F2F2F2;
  --accent: #00B0FF; --accent-hover: #66ADCE; --on-accent: #212223;   /* TNA / LoC dark link */
  --ok: #9BC0AF; --ok-bg: #2A3A33;                                     /* Wellcome green.200; bg — наше */
  --restricted: #FF9585; --restricted-bg: #3A2526;                     /* Wellcome salmon.200; bg — наше */
  --info-bg: #23323C;                                                  /* наше */
  --level: #9BC0AF; --on-level: #212223;
  --footer-bg: #101112; --footer-text: #F2F2F2;                        /* TNA dark contrast-background */
  --skeleton: #323334;
}
/* system: тёмная, если пользователь явно не выбрал светлую */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* те же значения, что и [data-theme="dark"]; дублировать через postcss/миксин */ }
}
/* high-contrast — TNA */
@media (prefers-contrast: more) {
  :root:not([data-theme="dark"]) { --bg: #FFFFFF; --text: #000000; --text-muted: #333333; --accent: #202FBC; --line: #000000; }
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-1: 0ms; --dur-2: 0ms; --dur-3: 0ms; --skeleton-anim: none; }
}
@keyframes shine { from { background-position: -200px 0 } to { background-position: calc(200px + 100%) 0 } }

:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: var(--focus-ring); outline-offset: var(--focus-offset);
  transition: outline-offset var(--dur-1) var(--ease);
}
body { background: var(--bg); color: var(--text); font: var(--fw-text) var(--fs-body)/var(--lh-text) var(--font-text); }
```
Значения с пометкой «наше» — производные. Ни у одного из 8 сайтов нет тёмных пастельных фонов статусов, поэтому их подобрали сами под контраст ≥ 7:1 для текста `--ok`/`--restricted`.

---

## 4. Что берём кодом как есть

| Что | Лицензия (проверено) | Совместимость | Как берём |
|---|---|---|---|
| **OpenSeadragon** 6.1.1 | BSD-3-Clause | ✅ с чем угодно | `npm i openseadragon`. Источник тайлов — IIIF `info.json` (как NARA, NA, Wellcome, LoC). Свой React-тулбар поверх (раскладка по §2.4), стандартные кнопки OSD скрыты (`showNavigationControl: false`) |
| **@iiif/presentation-3** 2.2.4 (типы, их использует Wellcome) | MIT | ✅ | типизация манифеста v3 на фронте |
| **iiif-prezi3** (Python) | Apache-2.0 | ✅ | FastAPI генерирует манифест v3 на каждое дело: `/iiif/<id>/manifest`, ссылка в инфопанели (Riksarkivet) |
| **libvips** `dzsave --layout iiif3` | LGPL-2.1 | ✅ (вызываем как программу, не линкуем) | нарезка статических IIIF-тайлов level-0 при загрузке скана в админке; раздаём тем же nginx/FastAPI. Cantaloupe не нужен: тяжёлый, на Java. *libvips локально не стоит: `brew install vips`, layout iiif3 есть с 8.13 — проверить при сборке* |
| **TNA Frontend** `@nationalarchives/frontend` 1.6.3 | MIT | ✅ | Это SCSS + nunjucks + vanilla JS, React-компонентов нет. Компоненты уже работают на CSS-переменных (`--background`, `--font-base`, `--link`, `--keyline`, `--button-background`, `--accent`…). Классы тем `tna-template--dark-theme` / `--system-theme`. Берём SCSS-партиалы компонентов (`breadcrumbs`, `secondary-navigation` / `tabs`, `compound-filters`, `search-field`, `details` / `accordion`, `pagination`, `tags`, `checkboxes`, `date-search`, `skip-link`, `cookie-banner`, `error-summary` и формы для админки). Их переменные мапим на наши токены (`--background: var(--bg)` и т. д.), заголовочный шрифт переопределяем `$heading-font-family-name: "Roboto Condensed"` (по умолчанию Supria — платный Typekit, не брать). Разметку переписываем в JSX 1в1 по nunjucks-шаблонам. В `vendor/tna/LICENCE` кладём MIT-уведомление |
| **Wellcome** wellcomecollection.org | MIT | ✅ | React/TS, ближе всего к нашему стеку. Берём логику и структуру, не styled-components: `content/webapp/views/components/SearchFilters/*` (Desktop/Mobile, DateRange, Checkbox, ResetActiveFilters), `WorksSearchResults/*` (строка выдачи), `content/webapp/views/pages/works/work/ArchiveTree/` (дерево «Collection contents» с role=tree и клавиатурой), `content/webapp/views/pages/works/work/IIIFViewer/` (связка OSD + манифест + Page/Grid). Стили переписываем на наши CSS-переменные. Витрину Storybook повторяем в мини-версии: страница `/ui` со всеми компонентами для жюри (идея cardigan) |
| **@wellcometrust/wellcome-design-system** 2.1.0 | MIT | ✅ | только как справочник `theme.json`. Наши токены уже вынесены выше |
| **Europeana portal.js** | **EUPL-1.2** | ⚠️ копилефт: производное произведение должно распространяться под EUPL. Список совместимых — GPL/AGPL/LGPL/MPL-2.0/EPL/OSL/CeCILL/CC BY-SA, MIT в нём нет. Плюс это Vue 2, а не React | **код не копируем.** Берём только UX-структуру выставки (лендинг → главы 01…N → колонка 730 → список глав внизу) и вьюер на OpenLayers как идею. Паттерны интерфейса авторским правом не защищены |
| Universal Viewer (Riksarkivet), Mirador | UV — NOASSERTION в GitHub API (лицензию не подтвердил), Mirador — Apache-2.0 | — | не берём: тяжёлые, свой UI спорит с нашей дизайн-системой. Достаточно OSD + своего тулбара |
| Шрифты @fontsource 5.3.0 | OFL-1.1 | ✅ | self-host, подмножества cyrillic + cyrillic-ext + latin |
| Leaflet 1.9.4 (карта филиалов) | BSD-2-Clause | ✅ | ни у одного из 8 сайтов карты нет. Маршрут — ссылками в 2GIS / Google Maps / Яндекс (ТЗ) |

---

## 5. Экраны для макета (в порядке важности для жюри)

| # | Экран | Собирать с | Состав / заметка |
|---|---|---|---|
| 1 | **Главная** (desktop + mobile) | `tna/tna-home-desktop-fold.png` и `-dark.png` (hero-полоса: h1 64 + моно-подзаголовок + 3 чёрные CTA с шевроном, featured-карточка); `europeana/home-desktop.png` (поле поиска 644×56 в hero); `nationaalarchief/na-home-desktop-full.png` (3 карточки-раздела с цветной верхней полосой; новости с бейджем даты); `loc/home-desktop.png` (строка «Популярные запросы»); `riksarkivet/new-volumes-desktop.png` (таблица «Новые оцифрованные дела») | ТЗ 5.1: баннер, каталог-поиск, «История в документах», выставки, филиалы (мини-карта), новости, «Полезная информация», соцсети, футер |
| 2 | **Выдача каталога с фасетами** | `loc/search-desktop.png` (сайдбар со счётчиками, «Выбрано ×»), `nationaalarchief/na-zoeken-desktop-fold.png` (вкладки-типы, период со слайдером), `tna/cat-search-desktop-fold.png` (моно-чипы, подсветка, Sort + список/сетка), `wellcome/search-desktop.png` (строка результата), `nara/cat-search-desktop.png` (скелетон), мобайл `nationaalarchief/na-zoeken-mobile-fold.png` | показать и состояние-скелетон |
| 3 | **Карточка дела** (оцифровано) + вариант «ограниченный доступ» | `tna/cat-piece-desktop-fold.png` (чип, h1, плашка шифра, 2 бокса), `tna/cat-record-desktop-full.png` (аккордеон с пояснениями полей), `wellcome/work-desktop.png` (крошки с иконками, дерево 375, «View»), `nara/cat-record-desktop.png` (мета-строка с иконками), `loc/item-desktop-full.png` («Входит в»), мобайл `wellcome/work-mobile.png` | главный экран для жюри-архивистов: шифр, копирование, «Как ссылаться» |
| 4 | **Вьюер скана** | `wellcome/viewer-desktop.png` (оболочка 52 + 330), `nationaalarchief/na-scan-desktop-fold.png` (тулбар, стрелки 64, «Лист N из M», вкладка текста), `riksarkivet/viewer-info-open-desktop.png` (поля инфопанели, ±5), `wellcome/viewer-grid-desktop.png` (сетка), мобайл `riksarkivet/viewer-mobile.png` + `loc/viewer-mobile.png` | вкладка «Текст (OCR)» показывает ИИ-модуль ТЗ |
| 5 | **Фонд / опись** (дерево + поиск внутри описи) | `nationaalarchief/na-inventaris-desktop-fold.png`, `nara/cat-series-desktop.png` («оцифровано N из M»), `loc/collection-desktop.png` (вкладки), `riksarkivet/a-o-desktop.png` (список фондов А–Я) | иерархия фонд → опись → дело целиком |
| 6 | **Онлайн-выставка**: лендинг + глава | `europeana/exhibition-desktop-full.png`, `europeana/exhibition-chapter-desktop-full.png`, `tna/tna-story-desktop-full.png` (галерея на тёмной полосе), `rijksmuseum/story-desktop-full.png` (номера 01…10) | у экспонатов ссылки на карточки дел |
| 7 | **Цифровая история региона**: коллекции + галерея | `loc/collection-desktop.png`, `europeana/gallery-desktop.png` (masonry), `rijksmuseum/stories-desktop.png` (список историй) | фильтры: тема / период / населённый пункт |
| 8 | **Филиалы**: карта + карточка филиала | референса нет. Карточка филиала — как новостная карточка NA (`na-home-desktop-full.png`); список слева шириной дерева Wellcome (375) | адрес, часы, телефон, кнопки маршрута 2GIS / Google |
| 9 | **ИИ-помощник** (выезжающая панель) | референса нет. Точка входа — плавающая кнопка справа внизу (Europeana Feedback `europeana/exhibition-desktop.png`, NA боковая вкладка). Панель — правый drawer с тенью `--shadow-modal` (Wellcome модалка). Ответы с источниками рендерятся строками результатов Wellcome | ТЗ: ответы со ссылками на источники |
| 10 | **Тёмная тема**: главная + карточка дела | `tna/tna-home-desktop-fold-dark.png`, `loc/home-desktop.png` (dark ui2) | переключатель в шапке и в футере |
| 11 | **Справка «Как читать шифр» / FAQ** | `tna/cat-record-desktop-full.png` (пояснения полей), аккордеон TNA, колонка `--measure` | ТЗ 5.4: архив → фонд → опись → дело → документ |
| 12 | **Админка**: список дел, форма карточки, загрузка скана, согласование | референса среди 8 нет. Формы — компоненты TNA Frontend (text-input, date-input, select, checkboxes, error-summary), таблица — zebra из `riksarkivet/new-volumes-desktop.png` | статусы доступа, журнал действий |
| 13 | **Новости / событие** | `nationaalarchief/na-home-desktop-full.png` (карточки 312 с датой-бейджем), `wellcome/story-desktop.png` (крошки, h1, лид 22, «время чтения») | — |
| 14 | **Об архиве** | `tna/tna-explore-desktop-fold.png` (index-grid), колонка `--measure` | текстовые разделы ТЗ 5.2 |

Мобильные версии экранов 1–4 обязательны: ТЗ 7 требует, чтобы на мобиле работали все основные функции.
