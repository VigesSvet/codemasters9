/* ocr.js - экран распознавания(ТЗ 5.8 Г). Результат - черновой текст, требует проверки. */
(function () {
  "use strict";
  var f = document.getElementById("ocr-form");
  if (!f) return;
  var out = document.getElementById("ocr-out");
  var note = document.getElementById("ocr-note");
  var btn = document.getElementById("ocr-run");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var inp = document.getElementById("ocr-file");
    if (!inp.files.length) { out.value = "Выберите файл jpg или png"; return; }
    var fd = new FormData();
    fd.append("file", inp.files[0]);
    var uid = document.getElementById("ocr-unit").value.trim();
    if (uid) fd.append("unit_id", uid);
    if (uid && document.getElementById("ocr-save").checked) fd.append("save_draft", "true");
    btn.disabled = true;
    note.textContent = "Распознавание… это может занять до минуты";
    out.value = "";
    window.gosApi.upload("/api/admin/ocr", fd).then(function (res) {
      btn.disabled = false;
      out.value = res.text;
      note.textContent = res.note + (res.saved_draft ? " Сохранено в черновик описания." : "");
    }).catch(function (err) {
      btn.disabled = false;
      if (err && err.status === 401) { location.replace("login.html"); return; }
      note.textContent = (err && (err.detail || err.message)) || "Ошибка распознавания";
    });
  });
})();
