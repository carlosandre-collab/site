# CLAUDE.md — Alavanka Site Guidelines

*Updated: March 2026 (post-audit rewrite)*

## Project Overview

**Alavanka** operates two B2B revenue service lines from a single static site:

| Service | Domain | Language | Target |
|---------|--------|----------|--------|
| **Growth Execution (Fractional CRO)** | alavanka.com.br | PT-BR primary | Brazilian B2B startups (post-Series A, R$8M+ ARR) |
| **Build, Operate & Transfer (BOT)** | alavanka.com → redirects to alavanka.com.br/market-entry | EN | International B2B tech expanding into LatAm |

- **Stack:** Pure HTML, CSS, vanilla JavaScript (ES5 for shared components) — no frameworks, no build tools beyond sitemap
- **Hosting:** Vercel (static deploy from `/public`, GitHub push → auto-deploy)
- **Repo:** `github.com/carlosandre-collab/site` (private), branch `main`
- **DNS:** Registro.br (`.com.br`), DMARC `p=quarantine`, SPF/DKIM passing on `.com.br`

### About Carlos André (site author)

President of Oracle Brasil, CEO of AT&T LATAM, VP LATAM at Informatica, High Impact Mentor at Endeavor Brasil, IBGC Certified Board Member, lecturer at Insper (Empreendedorismo em Ação — Sales & Marketing), Harvard Business School (Finance for Senior Executives), Columbia Business School. **$300M+ in cumulative revenue built as an operator** (this is the canonical figure — use it everywhere, never approximate).

---

## Directory Structure

```
/
├── public/                              # Vercel output directory
│   ├── index.html                       # Home (audience gate, i18n via translations.json)
│   ├── blog.html                        # Blog listing (reads blog/articles.json)
│   ├── investidores.html                # Investor-focused landing page
│   ├── assessment.html                  # Self-diagnosis tool (5 questions)
│   ├── guia-crescimento-receita-b2b.html # Pillar page (ALWAYS in root)
│   ├── guia-7-sinais.html              # Lead magnet guide
│   ├── privacy.html                     # Privacy policy (bilingual PT/EN)
│   ├── market-entry.html               # BOT service main page (EN)
│   ├── market-entry/
│   │   ├── blog.html                   # Market entry blog listing (EN)
│   │   ├── articles.json               # Market entry article metadata
│   │   ├── overview.html               # Mid-funnel BOT model overview
│   │   ├── calculator.html             # ROI calculator (interactive)
│   │   └── posts/*.html                # EN-only market entry articles
│   ├── blog/
│   │   ├── articles.json               # Blog article metadata (PT+EN)
│   │   └── posts/                      # Bilingual blog articles
│   │       ├── *.html                  # Portuguese articles
│   │       └── *-en.html               # English translations
│   ├── assets/images/
│   │   ├── brand/                      # Logos (PNG, SVG)
│   │   ├── blog/                       # Blog thumbnails (JPG, 1200×630, ≤200KB)
│   │   └── market-entry/              # Market entry thumbnails (JPG, 1200×630)
│   ├── styles/
│   │   ├── nav-unified.css            # Nav component (all pages)
│   │   ├── blog-article.css           # Blog post styles (typography, callouts, tables, CTA)
│   │   ├── footer.css                 # Footer component styles
│   │   └── styles-main.css            # Index page styles
│   ├── components/
│   │   ├── nav.js                     # Nav component (injected, auto-detects depth + context)
│   │   ├── footer.js                  # Footer component (injected, dual context BR/MEP)
│   │   ├── blog-tracking.js           # GA4 scroll/CTA event tracking
│   │   ├── newsletter-widget.js       # Newsletter popup
│   │   └── ux-enhancements.js         # Scroll progress, etc.
│   ├── translations.json              # i18n strings for index.html (~74KB)
│   ├── sitemap.xml                    # Auto-generated (42 URLs)
│   ├── robots.txt                     # Crawler directives (AI bots explicitly allowed)
│   └── llms.txt                       # LLM-friendly content index
├── generate-sitemap.js                # Node.js sitemap builder
├── validate-posts.sh                  # Pre-commit validator (canonical/hreflang/og:url)
├── vercel.json                        # Deploy config, security headers, CSP, redirects
└── CLAUDE.md                          # This file
```

---

## Absolute Rules

### NEVER do:
- Use `.webp` images or `<picture>` with webp source → always `.jpg` or `.png`
- Create images outside `assets/images/`
- Use purple palette → navy + amber only
- Use Inter or Montserrat fonts → DM Sans + Space Grotesk + DM Serif Display only
- Write inline `<nav>` → always use nav.js + nav-unified.css
- Set more than 1 `"featured": true` in any articles.json
- Copy `blog/posts/` as template for `market-entry/posts/` → paths differ
- Use `localStorage` for language → use `sessionStorage` (`alavanka-lang`)
- Put GA4 in `<head>` → always at end of `<body>` (async)
- Generate output files for large HTML edits → write Python scripts
- Use macOS `sed` → use Python3 `str.replace()` instead
- **Write an article without a personal case from Carlos André**
- **Deliver an article without a LinkedIn post**

### ALWAYS do:
- Create both PT and EN versions of every blog article
- Preserve ALL 5 tracking tags on every page (GA4, Clarity, LinkedIn, Vercel Analytics, Vercel Speed Insights)
- Include footer.js + footer.css on every article page
- Run `validate-posts.sh` before committing articles
- Use `assert` guards + `.bak` backups in Python scripts
- Make scripts idempotent

---

## Design Tokens (Single Source of Truth)

### Colors
```css
:root {
  --accent: #1B3A5C; --accent-dark: #142D48; --accent-light: #2D5F8A;
  --accent-glow: rgba(27,58,92,0.25); --accent-bg: rgba(27,58,92,0.06);
  /* Amber — CANONICAL: #C8965A everywhere, never #D4883A */
  --warm: #C8965A; --warm-dark: #B07D42; --warm-light: #D4A96F;
  --warm-glow: rgba(200,150,90,0.25); --warm-bg: rgba(200,150,90,0.08);
  --bg: #FAFBFD; --bg-card: #FFFFFF; --bg-dark: #0D1B2A;
  --text: #0D1B2A; --text-secondary: #4A5568; --text-muted: #8C8CA1;
  --border: #E5E7EB; --shadow-glow: 0 8px 32px rgba(200,150,90,0.3);
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 24px; --r-full: 9999px;
}
```

### Typography
```
DM Sans (400,500,600,700) → body, UI, buttons
Space Grotesk (500,600,700) → headings, article titles, badges
DM Serif Display (400) → decorative hero titles, gate overlay
```

---

## Analytics (ALL 5 required on EVERY page)

| Tag | ID | Position |
|-----|----|----------|
| GA4 | `G-D8LLY1L1Z3` | End of `<body>` (async) |
| Microsoft Clarity | `vb4dciqpnm` | `<head>` |
| LinkedIn Insight | PID `9076865` | `<head>` |
| Vercel Analytics | `/_vercel/insights/script.js` | `<head>` or end of `<body>` (defer) |
| Vercel Speed Insights | `/_vercel/speed-insights/script.js` | `<head>` or end of `<body>` (defer) |

---

## Shared Components

### Navigation
`components/nav.js` + `styles/nav-unified.css` → `<nav id="main-nav"></nav>`
Prefix: `""` (root) or `"../../"` (blog/posts, market-entry/posts). Auto-detects context.

### Footer
`components/footer.js` + `styles/footer.css` → `<footer id="main-footer"></footer>`
Same prefix as nav. Dual context (BR/MEP) auto-detected.

### Audience Gate (index.html only)
sessionStorage-based. Anti-flash via inline script in `<head>` adding `.gate-skip`.

---

## New Article — Complete Workflow

### Step 0: Content Briefing (MANDATORY — before writing anything)

Claude MUST:

1. **Ask for a personal case** — Every article MUST include a real story from Carlos André (Oracle, AT&T, Informatica, Endeavor mentoring, or Alavanka clients). Ask: *"Qual caso pessoal ou experiência sua encaixa nesse tema?"*
2. **Confirm topic, key points, and CTA preference**
3. **Identify 2-4 existing articles for cross-linking**

⚠️ **Never proceed without a personal case. The case is what differentiates our content from generic AI material. If the user says "não tenho caso", suggest angles from their known track record and ask them to validate.**

### Step 1: Create Article Files

1. Slugs: PT `kebab-sem-acentos`, EN `kebab-english`
2. Thumbnail: `assets/images/blog/[slug-pt]-thumb.jpg` (1200×630, ≤200KB)
3. HTML PT + EN with: all meta/OG/hreflang, Schema.org, all 5 tracking tags, nav.js, footer.js, blog-article.css, GA4 at end of body
4. `blog/articles.json`: add with `featured: true`, previous → `false`
5. Run `validate-posts.sh`
6. Commit: `git add -A && git commit -m "feat: novo artigo — [título]" && git push`

### Step 2: Generate LinkedIn Post (MANDATORY — deliver with every article)

Every article delivery MUST include a LinkedIn post ready to publish:

**Structure:**
1. **Hook (1ª linha)** — Frase visceral que faz parar de scrollar. Pessoal, provocativa ou contra-intuitiva.
   - ✅ "Demiti o melhor vendedor que já tive. Ele batia 150% de meta."
   - ✅ "Na Oracle, perdi R$2M em um quarter por um erro que ninguém fala."
   - ❌ "Vou compartilhar 5 dicas sobre gestão de vendas" (genérico)
   - ❌ "Neste artigo, discuto a importância de..." (corporativo)

2. **Corpo (3-5 parágrafos curtos)** — Conte a história, revele o insight, conecte ao tema. Quebras de linha para legibilidade no feed.

3. **CTA de engajamento** — Termine com pergunta que provoca comentários:
   - "Qual foi a decisão mais difícil que você já tomou sobre seu time de vendas?"
   - "Concorda ou discorda? Quero ouvir quem já passou por isso."

4. **Link do artigo** — No PRIMEIRO COMENTÁRIO (não no corpo), com: "Artigo completo com framework e dados: [URL]"

**Regras:**
- Tom: primeira pessoa, vulnerável, sem jargão corporativo
- Tamanho: 800-1500 caracteres
- Máximo 3 hashtags (#B2B #Vendas #GrowthExecution)
- Máximo 2-3 emojis, com propósito
- Sempre em PT-BR
- A história pode ser a mesma do artigo ou um ângulo diferente do mesmo tema

---

## blog/posts/ vs market-entry/posts/ — Key Differences

| Element | blog/posts/ | market-entry/posts/ |
|---------|-------------|---------------------|
| canonical | `alavanka.com.br/blog/posts/[slug].html` | `alavanka.com.br/market-entry/posts/[slug].html` |
| hreflang x-default | PT slug | EN slug |
| CSS | blog-article.css | nav-unified.css + inline only |

**Never copy between sections.** Use existing files in each section as templates.

---

## Market Entry / BOT

- Terminology: "Build, Operate & Transfer" (BOT) — never "MEP"
- llms.txt reflects BOT (updated March 2026)

---

## SEO & LLM Discoverability

- Meta descriptions in citable format: "Alavanka é X que faz Y para Z"
- Schema.org Person with sameAs array (LinkedIn, Endeavor, IBGC, Insper) + alumniOf (Harvard, Columbia)
- llms.txt maintained as LLM content index
- sitemap.xml: 42 URLs (auto-generated)

---

## Development Conventions

- **Python scripts** for multi-file edits (assert guards, .bak backups, idempotent)
- **ES5** for shared components; modern JS OK in inline page scripts
- **`--warm: #C8965A`** everywhere — never `#D4883A`
- **Radius:** `--r-sm/md/lg/xl` (not `--radius-*`)
- **Commits:** `fix:` | `feat:` | `UX:` format
- **Content tone:** founder-to-founder, first-person, personal cases always, no false metrics

---

## Security (vercel.json)

- CSP: `'unsafe-inline'` (no `unsafe-eval`)
- HSTS: 2 years + preload
- Assets cached immutable 1yr; HTML revalidates hourly

---

## Pending Tasks

### Wix Migration (7 articles → market-entry/posts/)
Articles 4, 5, 7 need webp→jpg thumb conversion. See memory/project docs for full hash table.

### Other:
- DKIM for `alavanka.com`
- Backlink outreach: Endeavor, IBGC, Insper, Startups.com.br
- GSC: non-indexed URLs under review

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Article not showing | Check articles.json + deploy |
| Broken image | Check path + extension (.jpg/.png only) |
| Nav not appearing | Missing nav.js or nav-unified.css |
| Footer missing | Add footer.js + footer.css + `<footer id="main-footer">` |
| Lang toggle broken | Check `sessionStorage` (not localStorage) |
| Tracking incomplete | Verify all 5 tags present |
| Purple colors | Migrate to navy/amber tokens |
| Gate flash | Missing gate-skip script in `<head>` |
