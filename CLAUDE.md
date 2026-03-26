# CLAUDE.md — Alavanka Site Guidelines

*Updated: March 2026*

## Project Overview

**Alavanka** operates two B2B revenue service lines from a single static site:

| Service | Domain | Language | Target |
|---------|--------|----------|--------|
| **Fractional CRO / Growth Execution** | alavanka.com.br | PT-BR primary | Brazilian B2B startups (post-Series A, R$8M+ ARR) |
| **Build, Operate & Transfer (BOT)** | alavanka.com → redirects to alavanka.com.br/market-entry | EN | International B2B tech expanding into LatAm |

- **Stack:** Pure HTML, CSS, vanilla JavaScript (ES5 only — no frameworks, no build tools beyond sitemap)
- **Hosting:** Vercel (static deploy from `/public`, GitHub push → auto-deploy)
- **Repo:** `github.com/carlosandre-collab/site` (private), branch `main`
- **DNS:** Registro.br (`.com.br`), DMARC `p=quarantine`, SPF/DKIM passing on `.com.br`

### About Carlos André (site author)

President of Oracle Brasil, CEO of AT&T LATAM, VP LATAM at Informatica, High Impact Mentor at Endeavor Brasil, IBGC Certified Board Member, lecturer at Insper (Empreendedorismo em Ação — Sales & Marketing). **$300M+ in cumulative revenue built as an operator** (this is the canonical figure — use it everywhere, never approximate).

---

## Directory Structure (Real)

```
/
├── public/                              # Vercel output directory
│   ├── index.html                       # Home (audience gate, i18n via translations.json)
│   ├── blog.html                        # Blog listing (reads blog/articles.json)
│   ├── investidores.html                # Investor-focused landing page
│   ├── assessment.html                  # Self-diagnosis tool (5 questions, no email gate)
│   ├── guia-fractional-cro-brasil.html  # Pillar page (ALWAYS in root, never blog/posts/)
│   ├── guia-7-sinais.html              # Lead magnet guide
│   ├── guia-crescimento-receita-b2b.html # Growth execution guide
│   ├── privacy.html                     # Privacy policy (bilingual PT/EN, LGPD + GDPR)
│   │
│   ├── market-entry.html               # BOT service main page (EN)
│   ├── market-entry/
│   │   ├── blog.html                   # Market entry blog listing (EN)
│   │   ├── articles.json               # Market entry article metadata
│   │   ├── overview.html               # Mid-funnel BOT model overview
│   │   ├── calculator.html             # ROI calculator (interactive)
│   │   └── posts/                      # EN-only market entry articles
│   │       ├── *.html                  # Individual articles
│   │       └── (7 pending Wix migration — see Migration Task below)
│   │
│   ├── blog/
│   │   ├── articles.json               # Blog article metadata (PT+EN)
│   │   ├── playbook-fractional-cro-brasil-2025.pdf
│   │   └── posts/                      # Bilingual blog articles
│   │       ├── *.html                  # Portuguese articles
│   │       └── *-en.html               # English translations
│   │
│   ├── assets/images/
│   │   ├── brand/                      # Logos (logo-preto.png, logo-completo-navy.svg, etc.)
│   │   ├── blog/                       # Blog thumbnails (JPG, 1200×630, ≤200KB)
│   │   ├── market-entry/              # Market entry thumbnails (JPG, 1200×630)
│   │   └── illustrations/             # SVG and HTML illustrations
│   │
│   ├── styles/
│   │   ├── nav-unified.css            # Nav component styles (all pages)
│   │   ├── blog-article.css           # Blog post styles (PT blog only)
│   │   ├── footer.css                 # Footer component styles
│   │   ├── styles-main.css            # Main page styles
│   │   └── styles-deferred.css        # Below-the-fold index styles
│   │
│   ├── components/
│   │   ├── nav.js                     # Nav component (injected, auto-detects page depth)
│   │   ├── footer.js                  # Footer component (injected)
│   │   ├── blog-tracking.js           # GA4 scroll/CTA event tracking
│   │   └── newsletter-widget.js       # Newsletter popup (Formspree, 8s/40% trigger)
│   │
│   ├── translations.json              # i18n strings for index.html (~74KB minified)
│   ├── sitemap.xml                    # Auto-generated
│   ├── robots.txt
│   └── llms.txt                       # LLM-friendly content index
│
├── generate-sitemap.js                # Node.js sitemap builder
├── validate-posts.sh                  # Pre-commit validator (canonical/hreflang/og:url)
├── install-hooks.sh                   # Git hook installer for validate-posts.sh
├── vercel.json                        # Deployment config, security headers, redirects
├── package.json
├── CLAUDE.md                          # This file
└── .github/
    └── copilot-instructions.md        # Legacy (superseded by this file)
```

---

## Absolute Rules

### NEVER do:
- Use `.webp` images or `<picture>` with webp source → always `.jpg` or `.png`
- Create images outside `assets/images/` (never `blog/images/`, `images/`, `public/images/`)
- Use purple palette (#6B5CE7, #5648c7, etc.) → navy + amber only
- Use Inter or Montserrat fonts → DM Sans + Space Grotesk + DM Serif Display only
- Write inline `<nav>` in HTML → always use nav.js + nav-unified.css
- Set more than 1 article as `"featured": true` in any articles.json
- Use dates outside `YYYY-MM-DD` format in articles.json
- Copy `blog/posts/` articles as templates for `market-entry/posts/` → paths differ for canonical, og:url, hreflang, x-default
- Use `localStorage` for language preference → use `sessionStorage` (`alavanka-lang`)
- Use `<nav>` tag for anything other than the main nav → breadcrumbs use `<div class="breadcrumb" role="navigation">`
- Use `blog-article.css` in market-entry posts → market-entry uses nav-unified.css + inline CSS only
- Generate output files for large HTML edits → always write bash/Python scripts for surgical in-place modification
- Use macOS `sed -i ''` for complex patterns → use Python3 string replacement instead (BSD sed fails silently)

### ALWAYS do:
- Create both PT and EN versions of every blog article
- Preserve ALL tracking tags on every touched page (see Analytics section)
- Run `validate-posts.sh` before committing blog/market-entry articles
- Use `assert` guards in Python patch scripts + create `.bak` backups
- Make scripts idempotent (safe to run multiple times)
- Pillar pages go in root (`public/`), never in `blog/posts/`
- Set `body { padding-top: 72px }` on pages using nav.js (nav is `position: fixed; height: 72px`)

---

## Design Tokens

### Colors
```css
:root {
  /* Navy (primary) */
  --accent: #1B3A5C;
  --accent-dark: #142D48;
  --accent-light: #2D5F8A;
  --accent-glow: rgba(27,58,92,0.25);
  --accent-bg: rgba(27,58,92,0.06);
  /* Amber (secondary) */
  --warm: #C8965A;
  --warm-dark: #B07D42;
  --warm-light: #D4A96F;
  --warm-glow: rgba(200,150,90,0.25);
  --warm-bg: rgba(200,150,90,0.08);
  /* Backgrounds */
  --bg: #FAFBFD;
  --bg-card: #FFFFFF;
  --bg-dark: #0D1B2A;  /* header, footer */
  /* Text */
  --text: #0D1B2A;
  --text-secondary: #4A5568;
  --text-muted: #8C8CA1;
  --text-inverse: #FFFFFF;
}
```

Usage: Primary CTAs = amber gradient (--warm → --warm-dark). Links/badges = --accent. Hover = --accent-light. Header/footer = --bg-dark. CTA box-shadow = --shadow-glow.

### Typography
```
DM Sans (400,500,600,700) → body, UI
Space Grotesk (500,600,700) → headings, article titles
DM Serif Display (400) → decorative titles (hero, gate overlay)
```

Google Fonts URL:
```
https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Space+Grotesk:wght@500;600;700&display=swap
```

---

## Analytics & Tracking (MUST be on every page)

| Tag | ID/Config | Placement |
|-----|-----------|-----------|
| **GA4** | `G-D8LLY1L1Z3` | Deferred, end of `<body>` |
| **Microsoft Clarity** | `vb4dciqpnm` | `<head>` |
| **LinkedIn Insight Tag** | PID `9076865` | Deferred, end of `<body>` |
| **Vercel Web Analytics** | `/_vercel/insights/script.js` | Before `</head>` |
| **Vercel Speed Insights** | `/_vercel/speed-insights/script.js` | Before `</head>` |

⚠️ Vercel has **two separate scripts** — both must be present. They are NOT the same tag.

---

## Navigation System

**Files:** `components/nav.js` (injects HTML+JS) + `styles/nav-unified.css` (CSS)

### Integration pattern:
```html
<!-- <head> -->
<link rel="stylesheet" href="[prefix]styles/nav-unified.css">
<script src="[prefix]components/nav.js" defer></script>
<!-- <body> -->
<nav id="main-nav"></nav>
```

Prefix: `""` for root pages, `"../../"` for `blog/posts/` and `market-entry/posts/`.

### Key behaviors:
- Auto-detects page depth for relative URLs
- `nav.js` uses hardcoded labels (NOT translations.json)
- Language toggle uses `sessionStorage` (not localStorage)
- If page defines `window.toggleLang()`, nav.js delegates to it
- Mobile sidebar: flat links, no accordion. Contact buttons (Calendly/WhatsApp) removed from mobile.
- Cross-site link uses `.nav-cross-link` class with distinct background
- `nav-unified.css` uses `nav` selector → never use raw `<nav>` for breadcrumbs (use `<div role="navigation">`)

### Desktop nav order:
Logo → Home (SVG) → Startup Growth (dropdown) → Expand to LatAm → Blog → Toggle idioma

### Startup Growth dropdown subitems:
O Problema → A Solução → Por Que Nós → Como Funciona → Playbook → FAQ → Contato

### Market Entry subitems:
The Challenge → BOT vs Traditional → 4-Year Journey → From Call to Ownership → Our Team → FAQ

---

## Audience Gate (index.html)

- Shows on: external referrer AND no `sessionStorage('alavanka-audience')`
- Skips on: sessionStorage exists OR referrer contains 'alavanka.com'
- Anti-flash: inline `<script>` in `<head>` (before `<style>`) adds class `gate-skip`
- CSS: `html.gate-skip .audience-gate { display: none !important }`
- Storage: `sessionStorage` (persists in session, clears on browser close)
- Gate options: need-based (2 cards), discrete escape link ("Só quero conhecer a Alavanka →")
- "International" and "Investor" audiences redirect immediately (no animation delay)
- Logo: `logo-completo-navy.svg`, 165px height, centered on mobile

---

## Relative Paths

| File location | Assets | Index | Blog | Components/Styles |
|---|---|---|---|---|
| root (`index`, `blog`, `guia-*`, `market-entry`) | `assets/images/` | `index.html` | `blog.html` | `components/` `styles/` |
| `blog/posts/` | `../../assets/images/` | `../../index.html` | `../../blog.html` | `../../components/` `../../styles/` |
| `market-entry/posts/` | `../../assets/images/` | `../../index.html` | `../../blog.html` | `../../components/` `../../styles/` |
| `articles.json` (both) | `assets/images/` (no ../../) | — | — | — |

---

## Blog Articles — New Article Checklist

1. Slugs: PT `kebab-sem-acentos`, EN `kebab-english`
2. Thumbnail: `assets/images/blog/[slug-pt]-thumb.jpg` (1200×630, ≤200KB, **never webp**)
3. HTML PT: `blog/posts/[slug-pt].html` — full meta, OG, hreflang (pt-BR + en + x-default), Schema.org (Article + FAQPage), nav placeholder, blog-article.css
4. HTML EN: `blog/posts/[slug-en].html` — translated, hreflang inverted
5. `blog/articles.json`: add entry with `featured: true`, previous featured → `false`
6. Run `validate-posts.sh`
7. Deploy: `git add -A && git commit -m "Novo artigo: [título]" && git push`

### articles.json template:
```json
{
  "id": "[slug-pt]",
  "slug": "[slug-pt]",
  "slugs": { "pt": "[slug-pt]", "en": "[slug-en]" },
  "featured": true,
  "category": { "pt": "[Cat]", "en": "[Cat]" },
  "title": { "pt": "[Título]", "en": "[Title]" },
  "excerpt": { "pt": "[150-200 chars]", "en": "[150-200 chars]" },
  "readTime": { "pt": "X min de leitura", "en": "X min read" },
  "date": "YYYY-MM-DD",
  "dateLabel": { "pt": "Mês Ano", "en": "Month Year" },
  "thumbnail": {
    "type": "image",
    "src": "assets/images/blog/[slug-pt]-thumb.jpg",
    "alt": { "pt": "[desc]", "en": "[desc]" }
  }
}
```

Categories (blog): Estratégia & Growth | Diagnóstico | Operações | Liderança | Casos
Categories (market-entry): International Market Expansion | Market Entry | Sales Strategies | Value Proposition | Strategy & Growth

### CRITICAL: blog/posts/ vs market-entry/posts/ differences

| Tag | blog/posts/ | market-entry/posts/ |
|-----|-------------|---------------------|
| canonical | `alavanka.com.br/blog/posts/[slug].html` | `alavanka.com.br/market-entry/posts/[slug].html` |
| og:url | same as canonical | same as canonical |
| hreflang x-default | `alavanka.com.br/blog/posts/[slug-en].html` | `alavanka.com.br/market-entry/posts/[slug].html` |
| CSS | blog-article.css (external or inline) | nav-unified.css + inline only (no blog-article.css) |
| Nav prefix | `../../` | `../../` |

**Never copy blog/posts/ files as templates for market-entry/posts/.** Always use existing market-entry/posts/ files as reference.

---

## Market Entry / BOT Section

- All visible references use "Build, Operate & Transfer" (BOT) — never "Market Entry Partnership" (MEP)
- BOT model: multi-year engagement, starts at $25K/month with declining fees, 100% ownership transfer to client
- `market-entry.html` includes ROI calculator CTAs ("Estimate Your LatAm ROI")
- `overview.html`: fade-in system removed (content renders immediately, no JS dependency)
- `market-entry/blog.html` is separate from `blog.html` — different articles.json, different audience

---

## Lead Capture System

- Single Google Apps Script (GAS) endpoint for all forms
- GAS URL: `https://script.google.com/macros/s/AKfycbya0njJJE2NBkoj0mjQUvuR-EBwBOX8-cXYRIeIXLLIMLlB9hRye3Zzteyo3dD7Qawg/exec`
- All leads → single Google Sheet + email alert to `carlos@alavanka.com`
- Forms use `URLSearchParams` (not JSON) for payload
- Newsletter toggles: dual (B2B Growth / LatAm Market Entry), pre-checked, bilingual labels
- `newsletter-widget.js`: appears after 8s or 40% scroll, dismissible for 7 days (localStorage)

---

## SEO

- 1 H1 per page. Title 50-60 chars. Description 150-160 chars.
- Alt on all images. 2-4 internal cross-links per article.
- Schema.org: Article + FAQPage (3 questions min) on blog posts; Organization + Person on index.html
- Pillar pages always in root (`public/`)
- `generate-sitemap.js` includes: all root pages, blog/posts, market-entry/posts, market-entry.html, investidores.html, assessment.html
- Google Search Console: 11 non-indexed URLs under review (mostly redirects)
- `/blog/compensacao-sistema-gtm.html` had 404 — revalidation submitted
- Positioning: "Startup Growth / LatAm Expansion" — avoid "Fractional CRO" as primary label in outreach

---

## Development Conventions

### Implementation approach:
- **Bash/Python scripts for all file edits** — never generate complete output files for large HTML
- Python3 `str.replace()` with `assert` guards on every pattern match
- Create `.bak` backups before modifying
- Scripts must be idempotent (safe to re-run)
- macOS BSD sed fails silently on many patterns → **always use Python3 instead**

### JavaScript:
- ES5 only (no `const`/`let`, no arrow functions in critical paths)
- IIFE pattern for scope isolation
- `'use strict';` enabled
- Graceful degradation (check for `gtag`/`translations` before use)

### CSS:
- Critical above-fold CSS inline in `<head>`
- Shared components in `styles/*.css`
- New page-specific styles in `<style>` blocks (not new CSS files)
- CSS variables duplicated between inline `:root` and external files — update BOTH

### Git:
- Commit format: `UX: [description] — rec #[N]` or `fix: [description]` or `feat: [description]`
- Keep commits small and focused
- Run `validate-posts.sh` before push

### Content tone:
- Founder-to-founder, first-person, authentic
- Avoids AI-detectable patterns
- No false metrics — numerical accuracy is non-negotiable
- Case studies framed as diagnostic/evaluation engagements when no ongoing relationship resulted
- LinkedIn hooks: visceral, case-based — not abstract thesis statements

### PPTX generation (when needed):
- Use pptxgenjs: write `deck.js` → `node deck.js` → PDF via `soffice.py` → QA via `pdftoppm`
- Absolute file paths for images
- Portrait photos: explicit aspect-ratio dimensions, NOT `sizing: cover`

---

## Pending Tasks

### Wix Migration (7 articles → market-entry/posts/)

| # | Slug | Date | Category | Thumb |
|---|------|------|----------|-------|
| 1 | `mastering-pricing-localization-latam-en` | Jan 2026 | International Market Expansion | PNG ready |
| 2 | `optimizing-latam-entry-model-en` | Dec 2025 | Market Entry | PNG ready |
| 3 | `navigating-pricing-challenges-b2b-en` | Mar 2025 | Sales Strategies | PNG ready |
| 4 | `b2b-pricing-value-proposition-en` | Mar 2025 | Value Proposition | **webp→jpg needed** |
| 5 | `product-market-fit-vs-gtm-fit-en` | Mar 2025 | Strategy & Growth | **webp→jpg needed** |
| 6 | `why-gtm-strategies-fail-en` | Feb 2025 | Strategy & Growth | JPG ready |
| 7 | `value-proposition-latam-expansion-en` | Dec 2024 | International Market Expansion | **webp→jpg needed** |

- webp→jpg conversion: Pillow RGBA→RGB on white background
- Wix thumb URL pattern: `https://static.wixstatic.com/media/[hash]~mv2.[ext]/v1/fill/w_1200,h_630,al_c,q_90/[hash]~mv2.[ext]`
- `market-entry/articles.json`: add 7 entries; art2 currently `featured: true` → set to `false` after art1 added

### Other pending:
- DKIM for `alavanka.com` (non-.br domain): generate key via Google Workspace Admin → Apps → Gmail → Authenticate Email, add TXT to DNS
- Backlink outreach: Endeavor Brasil, IBGC, Insper (warm), Crunchbase/Clutch/G2 (directories), Startups.com.br (Gustavo Brigatto)
- Google Search Console: 11 non-indexed URLs under review

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Article not showing | Check articles.json entry + deploy |
| Broken image | Check path (`../../assets/images/` vs `assets/images/`) and extension (.jpg/.png, never .webp) |
| Nav not appearing | Missing nav.js or nav-unified.css in `<head>` |
| Purple colors anywhere | Migrate to navy/amber tokens |
| Gate flash on return | Missing inline `gate-skip` script in `<head>` (before `<style>`) |
| Content invisible below hero on mobile | Check for `fade-in` CSS with `opacity: 0` not triggered by JS |
| Language toggle broken | Check sessionStorage (not localStorage), verify nav.js `activeContext` propagation |
| Deploy stuck | Promote to Production in Vercel or empty commit push |
| blog-article.css breaking market-entry | Remove it — market-entry uses inline CSS only |
| Breadcrumb breaking layout | Use `<div role="navigation">` not `<nav>` (nav-unified.css styles all `<nav>` elements) |
