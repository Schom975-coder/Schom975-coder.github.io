# Scott Hom — Portfolio Site

Personal portfolio hosted on GitHub Pages at **https://schom975-coder.github.io**

---

## 🚀 First-Time Setup (do this once)

### 1. Create the GitHub repo

The repo **must** be named `Schom975-coder.github.io` for GitHub Pages to serve it at the root URL.

```
https://github.com/new  →  Repository name: Schom975-coder.github.io
Visibility: Public
```

### 2. Push these files

```bash
# Inside this folder
git init
git add .
git commit -m "Initial portfolio scaffold"
git branch -M main
git remote add origin https://github.com/Schom975-coder/Schom975-coder.github.io.git
git push -u origin main
```

### 3. Enable GitHub Pages with Actions

In the repo on GitHub:

```
Settings → Pages → Source → GitHub Actions
```

That's it. The workflow in `.github/workflows/deploy.yml` will fire automatically and your site will be live at:

**https://schom975-coder.github.io**

_(First deploy usually takes 1–2 minutes)_

---

## ✏️ Making Changes

Edit any file locally, then:

```bash
git add .
git commit -m "Update about section"
git push
```

GitHub Actions picks it up automatically — the site updates in ~60 seconds.

---

## 📁 Project Structure

```
Schom975-coder.github.io/
│
├── index.html                  # Main HTML — all sections live here
│
├── assets/
│   ├── css/
│   │   └── style.css           # All styles — edit design tokens at the top
│   ├── js/
│   │   └── main.js             # Nav, scroll animations, active links
│   └── images/
│       ├── profile.jpg         # ← drop your photo here
│       ├── project1.png        # ← project screenshots
│       ├── project2.png
│       └── og-preview.png      # ← social share preview image (1200×630)
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions auto-deploy pipeline
│
└── README.md                   # This file
```

---

## 🎨 Customising the Design

All colour and spacing values live at the top of `assets/css/style.css` as CSS variables:

```css
:root {
  --bg:         #090912;   /* page background  */
  --blue:       #3b82f6;   /* primary accent   */
  --blue-light: #60a5fa;   /* hover / lighter  */
  --text-1:     #f1f5f9;   /* headings         */
  --text-2:     #94a3b8;   /* body text        */
  /* … */
}
```

Change any value and every component that uses it updates automatically.

---

## 📝 Content TODOs

Search for `TODO` in `index.html` to find every placeholder. Quick checklist:

- [ ] Hero badge — update status text
- [ ] Hero — update role/title
- [ ] Hero — update tagline / bio
- [ ] About — write your real bio
- [ ] About — update stats (years, projects, clients)
- [ ] About — replace photo placeholder with `<img src="assets/images/profile.jpg">`
- [ ] Skills — update skill cards and tags to match your actual skills
- [ ] Experience — replace all 3 timeline items with real jobs
- [ ] Projects — replace 3 project cards with real projects + screenshots
- [ ] Contact — add real email address
- [ ] Contact — add real LinkedIn and Twitter URLs
- [ ] Contact — add résumé PDF at `assets/resume.pdf`
- [ ] Meta tags — add `og:image` once site is live

---

## 🔮 Future: Moving to a Backend / Hosting Platform

This site is architected to be easily migrated when needed.

**If you add a contact form (e.g. Formspree, Resend, or your own API):**
- The form HTML goes in the `#contact` section of `index.html`
- No other changes needed for a third-party form service

**If you migrate to a JS framework (e.g. Next.js, Astro):**
- The CSS variables in `style.css` can move to a `globals.css` unchanged
- Each HTML section maps cleanly to a React/Astro component
- The GitHub Actions workflow just needs `path: "./dist"` updated to your build output

**If you add a custom domain later:**
1. Create a file called `CNAME` in the repo root with just your domain: `scotthom.com`
2. Point your domain's DNS to GitHub Pages (A records or CNAME)
3. Update `og:url` in `index.html`

---

## 🛠 Local Development

No build tools needed — just open `index.html` in a browser, or use a local server:

```bash
# Python (built-in)
python3 -m http.server 3000

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:3000`
