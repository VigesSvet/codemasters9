# Riksarkivet Sweden (sok.riksarkivet.se) — реверс 2026-11-09

Замена Digitalarkivet: https://www.digitalarkivet.no/en не открылся (по брифу -> Riksarkivet). Факты по DA 2026-11-09: `GET /en` = HTTP 500, затем 503 Service Temporarily Unavailable (nginx), 504 Gateway Time-out; в Chrome страница "An error has occurred while processing your request"; повторные попытки позже = таймаут 25 c (curl код 28), `/`, `/en/census/search`, `/en/search/sources`, `/en/browse/archives` = 503. Папка `digitalarkivet/` удалена как пустая.

Снято живым Chrome (CDP 9344), 1440x900 и 390x844 @2x iPhone UA, cookies = только необходимые. Токены: `tokens.json`.

## Главное ограничение (зафиксировано, не обходил)
Любой запрос поиска и карточки архива (`/?Sokord=cholera`, `/nad?...`, `/?postid=ArkisRef SE/RA/720124`, `/arkiv/<id>`, `/nad/?postid=Arkis ...`) редиректит на `/captcha?returnUrl=...` — ALTCHA ("Verifiera att du ar manniska", чекбокс "Jag ar inte en robot", "Protected by ALTCHA"), скрин `shots/captcha-desktop.png`, `captcha-mobile.png`. Капчу не проходил. Поэтому НЕ снято: страница выдачи с фасетами, карточка архива (дерево фонд-опись-дело). Взяты соседние открытые страницы: главная (sv+en), `/en/nad/`, `/en/digitala-forskarsalen`, `/nytt-material` (таблица "Новые сканы" = рабочий аналог выдачи), `/a-o`, просмотрщик `/bildvisning/N2000054_00005`. Иерархию (Arkiv -> Serie -> Referenskod) видно только в инфо-панели просмотрщика.

## Скрины (`shots/`)
- `home-en-desktop.png`, `home-en-desktop-full.png`, `home-en-mobile*.png` — главная (EN)
- `nad-*.png` — /en/nad/ (Национальная архивная база); `drr-*.png` — Digital Research Room; `a-o-*.png` — алфавитный указатель оцифрованных архивов; `stories-*.png` — /historier
- `new-volumes-desktop*.png` — таблица новых сканированных томов (аналог выдачи), `viewer-desktop.png` (страница 5), `viewer-info-open-desktop.png` (панель "Mer information"), `viewer-settings-desktop.png`, `viewer-mobile.png`
- `captcha-desktop.png`, `captcha-mobile.png` — доказательство блокировки поиска

## Стек (факты)
- Сервер .NET (ASP.NET MVC: бандлы `/css/bootstrap?v=<hash>`, `/bundles/jquerytools?v=...`, классы `aspNetDisabled`), Bootstrap 2.x (`container-fluid`, `row-fluid`, `span8`, `btn-navbar`), jQuery UI, jquery-treeview, FontAwesome 3.0.1, Matomo. Не Next/Nuxt, дизайн-системы нет (кастомный `main-extern` css, 39 КБ).
- Шрифты: Open Sans (текст 14px), Roboto 400/500 (заголовки), `Content/fonts/*.woff2` (roboto-v29, open-sans-v28), иконки FontAwesome.
- Просмотрщик: Universal Viewer v4.2.1 (версия из диалога настроек), self-hosted `/universalviewer/lib/uv.js` + `uv.css`, внутри OpenSeadragon (`.openseadragon-container`, 2 canvas). Форк в GitHub: https://github.com/Riksarkivet (universalviewer, universalviewer4, uv-sv-SE-theme, uv-custom, openseadragon, iiif-metadata-component; также ra-sokprototyper, dataplattform, iiif-net). Самого фронта поиска в открытом виде нет (только прототипы `ra-sokprototyper`).
- IIIF: манифест `https://lbiiif.riksarkivet.se/arkis!N2000054/manifest`; Image API `https://lbiiif.riksarkivet.se/v2/arkis!N2000054_00005/info.json`, превью `/full/340,/0/default.jpg` и `/full/170,/0/default.jpg`, тайлы `/0,0,2717,4096/679,/0/default.jpg` (тайл ~679 px). Идентификатор кадра: `N2000054_00005` = том + номер кадра на 5 цифр.
- Права на сканы: CC Public Domain Mark 1.0 (показано в панели). Данные: страница `/data-api` (наборы данных для скачивания, напр. "Aktiebolag 1901-1935").
- Язык: переключатель "Other languages" в верхней служебной строке -> `?Sprak=Engelska` / `Svenska`, куки `lang=sv-SE`, EN-версия под `/en/...`, часть страниц помечена "(in Swedish)".
- Cookie: собственный баннер, две равновесные кнопки "Acceptera alla" (тёмная) / "Avvisa alla utom nodvandiga" (светлая), кука `ra_cookie_settings`.

## Дизайн (измерено на 1440)
- Палитра: текст #464646; ссылки/primary #0D5C91; тёмный синий #2D4156; золотой акцент #E8A621 (кнопка Clear, ссылки-кнопки карточек, подчёркивание активной вкладки, черный текст поверх); светлое золото #F4CA47; фон панелей поиска #E9F0F5 / #DBE7EF; боковой блок #EEEEEE; зелёная кнопка "Bild" #5F9629; ошибки #80393A; рамки #CCC/#DDD/#CCD4E4.
- Типографика: body 14px/18.2px Open Sans 400; h1 и заголовки карточек Roboto 500 32px/41.6px; подзаголовки 16.8px/700; кнопки 16px. Нет шкалы — 14/16.8/20/32.
- Радиусы 4-4.8px; тени `0 1px 2px rgba(0,0,0,.25)` (карточки, панель поиска), `inset 0 1px 1px rgba(0,0,0,.075)` (инпуты), `0 5px 10px rgba(0,0,0,.2)`.
- Контейнер 940px по центру (x=250..1190), шапка 158px, не sticky: служебная строка (Sign in, Other languages, Riksarkivet, Shop online) + логотип (герб + "Riksarkivet" антиквой) + подпись "Search the collections"; ниже навбар 63px с верхней линией 6px #0D5C91 и нижней 1px #CCD4E4; 4 пункта UPPERCASE 14px (START / DIGITAL RESEARCH ROOM / NATIONAL ARCHIVES DATABASE / ABOUT THE SEARCH SERVICE), активный 136x56 с золотой нижней полосой. Футер 230px, padding 40px 20px, ссылки (Contact, Image viewer, FAQ, Cookies, Personal data, Accessibility).
- Брейкпоинты (Bootstrap 2): 480, 580, 767/768, 780, 979/980, 1200. Мобильная шапка: кнопка MENU (#0D5C91) + "Shortcuts".
- Движение: `background .3s ease-in-out` (кнопки), `background-color .25s ease`, `border,box-shadow .2s linear` (инпуты, фокус), `opacity .15s`, `height .35s` (collapse); keyframes только overlay-slidein, spin, progress-bar-stripes. Skeleton нет.

## Компоненты
- Поисковая панель на каждой странице: фон #E9F0F5, padding 20px, заголовок "Search" антиквой синим с тонкой линией и ссылкой "Search tips" справа, ОДНО поле 569x30px, 2 чекбокса ("Digitised material only", "Transcribed material only BETA" с иконками-подсказками), кнопки Search (#0D5C91, padding 12px 32px, лупа) и Clear (#E8A621), ссылка "More options" (расширенный поиск: Fritext, Namn, Ort, Datum fran/till). Автоподсказок не обнаружено (не проверял ввод в форму из-за капчи).
- Режимы поиска как вкладки Bootstrap nav-tabs: Digitala forskarsalen | Amnesomrade | Specialsok | A-O | Fritext | Arkiv | Bildid; активная — белая с верхней линией 5px #184B7E, высота 38px.
- Выдача `/nytt-material`: "Visar traff 1-100 av 193", select сортировки, пагинация (|< < 1 2 > >|, ячейки 31px, серые), zebra-таблица: Arkiv (ссылка) | Volymens referenskod | Tid | Publicerad + зелёная кнопка "Bild" (55x37) -> просмотрщик. Фильтры формы: Period / Lan / Typ av arkiv (3 select по 30px).
- Главная: белые карточки (shadow 0 1px 2px, padding 20px, заголовок 32px) со стеком золотых кнопок-ссылок на всю ширину (высота 41px, шеврон справа): "Digital Research Room", "Databases (Church archives, Census etc.)", "Topics"; справа серый блок "Order copies or research" со ссылкой.
- Просмотрщик UV: чёрная сцена; верхняя панель 40px (герб слева, по центру `|<  -5  <  [Bild N v]  >  +5  >|`, шестерёнка настроек справа); заголовок объекта 20px белым с обрезкой "…"; слева-сверху инструменты + − домой поворот контраст; стрелки prev/next по бокам; слева-снизу печать и скачать; справа-снизу полный экран; миникарта-навигатор справа снизу; сворачиваемая правая панель "MER INFORMATION" 255px #212121: ОМ OBJEKTET: Arkiv, Serie, Referenskod (SE/RA/1135/VII/3/621), Datering (1831-1833), Kallhanvisning (готовая ссылка-цитата с "mer"), Rattigheter (CC PDM), IIIF-manifest URL; SIDA: Bildid, Lank, Kallhanvisning. Состояние в URL: `#?cv=4&xywh=-2404,-1,7523,4189` (номер канвы и прямоугольник просмотра). Mobile: заголовок обрезан, внизу ряд иконок + − поворот печать скачать fullscreen (i).

- Страница `/a-o` ("Digitalt arkivmaterial A-O"): алфавитная полоса 0-9, A..O с градиентным фоном (#E9F0F5-ish, высота ~72px), под ней секции-буквы h2 (Roboto 500 32px) и двухколоночная таблица "название фонда (ссылка) | краткое описание" с тонкими линиями-разделителями — `a-o-desktop.png`.
- Диалог настроек просмотрщика (`viewer-settings-desktop.png`): белый, ~470x335px, язык интерфейса (select Svenska/English), чекбоксы "Минимизировать движение (отключает анимации)", "Показывать миникарту", "Сокращать подписи миниатюр", "Запоминать масштаб", версия v4.2.1, чёрная кнопка "Stang".

## Что украсть для Госархива ВКО
1. Инфо-панель просмотрщика с подписанными строками Фонд / Серия(Опись) / Шифр / Даты / Правила использования / IIIF-манифест + кнопка готовой "Källhänvisning" (библиографическая ссылка с раскрытием "mer") — `viewer-info-open-desktop.png`; для ВКО: "Ссылка на источник" в формате ГОСТ + копирование.
2. Постоянная ссылка на конкретный кадр и вид: `/bildvisning/N2000054_00005#?cv=4&xywh=...`; id кадра = id тома + 5-значный номер; строить так же `/view/<том>_<кадр>`.
3. Навигатор по томам с сотнями кадров: `|<  -5  <  [select Bild N]  >  +5  >|` в верхней панели 40px — `viewer-desktop.png`; шаг ±5 полезен для дел на 300+ листов.
4. Фильтр "Только оцифрованное" и "Только транскрибированное (BETA)" двумя чекбоксами прямо под полем поиска, всегда на виду — `home-en-desktop.png`; для ВКО: "Только с цифровой копией".
5. Список "Новые сканы" — таблица Архив | Шифр тома | Даты | Опубликовано + зелёная кнопка "Просмотр" — `new-volumes-desktop.png`; готовый раздел "Новые поступления".
6. Вкладки режимов поиска (Тематика, Спец-поиск, А-Я, Полнотекст, Архив, Идентификатор изображения) с активной вкладкой верхней линией 5px — быстрый переход по шифру/ID.
7. Ссылки-кнопки золотого цвета (#E8A621 + чёрный текст, 41px) для "входных" маршрутов на главной: хороший контраст на белом; подходит под золото герба/тюльпана без выдумок.
8. Мобильный просмотрщик: инструменты вниз в одну строку из 6 иконок, заголовок обрезается многоточием — `viewer-mobile.png`.
9. IIIF-манифест открыто в панели + CC PDM рядом: прозрачность прав, ссылка на data-api; для ВКО — отдать manifest и лицензию в каждом кадре.
10. Алфавитный указатель фондов `/a-o`: полоса букв + секции + двухколонник 'название | описание' — `a-o-desktop.png`; для ВКО — быстрый список фондов без поиска и без JS-фильтров.
11. Анти-пример: ALTCHA на каждый поиск и карточку блокирует поиск и ломает индексацию/ботов; 14px body и Bootstrap 2 дают устаревший вид. Для ВКО капчу ставить только на отправку форм, поиск и просмотр — без неё.

## Что не удалось
- Выдача поиска, фасеты, карточка архива с деревом, hover карточки результата — за ALTCHA (см. выше).
- Digitalarkivet — недоступен (5xx / таймаут) на момент съёмки, см. начало файла.
- Режим "Galleri" (миниатюры) и одно/двухстраничный вид в просмотрщике не открыты (кнопки в aria-списке есть, но на 1440 не видны); открыты панель информации и настройки.
- Автоподсказки в поле поиска не проверены.
