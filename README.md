# Ascend AI website

Static site: plain HTML, CSS and JavaScript. No build step.

## Structure
```
index.html                  Home
contact/index.html          Contact page and form
services/<service>/index.html   One folder per service (clean URLs)
blog/                       Blog list, post page (blog/post) and admin (blog/admin)
404.html                    Not-found page
assets/css/                 tokens (colours, fonts) > base > layout > components > pages/
assets/js/                  config.js (email, form endpoint), nav.js, contact-form.js
assets/img/                 logo, favicon, social share image
robots.txt, sitemap.xml
```

## Run locally
All internal links are relative, so you can double-click `index.html` to open the site, or serve the folder with any static server (`npx serve .`). Run the server from the folder that contains `index.html`.

## Before launch
1. Replace `https://ascendai.co.za` with your real domain in all HTML files, `sitemap.xml` and `robots.txt`.
2. Contact form: set `formEndpoint` in `assets/js/config.js` (Formspree, Basin or similar). Until then it opens the visitor's email app.
3. Change colours and fonts only in `assets/css/tokens.css`. Contact details live in the page footers and `config.js`.
4. `404.html` uses root-relative paths on purpose (hosts serve it from any URL), so it only styles correctly when hosted at a domain root.
5. Header and footer are repeated in each HTML file; update all pages when they change.

## Deploy
Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, cPanel). Use `404.html` as the not-found page.

## Blog
Posts live in a Supabase project (free), not in this repository. Setup takes about 10 minutes: follow `SETUP-BLOG.md`, then add your Supabase URL and anon key to `assets/js/config.js`.
Manage posts at `/blog/admin/` (email and password login). Edits go live instantly. Formatting in posts: `# Heading`, `## Subheading`, `**bold**`, `*italic*`, `[text](url)`, and `-` lists.
Until Supabase is connected, the blog shows one demo post so you can check the layout.
