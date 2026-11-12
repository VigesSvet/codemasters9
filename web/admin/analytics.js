/* analytics.js - экран аналитики(ТЗ 5.8 Д). */
(function () {
  "use strict";
  var root = document.getElementById("an-root");
  if (!root) return;
  function esc(s) { return window.gosEsc ? window.gosEsc(s) : String(s); }
  function list(items, empty) {
    if (!items.length) return "<p>" + esc(empty) + "</p>";
    return '<table class="tbl"><tbody>' + items.map(function (r) {
      return "<tr><td>" + esc(r.query) + "</td><td>" + esc(r.n) + "</td></tr>";
    }).join("") + "</tbody></table>";
  }
  window.gosApi.get("/api/admin/analytics").then(function (r) {
    var a = r.assistant;
    root.innerHTML =
      "<p>" + esc(r.summary) + "</p>" +
      "<h3>Топ запросов</h3>" + list(r.top_queries, "Данных пока нет") +
      "<h3>Запросы без результатов</h3>" + list(r.empty_queries, "Нет") +
      "<h3>Помощник</h3><p>Источники: " + esc(a.source) + ", нет данных: " + esc(a.no_data) +
      ", ограничено: " + esc(a.restricted) + "</p>" +
      "<h3>Рекомендации</h3>" + (r.recommendations.length
        ? "<ul>" + r.recommendations.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>"
        : "<p>Нет</p>");
  }).catch(function (err) {
    if (err && err.status === 401) { location.replace("login.html"); return; }
    root.textContent = (err && (err.detail || err.message)) || "Ошибка загрузки";
  });
})();
