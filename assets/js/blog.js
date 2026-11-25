/* Public blog: tile grid, single post, and the latest-posts block on the home page. */
(function () {
  var root = document.body.getAttribute("data-root") || "";
  function when(d) { try { return new Date(d + "T00:00:00").toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return d; } }
  function card(p, href) {
    var src = BlogDB.img(p.image_url);
    var img = src ? '<img src="' + MD.esc(src) + '" alt="" loading="lazy" width="800" height="450">' : '<img class="ph" src="' + root + 'assets/img/logo.png" alt="" width="56" height="58">';
    return '<a class="post-card" href="' + href + '"><div class="post-thumb">' + img + '</div><div class="post-text"><time datetime="' + MD.esc(p.published_at) + '">' + when(p.published_at) +
      "</time><h3>" + MD.esc(p.title) + "</h3><p>" + MD.esc(p.excerpt || "") + "</p></div></a>";
  }
  var grid = document.getElementById("posts");
  if (grid) BlogDB.list().then(function (list) {
    grid.innerHTML = list.length ? list.map(function (p) { return card(p, "post/index.html?slug=" + encodeURIComponent(p.slug)); }).join("") : '<p class="lead">No posts yet. Check back soon.</p>';
  }).catch(function () { grid.innerHTML = '<p class="lead">We couldn’t load the posts. Please refresh and try again.</p>'; });

  var latest = document.getElementById("latest-posts");
  if (latest) BlogDB.list(3).then(function (list) {
    if (!list.length) throw 0;
    latest.innerHTML = list.map(function (p) { return card(p, latest.getAttribute("data-href") + encodeURIComponent(p.slug)); }).join("");
  }).catch(function () { latest.closest("section").hidden = true; });

  var box = document.getElementById("post");
  if (box) {
    var slug = new URLSearchParams(location.search).get("slug") || "";
    var fail = function () {
      document.title = "Post not found | Ascend AI";
      box.innerHTML = '<h1>Post not found</h1><p class="lead">It may have moved or been removed.</p><p><a class="btn" href="../index.html">Back to the blog</a></p>';
    };
    if (!/^[a-z0-9-]+$/.test(slug)) fail();
    else BlogDB.one(slug).then(function (p) {
      if (!p) return fail();
      document.title = p.title + " | Ascend AI";
      var d = document.querySelector('meta[name="description"]'); if (d) d.content = p.excerpt || "";
      var src = BlogDB.img(p.image_url);
      box.innerHTML = '<a class="back" href="../index.html">Back to all posts</a><time datetime="' + MD.esc(p.published_at) + '">' + when(p.published_at) + "</time><h1>" + MD.esc(p.title) + "</h1>" +
        (src ? '<img class="post-cover" src="' + MD.esc(src) + '" alt="">' : "") + '<div class="prose">' + MD.render(p.body) + '</div><div class="cta"><div><h2>Want help with this?</h2><p>Tell us about the process that costs your team the most time.</p></div><a class="btn" href="' + root + 'contact/index.html">Book a call</a></div>';
    }).catch(fail);
  }
})();
