/* Карточки единицы хранения(delo.html) и фонда(fond.html) на API.
   Данные: /api/catalog/units/{id} и /api/catalog/fonds/{id}(+inventories); при недоступном API или отсутствии записи - понятное состояние. */
(function () {
  "use strict";
  var B = document.body.dataset.base || "";
  var KIND = document.body.dataset.card || "unit";
  var id = (new URLSearchParams(location.search)).get("id");

  function esc(s) { return window.gosEsc ? window.gosEsc(s) : String(s === null || s === undefined ? "" : s); }
  function lang() { return (window.getLang && window.getLang()) || "ru"; }
  function t(ru, kk, en) { return (window.tr && window.tr(ru, kk, en)) || ru; }
  // локализованное поле: {ru,kk,en}, либо строка, либо key_ru/key_kk/key_en
  function field(obj, key) {
    if (!obj) return "";
    var v = obj[key];
    if (v !== null && v !== undefined) {
      if (typeof v === "object") { var l = lang(); return v[l] || v.ru || v.kk || v.en || ""; }
      return String(v);
    }
    var l = lang();
    return obj[key + "_" + l] || obj[key + "_ru"] || obj[key + "_kk"] || obj[key + "_en"] || "";
  }
  function years(obj) {
    var a = obj && obj.years;
    if (a && a.length) return a;
    if (obj && (obj.years_from !== undefined || obj.years_to !== undefined)) return [obj.years_from, obj.years_to];
    return [];
  }
  function yrStr(obj) {
    var y = years(obj);
    if (y.length >= 2 && y[0] === y[1]) return String(y[0]);
    if (y.length >= 2) return (y[0] || "") + "-" + (y[1] || "");
    if (y.length === 1) return String(y[0]);
    return "";
  }
  function fmtSize(n) {
    n = +n || 0;
    if (n >= 1048576) return (n / 1048576).toFixed(1) + " МБ";
    if (n >= 1024) return Math.round(n / 1024) + " КБ";
    return n + " Б";
  }
  // мини-markdown: сначала экранируем, затем жирный/курсив/абзацы/переносы
  function md(s) {
    if (!s) return "";
    s = esc(String(s));
    var paras = s.split(/\n[ \t]*\n+/);
    return paras.map(function (p) {
      p = p.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
      p = p.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
      p = p.replace(/\n/g, "<br>");
      return "<p>" + p + "</p>";
    }).join("");
  }
  // описание с заглушкой, если оно не заполнено
  function descHtml(text) {
    var d = md(text);
    if (d) return d;
    return '<p class="desc-empty">' + t("Описание готовится", "Сипаттама дайындалуда", "Description is being prepared") + "</p>";
  }
  // код типа документа → локальный текст
  function typeLabel(code) {
    var L = (window.gosLabels && window.gosLabels.types) || {};
    var v = L[code];
    if (!v) return code || "";
    return t(v[0], v[1], v[2]);
  }
  var LEVELS = {
    fond: ["ФОНД", "ҚОР", "FONDS"],
    opis: ["ОПИСЬ", "ТІЗІМДЕМЕ", "INVENTORY"],
    delo: ["ДЕЛО", "ІС", "FILE"],
    doc: ["ДОКУМЕНТ", "ҚҰЖАТ", "ITEM"]
  };
  var CHIP = {
    fond: ["Фонд", "Қор", "Fonds"],
    opis: ["Опись", "Тізімдеме", "Inventory"],
    delo: ["Дело", "Іс", "File"],
    doc: ["Документ", "Құжат", "Item"]
  };

  var root = document.getElementById("card") || document.getElementById("main");
  function show(html) { root.innerHTML = html; window.trEls && window.trEls(root); }

  function demoHint() {
    return '<div class="sbox" style="text-align:center">' +
      "<p style='margin:0 0 12px'>" + t("Карточка открывается по ссылке из каталога или по прямой ссылке с идентификатором записи.", "Карточка каталогтан сілтеме немесе жазба идентификаторы бар тікелей сілтеме арқылы ашылады.", "This page opens from the catalogue or via a direct link with a record identifier.") + "</p>" +
      '<a class="btn" href="' + B + 'katalog.html">' + t("Перейти в каталог", "Каталогқа өту", "Go to the catalogue") + "</a>" +
      "</div>";
  }

  function notFound() {
    return '<div class="gos-state gos-state--empty">' +
      "<p style='margin:0 0 8px'><b>" + t("Запись не найдена или недоступна.", "Жазба табылмады немесе қолжетімсіз.", "The record was not found or is unavailable.") + "</b></p>" +
      "<p style='margin:0'>" + t("Возможно, она ещё не опубликована или доступ ограничен.", "Мүмкін, ол әлі жарияланбаған немесе қолжетімділік шектелген.", "It may not be published yet or access may be restricted.") + "</p>" +
      '<a href="' + B + 'katalog.html">' + t("Вернуться в каталог", "Каталогқа оралу", "Back to the catalogue") + "</a></div>";
  }

  function crumbsUnit(u) {
    var h = '<ol aria-label="' + t("Вы здесь", "Сіз осындасыз", "You are here") + '"><li><a href="' + B + 'index.html">' + t("Главная", "Басты бет", "Home") + '</a></li><li><a href="' + B + 'katalog.html">' + t("Каталог", "Каталог", "Catalogue") + "</a></li>";
    var f = u.parents && u.parents.fond, inv = u.parents && u.parents.inventory;
    var fcode = f ? (f.code || f.fond_code || ("Ф. " + (f.id || ""))) : "";
    var fid = f ? f.id : null;
    if (f) h += '<li><a href="' + B + 'fond.html?id=' + encodeURIComponent(fid) + '"><span class="lv">' + t("ФОНД", "ҚОР", "FONDS") + "</span>" + esc(fcode) + "</a></li>";
    if (inv) {
      var n = inv.number || inv.id || "";
      h += '<li><a href="' + B + 'fond.html?id=' + encodeURIComponent(fid) + '#opisi"><span class="lv">' + t("ОПИСЬ", "ТІЗІМДЕМЕ", "INV.") + "</span>" + t("Оп.", "Оп.", "Inv.") + " " + esc(n) + "</a></li>";
    }
    h += '<li aria-current="page"><span class="lv">' + t("ДЕЛО", "ІС", "FILE") + "</span>" + esc(u.code || "") + "</li></ol>";
    return h;
  }

  function refLine(code, full) {
    return '<p class="ref"><span>' + t("Шифр:", "Шифр:", "Reference:") + '</span> <code>' + esc(code || "") + "</code>" +
      '<button data-copy="' + esc(code || "") + '">' + t("Копировать шифр", "Шифрді көшіру", "Copy reference") + "</button>" +
      (full ? '<button data-copy="' + esc(location.href) + '">' + t("Поделиться ссылкой", "Сілтемемен бөлісу", "Share link") + "</button>" : "") + "</p>";
  }

  // список файлов: скачивание, если разрешено, иначе блок недоступности
  function filesBlock(u) {
    var files = u.files || [];
    if (!files.length) return "";
    var h = '<section class="full" id="files"><h2>' + t("Файлы и цифровые копии", "Файлдар мен цифрлық көшірмелер", "Files and digital copies") + "</h2><ul style='list-style:none;margin:12px 0 0;padding:0'>";
    files.forEach(function (f) {
      var name = esc(f.filename || ("Файл #" + f.id));
      var meta = f.mime ? esc(f.mime) : "";
      if (f.size) meta += (meta ? " · " : "") + fmtSize(f.size);
      if (f.downloadable) {
        h += '<li style="border:1px solid var(--line);padding:12px 16px;margin:0 0 8px;background:var(--surface);display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center">' +
          "<span style='flex:1;min-width:200px'><b>" + name + "</b>" + (meta ? "<br><span style='font:400 13px var(--font-mono);color:var(--text-muted)'>" + meta + "</span>" : "") + "</span>" +
          '<a class="btn sm" href="' + B + 'api/files/' + encodeURIComponent(f.id) + '/download" download>' + t("Скачать", "Жүктеу", "Download") + "</a></li>";
      } else {
        h += '<li style="border:1px solid var(--line);padding:12px 16px;margin:0 0 8px;background:var(--surface)"><b>' + name + "</b>" + (meta ? "<span style='font:400 13px var(--font-mono);color:var(--text-muted)'> · " + meta + "</span>" : "") +
          '<div class="unavail"><b>' + t("Материал недоступен онлайн.", "Материал онлайн қолжетімсіз.", "The material is not available online.") + "</b> " +
          t("Условия доступа:", "Қолжетімділік шарттары:", "Access terms:") + ' <a href="' + B + 'nedostupno.html?id=' + encodeURIComponent(u.id) + '">' + t("подробнее", "толығырақ", "details") + "</a></div></li>";
      }
    });
    h += "</ul></section>";
    return h;
  }

  // просмотр изображений: листание доступных image/*
  var curImgs = [];
  function viewer(u) {
    curImgs = (u.files || []).filter(function (f) { return f.downloadable && /^image\//.test(f.mime || ""); });
    if (!curImgs.length) return "";
    var src = B + "api/files/" + encodeURIComponent(curImgs[0].id) + "/download";
    var h = '<div class="work"><div class="viewer"><div class="vbar"><span id="vl">' + t("Файл ", "Файл ", "File ") + "1 / " + curImgs.length + "</span>" +
      '<button class="btn" type="button" id="vz">' + t("Увеличить", "Үлкейту", "Enlarge") + "</button></div>" +
      '<div class="vstage"><img id="vimg" src="' + esc(src) + '" alt="' + esc(curImgs[0].filename || "") + '"></div>' +
      '<div class="vfoot"><button class="btn sm" id="vp" style="background:#fff;color:#010101;border-color:#fff" aria-label="' + t("Предыдущий", "Алдыңғы", "Previous") + '">&larr;</button><span id="vn">1</span> / ' + curImgs.length +
      '<button class="btn sm" id="vx" style="background:#fff;color:#010101;border-color:#fff" aria-label="' + t("Следующий", "Келесі", "Next") + '">&rarr;</button></div></div><div class="viewer-note"></div></div>';
    return h;
  }
  function bindViewer() {
    var vp = document.getElementById("vp"), vx = document.getElementById("vx"), vz = document.getElementById("vz");
    var vimg = document.getElementById("vimg"), vn = document.getElementById("vn"), vl = document.getElementById("vl");
    if (!vp || !vx || !curImgs.length) return;
    var i = 0;
    function upd() {
      vn.textContent = i + 1;
      vl.textContent = t("Файл ", "Файл ", "File ") + (i + 1) + " / " + curImgs.length;
      vimg.src = B + "api/files/" + encodeURIComponent(curImgs[i].id) + "/download";
      vimg.alt = curImgs[i].filename || "";
    }
    vp.onclick = function () { i = i > 0 ? i - 1 : curImgs.length - 1; upd(); };
    vx.onclick = function () { i = i < curImgs.length - 1 ? i + 1 : 0; upd(); };
    vz.onclick = function (e) { e.preventDefault(); vimg.style.objectFit = vimg.style.objectFit === "contain" ? "cover" : "contain"; };
  }

  function renderUnit(u) {
    var lv = LEVELS[u.level] ? t.apply(null, LEVELS[u.level]) : (u.level || "");
    var chip = CHIP[u.level] ? t.apply(null, CHIP[u.level]) : (u.level || "");
    var hasFile = !!(u.files || []).some(function (f) { return f.downloadable; }) || u.has_public_file;
    var status = hasFile
      ? '<span class="status" style="color:var(--level);border-color:var(--level)">' + t("Оцифровано, открыто", "Цифрландырылған, ашық", "Digitised, open") + "</span>"
      : '<span class="status">' + t("Доступ ограничен", "Қолжетімділік шектеулі", "Restricted access") + "</span>";
    var yr = yrStr(u);
    var branch = u.branch && u.branch.name ? esc(u.branch.name) : "";
    var demo = u.is_demo ? '<span class="tag demo">' + t("Образец записи", "Жазба үлгісі", "Sample record") + "</span>" : "";
    var crumbsEl = document.querySelector(".crumbs ol") || document.querySelector("#crumbs");
    var h = "";
    if (crumbsEl) crumbsEl.outerHTML = crumbsUnit(u);
    h += '<span class="chip">' + esc(chip) + "</span>" + status + demo +
      '<h1 style="margin-top:12px">' + esc(field(u, "title")) + "</h1>" +
      refLine(u.code || "", true) +
      '<div class="two">' +
      '<section class="box"><h2>' + t("О чём дело", "Іс не туралы", "What is it about?") + "</h2>" + descHtml(field(u, "description")) + "</section>" +
      '<section class="box"><h2>' + t("Как ознакомиться", "Қалай танысуға болады", "How to view it") + "</h2><p>" +
      (hasFile ? t("Скан доступен онлайн без регистрации.", "Скан онлайн тіркеусіз қолжетімді.", "The scan is available online without registration.") : t("Скан онлайн недоступен. Подлинник выдаётся в читальном зале.", "Скан онлайн қолжетімсіз. Түпнұсқа оқу залында беріледі.", "The scan is not online. The original is consulted in the reading room.")) +
      ' <a href="' + B + 'ob-arhive.html#reading">' + t("Читальный зал", "Оқу залы", "Reading room") + "</a>.</p></section></div>" +
      viewer(u) +
      '<div class="meta" style="margin-top:24px">' +
      (yr ? "<span><b>" + t("Даты:", "Күндер:", "Dates:") + "</b> " + esc(yr) + "</span>" : "") +
      (u.doc_type ? "<span><b>" + t("Тип:", "Түрі:", "Type:") + "</b> " + esc(typeLabel(u.doc_type)) + "</span>" : "") +
      (u.extent ? "<span><b>" + t("Объём:", "Көлемі:", "Extent:") + "</b> " + esc(u.extent) + "</span>" : "") +
      (branch ? "<span><b>" + t("Хранится:", "Сақталады:", "Held by:") + "</b> " + branch + "</span>" : "") +
      "</div>" +
      filesBlock(u) +
      '<section class="rel"><h2>' + t("Иерархия каталога", "Каталог иерархиясы", "Catalogue hierarchy") + "</h2><div class='in' style='margin-top:12px'>" +
      hierarchyUnit(u) + "</div></section>" +
      '<div style="height:32px"></div>';
    show(h);
    bindViewer();
    window.onLang = function () { if (lastUnit) renderUnit(lastUnit); };
  }

  function hierarchyUnit(u) {
    var f = u.parents && u.parents.fond, inv = u.parents && u.parents.inventory;
    var h = "<ol style='padding-left:20px'><li>" + t("Государственный архив ВКО", "ШҚО мемлекеттік архиві", "State Archive of East Kazakhstan") + "</li>";
    if (f) {
      var fcode = esc(f.code || f.fond_code || ("Ф. " + (f.id || "")));
      h += '<li><a href="' + B + 'fond.html?id=' + encodeURIComponent(f.id) + '">' + fcode + (f.title ? " — " + esc(typeof f.title === "string" ? f.title : field(f, "title")) : "") + "</a></li>";
    }
    if (inv) h += '<li>' + t("Оп.", "Оп.", "Inv.") + " " + esc(inv.number || inv.id || "") + "</li>";
    h += "<li><b>" + esc(u.code || "") + " — " + esc(field(u, "title")) + " (" + t("вы здесь", "сіз осындасыз", "you are here") + ")</b></li></ol>";
    return h;
  }

  function crumbsFond(f) {
    return '<ol aria-label="' + t("Вы здесь", "Сіз осындасыз", "You are here") + '"><li><a href="' + B + 'index.html">' + t("Главная", "Басты бет", "Home") + '</a></li><li><a href="' + B + 'katalog.html">' + t("Каталог", "Каталог", "Catalogue") + '</a></li><li aria-current="page"><span class="lv">' + t("ФОНД", "ҚОР", "FONDS") + "</span>" + esc(f.code || "") + "</li></ol>";
  }

  function renderFond(f, invs) {
    var yr = yrStr(f);
    var code = f.code || "";
    var status = '<span class="status">' + t("Частично оцифрован", "Ішінара цифрландырылған", "Partly digitised") + "</span>";
    var demo = f.is_demo ? '<span class="tag demo">' + t("Образец записи", "Жазба үлгісі", "Sample record") + "</span>" : "";
    var crumbsEl = document.querySelector(".crumbs ol") || document.querySelector("#crumbs");
    if (crumbsEl) crumbsEl.outerHTML = crumbsFond(f);
    var invCount = invs ? invs.length : "";
    var h = "";
    h += '<span class="chip">' + t("Фонд", "Қор", "Fonds") + "</span>" + status + demo +
      '<h1 style="margin-top:12px">' + esc(field(f, "title")) + "</h1>" +
      refLine(code, false) +
      '<div class="two">' +
      '<section class="box"><h2>' + t("О чём фонд", "Қор туралы", "What is this fonds about?") + "</h2>" + descHtml(field(f, "description")) + "</section>" +
      '<section class="box"><h2>' + t("Как ознакомиться", "Қалай танысуға болады", "How to consult it") + "</h2><p>" + t("Подлинники выдаются в читальном зале на ул. Головкова, 26/1. Заявок и платежей на сайте нет.", "Түпнұсқалар Головков к-сі, 26/1 оқу залында беріледі. Сайтта өтініштер мен төлемдер жоқ.", "Originals are consulted in the reading room at Golovkov st., 26/1. The site has no applications or payments.") + ' <a href="' + B + 'ob-arhive.html#reading">' + t("Читальный зал", "Оқу залы", "Reading room") + "</a>.</p></section></div>" +
      '<div class="cols4" style="margin-top:40px">' +
      (yr ? "<div><h3>" + t("Крайние даты", "Кезең", "Dates") + "</h3><p>" + esc(yr) + "</p></div>" : "") +
      "<div><h3>" + t("Описей", "Тізімдемелер", "Inventories") + "</h3><p>" + esc(invCount === "" ? "—" : invCount) + "</p></div>" +
      (f.extent ? "<div><h3>" + t("Объём", "Көлемі", "Extent") + "</h3><p>" + esc(f.extent) + "</p></div>" : "") +
      "</div>" +
      renderInventories(invs) +
      '<div style="height:32px"></div>';
    show(h);
    window.onLang = function () { if (lastFond) renderFond(lastFond, lastInvs); };
  }

  function renderInventories(invs) {
    if (!invs || !invs.length) return "";
    var h = '<section class="full" id="opisi" style="margin-top:56px"><h2>' + t("Описи фонда", "Қор тізімдемелері", "Inventories of the fonds") + "</h2>" +
      '<div class="tblw"><table class="tbl stack"><thead><tr><th data-kk="Шифр" data-en="Reference">' + t("Шифр", "Шифр", "Reference") + "</th><th data-kk='Атауы' data-en='Title'>" + t("Название", "Атауы", "Title") + "</th><th data-kk='Күндер' data-en='Dates'>" + t("Даты", "Күндер", "Dates") + "</th><th data-kk='Істер' data-en='Files'>" + t("Дел", "Істер", "Files") + "</th></tr></thead><tbody>";
    invs.forEach(function (inv) {
      var n = inv.number || inv.id || "";
      var y = yrStr(inv);
      h += "<tr><td class='m' data-h='" + t("Шифр", "Шифр", "Reference") + "'>" + t("Оп.", "Оп.", "Inv.") + " " + esc(n) + "</td>" +
        "<td data-h='" + t("Название", "Атауы", "Title") + "'>" + esc(field(inv, "title")) + "</td>" +
        "<td class='m' data-h='" + t("Даты", "Күндер", "Dates") + "'>" + esc(y) + "</td>" +
        "<td class='m' data-h='" + t("Дел", "Істер", "Files") + "'>" + esc(inv.units_count === undefined ? "—" : inv.units_count) + "</td></tr>";
    });
    h += "</tbody></table></div></section>";
    return h;
  }

  var lastUnit = null, lastFond = null, lastInvs = null;

  function loadUnit() {
    window.gosApi.get("/api/catalog/units/" + encodeURIComponent(id)).then(function (u) {
      lastUnit = u; renderUnit(u);
    }).catch(function (err) {
      if (err && err.name === "ApiError" && err.status === 404) show(notFound());
      else if (err && err.name === "ApiError") show('<div class="gos-state gos-state--error"></div>'), gosState(document.querySelector(".gos-state--error"), "error");
      else show('<div class="gos-state gos-state--offline"></div>'), gosState(document.querySelector(".gos-state--offline"), "offline");
    });
  }

  function loadFond() {
    window.gosApi.get("/api/catalog/fonds/" + encodeURIComponent(id)).then(function (f) {
      lastFond = f;
      return window.gosApi.get("/api/catalog/fonds/" + encodeURIComponent(id) + "/inventories").then(function (invs) {
        lastInvs = invs; renderFond(f, invs);
      }).catch(function () { lastInvs = []; renderFond(f, []); });
    }).catch(function (err) {
      if (err && err.name === "ApiError" && err.status === 404) show(notFound());
      else if (err && err.name === "ApiError") show('<div class="gos-state gos-state--error"></div>'), gosState(document.querySelector(".gos-state--error"), "error");
      else show('<div class="gos-state gos-state--offline"></div>'), gosState(document.querySelector(".gos-state--offline"), "offline");
    });
  }

  function boot() {
    if (!id) { show(demoHint()); return; }
    if (KIND === "fond") loadFond();
    else loadUnit();
  }

  boot();
})();
