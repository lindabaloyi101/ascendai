/* Click-to-play YouTube embed. Set data-youtube-id on #demo-video to the video ID
   (the part after v= in the YouTube link). While empty, the placeholder stays. */
(function () {
  var box = document.getElementById("demo-video"); if (!box) return;
  var id = (box.getAttribute("data-youtube-id") || "").trim();
  var btn = box.querySelector(".video-btn"), tag = box.querySelector(".video-tag");
  if (!id) return;
  if (tag) tag.hidden = true;
  btn.querySelector("strong").textContent = "Watch the demonstration";
  btn.querySelector(".sub").textContent = "2 minutes";
  btn.addEventListener("click", function () {
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
    f.title = "AscendAI WhatsApp assistant for car dealerships: demonstration";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    box.replaceChild(f, btn);
  });
})();
