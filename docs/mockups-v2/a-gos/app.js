/* Общая оболочка сайта: шапка, подвал, переключатели темы и языка, ИИ-помощник.
   Язык: RU по умолчанию; для каждого элемента перевод лежит в data-kk / data-en (RU — сам текст разметки).
   Тема и язык хранятся в localStorage и действуют на всех страницах. */
(function () {
  var root = document.documentElement, body = document.body;
  var B = body.dataset.base || "";
  var ADMIN = body.hasAttribute("data-admin");
  var LANG = "ru";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
  function X(ru, kk, en) { return '<span data-kk="' + esc(kk) + '" data-en="' + esc(en) + '">' + ru + "</span>"; }
  var L = function (ru, kk, en) { return LANG === "kk" ? kk : LANG === "en" ? en : ru; };
  window.tr = L;
  window.gosX = X;

  var SEARCH = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M6.5 0a6.5 6.5 0 015.2 10.4l4 4-1.4 1.4-4-4A6.5 6.5 0 116.5 0zm0 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"/></svg>';
  var LOGO = '<a class="logo" href="' + B + 'index.html" aria-label="Госархив ВКО"><span class="r"><span>ГОС</span><i></i></span><span class="r"><span>АРХИВ</span></span><span class="r"><span>ВКО</span></span></a>';
  var cur = body.dataset.nav || "";
  function nav(href, key, ru, kk, en) { return '<li><a href="' + B + href + '"' + (cur === key ? ' aria-current="page"' : "") + ">" + X(ru, kk, en) + "</a></li>"; }

  /*MAP*/var SITE_MAP=[["docs",["Документы","Құжаттар","Documents"],[["zakony.html#law",["Законодательные и нормативные акты","Заңнамалық және нормативтік актілер","Laws and regulations"]],["zakony.html#method",["Научно-методическая база","Ғылыми-әдістемелік база","Research and methodology"]],["zakony.html#collections",["Сборники документов","Құжаттар жинақтары","Document collections"]],["zakony.html#docs",["Документы","Құжаттар","Documents"]],["simvoly.html",["Государственные символы РК","ҚР мемлекеттік рәміздері","State symbols of Kazakhstan"]],["uslugi.html#gov",["Государственные услуги","Мемлекеттік қызметтер","Public services"]],["uslugi.html#paid",["Платные услуги","Ақылы қызметтер","Paid services"]],["priem.html",["График приёма граждан","Азаматтарды қабылдау кестесі","Reception schedule"]],["priem.html#anticor",["Антикоррупция","Сыбайлас жемқорлыққа қарсы іс-қимыл","Anti-corruption"]]]],["pub",["Публикации","Жарияланымдар","Publications"],[["publikacii.html#reports",["Доклады, информации","Баяндамалар, ақпараттар","Reports and briefings"]],["publikacii.html#publicism",["Публицистика","Публицистика","Journalism"]],["publikacii.html#speeches",["Выступления","Сөздер","Speeches"]],["lichnye-fondy.html",["Личные фонды","Жеке қорлар","Personal fonds"]],["istoriya-kraya.html",["История края","Өлке тарихы","History of the region"]],["slovar.html",["Глоссарий","Глоссарий","Glossary"]],["metriki.html",["Метрические книги","Метрикалық кітаптар","Parish registers"]],["kalendar.html",["Календарь памятных дат","Ұмытылмас даталар күнтізбесі","Calendar of memorable dates"]]]],["media",["Медиа","Медиа","Media"],[["video.html",["Архивные видеоматериалы","Мұрағат бейнематериалдары","Archive videos"]],["galereya.html",["Фотогалерея","Фотогалерея","Photo gallery"]],["vystavki-arhiv.html",["Выставки","Көрмелер","Exhibitions"]],["bazy.html",["Базы данных","Деректер қорлары","Databases"]],["bazy.html#chronicle",["Цифровая летопись ВКО","ШҚО цифрлық жылнамасы","Digital chronicle of VKO"]]]],["news",["Новости","Жаңалықтар","News"],[["news.html",["Новости","Жаңалықтар","News"]],["news.html?all=1",["Архив новостей","Жаңалықтар мұрағаты","News archive"]],["obyavleniya.html",["Объявления","Хабарландырулар","Announcements"]],["oprosy.html",["Архив опросов","Сауалнамалар мұрағаты","Polls archive"]],["gostevaya.html",["Гостевая книга","Қонақтар кітабы","Guestbook"]]]],["about",["Об архиве","Архив туралы","About the archive"],[["ob-arhive.html#contacts",["Контактная информация","Байланыс ақпараты","Contact information"]],["ob-arhive.html#history",["История архива","Архив тарихы","History of the archive"]],["ob-arhive.html#fonds",["Характеристика фондов","Қорлар сипаттамасы","Characteristics of fonds"]],["ob-arhive.html#structure",["Структура, функции","Құрылымы, функциялары","Structure and functions"]],["ob-arhive.html#about",["Деятельность архива","Архив қызметі","Activities"]],["ob-arhive.html#reading",["Читальный зал","Оқу залы","Reading room"]],["filialy.html",["Филиалы (13) на карте","Картадағы филиалдар (13)","Branches (13) on the map"]],["slabovidyaschih.html",["Версия для слабовидящих","Көзі нашар көретіндерге арналған нұсқа","Accessible version"]],["karta-sayta.html",["Карта сайта","Сайт картасы","Site map"]]]]];/*END*/
  function fmap() {
    var h = '<nav class="fmap" aria-label="' + L("Все разделы сайта", "Сайттың барлық бөлімдері", "All sections") + '">';
    SITE_MAP.forEach(function (g) {
      h += "<div><h2>" + X(g[1][0], g[1][1], g[1][2]) + "</h2><ul>";
      g[2].forEach(function (i) { h += '<li><a href="' + B + i[0] + '">' + X(i[1][0], i[1][1], i[1][2]) + "</a></li>"; });
      h += "</ul></div>";
    });
    return h + "</nav>";
  }
  var TOP =
    '<a class="skip" href="#main">' + X("Перейти к содержимому", "Мазмұнға өту", "Skip to content") + "</a>" +
    '<div class="phase"><div class="wrap"><b>' + X("ПРОТОТИП", "ҮЛГІ", "PROTOTYPE") + "</b><span>" +
    X("Это прототип нового сайта. Сайт информационный: заявки, заказы и платежи не принимаются.", "Бұл жаңа сайттың үлгісі. Сайт ақпараттық: өтініштер, тапсырыстар және төлемдер қабылданбайды.", "This is a prototype of the new website. The site is informational: no applications, orders or payments.") +
    ' <a href="' + B + 'ob-arhive.html#feedback">' + X("Оставьте отзыв", "Пікір қалдырыңыз", "Leave feedback") + "</a>.</span></div></div>" +
    '<header class="hdr"><div class="wrap">' +
    '<div class="util"><a href="tel:+77232255976">8 (7232) 25-59-76</a>' +
    '<a href="' + B + 'karta-sayta.html">' + X("Все разделы", "Барлық бөлімдер", "All sections") + "</a>" +
    '<span class="wx" id="wx" title="Усть-Каменогорск" aria-live="polite"></span>' +
    '<button class="vi" type="button" data-vi-toggle aria-pressed="false">' + X("Для слабовидящих", "Нашар көретіндерге", "Accessible version") + "</button>" +
    '<span class="lang" role="group" aria-label="Язык / Тіл / Language"><button data-lang="kk" aria-pressed="false">KZ</button><button data-lang="ru" aria-pressed="true">RU</button><button data-lang="en" aria-pressed="false">EN</button></span>' +
    '<button class="tt" data-theme-toggle type="button"><span data-tt></span></button>' +
    '<form class="hs" action="' + B + 'katalog.html" role="search"><input type="search" name="q" aria-label="Поиск" data-phkk="Іздеу" data-phen="Search" placeholder="Поиск"><button aria-label="Найти">' + SEARCH + "</button></form>" +
    "</div>" +
    '<div class="main">' + LOGO +
    '<button class="burger" aria-expanded="false" aria-controls="nav"><span>' + X("Меню", "Мәзір", "Menu") + "</span><i></i></button>" +
    '<nav class="nav" id="nav" aria-label="Основная"><ul>' +
    nav("katalog.html", "katalog", "Каталог", "Каталог", "Catalogue") +
    nav("istoriya.html", "istoriya", "Цифровая история региона", "Өңірдің цифрлық тарихы", "Digital history of the region") +
    nav("vystavka.html", "vystavka", "Онлайн-выставки", "Онлайн көрмелер", "Online exhibitions") +
    nav("filialy.html", "filialy", "Филиалы на карте", "Картадағы филиалдар", "Branches on the map") +
    nav("ii.html", "ii", "ИИ-помощник", "ЖИ көмекшісі", "AI assistant") +
    nav("ob-arhive.html", "ob", "Об архиве", "Архив туралы", "About the archive") +
    "</ul></nav></div></div></header>";

  var ADMTOP =
    '<a class="skip" href="#main">' + X("Перейти к содержимому", "Мазмұнға өту", "Skip to content") + "</a>" +
    '<header class="hdr"><div class="wrap">' +
    '<div class="util" style="height:auto;padding:12px 0"><span style="margin-right:auto">' + X("Администрирование: Мария Ибраева, редактор", "Әкімшілік: Мария Ибраева, редактор", "Admin: Maria Ibrayeva, editor") + "</span>" +
    '<a href="' + B + 'index.html">' + X("На сайт", "Сайтқа", "To the site") + "</a>" +
    '<span class="lang" role="group" aria-label="Язык"><button data-lang="kk" aria-pressed="false">KZ</button><button data-lang="ru" aria-pressed="true">RU</button><button data-lang="en" aria-pressed="false">EN</button></span>' +
    '<button class="tt" data-theme-toggle type="button"><span data-tt></span></button></div>' +
    '<div class="main" style="padding-bottom:16px;align-items:center">' + LOGO +
    '<b style="font:500 28px var(--font-display);color:#fff">' + X("Панель управления", "Басқару панелі", "Control panel") + "</b></div></div></header>";

  var BOTTOM =
    '<div class="themebar"><div class="wrap">' +
    '<button data-theme-btn="system" aria-pressed="true"><svg class="ico" viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5v11a5.5 5.5 0 010-11z"/></svg>' + X("Системная тема", "Жүйелік тақырып", "System theme") + "</button>" +
    '<button data-theme-btn="light" aria-pressed="false">' + X("Светлая тема", "Жарық тақырып", "Light theme") + "</button>" +
    '<button data-theme-btn="dark" aria-pressed="false">' + X("Тёмная тема", "Қараңғы тақырып", "Dark theme") + "</button></div></div>" +
    '<footer class="ftr"><div class="wrap">' + fmap() + '<div class="cols">' +
    '<div class="addr">' + LOGO.replace('class="logo"', 'class="logo" style="width:108px"') +
    "<b>" + X("КГУ «Государственный архив» Восточно-Казахстанской области", "ШҚО «Мемлекеттік архив» КММ", "State Archive of East Kazakhstan Region") + "</b>" +
    X("г. Усть-Каменогорск, ул. Головкова, 26/1", "Өскемен қ., Головков к-сі, 26/1", "Ust-Kamenogorsk, Golovkov st., 26/1") +
    "<br>8 (7232) 25-59-76<br>arhiv-ukg@yandex.kz<br>" + X("пн-пт 9:00-18:00", "дс-жм 9:00-18:00", "Mon-Fri 9:00-18:00") + "<br>" +
    '<a href="' + B + 'ob-arhive.html#social">' + X("Соцсети: Instagram, Telegram, YouTube", "Әлеуметтік желілер: Instagram, Telegram, YouTube", "Social: Instagram, Telegram, YouTube") + "</a></div>" +
    "<div><h2>" + X("Быстрые ссылки", "Жылдам сілтемелер", "Quick links") + "</h2><ul>" +
    f("ob-arhive.html", "Об архиве", "Архив туралы", "About the archive") +
    f("ob-arhive.html#reading", "Читальный зал", "Оқу залы", "Reading room") +
    f("ob-arhive.html#news", "Новости и события", "Жаңалықтар мен іс-шаралар", "News and events") +
    f("ob-arhive.html#faq", "Справочная информация и вопросы", "Анықтамалық ақпарат және сұрақтар", "Help and FAQ") +
    f("ob-arhive.html#contacts", "Контакты", "Байланыс", "Contacts") +
    f("ob-arhive.html#feedback", "Отзывы и предложения", "Пікірлер мен ұсыныстар", "Feedback and suggestions") +
    f("admin/index.html", "Вход для сотрудников", "Қызметкерлерге кіру", "Staff sign-in") +
    "</ul></div>" +
    "<div><h2>" + X("Другие ресурсы", "Басқа ресурстар", "Other websites") + "</h2><ul>" +
    ex("https://www.gov.kz/memleket/entities/vko-uca", "Управление цифровизации и архивов ВКО", "ШҚО цифрландыру және архивтер басқармасы", "VKO digitalisation and archives office") +
    ex("https://egov.kz", "eGov.kz", "eGov.kz", "eGov.kz") +
    ex("http://cultura-arhiv.vko.gov.kz", "Цифровая летопись ВКО", "ШҚО цифрлық жылнамасы", "VKO digital chronicle") +
    ex("http://veteran-vko.kz", "Книга памяти ВКО", "ШҚО Естелік кітабы", "VKO Book of Memory") +
    "</ul></div>" +
    '<div class="sub-box"><h2>' + X("Новости архива", "Архив жаңалықтары", "Archive news") + "</h2><p>" + X("Сообщения о новых оцифрованных фондах и выставках.", "Жаңа цифрландырылған қорлар мен көрмелер туралы хабарлар.", "Updates on newly digitised fonds and exhibitions.") + '</p><a class="btn" href="' + B + 'ob-arhive.html#news">' + X("Читать новости", "Жаңалықтарды оқу", "Read news") + "</a></div>" +
    "</div>" +
    '<div class="legal"><a href="' + B + 'ob-arhive.html#legal">' + X("Правовая информация", "Құқықтық ақпарат", "Legal information") + '</a><a href="' + B + 'ob-arhive.html#legal">' + X("Политика конфиденциальности", "Құпиялылық саясаты", "Privacy policy") + '</a><a href="' + B + 'ob-arhive.html#legal">' + X("Авторские права", "Авторлық құқық", "Copyright") + '</a><a href="' + B + 'ob-arhive.html#legal">' + X("Заявление о доступности", "Қолжетімділік туралы мәлімдеме", "Accessibility statement") + "</a></div>" +
    '<div class="legal2"><span>' + X("Материалы сайта доступны по свободной лицензии, если не указано иное. Исторические иллюстрации: Wikimedia Commons, общественное достояние.", "Сайт материалдары, егер өзгеше көрсетілмесе, еркін лицензиямен қолжетімді. Тарихи суреттер: Wikimedia Commons, қоғамдық игілік.", "Site materials are available under a free licence unless stated otherwise. Historical images: Wikimedia Commons, public domain.") + "</span><span>" + X("Прототип, не официальный сайт", "Үлгі, ресми сайт емес", "Prototype, not the official site") + "</span></div></div></footer>";
  function f(h, ru, kk, en) { return '<li><a href="' + B + h + '">' + X(ru, kk, en) + "</a></li>"; }
  function ex(h, ru, kk, en) { return '<li><a href="' + h + '" target="_blank" rel="noopener">' + X(ru, kk, en) + "</a></li>"; }

  var top = document.getElementById("top"), bot = document.getElementById("bottom");
  if (top) top.outerHTML = ADMIN ? ADMTOP : TOP;
  if (bot) bot.outerHTML = BOTTOM;

  /* ---------- ИИ-помощник ---------- */
  var QS = {
    ru: "Где найти метрические книги Семипалатинска 1900-х?",
    kk: "1900 жылдардағы Семей метрикалық кітаптарын қайдан табуға болады?",
    en: "Where can I find parish (metric) registers of Semipalatinsk from the 1900s?"
  };
  function aiSig() {
    return '<p class="disc">' + L("Ответ сформирован автоматически и не является архивной справкой.", "Жауап автоматты түрде қалыптастырылды және архивтік анықтама болып табылмайды.", "This answer was generated automatically and is not an archival certificate.") + " " + L("Демо-режим: заранее подготовленный ответ.", "Демо-режим: алдын ала дайындалған жауап.", "Demo mode: a pre-prepared answer.") + "</p>";
  }
  function answer(q) {
    var closed = /личное дело|личных дел|личного дела|персональн|персонал|иванов|петров|сидоров|жеке іс|жеке дерек|personal|personnel/i.test(q);
    var m = /метри[чк]|metric|parish|кітап/i.test(q);
    var a = '<span class="src3">' + L("Архивный помощник", "Архив көмекшісі", "Archive assistant") + "</span>";
    if (closed) {
      a += "<p>" + L("Материалы с ограниченным доступом (личные дела, персональные данные) на сайте не выдаются.", "Шектеулі қолжетімді материалдар (жеке істер, жеке деректер) сайтта берілмейді.", "Materials with restricted access (personal files, personal data) are not provided on the site.") + "</p>";
      a += "<p>" + L("Скан и файл не выдаются. Ознакомиться можно только в читальном зале архива.", "Скан мен файл берілмейді. Тек архивтің оқу залында танысуға болады.", "The scan and file are not provided. You can consult them only in the archive reading room.") + "</p>";
      a += '<ul><li><a href="' + B + 'nedostupno.html">' + L("Подробнее о недоступных материалах", "Қолжетімсіз материалдар туралы толығырақ", "More about unavailable materials") + "</a></li></ul>";
    } else if (m) {
      a += "<p>" + L("В открытом каталоге найдено два подходящих фонда:", "Ашық каталогтан екі сәйкес қор табылды:", "Two matching fonds were found in the open catalogue:") + "</p><ul>" +
        '<li><a href="' + B + 'katalog.html?q=метрические">' + L("Ф. 18 «Метрические книги приходов Семипалатинской области», 1895-1917", "Ф. 18 «Семей облысы приходтарының метрикалық кітаптары», 1895-1917", "Fonds 18 “Parish registers of Semipalatinsk region”, 1895-1917") + "</a></li>" +
        '<li><a href="' + B + 'fond.html">' + L("Ф. 1-П «Коллекция дореволюционных печатных изданий» (обзоры и памятные книжки области)", "Ф. 1-П «Революцияға дейінгі баспа басылымдарының жинағы»", "Fonds 1-P “Collection of pre-revolutionary printed works”") + "</a></li></ul>" +
        "<p>" + L("Как искать: в каталоге выберите период «1900-1909» и населённый пункт «Семипалатинск». Подробнее о шифрах: ", "Қалай іздеу: каталогта «1900-1909» кезеңін және «Семей» елді мекенін таңдаңыз. Шифрлар туралы: ", "How to search: in the catalogue choose period 1900-1909 and place Semipalatinsk. About reference codes: ") + '<a href="' + B + 'ob-arhive.html#faq">' + L("справка", "анықтама", "help") + "</a>.</p>" +
        "<p>" + L("Семей с 2022 года относится к области Абай, поэтому часть документов может храниться в архиве этой области.", "Семей 2022 жылдан бастап Абай облысына қарайды, сондықтан құжаттардың бір бөлігі сол облыстың архивінде сақталуы мүмкін.", "Since 2022 Semey belongs to Abai region, so some documents may be held by that region's archive.") + "</p>";
    } else {
      a += "<p>" + L("В открытых материалах сайта ответа нет.", "Сайттың ашық материалдарында жауап жоқ.", "There is no answer in the open materials on the site.") + "</p>";
      a += "<p>" + L("Я не выдумываю сведения и не привожу непроверенные шифры. Чтобы уточнить информацию, обратитесь в архив или читальный зал.", "Мен мәліметтер мен тексерілмеген шифрларды ойлап таппаймын. Ақпаратты нақтылау үшін архивке немесе оқу залына хабарласыңыз.", "I do not invent facts or cite unverified references. Contact the archive or the reading room to clarify.") + "</p>";
      a += '<ul><li><a href="' + B + 'ob-arhive.html#contacts">' + L("Контакты архива", "Архив байланыстары", "Archive contacts") + '</a></li><li><a href="' + B + 'ob-arhive.html#reading">' + L("Читальный зал", "Оқу залы", "Reading room") + "</a></li></ul>";
    }
    a += aiSig();
    return a;
  }
  function mountChat(el, full) {
    el.innerHTML =
      '<div class="chd"><b>' + X("Архивный помощник", "Архив көмекшісі", "Archive assistant") + '</b><span style="display:flex;gap:8px">' + (full ? "" : '<a href="' + B + 'ii.html" style="color:#fff;font-size:14px;align-self:center">' + X("Во весь экран", "Толық экран", "Full screen") + "</a>") + (full ? "" : '<button type="button" data-ai-close>' + X("Закрыть", "Жабу", "Close") + "</button>") + "</span></div>" +
      '<div class="cmsg" aria-live="polite"></div>' +
      '<form class="cin" autocomplete="off"><input type="text" aria-label="Вопрос" data-phkk="Ваш вопрос об архиве" data-phen="Your question about the archive" placeholder="Ваш вопрос об архиве"><button aria-label="Отправить">&rarr;</button></form>' +
      '<div class="cnote">' + X("ИИ может ошибаться. Не вводите персональные данные. Заявки не принимаются.", "ЖИ қателесуі мүмкін. Жеке деректерді енгізбеңіз. Өтініштер қабылданмайды.", "AI can make mistakes. Do not enter personal data. Applications are not accepted.") + "</div>";
    trEls(el);
    var box = el.querySelector(".cmsg"), inp = el.querySelector("input");
    function add(cls, html) { var d = document.createElement("div"); d.className = cls; d.innerHTML = html; box.appendChild(d); box.scrollTop = box.scrollHeight; return d; }
    function sug() {
      var s = document.createElement("div"); s.className = "sug";
      [[QS, "m"], [{ ru: "Как читать архивный шифр?", kk: "Архивтік шифрды қалай оқуға болады?", en: "How do I read an archive reference?" }, "c"], [{ ru: "Адрес и часы работы Риддерского филиала", kk: "Риддер филиалының мекенжайы мен жұмыс уақыты", en: "Address and hours of the Ridder branch" }, "b"]].forEach(function (p) {
        var b = document.createElement("button"); b.type = "button"; b.textContent = p[0][LANG]; b.onclick = function () { ask(p[0][LANG]); }; s.appendChild(b);
      });
      box.appendChild(s);
    }
    function ask(q) {
      var old = box.querySelector(".sug"); if (old) old.remove();
      add("m1", esc(q).replace(/&quot;/g, '"'));
      setTimeout(function () {
        var q2 = q;
        if (/шифр|reference|code/i.test(q) && !/метри[чк]|metric/i.test(q)) {
          add("m2", '<span class="src3">' + L("Архивный помощник", "Архив көмекшісі", "Archive assistant") + "</span><p>" + L("Шифр читается слева направо: Ф. 1-П (фонд), Оп. 1 (опись), Д. 245 (дело). Он однозначно указывает на единицу хранения.", "Шифр солдан оңға оқылады: Ф. 1-П (қор), Оп. 1 (тізімдеме), Д. 245 (іс). Ол сақтау бірлігін бірмәнді көрсетеді.", "Read the code left to right: Ф. 1-П (fonds), Оп. 1 (inventory), Д. 245 (file). It identifies exactly one storage unit.") + '</p><ul><li><a href="' + B + 'delo.html">' + L("Пример карточки дела", "Іс картасының үлгісі", "Example file page") + '</a></li><li><a href="' + B + 'ob-arhive.html#faq">' + L("Справка по шифрам", "Шифрлар анықтамасы", "Reference help") + "</a></li></ul>" + aiSig());
        } else if (/риддер|ridder/i.test(q)) {
          add("m2", '<span class="src3">' + L("Архивный помощник", "Архив көмекшісі", "Archive assistant") + "</span><p>" + L("Риддерский филиал: ул. Ч. Валиханова, 44; 8 (72336) 42-264; пн-пт 9:00-18:00.", "Риддер филиалы: Ч. Уәлиханов к-сі, 44; 8 (72336) 42-264; дс-жм 9:00-18:00.", "Ridder branch: Ch. Valikhanov st., 44; +7 72336 42-264; Mon-Fri 9:00-18:00.") + '</p><ul><li><a href="' + B + 'filialy.html?b=ridder">' + L("Открыть на карте", "Картада ашу", "Open on the map") + "</a></li></ul>" + aiSig());
        } else add("m2", answer(q2));
        sug();
      }, 450);
    }
    el.querySelector("form").onsubmit = function (e) { e.preventDefault(); var v = inp.value.trim(); if (v) { inp.value = ""; ask(v); } };
    var g = add("m2", '<span class="src3">' + L("Архивный помощник", "Архив көмекшісі", "Archive assistant") + "</span><p>" + L("Здравствуйте. Я помогу найти фонды, описи, дела и филиалы на этом сайте. Заявки здесь не принимаются.", "Сәлеметсіз бе. Мен осы сайттағы қорларды, тізімдемелерді, істерді және филиалдарды табуға көмектесемін. Өтініштер қабылданбайды.", "Hello. I can help you find fonds, inventories, files and branches on this site. Applications are not accepted here.") + "</p>");
    sug();
    el._ask = ask;
    return el;
  }
  window.mountChat = mountChat;

  var panel = null;
  if (!ADMIN) {
    var btn = document.createElement("button");
    btn.className = "aib"; btn.type = "button"; btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<span class="m">ИИ</span>' + X("Помощник", "Көмекші", "Assistant");
    if (!body.hasAttribute("data-noai")) {
      document.body.appendChild(btn);
      panel = document.createElement("aside"); panel.className = "aip"; panel.setAttribute("aria-label", "ИИ-помощник");
      document.body.appendChild(panel);
      mountChat(panel, false);
    }
    window.openAI = function (run) {
      if (!panel) return;
      panel.classList.add("on"); btn.style.display = "none"; btn.setAttribute("aria-expanded", "true");
      if (run) panel._ask(QS[LANG]);
    };
    btn.onclick = function () { window.openAI(false); };
  }

  /* ---------- тема ---------- */
  function effTheme() { var t = root.getAttribute("data-theme"); if (t) return t; return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  function ttLabel() {
    var d = effTheme() === "dark";
    document.querySelectorAll("[data-tt]").forEach(function (s) { s.textContent = d ? L("Светлая тема", "Жарық тақырып", "Light theme") : L("Тёмная тема", "Қараңғы тақырып", "Dark theme"); });
    if (body.hasAttribute("data-map")) { if (d) body.setAttribute("data-dark-map", ""); else body.removeAttribute("data-dark-map"); }
  }
  function setTheme(t) {
    if (t === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", t);
    try { localStorage.setItem("gos-theme", t); } catch (e) {}
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.themeBtn === t)); });
    ttLabel();
  }

  /* ---------- язык ---------- */
  function lbEls(scope) {
    scope.querySelectorAll('[data-lb="kk"]').forEach(function (k) {
      var kz = LANG === "kk";
      k.hidden = !kz;
      var r = k.parentNode.querySelector(':scope > [data-lb="ru"]');
      if (r) r.hidden = kz;
    });
  }
  function trEls(scope) {
    lbEls(scope);
    scope.querySelectorAll("[data-kk],[data-en]").forEach(function (el) {
      if (el.dataset.ru === undefined) el.dataset.ru = el.innerHTML;
      el.innerHTML = LANG === "ru" ? el.dataset.ru : (el.dataset[LANG] || el.dataset.ru);
    });
    scope.querySelectorAll("[data-phkk],[data-phen]").forEach(function (el) {
      if (el.dataset.phru === undefined) el.dataset.phru = el.placeholder;
      el.placeholder = LANG === "ru" ? el.dataset.phru : (LANG === "kk" ? el.dataset.phkk : el.dataset.phen) || el.dataset.phru;
    });
  }
  window.trEls = trEls;
  function setLang(l) {
    LANG = l; root.lang = l === "kk" ? "kk" : l;
    try { localStorage.setItem("gos-lang", l); } catch (e) {}
    if (panel) mountChat(panel, false);
    trEls(document);
    document.querySelectorAll("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    var t = { ru: "", kk: " — ШҚО мемлекеттік архиві", en: " — State Archive of East Kazakhstan" };
    ttLabel();
    if (typeof window.gosPoll === "function") window.gosPoll();
    if (typeof window.onLang === "function") window.onLang(l);
  }
  window.getLang = function () { return LANG; };

  var q = new URLSearchParams(location.search), st = "system", sl = "ru";
  try { st = localStorage.getItem("gos-theme") || "system"; sl = localStorage.getItem("gos-lang") || "ru"; } catch (e) {}
  if (q.get("theme")) st = q.get("theme");
  if (q.get("lang")) sl = q.get("lang");

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-btn]"); if (t) setTheme(t.dataset.themeBtn);
    var tg = e.target.closest("[data-theme-toggle]"); if (tg) setTheme(effTheme() === "dark" ? "light" : "dark");
    var l = e.target.closest("[data-lang]"); if (l) setLang(l.dataset.lang);
    var b = e.target.closest(".burger"); if (b) { var h = document.querySelector(".hdr"); var o = h.classList.toggle("open"); b.setAttribute("aria-expanded", String(o)); }
    var c = e.target.closest("[data-copy]"); if (c) { try { navigator.clipboard.writeText(c.dataset.copy); } catch (x) {} var o2 = c.textContent; c.textContent = L("Скопировано", "Көшірілді", "Copied"); setTimeout(function () { c.textContent = o2; }, 1500); }
    var cl = e.target.closest("[data-ai-close]"); if (cl && panel) { panel.classList.remove("on"); document.querySelector(".aib").style.display = ""; }
  });
  document.addEventListener("change", function (e) {
    if (e.target.id === "hide-desc") document.querySelector(".full").classList.toggle("hide-desc", e.target.checked);
  });

  /* ---------- погода (open-meteo.com, без ключа) ---------- */
  var WI = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    cloud: '<path d="M7 18a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 18z"/>',
    rain: '<path d="M7 15a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
    snow: '<path d="M7 14a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 14z"/><path d="M8 18h.01M12 20h.01M16 18h.01"/>',
    fog: '<path d="M3 9h18M5 13h14M3 17h18"/>',
    storm: '<path d="M7 14a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 14z"/><path d="M12 14l-2 4h4l-2 4"/>'
  };
  function wxIcon(c) { return c === 0 ? "sun" : c <= 3 ? "cloud" : c <= 48 ? "fog" : c <= 67 || (c >= 80 && c <= 82) ? "rain" : c <= 77 || c === 85 || c === 86 ? "snow" : "storm"; }
  function weather() {
    var w = document.getElementById("wx"); if (!w || ADMIN) return;
    var ic = function (k, t) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + WI[k] + "</svg><span>" + t + "</span>"; };
    w.innerHTML = ic("cloud", "—");
    fetch("https://api.open-meteo.com/v1/forecast?latitude=49.95&longitude=82.61&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto")
      .then(function (r) { return r.json(); }).then(function (d) {
        var c = d.current, t = Math.round(c.temperature_2m);
        w.innerHTML = ic(wxIcon(c.weather_code), (t > 0 ? "+" : "") + t + " °C");
        w.title = L("Погода в Усть-Каменогорске, ветер ", "Өскемендегі ауа райы, жел ", "Weather in Ust-Kamenogorsk, wind ") + c.wind_speed_10m + " " + L("км/ч", "км/сағ", "km/h");
      }).catch(function () { w.innerHTML = ic("cloud", L("Усть-Каменогорск", "Өскемен", "Ust-Kamenogorsk")); });
  }
  weather();

  /* ---------- режим для слабовидящих ---------- */
  function setVI(on) {
    if (on) root.setAttribute("data-vi", ""); else root.removeAttribute("data-vi");
    try { localStorage.setItem("gos-vi", on ? "1" : "0"); } catch (e) {}
    document.querySelectorAll("[data-vi-toggle]").forEach(function (b) { b.setAttribute("aria-pressed", String(on)); });
  }
  try { if (localStorage.getItem("gos-vi") === "1") setVI(true); } catch (e) {}
  if (new URLSearchParams(location.search).get("vi")) setVI(true);
  document.addEventListener("click", function (e) { if (e.target.closest("[data-vi-toggle]")) setVI(!root.hasAttribute("data-vi")); });

  /* ---------- вкладка «Опрос» ---------- */
  if (!ADMIN) {
    var PQ = { q: ["Какой раздел сайта для Вас наиболее интересен?", "Сайттың қай бөлімі сізге ең қызықты?", "Which section of the site interests you most?"],
      a: [["Научно-методическая база", 308], ["Личные фонды", 548], ["Сборники документов", 460], ["Публицистика", 95], ["История края", 763], ["Базы данных", 1634], ["Фотогалерея", 897]] };
    var tab = document.createElement("button"); tab.className = "optab"; tab.type = "button"; tab.setAttribute("aria-expanded", "false");
    var pp = document.createElement("div"); pp.className = "opp"; pp.setAttribute("role", "dialog"); pp.setAttribute("aria-label", "Опрос");
    function drawPoll(voted) {
      var tot = 0; PQ.a.forEach(function (a) { tot += a[1]; });
      var h = '<button class="x" type="button" aria-label="' + L("Закрыть", "Жабу", "Close") + '">×</button><h2>' + L.apply(null, PQ.q) + "</h2>";
      if (!voted) {
        h += "<form>" + PQ.a.map(function (a, i) { return '<label><input type="radio" name="pv" value="' + i + '"> ' + a[0] + "</label>"; }).join("") +
          '<p><button class="btn sm" type="submit">' + L("Проголосовать", "Дауыс беру", "Vote") + '</button> <a href="' + B + 'oprosy.html">' + L("Архив опросов", "Сауалнамалар мұрағаты", "Polls archive") + "</a></p></form>";
      } else {
        h += PQ.a.map(function (a) { return "<div>" + a[0] + " <b>" + Math.round(a[1] * 100 / tot) + '%</b><span class="bar"><i style="width:' + (a[1] * 100 / tot) + '%"></i></span></div>'; }).join("") +
          '<p><a href="' + B + 'oprosy.html">' + L("Архив опросов", "Сауалнамалар мұрағаты", "Polls archive") + "</a></p>";
      }
      pp.innerHTML = h;
    }
    function lab() { tab.textContent = L("Опрос", "Сауалнама", "Poll"); }
    lab(); drawPoll(false);
    tab.onclick = function () { pp.classList.toggle("on"); tab.setAttribute("aria-expanded", String(pp.classList.contains("on"))); };
    pp.addEventListener("click", function (e) { if (e.target.closest(".x")) { pp.classList.remove("on"); tab.setAttribute("aria-expanded", "false"); } });
    pp.addEventListener("submit", function (e) { e.preventDefault(); var c = pp.querySelector("input:checked"); if (c) PQ.a[+c.value][1]++; drawPoll(true); });
    document.body.appendChild(tab); document.body.appendChild(pp);
    window.gosPoll = function () { lab(); drawPoll(false); };
  }

  /* ---------- карусель баннеров ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (c) {
    var sl = [].slice.call(c.querySelectorAll(".sl")), i = 0, dots = c.querySelector(".dots"), timer;
    sl.forEach(function (s, k) { var d = document.createElement("button"); d.type = "button"; d.setAttribute("aria-label", (k + 1) + " / " + sl.length); d.onclick = function () { go(k); }; dots.appendChild(d); });
    function go(k) {
      i = (k + sl.length) % sl.length;
      sl.forEach(function (s, j) { s.classList.toggle("on", j === i); s.setAttribute("aria-hidden", String(j !== i)); });
      [].forEach.call(dots.children, function (d, j) { d.setAttribute("aria-current", String(j === i)); });
    }
    c.querySelector(".prev").onclick = function () { go(i - 1); reset(); };
    c.querySelector(".next").onclick = function () { go(i + 1); reset(); };
    c.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") { go(i - 1); reset(); } if (e.key === "ArrowRight") { go(i + 1); reset(); } });
    function reset() { clearInterval(timer); if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(function () { go(i + 1); }, 6500); }
    c.addEventListener("mouseenter", function () { clearInterval(timer); }); c.addEventListener("mouseleave", reset);
    go(0); reset();
  });

  setTheme(st); setLang(sl);
  if (q.get("ai") && window.openAI) window.openAI(q.get("ai") === "run");
})();
