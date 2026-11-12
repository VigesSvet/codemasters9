/* cms.js - экраны «Новости» и «Страницы и FAQ» админки. Подключается после admin.js. */
(function () {
  "use strict";

  var PAGE = document.body.dataset.page || "";
  var api = window.gosApi;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return window.gosEsc ? window.gosEsc(s) : String(s == null ? "" : s); }
  function say(id, msg, err) {
    var n = $(id);
    if (!n) return;
    n.textContent = msg;
    n.style.color = err ? "#b3261e" : "";
  }
  function errText(e) {
    var d = e && e.body && e.body.detail;
    if (e && e.status === 403) return "Недостаточно прав";
    return typeof d === "string" ? d : "Ошибка: " + (e && e.status ? e.status : "сеть");
  }

  // ---------- новости ----------
  var FIELDS = { date: "n-date", image: "n-image", title_ru: "n-title-ru", title_kk: "n-title-kk",
    lead_ru: "n-lead-ru", lead_kk: "n-lead-kk", html_ru: "n-html-ru", html_kk: "n-html-kk" };
  var editId = null;

  function loadNews() {
    api.get("/api/admin/news", { per_page: 100 }).then(function (res) {
      $("n-table").innerHTML = res.items.map(function (n) {
        var pub = n.pub_status === "published";
        return "<tr><td>" + esc(n.date) + "</td><td>" + esc(n.title_ru) + "</td><td>" + (pub ? "Опубликовано" : "Черновик") + "</td><td>" +
          '<button class="btn" data-act="edit" data-id="' + n.id + '">Править</button> ' +
          '<button class="btn" data-act="' + (pub ? "unpublish" : "publish") + '" data-id="' + n.id + '">' + (pub ? "Снять" : "Опубликовать") + "</button> " +
          '<button class="btn" data-act="delete" data-id="' + n.id + '">Удалить</button></td></tr>';
      }).join("");
    }).catch(function (e) { say("n-msg", errText(e), true); });
  }

  function openForm(item) {
    editId = item ? item.id : null;
    Object.keys(FIELDS).forEach(function (k) { $(FIELDS[k]).value = item ? (item[k] || "") : ""; });
    $("n-form").style.display = "";
    $("n-title-ru").focus();
  }

  function initNews() {
    loadNews();
    $("n-new").addEventListener("click", function () { openForm(null); });
    $("n-cancel").addEventListener("click", function () { $("n-form").style.display = "none"; });
    $("n-save").addEventListener("click", function () {
      var body = {};
      Object.keys(FIELDS).forEach(function (k) { body[k] = $(FIELDS[k]).value; });
      if (!body.date) delete body.date;
      var req = editId ? api.put("/api/admin/news/" + editId, body) : api.post("/api/admin/news", body);
      req.then(function () {
        say("n-msg", "Сохранено" + (editId ? "" : " (черновик: опубликуйте в списке)"));
        $("n-form").style.display = "none";
        loadNews();
      }).catch(function (e) { say("n-msg", errText(e), true); });
    });
    $("n-table").addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-act]");
      if (!b) return;
      var id = b.dataset.id, act = b.dataset.act, req;
      if (act === "edit") { api.get("/api/admin/news/" + id).then(openForm); return; }
      if (act === "delete") {
        if (!window.confirm("Удалить новость?")) return;
        req = api.del("/api/admin/news/" + id);
      } else {
        req = api.post("/api/admin/news/" + id + "/" + act, {});
      }
      req.then(function () { say("n-msg", "Готово"); loadNews(); }).catch(function (e) { say("n-msg", errText(e), true); });
    });
  }

  // ---------- страницы и FAQ ----------
  function loadBlock() {
    api.get("/api/admin/content/" + $("c-key").value).then(function (res) {
      var b = res.blocks[$("c-lang").value];
      $("c-title").value = b.title;
      $("c-body").value = b.body;
      say("c-msg", b.updated_at ? "Изменено: " + b.updated_by + ", " + b.updated_at.slice(0, 16).replace("T", " ") : "Блок не задан: на сайте стандартный текст");
    }).catch(function (e) { say("c-msg", errText(e), true); });
  }

  function initContent() {
    loadBlock();
    $("c-key").addEventListener("change", loadBlock);
    $("c-lang").addEventListener("change", loadBlock);
    $("c-save").addEventListener("click", function () {
      api.put("/api/admin/content/" + $("c-key").value, { lang: $("c-lang").value, title: $("c-title").value, body: $("c-body").value })
        .then(function () { loadBlock(); say("c-msg", "Сохранено"); })
        .catch(function (e) { say("c-msg", errText(e), true); });
    });
  }

  function boot() {
    if (PAGE === "news") initNews();
    else if (PAGE === "content") initContent();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
