/* Экран «Пользователи»: смена роли, блокировка, мягкое удаление. */
(function () {
  "use strict";
  var api = window.gosApi, me = null, roles = [];
  function esc(s) { return window.gosEsc ? window.gosEsc(s) : String(s); }
  function msg(t) { document.getElementById("u-msg").textContent = t; }
  function render(list) {
    document.getElementById("u-table").innerHTML = list.map(function (u) {
      var self = u.id === me.id;
      var opts = roles.map(function (r) { return "<option" + (r === u.role ? " selected" : "") + ">" + esc(r) + "</option>"; }).join("");
      return "<tr><td>" + esc(u.username) + "</td><td>" + esc(u.display_name || "") + "</td>" +
        "<td><select class=\"inp\" data-act=\"role\" data-id=\"" + u.id + "\"" + (self ? " disabled" : "") + ">" + opts + "</select></td>" +
        "<td>" + (u.is_active ? "активен" : "заблокирован") + "</td>" +
        "<td><button class=\"btn warn\" type=\"button\" data-act=\"block\" data-id=\"" + u.id + "\" data-on=\"" + (u.is_active ? 0 : 1) + "\"" + (self ? " disabled" : "") + ">" + (u.is_active ? "Заблокировать" : "Разблокировать") + "</button> " +
        "<button class=\"btn danger\" type=\"button\" data-act=\"del\" data-id=\"" + u.id + "\"" + (self ? " disabled" : "") + ">Удалить</button></td></tr>";
    }).join("");
  }
  function fail(e) { msg(e && e.message ? e.message : "Ошибка"); load(); }
  function load() {
    api.get("/api/admin/users").then(render).catch(function () {
      document.getElementById("main").innerHTML = "<div class=\"gos-state gos-state--forbidden\">Нет прав на просмотр этого раздела</div>";
    });
  }
  document.getElementById("u-table").addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset.act !== "role") return;
    api.put("/api/admin/users/" + t.dataset.id, { role: t.value }).then(function () { msg("Роль изменена."); load(); }).catch(fail);
  });
  document.getElementById("u-table").addEventListener("click", function (e) {
    var t = e.target;
    if (t.dataset.act === "block") {
      api.put("/api/admin/users/" + t.dataset.id, { is_active: t.dataset.on === "1" }).then(function () { load(); }).catch(fail);
    } else if (t.dataset.act === "del" && window.confirm("Удалить пользователя?")) {
      api.del("/api/admin/users/" + t.dataset.id).then(function () { msg("Удалён."); load(); }).catch(fail);
    }
  });
  api.get("/api/auth/me").then(function (r) { me = r.user; return api.get("/api/admin/roles").catch(function () { return { roles: ["admin", "moderator", "editor", "branch_admin", "staff", "analyst"] }; }); })
    .then(function (r) { roles = r.roles; load(); });
})();
