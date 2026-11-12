/* Каталог: поиск по /api/catalog/search, фасеты, пагинация, сортировка, URL-состояние.
   Данные - только через window.gosApi. При недоступном API - понятное состояние(gosState). */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return window.gosEsc ? window.gosEsc(s) : String(s === null || s === undefined ? "" : s); }
  function lang() { return (window.getLang && window.getLang()) || "ru"; }
  function t(ru, kk, en) { return (window.tr && window.tr(ru, kk, en)) || ru; }
  // локализованное поле API({ru,kk,en} либо строка, либо *_ru/*_kk/*_en)
  function pick(v, base) {
    if (base !== undefined) { v = v[base]; }
    if (v === null || v === undefined) return "";
    if (typeof v === "object") { var l = lang(); return v[l] || v.ru || v.kk || v.en || ""; }
    return String(v);
  }

  var TYPES = {
    print: ["Печатное издание", "Баспа басылымы", "Printed work"],
    written: ["Письменный источник", "Жазба дерек", "Written source"],
    photo: ["Фотография", "Фотосурет", "Photograph"],
    map: ["Карта, чертёж", "Карта, сызба", "Map, drawing"],
    org: ["Документы организаций", "Ұйымдар құжаттары", "Organisation records"],
    personal: ["Личного происхождения", "Жеке шығу тегі", "Personal records"]
  };
  var BRANCHES = {
    "uka-main": ["ГАВКО, Усть-Каменогорск", "ШҚО МА, Өскемен", "SAEK, Ust-Kamenogorsk"],
    "uka-pers": ["Усть-Каменогорский филиал (личный состав)", "Өскемен филиалы (жеке құрам)", "Ust-Kamenogorsk branch (personnel)"],
    ridder: ["Риддерский филиал", "Риддер филиалы", "Ridder branch"],
    altai: ["Филиал Алтай", "Алтай филиалы", "Altai branch"],
    zaisan: ["Зайсанский филиал", "Зайсан филиалы", "Zaisan branch"]
  };
  var LEVELS = {
    fond: ["ФОНД", "ҚОР", "FONDS"],
    opis: ["ОПИСЬ", "ТІЗІМДЕМЕ", "INVENTORY"],
    delo: ["ДЕЛО", "ІС", "FILE"],
    doc: ["ДОКУМЕНТ", "ҚҰЖАТ", "ITEM"]
  };
  var THEMES = {
    hist: ["История региона", "Өңір тарихы", "Regional history"],
    city: ["История городов", "Қала тарихы", "History of towns"],
    industry: ["Промышленность", "Өнеркәсіп", "Industry"],
    people: ["Известные личности", "Танымал тұлғалар", "Notable people"],
    fam: ["История семьи", "Отбасы тарихы", "Family history"]
  };
  var PLACES = ["Усть-Каменогорск", "Семипалатинск", "Риддер", "Алтай", "Зайсан"];
  // вкладки категорий: [значение, какой параметр задаёт]
  var CATS = [["all", ""], ["fond", "level"], ["opis", "level"], ["delo", "level"], ["photo", "type"], ["map", "type"], ["personal", "type"]];
  var CAT_LABEL = {
    all: ["Все", "Барлығы", "All"],
    fond: ["Фонды", "Қорлар", "Fonds"],
    opis: ["Описи", "Тізімдемелер", "Inventories"],
    delo: ["Дела", "Істер", "Files"],
    photo: ["Фотографии", "Фотосуреттер", "Photographs"],
    map: ["Карты и чертежи", "Карталар", "Maps"],
    personal: ["Личные фонды", "Жеке қорлар", "Personal fonds"]
  };

  var PER = 10;
  var last = null; // последний ответ /api/catalog/search

  function arr(p, k) { return p.getAll(k) || []; }
  function readURL() {
    var p = new URLSearchParams(location.search);
    var s = { cat: p.get("cat") || "all", page: parseInt(p.get("page"), 10) || 1, sort: p.get("sort") || "rel" };
    ["q", "fond", "opis", "delo", "period", "year_from", "year_to", "author", "theme", "place", "keywords", "lang"].forEach(function (k) { s[k] = p.get(k) || ""; });
    s.type = arr(p, "type");
    s.branch = arr(p, "branch");
    s.digitized = p.get("digitized") === "1";
    s.open = p.get("open") === "1";
    return s;
  }

  function checked(nm) { return [].map.call(document.querySelectorAll('[name="' + nm + '"]:checked'), function (x) { return x.value; }); }
  function setChecked(nm, vals) {
    document.querySelectorAll('[name="' + nm + '"]').forEach(function (x) { x.checked = vals.indexOf(x.value) !== -1; });
  }

  // число активных фильтров для кнопки «Фильтры (N)» на мобильной версии
  function activeFilterCount() {
    var n = 0;
    ["f_fond", "f_opis", "f_delo", "f_per", "f_y1", "f_y2", "f_auth", "f_theme", "f_place", "f_kw", "f_lang"].forEach(function (id) {
      var el = $(id); if (el && el.value) n++;
    });
    n += checked("type").length;
    n += checked("branch").length;
    if ($("f_dig") && $("f_dig").checked) n++;
    if ($("f_open") && $("f_open").checked) n++;
    return n;
  }
  function updateFbtn() {
    var b = $("ftoggle"), c = $("fcount");
    if (!b) return;
    var n = activeFilterCount();
    if (c) c.textContent = n ? "(" + n + ")" : "";
  }
  function applyToForm(s) {
    $("q").value = s.q;
    $("f_fond").value = s.fond;
    $("f_opis").value = s.opis;
    $("f_delo").value = s.delo;
    $("f_per").value = s.period;
    $("f_y1").value = s.year_from;
    $("f_y2").value = s.year_to;
    $("f_auth").value = s.author;
    $("f_theme").value = s.theme;
    $("f_place").value = s.place;
    $("f_kw").value = s.keywords;
    $("f_lang").value = s.lang;
    $("sort").value = s.sort;
    setChecked("type", s.type);
    setChecked("branch", s.branch);
    $("f_dig").checked = !!s.digitized;
    $("f_open").checked = !!s.open;
  }

  function collect() {
    return {
      cat: lastCat, page: lastPage, sort: $("sort").value,
      q: $("q").value, fond: $("f_fond").value, opis: $("f_opis").value, delo: $("f_delo").value,
      period: $("f_per").value, year_from: $("f_y1").value, year_to: $("f_y2").value,
      author: $("f_auth").value, theme: $("f_theme").value, place: $("f_place").value, keywords: $("f_kw").value,
      lang: $("f_lang").value, type: checked("type"), branch: checked("branch"),
      digitized: $("f_dig").checked, open: $("f_open").checked
    };
  }

  var lastCat = "all", lastPage = 1;
  function buildParams() {
    var s = collect();
    var p = {};
    if (s.q) p.q = s.q;
    if (s.fond) p.fond = s.fond;
    if (s.opis) p.opis = s.opis;
    if (s.delo) p.delo = s.delo;
    if (s.period) p.period = s.period;
    if (s.year_from) p.year_from = s.year_from;
    if (s.year_to) p.year_to = s.year_to;
    if (s.author) p.author = s.author;
    if (s.theme) p.theme = s.theme;
    if (s.place) p.place = s.place;
    if (s.keywords) p.keywords = s.keywords;
    if (s.lang) p.lang = s.lang;
    if (s.digitized) p.digitized = true;
    if (s.open) p.open = true;
    if (s.sort && s.sort !== "rel") p.sort = s.sort;
    // категория задаёт level(фонд/опись/дело) либо type(фото/карта/личные)
    var types = s.type.slice();
    if (s.cat === "fond" || s.cat === "opis" || s.cat === "delo") p.level = s.cat;
    else if (s.cat === "photo" || s.cat === "map" || s.cat === "personal") { if (types.indexOf(s.cat) < 0) types.push(s.cat); }
    if (types.length) p.type = types;
    if (s.branch.length) p.branch = s.branch;
    p.page = s.page || 1;
    p.per_page = PER;
    return p;
  }

  function writeURL() {
    var s = collect();
    var q = new URLSearchParams();
    if (s.q) q.set("q", s.q);
    if (s.cat && s.cat !== "all") q.set("cat", s.cat);
    if (s.page > 1) q.set("page", String(s.page));
    if (s.sort && s.sort !== "rel") q.set("sort", s.sort);
    ["fond", "opis", "delo", "period", "year_from", "year_to", "author", "theme", "place", "keywords", "lang"].forEach(function (k) { if (s[k]) q.set(k, String(s[k])); });
    s.type.forEach(function (v) { q.append("type", v); });
    s.branch.forEach(function (v) { q.append("branch", v); });
    if (s.digitized) q.set("digitized", "1");
    if (s.open) q.set("open", "1");
    var qs = q.toString();
    var url = location.pathname + (qs ? "?" + qs : "");
    if (history.replaceState) history.replaceState(null, "", url);
  }

  function buildStaticSelects() {
    var th = $("f_theme"), tv = th.value;
    th.innerHTML = '<option value="">' + t("Любая", "Кез келген", "Any") + "</option>" +
      Object.keys(THEMES).map(function (k) { return '<option value="' + k + '">' + t.apply(null, THEMES[k]) + "</option>"; }).join("");
    th.value = tv;
    var pl = $("f_place"), pv = pl.value;
    pl.innerHTML = '<option value="">' + t("Любой", "Кез келген", "Any") + "</option>" +
      PLACES.map(function (p) { return "<option>" + esc(p) + "</option>"; }).join("");
    pl.value = pv;
  }

  function renderFacets(facets) {
    facets = facets || { type: {}, branch: {}, level: {} };
    var typeKeys = Object.keys(facets.type || {});
    var branchKeys = Object.keys(facets.branch || {});
    if (!typeKeys.length) typeKeys = Object.keys(TYPES);
    if (!branchKeys.length) branchKeys = Object.keys(BRANCHES);
    var ty = typeKeys.map(function (k) {
      var n = (facets.type && facets.type[k]) || 0;
      var lbl = TYPES[k] ? t.apply(null, TYPES[k]) : k;
      return '<label class="chk"><input type="checkbox" name="type" value="' + esc(k) + '"><span class="l">' + esc(lbl) + '</span><span class="cnt">' + n + "</span></label>";
    }).join("");
    var br = branchKeys.map(function (k) {
      var n = (facets.branch && facets.branch[k]) || 0;
      var lbl = BRANCHES[k] ? t.apply(null, BRANCHES[k]) : k;
      return '<label class="chk"><input type="checkbox" name="branch" value="' + esc(k) + '"><span class="l">' + esc(lbl) + '</span><span class="cnt">' + n + "</span></label>";
    }).join("");
    var st = collect();
    $("g_type").innerHTML = ty;
    $("g_branch").innerHTML = br;
    setChecked("type", st.type);
    setChecked("branch", st.branch);
  }

  function yearsStr(r) {
    var y = r.years || [];
    if (y.length >= 2 && y[0] === y[1]) return String(y[0]);
    if (y.length >= 2) return y[0] + "-" + y[1];
    if (y.length === 1) return String(y[0]);
    return "";
  }

  function renderTabs(resp) {
    var facets = resp.facets || {};
    var catCount = function (c) {
      if (c === "all") return resp.total || 0;
      if (c === "fond" || c === "opis" || c === "delo") return (facets.level && facets.level[c]) || 0;
      return (facets.type && facets.type[c]) || 0;
    };
    var cur = lastCat;
    $("cats").innerHTML = CATS.map(function (row) {
      var c = row[0], n = catCount(c);
      var lbl = t.apply(null, CAT_LABEL[c]);
      var txt = n ? lbl + " (" + n + ")" : lbl;
      var tab = c === cur ? "<span>" + esc(txt) + "</span>" : '<a href="#" data-cat="' + c + '">' + esc(txt) + "</a>";
      var q = (c === "fond" || c === "opis" || c === "delo") ? '<button type="button" class="gt-btn" data-term="' + c + '" aria-expanded="false"></button>' : "";
      return '<div class="tabw">' + tab + q + "</div>";
    }).join("");
  }

  function renderItems(resp) {
    var list = $("results");
    var q = ($("q").value || "").trim();
    if (!resp.items || !resp.items.length) {
      var hint = "<ul style='text-align:left;margin:8px auto 16px;max-width:46ch'>" +
        "<li>" + t("Проверьте написание (например, «Усть-Каменогорск» и «Өскемен»).", "Жазылуын тексеріңіз (мысалы, «Усть-Каменогорск» және «Өскемен»).", "Check the spelling (e.g. “Ust-Kamenogorsk” and “Oskemen”).") + "</li>" +
        "<li>" + t("Уберите часть фильтров.", "Сүзгілердің бір бөлігін алып тастаңыз.", "Remove some filters.") + "</li>" +
        "<li>" + t("Расширьте период поиска.", "Іздеу кезеңін кеңейтіңіз.", "Widen the date range.") + "</li></ul>";
      if (resp.query_variants && resp.query_variants.length) {
        var vars = resp.query_variants.map(function (v) {
          return '<button class="btn sm" type="button" data-variant="' + esc(v) + '">' + esc(v) + "</button>";
        }).join(" ");
        hint += "<p style='margin:0 0 8px'>" + t("Возможно, вы имели в виду:", "Мүмкін сіз мынаны меңзегенсіз:", "Did you mean:") + " " + vars + "</p>";
      }
      list.innerHTML = '<div class="empty"><p><b>' + t("По вашему запросу ничего не найдено", "Сұрауыңыз бойынша ештеңе табылмады", "Nothing matches your query") + "</b></p><p>" +
        t("Измените формулировку или сбросьте фильтры. Можно спросить ИИ-помощника.", "Тұжырымды өзгертіңіз немесе сүзгілерді тастаңыз. ЖИ көмекшіден сұрауға болады.", "Try different wording or reset the filters. You can also ask the AI assistant.") + "</p>" +
        hint +
        '<button class="btn sm" type="button" id="resetbtn">' + t("Сбросить фильтры", "Сүзгілерді тастау", "Reset filters") + "</button></div>";
      var rb = $("resetbtn"); if (rb) rb.onclick = resetAll;
      return;
    }
    var h = resp.items.map(function (r) {
      var typ = TYPES[r.doc_type] ? t.apply(null, TYPES[r.doc_type]) : r.doc_type;
      var lv = LEVELS[r.level] ? t.apply(null, LEVELS[r.level]) : r.level;
      var lvCls = r.level === "opis" ? " l2" : (r.level === "delo" || r.level === "doc") ? " l3" : "";
      var lvTerm = (r.level === "fond" || r.level === "opis" || r.level === "delo") ? '<button type="button" class="gt-btn" data-term="' + r.level + '" aria-expanded="false"></button>' : "";
      var access = r.has_public_file
        ? '<span class="tag ok">' + t("Открыто", "Ашық", "Open") + "</span>"
        : (r.access_note ? '<span class="tag lim">' + esc(r.access_note) + "</span>" : '<span class="tag">' + t("Без скана", "Скансыз", "No scan") + "</span>");
      var dg = r.has_public_file ? '<span class="tag ok">' + t("Скан онлайн", "Скан онлайн", "Scan online") + "</span>" : "";
      var yr = yearsStr(r);
      var url = r.url || ("delo.html?id=" + encodeURIComponent(r.id));
      var href = document.body.dataset.base ? document.body.dataset.base + url : url;
      var demo = r.is_demo ? '<span class="tag demo">' + t("Образец записи", "Жазба үлгісі", "Sample record") + "</span>" : "";
      var branch = r.branch && r.branch.name ? esc(r.branch.name) : "";
      var ph = r.has_public_file ? t("Скан онлайн", "Скан онлайн", "Scan online") : t("Скана нет", "Скан жоқ", "No scan");
      return '<article class="res"><div class="ph">' + ph + '</div><div><span class="chip' + lvCls + '">' + esc(lv) + '</span>' + lvTerm + '<h3><a href="' + esc(href) + '">' + esc(pick(r.title)) + '<span class="chev"></span></a></h3><dl>' +
        '<dt data-term="ref">' + t("Шифр", "Шифр", "Reference") + "</dt><dd>" + esc(r.code) + "</dd>" +
        "<dt>" + t("Даты", "Күндер", "Dates") + "</dt><dd>" + esc(yr) + "</dd>" +
        (branch ? "<dt>" + t("Хранится", "Сақталады", "Held by") + "</dt><dd>" + branch + "</dd>" : "") +
        (r.extent ? "<dt>" + t("Объём", "Көлемі", "Extent") + "</dt><dd>" + esc(r.extent) + "</dd>" : "") +
        '</dl><div class="tags">' + access + dg + demo + (typ ? '<span class="tag">' + esc(typ) + '</span>' : '') + '</div></div></article>';
    }).join("");
    list.innerHTML = h;
  }

  function renderPager(resp) {
    var pages = Math.max(1, Math.ceil((resp.total || 0) / (resp.per_page || PER)));
    var pg = resp.page || 1;
    var h = "";
    if (pages > 1) {
      h += '<li><button ' + (pg === 1 ? "disabled" : "") + ' data-p="' + (pg - 1) + '" aria-label="' + t("Назад", "Артқа", "Previous") + '">&larr;</button></li>';
      for (var i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || Math.abs(i - pg) <= 2) h += '<li><button data-p="' + i + '"' + (i === pg ? ' aria-current="page"' : "") + ">" + i + "</button></li>";
        else if (Math.abs(i - pg) === 3) h += "<li><span>…</span></li>";
      }
      h += '<li><button ' + (pg === pages ? "disabled" : "") + ' data-p="' + (pg + 1) + '" aria-label="' + t("Вперёд", "Алға", "Next") + '">&rarr;</button></li>';
    }
    $("pager").innerHTML = h;
  }

  function render(resp) {
    if (!resp) { return; }
    var from = (resp.page - 1) * (resp.per_page || PER) + 1;
    var to = Math.min(resp.page * (resp.per_page || PER), resp.total || 0);
    if (resp.total) {
      $("count").textContent = t("Найдено: ", "Табылды: ", "Found: ") + resp.total + t(" · показано ", " · көрсетілді ", " · showing ") + from + "-" + to;
    } else {
      $("count").textContent = t("Ничего не найдено", "Ештеңе табылмады", "Nothing found");
    }
    renderFacets(resp.facets);
    renderTabs(resp);
    renderItems(resp);
    renderPager(resp);
    if (window.gosGlossary) window.gosGlossary(document);
    updateFbtn();
  }

  function load() {
    lastCat = $("catstate") ? $("catstate").value : lastCat;
    var params = buildParams();
    writeURL();
    gosState($("results"), "loading");
    window.gosApi.get("/api/catalog/search", params).then(function (resp) {
      last = resp;
      lastPage = resp.page || 1;
      render(resp);
    }).catch(function (err) {
      last = null;
      if (err && err.name === "ApiError") {
        gosState($("results"), err.status === 403 ? "forbidden" : "error");
      } else {
        gosState($("results"), "offline");
      }
      $("count").textContent = "";
      $("pager").innerHTML = "";
    });
  }

  function resetAll() {
    $("ff").reset();
    $("q").value = "";
    lastCat = "all";
    lastPage = 1;
    if ($("catstate")) $("catstate").value = "all";
    load();
  }

  // категория хранится в скрытом поле(обновляется кликами по вкладкам)
  var catEl = document.createElement("input");
  catEl.type = "hidden"; catEl.id = "catstate"; catEl.value = lastCat;

  function boot() {
    var s = readURL();
    lastCat = s.cat; lastPage = s.page;
    catEl.value = lastCat;
    document.body.appendChild(catEl);
    applyToForm(s);
    buildStaticSelects();
    load();
  }

  document.addEventListener("click", function (e) {
    var p = e.target.closest("[data-p]");
    if (p && !p.disabled) { lastPage = +p.dataset.p; load(); var c = document.querySelector(".cat"); if (c) window.scrollTo({ top: c.offsetTop - 40 }); return; }
    var c = e.target.closest("[data-cat]");
    if (c) { e.preventDefault(); lastCat = c.dataset.cat; lastPage = 1; catEl.value = lastCat; load(); return; }
    var v = e.target.closest("[data-variant]");
    if (v) { $("q").value = v.dataset.variant; lastPage = 1; load(); return; }
  });

  var ff = $("ff");
  ff.addEventListener("change", function () { lastPage = 1; load(); });
  ff.addEventListener("reset", function () { setTimeout(function () { lastPage = 1; load(); }, 0); });
  $("sort").addEventListener("change", function () { lastPage = 1; load(); });
  $("qf").addEventListener("submit", function (e) { e.preventDefault(); lastPage = 1; load(); });
  $("apply").addEventListener("click", function () { lastPage = 1; load(); });
  var ft = $("ftoggle");
  if (ft) ft.addEventListener("click", function () { var on = ff.classList.toggle("open"); ft.setAttribute("aria-expanded", String(on)); });
  window.resetAll = resetAll;
  window.onLang = function () { buildStaticSelects(); if (last) render(last); };

  boot();
})();
