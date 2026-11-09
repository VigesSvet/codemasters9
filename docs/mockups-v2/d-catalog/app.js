/* Общий слой: иконки, шапка/футер, язык, тема, ИИ-помощник. Подключать последним. */
(function(){
var ADMIN=document.body.dataset.admin==='1';
var P=function(id,d){return '<symbol id="'+id+'" viewBox="0 0 24 24">'+d+'</symbol>'};
var sprite='<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0" aria-hidden="true">'+
P('layers','<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 12.5 9 5 9-5"/><path d="m3 17 9 5 9-5"/>')+
P('catalog','<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h8M8 11h8M8 15h5"/>')+
P('history','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>')+
P('frame','<rect x="3" y="4" width="18" height="16" rx="1"/><path d="m3 16 5-5 4 4 3-3 6 5"/><circle cx="16" cy="9" r="1.2"/>')+
P('pin','<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>')+
P('chat','<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9.5h8M8 12.5h5"/>')+
P('bank','<path d="M3 9 12 4l9 5H3Z"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 21h18M3 18h18"/>')+
P('doc','<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4M9 12h6M9 15h6M9 18h4"/>')+
P('cal','<rect x="4" y="5" width="16" height="16" rx="1"/><path d="M4 10h16M8 3v4M16 3v4"/>')+
P('img','<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 18 5-5 3 3 3-3 5 5"/>')+
P('dl','<path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 19h14"/>')+
P('edit','<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>')+
P('print','<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>')+
P('share','<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>')+
P('copy','<rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/>')+
P('gear','<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>')+
P('chev','<path d="m9 6 6 6-6 6"/>')+
P('chevd','<path d="m6 9 6 6 6-6"/>')+
P('dchev','<path d="m6 7 5 5-5 5M12 7l5 5-5 5"/>')+
P('ext','<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>')+
P('menu','<path d="M4 7h16M4 12h16M4 17h16"/>')+
P('plus','<path d="M12 5v14M5 12h14"/>')+
P('minus','<path d="M5 12h14"/>')+
P('home','<path d="M4 11 12 4l8 7v9H4v-9Z"/><path d="M10 20v-6h4v6"/>')+
P('tag','<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="8.5" r="1.2"/>')+
P('comment','<path d="M4 5h16v11H10l-5 4v-4H4V5Z"/>')+
P('text','<path d="M6 3h8l4 4v14H6V3Z"/><path d="M9 11h6M9 14h6M9 17h4"/>')+
P('folder','<path d="M3 6h7l2 2h9v11H3V6Z"/>')+
P('file','<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4"/>')+
P('sun','<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>')+
P('moon','<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>')+
P('search','<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>')+
P('close','<path d="M6 6l12 12M18 6 6 18"/>')+
P('send','<path d="M4 12 20 4l-4 16-4-6-8-2Z"/><path d="m12 14 8-10"/>')+
P('star','<path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8L12 4Z"/>')+
P('filter','<path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/>')+
P('grid','<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>')+
P('list','<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>')+
P('left','<path d="m15 6-6 6 6 6"/>')+
P('right','<path d="m9 6 6 6-6 6"/>')+
P('zoom','<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M8 10.5h5M10.5 8v5"/>')+
P('route','<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>')+
P('phone','<path d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z"/>')+
P('mail','<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 7 9-7"/>')+
P('clock','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')+
P('user','<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')+
P('lock','<rect x="5" y="10" width="14" height="10" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>')+
P('check','<path d="m5 12.5 4.5 4.5L19 7"/>')+
P('alert','<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v5M12 17.5v.01"/>')+
P('info','<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>')+
P('upload','<path d="M12 16V5M7.5 9 12 4.5 16.5 9M5 19h14"/>')+
P('trash','<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>')+
P('globe','<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>')+
P('table','<rect x="3" y="5" width="18" height="14"/><path d="M3 10h18M3 15h18M9 5v14"/>')+
P('bars','<path d="M5 20V10M12 20V4M19 20v-7"/>')+
P('users','<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>')+
P('log','<path d="M6 3h12v18H6V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/>')+
P('x','<path d="M6 6l12 12M18 6 6 18"/>')+
'</svg>';
document.body.insertAdjacentHTML('afterbegin',sprite);
var I=function(n,c){return '<svg class="ic'+(c?' '+c:'')+'"><use href="#'+n+'"/></svg>'};
window.VKO={icon:I};
var D=window.VKO_DATA;

/* ---------- язык ---------- */
var TR=window.VKO_I18N||{};
var DIG=/\d+(?:[   ]\d{3})*/g;
var norm=function(s){return s.replace(/\s+/g,' ').trim()};
var CIPH={kk:{f:'Қор ',o:'тізбе ',d:'іс '},en:{f:'Fund ',o:'inv. ',d:'file '}};
function tr(s,l){
  if(l==='ru')return s;
  var lead=s.match(/^\s*/)[0],trail=s.match(/\s*$/)[0],k=norm(s);
  if(!k)return s;
  var idx=l==='kk'?0:1,out=null,e=TR[k];
  if(e&&e[idx])out=e[idx];
  else{
    var nums=[];var tk=k.replace(DIG,function(m){nums.push(m);return '#'});
    if(nums.length){e=TR[tk];if(e&&e[idx]){var i=0;out=e[idx].replace(/#/g,function(){return nums[i++]||''})}}
  }
  if(out==null){
    if(/(^|[\s(])Ф\. [\dА-Я-]+/.test(k)){
      out=k.replace(/ГА ВКО/g,l==='kk'?'ШҚОММ':'SAEK').replace(/Ф\. /g,CIPH[l].f).replace(/оп\. /g,CIPH[l].o).replace(/(^|[\s,.])д\. (?=\d)/g,'$1'+CIPH[l].d).replace(/Оп\. /g,CIPH[l].o.charAt(0).toUpperCase()+CIPH[l].o.slice(1)).replace(/Д\. (?=\d)/g,CIPH[l].d.charAt(0).toUpperCase()+CIPH[l].d.slice(1));
    }else return s;
  }
  return lead+out+trail;
}
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,SVG:1,svg:1,CODE:0};
var ATTRS=['placeholder','aria-label','title','alt','data-ph'];
var LANG='ru';
function applyTo(root){
  root=root||document.body;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    var p=n.parentNode;if(!p||SKIP[p.nodeName])return NodeFilter.FILTER_REJECT;
    if(p.closest&&p.closest('[data-nt]'))return NodeFilter.FILTER_REJECT;
    return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  var n,list=[];while((n=w.nextNode()))list.push(n);
  list.forEach(function(n){
    if(n.__ru===undefined)n.__ru=n.nodeValue;
    else if(n.__tr!==undefined&&n.nodeValue!==n.__tr)n.__ru=n.nodeValue;
    var v=tr(n.__ru,LANG);n.nodeValue=v;n.__tr=v;
  });
  var els=root.querySelectorAll?root.querySelectorAll('[placeholder],[aria-label],[title],[alt],[data-ph]'):[];
  [].forEach.call(els,function(e){
    if(e.closest('[data-nt]'))return;
    ATTRS.forEach(function(a){
      if(!e.hasAttribute(a))return;
      var key='ru_'+a.replace('-','_');
      if(e.dataset[key]===undefined)e.dataset[key]=e.getAttribute(a);
      e.setAttribute(a,tr(e.dataset[key],LANG));
    });
  });
}
function setLang(l,save){
  LANG=l;document.documentElement.lang=l;
  if(save!==false){try{localStorage.setItem('vko-lang',l)}catch(e){}}
  applyTo(document.body);
  if(!document.documentElement.dataset.ruTitle)document.documentElement.dataset.ruTitle=document.title;
  document.title=tr(document.documentElement.dataset.ruTitle,l);
  [].forEach.call(document.querySelectorAll('.lang button'),function(b){b.setAttribute('aria-pressed',b.dataset.l===l)});
  document.dispatchEvent(new CustomEvent('vko:lang',{detail:l}));
}
window.VKO.apply=applyTo;
window.VKO.tr=function(s){return tr(s,LANG)};
window.VKO.lang=function(){return LANG};

/* ---------- тема ---------- */
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('vko-theme',t)}catch(e){}document.dispatchEvent(new CustomEvent('vko:theme',{detail:t}))}
var q=new URLSearchParams(location.search),savedT=null,savedL=null;
try{savedT=localStorage.getItem('vko-theme');savedL=localStorage.getItem('vko-lang')}catch(e){}
setTheme(q.get('theme')||savedT||'light');

/* ---------- toast ---------- */
function toast(msg){
  var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;
  document.body.appendChild(t);applyTo(t);
  setTimeout(function(){t.remove()},2600);
}
window.VKO.toast=toast;
window.VKO.copy=function(text,msg){
  var done=function(){toast(msg||'Скопировано')};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,done);else done();
};

/* ---------- шапка / панель / футер ---------- */
var NAV=[['katalog.html','Каталог','katalog'],['istoriya.html','Цифровая история','istoriya'],['vystavka.html','Онлайн-выставки','vystavka'],['filialy.html','Филиалы на карте','filialy'],['ii.html','ИИ-помощник','ii'],['ob-arhive.html','Об архиве','ob-arhive']];
var cur=document.body.dataset.nav||'';
var langHtml='<div class="lang" role="group" aria-label="Язык"><button type="button" data-l="kk" aria-pressed="false">KZ</button><button type="button" data-l="ru" aria-pressed="true">RU</button><button type="button" data-l="en" aria-pressed="false">EN</button></div>';
var themeHtml='<button class="theme" type="button" aria-label="Сменить тему">'+I('sun','sun')+I('moon','moon')+'</button>';
var brandHtml='<a class="brand" href="index.html" aria-label="Госархив ВКО: Каталог">'+I('layers')+'<span class="w"><small>Государственный архив ВКО</small><b>Каталог</b></span></a>';
var hd=document.getElementById('hd');
if(hd&&!ADMIN){
  var mini=document.body.dataset.mini==='1';
  hd.className='hd';
  hd.innerHTML=brandHtml+
   (mini?'<form class="sf mini" role="search" action="katalog.html"><label class="sr" for="hq">Поиск по каталогу</label><input id="hq" name="q" type="search" placeholder="Поиск: шифр, название, год, имя"><button type="submit">Найти</button></form>':'')+
   '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer">'+I('menu')+'<span>Меню</span></button>'+
   '<nav class="hd-nav" aria-label="Служебная">'+
   '<a class="l opt" href="katalog.html?adv=1">Расширенный</a>'+
   '<a class="l opt" href="ob-arhive.html#help">'+I('ext','x12')+'<span>Справка</span></a>'+
   langHtml+themeHtml+'<span class="sep"></span><a class="btn sm" href="ob-arhive.html#feedback">Отзывы</a></nav>';
  var dr=document.createElement('div');dr.className='drawer';dr.id='drawer';
  dr.innerHTML='<nav aria-label="Разделы">'+NAV.map(function(n){return '<a href="'+n[0]+'"'+(n[2]===cur?' aria-current="page"':'')+'>'+n[1]+'</a>'}).join('')+'<a href="katalog.html?adv=1">Расширенный поиск</a><a href="ob-arhive.html#feedback">Отзывы и предложения</a></nav><div class="dr-foot">'+langHtml+themeHtml+'</div>';
  hd.after(dr);
  hd.querySelector('.menu-btn').addEventListener('click',function(){var o=dr.classList.toggle('open');this.setAttribute('aria-expanded',o)});
}
var tb=document.getElementById('tb');
if(tb&&!ADMIN){
  var act=document.body.dataset.act==='1';
  tb.className='tb'+(act?' has-act':'');
  tb.innerHTML='<div class="tin"><nav class="tnav" aria-label="Разделы сайта">'+NAV.map(function(n){return '<a href="'+n[0]+'"'+(n[2]===cur?' aria-current="page"':'')+'>'+n[1]+'</a>'}).join('')+'</nav>'+
   (act?'<div class="tact"><button type="button" data-act="print">'+I('print')+'<span>Печать</span></button><button type="button" data-act="share">'+I('share')+'<span>Поделиться...</span></button></div>':'')+'</div>';
}
var ft=document.getElementById('ft');
if(ft&&!ADMIN){
  ft.className='ft';
  ft.innerHTML='<div class="wrap"><div class="top">'+brandHtml.replace('aria-label="Госархив ВКО: Каталог"','')+
   '<ul><li><a href="ob-arhive.html#help">Справка</a></li><li><a href="filialy.html">Филиалы</a></li><li><a href="ob-arhive.html#access">Правила доступа</a></li><li><a href="ob-arhive.html#contacts">Контакты</a></li><li><a href="ob-arhive.html#privacy">Политика конфиденциальности</a></li><li><a href="ob-arhive.html#a11y">Доступность</a></li><li><a href="admin/index.html">Для сотрудников</a></li></ul></div>'+
   '<div class="fcols"><div><b>КГУ «Государственный архив» управления цифровизации и архивов Восточно-Казахстанской области</b><br>070004, г. Усть-Каменогорск, ул. Головкова, 26/1</div><div>8 (7232) 25-59-76 · <a href="mailto:arhiv-ukg@yandex.kz">arhiv-ukg@yandex.kz</a><br>Пн–пт 9:00–18:00, читальный зал 10:00–17:00</div></div>'+
   '<div class="legal"><span>Прототип, не официальный сайт. Исторические иллюстрации: Wikimedia Commons, общественное достояние. Шифры дел вымышленные. Сайт информационный: заявки, запросы и платные услуги не предусмотрены.</span><span>г. Усть-Каменогорск (Өскемен)</span></div></div>';
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b)return;
  if(b.dataset.act==='print')window.print();
  if(b.dataset.act==='share')window.VKO.copy(location.href,'Ссылка скопирована');
  if(b.dataset.act==='copy')window.VKO.copy(b.dataset.text,'Шифр скопирован');
});
document.addEventListener('click',function(e){
  var b=e.target.closest('.lang button');if(b)setLang(b.dataset.l);
  var t=e.target.closest('.theme');if(t)setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
});

/* ---------- ИИ-помощник ---------- */
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function cipher(it){return 'Ф. '+it.f+', оп. '+it.o+', д. '+it.d}
function byId(id){return D.ITEMS.filter(function(x){return x.id===id})[0]}
function srcRow(it){
  return '<li><a class="ai-src" href="delo.html?id='+encodeURIComponent(it.id)+'"><span class="c">'+esc(cipher(it))+'</span><span class="t">'+esc(it.t)+'</span><span class="s s-'+it.acc+'">'+D.ACC[it.acc]+'</span></a></li>';
}
var Q1='Где найти метрические книги Семипалатинска 1900-х?';
function answer(text){
  var s=text.toLowerCase();
  var A=function(body){return body};
  if(/метрическ|метрика|metric|рождени|брак.*семипалатинск|семипалатинск.*190|семей.*190|semipalatinsk.*190/.test(s)){
    return '<p>Метрические книги Семипалатинска за 1900-е годы хранятся в фонде 12 «Семипалатинская духовная консистория (метрические книги)», опись 1 «Метрические книги приходов, 1900–1918». В описи 540 дел, 62 из них оцифрованы и открыты для просмотра на сайте.</p>'+
     '<p class="ai-h">Источники ответа</p><ul class="ai-srcs">'+['12/1/305','12/1/312','12/1/318'].map(function(i){return srcRow(byId(i))}).join('')+'</ul>'+
     '<p><a href="fond.html?f=12">Открыть фонд 12 и опись 1</a> · <a href="katalog.html?q=метрические+книги&place=Семипалатинск">Все результаты в каталоге</a></p>'+
     '<p class="ai-h">Что ещё можно спросить</p><div class="ai-chips"><button type="button" data-q="Как читать шифр дела?">Как читать шифр дела?</button><button type="button" data-q="Где находится читальный зал?">Где находится читальный зал?</button></div>';
  }
  if(/справк|заявлен|запрос|заказ|оформить|получить копи|certificate|request|order|өтініш|анықтама алу/.test(s)){
    return '<p>Сайт имеет информационно-справочное назначение: на нём нельзя подать заявление, запрос или заказать справку. Помощник тоже не принимает заявки.</p><p>Сведения об архиве, его филиалах и режиме работы собраны на странице «Контакты».</p><p><a href="ob-arhive.html#contacts">Контакты и режим работы</a> · <a href="filialy.html">Филиалы на карте</a></p>';
  }
  if(/адрес|читальн|где находит|график|режим|время работы|филиал|телефон|address|reading room|hours|branch|мекенжай|оқу зал|филиал/.test(s)){
    return '<p>Главное здание: г. Усть-Каменогорск, ул. Головкова, 26/1, пн–пт 9:00–18:00, тел. 8 (7232) 25-59-76. Читальный зал: ул. Крылова, 39, пн–пт 10:00–17:00, тел. 8 (7232) 25-13-47.</p><p>Филиалы: Усть-Каменогорск (по личному составу), Зайсан, Риддер, Алтай (бывший Зыряновск).</p><p><a href="filialy.html">Открыть карту филиалов</a> · <a href="ob-arhive.html#contacts">Все контакты</a></p>';
  }
  if(/шифр|как читать|что такое фонд|опись|структур|cipher|reference code|how to read|шифрды|қалай оқу/.test(s)){
    return '<p>Шифр дела читается сверху вниз: Ф. 1-П, оп. 1, д. 245 означает фонд 1-П, опись 1, дело 245. Фонд объединяет документы одного происхождения, опись описывает его часть, дело это единица хранения.</p><p><a href="ob-arhive.html#help">Справка по каталогу и шифрам</a></p>';
  }
  if(/фото|1960|усть-каменогорск|ust|kamen|photo|сурет|өскемен/.test(s)){
    return '<p>Фотографии Усть-Каменогорска 1960-х годов есть в фонде 102, опись 3. Альбом «Усть-Каменогорск, 1960-е: новые кварталы» пока не оцифрован, его карточка с описанием доступна в каталоге. Ранние виды города: гравюра 1891 года, оцифрована.</p><p class="ai-h">Источники ответа</p><ul class="ai-srcs">'+['102/3/301','1-П/2/17'].map(function(i){return srcRow(byId(i))}).join('')+'</ul><p><a href="katalog.html?q=Усть-Каменогорск&type=Фотографии">Все фотографии в каталоге</a></p>';
  }
  return '<p>Точного ответа по описям я не нашёл. Попробуйте уточнить: назовите населённый пункт, период или тему. Можно сразу перейти к поиску по каталогу.</p><p><a href="katalog.html?q='+encodeURIComponent(text)+'">Искать в каталоге</a> · <a href="ob-arhive.html#help">Справка</a></p>';
}
function mountAI(root,full){
  root.innerHTML=
   '<div class="ai-log" role="log" aria-live="polite"><div class="ai-m a"><p>Здравствуйте. Я помогаю ориентироваться на сайте и искать открытые материалы: фонды, описи, дела, филиалы. Спросите, например:</p><div class="ai-chips"><button type="button" data-q="'+Q1+'">'+Q1+'</button><button type="button" data-q="Где находится читальный зал?">Где находится читальный зал?</button><button type="button" data-q="Фотографии Усть-Каменогорска 1960-х годов">Фотографии Усть-Каменогорска 1960-х годов</button></div></div></div>'+
   '<p class="ai-note">'+I('info')+'<span>Сайт информационный: помощник не принимает заявки, запросы и заказы. Не вводите персональные данные.</span></p>'+
   '<form class="ai-in" autocomplete="off"><label class="sr" for="ai-q'+(full?'f':'')+'">Ваш вопрос</label><input id="ai-q'+(full?'f':'')+'" type="text" placeholder="Задайте вопрос по фондам и сайту"><button type="submit" aria-label="Отправить">'+I('send')+'</button></form>';
  var log=root.querySelector('.ai-log'),inp=root.querySelector('input');
  function add(cls,html){var m=document.createElement('div');m.className='ai-m '+cls;m.innerHTML=html;log.appendChild(m);applyTo(m);log.scrollTop=cls==='a'?Math.max(0,m.offsetTop-120):log.scrollHeight;return m}
  function ask(text){
    if(!text.trim())return;
    add('u','<p>'+esc(text)+'</p>');
    var w=add('a w','<div class="ai-wait"><s></s><s></s><s></s></div>');
    setTimeout(function(){w.remove();add('a',answer(text));},650);
  }
  root.addEventListener('click',function(e){var b=e.target.closest('.ai-chips button');if(b)ask(b.dataset.q)});
  root.querySelector('form').addEventListener('submit',function(e){e.preventDefault();var v=inp.value;inp.value='';ask(v)});
  root.ask=ask;
  applyTo(root);
  return root;
}
window.VKO.mountAI=mountAI;
var fullAI=document.getElementById('ai-full');
if(fullAI)mountAI(fullAI,true);
else if(!ADMIN||true){
  var fab=document.createElement('button');fab.className='ai-fab';fab.type='button';fab.setAttribute('aria-haspopup','dialog');
  fab.innerHTML=I('chat')+'<span>ИИ-помощник</span>';
  var pn=document.createElement('section');pn.className='ai-panel';pn.setAttribute('role','dialog');pn.setAttribute('aria-label','ИИ-помощник');pn.hidden=true;
  var base=ADMIN?'../':'';
  pn.innerHTML='<header class="ai-hd"><span class="ai-t">'+I('chat')+'<b>ИИ-помощник</b><small>KZ · RU · EN</small></span><a class="ai-x" href="'+base+'ii.html" aria-label="Открыть на весь экран">'+I('ext')+'</a><button type="button" class="ai-x ai-close" aria-label="Закрыть">'+I('close')+'</button></header><div class="ai-body"></div>';
  document.body.appendChild(fab);document.body.appendChild(pn);
  var body=pn.querySelector('.ai-body'),inst=null;
  if(ADMIN){pn.querySelectorAll('a').forEach(function(a){})}
  function open(){
    pn.hidden=false;fab.classList.add('on');fab.setAttribute('aria-expanded','true');
    if(!inst){inst=mountAI(body,false);if(ADMIN){body.querySelectorAll('a').forEach(function(a){a.dataset.pre='../'})}}
    var i=pn.querySelector('input');if(i&&window.innerWidth>700)i.focus();
  }
  function close(){pn.hidden=true;fab.classList.remove('on');fab.setAttribute('aria-expanded','false')}
  fab.addEventListener('click',function(){pn.hidden?open():close()});
  pn.querySelector('.ai-close').addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pn.hidden)close()});
  if(q.get('ai')){open();if(q.get('ai')==='demo')setTimeout(function(){inst.ask(Q1)},300)}
  if(ADMIN)pn.addEventListener('click',function(e){var a=e.target.closest('a[href]');if(a&&!/^(\.\.|http|mailto|#)/.test(a.getAttribute('href'))){e.preventDefault();location.href='../'+a.getAttribute('href')}});
}
/* применить язык: ?lang, сохранённый или RU */
var L=q.get('lang')||savedL||'ru';
setLang(L,!q.get('lang'));
document.body.dataset.h=document.documentElement.scrollHeight;
document.body.classList.add('ready');
})();
