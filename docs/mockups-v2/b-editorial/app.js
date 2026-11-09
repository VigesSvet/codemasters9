/* ГАВКО — вариант B «Редакционный»: общая шапка/футер, тема, язык KZ/RU/EN, ИИ-помощник.
   Страницы подключают app.js и кладут свои строки через T({ключ:[ru,kk,en]}). */
(function () {
  var q = new URLSearchParams(location.search);
  var base = document.body.dataset.base || '';
  var page = document.body.dataset.page || '';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  var LANGS = ['ru', 'kk', 'en'];
  var lang = q.get('lang') || ls('gavko-lang') || 'ru';
  if (LANGS.indexOf(lang) < 0) lang = 'ru';
  var theme = q.get('theme') || ls('gavko-theme') || 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = lang;

  var D = window.D = {};
  window.T = function (o) { for (var k in o) D[k] = o[k]; };
  function tr(k) { var v = D[k]; return v ? (v[LANGS.indexOf(lang)] || v[0]) : k; }
  window.tr = tr;
  window.getLang = function () { return lang; };

  /* ---------- общий словарь ---------- */
  T({
    'logo': ['Госархив<br>ВКО', 'Мемархив<br>ШҚО', 'State<br>Archive'],
    'logo.al': ['Госархив ВКО', 'ШҚО мемлекеттік архиві', 'State Archive of East Kazakhstan'],
    'n.cat': ['Каталог', 'Каталог', 'Catalogue'],
    'n.hist': ['Цифровая история', 'Цифрлық тарих', 'Digital history'],
    'n.exh': ['Выставки', 'Көрмелер', 'Exhibitions'],
    'n.br': ['Филиалы', 'Филиалдар', 'Branches'],
    'n.ai': ['ИИ-помощник', 'ЖИ-көмекші', 'AI assistant'],
    'n.about': ['Об архиве', 'Архив туралы', 'About the archive'],
    'n.menu': ['Меню', 'Мәзір', 'Menu'],
    'n.search': ['Поиск по каталогу', 'Каталог бойынша іздеу', 'Search the catalogue'],
    'n.lang': ['Язык', 'Тіл', 'Language'],
    'n.theme': ['Сменить тему', 'Тақырыпты ауыстыру', 'Switch theme'],
    'n.main': ['Основная навигация', 'Негізгі навигация', 'Main navigation'],
    'f.addr': ['070004, г. Усть-Каменогорск,<br>ул. Головкова, 26/1', '070004, Өскемен қ.,<br>Головков к-сі, 26/1', '26/1 Golovkov St.,<br>Ust-Kamenogorsk 070004'],
    'f.route': ['Как добраться', 'Қалай жетуге болады', 'How to get here'],
    'f.hours': ['Режим работы', 'Жұмыс тәртібі', 'Opening hours'],
    'f.recep': ['Приёмная', 'Қабылдау бөлмесі', 'Reception'],
    'f.recep.h': ['пн–пт 9:00–18:00', 'дс–жм 9:00–18:00', 'Mon–Fri 9:00–18:00'],
    'f.read': ['Читальный зал', 'Оқу залы', 'Reading room'],
    'f.read.h': ['пн–пт 10:00–17:00', 'дс–жм 10:00–17:00', 'Mon–Fri 10:00–17:00'],
    'f.off': ['Выходной', 'Демалыс', 'Closed'],
    'f.off.h': ['сб, вс', 'сб, жс', 'Sat, Sun'],
    'f.rules': ['Правила читального зала', 'Оқу залының ережесі', 'Reading room rules'],
    'f.br': ['Филиалы', 'Филиалдар', 'Branches'],
    'f.uka': ['Усть-Каменогорский (по л/с)', 'Өскемен (жеке құрам бойынша)', 'Ust-Kamenogorsk (personnel records)'],
    'f.altai': ['Алтай', 'Алтай', 'Altai'],
    'f.ridder': ['Риддер', 'Риддер', 'Ridder'],
    'f.zaisan': ['Зайсан', 'Зайсан', 'Zaisan'],
    'f.feedback': ['Отзывы и предложения', 'Пікірлер мен ұсыныстар', 'Feedback and suggestions'],
    'f.low': ['Версия для слабовидящих', 'Көру қабілеті нашарлар үшін нұсқа', 'Accessible version (large text)'],
    'f.priv': ['Политика конфиденциальности', 'Құпиялылық саясаты', 'Privacy policy'],
    'f.egov': ['Государственные услуги (e-gov)', 'Мемлекеттік қызметтер (e-gov)', 'Public services (e-gov)'],
    'f.map': ['Карта сайта', 'Сайт картасы', 'Site map'],
    'f.top': ['Наверх', 'Жоғары', 'Back to top'],
    'f.photo': ['Фотографии: Wikimedia Commons, общественное достояние (Library of Congress, 1885; документы 1893 и 1905 — CC0). Источники в img/SOURCES.txt. Шифры дел условные (макет).', 'Фотосуреттер: Wikimedia Commons, қоғамдық игілік (Library of Congress, 1885; 1893 және 1905 құжаттары — CC0). Деректер көздері img/SOURCES.txt ішінде. Істердің шифрлары шартты (макет).', 'Photographs: Wikimedia Commons, public domain (Library of Congress, 1885; documents of 1893 and 1905 are CC0). Sources in img/SOURCES.txt. Case references are illustrative (mockup).'],
    'f.kz': ['Шығыс Қазақстан облысының мемлекеттік архиві · ә ғ қ ң ө ұ ү һ і', 'Шығыс Қазақстан облысының мемлекеттік архиві · ә ғ қ ң ө ұ ү һ і', 'State Archive of East Kazakhstan Region · ә ғ қ ң ө ұ ү һ і'],
    /* ИИ */
    'ai.fab': ['ИИ-помощник', 'ЖИ-көмекші', 'AI assistant'],
    'ai.title': ['Архивный помощник', 'Архив көмекшісі', 'Archive assistant'],
    'ai.full': ['На весь экран', 'Толық экран', 'Full screen'],
    'ai.close': ['Закрыть', 'Жабу', 'Close'],
    'ai.hello': ['Здравствуйте. Я помогаю ориентироваться в каталоге и разделах сайта, подсказываю шифры и фильтры. Я не принимаю заявки и не заказываю справки.', 'Сәлеметсіз бе. Мен каталог пен сайт бөлімдерінде бағдарлауға, шифрлар мен сүзгілерді таңдауға көмектесемін. Өтінімдер қабылдамаймын және анықтамалар тапсырыс бермеймін.', 'Hello. I help you find your way around the catalogue and the site, and explain references and filters. I do not accept requests or order certificates.'],
    'ai.q1': ['Где найти метрические книги Семипалатинска 1900-х?', 'Семей қаласының 1900-жылдардағы метрикалық кітаптарын қайдан табуға болады?', 'Where can I find the parish registers of Semipalatinsk from the 1900s?'],
    'ai.q2': ['Адрес и часы читального зала', 'Оқу залының мекенжайы мен жұмыс уақыты', 'Reading room address and hours'],
    'ai.q3': ['Что такое шифр дела?', 'Істің шифры дегеніміз не?', 'What is a case reference?'],
    'ai.a1': ['Метрические книги Семипалатинска 1900-х годов (записи о рождениях, браках и смертях) находятся в фонде <b>Ф. 12-И</b> «Семипалатинское духовное правление», опись 1, дела за 1900–1909 гг. Годовые ведомости о населении города есть и в <b>Ф. 1-П</b>. Оригиналы выдаются в читальном зале ГАВКО в Усть-Каменогорске, часть дел оцифрована и открыта на сайте.', 'Семей (Семипалат) қаласының 1900-жылдардағы метрикалық кітаптары (туу, неке және өлім туралы жазбалар) <b>12-И қорында</b> «Семипалат рухани басқармасы», 1-тізімдеме, 1900–1909 жылдардың істерінде сақталған. Қала халқы туралы жылдық тізбелер <b>1-П қорында</b> да бар. Түпнұсқалар ШҚО МА оқу залында беріледі, істердің бір бөлігі цифрландырылып, сайтта ашық.', 'Parish registers of Semipalatinsk for the 1900s (records of births, marriages and deaths) are held in <b>Fond 12-I</b>, “Semipalatinsk Spiritual Consistory”, inventory 1, files for 1900–1909. Annual population returns for the town are also in <b>Fond 1-P</b>. Originals are issued in the reading room in Ust-Kamenogorsk; some files are digitised and open on this site.'],
    'ai.l1': ['Ф. 12-И. Семипалатинское духовное правление: метрические книги', '12-И қоры. Семипалат рухани басқармасы: метрикалық кітаптар', 'Fond 12-I. Semipalatinsk Spiritual Consistory: parish registers'],
    'ai.l2': ['Ф. 1-П. Канцелярия военного губернатора: ведомости о населении', '1-П қоры. Әскери губернатор кеңсесі: халық туралы тізбелер', 'Fond 1-P. Military Governor’s Office: population returns'],
    'ai.l3': ['Читальный зал: адрес, часы, как добраться', 'Оқу залы: мекенжайы, жұмыс уақыты, жол', 'Reading room: address, hours, directions'],
    'ai.more': ['Попробуйте также', 'Мынаны да қараңыз', 'You could also try'],
    'ai.s1': ['метрические книги 1900–1909', 'метрикалық кітаптар 1900–1909', 'parish registers 1900–1909'],
    'ai.s2': ['Семипалатинск перепись', 'Семей халық санағы', 'Semipalatinsk census'],
    'ai.a2': ['Читальный зал работает пн–пт 10:00–17:00 по адресу: г. Усть-Каменогорск, ул. Крылова, 39, тел. 8 (7232) 25-13-47. Приёмная — ул. Головкова, 26/1.', 'Оқу залы дс–жм 10:00–17:00 аралығында жұмыс істейді: Өскемен қ., Крылов к-сі, 39, тел. 8 (7232) 25-13-47. Қабылдау бөлмесі — Головков к-сі, 26/1.', 'The reading room is open Mon–Fri 10:00–17:00 at 39 Krylov St., Ust-Kamenogorsk, tel. 8 (7232) 25-13-47. Reception is at 26/1 Golovkov St.'],
    'ai.a3': ['Шифр — адрес дела в архиве: фонд (Ф.), опись (оп.), дело (д.). Например «Ф. 1-П, оп. 1, д. 245». Его можно ввести в поиск каталога целиком.', 'Шифр — істің архивтегі мекенжайы: қор (Қ.), тізімдеме (тізб.), іс (іс). Мысалы, «Ф. 1-П, оп. 1, д. 245». Оны каталог іздеуіне толық енгізуге болады.', 'A reference is the address of a file in the archive: fond, inventory, file. For example “Fond 1-P, inv. 1, file 245”. You can paste it whole into the catalogue search.'],
    'ai.l4': ['Карточка дела: Ф. 1-П, оп. 1, д. 245', 'Іс картасы: 1-П қор, 1-тізб., 245-іс', 'Case record: Fond 1-P, inv. 1, file 245'],
    'ai.gen': ['Я могу искать только по открытому каталогу. По вашему запросу откройте результаты в каталоге и уточните их фильтрами:', 'Мен тек ашық каталог бойынша іздей аламын. Сұранысыңыз бойынша каталогтағы нәтижелерді ашып, сүзгілермен нақтылаңыз:', 'I can only search the open catalogue. Open the results for your query in the catalogue and refine them with filters:'],
    'ai.lg': ['Открыть результаты в каталоге', 'Каталогтағы нәтижелерді ашу', 'Open results in the catalogue'],
    'ai.disc': ['Сайт информационный: заявки на справки, копии и запросы здесь не принимаются. Ответ подготовлен ИИ по открытому каталогу, проверяйте шифры в карточках дел.', 'Сайт ақпараттық: анықтамаға, көшірмеге өтінімдер мен сұраныстар мұнда қабылданбайды. Жауапты ЖИ ашық каталог бойынша дайындады, шифрларды іс карталарынан тексеріңіз.', 'This is an information site: requests for certificates, copies or enquiries are not accepted here. The answer was prepared by AI from the open catalogue; check references in the case records.'],
    'ai.ph': ['Задайте вопрос о фондах', 'Қорлар туралы сұрақ қойыңыз', 'Ask about the fonds'],
    'ai.send': ['Отправить', 'Жіберу', 'Send'],
    'ai.you': ['Вы', 'Сіз', 'You'],
    'ai.bot': ['Помощник', 'Көмекші', 'Assistant'],
    'ai.nopd': ['Не вводите персональные данные. Запросы к помощнику сохраняются в обезличенном виде.', 'Жеке деректерді енгізбеңіз. Көмекшіге сұраныстар иесіздендірілген түрде сақталады.', 'Do not enter personal data. Queries are stored anonymised.']
  });

  /* общие строки записей каталога (используются на нескольких страницах) */
  var ON = ['Онлайн', 'Онлайн', 'Online'];
  T({
    'k.q.l': ['Поиск по каталогу', 'Каталог бойынша іздеу', 'Search the catalogue'],
    'k.q.b': ['Найти', 'Іздеу', 'Search'],
    'k.t.on': ON, 'k.t.on2': ON, 'k.t.on3': ON,
    'k.t.fond': ['Фонд', 'Қор', 'Fond'], 'k.t.fond2': ['Фонд', 'Қор', 'Fond'],
    'k.fond12': ['Ф. 12-И. Семипалатинское духовное правление', '12-И қор. Семей рухани басқармасы', 'Fond 12-I. Semipalatinsk Spiritual Consistory'],
    'k.fond98': ['Ф. 98-ФД. Фотодокументы по истории региона', '98-ФД қор. Өңір тарихы бойынша фотоқұжаттар', 'Fond 98-FD. Photographic documents on regional history'],
    'c.tree': ['Состав фонда', 'Қор құрамы', 'Contents of the fond'],
    'k.t.delo': ['Дело', 'Іс', 'File'], 'x.home': ['Главная', 'Басты бет', 'Home'],
    'c.copied': ['Скопировано', 'Көшірілді', 'Copied'],
    'r.F1': ['Ф. 1-П. Канцелярия военного губернатора Семипалатинской области', '1-П қор. Семей облысы әскери губернаторының кеңсесі', 'Fond 1-P. Office of the Military Governor of Semipalatinsk Region'],
    'r.O1': ['Опись 1. Дела общего делопроизводства', '1-тізімдеме. Жалпы іс жүргізу істері', 'Inventory 1. General administration files'],
    'r.O2': ['Опись 2. Дела Зайсанского уезда', '2-тізімдеме. Зайсан уезінің істері', 'Inventory 2. Files of Zaisan district'],
    'r.O3': ['Опись 3. Дела Усть-Каменогорского уезда', '3-тізімдеме. Өскемен уезінің істері', 'Inventory 3. Files of Ust-Kamenogorsk district'],
    'r.O4': ['Опись 4. Справочные издания', '4-тізімдеме. Анықтамалық басылымдар', 'Inventory 4. Reference publications'],
    'r.O1s': ['Оп. 1 · 1854–1917 · 312 дел', '1-тізб. · 1854–1917 · 312 іс', 'Inv. 1 · 1854–1917 · 312 files'],
    'r.O2s': ['Оп. 2 · 1868–1917 · 148 дел', '2-тізб. · 1868–1917 · 148 іс', 'Inv. 2 · 1868–1917 · 148 files'],
    'r.O3s': ['Оп. 3 · 1868–1917 · 204 дела', '3-тізб. · 1868–1917 · 204 іс', 'Inv. 3 · 1868–1917 · 204 files'],
    'r.O4s': ['Оп. 4 · 1860–1917 · 67 дел', '4-тізб. · 1860–1917 · 67 іс', 'Inv. 4 · 1860–1917 · 67 files'],
    'r.D241': ['Обзор Семипалатинской области за 1893 год', '1893 жылғы Семей облысына шолу', 'Survey of Semipalatinsk region for 1893'],
    'r.D242': ['Списки населённых мест Усть-Каменогорского уезда', 'Өскемен уезінің елді мекендер тізімдері', 'Lists of settlements of Ust-Kamenogorsk district'],
    'r.D243': ['Всеподданнейший отчёт военного губернатора за 1897 год', 'Әскери губернатордың 1897 жылғы жоғары есебі', 'Military governor’s report to the Emperor for 1897'],
    'r.D244': ['Сведения о ярмарках и торговых сборах', 'Жәрмеңкелер мен сауда алымдары туралы мәліметтер', 'Data on fairs and trade dues'],
    'r.D245': ['Первая всеобщая перепись населения 1897 г., Семипалатинская область', '1897 жылғы бірінші жалпыға бірдей халық санағы, Семей облысы', 'First general census of 1897, Semipalatinsk region'],
    'r.n241': ['д. 241', '241-іс', 'file 241'], 'r.n242': ['д. 242', '242-іс', 'file 242'], 'r.n243': ['д. 243', '243-іс', 'file 243'], 'r.n244': ['д. 244', '244-іс', 'file 244'], 'r.n245': ['д. 245', '245-іс', 'file 245'],
    'd.dates': ['Даты', 'Күндері', 'Dates'], 'd.ref': ['Шифр', 'Шифр', 'Reference'],
    'd.lang': ['Язык', 'Тілі', 'Language'], 'd.lang.v': ['русский', 'орыс тілі', 'Russian'],
    'd.place': ['Место хранения', 'Сақтау орны', 'Location'], 'd.place.v': ['ГАВКО, Усть-Каменогорск', 'ШҚО МА, Өскемен', 'State Archive, Ust-Kamenogorsk'],
    'd.no': ['Дело', 'Іс', 'File'], 'd.title': ['Заголовок', 'Атауы', 'Title'], 'd.sheets.s': ['Листов', 'Парақ', 'Sheets'], 'd.status': ['Доступ', 'Қолжетімділік', 'Access'],
    'd.st.read': ['Читальный зал', 'Оқу залы', 'Reading room'], 'd.st.read2': ['Читальный зал', 'Оқу залы', 'Reading room'],
    'd.perma': ['Постоянная ссылка', 'Тұрақты сілтеме', 'Permanent link'], 'd.url': ['Адрес страницы', 'Бет мекенжайы', 'Page address'], 'd.copyurl': ['Копировать ссылку', 'Сілтемені көшіру', 'Copy link'],
    't.exh': ['Выставка', 'Көрме', 'Exhibition'], 't.col': ['Коллекция', 'Жинақ', 'Collection'], 't.chron': ['Хронология', 'Хронология', 'Timeline']
  });

  /* ---------- иконки ---------- */
  var SVG = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
    '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="2" fill="none"/></symbol>' +
    '<symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none"/></symbol>' +
    '<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none"/></symbol>' +
    '<symbol id="i-theme" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></symbol>' +
    '<symbol id="i-chat" viewBox="0 0 24 24"><path d="M3.5 4.5h17v12h-8l-5 4v-4h-4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 12.5h5" stroke="currentColor" stroke-width="1.8"/></symbol>' +
    '<symbol id="i-x" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" fill="none"/></symbol>' +
    '<symbol id="i-full" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="2" fill="none"/></symbol>' +
    '<symbol id="i-fond" viewBox="0 0 16 16"><rect x="1.5" y="3" width="13" height="10.5" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 6.5h13M6 9h4" stroke="currentColor" stroke-width="1.2" fill="none"/></symbol>' +
    '<symbol id="i-folder" viewBox="0 0 16 16"><path d="M1.5 3.5h4.5l1.5 1.8h7v7.7h-13z" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol>' +
    '<symbol id="i-chev-r" viewBox="0 0 12 12"><path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.6" fill="none"/></symbol>' +
    '<symbol id="i-chev-d" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" fill="none"/></symbol>' +
    '<symbol id="i-chev-l" viewBox="0 0 12 12"><path d="M8 2L4 6l4 4" stroke="currentColor" stroke-width="1.6" fill="none"/></symbol>' +
    '<symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>' +
    '<symbol id="i-plus" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="1.8"/></symbol>' +
    '<symbol id="i-zoom" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15 15l6 6M10 7v6M7 10h6" stroke="currentColor" stroke-width="1.8" fill="none"/></symbol>' +
    '<symbol id="i-rot" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" stroke="currentColor" stroke-width="1.8" fill="none"/></symbol>' +
    '<symbol id="i-page" viewBox="0 0 16 16"><rect x="3.5" y="1.5" width="9" height="13" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 5h5M5.5 8h5M5.5 11h3" stroke="currentColor" stroke-width="1.2"/></symbol>' +
    '<symbol id="i-grid" viewBox="0 0 16 16"><rect x="2" y="2" width="5" height="5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="2" width="5" height="5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2" y="9" width="5" height="5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="9" width="5" height="5" fill="none" stroke="currentColor" stroke-width="1.4"/></symbol>' +
    '<symbol id="i-info" viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="11" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M13 10h6M13 14h6" stroke="currentColor" stroke-width="1.6"/></symbol>' +
    '<symbol id="i-filt" viewBox="0 0 24 24"><path d="M3 7h10M17 7h4M3 17h4M11 17h10" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="15" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>' +
    '<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>' +
    '<symbol id="i-ext" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" stroke="currentColor" stroke-width="1.8" fill="none"/></symbol>' +
    '</svg>';

  /* ---------- шапка ---------- */
  var NAV = [['n.cat', 'katalog.html', 'catalog'], ['n.hist', 'istoriya.html', 'history'], ['n.exh', 'vystavka.html', 'exhibition'],
    ['n.br', 'filialy.html', 'branches'], ['n.ai', 'ii.html', 'ai'], ['n.about', 'ob-arhive.html', 'about']];
  var isAdmin = base !== '';
  function langBtns() { return LANGS.map(function (l) { return '<button type="button" data-l="' + l + '" aria-pressed="' + (l === lang) + '">' + (l === 'kk' ? 'KZ' : l.toUpperCase()) + '</button>'; }).join(''); }
  function header() {
    var nav = NAV.map(function (n) { return '<a href="' + base + n[1] + '"' + (page === n[2] || (page === 'catalog' && n[2] === 'catalog') ? ' aria-current="page"' : '') + ' data-i="' + n[0] + '"></a>'; }).join('');
    return SVG + '<header class="hdr" id="top"><div class="wrap">' +
      '<button class="ibtn burger" type="button" data-i-al="n.menu" aria-expanded="false"><svg><use href="#i-menu"/></svg></button>' +
      '<a class="logo" href="' + base + 'index.html" data-i="logo" data-i-al="logo.al"></a><span class="sep"></span>' +
      '<nav class="nav" data-i-al="n.main">' + nav + '</nav>' +
      '<div class="hdr-r"><div class="lang" role="group" data-i-al="n.lang">' + langBtns() + '</div>' +
      '<button class="ibtn theme-t" type="button" data-i-al="n.theme"><svg><use href="#i-theme"/></svg></button>' +
      '<a class="ibtn" href="' + base + 'katalog.html" data-i-al="n.search"><svg><use href="#i-search"/></svg></a></div></div>' +
      '<nav class="mnav" hidden>' + nav + '<div class="lang" role="group">' + langBtns() + '</div></nav></header>';
  }
  function footer() {
    var b = base;
    return '<footer class="ftr"><div class="wrap"><div class="cols">' +
      '<div><a class="logo" href="' + b + 'index.html" data-i="logo"></a><p data-i="f.addr"></p><p style="margin-top:20px">8 (7232) 25-59-76<br><a href="mailto:arhiv-ukg@yandex.kz">arhiv-ukg@yandex.kz</a></p><p style="margin-top:20px"><a href="' + b + 'filialy.html#hq" data-i="f.route"></a></p></div>' +
      '<div><h4 data-i="f.hours"></h4><table><tr><td data-i="f.recep"></td><td data-i="f.recep.h"></td></tr><tr><td data-i="f.read"></td><td data-i="f.read.h"></td></tr><tr><td data-i="f.off"></td><td data-i="f.off.h"></td></tr></table><p style="margin-top:20px"><a href="' + b + 'ob-arhive.html#reading" data-i="f.rules"></a></p></div>' +
      '<div><h4 data-i="f.br"></h4><ul><li><a href="' + b + 'filialy.html#uka" data-i="f.uka"></a></li><li><a href="' + b + 'filialy.html#altai" data-i="f.altai"></a></li><li><a href="' + b + 'filialy.html#ridder" data-i="f.ridder"></a></li><li><a href="' + b + 'filialy.html#zaisan" data-i="f.zaisan"></a></li></ul></div>' +
      '<div><ul>' + NAV.map(function (n) { return '<li><a href="' + b + n[1] + '" data-i="' + n[0] + '"></a></li>'; }).join('') + '<li><a href="' + b + 'ob-arhive.html#feedback" data-i="f.feedback"></a></li></ul></div></div>' +
      '<div class="l2"><a href="#" class="low-t" data-i="f.low"></a><a href="' + b + 'ob-arhive.html#privacy" data-i="f.priv"></a><a href="https://egov.kz" rel="noopener" data-i="f.egov"></a><a href="' + b + 'ob-arhive.html#sitemap" data-i="f.map"></a></div>' +
      '<div class="fine"><span><span data-i="f.photo"></span><br><span class="kz" data-i="f.kz"></span></span><a href="#top" data-i="f.top"></a></div></div></footer>';
  }

  /* ---------- ИИ-помощник ---------- */
  var ANS = {
    1: { t: 'ai.a1', links: [['ai.l1', 'katalog.html?q=' + encodeURIComponent('метрические книги Семипалатинск')], ['ai.l2', 'fond.html'], ['ai.l3', 'filialy.html#hq']], more: ['ai.s1', 'ai.s2'] },
    2: { t: 'ai.a2', links: [['ai.l3', 'filialy.html#hq']] },
    3: { t: 'ai.a3', links: [['ai.l4', 'delo.html']] }
  };
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function msgUser(t) { return '<div class="m u"><span class="who">' + tr('ai.you') + '</span><p>' + esc(t) + '</p></div>'; }
  function msgBot(a, free) {
    var h = '<div class="m b"><span class="who">' + tr('ai.bot') + '</span><p>' + (free ? tr('ai.gen') : tr(a.t)) + '</p>';
    var links = free ? [['ai.lg', 'katalog.html?q=' + encodeURIComponent(free)]] : a.links;
    h += '<ul class="srcs">' + links.map(function (l) { return '<li><a href="' + base + l[1] + '"><svg><use href="#i-arrow"/></svg>' + tr(l[0]) + '</a></li>'; }).join('') + '</ul>';
    if (a && a.more) h += '<p class="more">' + tr('ai.more') + ':</p><div class="sug">' + a.more.map(function (k) { return '<a href="' + base + 'katalog.html?q=' + encodeURIComponent(tr(k)) + '">' + tr(k) + '</a>'; }).join('') + '</div>';
    h += '<p class="disc">' + tr('ai.disc') + '</p></div>';
    return h;
  }
  function mountChat(el, preset) {
    el.innerHTML = '<div class="chat-log" aria-live="polite"><div class="m b"><span class="who">' + tr('ai.bot') + '</span><p>' + tr('ai.hello') + '</p></div></div>' +
      '<div class="chips">' + [1, 2, 3].map(function (i) { return '<button type="button" data-a="' + i + '">' + tr('ai.q' + i) + '</button>'; }).join('') + '</div>' +
      '<form class="chat-in"><input type="text" placeholder="' + esc(tr('ai.ph')) + '" aria-label="' + esc(tr('ai.ph')) + '"><button class="btn p" type="submit">' + tr('ai.send') + '</button></form><p class="nopd">' + tr('ai.nopd') + '</p>';
    var log = el.querySelector('.chat-log');
    function say(ask, a, free, instant) {
      log.insertAdjacentHTML('beforeend', msgUser(ask));
      function reply() { log.insertAdjacentHTML('beforeend', msgBot(a, free)); if (!instant) log.scrollTop = log.scrollHeight; }
      if (instant) reply(); else setTimeout(reply, 450);
      if (!instant) log.scrollTop = log.scrollHeight;
    }
    el.querySelectorAll('.chips button').forEach(function (b) { b.onclick = function () { var i = +b.dataset.a; say(tr('ai.q' + i), ANS[i]); }; });
    el.querySelector('form').onsubmit = function (e) { e.preventDefault(); var inp = el.querySelector('input'); var v = inp.value.trim(); if (!v) return; inp.value = ''; say(v, null, v); };
    if (preset) say(tr('ai.q1'), ANS[1], null, true);
  }
  window.mountChat = mountChat;
  function aiWidget() {
    var wrap = document.createElement('div');
    wrap.innerHTML = '<button class="ai-fab" type="button" aria-expanded="false"><svg><use href="#i-chat"/></svg><span data-i="ai.fab"></span></button>' +
      '<section class="ai-panel" hidden aria-label="' + esc(tr('ai.title')) + '"><div class="ai-h"><b>' + tr('ai.title') + '</b><span><a class="ibtn" href="' + base + 'ii.html" aria-label="' + esc(tr('ai.full')) + '"><svg><use href="#i-full"/></svg></a><button class="ibtn ai-x" type="button" aria-label="' + esc(tr('ai.close')) + '"><svg><use href="#i-x"/></svg></button></span></div><div class="chat"></div></section>';
    document.body.appendChild(wrap);
    var fab = wrap.querySelector('.ai-fab'), pan = wrap.querySelector('.ai-panel');
    var mounted = false;
    function open(v) { if (page === 'ai') { var i = document.querySelector('.chat-full input'); if (i) i.focus(); return; } pan.hidden = !v; fab.setAttribute('aria-expanded', v); if (v && !mounted) { mountChat(pan.querySelector('.chat'), q.get('ai') === '1'); mounted = true; } }
    fab.onclick = function () { open(pan.hidden); };
    wrap.querySelector('.ai-x').onclick = function () { open(false); };
    if (q.get('ai') === '1' && page !== 'ai') open(true);
  }

  /* ---------- применение языка ---------- */
  function apply(root) {
    (root || document).querySelectorAll('[data-i]').forEach(function (e) { var k = e.getAttribute('data-i'); if (D[k]) e.innerHTML = tr(k); });
    (root || document).querySelectorAll('[data-i-ph]').forEach(function (e) { e.placeholder = tr(e.getAttribute('data-i-ph')); });
    (root || document).querySelectorAll('[data-i-al]').forEach(function (e) { e.setAttribute('aria-label', tr(e.getAttribute('data-i-al'))); });
    (root || document).querySelectorAll('[data-i-v]').forEach(function (e) { e.value = tr(e.getAttribute('data-i-v')); });
    var tt = document.body.dataset.title; if (tt && D[tt]) document.title = tr(tt).replace(/<[^>]+>/g, '');
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.l === lang); });
  }
  window.applyLang = apply;
  function setLang(l) {
    lang = l; ls('gavko-lang', l); apply();
    var panel = document.querySelector('.ai-panel .chat'); if (panel) { panel.innerHTML = ''; panel.parentNode.querySelector('.ai-h b').textContent = tr('ai.title'); mountChat(panel, false); }
    var full = document.querySelector('.chat-full'); if (full) mountChat(full, true);
    document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var h = document.getElementById('hdr'); if (h) h.outerHTML = header();
    var f = document.getElementById('ftr'); if (f) f.outerHTML = footer();
    aiWidget();
    var full = document.querySelector('.chat-full'); if (full) mountChat(full, true);
    apply();
    document.querySelectorAll('.lang button').forEach(function (b) { b.onclick = function () { setLang(b.dataset.l); }; });
    document.querySelectorAll('.theme-t').forEach(function (b) { b.onclick = function () { theme = theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; ls('gavko-theme', theme); }; });
    var bg = document.querySelector('.burger'), mn = document.querySelector('.mnav');
    if (bg) bg.onclick = function () { mn.hidden = !mn.hidden; bg.setAttribute('aria-expanded', !mn.hidden); };
    document.addEventListener('click', function (e) {
      var c = e.target.closest && e.target.closest('.copy'); if (!c) return;
      var v = c.dataset.copy; try { navigator.clipboard.writeText(v); } catch (x) {}
      var old = c.innerHTML; c.textContent = tr('c.copied'); setTimeout(function () { c.innerHTML = old; if (c.dataset.i) c.innerHTML = tr(c.dataset.i); }, 1400);
    });
    document.addEventListener('click', function (e) { var f = e.target.closest && e.target.closest('.fav'); if (f) f.setAttribute('aria-pressed', f.getAttribute('aria-pressed') !== 'true'); });
    var low = document.querySelector('.low-t'); if (low) low.onclick = function (e) { e.preventDefault(); document.documentElement.classList.toggle('big'); };
    document.dispatchEvent(new CustomEvent('chromeready'));
  });
})();
