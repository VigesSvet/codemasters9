/* Госархив ВКО, макет E: язык (KZ/RU/EN), тема, меню, ИИ-панель, каталог, формы */
(function(){
var doc=document, root=doc.documentElement, $=function(s,c){return (c||doc).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

/* ---- язык ---- */
function setLang(l){
  root.lang=l;
  $$('[data-kk]').forEach(function(e){
    if(!e.hasAttribute('data-ru'))e.setAttribute('data-ru',e.innerHTML);
    e.innerHTML=l==='ru'?e.getAttribute('data-ru'):e.getAttribute('data-'+l);
  });
  $$('[data-ph-kk]').forEach(function(e){
    if(!e.hasAttribute('data-ph-ru'))e.setAttribute('data-ph-ru',e.placeholder);
    e.placeholder=l==='ru'?e.getAttribute('data-ph-ru'):e.getAttribute('data-ph-'+l);
  });
  $$('[data-al-aria-label-kk]').forEach(function(e){
    if(!e.hasAttribute('data-al-ru'))e.setAttribute('data-al-ru',e.getAttribute('aria-label'));
    e.setAttribute('aria-label',l==='ru'?e.getAttribute('data-al-ru'):e.getAttribute('data-al-aria-label-'+l));
    e.title=e.getAttribute('aria-label');
  });
  $$('.lang button').forEach(function(b){b.classList.toggle('on',b.dataset.l===l)});
  ls('vko-lang',l);
  doc.dispatchEvent(new CustomEvent('langchange',{detail:l}));
}
$$('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.l)})});
window.vkoLang=function(){return root.lang||'ru'};
var L0=ls('vko-lang');if(L0&&L0!=='ru')setLang(L0);

/* ---- тема ---- */
var th=$('#theme');
if(th)th.addEventListener('click',function(){
  var d=root.getAttribute('data-theme')==='dark';
  if(d)root.removeAttribute('data-theme');else root.setAttribute('data-theme','dark');
  ls('vko-theme',d?'light':'dark');
});

/* ---- мобильное меню ---- */
var bg=$('#burger'),dr=$('#drawer');
if(bg&&dr){bg.addEventListener('click',function(){dr.classList.toggle('open')});dr.addEventListener('click',function(e){if(e.target===dr)dr.classList.remove('open')})}

/* ---- ИИ-панель ---- */
var fab=$('#aifab'),pn=$('#aipanel');
if(fab&&pn){
  fab.addEventListener('click',function(){pn.classList.add('open');fab.style.display='none'});
  $('#aiclose').addEventListener('click',function(){pn.classList.remove('open');fab.style.display=''});
  if(location.hash==='#ai'){pn.classList.add('open');fab.style.display='none'}
}
var REPLY={
 ru:'Это демонстрационный макет: в рабочей версии здесь будет ответ модели со ссылками на фонды и дела. Пока можно открыть каталог с вашим запросом.',
 kk:'Бұл демонстрациялық макет: жұмыс нұсқасында мұнда қорлар мен істерге сілтемелері бар модель жауабы болады. Әзірге сұрауыңыз бойынша каталогты ашуға болады.',
 en:'This is a demo mock-up: the working version will show a model answer with links to fonds and files here. For now you can open the catalogue with your query.'};
var OPEN={ru:'Открыть каталог',kk:'Каталогты ашу',en:'Open the catalogue'};
$$('.inp').forEach(function(f){
  f.addEventListener('submit',function(){
    var i=$('input',f),v=i.value.trim();if(!v)return;
    var box=$('.msgs',f.parentNode);if(!box)return;
    var l=window.vkoLang();
    var me=doc.createElement('div');me.className='m me';var b=doc.createElement('div');b.className='bub';b.textContent=v;me.appendChild(b);box.appendChild(me);
    var bot=doc.createElement('div');bot.className='m bot';bot.innerHTML='<div class="av">ГА</div><div class="bub"><p></p><div class="sugg"><a></a></div></div>';
    $('p',bot).textContent=REPLY[l];var a=$('a',bot);a.textContent=OPEN[l];a.href='katalog.html?q='+encodeURIComponent(v);
    box.appendChild(bot);box.scrollTop=box.scrollHeight;i.value='';
  });
});

/* ---- каталог ---- */
var q=(location.search.match(/[?&]q=([^&]*)/)||[])[1];
var si=$('#qinput');
if(si){
  if(q){si.value=decodeURIComponent(q.replace(/\+/g,' '))}
  var cards=$$('.mas .card'),cnt=$('#cnt');
  var filt=function(){
    var v=si.value.trim().toLowerCase(),n=0;
    cards.forEach(function(c){var ok=!v||c.textContent.toLowerCase().indexOf(v)>-1;c.style.display=ok?'':'none';if(ok)n++});
    if(cnt)cnt.textContent=v?n:cnt.getAttribute('data-all');
    var qc=$('#qchip');if(qc){qc.style.display=v?'':'none';$('b',qc).textContent=si.value}
  };
  si.addEventListener('input',filt);
  var cl=$('#qclear');if(cl)cl.addEventListener('click',function(){si.value='';filt();si.focus()});
  var qc2=$('#qchip button');if(qc2)qc2.addEventListener('click',function(){si.value='';filt()});
  var rs=$('#freset');if(rs)rs.addEventListener('click',function(){$$('.cat-side select').forEach(function(s){s.selectedIndex=0});$$('.cat-side input').forEach(function(s){s.value=''});si.value='';filt()});
  var tg=$('#togf');if(tg)tg.addEventListener('click',function(){var m=$('#moref');m.classList.toggle('open');tg.querySelector('.a').style.display=m.classList.contains('open')?'none':'';tg.querySelector('.b').style.display=m.classList.contains('open')?'':'none'});
  var fb=$('#fbtn');if(fb)fb.addEventListener('click',function(){$('.cat-side').classList.toggle('open')});
  filt();
}
$$('.vt button').forEach(function(b){b.addEventListener('click',function(){$$('.vt button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');var m=$('.mas');if(m)m.style.columnCount=b.dataset.c||''})});

/* ---- вкладки (карточка дела, админка) ---- */
$$('[data-pane]').forEach(function(g){$$('button',g).forEach(function(b){b.addEventListener('click',function(){
  $$('button',g).forEach(function(x){x.classList.remove('on')});b.classList.add('on');
  var scope=g.getAttribute('data-pane'),key=b.dataset.t;
  $$('['+scope+']').forEach(function(p){p.classList.toggle('on',p.getAttribute(scope)===key)});
})})});

/* ---- форма отзыва ---- */
var ff=$('#fbform');
if(ff)ff.addEventListener('submit',function(e){e.preventDefault();$('.ok',ff).style.display='block';ff.reset()});

/* ---- модерация (админка) ---- */
$$('.mini button').forEach(function(b){b.addEventListener('click',function(){var r=b.closest('tr');if(r)r.style.opacity='.4'})});
})();
