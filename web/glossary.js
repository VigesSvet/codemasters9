/* Глоссарий архивных терминов: рядом с термином - кнопка «?» и всплывающая подсказка.
   Термин помечается атрибутом data-term="ключ"(на элементе) либо готовой кнопкой class="gt-btn" data-term="ключ".
   После перерисовки JS-выдачи вызывай window.gosGlossary(root). Подсказка открывается по клику или фокусу,
   закрывается по Esc или потере фокуса. Определения - одна простая строка, понятная без подготовки. */
(function () {
  "use strict";

  // словарь: ключ -> имя, вопрос для aria-label и определение на трёх языках
  var TERMS = {
    fond: {
      name: ["Фонд", "Қор", "Fonds"],
      ask: ["Что такое фонд?", "Қор деген не?", "What is a fonds?"],
      def: ["все документы одной организации или одного человека, которые хранятся вместе",
            "бір ұйымның немесе бір адамның бірге сақталатын барлық құжаттары",
            "all the documents of one organisation or one person, kept together"]
    },
    opis: {
      name: ["Опись", "Тізімдеме", "Inventory"],
      ask: ["Что такое опись?", "Тізімдеме деген не?", "What is an inventory?"],
      def: ["список дел внутри фонда, как оглавление книги",
            "қор ішіндегі істердің тізімі, кітаптың мазмұны сияқты",
            "a list of files within a fonds, like a table of contents"]
    },
    delo: {
      name: ["Дело", "Іс", "File"],
      ask: ["Что такое дело?", "Іс деген не?", "What is a file?"],
      def: ["папка с документами по одной теме или одному вопросу",
            "бір тақырып немесе бір мәселе бойынша құжаттары бар папка",
            "a folder of documents on one topic or matter"]
    },
    edhr: {
      name: ["Единица хранения", "Сақтау бірлігі", "Storage unit"],
      ask: ["Что такое единица хранения?", "Сақтау бірлігі деген не?", "What is a storage unit?"],
      def: ["то же, что дело или отдельный документ, - наименьшая единица учёта в архиве",
            "іс немесе жеке құжатпен бірдей - архивтегі есептің ең кіші бірлігі",
            "the same as a file or a single document - the smallest unit of account in an archive"]
    },
    ref: {
      name: ["Шифр", "Шифр", "Reference"],
      ask: ["Что такое шифр?", "Шифр деген не?", "What is a reference?"],
      def: ["адрес документа в архиве: номер фонда, описи и дела, например Ф. 1-П, оп. 1, д. 245",
            "архивтегі құжаттың мекенжайы: қор, тізімдеме және іс нөмірі, мысалы Ф. 1-П, оп. 1, д. 245",
            "the address of a document in the archive: the fonds, inventory and file numbers, for example Ф. 1-П, оп. 1, д. 245"]
    },
    list: {
      name: ["Лист", "Парақ", "Folio"],
      ask: ["Что такое лист?", "Парақ деген не?", "What is a folio?"],
      def: ["одна страница документа; число листов показывают как «48 л.»",
            "құжаттың бір беті; парақ санын «48 л.» деп көрсетеді",
            "one page of a document; the number of folios is shown as «48 л.»"]
    },
    fondobraz: {
      name: ["Фондообразователь", "Қор құрушы", "Fonds creator"],
      ask: ["Кто такой фондообразователь?", "Қор құрушы деген кім?", "What is a fonds creator?"],
      def: ["организация или человек, в деятельности которого образовались документы фонда",
            "қор құжаттары пайда болған ұйым немесе адам",
            "the organisation or person whose work produced the fonds documents"]
    },
    dig: {
      name: ["Оцифровано", "Цифрландырылған", "Digitised"],
      ask: ["Что значит «оцифровано»?", "«Цифрландырылған» деген не?", "What does «digitised» mean?"],
      def: ["документ отсканирован, и его можно посмотреть онлайн",
            "құжат сканерленген және оны онлайн көруге болады",
            "the document has been scanned and can be viewed online"]
    },
    restricted: {
      name: ["Доступ ограничен", "Қолжетімділік шектеулі", "Restricted access"],
      ask: ["Что значит «доступ ограничен»?", "«Қолжетімділік шектеулі» деген не?", "What does «restricted access» mean?"],
      def: ["часть сведений закрыта по закону, например персональные данные",
            "мәліметтердің бір бөлігі заң бойынша жабық, мысалы жеке деректер",
            "some information is closed by law, for example personal data"]
    }
  };

  function lang() {
    if (window.getLang) return window.getLang();
    var l = document.documentElement.lang || "ru";
    return l === "kk" ? "kk" : l === "en" ? "en" : "ru";
  }
  function L(ru, kk, en) { var l = lang(); return l === "kk" ? kk : l === "en" ? en : ru; }
  function ask(key) { var a = TERMS[key] && TERMS[key].ask; return a ? L(a[0], a[1], a[2]) : ""; }

  var tip = null, currentBtn = null;

  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement("div");
    tip.className = "gtip";
    tip.id = "glossary-tip";
    tip.setAttribute("role", "tooltip");
    tip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tip);
    return tip;
  }

  function showTip(btn, key) {
    var term = TERMS[key];
    if (!term) return;
    ensureTip();
    tip.textContent = "";
    var b = document.createElement("b");
    b.textContent = L(term.name[0], term.name[1], term.name[2]);
    tip.appendChild(b);
    tip.appendChild(document.createTextNode(" — " + L(term.def[0], term.def[1], term.def[2])));
    tip.classList.add("on");
    tip.setAttribute("aria-hidden", "false");
    currentBtn = btn;
    btn.setAttribute("aria-expanded", "true");
    // позиция под кнопкой, не вылезая за правый край экрана
    var vw = document.documentElement.clientWidth;
    tip.style.maxWidth = Math.min(340, vw - 16) + "px";
    tip.style.left = "0";
    tip.style.right = "auto";
    var r = btn.getBoundingClientRect();
    var tw = tip.offsetWidth;
    var left = Math.round(r.left);
    if (left + tw > vw - 8) left = Math.max(8, vw - tw - 8);
    tip.style.left = left + "px";
    tip.style.top = Math.round(r.bottom + 6) + "px";
  }

  function hideTip() {
    if (tip) { tip.classList.remove("on"); tip.setAttribute("aria-hidden", "true"); }
    if (currentBtn) { currentBtn.setAttribute("aria-expanded", "false"); currentBtn = null; }
  }

  function bind(btn, key) {
    btn.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); showTip(btn, key); });
    btn.addEventListener("focus", function () { showTip(btn, key); });
    btn.addEventListener("blur", function () { hideTip(); });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); hideTip(); btn.blur(); }
    });
  }

  function attach(el) {
    if (el.dataset.gtDone || !TERMS[el.dataset.term]) return;
    var key = el.dataset.term;
    el.dataset.gtDone = "1";
    // готовая кнопка - только навешиваем поведение и подписи
    if (el.classList.contains("gt-btn")) {
      el.dataset.gtKey = key;
      if (!el.textContent.trim()) el.textContent = "?";
      el.setAttribute("aria-label", ask(key));
      el.setAttribute("aria-describedby", "glossary-tip");
      el.setAttribute("aria-expanded", "false");
      bind(el, key);
      return;
    }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gt-btn";
    btn.textContent = "?";
    btn.setAttribute("aria-label", ask(key));
    btn.setAttribute("aria-describedby", "glossary-tip");
    btn.setAttribute("aria-expanded", "false");
    btn.dataset.gtKey = key;
    bind(btn, key);
    // текст с data-kk/data-en переводится trEls - кнопку ставим рядом, а не внутрь
    if (el.hasAttribute("data-kk") || el.hasAttribute("data-en")) {
      el.insertAdjacentElement("afterend", btn);
    } else {
      el.appendChild(btn);
    }
  }

  function gosGlossary(root) {
    root = root || document;
    [].forEach.call(root.querySelectorAll("[data-term]"), attach);
  }

  function relocalize() {
    hideTip();
    [].forEach.call(document.querySelectorAll(".gt-btn"), function (b) {
      if (b.dataset.gtKey) b.setAttribute("aria-label", ask(b.dataset.gtKey));
    });
  }

  window.gosGlossary = gosGlossary;

  // смена языка обновляет aria-label кнопок статичной разметки
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(relocalize).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  // клик вне кнопки, прокрутка и изменение размера закрывают подсказку
  document.addEventListener("click", function (e) { if (!e.target.closest(".gt-btn")) hideTip(); });
  window.addEventListener("scroll", hideTip, true);
  window.addEventListener("resize", hideTip);

  gosGlossary(document);
})();
