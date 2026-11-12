/* faq-content.js - если блок «faq» задан в админке, показывает его вместо статического текста.
   Формат body: блоки через пустую строку; первая строка - вопрос, остальное - ответ (обычный текст). */
(function () {
  "use strict";

  var acc = document.querySelector("#faq .acc");
  if (!acc || !window.gosApi) return;
  var STATIC = acc.innerHTML;
  var replaced = false;
  function restore() {
    if (!replaced) return;
    replaced = false;
    acc.innerHTML = STATIC;
    if (window.trEls) window.trEls(acc);
  }
  var prevOnLang = window.onLang;

  function render(body) {
    replaced = true;
    acc.textContent = "";
    body.split(/\n\s*\n/).forEach(function (chunk, i) {
      var lines = chunk.trim().split("\n");
      if (!lines[0]) return;
      var d = document.createElement("details");
      if (i === 0) d.open = true;
      var s = document.createElement("summary");
      s.textContent = lines[0];
      var a = document.createElement("div");
      a.className = "in";
      a.textContent = lines.slice(1).join("\n").trim();
      d.appendChild(s);
      d.appendChild(a);
      acc.appendChild(d);
    });
  }

  function load() {
    var lang = window.getLang ? window.getLang() : "ru";
    window.gosApi.get("/api/content/faq", { lang: lang }).then(function (res) {
      if (res && res.body && res.body.trim()) render(res.body);
      else restore();
    }).catch(restore);
  }

  window.onLang = function () {
    if (prevOnLang) prevOnLang.apply(this, arguments);
    load();
  };
  load();
})();
