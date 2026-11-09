/* c-collection: оболочка сайта — шапка, меню, подвал, тема, язык KZ/RU/EN, ИИ-помощник (плавающая кнопка + панель).
   Страница задаёт body[data-page], data-hdr="over|solid", data-base="" | "../" (для admin/), data-back="1". Без сборки. */
(function () {
  const LI = { ru: 0, kk: 1, en: 2 };
  const B = document.body.dataset.base || "";
  const PAGE = document.body.dataset.page || "";
  const ADMIN = PAGE.indexOf("admin") === 0;
  const qs = new URLSearchParams(location.search);
  let lang = "ru";
  try { lang = qs.get("lang") || localStorage.getItem("lang") || "ru"; } catch (e) { lang = qs.get("lang") || "ru"; }
  if (!LI.hasOwnProperty(lang)) lang = "ru";
  let theme = "dark";
  try { theme = qs.get("theme") || localStorage.getItem("theme") || "dark"; } catch (e) { theme = qs.get("theme") || "dark"; }
  if (theme !== "light") theme = "dark";
  try { if (qs.get("lang")) localStorage.setItem("lang", lang); if (qs.get("theme")) localStorage.setItem("theme", theme); } catch (e) {}

  const t = (k) => { const v = window.D[k]; return v ? (v[LI[lang]] || v[0]) : k; };
  const L = (o) => (o && (o[lang] || o.ru)) || "";
  window.APP = { t, L, get lang() { return lang; }, get theme() { return theme; }, B, PAGE, esc: (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])) };

  /* ---------- sprite ---------- */
  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-burger" viewBox="0 0 24 24"><path d="M2 5h20v2.4H2zm0 6.8h20v2.4H2zM2 18.6h20V21H2z" fill="currentColor"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l6.4 6.4" stroke="currentColor" stroke-width="2.6"/></symbol>
  <symbol id="i-filter" viewBox="0 0 24 24"><path d="M3 7h10M17 7h4M3 17h4M11 17h10" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="15" cy="7" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="17" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="2.4"/></symbol>
  <symbol id="i-l" viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="2.4"/></symbol>
  <symbol id="i-r" viewBox="0 0 24 24"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.4"/></symbol>
  <symbol id="i-u" viewBox="0 0 24 24"><path d="M4 15l8-8 8 8" fill="none" stroke="currentColor" stroke-width="2.4"/></symbol>
  <symbol id="i-d" viewBox="0 0 24 24"><path d="M4 9l8 8 8-8" fill="none" stroke="currentColor" stroke-width="2.4"/></symbol>
  <symbol id="i-rot-r" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 3v5h-5" fill="none" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-rot-l" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 3v5h5" fill="none" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-contrast" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></symbol>
  <symbol id="i-zin" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15 15l6 6M10 7v6M7 10h6" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-zout" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15 15l6 6M7 10h6" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-full" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-info" viewBox="0 0 24 24"><path d="M10 4h4v3h-4zM9 10h5v8h2v2H8v-2h2v-6H9z" fill="currentColor"/></symbol>
  <symbol id="i-ocr" viewBox="0 0 24 24"><path d="M3 6h8v12H3zM13 6h8v12h-8z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5.5 15l2-6 2 6M15 9h3a1.5 1.5 0 0 1 0 3h-3m3 0a1.5 1.5 0 0 1 0 3h-3" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24"><path d="M8 8h11v13H8zM5 16V3h11" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="i-share" viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="5.5" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18.5" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M3 4h18v13H10l-5 4v-4H3z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M7 9h10M7 12.5h6" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="i-send" viewBox="0 0 24 24"><path d="M3 12h16M12 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.4"/></symbol>
  <symbol id="i-grid" viewBox="0 0 24 24"><path d="M3 3h8v10H3zM13 3h8v6h-8zM3 15h8v6H3zM13 11h8v10h-8z" fill="currentColor"/></symbol>
  <symbol id="i-list" viewBox="0 0 24 24"><path d="M3 5h4v4H3zM9 6h12v2H9zM3 10h4v4H3zM9 11h12v2H9zM3 15h4v4H3zM9 16h12v2H9z" fill="currentColor"/></symbol>
  <symbol id="i-ext" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" fill="none" stroke="currentColor" stroke-width="2.2"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2.4"/></symbol>
</svg>`;
  document.body.insertAdjacentHTML("afterbegin", SPRITE);
  const ic = (id, s) => `<svg${s ? ` width="${s}" height="${s}"` : ""}><use href="#i-${id}"/></svg>`;
  window.APP.ic = ic;

  /* ---------- nav ---------- */
  const NAV = [["nav.catalog", "katalog.html", "catalog"], ["nav.history", "istoriya.html", "history"], ["nav.exhib", "vystavka.html", "expo"], ["nav.branches", "filialy.html", "branches"], ["nav.ai", "ii.html", "ai"]];
  const MENU = NAV.concat([["nav.about", "ob-arhive.html", "about"], ["nav.feedback", "ob-arhive.html#feedback", "feedback"]]);
  const cur = (k) => (PAGE === k || (k === "catalog" && (PAGE === "fond" || PAGE === "delo")) ? ' aria-current="page"' : "");
  const langBtns = `<button data-l="kk" aria-pressed="false">KZ</button><button data-l="ru" aria-pressed="true">RU</button><button data-l="en" aria-pressed="false">EN</button>`;

  function buildHeader() {
    let h;
    if (ADMIN) {
      h = `<header class="hdr hdr--solid" style="background:#000">
  <a class="back" href="${B}index.html" style="background:var(--accent)"><span data-i18n="adm.brand">ГАВКО · Админ-панель</span></a>
  <span class="sp"></span>
  <div class="lang" role="group" aria-label="Language">${langBtns}</div>
  <button class="ico themebtn" data-theme-toggle aria-label="Theme"></button>
  <span class="ulink" data-i18n="adm.user">Администратор</span>
  <a class="btn btn--sec" style="color:#fff" href="${B}index.html" data-i18n="adm.tosite">На сайт</a>
</header>`;
    } else {
      const solid = document.body.dataset.hdr !== "over";
      const back = document.body.dataset.back;
      h = `<header class="hdr ${solid ? "hdr--solid" : "hdr--over"}${back ? " hdr--back" : ""}">
  <button class="ico" data-menu aria-label="Menu" data-i18n-aria="menu">${ic("burger")}</button>
  ${back ? `<a class="back" href="katalog.html">${ic("l")}<span data-i18n="nav.catalog">Каталог</span></a>` : `<a class="ico" href="katalog.html" aria-label="Search" data-i18n-aria="search">${ic("search")}</a>`}
  <nav aria-label="Main">${NAV.map((n) => `<a href="${n[1]}" data-i18n="${n[0]}"${cur(n[2])}></a>`).join("")}</nav>
  <span class="sp"></span>
  <div class="lang" role="group" aria-label="Language">${langBtns}</div>
  <button class="ico themebtn" data-theme-toggle aria-label="Theme"></button>
  <a class="ulink" href="ob-arhive.html" data-i18n="ulink">Об архиве</a>
  <a class="btn" href="katalog.html" data-i18n="btn.catalog">Электронный каталог</a>
</header>`;
    }
    const menu = `<div class="menu" id="menu" role="dialog" aria-label="Menu">
  <div class="top"><button class="ico" data-menu aria-label="Close" style="background:none;border:0;color:var(--text);width:40px;height:40px">${ic("close", 24)}</button></div>
  <ul>${MENU.map((n) => `<li><a href="${B}${n[1]}" data-i18n="${n[0]}"${cur(n[2])}></a></li>`).join("")}</ul>
  <div class="mtools"><div class="lang" role="group" aria-label="Language">${langBtns}</div><button class="tbtn" data-theme-toggle></button></div>
</div>`;
    const skip = `<a class="skip" href="#main" data-i18n="skip">Перейти к содержимому</a>`;
    document.body.insertAdjacentHTML("afterbegin", skip + menu + h);
  }

  function buildFooter() {
    if (ADMIN || document.body.dataset.nofooter) return;
    const f = `<footer class="ftr">
  <div>
    <h4 data-i18n="ftr.info">Информация</h4>
    <p data-i18n="ftr.addr">Открыто пн–пт 9:00–18:00</p>
    <p data-i18n="ftr.addr2">Усть-Каменогорск, ул. Головкова, 26/1</p>
    <p style="font-family:var(--font-mono);font-size:16px;color:var(--text2)">8 (7232) 25-59-76</p>
  </div>
  <ul>
    <li><a href="ob-arhive.html" data-i18n="ftr.l1">Об архиве</a></li>
    <li><a href="vystavka.html" data-i18n="nav.exhib">Выставки</a></li>
    <li><a href="ob-arhive.html#contacts" data-i18n="ftr.l3">Контакты</a></li>
    <li><a href="ob-arhive.html#help" data-i18n="ftr.l4">Полезная информация</a></li>
  </ul>
  <div class="acts">
    <a class="btn" href="ob-arhive.html#feedback" data-i18n="ftr.fb">Отзывы и предложения</a>
    <a class="btn" href="ob-arhive.html#reading" data-i18n="ftr.rd">Читальный зал</a>
  </div>
  <p class="kz" data-i18n="demo"></p>
  <div class="legal"><a href="ob-arhive.html#terms" data-i18n="legal1">Условия использования</a><a href="ob-arhive.html#terms" data-i18n="legal2">Конфиденциальность</a><a href="#" data-lowv data-i18n="legal3">Версия для слабовидящих</a><a href="ob-arhive.html#sitemap" data-i18n="legal4">Карта сайта</a><a href="admin/index.html" data-i18n="adm.link">Вход для сотрудников</a></div>
</footer>`;
    const main = document.querySelector("main");
    (main || document.body).insertAdjacentHTML(main ? "afterend" : "beforeend", f);
  }

  /* ---------- ИИ-помощник ---------- */
  const REFS = {
    metric: [
      { c: "Ф. 33-М", t: "ai.r1", h: "fond.html?f=33-M" },
      { c: "Оп. 1, д. 410–470 · 1900–1906", t: "ai.r2", h: "katalog.html?q=%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B5&place=sem" },
      { c: "ул. Головкова, 26/1", t: "ai.r3", h: "filialy.html?b=main" }
    ],
    how: [
      { c: "Ф. 1-П, оп. 1, д. 245", t: "ai.r4", h: "delo.html" },
      { c: "§ 5.3", t: "ai.r5", h: "ob-arhive.html#help" }
    ],
    read: [
      { c: "ул. Крылова, 39", t: "ai.r6", h: "filialy.html?b=reading" },
      { c: "§ 5.4", t: "ai.r5", h: "ob-arhive.html#reading" }
    ]
  };
  const SCEN = { metric: ["ai.q1", "ai.a1"], how: ["ai.q2", "ai.a2"], read: ["ai.q3", "ai.a3"] };
  const chats = [];

  function chatHTML(msgs) {
    return msgs.map((m) => {
      if (m.r === "u") return `<div class="msg u">${APP.esc(m.text)}</div>`;
      if (m.r === "typing") return `<div class="msg a"><span class="dots"><i></i><i></i><i></i></span></div>`;
      let body;
      if (m.kind === "welcome") body = `<p>${t("ai.hello")}</p>`;
      else if (m.kind === "gen") body = `<p>${t("ai.gen")}</p>${refsHTML([{ c: "§ 5.3", t: "ai.r7", h: "katalog.html?q=" + encodeURIComponent(m.q || "") }, { c: "§ 5.4", t: "ai.r5", h: "ob-arhive.html#help" }])}`;
      else body = `<p>${t(SCEN[m.kind][1])}</p>${refsHTML(REFS[m.kind])}`;
      return `<div class="msg a">${body}${m.kind === "welcome" ? "" : `<p class="warn">${t("ai.disc")}</p>`}</div>`;
    }).join("");
  }
  const refsHTML = (arr) => `<div class="refs">${arr.map((r) => `<a class="ref" href="${B}${r.h}"><span><small>${APP.esc(r.c)}</small>${t(r.t)}</span>${ic("r")}</a>`).join("")}</div>`;

  function makeChat(root) {
    const st = { msgs: [{ r: "a", kind: "welcome" }], el: root, used: {} };
    root.innerHTML = `<div class="cmsgs" aria-live="polite"></div><div class="cchips"></div>
<form class="cform" onsubmit="return false"><input class="inp" data-i18n-ph="ai.ph" aria-label="Question"><button class="btn" type="submit" aria-label="Send">${ic("send")}</button></form>
<div class="cfoot" data-i18n="ai.foot"></div>`;
    const box = root.querySelector(".cmsgs"), chips = root.querySelector(".cchips"), inp = root.querySelector("input");
    st.render = () => {
      box.innerHTML = chatHTML(st.msgs);
      chips.innerHTML = ["metric", "how", "read"].filter((k) => !st.used[k]).map((k) => `<button type="button" data-k="${k}">${t(SCEN[k][0])}</button>`).join("");
      const lu = box.querySelectorAll('.msg.u'); box.scrollTop = lu.length ? lu[lu.length - 1].offsetTop - 14 : 0;
    };
    st.ask = (kind, text, instant) => {
      st.used[kind] = 1;
      st.msgs.push({ r: "u", text: text || t(SCEN[kind][0]), kind });
      if (instant) { st.msgs.push({ r: "a", kind, q: text }); st.render(); return; }
      st.msgs.push({ r: "typing" }); st.render();
      setTimeout(() => { st.msgs = st.msgs.filter((m) => m.r !== "typing"); st.msgs.push({ r: "a", kind, q: text }); st.render(); }, 750);
    };
    chips.addEventListener("click", (e) => { const b = e.target.closest("button[data-k]"); if (b) st.ask(b.dataset.k); });
    root.querySelector("form").addEventListener("submit", () => {
      const v = inp.value.trim(); if (!v) return; inp.value = "";
      const low = v.toLowerCase();
      const kind = /метри|metric|метрик|церк|parish/.test(low) ? "metric" : /читал|reading|оқу|добра|how to get|адрес/.test(low) ? "read" : /каталог|фонд|опись|опис|catalog|fond|қор|тізім/.test(low) ? "how" : "gen";
      if (kind === "gen") { st.msgs.push({ r: "u", text: v }); st.msgs.push({ r: "typing" }); st.render(); setTimeout(() => { st.msgs = st.msgs.filter((m) => m.r !== "typing"); st.msgs.push({ r: "a", kind: "gen", q: v }); st.render(); }, 750); } else st.ask(kind, v);
    });
    chats.push(st); st.render();
    return st;
  }
  window.APP.makeChat = makeChat;

  function buildAI() {
    if (PAGE === "ai") return;
    document.body.insertAdjacentHTML("beforeend", `<button class="aifab" data-ai-open aria-label="AI">${ic("chat")}<span data-i18n="ai.fab">Спросить ИИ</span></button>
<aside class="aipanel" id="aipanel" role="dialog" aria-label="AI"><div class="aihd"><b data-i18n="ai.title">Архивный помощник</b><span class="badge" data-i18n="ai.beta">Бета</span>
<a href="${B}ii.html" aria-label="Fullscreen" data-i18n-aria="ai.expand">${ic("full")}</a><button data-ai-close aria-label="Close" data-i18n-aria="menu.close">${ic("close")}</button></div><div class="chat" id="aichat"></div></aside>`);
    const st = makeChat(document.getElementById("aichat"));
    const panel = document.getElementById("aipanel"), fab = document.querySelector(".aifab");
    const open = (o) => { panel.classList.toggle("open", o); fab.style.display = o ? "none" : ""; };
    document.addEventListener("click", (e) => { if (e.target.closest("[data-ai-open]")) open(true); if (e.target.closest("[data-ai-close]")) open(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
    if (qs.get("ai") === "1") { open(true); st.ask("metric", null, true); }
  }

  /* ---------- язык / тема ---------- */
  function applyI18n(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((n) => { if (window.D[n.dataset.i18n]) n.textContent = t(n.dataset.i18n); });
    (root || document).querySelectorAll("[data-i18n-html]").forEach((n) => { n.innerHTML = t(n.dataset.i18nHtml); });
    (root || document).querySelectorAll("[data-i18n-ph]").forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
    (root || document).querySelectorAll("[data-i18n-aria]").forEach((n) => { n.setAttribute("aria-label", t(n.dataset.i18nAria)); });
    (root || document).querySelectorAll("[data-i18n-title]").forEach((n) => { n.title = t(n.dataset.i18nTitle); });
  }
  function paintTheme() {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      const toLight = theme === "dark";
      b.innerHTML = ic(toLight ? "sun" : "moon") + (b.classList.contains("tbtn") ? `<span>${t(toLight ? "theme.light" : "theme.dark")}</span>` : "");
      b.setAttribute("aria-label", t(toLight ? "theme.light" : "theme.dark"));
    });
  }
  function setLang(l, silent) {
    lang = l; document.documentElement.lang = l;
    const ttl = window.D["title." + PAGE]; if (ttl) document.title = ttl[LI[l]] + " — " + t("site");
    applyI18n();
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.l === l));
    try { localStorage.setItem("lang", l); } catch (e) {}
    chats.forEach((c) => c.render());
    paintTheme();
    window.dispatchEvent(new CustomEvent("langchange", { detail: l }));
    if (typeof window.fitWordmark === "function") window.fitWordmark();
  }
  window.APP.setLang = setLang;
  document.addEventListener("click", (e) => {
    const lb = e.target.closest(".lang button"); if (lb) { setLang(lb.dataset.l); return; }
    if (e.target.closest("[data-theme-toggle]")) { theme = theme === "dark" ? "light" : "dark"; try { localStorage.setItem("theme", theme); } catch (x) {} paintTheme(); window.dispatchEvent(new CustomEvent("themechange", { detail: theme })); return; }
    if (e.target.closest("[data-menu]")) { document.getElementById("menu").classList.toggle("open"); return; }
    if (e.target.closest("[data-lowv]")) { e.preventDefault(); document.documentElement.classList.toggle("lowv"); }
  });

  function fitWordmark() {
    const el = document.querySelector(".wordmark"); if (!el) return;
    el.style.fontSize = "100px"; el.style.right = "auto"; el.style.width = "max-content";
    const pad = parseFloat(getComputedStyle(el).left);
    el.style.fontSize = (100 * (window.innerWidth - 2 * pad) / el.getBoundingClientRect().width) + "px";
  }
  window.fitWordmark = fitWordmark;
  addEventListener("resize", fitWordmark);

  /* ---------- init ---------- */
  if (document.querySelector(".plate")) document.body.classList.add("has-plate");
  document.documentElement.dataset.theme = theme;
  buildHeader(); buildFooter(); buildAI();
  setLang(lang);
  document.fonts && document.fonts.ready.then(() => { fitWordmark(); });
  window.dispatchEvent(new CustomEvent("appready"));
})();
