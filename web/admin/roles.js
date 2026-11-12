/* Экран «Роли и права»: матрица роль × право; менять может только superadmin. */
(function () {
  "use strict";
  var api = window.gosApi, data = null, canEdit = false;
  function esc(s) { return window.gosEsc ? window.gosEsc(s) : String(s); }
  function render() {
    var h = "<thead><tr><th>Право</th>";
    data.roles.forEach(function (r) { h += "<th>" + esc(r) + "</th>"; });
    h += "</tr></thead><tbody>";
    data.permissions.forEach(function (p) {
      h += "<tr><th scope=\"row\">" + esc(p) + "</th>";
      data.roles.forEach(function (r) {
        var on = data.matrix[r].indexOf(p) !== -1;
        var lock = !canEdit || (r === "superadmin" && p === "roles.manage");
        h += "<td><input type=\"checkbox\" data-r=\"" + esc(r) + "\" data-p=\"" + esc(p) + "\"" + (on ? " checked" : "") + (lock ? " disabled" : "") + " aria-label=\"" + esc(r + " " + p) + "\"></td>";
      });
      h += "</tr>";
    });
    document.getElementById("r-table").innerHTML = h + "</tbody>";
  }
  function load() {
    api.get("/api/auth/me").then(function (me) {
      canEdit = me.user.role === "superadmin";
      document.getElementById("r-note").textContent = canEdit ? "Отметьте права и нажмите «Сохранить»." : "Только просмотр: менять права может главный администратор.";
      document.getElementById("r-save").hidden = !canEdit;
      return api.get("/api/admin/roles");
    }).then(function (d) { data = d; render(); }).catch(function () {
      document.getElementById("main").innerHTML = "<div class=\"gos-state gos-state--forbidden\">Нет прав на просмотр этого раздела</div>";
    });
  }
  document.getElementById("r-save").addEventListener("click", function () {
    var m = {};
    data.roles.forEach(function (r) { m[r] = []; });
    document.querySelectorAll("#r-table input:checked").forEach(function (c) { m[c.dataset.r].push(c.dataset.p); });
    api.put("/api/admin/roles", { matrix: m }).then(function (d) {
      data = d; render(); document.getElementById("r-note").textContent = "Сохранено.";
    }).catch(function () { document.getElementById("r-note").textContent = "Не удалось сохранить."; });
  });
  load();
})();
