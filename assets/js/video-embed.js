/* Click-to-play YouTube embed that works on localhost and on the live site.
   Set data-youtube-id on #demo-video to the video ID (the part after v= in the link).
   - Empty ID: the "coming soon" placeholder stays.
   - Sends a proper referrer (YouTube error 153 happens without one).
   - If YouTube still refuses to play (error 153/101/150) or the page is opened as
     file://, shows a "Watch on YouTube" button instead of a broken player. */
(function () {
  var box = document.getElementById("demo-video"); if (!box) return;
  var id = (box.getAttribute("data-youtube-id") || "").trim();
  var btn = box.querySelector(".video-btn"), tag = box.querySelector(".video-tag");
  if (!id || !btn) return;

  var watchUrl = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
  var isWeb = /^https?:$/.test(location.protocol);

  if (tag) tag.hidden = true;
  btn.querySelector("strong").textContent = "Watch the demonstration";
  btn.querySelector(".sub").textContent = "Click to play";
  box.style.backgroundColor = "#0e1530";
  box.style.backgroundImage = "linear-gradient(rgba(14,21,48,.55),rgba(14,21,48,.55)),url(https://i.ytimg.com/vi/" + encodeURIComponent(id) + "/hqdefault.jpg)";
  box.style.backgroundSize = "cover"; box.style.backgroundPosition = "center";

  function showFallback(why) {
    box.innerHTML = "";
    var a = document.createElement("a");
    a.className = "video-btn"; a.href = watchUrl; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = '<span class="play" aria-hidden="true"></span><strong>Watch on YouTube</strong><span class="sub"></span>';
    a.querySelector(".sub").textContent = why;
    box.appendChild(a);
  }

  function loadApi(cb) {
    if (window.YT && window.YT.Player) return cb();
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () { if (prev) prev(); cb(); };
    var s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.async = true;
    /* If the API script is blocked, the plain iframe still plays; we just lose error detection. */
    document.head.appendChild(s);
  }

  btn.addEventListener("click", function () {
    if (!isWeb) { showFallback("Open the page through a web server (not as a file) to play it here."); return; }
    var f = document.createElement("iframe");
    f.id = "yt-player";
    f.src = "https://www.youtube.com/embed/" + encodeURIComponent(id) +
            "?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=" + encodeURIComponent(location.origin);
    f.title = "AscendAI demonstration video";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.referrerPolicy = "strict-origin-when-cross-origin";
    f.allowFullscreen = true;
    box.replaceChild(f, btn);
    loadApi(function () {
      new YT.Player("yt-player", { events: { onError: function () {
        showFallback("YouTube would not play it on this page.");
      } } });
    });
  });
})();
