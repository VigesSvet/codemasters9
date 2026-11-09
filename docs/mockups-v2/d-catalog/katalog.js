(function(){
var D=window.VKO_DATA,I=function(n){return '<svg class="ic"><use href="#'+n+'"/></svg>'};
var q=new URLSearchParams(location.search);
var S={q:q.get('q')||'',title:'',kw:'',fond:q.get('fond')||'',opis:q.get('opis')||'',delo:'',y1:'',y2:'',org:'',per:[],theme:[],place:q.get('place')?[q.get('place')]:[],type:q.get('type')?[q.get('type')]:[],br:[],acc:[],lang:[],dig:false,tab:q.get('tab')||'all',sort:'rel',view:'list',page:1};
var PER=8,loading=true;
var $=function(s){return document.getElementById(s)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function cnt(key,val){return D.ITEMS.filter(function(x){return key==='per'?x.per===val:key==='lang'?x.lang.indexOf(val)>-1:x[key]===val}).length}
function group(id,key,opts,lab){
  $(id).innerHTML=opts.map(function(o,i){var v=o[0],l=o[1];return '<label class="ck"><input type="checkbox" data-g="'+key+'" value="'+esc(v)+'"'+(S[key].indexOf(String(v))>-1?' checked':'')+'><span>'+esc(l)+'</span><span class="n" data-nt>'+cnt(key,v)+'</span></label>'}).join('');
}
group('fg-per','per',D.PERIODS.map(function(p,i){return [String(i),p[0]]}));
D.ITEMS.forEach(function(x){x.per=String(x.per)});
function cnt2(key,val){return D.ITEMS.filter(function(x){return key==='lang'?x.lang.indexOf(val)>-1:x[key]===val}).length}
cnt=cnt2;
group('fg-per','per',D.PERIODS.map(function(p,i){return [String(i),p[0]]}));
group('fg-theme','theme',D.THEMES.map(function(t){return [t,t]}));
group('fg-place','place',D.PLACES.map(function(t){return [t,t]}));
group('fg-type','type',D.TYPES.map(function(t){return [t,t]}));
group('fg-br','br',Object.keys(D.BRN).map(function(k){return [k,D.BRN[k]]}));
group('fg-acc','acc',Object.keys(D.ACC).map(function(k){return [k,D.ACC[k]]}));
group('fg-lang','lang',[['русский','русский'],['казахский','казахский'],['без текста','без текста']]);
['title','kw','fond','opis','delo','y1','y2','org'].forEach(function(k){var e=document.querySelector('[data-k="'+k+'"]');if(e)e.value=S[k]});
$('hq')&&($('hq').value=S.q);
if(q.get('adv')){var o=document.querySelector('[data-g="org"]');if(o)o.open=true;document.querySelector('[data-g="theme"]').open=true}

function cipher(x){return 'Ф. '+x.f+', оп. '+x.o+', д. '+x.d}
function norm(s){return String(s).toLowerCase().replace(/ё/g,'е')}
function match(x,ignoreTab){
  var hay=norm([x.t,x.kw,x.desc,x.org,x.place,x.theme,cipher(x),x.y1,x.y2].join(' '));
  if(S.q){var ws=norm(S.q).split(/[\s,]+/).filter(Boolean);for(var i=0;i<ws.length;i++){if(hay.indexOf(ws[i])<0)return false}}
  if(S.title&&norm(x.t).indexOf(norm(S.title))<0)return false;
  if(S.kw){var kk=norm(S.kw).split(/[\s,]+/).filter(Boolean);for(var j=0;j<kk.length;j++){if(norm(x.kw+' '+x.t).indexOf(kk[j])<0)return false}}
  if(S.fond&&norm(x.f)!==norm(S.fond))return false;
  if(S.opis&&String(x.o)!==S.opis.trim())return false;
  if(S.delo&&String(x.d)!==S.delo.trim())return false;
  if(S.y1&&x.y2<+S.y1)return false;
  if(S.y2&&x.y1>+S.y2)return false;
  if(S.org&&norm(x.org).indexOf(norm(S.org))<0)return false;
  var m={per:x.per,theme:x.theme,place:x.place,type:x.type,br:x.br,acc:x.acc};
  for(var k in m){if(S[k].length&&S[k].indexOf(String(m[k]))<0)return false}
  if(S.lang.length&&!S.lang.some(function(l){return x.lang.indexOf(l)>-1}))return false;
  if(S.dig&&!x.dig)return false;
  if(!ignoreTab){
    if(S.tab==='fond'||S.tab==='opis')return false;
  }
  return true;
}
var FOND_TAB=function(){
  return D.FONDS.filter(function(f){
    var hay=norm([f.t,f.kw,f.org,f.n,f.place].join(' '));
    if(S.q){var ws=norm(S.q).split(/[\s,]+/).filter(Boolean);for(var i=0;i<ws.length;i++)if(hay.indexOf(ws[i])<0)return false}
    if(S.fond&&norm(f.n)!==norm(S.fond))return false;
    if(S.place.length&&S.place.indexOf(f.place)<0)return false;
    if(S.theme.length&&S.theme.indexOf(f.theme)<0)return false;
    if(S.br.length&&S.br.indexOf(f.br)<0)return false;
    if(S.org&&norm(f.org).indexOf(norm(S.org))<0)return false;
    return true});
};
function hl(s){
  s=esc(s);if(!S.q)return s;
  S.q.split(/\s+/).filter(function(w){return w.length>1}).forEach(function(w){
    var re=new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');s=s.replace(re,'<mark>$1</mark>')});
  return s;
}
function score(x){
  if(!S.q)return 0;var s=0,n=norm(S.q);
  if(norm(x.t).indexOf(n)>-1)s+=5;if(norm(cipher(x)).indexOf(n)>-1)s+=8;if(norm(x.kw).indexOf(n)>-1)s+=3;return s+(x.dig?1:0);
}
function items(){
  var r=D.ITEMS.filter(function(x){return match(x)});
  if(S.tab==='dig')r=r.filter(function(x){return x.dig});
  else if(S.tab!=='all'&&S.tab!=='fond')r=r.filter(function(x){return x.type===S.tab});
  var s=S.sort;
  r.sort(function(a,b){
    if(s==='cipher')return a.f.localeCompare(b.f,'ru',{numeric:true})||a.o-b.o||a.d-b.d;
    if(s==='ya')return a.y1-b.y1;if(s==='yd')return b.y1-a.y1;
    if(s==='t')return a.t.localeCompare(b.t,'ru');
    return score(b)-score(a)||a.f.localeCompare(b.f,'ru',{numeric:true})||a.o-b.o||a.d-b.d});
  return r;
}
function tabsHtml(){
  var base=D.ITEMS.filter(function(x){return match(x,true)});
  var tabs=[['all','Все записи',base.length],['fond','Фонды',FOND_TAB().length],['dig','Оцифровано',base.filter(function(x){return x.dig}).length]];
  ['Фотографии','Карты и чертежи','Письменные источники','Архивные дела','Аудио- и видеоматериалы'].forEach(function(t){tabs.push([t,t,base.filter(function(x){return x.type===t}).length])});
  $('lt').innerHTML=tabs.map(function(t){return '<button type="button" role="tab" data-tab="'+esc(t[0])+'" aria-selected="'+(S.tab===t[0])+'">'+t[1]+'<span data-nt>'+t[2]+'</span></button>'}).join('');
}
function pillsHtml(){
  var p=[];
  var add=function(k,pre,label,val,free){p.push('<span class="pill">'+(pre?'<span>'+pre+'</span> ':'')+'<span'+(free?' data-nt':'')+'>'+esc(label)+'</span><button type="button" data-rm="'+k+'" data-v="'+esc(val==null?'':val)+'" aria-label="Убрать фильтр">'+I('close')+'</button></span>')};
  if(S.q)add('q','Запрос:',S.q,'',1);
  [['title','Название:'],['kw','Слова:'],['fond','Фонд:'],['opis','Опись:'],['delo','Дело:'],['org','Организация:']].forEach(function(a){if(S[a[0]])add(a[0],a[1],S[a[0]],'',1)});
  if(S.y1||S.y2)add('years','Годы:',(S.y1||'…')+'–'+(S.y2||'…'),'',1);
  S.per.forEach(function(v){add('per','',D.PERIODS[+v][0],v)});
  ['theme','place','type'].forEach(function(k){S[k].forEach(function(v){add(k,'',v,v)})});
  S.br.forEach(function(v){add('br','',D.BRN[v],v)});S.acc.forEach(function(v){add('acc','',D.ACC[v],v)});S.lang.forEach(function(v){add('lang','',v,v)});
  if(S.dig)add('dig','','Только оцифрованные');
  $('pills').innerHTML=p.join('');
  $('fcount').textContent=p.length;
}
function card(x){
  var pv=x.img?'<div class="pv" style="background-image:url(img/'+x.img+'.jpg)"></div>':'<div class="pv">'+I(x.type==='Фотографии'?'img':x.type.indexOf('Аудио')>-1?'text':'doc')+'</div>';
  return '<article class="rc">'+pv+'<div><h3><a href="delo.html?id='+encodeURIComponent(x.id)+'">'+hl(x.t)+'</a></h3><p class="cz">'+hl(cipher(x))+'</p><p class="sn">'+hl(x.desc)+'</p><p class="mt">'+x.y1+(x.y2!==x.y1?'–'+x.y2:'')+' · '+esc(x.place)+' · '+esc(x.lang)+(x.sh?' · '+x.sh+' л.':'')+'</p><div class="bds" style="margin-top:8px"><span class="bd mono">'+esc(x.type)+'</span><span class="bd s-'+x.acc+'">'+D.ACC[x.acc]+'</span>'+(x.dig?'<span class="bd">'+I('img')+'Есть цифровая копия</span>':'<span class="bd">Не оцифровано</span>')+'</div></div></article>';
}
function fcard(f){
  var d=f.opisi.reduce(function(a,o){return a+o.d},0);
  return '<article class="rc"><div class="pv">'+I('bank')+'</div><div><h3><a href="fond.html?f='+encodeURIComponent(f.n)+'">Фонд '+esc(f.n)+'. '+hl(f.t)+'</a></h3><p class="cz">'+f.y1+'–'+f.y2+' · '+f.opisi.length+' оп. · '+d+' дел</p><p class="sn">'+hl(f.about)+'</p><div class="bds"><span class="bd mono">Архивный фонд</span><span class="bd">'+esc(D.BRN[f.br])+'</span></div></div></article>';
}
function skel(){return [1,2,3,4].map(function(){return '<div class="rc sk2" aria-hidden="true"><i></i><div><s></s><s></s><s></s><s></s></div></div>'}).join('')}
function render(){
  tabsHtml();pillsHtml();
  var res=$('res'),pg=$('pgn');
  res.className='res'+(S.view==='grid'?' grid':'');
  if(loading){res.innerHTML=skel();$('cnt').innerHTML='&nbsp;';pg.innerHTML='';return}
  var list=S.tab==='fond'?FOND_TAB():items(),total=list.length,pages=Math.max(1,Math.ceil(total/PER));
  if(S.page>pages)S.page=pages;
  var slice=list.slice((S.page-1)*PER,S.page*PER);
  $('cnt').innerHTML='Найдено: <b>'+total+'</b>'+(total?' · показано '+((S.page-1)*PER+1)+'–'+((S.page-1)*PER+slice.length):'');
  if(!total){res.innerHTML='<div class="empty"><b>Ничего не найдено</b>Измените запрос или сбросьте часть фильтров. Попробуйте искать по шифру («Ф. 12, оп. 1») или по населённому пункту.<p><button class="btn alt" type="button" id="rs2">Сбросить фильтры</button></p></div>';pg.innerHTML=''}
  else{res.innerHTML=slice.map(S.tab==='fond'?fcard:card).join('');
    var h='<button type="button" data-p="'+(S.page-1)+'"'+(S.page===1?' disabled':'')+'>'+I('left')+'Назад</button>';
    for(var i=1;i<=pages;i++)h+='<button type="button" data-p="'+i+'"'+(i===S.page?' aria-current="page"':'')+'>'+i+'</button>';
    h+='<button type="button" data-p="'+(S.page+1)+'"'+(S.page===pages?' disabled':'')+'>Далее'+I('right')+'</button><span class="tot">Страница '+S.page+' из '+pages+'</span>';
    pg.innerHTML=h}
  window.VKO.apply(document.querySelector('main'));
}
function sync(){
  document.querySelectorAll('[data-k]').forEach(function(e){S[e.dataset.k]=e.value});
  ['per','theme','place','type','br','acc','lang'].forEach(function(k){S[k]=[].map.call(document.querySelectorAll('input[data-g="'+k+'"]:checked'),function(e){return e.value})});
  S.dig=$('f-dig').checked;S.page=1;render();
}
function reset(){
  S.q='';document.querySelectorAll('[data-k]').forEach(function(e){e.value=''});
  document.querySelectorAll('.fac input[type=checkbox]').forEach(function(e){e.checked=false});
  if($('hq'))$('hq').value='';sync();
}
document.addEventListener('input',function(e){if(e.target.closest('.fac'))sync()});
document.addEventListener('change',function(e){if(e.target.closest('.fac'))sync();if(e.target.id==='sort'){S.sort=e.target.value;render()}});
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-tab]');if(t){S.tab=t.dataset.tab;S.page=1;render()}
  var p=e.target.closest('[data-p]');if(p&&!p.disabled){S.page=+p.dataset.p;render();window.scrollTo(0,document.querySelector('.kbody').offsetTop+40)}
  var v=e.target.closest('[data-v]');if(v&&v.closest('.vt')){S.view=v.dataset.v;document.querySelectorAll('.vt button').forEach(function(b){b.setAttribute('aria-pressed',b===v)});render()}
  var r=e.target.closest('[data-rm]');if(r){
    var k=r.dataset.rm,val=r.dataset.v;
    if(k==='q'){S.q='';if($('hq'))$('hq').value=''}
    else if(k==='years'){$('f-y1').value='';$('f-y2').value=''}
    else if(k==='dig')$('f-dig').checked=false;
    else if(document.querySelector('[data-k="'+k+'"]'))document.querySelector('[data-k="'+k+'"]').value='';
    else{var c=document.querySelector('input[data-g="'+k+'"][value="'+val.replace(/"/g,'\\"')+'"]');if(c)c.checked=false}
    sync()}
  if(e.target.id==='reset'||e.target.id==='rs2')reset();
  if(e.target.closest('#fbtn'))$('fac').classList.add('open');
  if(e.target.closest('#fclose')||e.target.id==='apply')$('fac').classList.remove('open');
});
var mf=document.querySelector('.hd .sf.mini');
if(mf)mf.addEventListener('submit',function(e){e.preventDefault();S.q=$('hq').value;S.page=1;render()});
render();
setTimeout(function(){loading=false;render()},q.get('skel')?60000:700);
})();
