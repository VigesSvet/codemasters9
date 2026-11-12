/* admin.js - логика админки Госархива ВКО(T5).
   Подключается после app.js на страницах web/admin/*. */
(function () {
  "use strict";

  var B = document.body.dataset.base || "";
  var PAGE = document.body.dataset.page || "";

  // ---------- i18n(app.js выставляет window.tr / window.gosX / window.trEls) ----------
  function L(ru, kk, en) { return window.tr ? window.tr(ru, kk, en) : ru; }
  function esc(s) { return window.gosEsc ? window.gosEsc(s) : String(s === null || s === undefined ? "" : s); }
  function X(ru, kk, en) { return window.gosX ? window.gosX(ru, kk, en) : '<span>' + esc(ru) + '</span>'; }

  // ---------- словари статусов ----------
  var STATUS_RU = {
    draft: "Черновик", review: "На проверке", needs_work: "Требует доработки",
    approved: "Одобрено", published: "Опубликовано", archived: "Архив"
  };
  var STATUS = {
    draft:      { kk: "Жоба", en: "Draft", cls: "" },
    review:     { kk: "Тексеруде", en: "Under review", cls: "rev" },
    needs_work: { kk: "Пысықтауды қажет етеді", en: "Needs work", cls: "fix" },
    approved:   { kk: "Мақұлданды", en: "Approved", cls: "ok" },
    published:  { kk: "Жарияланды", en: "Published", cls: "pub" },
    archived:   { kk: "Мұрағат", en: "Archived", cls: "arc" }
  };
  function statusName(s) {
    var x = STATUS[s];
    return L(STATUS_RU[s] || s, x ? x.kk : s, x ? x.en : s);
  }
  function statusBadge(s) {
    var x = STATUS[s];
    return '<span class="st ' + (x ? x.cls : "") + '">' + esc(statusName(s)) + "</span>";
  }

  var ROLE = {
    admin: ["Администратор", "Әкімші", "Administrator"],
    moderator: ["Модератор", "Модератор", "Moderator"],
    editor: ["Редактор", "Редактор", "Editor"],
    branch_admin: ["Администратор филиала", "Филиал әкімшісі", "Branch administrator"]
  };
  function roleName(r) { var x = ROLE[r]; return x ? L(x[0], x[1], x[2]) : esc(r); }

  // ---------- переходы статусов(зеркало workflow.py) ----------
  var TRANSITIONS = {
    draft: ["review"],
    review: ["approved", "needs_work"],
    needs_work: ["review"],
    approved: ["published", "needs_work"],
    published: ["archived"],
    archived: ["draft"]
  };
  var ACTION_FOR = { review: "submit", approved: "review", needs_work: "review", published: "publish", archived: "archive", draft: "archive" };
  function canAction(role, action) {
    if (role === "admin") return true;
    if (action === "submit") return role === "moderator" || role === "editor";
    if (action === "review" || action === "publish" || action === "archive") return role === "moderator";
    return false;
  }
  var TRANS_LABEL = {
    review: ["Отправить на проверку", "Тексеруге жіберу", "Submit for review"],
    approved: ["Одобрить", "Мақұлдау", "Approve"],
    needs_work: ["Вернуть на доработку", "Пысықтауға қайтару", "Return for revision"],
    published: ["Опубликовать на сайте", "Сайтта жариялау", "Publish on the site"],
    archived: ["В архив", "Мұрағатқа", "Archive"],
    draft: ["Вернуть в черновик", "Жобаға қайтару", "Return to draft"]
  };
  function allowedTransitions(status, role) {
    var targets = TRANSITIONS[status] || [];
    return targets.filter(function (to) { return canAction(role, ACTION_FOR[to]); });
  }

  // ---------- доступ к файлам ----------
  var ACCESS = {
    public: ["Открытый доступ", "Ашық қолжетімділік", "Public"],
    no_publish: ["Не публиковать", "Жарияламау", "Do not publish"],
    needs_check: ["Требует проверки", "Тексеруді қажет етеді", "Needs check"]
  };
  function accessName(a) { var x = ACCESS[a]; return x ? L(x[0], x[1], x[2]) : esc(a); }

  // ---------- уровни ----------
  var LEVEL = {
    fond: ["Фонд", "Қор", "Fonds"],
    opis: ["Опись", "Тізімдеме", "Inventory"],
    delo: ["Дело", "Іс", "File"],
    doc: ["Документ", "Құжат", "Document"]
  };
  function levelName(l) { var x = LEVEL[l]; return x ? L(x[0], x[1], x[2]) : esc(l); }

  // ---------- справочники типов и тем(общий словарь из api.js, не дублируем) ----------
  var TYPES = (window.gosLabels && window.gosLabels.types) || {};
  var THEMES = (window.gosLabels && window.gosLabels.themes) || {};

  var USER = null;

  // ---------- уведомление ----------
  function toast(msg, kind) {
    var t = document.querySelector(".toast");
    if (t) t.remove();
    t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.textContent = msg;
    t.setAttribute("role", "status");
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 4500);
  }

  function apiErrorText(err) {
    var s = err && err.status;
    var detail = (err && err.body && (err.body.detail || err.body.error)) || "";
    if (s === 401) return L("Требуется вход", "Кіру қажет", "Sign in required");
    if (s === 403) return L("Нет прав на это действие", "Бұл әрекетке құқық жоқ", "No permission for this action");
    if (s === 409) return L("Недопустимый переход", "Жол берілмейтін ауысу", "Invalid transition");
    if (s === 422) return L("Ошибка валидации", "Тексеру қатесі", "Validation error");
    if (s === 429) return L("Слишком много попыток, подождите", "Әрекеттер тым көп, күте тұрыңыз", "Too many attempts, please wait");
    if (s === 413) return L("Файл слишком большой", "Файл тым үлкен", "File too large");
    if (s === 404) return L("Не найдено", "Табылмады", "Not found");
    return String(detail) || L("Произошла ошибка", "Қате орын алды", "Something went wrong");
  }

  // сообщение сервера - простыми словами, чтобы сотрудник понял, что исправить
  function humanDetail(detail) {
    var s = String(detail || "");
    if (s.indexOf("Отсутствуют обязательные поля") !== -1) return L("Заполните обязательные поля", "Міндетті өрістерді толтырыңыз", "Fill in the required fields");
    if (s.indexOf("Такой code") !== -1) return L("Такой шифр уже существует", "Мұндай шифр бұрыннан бар", "This code already exists");
    if (s.indexOf("Версия устарела") !== -1) return L("Запись изменил другой сотрудник. Обновите страницу и повторите.", "Жазбаны басқа қызметкер өзгертті. Бетті жаңартып, қайталаңыз.", "Another user has changed this record. Reload the page and try again.");
    if (s.indexOf("Фонд не найден") !== -1) return L("Выберите фонд", "Қорды таңдаңыз", "Select a fonds");
    if (s.indexOf("Недопустимый переход") !== -1) return L("Это действие сейчас недоступно", "Бұл әрекет қазір қолжетімсіз", "This action is not available right now");
    if (s.indexOf("Недостаточно прав") !== -1) return L("Нет прав на это действие", "Бұл әрекетке құқық жоқ", "No permission for this action");
    return s;
  }

  function fmtTs(s) {
    if (!s) return "—";
    var t = String(s).trim();
    var d;
    if (t.indexOf("T") !== -1) {
      d = new Date(t);
    } else if (t.length >= 16) {
      // datetime('now') из SQLite - UTC без часового пояса, добавляем Z для локального времени
      d = new Date(t.replace(" ", "T") + "Z");
    } else {
      d = new Date(t);
    }
    if (isNaN(d.getTime())) return t.replace("T", " ").slice(0, 16);
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + d.getFullYear() + ", " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function humanSize(n) {
    n = Number(n) || 0;
    if (n >= 1048576) return (n / 1048576).toFixed(1) + " МБ";
    if (n >= 1024) return (n / 1024).toFixed(0) + " КБ";
    return n + " Б";
  }

  // ---------- шапка: имя/роль + выход ----------
  function fillHeader() {
    var u = document.getElementById("adm-user");
    if (u && USER) {
      u.textContent = L("Администрирование", "Әкімшілік", "Administration") + ": " + USER.display_name + ", " + roleName(USER.role);
    }
    var lg = document.getElementById("adm-logout");
    if (lg) lg.style.display = USER ? "" : "none";
  }
  function bindLogout() {
    var lg = document.getElementById("adm-logout");
    if (!lg) return;
    lg.addEventListener("click", function () {
      window.gosApi.post("/api/auth/logout", {}).then(function () {
        location.replace("login.html");
      }).catch(function () {
        location.replace("login.html");
      });
    });
  }

  // ---------- боковое меню по ролям ----------
  function renderNav() {
    var nav = document.getElementById("adm-nav");
    if (!nav) return;
    var role = USER ? USER.role : "";
    var h = "<h2>" + X("Разделы", "Бөлімдер", "Sections") + "</h2>";
    function a(href, cur, ru, kk, en) {
      h += '<a href="' + href + '"' + (cur ? ' aria-current="page"' : "") + ">" + X(ru, kk, en) + "</a>";
    }
    if (role !== "branch_admin") {
      a("index.html", PAGE === "index", "Материалы", "Материалдар", "Materials");
      a("delo-edit.html", PAGE === "delo", "Создать дело", "Іс қосу", "New file");
    }
    if (role === "admin" || role === "editor") a("import.html", PAGE === "import", "Импорт", "Импорт", "Import");
    if (role === "admin" || role === "branch_admin") a("filial.html", PAGE === "filial", "Филиалы", "Филиалдар", "Branches");
    if (role === "admin" || role === "moderator") a("audit.html", PAGE === "audit", "Журнал", "Әрекеттер журналы", "Audit log");
    a("../index.html", false, "На сайт", "Сайтқа", "To the site");
    nav.innerHTML = h;
    if (window.trEls) window.trEls(nav);
  }

  function requireRole(pageRoles) {
    if (pageRoles && USER && pageRoles.indexOf(USER.role) === -1) {
      var m = document.getElementById("main");
      if (m) {
        m.innerHTML = '<div class="gos-state gos-state--forbidden">' + esc(L("Нет прав на просмотр этого раздела", "Бұл бөлімді қарауға құқық жоқ", "No permission to view this section")) + "</div>";
      }
      return false;
    }
    return true;
  }

  // ---------- вход ----------
  function initLogin() {
    var form = document.getElementById("login-form");
    if (!form) return;
    window.gosApi.get("/api/auth/me").then(function () {
      location.replace("index.html");
    }).catch(function () {});
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = document.getElementById("login-error");
      var btn = form.querySelector("button[type=submit]");
      var u = document.getElementById("login-user").value.trim();
      var p = document.getElementById("login-pass").value;
      if (err) err.classList.remove("show");
      if (btn) btn.disabled = true;
      window.gosApi.post("/api/auth/login", { username: u, password: p }).then(function () {
        location.replace("index.html");
      }).catch(function (ex) {
        if (btn) btn.disabled = false;
        var msg;
        if (ex && ex.status === 401) msg = L("Неверный логин или пароль", "Логин немесе құпиясөз қате", "Incorrect login or password");
        else if (ex && ex.status === 429) msg = L("Слишком много попыток, подождите", "Әрекеттер тым көп, күте тұрыңыз", "Too many attempts, please wait");
        else msg = apiErrorText(ex);
        if (err) { err.textContent = msg; err.classList.add("show"); }
      });
    });
  }

  // ---------- материалы(очередь) ----------
  var idx = { status: "", branch: "", q: "", page: 1, total: 0, items: [], branches: [] };
  function idxQuery() {
    var p = { page: idx.page, per_page: 20 };
    if (idx.status) p.status = idx.status;
    if (idx.branch) p.branch = idx.branch;
    if (idx.q) p.q = idx.q;
    return p;
  }
  function renderIndex() {
    var tbody = document.getElementById("idx-table");
    if (!tbody) return;
    if (!idx.items.length) {
      tbody.innerHTML = '<tr><td colspan="5">' + esc(L("Ничего не найдено", "Ештеңе табылмады", "Nothing found")) + "</td></tr>";
    } else {
      var rows = "";
      idx.items.forEach(function (u) {
        var title = u.title_ru || u.title_kk || u.title_en || u.code || "";
        var author = u.author || "";
        rows += '<tr>' +
          '<td class="m" data-h="' + esc(L("Шифр", "Шифр", "Code")) + '">' + esc(u.code || "") + "</td>" +
          '<td data-h="' + esc(L("Название", "Атауы", "Title")) + '"><a href="delo-edit.html?id=' + esc(u.id) + '">' + esc(title) + "</a></td>" +
          '<td data-h="' + esc(L("Автор", "Автор", "Author")) + '">' + esc(author) + "</td>" +
          '<td class="m" data-h="' + esc(L("Обновлено", "Жаңартылды", "Updated")) + '">' + esc(fmtTs(u.updated_at)) + "</td>" +
          '<td data-h="' + esc(L("Статус", "Мәртебе", "Status")) + '">' + statusBadge(u.pub_status) + "</td>" +
          "</tr>";
      });
      tbody.innerHTML = rows;
    }
    var cnt = document.getElementById("idx-count");
    if (cnt) cnt.textContent = L("Всего", "Барлығы", "Total") + ": " + idx.total;
    renderPager("idx-pager", idx.page, idx.total, 20, function (p) { idx.page = p; loadIndex(); });
  }
  function loadIndex() {
    var tbody = document.getElementById("idx-table");
    if (tbody) tbody.innerHTML = '<tr><td colspan="5">' + esc(L("Загрузка…", "Жүктелуде…", "Loading…")) + "</td></tr>";
    window.gosApi.get("/api/admin/units", idxQuery()).then(function (res) {
      idx.total = res.total; idx.items = res.items; idx.page = res.page;
      renderIndex();
    }).catch(function (err) {
      if (err && err.status === 401) { location.replace("login.html"); return; }
      if (tbody) tbody.innerHTML = '<tr><td colspan="5">' + esc(apiErrorText(err)) + "</td></tr>";
    });
  }
  function initIndex() {
    window.gosApi.get("/api/admin/branches").then(function (res) {
      idx.branches = res || [];
      var sel = document.getElementById("f-branch");
      if (sel) {
        var opts = '<option value="">' + esc(L("Все филиалы", "Барлық филиалдар", "All branches")) + "</option>";
        idx.branches.forEach(function (b) {
          opts += '<option value="' + esc(b.id) + '">' + esc(b.name_ru || b.slug) + "</option>";
        });
        sel.innerHTML = opts;
        sel.value = idx.branch;
      }
    }).catch(function () {});
    var sel = document.getElementById("f-status");
    if (sel) {
      var sopt = '<option value="">' + esc(L("Все статусы", "Барлық мәртебелер", "All statuses")) + "</option>";
      Object.keys(STATUS_RU).forEach(function (k) {
        sopt += '<option value="' + esc(k) + '">' + esc(statusName(k)) + "</option>";
      });
      sel.innerHTML = sopt;
      sel.value = idx.status;
    }
    var apply = document.getElementById("idx-apply");
    if (apply) apply.addEventListener("click", function () {
      idx.status = (document.getElementById("f-status") || {}).value || "";
      idx.branch = (document.getElementById("f-branch") || {}).value || "";
      idx.q = (document.getElementById("f-q") || {}).value.trim() || "";
      idx.page = 1;
      loadIndex();
    });
    var q = document.getElementById("f-q");
    if (q) q.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); if (apply) apply.click(); }
    });
    loadIndex();
  }

  function renderPager(elId, page, total, perPage, go) {
    var el = document.getElementById(elId);
    if (!el) return;
    var pages = Math.max(1, Math.ceil(total / perPage));
    if (pages <= 1) { el.innerHTML = ""; return; }
    var h = "";
    var mk = function (p, label, dis, cur) {
      return '<button type="button"' + (dis ? " disabled" : "") + (cur ? ' class="cur"' : "") + ' data-p="' + p + '">' + esc(label) + "</button>";
    };
    h += mk(page - 1, "‹", page <= 1, false);
    for (var i = 1; i <= pages; i++) {
      if (pages > 7 && Math.abs(i - page) > 2 && i !== 1 && i !== pages) {
        if (i === 2 || i === pages - 1) h += '<span class="cnt">…</span>';
        continue;
      }
      h += mk(i, String(i), false, i === page);
    }
    h += mk(page + 1, "›", page >= pages, false);
    el.innerHTML = h;
    el.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { go(parseInt(b.dataset.p, 10)); });
    });
  }

  // ---------- карточка дела ----------
  var unit = null; var versions = []; var files = []; var fonds = [];
  var DELO_ID = new URLSearchParams(location.search).get("id");

  function fval(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function fint(id) { var v = fval(id); return v === "" ? null : parseInt(v, 10); }

  function markFields(fields) {
    var map = { code: "f-code", title_ru: "f-title-ru", title_kk: "f-title-kk", title_en: "f-title-en", level: "f-level", fond_id: "f-fond", fond_code: "f-fond", years: "f-years-from", years_from: "f-years-from", years_to: "f-years-to" };
    document.querySelectorAll("#ef .fld").forEach(function (f) { f.classList.remove("has-error"); });
    (fields || []).forEach(function (name) {
      var id = map[name];
      if (id) { var el = document.getElementById(id); if (el) { var f = el.closest(".fld"); if (f) f.classList.add("has-error"); } }
    });
  }

  function renderDeloStatus() {
    var box = document.getElementById("delo-status");
    if (!box || !unit) return;
    var cur = unit.pub_status;
    var last = versions.length ? versions[0] : null;
    var who = last ? (last.author_name || ("# " + last.author_id)) : (unit.status_changed_by ? ("# " + unit.status_changed_by) : "—");
    var when = last ? last.created_at : unit.status_changed_at;
    var html = '<div class="stbar"><span id="cur-status" class="st ' + (STATUS[cur] ? STATUS[cur].cls : "") + '">' + esc(statusName(cur)) + "</span>" +
      '<span class="meta">' + esc(L("Версия", "Нұсқа", "Version")) + " " + esc(unit.version) + "</span>" +
      '<span class="meta">' + esc(L("Сменил статус", "Мәртебені өзгертті", "Status changed by")) + ": " + esc(who) + " · " + esc(fmtTs(when)) + "</span></div>";
    html += '<div class="wf">';
    Object.keys(STATUS_RU).forEach(function (s) {
      html += '<span class="st ' + (STATUS[s] ? STATUS[s].cls : "") + (s === cur ? " cur" : "") + '">' + esc(statusName(s)) + "</span>";
      if (s !== "archived") html += " &rarr; ";
    });
    html += "</div>";
    var trans = allowedTransitions(cur, USER.role);
    html += '<div class="fld" style="margin-top:12px"><label for="delo-comment">' + esc(L("Комментарий к переходу", "Ауысуға түсініктеме", "Transition comment")) + '</label><input class="inp" id="delo-comment" maxlength="500"></div>';
    html += '<div class="trans" id="delo-trans">';
    if (!trans.length) {
      html += '<span class="meta">' + esc(L("Нет доступных переходов", "Қолжетімді ауысулар жоқ", "No available transitions")) + "</span>";
    }
    html += "</div>";
    box.innerHTML = html;
    var wrap = document.getElementById("delo-trans");
    trans.forEach(function (to) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn" + (to === "published" ? " warn" : "") + (to === "needs_work" ? " sec2" : "");
      b.textContent = L(TRANS_LABEL[to][0], TRANS_LABEL[to][1], TRANS_LABEL[to][2]);
      b.addEventListener("click", function () { doTransition(to); });
      wrap.appendChild(b);
    });
    if (USER.role === "admin") {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "btn danger";
      d.textContent = L("Удалить", "Жою", "Delete");
      d.addEventListener("click", function () { doDelete(); });
      wrap.appendChild(d);
    }
    renderDeloVersions();
  }

  function renderDeloVersions() {
    var el = document.getElementById("delo-versions");
    if (!el) return;
    if (!versions.length) {
      el.innerHTML = '<p class="file-hint">' + esc(L("История версий пуста", "Нұсқалар тарихы бос", "Version history is empty")) + "</p>";
      return;
    }
    var h = '<ul class="vh">';
    versions.forEach(function (v) {
      h += '<li><span class="vnum">v' + esc(v.version) + "</span>" + statusBadge(v.pub_status) +
        '<span class="vwho">' + esc(v.author_name || v.author_id || "—") + " · " + esc(fmtTs(v.created_at));
      if (v.reviewer_name) h += " · " + esc(L("согласующий", "келісуші", "reviewer")) + ": " + esc(v.reviewer_name);
      h += "</span>";
      if (v.comment) h += '<span class="vcom">' + esc(v.comment) + "</span>";
      h += "</li>";
    });
    h += "</ul>";
    el.innerHTML = h;
  }

  function doTransition(to) {
    var confirmNeeded = to === "published";
    if (confirmNeeded && !window.confirm(L("Опубликовать материал? Он станет виден в открытом каталоге.", "Материалды жариялайсыз ба? Ол ашық каталогта көрінеді.", "Publish the item? It will become visible in the public catalogue."))) return;
    var comment = fval("delo-comment");
    window.gosApi.post("/api/admin/units/" + unit.id + "/transition", { to: to, comment: comment }).then(function (res) {
      toast(L("Статус обновлён", "Мәртебе жаңартылды", "Status updated"), "ok");
      reloadDelo();
    }).catch(function (err) {
      toast(apiErrorText(err), "err");
    });
  }

  function doDelete() {
    if (!window.confirm(L("Удалить запись безвозвратно?", "Жазбаны қайтарымсыз жоясыз ба?", "Delete the record permanently?"))) return;
    window.gosApi.del("/api/admin/units/" + unit.id).then(function () {
      toast(L("Запись удалена", "Жазба жойылды", "Record deleted"), "ok");
      location.replace("index.html");
    }).catch(function (err) {
      toast(apiErrorText(err), "err");
    });
  }

  function renderDeloFiles() {
    var el = document.getElementById("delo-files");
    if (!el || !unit) return;
    var wrap = el.querySelector("#delo-file-list");
    if (!wrap) return;
    if (!files.length) {
      wrap.innerHTML = '<div class="file-empty">' + esc(L("Файлов нет", "Файлдар жоқ", "No files")) + "</div>";
    } else {
      var h = '<div class="flist">';
      files.forEach(function (f) {
        var dis = USER.role === "editor" ? " disabled" : "";
        h += '<div class="file-row">' +
          '<span class="nm">' + esc(f.filename || "") + "</span>" +
          '<span class="sz">' + esc(humanSize(f.size)) + "</span>" +
          '<select data-fid="' + esc(f.id) + '"' + dis + '>' +
          '<option value="public"' + (f.access === "public" ? " selected" : "") + ">" + esc(accessName("public")) + "</option>" +
          '<option value="no_publish"' + (f.access === "no_publish" ? " selected" : "") + ">" + esc(accessName("no_publish")) + "</option>" +
          '<option value="needs_check"' + (f.access === "needs_check" ? " selected" : "") + ">" + esc(accessName("needs_check")) + "</option>" +
          "</select>";
        if (f.uploader) h += '<span class="sz">' + esc(f.uploader) + "</span>";
        if (dis) h += '<span class="hint">' + esc(L("Доступ к файлу меняет модератор", "Файлға қолжетімділікті модератор өзгертеді", "File access is set by a moderator")) + "</span>";
        h += "</div>";
      });
      h += "</div>";
      wrap.innerHTML = h;
      wrap.querySelectorAll("select[data-fid]").forEach(function (s) {
        s.addEventListener("change", function () {
          var id = s.dataset.fid;
          var acc = s.value;
          window.gosApi.put("/api/admin/files/" + id + "/access", { access: acc }).then(function () {
            toast(L("Доступ к файлу обновлён", "Файлға қолжетімділік жаңартылды", "File access updated"), "ok");
          }).catch(function (err) {
            toast(apiErrorText(err), "err");
            reloadFiles();
          });
        });
      });
    }
  }

  function reloadFiles() {
    window.gosApi.get("/api/admin/units/" + unit.id + "/files").then(function (res) {
      files = res.items || [];
      renderDeloFiles();
    }).catch(function (err) {
      if (err && err.status === 401) location.replace("login.html");
    });
  }

  function bindFileUpload() {
    var inp = document.getElementById("file-input");
    var drop = document.getElementById("file-drop");
    if (!inp) return;
    function send() {
      // unit загружается асинхронно, поэтому проверяем здесь, а не при привязке
      if (!inp.files.length || !unit) return;
      var fd = new FormData();
      fd.append("file", inp.files[0]);
      if (drop) drop.classList.add("busy");
      window.gosApi.upload("/api/admin/units/" + unit.id + "/files", fd).then(function () {
        inp.value = "";
        if (drop) drop.classList.remove("busy");
        toast(L("Файл загружен", "Файл жүктелді", "File uploaded"), "ok");
        reloadFiles();
      }).catch(function (err) {
        if (drop) drop.classList.remove("busy");
        toast(apiErrorText(err), "err");
      });
    }
    inp.addEventListener("change", send);
    if (drop) {
      drop.addEventListener("dragover", function (e) { e.preventDefault(); });
      drop.addEventListener("drop", function (e) { e.preventDefault(); if (e.dataTransfer.files.length) { inp.files = e.dataTransfer.files; send(); } });
    }
  }

  function fillFonds() {
    window.gosApi.get("/api/catalog/fonds", { per_page: 50, page: 1 }).then(function (r1) {
      var all = r1.items || [];
      if (r1.total > all.length) {
        window.gosApi.get("/api/catalog/fonds", { per_page: 50, page: 2 }).then(function (r2) {
          all = all.concat(r2.items || []);
          all.sort(function (a, b) { return String(a.code).localeCompare(String(b.code)); });
          fillFondSelect(all);
        }).catch(function () { fillFondSelect(all); });
      } else {
        all.sort(function (a, b) { return String(a.code).localeCompare(String(b.code)); });
        fillFondSelect(all);
      }
    }).catch(function () {});
  }
  function fillFondSelect(list) {
    var sel = document.getElementById("f-fond");
    if (!sel) return;
    var opts = '<option value="">' + esc(L("Выберите фонд", "Қорды таңдаңыз", "Select fonds")) + "</option>";
    list.forEach(function (f) {
      opts += '<option value="' + esc(f.id) + '">' + esc((f.code || "") + " — " + (f.title && f.title.ru || "")) + "</option>";
    });
    sel.innerHTML = opts;
    if (unit) sel.value = String(unit.fond_id || "");
    else sel.value = "";
  }
  function fillBranches() {
    window.gosApi.get("/api/admin/branches").then(function (res) {
      var sel = document.getElementById("f-branch");
      if (!sel) return;
      var opts = '<option value="">' + esc(L("Не указан", "Көрсетілмеген", "Not set")) + "</option>";
      (res || []).forEach(function (b) {
        opts += '<option value="' + esc(b.id) + '">' + esc(b.name_ru || b.slug) + "</option>";
      });
      sel.innerHTML = opts;
      if (unit) sel.value = unit.branch_id ? String(unit.branch_id) : "";
    }).catch(function () {});
  }

  // выпадающие списки по кодам(тип, тема) - показываем названия, отправляем код
  function fillSelect(id, dict) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var cur = sel.value;
    var opts = '<option value="">' + esc(L("—", "—", "—")) + "</option>";
    Object.keys(dict).forEach(function (k) {
      var v = dict[k];
      var label = Array.isArray(v) ? L(v[0], v[1], v[2]) : String(v);
      opts += '<option value="' + esc(k) + '">' + esc(label) + "</option>";
    });
    sel.innerHTML = opts;
    sel.value = cur;
  }
  function fillCodeSelects() {
    fillSelect("f-doc-type", TYPES);
    fillSelect("f-theme", THEMES);
  }

  function renderDelo(edit) {
    var t = document.getElementById("delo-title");
    if (t) t.textContent = edit ? L("Редактирование дела", "Істі өңдеу", "Edit file") : L("Создание дела", "Іс құру", "New file");
    var ref = document.getElementById("delo-ref");
    if (ref) {
      ref.innerHTML = edit && unit ? ('<code>' + esc(unit.code || "") + "</code> " + statusBadge(unit.pub_status)) : "";
    }
    // поля, неизменяемые при редактировании
    ["f-code", "f-level", "f-fond"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.disabled = edit;
    });
    var statusBox = document.getElementById("delo-status-box");
    if (statusBox) statusBox.style.display = edit ? "" : "none";
    var filesBox = document.getElementById("delo-files");
    if (filesBox) filesBox.style.display = edit ? "" : "none";
    var delBtn = document.getElementById("del-btn");
    if (delBtn) delBtn.style.display = (edit && USER.role === "admin") ? "" : "none";
    if (edit && unit) {
      setVal("f-code", unit.code);
      setVal("f-level", unit.level);
      setVal("f-number", unit.number);
      setVal("f-years-from", unit.years_from);
      setVal("f-years-to", unit.years_to);
      setVal("f-extent", unit.extent);
      setVal("f-doc-type", unit.doc_type);
      setVal("f-place", unit.place);
      setVal("f-theme", unit.theme);
      setVal("f-author", unit.author);
      setVal("f-keywords", unit.keywords);
      setVal("f-lang", unit.lang);
      setVal("f-access-note", unit.access_note);
      setVal("f-title-ru", unit.title_ru);
      setVal("f-title-kk", unit.title_kk);
      setVal("f-title-en", unit.title_en);
    }
  }
  function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v == null ? "" : v; }

  function buildPayload(edit) {
    var p = {
      title_ru: fval("f-title-ru"),
      title_kk: fval("f-title-kk"),
      title_en: fval("f-title-en"),
      number: fval("f-number") || null,
      years_from: fint("f-years-from"),
      years_to: fint("f-years-to"),
      extent: fval("f-extent") || null,
      doc_type: fval("f-doc-type") || null,
      place: fval("f-place") || null,
      theme: fval("f-theme") || null,
      author: fval("f-author") || null,
      keywords: fval("f-keywords") || null,
      lang: fval("f-lang") || null,
      access_note: fval("f-access-note") || null,
      branch_id: fint("f-branch")
    };
    if (!edit) {
      p.code = fval("f-code");
      p.level = fval("f-level");
      p.fond_id = fint("f-fond");
    } else {
      p.version = unit.version;
    }
    return p;
  }

  function validateDelo(edit) {
    var missing = [];
    if (!edit) {
      if (!fval("f-code")) missing.push("code");
      if (!fval("f-level")) missing.push("level");
      if (!fval("f-fond")) missing.push("fond_id");
      if (!fint("f-years-from")) missing.push("years_from");
    }
    if (!fval("f-title-ru")) missing.push("title_ru");
    markFields(missing);
    return missing.length === 0;
  }

  function bindDeloForm() {
    var form = document.getElementById("ef");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var edit = !!unit;
      if (!validateDelo(edit)) { toast(L("Заполните обязательные поля", "Міндетті өрістерді толтырыңыз", "Fill in the required fields"), "err"); return; }
      var p = buildPayload(edit);
      var btn = document.getElementById("save-btn");
      if (btn) btn.disabled = true;
      var req = edit ? window.gosApi.put("/api/admin/units/" + unit.id, p) : window.gosApi.post("/api/admin/units", p);
      req.then(function (res) {
        if (btn) btn.disabled = false;
        toast(L("Сохранено", "Сақталды", "Saved"), "ok");
        if (!edit) location.replace("delo-edit.html?id=" + res.id);
        else reloadDelo();
      }).catch(function (err) {
        if (btn) btn.disabled = false;
        var detail = err && err.body && err.body.detail ? String(err.body.detail) : "";
        if (err && err.status === 422 && detail) {
          var m = detail.match(/Отсутствуют обязательные поля:\s*(.+)/);
          if (m) markFields(m[1].split(/,\s*/));
          else if (detail.indexOf("Такой code") !== -1) markFields(["code"]);
          else if (detail.indexOf("Фонд") !== -1) markFields(["fond_id"]);
        }
        toast(humanDetail(detail) || apiErrorText(err), "err");
      });
    });
  }

  function reloadDelo() {
    if (!DELO_ID) return;
    window.gosApi.get("/api/admin/units/" + DELO_ID).then(function (res) {
      unit = res;
      renderDelo(true);
      renderDeloStatus();
      window.gosApi.get("/api/admin/units/" + DELO_ID + "/versions").then(function (v) {
        versions = v.items || [];
        renderDeloStatus();
      }).catch(function () {});
      reloadFiles();
    }).catch(function (err) {
      if (err && err.status === 401) { location.replace("login.html"); return; }
      var m = document.getElementById("main");
      if (m) m.innerHTML = '<div class="gos-state gos-state--error">' + esc(apiErrorText(err)) + '</div><p><a class="btn" href="index.html">' + esc(L("Назад", "Артқа", "Back")) + "</a></p>";
    });
  }

  function initDelo() {
    var edit = !!DELO_ID;
    fillFonds();
    fillBranches();
    fillCodeSelects();
    renderDelo(edit);
    bindDeloForm();
    bindFileUpload();
    if (edit) reloadDelo();
  }

  // ---------- импорт ----------
  var IMPORT_FIELDS = [
    ["code", "Шифр", "Шифр", "Code"],
    ["fond_code", "Фонд", "Қор", "Fonds"],
    ["opis_no", "Опись", "Тізімдеме", "Inventory"],
    ["delo_no", "Номер дела", "Іс нөмірі", "File number"],
    ["title_ru", "Название (RU)", "Атауы (RU)", "Title (RU)"],
    ["title_kk", "Название (KZ)", "Атауы (KZ)", "Title (KZ)"],
    ["title_en", "Название (EN)", "Атауы (EN)", "Title (EN)"],
    ["years", "Годы", "Жылдар", "Years"],
    ["years_from", "Год начала", "Бастапқы жыл", "Start year"],
    ["years_to", "Год конца", "Соңғы жыл", "End year"],
    ["doc_type", "Вид документа", "Құжат түрі", "Document type"],
    ["place", "Место", "Орын", "Place"],
    ["author", "Автор", "Автор", "Author"],
    ["keywords", "Ключевые слова", "Кілт сөздер", "Keywords"],
    ["lang", "Язык", "Тіл", "Language"]
  ];
  var imp = null;

  function currentMapping() {
    var m = {};
    document.querySelectorAll("#imp-mapping select[data-field]").forEach(function (s) {
      if (s.value) m[s.dataset.field] = s.value;
    });
    return m;
  }

  function renderMapping(columns, suggested) {
    var el = document.getElementById("imp-mapping");
    if (!el) return;
    var h = "";
    IMPORT_FIELDS.forEach(function (f) {
      var field = f[0];
      var opts = '<option value="">' + esc(L("— не выбрано —", "— таңдалмаған —", "— none —")) + "</option>";
      columns.forEach(function (c) {
        opts += '<option value="' + esc(c) + '"' + ((suggested[field] === c) ? " selected" : "") + ">" + esc(c) + "</option>";
      });
      h += '<div class="fld"><label>' + esc(L(f[1], f[2], f[3])) + '</label><select data-field="' + esc(field) + '">' + opts + "</select></div>";
    });
    el.innerHTML = h;
  }

  function renderPreview() {
    var box = document.getElementById("imp-preview");
    if (!box) return;
    box.style.display = "";
    renderMapping(imp.columns, imp.mapping_suggested || {});
    // таблица предпросмотра
    var t = document.getElementById("imp-preview-table");
    if (t) {
      var head = "<tr>";
      IMPORT_FIELDS.forEach(function (f) { head += "<th>" + esc(L(f[1], f[2], f[3])) + "</th>"; });
      head += "</tr>";
      var body = "";
      (imp.rows_preview || []).forEach(function (row) {
        body += "<tr>";
        IMPORT_FIELDS.forEach(function (f) { body += "<td>" + esc(row[f[0]] == null ? "" : row[f[0]]) + "</td>"; });
        body += "</tr>";
      });
      t.innerHTML = "<thead>" + head + "</thead><tbody>" + body + "</tbody>";
    }
    var err = document.getElementById("imp-errors");
    if (err) {
      var items = imp.errors || [];
      err.innerHTML = "<h3>" + esc(L("Ошибки", "Қателер", "Errors")) + " (" + items.length + ")</h3>" +
        (items.length ? '<ul class="imp-errors">' + items.map(function (e) {
          return "<li>" + esc(L("Строка", "Жол", "Row")) + " " + esc(e.row) + ": " + esc(e.field || "") + " — " + esc(e.message || "") + "</li>";
        }).join("") + "</ul>" : '<p class="file-hint">' + esc(L("Ошибок нет", "Қателер жоқ", "No errors")) + "</p>");
    }
    var dup = document.getElementById("imp-dups");
    if (dup) {
      var d = imp.duplicates || [];
      dup.innerHTML = "<h3>" + esc(L("Дубликаты", "Қайталанулар", "Duplicates")) + " (" + d.length + ")</h3>" +
        (d.length ? '<ul class="imp-dups">' + d.map(function (x) {
          return "<li>" + esc(L("Строка", "Жол", "Row")) + " " + esc(x.row) + ": " + esc(x.code || "") + (x.existing_id ? " (id=" + esc(x.existing_id) + ")" : "") + "</li>";
        }).join("") + "</ul>" : '<p class="file-hint">' + esc(L("Дубликатов нет", "Қайталанулар жоқ", "No duplicates")) + "</p>");
    }
    var cnt = document.getElementById("imp-total");
    if (cnt) cnt.textContent = L("Строк всего", "Барлық жолдар", "Total rows") + ": " + imp.total;
  }

  function bindImport() {
    var inp = document.getElementById("imp-file");
    var btn = document.getElementById("imp-upload-btn");
    if (!inp) return;
    function send() {
      if (!inp.files.length) return;
      var fd = new FormData();
      fd.append("file", inp.files[0]);
      if (btn) btn.disabled = true;
      window.gosApi.upload("/api/admin/import/preview", fd).then(function (res) {
        if (btn) btn.disabled = false;
        imp = res;
        renderPreview();
      }).catch(function (err) {
        if (btn) btn.disabled = false;
        toast(apiErrorText(err), "err");
      });
    }
    if (btn) btn.addEventListener("click", send);
    inp.addEventListener("change", send);
    var apply = document.getElementById("imp-apply");
    if (apply) apply.addEventListener("click", function () {
      if (!imp) return;
      if (!window.confirm(L("Применить импорт? Строки будут созданы как черновики.", "Импортты қолданасыз ба? Жолдар жоба ретінде жасалады.", "Apply the import? Rows will be created as drafts."))) return;
      apply.disabled = true;
      window.gosApi.post("/api/admin/import/" + imp.job_id + "/apply", { mapping: currentMapping() }).then(function (res) {
        apply.disabled = false;
        var el = document.getElementById("imp-result");
        if (el) {
          el.innerHTML = '<div class="imp-box"><h3>' + esc(L("Итог импорта", "Импорт нәтижесі", "Import result")) + "</h3>" +
            '<p class="imp-summary">' + esc(L("Вставлено", "Қосылды", "Inserted")) + ": " + esc(res.inserted) + " · " +
            esc(L("Пропущено", "Өткізілді", "Skipped")) + ": " + esc(res.skipped) + " · " +
            esc(L("Ошибок", "Қателер", "Errors")) + ": " + esc((res.errors || []).length) + "</p>";
          if (res.errors && res.errors.length) {
            el.innerHTML += '<ul class="imp-errors">' + res.errors.map(function (e) {
              return "<li>" + esc(L("Строка", "Жол", "Row")) + " " + esc(e.row) + ": " + esc(e.message || "") + "</li>";
            }).join("") + "</ul>";
          }
          el.innerHTML += "</div>";
        }
        toast(L("Импорт применён", "Импорт қолданылды", "Import applied"), "ok");
      }).catch(function (err) {
        apply.disabled = false;
        toast(apiErrorText(err), "err");
      });
    });
  }

  // ---------- филиалы ----------
  var branches = []; var selBranch = null;
  function renderFilial() {
    var sel = document.getElementById("fil-select");
    var isBranchAdmin = USER.role === "branch_admin";
    if (sel) sel.style.display = isBranchAdmin ? "none" : "";
    var box = document.getElementById("fil-403");
    if (box) box.style.display = "none";
    var form = document.getElementById("fil-form");
    if (isBranchAdmin) {
      var own = null;
      branches.forEach(function (b) { if (b.id === USER.branch_id) own = b; });
      if (!own) { if (form) form.style.display = "none"; return; }
      // если ?id задан и это чужой филиал - показать 403
      var qid = new URLSearchParams(location.search).get("id");
      if (qid && String(qid) !== String(own.id)) {
        if (box) { box.style.display = ""; box.textContent = L("Нет прав на редактирование этого филиала", "Бұл филиалды өңдеуге құқық жоқ", "No permission to edit this branch"); }
        if (form) form.style.display = "none";
        return;
      }
      selBranch = own;
      fillBranchForm(own);
    } else {
      if (form) form.style.display = "";
      if (!selBranch && branches.length) selBranch = branches[0];
      if (!selBranch) return;
      fillBranchForm(selBranch);
    }
  }
  function fillBranchForm(b) {
    var name = document.getElementById("fil-name");
    if (name) name.textContent = (b.name_ru || b.slug || "");
    var map = {
      "b-phones": b.phones, "b-email": b.email,
      "b-hours-ru": b.hours_ru, "b-hours-kk": b.hours_kk, "b-hours-en": b.hours_en,
      "b-addr-ru": b.address_ru, "b-addr-kk": b.address_kk, "b-addr-en": b.address_en,
      "b-lat": b.lat, "b-lon": b.lon, "b-head": b.head, "b-note": b.note
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = map[id] == null ? "" : map[id];
    });
  }
  function initFilial() {
    window.gosApi.get("/api/admin/branches").then(function (res) {
      branches = res || [];
      var sel = document.getElementById("fil-select");
      if (sel) {
        var opts = "";
        branches.forEach(function (b) {
          opts += '<option value="' + esc(b.id) + '">' + esc(b.name_ru || b.slug) + "</option>";
        });
        sel.innerHTML = opts;
        if (branches.length) selBranch = branches[0];
        sel.value = String(selBranch.id);
        sel.addEventListener("change", function () {
          selBranch = branches.find(function (b) { return String(b.id) === sel.value; }) || null;
          renderFilial();
        });
      }
      renderFilial();
    }).catch(function (err) {
      if (err && err.status === 401) location.replace("login.html");
    });
    var save = document.getElementById("fil-save");
    if (save) save.addEventListener("click", function () {
      if (!selBranch) return;
      var body = {
        phones: fval("b-phones"), email: fval("b-email"),
        hours_ru: fval("b-hours-ru"), hours_kk: fval("b-hours-kk"), hours_en: fval("b-hours-en"),
        address_ru: fval("b-addr-ru"), address_kk: fval("b-addr-kk"), address_en: fval("b-addr-en"),
        lat: fval("b-lat") === "" ? null : parseFloat(fval("b-lat")),
        lon: fval("b-lon") === "" ? null : parseFloat(fval("b-lon")),
        head: fval("b-head"), note: fval("b-note")
      };
      window.gosApi.put("/api/admin/branches/" + selBranch.id, body).then(function (res) {
        toast(L("Сохранено", "Сақталды", "Saved"), "ok");
        selBranch = res;
        fillBranchForm(res);
      }).catch(function (err) {
        toast(apiErrorText(err), "err");
      });
    });
  }

  // ---------- журнал ----------
  var aud = { user: "", action: "", object_type: "", result: "", page: 1, total: 0, items: [] };
  function renderAudit() {
    var tbody = document.getElementById("audit-table");
    if (!tbody) return;
    var resName = { ok: ["OK", "OK", "OK"], denied: ["Отказано", "Бас тартылды", "Denied"], error: ["Ошибка", "Қате", "Error"] };
    if (!aud.items.length) {
      tbody.innerHTML = '<tr><td colspan="6">' + esc(L("Записей нет", "Жазбалар жоқ", "No records")) + "</td></tr>";
    } else {
      var h = "";
      aud.items.forEach(function (r) {
        var rn = resName[r.result] || [r.result, r.result, r.result];
        h += '<tr>' +
          '<td class="m" data-h="' + esc(L("Время", "Уақыт", "Time")) + '">' + esc(fmtTs(r.ts)) + "</td>" +
          '<td data-h="' + esc(L("Пользователь", "Пайдаланушы", "User")) + '">' + esc(r.username || ("#" + r.user_id)) + "</td>" +
          '<td data-h="' + esc(L("Действие", "Әрекет", "Action")) + '">' + esc(r.action || "") + "</td>" +
          '<td class="obj" data-h="' + esc(L("Объект", "Нысан", "Object")) + '">' + esc((r.object_type || "") + " " + (r.object_id || "")) + "</td>" +
          '<td data-h="' + esc(L("Результат", "Нәтиже", "Result")) + '"><span class="res res-' + esc(r.result) + '">' + esc(L(rn[0], rn[1], rn[2])) + "</span></td>" +
          "</tr>";
      });
      tbody.innerHTML = h;
    }
    var cnt = document.getElementById("audit-count");
    if (cnt) cnt.textContent = L("Всего", "Барлығы", "Total") + ": " + aud.total;
    renderPager("audit-pager", aud.page, aud.total, 20, function (p) { aud.page = p; loadAudit(); });
  }
  function loadAudit() {
    var tbody = document.getElementById("audit-table");
    if (tbody) tbody.innerHTML = '<tr><td colspan="6">' + esc(L("Загрузка…", "Жүктелуде…", "Loading…")) + "</td></tr>";
    var p = { page: aud.page, per_page: 20 };
    if (aud.user) p.user = aud.user;
    if (aud.action) p.action = aud.action;
    if (aud.object_type) p.object_type = aud.object_type;
    if (aud.result) p.result = aud.result;
    window.gosApi.get("/api/admin/audit", p).then(function (res) {
      aud.total = res.total; aud.items = res.items; aud.page = res.page;
      renderAudit();
    }).catch(function (err) {
      if (err && err.status === 401) { location.replace("login.html"); return; }
      if (tbody) tbody.innerHTML = '<tr><td colspan="6">' + esc(apiErrorText(err)) + "</td></tr>";
    });
  }
  function initAudit() {
    var apply = document.getElementById("a-apply");
    if (apply) apply.addEventListener("click", function () {
      aud.user = fval("a-user");
      aud.action = fval("a-action");
      aud.object_type = fval("a-object-type");
      aud.result = (document.getElementById("a-result") || {}).value || "";
      aud.page = 1;
      loadAudit();
    });
    loadAudit();
  }

  // ---------- демо-пароль(SEC-08) ----------
  // сервер сообщает, что вход выполнен с общим паролем seed - его нельзя оставлять на проде
  function showDefaultPasswordBanner() {
    var m = document.getElementById("main");
    if (!m || document.getElementById("adm-default-pass")) return;
    var d = document.createElement("div");
    d.id = "adm-default-pass";
    d.className = "gos-state gos-state--error";
    d.setAttribute("role", "alert");
    d.textContent = L(
      "Демо-пароль: смените перед развёртыванием",
      "Демо-құпиясөз: орналастыру алдында ауыстырыңыз",
      "Demo password: change it before deployment"
    );
    m.insertBefore(d, m.firstChild);
  }

  // ---------- загрузка ----------
  function boot() {
    if (PAGE === "login") { initLogin(); return; }
    window.gosApi.get("/api/auth/me").then(function (res) {
      USER = res.user;
      if (res.password_is_default) showDefaultPasswordBanner();
      fillHeader();
      bindLogout();
      renderNav();
      if (PAGE === "index") initIndex();
      else if (PAGE === "delo") initDelo();
      else if (PAGE === "import") bindImport();
      else if (PAGE === "filial") initFilial();
      else if (PAGE === "audit") initAudit();
    }).catch(function (err) {
      if (err && err.status === 401) { location.replace("login.html"); return; }
      var m = document.getElementById("main");
      if (m) m.innerHTML = '<div class="gos-state gos-state--error">' + esc(apiErrorText(err)) + "</div>";
    });
  }

  // перерисовка динамики при смене языка
  window.onLang = function () {
    fillHeader();
    if (PAGE === "index") renderIndex();
    else if (PAGE === "delo") { fillCodeSelects(); if (unit) renderDelo(!!DELO_ID); renderDeloStatus(); renderDeloFiles(); }
    else if (PAGE === "import") { if (imp) renderPreview(); }
    else if (PAGE === "filial") { renderFilial(); }
    else if (PAGE === "audit") { renderAudit(); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
