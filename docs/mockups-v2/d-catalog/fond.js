(function(){
var D=window.VKO_DATA,q=new URLSearchParams(location.search);
var I=function(n){return '<svg class="ic"><use href="#'+n+'"/></svg>'};
var f=D.FONDS.filter(function(x){return x.n===(q.get('f')||'1-П')})[0]||D.FONDS[0];
var op=+q.get('o')||0;
var tot=f.opisi.reduce(function(a,o){return a+o.d},0),dig=f.opisi.reduce(function(a,o){return a+o.dig},0);
document.title='Фонд '+f.n+'. '+f.t+'. Каталог ГА ВКО';
var h='<nav aria-label="Путь в иерархии"><p class="crumbs"><a href="katalog.html">Каталог</a>'+I('dchev')+'<a href="katalog.html?tab=fond">Архивные фонды</a>'+I('dchev')+'<span>Фонд '+f.n+'</span></p></nav>'+
'<div class="lvl">'+I('bank')+'<span>Фонд</span></div>'+
'<h1>'+f.t+'</h1>'+
'<p class="alt"><i>Шифр:</i> <b>ГА ВКО. Ф. '+f.n+'</b></p>'+
'<ul class="meta"><li>'+I('bank')+'<span>'+D.BRN[f.br]+'</span></li><li>'+I('cal')+'<span>Даты: '+f.y1+'–'+f.y2+'</span></li><li>'+I('folder')+'<span>'+f.opisi.length+' оп.</span></li><li>'+I('file')+'<span>'+tot+' дел</span></li><li>'+I('img')+'<span>Оцифровано: '+dig+'</span></li></ul>'+
'<div class="cols" style="padding-top:8px"><div>'+
'<div class="blk"><h2>Историческая справка</h2><p>'+f.about+'</p></div>'+
'<div class="blk"><h2>Оцифровка фонда</h2><div class="prog wide" style="--w:'+Math.round(dig/tot*100)+'%"><b>Оцифровано '+dig+' из '+tot+' дел</b> фонда<div class="bar"><i></i></div></div></div>'+
'<div class="blk"><h2>Описи и дела</h2>'+
f.opisi.map(function(o,i){
  var rows=D.ITEMS.filter(function(x){return x.f===f.n&&x.o===o.n});
  var body=rows.length?'<div class="tw"><table class="tbl rsp"><thead><tr><th class="m">Дело</th><th>Заголовок</th><th>Даты</th><th>Листов</th><th>Доступ</th></tr></thead><tbody>'+rows.map(function(x){return '<tr><td data-l="Дело" class="m">'+x.d+'</td><td data-l="Заголовок"><a href="delo.html?id='+encodeURIComponent(x.id)+'">'+x.t+'</a></td><td data-l="Даты">'+x.y1+(x.y2!==x.y1?'–'+x.y2:'')+'</td><td data-l="Листов">'+(x.sh||'')+'</td><td data-l="Доступ"><span class="bd s-'+x.acc+'">'+D.ACC[x.acc]+'</span></td></tr>'}).join('')+'</tbody></table></div><div class="ft2">Показаны избранные дела описи. Всего дел: '+o.d+', оцифровано: '+o.dig+'. <a href="katalog.html?fond='+encodeURIComponent(f.n)+'&opis='+o.n+'">Искать внутри описи</a></div>':'<div class="ft2">Дела описи ещё не внесены в электронный каталог. Всего дел: '+o.d+'.</div>';
  return '<details class="op"'+((op?o.n===op:i===0)?' open':'')+'><summary>'+I('folder')+'<b>Опись '+o.n+'. '+o.t+'</b><span class="n">'+o.y+' · '+o.d+' дел · оцифр. '+o.dig+'</span></summary>'+body+'</details>';
}).join('')+'</div>'+
'</div><aside class="side"><div class="how"><h2>Как ознакомиться</h2><p>Список фондов и описей открыт онлайн. Сведения о подлинниках: читальный зал в Усть-Каменогорске, пн–пт 10:00–17:00. Сайт не принимает заявки и запросы.</p></div>'+
'<h2>Состав фонда</h2><ul class="tree"><li>'+I('bank')+'<span>Ф. '+f.n+' '+f.t+'<span class="n">'+tot+' дел</span></span></li>'+f.opisi.map(function(o){return '<li class="l2">'+I('folder')+'<span><a href="fond.html?f='+encodeURIComponent(f.n)+'&o='+o.n+'">Оп. '+o.n+' '+o.t+'</a><span class="n">'+o.d+' дел</span></span></li>'}).join('')+'</ul>'+
'<h2>Другие фонды</h2><ul class="part">'+D.FONDS.filter(function(x){return x.n!==f.n}).slice(0,6).map(function(x){return '<li><a href="fond.html?f='+encodeURIComponent(x.n)+'">Фонд '+x.n+'</a><span>'+x.y1+'–'+x.y2+'</span></li>'}).join('')+'</ul></aside></div>';
document.getElementById('fond').innerHTML=h;
})();
