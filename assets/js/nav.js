(function () {
  var btn = document.querySelector(".nav-toggle"), nav = document.getElementById("nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", false); btn.focus(); }
  });
})();
