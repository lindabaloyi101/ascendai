/* Blog admin: email and password login (Supabase), then create, edit, publish and delete posts. */
(function () {
  var cfg = (window.ASCEND || {}).supabase || {}, ok = !!(cfg.url && cfg.anonKey), SK = "ascend_sb_session", BUCKET = "blog-images";
  var $ = function (id) { return document.getElementById(id); }, sess = null, posts = [], cur = null, blob = null, img = "", dirty = false, recTok = "";
  try { sess = JSON.parse(localStorage.getItem(SK) || "null"); } catch (e) {}
  function say(m, err) { var s = $("status"); s.textContent = m; s.className = "form-status" + (err ? " err" : ""); }
  function keep(s) { sess = s; if (s) localStorage.setItem(SK, JSON.stringify(s)); else localStorage.removeItem(SK); }
  function setSession(d) { keep({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + (d.expires_in || 3600) * 1000 }); }
  function parse(r) {
    return r.text().then(function (t) {
      var d = null; try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; }
      if (!r.ok) { var e = new Error((d && (d.msg || d.message || d.error_description || d.error)) || "Request failed (" + r.status + ")"); e.status = r.status; throw e; }
      return d;
    });
  }
  function auth(path, body, tk, method) {
    var h = { apikey: cfg.anonKey, "Content-Type": "application/json" }; if (tk) h.Authorization = "Bearer " + tk;
    return fetch(cfg.url + "/auth/v1" + path, { method: method || "POST", headers: h, body: JSON.stringify(body) }).then(parse);
  }
  function ended() { var e = new Error("Your session ended. Please sign in again."); e.status = 401; return e; }
  function token() {
    if (!sess) return Promise.reject(ended());
    if (sess.expires_at - Date.now() > 60000) return Promise.resolve(sess.access_token);
    return auth("/token?grant_type=refresh_token", { refresh_token: sess.refresh_token }).then(function (d) { setSession(d); return sess.access_token; }).catch(function () { keep(null); throw ended(); });
  }
  function api(path, o) {
    o = o || {};
    return token().then(function (tk) {
      var h = { apikey: cfg.anonKey, Authorization: "Bearer " + tk };
      if (o.type) h["Content-Type"] = o.type; else if (o.json) h["Content-Type"] = "application/json";
      if (o.prefer) h.Prefer = o.prefer;
      return fetch(cfg.url + path, { method: o.method || "GET", headers: h, body: o.json ? JSON.stringify(o.json) : o.raw }).then(parse);
    });
  }
  function write(path, method, json) {
    return api(path, { method: method, json: json, prefer: "return=representation" }).then(function (rows) {
      if (!rows || !rows.length) { var e = new Error("Nothing was saved: the database blocked the change. Check the policies in supabase/setup.sql."); e.status = 0; throw e; }
      return rows;
    });
  }
  function fail(e) {
    if (e.status === 401) { keep(null); view("login"); return say("Your session ended. Please sign in again.", 1); }
    if (e.status === 403 && /permission denied/i.test(e.message)) return say("The database is refusing access to the posts table. Run supabase/grants.sql in the Supabase SQL Editor (see SETUP-BLOG.md), then reload this page.", 1);
    if (e.status === 403 && /row-level security/i.test(e.message)) return say("Your account isn\u2019t allowed to do that. Check the policies in supabase/setup.sql.", 1);
    say(e.status === 409 ? "A post with this title already exists. Change the title." : e.message, 1);
  }
  function view(v) { ["setup", "login", "reset", "app"].forEach(function (id) { $(id).hidden = id !== v; }); }
  function slugify(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function shrink(file) {
    return new Promise(function (res, rej) {
      var im = new Image(), u = URL.createObjectURL(file);
      im.onload = function () {
        var w = Math.min(1600, im.width), h = Math.round(im.height * w / im.width), c = document.createElement("canvas"), x = c.getContext("2d");
        c.width = w; c.height = h; x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h); URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? res(b) : rej(new Error("That file isn’t an image we can read.")); }, "image/jpeg", 0.85);
      };
      im.onerror = function () { rej(new Error("That file isn’t an image we can read.")); };
      im.src = u;
    });
  }
  function rmImage(url) {
    var k = "/object/public/" + BUCKET + "/", i = url ? url.indexOf(k) : -1;
    return i < 0 ? Promise.resolve() : api("/storage/v1/object/" + BUCKET + "/" + url.slice(i + k.length), { method: "DELETE" }).catch(function () {});
  }
  function refresh() {
    return api("/rest/v1/posts?select=id,slug,title,published,published_at,image_url&order=published_at.desc,created_at.desc").then(function (a) {
      posts = a;
      $("list").innerHTML = a.length ? a.map(function (p) {
        return '<div class="admin-row"><div><strong>' + MD.esc(p.title) + '</strong><span class="meta">' + MD.esc(p.published_at) + " | " + (p.published ? "Published" : "Draft") + '</span></div><div class="btn-row">' +
          (p.published ? '<a class="btn btn--ghost" href="../post/index.html?slug=' + encodeURIComponent(p.slug) + '">View</a>' : "") +
          '<button class="btn btn--ghost" type="button" data-edit="' + p.id + '">Edit</button><button class="btn btn--ghost" type="button" data-pub="' + p.id + '">' + (p.published ? "Unpublish" : "Publish") +
          '</button><button class="btn btn--ghost" type="button" data-del="' + p.id + '">Delete</button></div></div>';
      }).join("") : '<p class="lead">No posts yet. Select “New post” to write your first one.</p>';
    }).catch(fail);
  }
  var f = $("f"), E = f.elements;
  function slugOf() { return cur && cur.id ? cur.slug : slugify(E.title.value); }
  function line() { $("slugline").textContent = "Web address: /blog/post/?slug=" + (slugOf() || "…"); }
  function paint() { var s = blob ? URL.createObjectURL(blob) : img ? (/^https?:/i.test(img) ? img : "../../" + img) : ""; $("coverPrev").hidden = !s; $("rmcover").hidden = !s; if (s) $("coverPrev").src = s; }
  function close(force) { if (!force && dirty && !confirm("Discard your unsaved changes?")) return; f.hidden = true; cur = null; blob = null; img = ""; dirty = false; $("preview").hidden = true; }
  function open(p) {
    if (!f.hidden && dirty && !confirm("Discard your unsaved changes?")) return;
    cur = p || { id: null }; blob = null; img = p ? p.image_url || "" : ""; f.reset();
    E.title.value = p ? p.title : ""; E.date.value = p ? p.published_at : today(); E.excerpt.value = p ? p.excerpt : ""; E.body.value = p ? p.body : ""; E.published.checked = p ? p.published : false;
    $("heading").textContent = p ? "Edit post" : "New post"; $("preview").hidden = true; dirty = false; line(); paint(); f.hidden = false; E.title.focus(); f.scrollIntoView({ behavior: "smooth" });
  }
  function enter() { view("app"); say(""); return refresh(); }

  $("login").addEventListener("submit", function (e) {
    e.preventDefault(); say("Signing in…");
    auth("/token?grant_type=password", { email: $("email").value.trim(), password: $("password").value }).then(function (d) { setSession(d); $("password").value = ""; return enter(); })
      .catch(function (er) { say(er.status === 400 ? "Email or password is incorrect." : er.message, 1); });
  });
  $("forgot").onclick = function () {
    var em = $("email").value.trim(); if (!em) return say("Type your email above first, then select Forgot password.", 1);
    auth("/recover?redirect_to=" + encodeURIComponent(location.origin + location.pathname), { email: em }).then(function () { say("If that email has an account, a reset link is on its way."); }).catch(function (er) { say(er.message, 1); });
  };
  $("reset").addEventListener("submit", function (e) {
    e.preventDefault();
    auth("/user", { password: $("newpass").value }, recTok, "PUT").then(function () { $("newpass").value = ""; view("login"); say("Password updated. Sign in with your new password."); }).catch(function (er) { say(er.message, 1); });
  });
  $("out").onclick = function () { if (dirty && !confirm("Discard your unsaved changes?")) return; var t = sess && sess.access_token; if (t) auth("/logout", {}, t).catch(function () {}); keep(null); close(true); view("login"); say("You’re signed out."); };
  $("new").onclick = function () { open(null); };
  $("cancel").onclick = function () { close(false); };
  $("prev").onclick = function () { var p = $("preview"); p.hidden = !p.hidden; if (!p.hidden) p.innerHTML = MD.render(E.body.value); };
  f.addEventListener("input", function () { dirty = true; if (e_is_title(arguments[0])) line(); });
  function e_is_title(ev) { return ev.target === E.title; }
  window.addEventListener("beforeunload", function (e) { if (dirty && !f.hidden) { e.preventDefault(); e.returnValue = ""; } });
  $("cover").onchange = function () { var file = this.files[0]; if (!file) return; shrink(file).then(function (b) { blob = b; dirty = true; paint(); }).catch(function (er) { say(er.message, 1); }); };
  $("rmcover").onclick = function () { blob = null; img = ""; $("cover").value = ""; dirty = true; paint(); };
  $("tools").addEventListener("click", function (e) {
    var k = e.target.getAttribute("data-md"); if (!k) return;
    var t = E.body, s = t.selectionStart, en = t.selectionEnd, sel = t.value.slice(s, en);
    var m = { h: ["## ", "", "Heading"], b: ["**", "**", "bold text"], i: ["*", "*", "italic text"], l: ["[", "](https://)", "link text"], u: ["- ", "", "List item"] }[k];
    t.setRangeText(m[0] + (sel || m[2]) + m[1], s, en, "select"); t.focus(); dirty = true;
  });
  $("list").addEventListener("click", function (e) {
    var id = e.target.getAttribute("data-edit") || e.target.getAttribute("data-pub") || e.target.getAttribute("data-del"); if (!id) return;
    var p = posts.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    if (e.target.hasAttribute("data-edit")) { say("Loading…"); api("/rest/v1/posts?select=*&id=eq." + id).then(function (a) { say(""); open(a[0]); }).catch(fail); }
    else if (e.target.hasAttribute("data-pub")) { say("Updating…"); write("/rest/v1/posts?id=eq." + id, "PATCH", { published: !p.published }).then(function () { say(p.published ? "Moved to drafts." : "Published. The post is live."); return refresh(); }).catch(fail); }
    else if (confirm("Delete “" + p.title + "”? This removes the post and its image.")) {
      say("Deleting…");
      write("/rest/v1/posts?id=eq." + id, "DELETE").then(function () { return rmImage(p.image_url); }).then(function () { say("Post deleted."); return refresh(); }).catch(fail);
    }
  });
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var slug = slugOf(); if (!slug) return say("Add a title first.", 1);
    var row = { title: E.title.value.trim(), slug: slug, excerpt: E.excerpt.value.trim(), body: E.body.value, published: E.published.checked, published_at: E.date.value, image_url: img };
    var old = cur.id ? cur.image_url : "", step = Promise.resolve(), up = ""; say("Saving…");
    if (blob) { var name = slug + "-" + Date.now().toString(36) + ".jpg"; step = api("/storage/v1/object/" + BUCKET + "/" + name, { method: "POST", raw: blob, type: "image/jpeg" }).then(function () { up = row.image_url = cfg.url + "/storage/v1/object/public/" + BUCKET + "/" + name; }); }
    step.then(function () {
      return (cur.id ? write("/rest/v1/posts?id=eq." + cur.id, "PATCH", row) : write("/rest/v1/posts", "POST", row))
        .catch(function (er) { return (up ? rmImage(up) : Promise.resolve()).then(function () { throw er; }); });
    })
      .then(function () { return old && old !== row.image_url ? rmImage(old) : null; })
      .then(function () { close(true); say(row.published ? "Saved. The post is live." : "Saved as a draft."); return refresh(); }).catch(fail);
  });

  if (!ok) return view("setup");
  var hp = new URLSearchParams(location.hash.slice(1));
  if (hp.get("type") === "recovery" && hp.get("access_token")) { recTok = hp.get("access_token"); history.replaceState(null, "", location.pathname); return view("reset"); }
  if (!sess) return view("login");
  token().then(enter).catch(function () { view("login"); });
})();
