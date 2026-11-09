/* Оболочка сайта: шапка, подвал, тема, язык KZ/RU/EN, ИИ-помощник (плавающая кнопка + панель + ii.html).
   Переводы контента страниц: атрибуты data-kk / data-en на элементах (русский текст остаётся в HTML и является значением по умолчанию). */
(function(){
var D=document,H=D.documentElement,B=H.getAttribute('data-base')||'';
var LS={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- тема ---------- */
var q=location.search,mt=q.match(/theme=(dark|light)/);
var theme=(mt&&mt[1])||LS.get('theme')||'light';
function setTheme(t){theme=t;H.setAttribute('data-theme',t);LS.set('theme',t);var b=D.querySelectorAll('.tbtn');for(var i=0;i<b.length;i++)b[i].querySelector('span').textContent=t==='dark'?TT().themeL:TT().themeD}
H.setAttribute('data-theme',theme);
if(LS.get('big')==='1')H.classList.add('big');

/* ---------- словарь оболочки ---------- */
var T={
ru:{lang:'Русский',read:'Читальный зал',acc:'Для слабовидящих',contact:'Контакты',search:'Поиск',cat:'Электронный каталог',themeD:'Тёмная тема',themeL:'Светлая тема',
 nav:['Главная','Каталог','История региона','Выставки','Филиалы','Об архиве'],logo:['Государственный','архив ВКО'],menu:'Меню',
 fc:[['Исследование',[['Каталог фондов','katalog.html'],['Описи и дела','fond.html'],['Фотоархив','katalog.html?type=foto'],['Указатели и путеводители','katalog.html?type=putevoditel'],['Открытые данные','katalog.html?type=data']]],
     ['История региона',[['Цифровая история','istoriya.html'],['Онлайн-выставки','vystavka.html'],['Филиалы на карте','filialy.html'],['Календарь памятных дат','istoriya.html#kalendar']]],
     ['Об архиве',[['История архива','ob-arhive.html#istoriya'],['Читальный зал','ob-arhive.html#chitalny'],['Структура и контакты','ob-arhive.html#struktura'],['Нормативная база','ob-arhive.html#normy']]],
     ['Ещё',[['ИИ-помощник','ii.html'],['Отзывы и предложения','ob-arhive.html#otzyv'],['Версия для слабовидящих','ob-arhive.html#dostup'],['Доступность сайта','ob-arhive.html#dostup'],['Карта сайта','ob-arhive.html#karta']]]],
 call:'Написать в архив',terms:'Условия использования',priv:'Политика конфиденциальности',
 full:'КГУ «Государственный архив» управления цифровизации и архивов Восточно-Казахстанской области',
 hours:'Приёмная: пн–пт 9:00–18:00 · читальный зал: пн–пт 10:00–17:00',
 addr:'Усть-Каменогорск (Өскемен), ул. Головкова, 26/1',
 part:'Учредитель, партнёры и государственные ресурсы',partl:[['Управление цифровизации и архивов ВКО','https://www.gov.kz/memleket/entities/vko-uca'],['Портал электронного правительства','https://egov.kz'],['Wikimedia Commons','https://commons.wikimedia.org']],
 copy:'© 2026 ГА ВКО. Сайт справочный: заявления, запросы, заказы и платежи не принимаются. Иллюстрации: Wikimedia Commons, общественное достояние / CC0 (img/SOURCES.txt)',
 fb:'Отзыв',
 ai:{btn:'ИИ-помощник',title:'Архивный помощник',full:'Открыть на весь экран',close:'Закрыть',ph:'Спросите о фондах, шифрах, филиалах…',send:'Отправить',
  disc:'<b>Важно.</b> Помощник подсказывает, где искать открытые материалы и как пользоваться каталогом. Сайт информационный: заявления, архивные запросы и заказы здесь не принимаются.',
  hello:'Здравствуйте! Я помогу найти фонды, описи, дела и оцифрованные копии, объясню шифры и подскажу адреса филиалов.',
  sugg:['Где найти метрические книги Семипалатинска 1900-х?','Фотографии Усть-Каменогорска 1960-х','Адрес и часы работы филиалов','Как читать архивный шифр?'],
  typing:'Помощник ищет в каталоге…',src:'Найдено в каталоге',
  ds:'Ответ подготовлен ИИ по открытому каталогу и может содержать неточности; сверяйте с карточкой дела. Я не принимаю заявки и не выдаю справки: сайт носит информационный характер.'}},
kk:{lang:'Қазақша',read:'Оқу залы',acc:'Көру мүмкіндігі шектеулілерге',contact:'Байланыс',search:'Іздеу',cat:'Электрондық каталог',themeD:'Қараңғы тақырып',themeL:'Жарық тақырып',
 nav:['Басты бет','Каталог','Өңір тарихы','Көрмелер','Филиалдар','Архив туралы'],logo:['Мемлекеттік','архив ШҚО'],menu:'Мәзір',
 fc:[['Зерттеу',[['Қорлар каталогы','katalog.html'],['Тізімдемелер мен істер','fond.html'],['Фотоархив','katalog.html?type=foto'],['Көрсеткіштер мен нұсқаулықтар','katalog.html?type=putevoditel'],['Ашық деректер','katalog.html?type=data']]],
     ['Өңір тарихы',[['Цифрлық тарих','istoriya.html'],['Онлайн-көрмелер','vystavka.html'],['Картадағы филиалдар','filialy.html'],['Есті күндер күнтізбесі','istoriya.html#kalendar']]],
     ['Архив туралы',[['Архив тарихы','ob-arhive.html#istoriya'],['Оқу залы','ob-arhive.html#chitalny'],['Құрылымы және байланыс','ob-arhive.html#struktura'],['Нормативтік база','ob-arhive.html#normy']]],
     ['Тағы',[['ЖИ-көмекші','ii.html'],['Пікір және ұсыныстар','ob-arhive.html#otzyv'],['Көру мүмкіндігі шектеулілерге','ob-arhive.html#dostup'],['Сайттың қолжетімділігі','ob-arhive.html#dostup'],['Сайт картасы','ob-arhive.html#karta']]]],
 call:'Архивке жазу',terms:'Пайдалану шарттары',priv:'Құпиялылық саясаты',
 full:'Шығыс Қазақстан облысының цифрландыру және архивтер басқармасының «Мемлекеттік архив» КММ',
 hours:'Қабылдау бөлмесі: дс–жм 9:00–18:00 · оқу залы: дс–жм 10:00–17:00',
 addr:'Өскемен (Усть-Каменогорск), Головков к-сі, 26/1',
 part:'Құрылтайшы, серіктестер және мемлекеттік ресурстар',partl:[['ШҚО цифрландыру және архивтер басқармасы','https://www.gov.kz/memleket/entities/vko-uca'],['Электрондық үкімет порталы','https://egov.kz'],['Wikimedia Commons','https://commons.wikimedia.org']],
 copy:'© 2026 ШҚО МА. Сайт анықтамалық: өтініштер, сұраулар, тапсырыстар мен төлемдер қабылданбайды. Суреттер: Wikimedia Commons, қоғамдық игілік / CC0 (img/SOURCES.txt)',
 fb:'Пікір',
 ai:{btn:'ЖИ-көмекші',title:'Архив көмекшісі',full:'Толық экранда ашу',close:'Жабу',ph:'Қорлар, шифрлар, филиалдар туралы сұраңыз…',send:'Жіберу',
  disc:'<b>Маңызды.</b> Көмекші ашық материалдарды қайдан іздеуге және каталогты қалай пайдалануға болатынын айтады. Сайт ақпараттық: өтініштер, архивтік сұраулар және тапсырыстар қабылданбайды.',
  hello:'Сәлеметсіз бе! Мен қорларды, тізімдемелерді, істерді және цифрландырылған көшірмелерді табуға, шифрларды түсіндіруге және филиалдар мекенжайын айтуға көмектесемін.',
  sugg:['Семей қаласының 1900-жылдардағы метрикалық кітаптарын қайдан табуға болады?','Өскеменнің 1960-жылдардағы фотосуреттері','Филиалдардың мекенжайы мен жұмыс уақыты','Архив шифрын қалай оқуға болады?'],
  typing:'Көмекші каталогтан іздеуде…',src:'Каталогтан табылды',
  ds:'Жауапты ЖИ ашық каталог бойынша дайындады, қателіктер болуы мүмкін; іс карточкасымен салыстырыңыз. Мен өтініш қабылдамаймын және анықтама бермеймін: сайт ақпараттық сипатта.'}},
en:{lang:'English',read:'Reading room',acc:'Accessibility',contact:'Contact',search:'Search',cat:'Online catalogue',themeD:'Dark theme',themeL:'Light theme',
 nav:['Home','Catalogue','Regional history','Exhibitions','Branches','About'],logo:['State archive','of East Kazakhstan'],menu:'Menu',
 fc:[['Research',[['Fonds catalogue','katalog.html'],['Inventories and files','fond.html'],['Photo archive','katalog.html?type=foto'],['Indexes and guides','katalog.html?type=putevoditel'],['Open data','katalog.html?type=data']]],
     ['Regional history',[['Digital history','istoriya.html'],['Online exhibitions','vystavka.html'],['Branches on the map','filialy.html'],['Memorial dates','istoriya.html#kalendar']]],
     ['About the archive',[['History','ob-arhive.html#istoriya'],['Reading room','ob-arhive.html#chitalny'],['Structure and contacts','ob-arhive.html#struktura'],['Legal framework','ob-arhive.html#normy']]],
     ['More',[['AI assistant','ii.html'],['Feedback','ob-arhive.html#otzyv'],['Accessible version','ob-arhive.html#dostup'],['Accessibility statement','ob-arhive.html#dostup'],['Sitemap','ob-arhive.html#karta']]]],
 call:'Write to the archive',terms:'Terms of use',priv:'Privacy policy',
 full:'State Institution “State Archive” of the Digitalisation and Archives Department of East Kazakhstan Region',
 hours:'Office: Mon–Fri 9:00–18:00 · reading room: Mon–Fri 10:00–17:00',
 addr:'Ust-Kamenogorsk (Öskemen), 26/1 Golovkov St.',
 part:'Founder, partners and government resources',partl:[['East Kazakhstan Digitalisation and Archives Dept.','https://www.gov.kz/memleket/entities/vko-uca'],['eGov portal','https://egov.kz'],['Wikimedia Commons','https://commons.wikimedia.org']],
 copy:'© 2026 SA EKR. Information-only site: no applications, requests, orders or payments are accepted. Images: Wikimedia Commons, public domain / CC0 (img/SOURCES.txt)',
 fb:'Feedback',
 ai:{btn:'AI assistant',title:'Archive assistant',full:'Open full screen',close:'Close',ph:'Ask about fonds, references, branches…',send:'Send',
  disc:'<b>Please note.</b> The assistant points you to open materials and explains how to use the catalogue. The site is informational: applications, archival requests and orders are not accepted here.',
  hello:'Hello! I can help you find fonds, inventories, files and digitised copies, explain archival references and give branch addresses.',
  sugg:['Where can I find Semipalatinsk metric books of the 1900s?','Photographs of Ust-Kamenogorsk in the 1960s','Branch addresses and opening hours','How do I read an archival reference?'],
  typing:'The assistant is searching the catalogue…',src:'Found in the catalogue',
  ds:'Answer generated by AI from the open catalogue and may contain errors; check it against the file record. I do not accept applications or issue certificates: this site is informational only.'}}
};
var lang=(q.match(/lang=(ru|kk|en)/)||[])[1]||LS.get('lang')||'ru';
function TT(){return T[lang]||T.ru}

/* ---------- иконки ---------- */
var I={
eye:'<svg class="ico" viewBox="0 0 16 16"><path d="M8 3C4.5 3 2 6 1 8c1 2 3.500 5 7 5s6-3 7-5c-1-2-3.500-5-7-5zm0 8a3 3 0 110-6 3 3 0 010 6z"/></svg>',
info:'<svg class="ico" viewBox="0 0 16 16"><path d="M3 1h10v14H3zm4 3v2h2V4zm0 3v5h2V7z" fill-rule="evenodd"/></svg>',
pin:'<svg class="ico" viewBox="0 0 16 16"><path d="M8 1a4.500 4.500 0 00-4.500 4.500C3.500 9 8 15 8 15s4.500-6 4.500-9.500A4.500 4.500 0 008 1zm0 6.200a1.700 1.700 0 110-3.400 1.700 1.700 0 010 3.400z"/></svg>',
globe:'<svg class="ico" viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.500c.7.800 1.200 1.900 1.500 3.200h-3C6.800 4.400 7.300 3.300 8 2.500zM2.700 9.200a5.600 5.600 0 010-2.400h2.600a11 11 0 000 2.400zm.6 1.300h2.200c.2.900.6 1.700 1 2.400a5.600 5.600 0 01-3.200-2.400zM5.500 5.500H3.300A5.600 5.600 0 016.500 3.100c-.4.700-.8 1.500-1 2.400zM8 13.500c-.7-.8-1.200-1.900-1.500-3h3c-.3 1.100-.8 2.200-1.500 3zm1.700-4.300H6.300a9.500 9.500 0 010-2.400h3.400a9.500 9.500 0 010 2.400zm.8 3.700c.4-.7.800-1.500 1-2.400h2.200a5.600 5.600 0 01-3.200 2.400zm1.200-3.700a11 11 0 000-2.400h2.600a5.600 5.600 0 010 2.400zm0-3.700c-.2-.9-.6-1.700-1-2.400a5.600 5.600 0 013.200 2.400z"/></svg>',
lens:'<svg class="ico" viewBox="0 0 16 16"><path d="M6.500 1a5.500 5.500 0 014.400 8.800l4 4-1.300 1.300-4-4A5.500 5.500 0 116.500 1zm0 2a3.500 3.500 0 100 7 3.500 3.500 0 000-7z"/></svg>',
phone:'<svg class="ico" viewBox="0 0 16 16"><path d="M3.500 1l2.200 3.500-1.300 1.300c.8 1.800 2.300 3.300 4 4.200l1.300-1.300L13.200 10 12 13.800C6 14 2 8.500 2 3.300z"/></svg>',
mail:'<svg class="ico" viewBox="0 0 16 16"><path d="M1 3h14v10H1zm1.500 1.300L8 8.800l5.500-4.500z"/></svg>',
half:'<svg class="ico" viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.800v10.400a5.200 5.200 0 000-10.400z"/></svg>',
chat:'<svg viewBox="0 0 20 20"><path d="M2 3h16v11H8l-4 3.500V14H2z"/></svg>'};
var logo='<svg viewBox="0 0 62 62"><circle cx="31" cy="31" r="27" fill="none" stroke="#01689b" stroke-width="5"/><path class="f" d="M31 15l13 26h-7l-6-12-6 12h-7z" fill="#01689b"/><path d="M26 42h10" stroke="#01689b" stroke-width="4"/></svg>';

function langMenu(){
 return '<div class="lang"><button type="button" aria-haspopup="true">'+I.globe+'<span>'+TT().lang+'</span><i class="chev d" style="width:7px;height:7px;margin:-3px 0 0 6px"></i></button><ul>'+
  ['ru','kk','en'].map(function(l){return '<li><button data-l="'+l+'">'+T[l].lang+'</button></li>'}).join('')+'</ul></div>';
}
function themeBtn(){return '<button type="button" class="tbtn">'+I.half+'<span>'+(theme==='dark'?TT().themeL:TT().themeD)+'</span></button>'}

function head(t,type,nav){
 var hrefs=['index.html','katalog.html','istoriya.html','vystavka.html','filialy.html','ob-arhive.html'];
 if(type==='admin'){
  return '<div class="atop"><a class="ti" href="index.html">'+logo.replace(/#01689b/g,'#fff')+'<span>'+t.logo[0]+' '+t.logo[1]+'</span><small>'+(lang==='ru'?'Администрирование':lang==='kk'?'Әкімшілік':'Administration')+'</small></a>'+
   '<div class="ur"><a href="../index.html" style="padding:0 10px">'+(lang==='ru'?'На сайт':lang==='kk'?'Сайтқа':'View site')+'</a>'+langMenu()+themeBtn()+
   '<span class="who">'+(lang==='en'?'Editor':lang==='kk'?'Редактор':'Редактор')+'<small>Ж. Бекниязқызы</small></span></div></div>';
 }
 var navh=t.nav.map(function(n,i){return '<a href="'+B+hrefs[i]+'"'+(i===nav?' class="on"':'')+'>'+n+'</a>'}).join('');
 var util='<div class="util"><a href="'+B+'ob-arhive.html#chitalny">'+I.info+t.read+'</a><button type="button" class="bigbtn">'+I.eye+t.acc+'</button><a href="'+B+'ob-arhive.html#kontakty">'+I.pin+t.contact+'</a>'+
  langMenu()+themeBtn()+'<a href="'+B+'katalog.html#q">'+I.lens+t.search+'</a><a class="cbtn" href="'+B+'katalog.html">'+t.cat+'</a></div>';
 var lg='<a class="logo" href="'+B+'index.html"><span class="t">'+t.logo[0]+'<br>'+t.logo[1]+'</span>'+logo+'</a>';
 var bur='<button class="burger" type="button"><span>'+t.menu+'</span><i></i></button>';
 if(type==='home') return '<div class="head home"><div class="top">'+util+lg+bur+'</div><nav class="nav" aria-label="main">'+navh+'</nav></div>';
 return '<div class="head inner"><div class="top">'+util+lg+bur+'</div><div class="bar"><nav class="nav" aria-label="main">'+navh+'</nav></div></div>';
}
function foot(t){
 var cols=t.fc.map(function(c){return '<div><h4>'+c[0]+'</h4><ul>'+c[1].map(function(x){return '<li><a href="'+B+x[1]+'">'+x[0]+'</a></li>'}).join('')+'</ul></div>'}).join('');
 return '<footer class="footer"><div class="wrap"><div class="cols">'+cols+'</div>'+
 '<div class="fbar"><a href="'+B+'ob-arhive.html#normy">'+t.terms+'</a><a href="'+B+'ob-arhive.html#normy">'+t.priv+'</a><a href="tel:+77232255976">'+I.phone+'8 (7232) 25-59-76</a><a href="mailto:arhiv-ukg@yandex.kz">'+I.mail+t.call+'</a><a href="'+B+'filialy.html">'+I.pin+t.addr+'</a></div>'+
 '<div class="fbar" style="padding-top:0;color:var(--ink)"><span><b>'+t.full+'</b></span><span>'+t.hours+'</span></div></div>'+
 '<div class="fpart"><b>'+t.part+'</b>'+t.partl.map(function(x){return '<a href="'+x[1]+'" target="_blank" rel="noopener" style="margin:0 16px;color:var(--ink)">'+x[0]+'</a>'}).join('')+
 '<div class="credit">'+t.copy+'</div></div></footer>'+
 '<a class="fab" href="'+B+'ob-arhive.html#otzyv"><span>'+t.fb+'</span></a>';
}

/* ---------- переводы контента ---------- */
function applyI18n(){
 var els=D.querySelectorAll('[data-kk],[data-en]');
 for(var i=0;i<els.length;i++){var el=els[i],tt=el.tagName==='TITLE';
  if(el.getAttribute('data-ru')===null)el.setAttribute('data-ru',tt?el.textContent:el.innerHTML);
  var v=lang==='ru'?el.getAttribute('data-ru'):(el.getAttribute('data-'+lang)||el.getAttribute('data-ru'));
  if(tt)el.textContent=v;else el.innerHTML=v;}
 var ph=D.querySelectorAll('[data-ph-kk],[data-ph-en]');
 for(var j=0;j<ph.length;j++){var p=ph[j];
  if(p.getAttribute('data-ph-ru')===null)p.setAttribute('data-ph-ru',p.getAttribute('placeholder')||'');
  p.setAttribute('placeholder',lang==='ru'?p.getAttribute('data-ph-ru'):(p.getAttribute('data-ph-'+lang)||p.getAttribute('data-ph-ru')));}
 var al=D.querySelectorAll('[data-al-kk],[data-al-en]');
 for(var k=0;k<al.length;k++){var a=al[k];
  if(a.getAttribute('data-al-ru')===null)a.setAttribute('data-al-ru',a.getAttribute('aria-label')||a.getAttribute('alt')||'');
  var tv=lang==='ru'?a.getAttribute('data-al-ru'):(a.getAttribute('data-al-'+lang)||a.getAttribute('data-al-ru'));
  a.setAttribute(a.hasAttribute('alt')?'alt':'aria-label',tv);}
 H.lang=lang==='kk'?'kk':lang;
}
var listeners=[];
window.GA={lang:function(){return lang},theme:function(){return theme},on:function(f){listeners.push(f)},
 t:function(o){return o[lang]||o.ru},B:B};

/* ---------- ИИ-помощник ---------- */
var R={ // сценарии: [regex, {ru,kk,en: {p:[абзацы], src:[[title,sub,href]], sugg:[]}}]
 metric:{re:/метрич|metric|метрика|Метрикалық|метрик/i,
  ru:{p:['Метрические книги Семипалатинска начала XX века (1900–1909) в каталоге представлены двумя группами источников. Часть дел оцифрована и открыта для просмотра, для остальных доступна только описательная карточка.','Совет: в каталоге выберите тип «Метрические книги» и период 1900–1909 — выдача сократится до нужных дел.'],
   src:[['Ф. 38-Д Семипалатинское духовное правление','Оп. 1: метрические книги церквей города, 1895–1917 · 212 дел','katalog.html?q=метрические+книги'],['Ф. 1-П, оп. 7 Метрические книги (копии) и духовные ведомости','Канцелярия областного правления, 1884–1917 · 190 дел','fond.html#op7'],['Метрические записи мусульманского населения','Фонд 41-М, оп. 1, 1898–1916 · на арабской графике','katalog.html?q=метрические+книги&doclang=ar']],
   sugg:['Показать только оцифрованные','Метрические книги Усть-Каменогорска','Как читать архивный шифр?']},
  kk:{p:['Семей қаласының ХХ ғасыр басындағы (1900–1909) метрикалық кітаптары каталогта екі топтағы дереккөзбен берілген. Кейбір істер цифрландырылған және көруге ашық, қалғандарына сипаттама карточкасы ғана қолжетімді.','Кеңес: каталогта «Метрикалық кітаптар» түрін және 1900–1909 кезеңін таңдаңыз — нәтиже қысқарады.'],
   src:[['38-Д қор. Семей рухани басқармасы','1-тізімдеме: қала шіркеулерінің метрикалық кітаптары, 1895–1917 · 212 іс','katalog.html?q=метрические+книги'],['1-П қор, 7-тізімдеме. Метрикалық кітаптар (көшірмелер)','Облыстық басқарма кеңсесі, 1884–1917 · 190 іс','fond.html#op7'],['Мұсылман тұрғындарының метрикалық жазбалары','41-М қор, 1-тізімдеме, 1898–1916 · араб жазуында','katalog.html?q=метрические+книги&doclang=ar']],
   sugg:['Тек цифрландырылғандарын көрсету','Өскеменнің метрикалық кітаптары','Архив шифрын қалай оқуға болады?']},
  en:{p:['Semipalatinsk metric books of the early 1900s (1900–1909) are held in two groups of sources in the catalogue. Some files are digitised and open to view; for the rest only the descriptive record is available.','Tip: choose the type “Metric books” and the period 1900–1909 in the catalogue to narrow the results.'],
   src:[['Fonds 38-D Semipalatinsk Spiritual Board','Inv. 1: metric books of the city churches, 1895–1917 · 212 files','katalog.html?q=метрические+книги'],['Fonds 1-P, inv. 7 Metric books (copies) and clerical returns','Chancery of the Regional Administration, 1884–1917 · 190 files','fond.html#op7'],['Metric records of the Muslim population','Fonds 41-M, inv. 1, 1898–1916 · Arabic script','katalog.html?q=метрические+книги&doclang=ar']],
   sugg:['Show digitised only','Metric books of Ust-Kamenogorsk','How do I read an archival reference?']}},
 foto:{re:/фото|photo|1960|сурет/i,
  ru:{p:['Фотографии Усть-Каменогорска 1960-х хранятся в фотофондах и личных фондах. Откройте каталог со вкладкой «Фотографии» и сузьте период до 1960–1969.'],src:[['Каталог: фотографии','Период 1960–1969, место: Усть-Каменогорск','katalog.html?type=foto'],['Онлайн-выставка','Семипалатинск и Прииртышье в документах и фотографиях','vystavka.html']],sugg:['Адрес и часы работы филиалов']},
  kk:{p:['Өскеменнің 1960-жылдардағы фотосуреттері фотоқорлар мен жеке қорларда сақталған. Каталогтың «Фотосуреттер» қойындысын ашып, кезеңді 1960–1969 жылдарға дейін тарылтыңыз.'],src:[['Каталог: фотосуреттер','Кезең 1960–1969, орны: Өскемен','katalog.html?type=foto'],['Онлайн-көрме','Семей және Ертіс өңірі құжаттар мен фотосуреттерде','vystavka.html']],sugg:['Филиалдардың мекенжайы мен жұмыс уақыты']},
  en:{p:['Photographs of Ust-Kamenogorsk from the 1960s are kept in photo fonds and personal fonds. Open the catalogue on the “Photographs” tab and narrow the period to 1960–1969.'],src:[['Catalogue: photographs','Period 1960–1969, place: Ust-Kamenogorsk','katalog.html?type=foto'],['Online exhibition','Semipalatinsk and the Irtysh region in documents and photographs','vystavka.html']],sugg:['Branch addresses and opening hours']}},
 fil:{re:/филиал|адрес|час|контакт|branch|address|hours|мекенжай|жұмыс/i,
  ru:{p:['У архива основное здание и четыре филиала: Усть-Каменогорский (по личному составу), Зайсанский, Риддерский и Алтай. Адреса, телефоны, часы работы и маршрут в 2GIS или Google Maps — на странице «Филиалы».'],src:[['Филиалы на карте','Адреса, телефоны, режим работы, маршруты','filialy.html'],['Читальный зал','пн–пт 10:00–17:00 · ул. Крылова, 39','ob-arhive.html#chitalny']],sugg:['Как читать архивный шифр?']},
  kk:{p:['Архивтің негізгі ғимараты және төрт филиалы бар: Өскемендік (жеке құрам бойынша), Зайсан, Риддер және Алтай. Мекенжайлар, телефондар, жұмыс уақыты және 2GIS не Google Maps маршруты — «Филиалдар» бетінде.'],src:[['Картадағы филиалдар','Мекенжайлар, телефондар, жұмыс режимі, маршруттар','filialy.html'],['Оқу залы','дс–жм 10:00–17:00 · Крылов к-сі, 39','ob-arhive.html#chitalny']],sugg:['Архив шифрын қалай оқуға болады?']},
  en:{p:['The archive has a main building and four branches: Ust-Kamenogorsk (personnel records), Zaisan, Ridder and Altai. Addresses, phones, hours and a route in 2GIS or Google Maps are on the “Branches” page.'],src:[['Branches on the map','Addresses, phones, hours, routes','filialy.html'],['Reading room','Mon–Fri 10:00–17:00 · 39 Krylov St.','ob-arhive.html#chitalny']],sugg:['How do I read an archival reference?']}},
 cipher:{re:/шифр|cipher|reference|шифрді/i,
  ru:{p:['Шифр состоит из номера фонда, описи и дела, например «Ф. 1-П, оп. 1, д. 245». Буква после номера фонда — тип (П — правление, Л — личный, Р — ревком и т. д.). Шифр можно скопировать кнопкой на карточке дела.'],src:[['Пример: Ф. 1-П, оп. 1, д. 245','Обзор Семипалатинской области за 1893 год','delo.html'],['Справка о структуре каталога','фонд → опись → дело → документ','ob-arhive.html#karta']],sugg:['Где найти метрические книги Семипалатинска 1900-х?']},
  kk:{p:['Шифр қор, тізімдеме және іс нөмірінен тұрады, мысалы «1-П қор, 1-тізімдеме, 245-іс». Қор нөмірінен кейінгі әріп — түрі (П — басқарма, Л — жеке, Р — төңкеріс комитеті т.б.). Шифрді іс карточкасындағы батырмамен көшіруге болады.'],src:[['Мысал: 1-П қор, 1-тізімдеме, 245-іс','1893 жылғы Семей облысына шолу','delo.html'],['Каталог құрылымы туралы анықтама','қор → тізімдеме → іс → құжат','ob-arhive.html#karta']],sugg:['Семей қаласының 1900-жылдардағы метрикалық кітаптарын қайдан табуға болады?']},
  en:{p:['A reference consists of fonds, inventory and file numbers, for example “Fonds 1-P, inv. 1, file 245”. The letter after the fonds number is its type (P — administration, L — personal, R — revolutionary committee, etc.). You can copy the reference with the button on the file page.'],src:[['Example: Fonds 1-P, inv. 1, file 245','Review of Semipalatinsk Region for 1893','delo.html'],['About the catalogue structure','fonds → inventory → file → document','ob-arhive.html#karta']],sugg:['Where can I find Semipalatinsk metric books of the 1900s?']}},
 req:{re:/заяв|справк|запрос|заказ|оплат|request|certificate|order|pay|өтініш|анықтама/i,
  ru:{p:['Этот сайт информационный: заявления, архивные запросы, заказ справок и платежи здесь не принимаются. Сведения о фондах и контакты архива опубликованы для ознакомления.'],src:[['Контакты архива','Адрес, телефоны, часы работы','ob-arhive.html#kontakty']],sugg:['Адрес и часы работы филиалов']},
  kk:{p:['Бұл сайт ақпараттық: өтініштер, архивтік сұраулар, анықтамаға тапсырыс және төлемдер мұнда қабылданбайды. Қорлар туралы мәліметтер мен архив байланысы танысу үшін жарияланған.'],src:[['Архив байланысы','Мекенжай, телефондар, жұмыс уақыты','ob-arhive.html#kontakty']],sugg:['Филиалдардың мекенжайы мен жұмыс уақыты']},
  en:{p:['This site is informational: applications, archival requests, certificate orders and payments are not accepted here. Information on fonds and the archive’s contacts is published for reference.'],src:[['Archive contacts','Address, phones, opening hours','ob-arhive.html#kontakty']],sugg:['Branch addresses and opening hours']}}
};
var FALL={ru:{p:['Я поищу по каталогу. Откройте выдачу по вашему запросу и уточните период, тип документа и место хранения в фильтрах.'],src:[['Каталог: поиск по запросу','Откроется выдача с фасетами','katalog.html?q=']],sugg:[]},
 kk:{p:['Мен каталог бойынша іздеймін. Сұранысыңыз бойынша нәтижені ашып, сүзгілерде кезеңді, құжат түрін және сақтау орнын нақтылаңыз.'],src:[['Каталог: сұраныс бойынша іздеу','Фасеттері бар нәтиже ашылады','katalog.html?q=']],sugg:[]},
 en:{p:['I will search the catalogue. Open the results for your query and refine the period, document type and storage location with the filters.'],src:[['Catalogue: search by query','Opens results with facets','katalog.html?q=']],sugg:[]}};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function answer(qs){
 var k,hit=null;for(k in R){if(R[k].re.test(qs)){hit=R[k];break}}
 var a=hit?(hit[lang]||hit.ru):null;
 if(!a){a=JSON.parse(JSON.stringify(FALL[lang]||FALL.ru));a.src[0][2]+=encodeURIComponent(qs)}
 return a;
}
function buildChat(root){
 var t=TT().ai;
 root.innerHTML='<div class="aib" aria-live="polite"></div><form class="aif"><input type="text" aria-label="'+esc(t.ph)+'" placeholder="'+esc(t.ph)+'"><button type="submit" aria-label="'+esc(t.send)+'">&rsaquo;</button></form>';
 var body=root.querySelector('.aib'),form=root.querySelector('form'),inp=form.querySelector('input');
 function add(cls,html){var d=D.createElement('div');d.className='msg '+cls;d.innerHTML=html;body.appendChild(d);body.scrollTop=body.scrollHeight;return d}
 function suggs(arr){return arr&&arr.length?'<div class="sugg">'+arr.map(function(s){return '<button type="button">'+esc(s)+'</button>'}).join('')+'</div>':''}
 function bindS(el){var b=el.querySelectorAll('.sugg button');for(var i=0;i<b.length;i++)b[i].onclick=function(){ask(this.textContent)}}
 function render(a){
  var h=a.p.map(function(x){return '<p>'+esc(x)+'</p>'}).join('');
  h+='<span class="src">'+a.src.map(function(s){return '<a href="'+B+s[2]+'"><span>'+esc(s[0])+'<small>'+esc(s[1])+'</small></span><i class="chev"></i></a>'}).join('')+'</span>';
  h+=suggs(a.sugg)+'<div class="ds">'+esc(t.ds)+'</div>';
  var el=add('a',h);bindS(el);
 }
 function ask(qs,instant){
  var u=add('u',esc(qs));
  if(instant){render(answer(qs));body.scrollTop=u.offsetTop-70;return}
  var ty=add('typing',esc(t.typing));ty.className='typing';
  setTimeout(function(){ty.remove();render(answer(qs))},700);
 }
 var g=add('a','<p>'+esc(t.hello)+'</p>'+suggs(t.sugg));bindS(g);
 form.onsubmit=function(e){e.preventDefault();var v=inp.value.trim();if(!v)return;inp.value='';ask(v)};
 return {ask:ask};
}
function aiWidget(){
 var t=TT().ai,ex=D.getElementById('ai-full');
 var old=D.querySelector('.aifab');if(old){old.remove();var op=D.querySelector('.aip');if(op)op.remove()}
 if(ex){var c=ex.querySelector('.chatbox');var ch=buildChat(c);
  var exs=D.querySelectorAll('[data-ask]');for(var i=0;i<exs.length;i++)exs[i].onclick=function(){ch.ask(this.getAttribute('data-ask-'+lang)||this.getAttribute('data-ask'))};
  if(/ai=demo/.test(q))ch.ask(t.sugg[0],true);return}
 var fab=D.createElement('button');fab.className='aifab';fab.type='button';fab.setAttribute('aria-label',t.btn);fab.innerHTML=I.chat+'<span>'+t.btn+'</span>';
 var p=D.createElement('div');p.className='aip';p.setAttribute('role','dialog');p.setAttribute('aria-label',t.title);
 p.innerHTML='<div class="aih"><b>'+t.title+'</b><div class="ac"><a href="'+B+'ii.html" title="'+esc(t.full)+'">'+esc(t.full)+'</a><button type="button" class="x" aria-label="'+esc(t.close)+'">&#10005;</button></div></div><div class="disc">'+t.disc+'</div><div class="chat" style="display:flex;flex-direction:column;flex:1;min-height:0"></div>';
 D.body.appendChild(p);D.body.appendChild(fab);
 var ch=buildChat(p.querySelector('.chat'));
 fab.onclick=function(){p.classList.toggle('open')};p.querySelector('.x').onclick=function(){p.classList.remove('open')};
 if(/ai=(open|demo)/.test(q))p.classList.add('open');
 if(/ai=demo/.test(q))ch.ask(t.sugg[0],true);
}

/* ---------- сборка ---------- */
function render(){
 var h=D.getElementById('head'),f=D.getElementById('foot'),t=TT();
 if(h){var type=h.getAttribute('data-type')||'inner',nav=+(h.getAttribute('data-nav')||0);
  var tmp=D.createElement('div');tmp.innerHTML=head(t,type,nav);var nh=tmp.firstChild;nh.id='head';nh.setAttribute('data-type',type);nh.setAttribute('data-nav',nav);
  h.parentNode.replaceChild(nh,h);}
 if(f)f.innerHTML=foot(t);
 applyI18n();bind();aiWidget();
 for(var i=0;i<listeners.length;i++)listeners[i](lang);
}
function bind(){
 var h=D.getElementById('head'),lg=h.querySelector('.lang');
 lg.querySelector('button').onclick=function(e){e.stopPropagation();lg.classList.toggle('open')};
 D.onclick=function(){lg.classList.remove('open')};
 [].forEach.call(lg.querySelectorAll('li button'),function(b){b.onclick=function(){lang=b.getAttribute('data-l');LS.set('lang',lang);render()}});
 var tb=h.querySelector('.tbtn');if(tb)tb.onclick=function(){setTheme(theme==='dark'?'light':'dark')};
 var bb=h.querySelector('.bigbtn');if(bb)bb.onclick=function(){H.classList.toggle('big');LS.set('big',H.classList.contains('big')?'1':'0')};
 var bu=h.querySelector('.burger');if(bu)bu.onclick=function(){h.classList.toggle('open')};
}
render();
})();
