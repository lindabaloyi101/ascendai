#!/usr/bin/env python3
"""Rewrites the shared header and footer on every page, so the menu lives in ONE place (here).
Run from the project root:   python3 tools/apply-layout.py
Edit SERVICES / INDUSTRIES / PHONE below, run it, and every page updates."""
import os, re

EMAIL = "lindabaloyi101@gmail.com"
PHONE_DISPLAY, PHONE_TEL = "076 330 3432", "+27763303432"
SERVICES = [  # (slug, label, footer label)
    ("ai-marketing", "AI marketing"), ("automation", "Automation"),
    ("software-development", "Software development"), ("ai-consulting", "AI consulting")]
INDUSTRIES = [  # (slug, label, short description)
    ("car-dealerships", "Car dealerships", "WhatsApp automation"),
    ("restaurants", "Restaurants", "WhatsApp automation"),
    ("daycare-centres", "Daycare centres", "Management tool")]
IND_SLUGS = {s for s, _, _ in INDUSTRIES}

def build(path):
    """Return (prefix, absolute?) for a page path relative to the root."""
    if path == "404.html": return "/", True
    depth = path.count("/")
    return "../" * depth, False

def link(prefix, absolute, rel):  # rel like services/automation
    return f"/{rel}/" if absolute else f"{prefix}{rel}/index.html"

def header(path):
    prefix, ab = build(path)
    home = "/" if ab else f"{prefix}index.html"
    parts = path.split("/")
    cur_service = parts[1] if parts[0] == "services" and len(parts) > 2 else None
    cur_ind = parts[1] if parts[0] == "industries" and len(parts) > 2 else None
    nav = ""
    for slug, label in SERVICES:
        cur = ' aria-current="page"' if cur_service == slug else ""
        nav += f'<a href="{link(prefix, ab, "services/" + slug)}"{cur}>{label}</a>'
    items = ""
    for slug, label, desc in INDUSTRIES:
        cur = ' aria-current="page"' if cur_ind == slug else ""
        items += f'<a href="{link(prefix, ab, "industries/" + slug)}"{cur}><b>{label}</b><small>{desc}</small></a>'
    iscur = " is-current" if cur_ind else ""
    nav += (f'<div class="dropdown{iscur}"><button class="dropdown-toggle" type="button" aria-expanded="false" '
            f'aria-controls="menu-industries">Industries</button><div class="dropdown-menu" id="menu-industries">{items}</div></div>')
    if cur_ind:  # industry landing pages: the button jumps to that page's own booking form
        cta = '<a class="btn" href="#book">Book a demo</a>'
    else:
        cta = f'<a class="btn" href="{"/contact/" if ab else prefix + "contact/index.html"}">Book a call</a>'
    return (f'<header class="site-header"><div class="container bar"><a class="brand" href="{home}">'
            f'<img src="{"/" if ab else prefix}assets/img/logo.png" alt="" width="28" height="29">Ascend AI</a>\n'
            f'<button class="nav-toggle" aria-expanded="false" aria-controls="nav">Menu</button>\n'
            f'<nav id="nav" class="nav" aria-label="Main">{nav}{cta}</nav></div></header>')

def footer(path):
    prefix, ab = build(path)
    home = "/" if ab else f"{prefix}index.html"
    sv = "".join(f'<a href="{link(prefix, ab, "services/" + s)}">{l}</a>' for s, l in SERVICES)
    ind = "".join(f'<a href="{link(prefix, ab, "industries/" + s)}">{l}</a>' for s, l, _ in INDUSTRIES)
    blog = "/blog/" if ab else f"{prefix}blog/index.html"
    contact = "/contact/" if ab else f"{prefix}contact/index.html"
    return (f'<footer class="site-footer"><div class="container"><div><a class="brand" href="{home}">'
            f'<img src="{"/" if ab else prefix}assets/img/logo.png" alt="" width="28" height="29">Ascend AI</a>'
            f'<p>AI marketing, automation, AI consulting and software development.</p><a href="{blog}">Blog</a></div>\n'
            f'<div><h3>Services</h3>{sv}</div>\n<div><h3>Industries</h3>{ind}</div>\n'
            f'<div><h3>Contact</h3><a href="{contact}">Book a call</a><a href="mailto:{EMAIL}">{EMAIL}</a>'
            f'<a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></div>\n'
            f'<p class="copyright">© 2026 Ascend AI. All rights reserved.</p></div></footer>')

def main():
    n = 0
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "tools", "supabase")]
        for f in files:
            if not f.endswith(".html"): continue
            path = os.path.join(root, f)[2:]
            s = open(path, encoding="utf-8").read()
            if '<header class="site-header">' not in s: continue  # redirect stubs, previews
            s = re.sub(r'<header class="site-header">.*?</header>', lambda m: header(path), s, flags=re.S)
            s = re.sub(r'<footer class="site-footer">.*?</footer>', lambda m: footer(path), s, flags=re.S)
            open(path, "w", encoding="utf-8").write(s); n += 1
    print("updated", n, "pages")

if __name__ == "__main__":
    main()
