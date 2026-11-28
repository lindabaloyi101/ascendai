/* Reads published posts from Supabase (public, read-only). Without a Supabase config it shows one demo post. */
(function () {
  var cfg = (window.ASCEND || {}).supabase || {}, ok = !!(cfg.url && cfg.anonKey), root = document.body.getAttribute("data-root") || "";
  var DEMO = [{ slug: "welcome-to-the-ascend-ai-blog", title: "Welcome to the Ascend AI blog", published_at: "2026-11-25",
    excerpt: "Where we share practical ideas for saving your team time with AI, automation and software.",
    image_url: "assets/img/blog/welcome-to-the-ascend-ai-blog.jpg",
    body: "Most businesses don't need a big AI programme. They need one slow, repetitive process fixed well.\n\n## Where to start\n\nLook for work that is:\n\n- repeated every week\n- done by hand across several tools\n- a regular source of errors or delays\n\n## What we do\n\nWe map the process, **automate the steps that don't need a person**, and keep people in charge of decisions.\n\nIf you'd like to talk it through, [book a call](" + root + "contact/index.html)." }];
  function get(q) {
    return fetch(cfg.url + "/rest/v1/posts?" + q, { headers: { apikey: cfg.anonKey } }).then(function (r) {
      if (r.ok) return r.json();
      return r.text().then(function (t) { console.error("[blog] Could not load posts (HTTP " + r.status + "): " + t); throw new Error("HTTP " + r.status); });
    });
  }
  window.BlogDB = {
    ok: ok,
    list: function (limit) {
      if (!ok) return Promise.resolve(DEMO.slice(0, limit || 99));
      return get("select=slug,title,excerpt,image_url,published_at&published=eq.true&order=published_at.desc,created_at.desc" + (limit ? "&limit=" + limit : ""));
    },
    one: function (slug) {
      if (!ok) return Promise.resolve(DEMO.filter(function (p) { return p.slug === slug; })[0] || null);
      return get("select=*&published=eq.true&slug=eq." + encodeURIComponent(slug) + "&limit=1").then(function (a) { return a[0] || null; });
    },
    img: function (u) { return !u ? "" : /^https?:/i.test(u) ? u : root + u; }
  };
})();
