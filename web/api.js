/* Общий API-клиент и состояния для статики. Подключать на страницы — в T4. */
(function () {
  "use strict";

  function buildQuery(params) {
    if (!params) return "";
    var q = new URLSearchParams();
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) {
        v.forEach(function (item) { q.append(k, item); });
      } else {
        q.set(k, String(v));
      }
    });
    var s = q.toString();
    return s ? "?" + s : "";
  }

  function ApiError(status, body) {
    var err = new Error("API error " + status);
    err.name = "ApiError";
    err.status = status;
    err.body = body;
    return err;
  }

  function request(method, path, body, isForm) {
    var opts = {
      method: method,
      credentials: "same-origin",
      headers: { "X-Requested-With": "gos" }
    };
    if (body !== undefined && body !== null) {
      if (isForm) {
        opts.body = body;
      } else {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
      }
    }
    return fetch(path, opts).then(function (resp) {
      var ct = resp.headers.get("content-type") || "";
      var parse = ct.indexOf("application/json") !== -1
        ? resp.json()
        : resp.text().then(function (text) {
            if (!text) return null;
            try { return JSON.parse(text); } catch (e) { return text; }
          });
      return parse.then(function (data) {
        if (!resp.ok) throw ApiError(resp.status, data);
        return data;
      });
    });
  }

  window.gosApi = {
    get: function (path, params) { return request("GET", path + buildQuery(params)); },
    post: function (path, body) { return request("POST", path, body, false); },
    put: function (path, body) { return request("PUT", path, body, false); },
    upload: function (path, formData) { return request("POST", path, formData, true); },
    del: function (path) { return request("DELETE", path); }
  };

  var LANG = {
    kk: {
      loading: "Жүктелуде…",
      error: "Қате орын алды. Қайталап көріңіз.",
      empty: "Ештеңе табылмады.",
      forbidden: "Қолжетімділік жоқ.",
      offline: "Интернет байланысы жоқ."
    },
    ru: {
      loading: "Загрузка…",
      error: "Произошла ошибка. Попробуйте ещё раз.",
      empty: "Ничего не найдено.",
      forbidden: "Доступ запрещён.",
      offline: "Нет соединения с интернетом."
    },
    en: {
      loading: "Loading…",
      error: "Something went wrong. Please try again.",
      empty: "Nothing found.",
      forbidden: "Access denied.",
      offline: "No internet connection."
    }
  };

  function currentLang() {
    var lang = (document.documentElement && document.documentElement.lang) || "ru";
    lang = String(lang).toLowerCase().slice(0, 2);
    return LANG[lang] ? lang : "ru";
  }

  window.gosState = function (el, kind, msg) {
    if (!el) return null;
    var lang = currentLang();
    var text = msg || (LANG[lang] && LANG[lang][kind]) || LANG.ru[kind] || "";
    el.innerHTML = "";
    var div = document.createElement("div");
    div.className = "gos-state gos-state--" + kind;
    div.textContent = text;
    el.appendChild(div);
    return div;
  };

  // Общее экранирование для вставки данных API в HTML.
  window.gosEsc = function (s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  // Общий словарь кодов для перевода на страницах (RU / KZ / EN).
  // Формат значения: [ru, kk, en]. Используется в card.js и catalog.js.
  window.gosLabels = {
    types: {
      print: ["Печатное издание", "Баспа басылымы", "Printed work"],
      written: ["Письменный источник", "Жазба дерек", "Written source"],
      photo: ["Фотография", "Фотосурет", "Photograph"],
      map: ["Карта, чертёж", "Карта, сызба", "Map, drawing"],
      org: ["Документы организаций", "Ұйымдар құжаттары", "Organisation records"],
      personal: ["Личного происхождения", "Жеке шығу тегі", "Personal records"]
    },
    levels: {
      fond: ["Фонд", "Қор", "Fonds"],
      opis: ["Опись", "Тізімдеме", "Inventory"],
      delo: ["Дело", "Іс", "File"],
      doc: ["Документ", "Құжат", "Item"]
    }
  };
})();
