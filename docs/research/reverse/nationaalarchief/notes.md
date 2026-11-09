# Nationaal Archief (NL) - живой реверс, 2026-11-09

Снято в своём Chrome (CDP 9342): desktop 1440x900, mobile 390x844 (iPhone UA, DPR 2). Числа - getComputedStyle / CSS-правила / network живых страниц. Токены - `tokens.json`, сырьё - `raw/`, скрины - `shots/`.

Страницы (`shots/<name>-{desktop,mobile}-{fold,full}.png`):
- `na-home` - https://www.nationaalarchief.nl/
- `na-archieven` - /onderzoeken/archieven (вход в поиск по архивам)
- `na-zoeken` - /onderzoeken/zoeken?activeTab=archives&searchTerm=verenigde oostindische compagnie (выдача, 83 архивных единицы в 51 архиве)
- `na-inventaris` - /onderzoeken/archief/1.04.02 (инвентарь VOC, дерево Deel I > I/A > номера)
- `na-scan` - /onderzoeken/archief/1.04.02/invnr/@1/file/NL-HaNA_1.04.02_1_01 (скан, 11 сканов, вьюер)

## 1. Стек
- **Drupal 10.6.19** (кастомная тема `natarch`, `form_build_id`), jQuery 3.7.1 + jQuery UI. Выдача - Angular-приложение внутри Drupal (элемент `<app-beta>`). Скан-вьюер - отдельный собранный (Vite) модуль `na_openseadragon` (`/modules/custom/na_openseadragon/app/dist/assets/index-C9ZDM9RF.js?v=1.49`).
- **Вьюер: OpenSeadragon поверх IIIF Image API**, сервер тайлов IIPsrv: `https://service.archief.nl/iip/iipsrv?IIIF=<hash-path>/<uuid>.jp2/info.json`, тайлы 256x256 (`.../0,4096,2048,2048/256,256/0/default.jpg`), сначала грузится превью `/full/95,216/0/default.jpg`. Метаданные сканов лежат прямо в HTML JSON-ом: `scans[] {id, label "NL-HaNA_1.04.02_1_01.jpg", order, default{url,size 1.4-2.8 МБ,jpeg}, thumbnail{url}, iiif{url info.json}}`, `availability: "DIGITALIZED"`, `has_scan_navigation`. Миниатюры/файлы: `service.archief.nl/api/file/v1/{default,thumb}/<uuid>`. Это не Mirador/UV - своя обвязка.
- Мультиязычность: модуль **gtranslate** (машинный перевод), 10 языков в выпадашке: Nederlands, English, Français, Deutsch, Português, Español, Bahasa Indonesia, Íslenska, Kreyol ayisyen, Frysk.
- Аналитика Piwik PRO (statistiek.rijksoverheid.nl), чат LibraryH3lp, боковая вкладка "Feedback". Публичных репозиториев темы/вьюера не искал/не нашёл. Своей дизайн-системы нет; цвет - голубой Rijkshuisstijl #01689b.

## 2. Токены
- Шрифты (self-hosted woff, /themes/custom/natarch/fonts/): **Source Sans 3** 400/700 (+italic) для всего, **Source Serif 4** bold для заголовков "Nieuws"/"Agenda" на главной. Иконки Font Awesome.
- Шкала: body 16/24 #4b4646; h1 страницы 32/42 bold; h1 героя главной 104/104 bold белый на картинке; заголовок результата 18/28 bold #01689b; счётчик результатов 18/29 (500); табы 15.2/17.5; футер-ссылки 18/24.
- Палитра: текст #4b4646 и #090404; основной синий **#01689b** (ссылки, навбар, кнопка "Zoeken", неактивные табы); светло-голубой #cce0f1 (хлебные крошки, активный пункт меню); фон страницы #f7f7f2; поля/панели #efefea; серые кнопки "Zoekhulpen" #deded9; акценты карточек главной: синий #01689b / оранжевый rgb(225,112,0) / зелёный rgb(57,135,12); подсветка совпадений розовая #f2bfbb; в вьюере розово-малиновый #ca005d. Тёмной темы нет.
- Сетка: контейнер max **1376** (внутри 1344, боковой отступ 48 на 1440); брейкпоинты из CSS: 700, 767, 1023/1024, 1134, 1376 (и 60em/64em/86rem). Главная: 3 карточки по 427px, зазор 32.
- Форма: радиус 0 почти везде; тени мягкие: `0 0 3px rgba(0,0,0,.09)` (карточки), `1px 2px 8px rgba(0,0,0,.2)` (всплывашки), `0 4px 8px rgba(0,0,0,.2)` (кнопки вьюера); у инпутов внутренняя тень `inset 1px 1px 1px rgba(0,0,0,.14)`.
- Движение: `color/background-color 150ms` (ссылки, кнопки, табы), `opacity .15-.2s`, `transform .3s ease-in-out`, меню/панели `.6s ease-in-out`, табы `tab-slide-in/out .5s`. Skeleton-загрузки нет (0 узлов skeleton/shimmer). Есть `prefers-reduced-motion`.

## 3. Компоненты
- **Шапка**: верхняя строка утилит (Winkelwagen, Inloggen, Over het NA, Contact, язык, Zoeken) на белом + логотип справа (~182px) -> синяя полоса навигации **46px** (Home/Onderzoeken/Beleven/Archiveren; активный пункт на фоне #cce0f1) -> полоса крошек **53px** #cce0f1 (жирные подчёркнутые ссылки, шеврон). Не sticky. Мобайл: синяя полоса ~69px, белый логотип + "Menu" + бургер, крошки ~32px.
- **Поиск**: главная - большая кнопка/поле (инпут 48px, #efefea, оранжевая кнопка #f06e23); на выдаче - поле 48px + синяя кнопка "Zoeken" с лупой; над выдачей **8 вкладок по типам с счётчиками** (Archieven 83 | Fotocollectie 2 | Kaarten 0 | Indexen 2 | Zoekhulpen 2 | Onderzoeken 1 | Nieuws 0 | Agenda 0), на мобиле - один дропдаун. Автоподсказки не проверял.
- **Фасеты** (слева, 312px): "Periode" (два number-поля 1000 / 2026 + слайдер с двумя ручками), "Bevat digitaal materiaal", "Openbaarheid", "Actor" со счётчиками; шапки аккордеонов #efefea, жирные, со шевроном. Мобайл: две кнопки "Filters" и "Weergave" (48px).
- **Карточка выдачи**: жирная синяя ссылка "2.14.03 Inventaris van het archief van ... (1766) 1802-1966 (1988)" (код фонда + название + годы), "Periode: 1766-1988", сниппет с розовой подсветкой, раскрывашка "Snel overzicht zoekresultaten (11)" - внутри совпавшие единицы описи; разделитель между результатами. Сверху "83 archiefstukken in 51 archieven"; "Sorteer op" и "Aantal per pagina" - select 48px.
- **Страница инвентаря/описи**: h1 с кодом, лид с "Lees meer", "Download inventaris als: PDF | XML", справа панель "Zoekhulpen bij dit archief" (серые кнопки-ссылки с шевроном); ряд поиска внутри описи: "Filters tonen" | поле | select "Zoek in archiefbestanddelen" | "Zoeken" | счётчик "0 / 0" + стрелки вверх/вниз; слева дерево-аккордеон "Archiefbeschrijving / Archiefbestanddelen" (Deel I > Deel I/A OCTROOIEN > Deel I/E.1.a ...), справа раскрытое содержимое с L-коннекторами и жирными синими номерами. URL: `/archief/<код>/invnr/<номер или 'Deel I||A'>`, `/beschrijving/filedesc`, `/download/pdf|xml`. Иерархия фонд->опись->дело здесь выражена деревом + кодом (1.04.02 = архив, Deel = раздел, число = инвентарный номер).
- **Вьюер скана** (во весь экран): верхняя синяя полоса 48px (иконка скачать слева, "Sluiten x" справа) -> чёрная панель 56px: вкладки "Informatie" | "Transcriptie" и справа поиск "Zoek in archief/transcriptie" со стрелками по совпадениям -> тёмный холст (~#263238) с плавающим чёрным тулбаром по центру сверху (повернуть вправо/влево, яркость/контраст, zoom -, "7%" с выпадашкой, zoom +) -> боковые стрелки 64x64 (следующий чёрный, предыдущий приглушён на первом скане) -> внизу чёрная плашка "Scan [1] van 11" с полем номера. Работает вместе с транскрипциями (вкладка "Transcriptie").
- **Главная**: full-bleed акварельная карта в фоне, h1 104px белый, 3 карточки (Onderzoeken/Beleven/Archiveren) с цветной верхней полосой синий/оранжевый/зелёный, шеврон, разделитель, описание; ниже "Nieuws >" и "Agenda >" - карточки 312px с датой-бейджем сверху слева ("5 november 2026", "Vanaf 16 november 2026") и бейджем "Uitnodiging".
- **Футер** 554px: колонки Onderzoeken/Beleven/Archiveren, телефон 070 - 3315400, "Neem contact op", юр-ссылки (Toegankelijkheidsverklaring, Kwetsbaarheid melden, Taalgebruik, Privacy), "Scroll to top". Есть кнопка-вкладка "Feedback" (fixed, справа).

## 4. Что украсть для Госархива ВКО (с цифрами)
1. **Скан-вьюер как у na-scan**: OpenSeadragon + IIIF (тайлы 256x256, info.json), превью `/full/95,216/`, тулбар (поворот +-90, яркость/контраст, зум со списком %), "Scan [N] van M", стрелки 64x64, вкладка Транскрипция, поиск по транскрипции (`na-scan-desktop-fold.png`). Для ВКО: рукописные дела -> вкладка "Транскрипция" и "Информация" (шифр/описание).
2. **Вкладки-типы с счётчиками над выдачей**: 8 вкладок, 48px, #01689b/белая активная (`na-zoeken-desktop-fold.png`). Для ВКО: Фонды (N) | Дела (N) | Фото (N) | Указатели | Новости | События.
3. **"Snel overzicht zoekresultaten (11)"** - раскрывашка внутри карточки выдачи с совпавшими единицами описи, не уходя со страницы. Закрывает болевую точку "поиск по описи".
4. **Дерево описи слева + контент справа + поиск внутри описи** с счётчиком "0 / 0" и стрелками prev/next (`na-inventaris-desktop-fold.png`): "Deel I > I/A > номер". Для ВКО: Фонд > Опись > Дело.
5. **Скачивание описи PDF | XML** прямо под лидом (+ ссылки /download/pdf, /download/xml) - легко и выглядит солидно (иконка + 2 ссылки).
6. **Панель "Zoekhulpen bij dit archief"**: серые #deded9 кнопки-ссылки (путеводители) справа от описания фонда - "Путеводитель по фонду / по теме".
7. **Цветовая система "один синий"**: #01689b на всё (навбар 46px, ссылки, кнопка, вкладки) + светло-голубой #cce0f1 для крошек/активного пункта + бежевый фон #f7f7f2 - спокойно, "по-государственному", без градиентов.
8. **Ряд из 3 карточек-разделов** на главной с цветной верхней полосой (синий/оранжевый/зелёный) и разделителем - простой способ показать 3 ветки ("Исследователям / Посетителям / Организациям").
9. **Дропдаун языка с глобусом** (10 языков через gtranslate) в верхней утилитной строке рядом с Contact/Inloggen: для ВКО RU/KZ/EN - реализовать лучше настоящими переводами, но место и вид перенять.
10. **Раскрывающиеся мобильные "Filters" и "Weergave" кнопки 48px 2-up** + дропдаун вкладок вместо ряда табов (`na-zoeken-mobile-fold.png`).

## Не удалось / оговорки
- Автоподсказки поиска, открытое мобильное меню и состояние hover не снимались; hover-значения не измерены (есть только transition-длительности из CSS).
- Вьюер: на скане с `@1` при загрузке показан "7%" - это снимок до полной загрузки/подгонки; перенос тулбара на мобайл не разбирался (скриншоты `na-scan-mobile-*` есть).
- Анимации (`shake`, `spin`, `tab-slide-*`) взяты из CSS; какой именно элемент их использует - не установлено.
- Публичные репозитории темы и вьюера не найдены (искал в ссылках страниц; GitHub-поиск не делал).
- Оранжевый/зелёный акценты - из computed border-color карточек главной.
