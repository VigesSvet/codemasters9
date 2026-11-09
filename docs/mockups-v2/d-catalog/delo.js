(function(){
var D=window.VKO_DATA,q=new URLSearchParams(location.search);
var I=function(n){return '<svg class="ic"><use href="#'+n+'"/></svg>'};
var x=D.ITEMS.filter(function(i){return i.id===q.get('id')})[0]||D.ITEMS[0];
var f=D.FONDS.filter(function(z){return z.n===x.f})[0],o=f.opisi.filter(function(z){return z.n===x.o})[0];
var c='Ф. '+x.f+', оп. '+x.o+', д. '+x.d,cfull='ГА ВКО. Ф. '+x.f+'. Оп. '+x.o+'. Д. '+x.d;
var yrs=x.y1+(x.y2!==x.y1?'–'+x.y2:'');
document.title=x.t+'. '+c+'. Каталог ГА ВКО';
var img='img/'+(x.img||'survey1893')+'.jpg',lim=x.acc!=='open';
var sib=D.ITEMS.filter(function(z){return z.f===x.f&&z.o===x.o});
var rel=D.ITEMS.filter(function(z){return z.id!==x.id&&(z.f===x.f||z.theme===x.theme||z.place===x.place)}).sort(function(a,b){
  var s=function(z){return (z.f===x.f?2:0)+(z.theme===x.theme?2:0)+(z.place===x.place?1:0)+(z.dig?.5:0)};return s(b)-s(a)}).slice(0,6);
var fav=false;try{fav=(JSON.parse(localStorage.getItem('vko-fav')||'[]')).indexOf(x.id)>-1}catch(e){}
var h='<div class="rec"><nav aria-label="Путь в иерархии"><p class="crumbs"><a href="katalog.html">Каталог</a>'+I('dchev')+'<a href="fond.html?f='+encodeURIComponent(f.n)+'">Фонд '+f.n+': '+f.t+'</a>'+I('dchev')+'<a href="fond.html?f='+encodeURIComponent(f.n)+'&o='+o.n+'">Опись '+o.n+': '+o.t+', '+o.y+'</a></p></nav>'+
'<div class="lvl">'+I('layers')+'<span>Дело</span><span class="bd s-'+x.acc+'">'+D.ACC[x.acc]+'</span></div>'+
'<h1>'+x.t+'</h1><p class="alt"><i>Шифр:</i> <b>'+c+'</b></p>'+
'<ul class="meta"><li>'+I('bank')+'<span>'+D.BRN[x.br]+'</span></li><li>'+I('doc')+'<span>'+x.type+'</span></li><li>'+I('cal')+'<span>Даты: '+yrs+'</span></li>'+
(x.sh?'<li>'+I('file')+'<span>'+x.sh+' л.</span></li>':'')+
'<li>'+I('img')+'<span>'+(x.dig&&x.sh?x.sh+' сканов':x.dig?'Цифровая копия есть':'Цифровой копии нет')+'</span></li>'+
(x.dig&&x.sh>12?'<li>'+I('edit')+'<span>12 / '+x.sh+' расшифрованы</span></li>':'')+'</ul></div>';
if(lim){
  h+='<div class="rec" style="padding-top:0"><div class="lim">'+I('lock')+'<div><h2>Доступ ограничен</h2><p>Цифровая копия не публикуется: '+(x.acc==='limited'?'документ содержит персональные данные или ограничен условиями передачи.':'документ закрыт для публикации.')+' Показана только информационная карточка с описанием дела.</p><p>Порядок ознакомления с подлинником определяется Правилами работы читального зала. Сайт не принимает заявки и запросы: сведения о режиме работы и контакты указаны в разделе «Об архиве».</p><p><a href="ob-arhive.html#access">Условия доступа</a> · <a href="ob-arhive.html#contacts">Контакты архива</a></p></div></div></div>';
}else if(x.dig&&x.sh){
  var th=[1,2,3,4,5].map(function(n){return '<div class="th'+(n===1?' on':'')+'"><span>'+n+'</span><i style="background-image:url('+img+')"></i></div>'}).join('');
  h+='<section class="vwr" id="vwr" aria-label="Просмотр скана"><div class="main"><div class="tabs"><span class="btnl" id="t-tr">'+I('edit')+'Транскрипция <em>-</em> <b>'+(x.sh>12?'Доступна':'Нет')+'</b></span><span>'+I('tag')+'Теги <em>- 0</em></span><span>'+I('comment')+'Комментарии <em>- 0</em></span><span class="btnl" id="t-ocr" role="button" tabindex="0" aria-pressed="false">'+I('text')+'Распознанный текст <em>- '+x.sh+'</em></span></div>'+
  '<div class="osd" role="group" aria-label="Масштаб"><button type="button" id="zin" aria-label="Увеличить">'+I('plus')+'</button><button type="button" id="zout" aria-label="Уменьшить">'+I('minus')+'</button><button type="button" id="zhome" aria-label="Вписать">'+I('home')+'</button></div>'+
  '<div class="page" id="pg" role="img" aria-label="Скан: '+x.t+'" style="background-image:url('+img+');transition:transform .6s ease-in-out"></div>'+
  '<div class="ocr" id="ocr">Распознанный текст (ИИ, ожидает проверки сотрудником архива):\n\n'+(x.f==='1-П'?'ОБЗОРЪ\nСЕМИПАЛАТИНСКОЙ ОБЛАСТИ\nза 1893 годъ.\n\nСемипалатинскъ.\nТипографія Областного Правленія.\n1894.':x.t+'\n\n[текст листа 1 в процессе распознавания]')+'</div></div>'+
  '<aside class="rail" aria-label="Миниатюры"><div class="sd">'+I('plus')+'Показать сведения</div>'+th+'</aside></section>';
}else{
  h+='<div class="rec" style="padding-top:0"><div class="lim" style="background:var(--surface);border-color:var(--border)">'+I('img')+'<div><h2>Цифровой копии пока нет</h2><p>Дело описано в каталоге, но не оцифровано. Сведения о месте хранения указаны ниже.</p></div></div></div>';
}
h+='<div class="rec" style="padding-top:0"><div class="cols"><div>'+
'<div class="acts"><button class="fav" id="fav" type="button" aria-pressed="'+fav+'">'+I('star')+'<span>'+(fav?'В избранном':'В избранное')+'</span></button><button class="btn alt" type="button" data-act="share">Поделиться ссылкой</button></div>'+
'<div class="blk"><h2>Описание</h2><p>'+x.desc+'</p><div class="tgl"><input type="checkbox" id="fd"><label for="fd">Скрыть пояснения полей</label></div>'+
'<dl class="dl"><dt>Шифр</dt><dd><span style="font-family:var(--font-mono);font-size:15px">'+cfull+'</span></dd>'+
'<dt>Номер фонда</dt><dd><a href="fond.html?f='+encodeURIComponent(x.f)+'">'+x.f+'</a></dd><dt>Номер описи</dt><dd>'+x.o+'</dd><dt>Номер дела</dt><dd>'+x.d+'</dd>'+
'<dt>Даты документов</dt><dd>'+yrs+'</dd><dt>Тип документа</dt><dd>'+x.type+'</dd>'+
'<dt>Объём</dt><dd>'+(x.sh?x.sh+' л.'+(x.dig?', '+x.sh+' сканов':''):'листы не подсчитаны')+'</dd>'+
'<dt>Язык</dt><dd><a href="katalog.html?lang='+encodeURIComponent(x.lang)+'">'+x.lang+'</a></dd>'+
'<dt>Статус доступности</dt><dd><span class="bd s-'+x.acc+'">'+D.ACC[x.acc]+'</span></dd>'+
'<dt>Цифровая копия</dt><dd>'+(x.dig?'Есть, '+(lim?'не публикуется':'просмотр на сайте'):'Нет')+'</dd>'+
'<dt>Место хранения</dt><dd>'+D.BR.filter(function(b){return b.id===x.br})[0].addr.replace(/^\d+, /,'')+'</dd>'+
'<dt>Организация</dt><dd>'+x.org+'</dd><dt>Тематика</dt><dd>'+x.theme+'</dd>'+
'<dt>Места</dt><dd><a href="katalog.html?place='+encodeURIComponent(x.place)+'">'+x.place+'</a></dd></dl></div>'+
'<div class="blk"><h2>Историческая справка</h2><p>'+f.about+'</p></div>'+
'<div class="blk"><h2>Как сослаться</h2><div class="cite"><code>'+cfull+'. '+x.t+'.'+(x.sh?' Л. 1–'+x.sh+'.':'')+'</code><button type="button" data-act="copy" data-text="'+cfull+'">Копировать</button></div></div>'+
'<div class="blk"><h2>Все сведения</h2><div class="acc"><details><summary>Происхождение и история хранения</summary><p>Поступило в архив в составе фонда '+x.f+'. Подробности передачи указаны в историческом очерке фонда.</p></details><details><summary>Физическое состояние</summary><p>Удовлетворительное, текст читается.</p></details><details><summary>Связанные дела</summary><p>'+sib.filter(function(s){return s.id!==x.id}).map(function(s){return '<a href="delo.html?id='+encodeURIComponent(s.id)+'">Ф. '+s.f+', оп. '+s.o+', д. '+s.d+'</a>'}).join('; ')+(sib.length<2?'Связанных дел в описи нет.':'')+'</p></details></div></div>'+
'<div><p class="skel-t">Похожие документы</p><div class="rel">'+rel.map(function(r){return '<a class="rl" href="delo.html?id='+encodeURIComponent(r.id)+'"><i'+(r.img?' style="background-image:url(img/'+r.img+'.jpg)"':'')+'>'+(r.img?'':I('doc'))+'</i><span>'+r.t+'<small>Ф. '+r.f+', оп. '+r.o+', д. '+r.d+'</small></span></a>'}).join('')+'</div></div>'+
'</div><aside class="side"><div class="how"><h2>Как ознакомиться</h2><p>'+(lim?'Цифровая копия не опубликована. Подлинник доступен по правилам читального зала: ул. Крылова, 39, пн–пт 10:00–17:00.':'Скан открыт онлайн. Подлинник можно просмотреть в читальном зале Усть-Каменогорска: пн–пт 10:00–17:00.')+'</p></div>'+
'<h2>Состав фонда</h2><ul class="tree"><li>'+I('bank')+'<span><a href="fond.html?f='+encodeURIComponent(f.n)+'">Ф. '+f.n+' '+f.t+'</a><span class="n">'+f.opisi.reduce(function(a,z){return a+z.d},0)+' дел</span></span></li>'+
'<li class="l2">'+I('folder')+'<span><a href="fond.html?f='+encodeURIComponent(f.n)+'&o='+o.n+'">Оп. '+o.n+' '+o.t+'</a><span class="n">'+o.d+' дел</span></span></li>'+
sib.map(function(s){return '<li class="l3'+(s.id===x.id?' cur':'')+'">'+I('file')+'<span>'+(s.id===x.id?'<span>Д. '+s.d+'</span> <span>'+s.t+'</span>':'<a href="delo.html?id='+encodeURIComponent(s.id)+'"><span>Д. '+s.d+'</span> <span>'+s.t+'</span></a>')+'</span></li>'}).join('')+'</ul>'+
'<h2>Входит в</h2><ul class="part"><li>Фонд '+f.n+' <span>'+f.opisi.reduce(function(a,z){return a+z.d},0)+' дел</span></li><li>Опись '+o.n+' <span>'+o.d+' дел</span></li></ul>'+
'<div class="prog"><b>Оцифровано '+o.dig+' из '+o.d+' дел</b> описи<div class="bar"><i style="width:'+Math.round(o.dig/o.d*100)+'%"></i></div></div></aside></div></div>';
document.getElementById('delo').innerHTML=h;
var z=1,pg=document.getElementById('pg');
function zz(v){z=Math.max(.6,Math.min(2.4,v));pg.style.transform='translateX(-50%) scale('+z+')'}
if(pg){
  document.getElementById('zin').onclick=function(){zz(z+.3)};document.getElementById('zout').onclick=function(){zz(z-.3)};document.getElementById('zhome').onclick=function(){zz(1)};
  var v=document.getElementById('vwr'),oc=document.getElementById('t-ocr');
  oc.onclick=function(){var on=v.classList.toggle('ocr-on');oc.setAttribute('aria-pressed',on)};
  [].forEach.call(document.querySelectorAll('.th'),function(t){t.onclick=function(){document.querySelector('.th.on').classList.remove('on');t.classList.add('on')}});
}
document.getElementById('fav').onclick=function(){
  var b=this,on=b.getAttribute('aria-pressed')!=='true',a=[];
  try{a=JSON.parse(localStorage.getItem('vko-fav')||'[]')}catch(e){}
  a=a.filter(function(i){return i!==x.id});if(on)a.push(x.id);try{localStorage.setItem('vko-fav',JSON.stringify(a))}catch(e){}
  b.setAttribute('aria-pressed',on);b.querySelector('span').textContent=on?'В избранном':'В избранное';
  var k=window.VKO.lang();if(k!=='ru')b.querySelector('span').textContent=window.VKO.tr(on?'В избранном':'В избранное');
};
var fd=document.getElementById('fd');
if(fd)fd.onchange=function(){document.getElementById('delo').classList.toggle('nofd',fd.checked)};
})();
