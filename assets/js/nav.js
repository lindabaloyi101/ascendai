(function () {
  var btn = document.querySelector(".nav-toggle"), nav = document.getElementById("nav");
  if (!btn || !nav) return;
  var dd = nav.querySelector(".dropdown"), tg = dd && dd.querySelector(".dropdown-toggle");
  function closeDd() { if (dd) { dd.classList.remove("open"); tg.setAttribute("aria-expanded", "false"); } }
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  if (dd) {
    tg.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle("open");
      tg.setAttribute("aria-expanded", open);
    });
    document.addEventListener("click", function (e) { if (!dd.contains(e.target)) closeDd(); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (dd && dd.classList.contains("open")) { closeDd(); tg.focus(); return; }
    if (nav.classList.contains("open")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", false); btn.focus(); }
  });
})();
