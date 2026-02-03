# CLAUDE.md - AI Assistant Guidelines for Alavanka Site

## Project Overview

**Alavanka** is a static marketing and blog website for a Fractional CRO (Chief Revenue Officer) consulting service targeting B2B SaaS companies in Brazil and Latin America.

- **Website:** https://www.alavanka.com.br
- **Tech Stack:** Pure HTML, CSS, vanilla JavaScript (no frameworks or build tools beyond sitemap generation)
- **Hosting:** Vercel (static deployment from `/public` directory)
- **Languages:** Bilingual (Portuguese-BR primary, English secondary)

## Directory Structure

```
/home/user/site/
├── public/                          # Main deployment directory (Vercel output)
│   ├── index.html                  # Main landing page (founders focus)
│   ├── blog.html                   # Blog listing page
│   ├── investidores.html           # Investor-focused landing page
│   ├── assessment.html             # Assessment/qualification page
│   ├── guia-fractional-cro-brasil.html  # Playbook/guide page
│   │
│   ├── blog/
│   │   ├── posts/                  # Individual blog articles (PT + EN)
│   │   │   ├── *.html             # Portuguese articles
│   │   │   ├── *-en.html          # English translations
│   │   │   └── articles.json      # Article metadata
│   │   └── playbook-fractional-cro-brasil-2025.pdf
│   │
│   ├── assets/
│   │   └── images/
│   │       ├── brand/             # Logos and partner branding (PNG)
│   │       ├── blog/              # Article thumbnails (JPG, 16:9)
│   │       └── illustrations/     # SVG and HTML illustrations
│   │
│   ├── styles/                     # Modular CSS files
│   │   ├── nav-unified.css        # Navigation component styles
│   │   ├── blog-article.css       # Blog post template styles
│   │   ├── footer.css             # Footer component styles
│   │   └── styles-deferred.css    # Non-critical deferred styles
│   │
│   ├── components/                 # JavaScript modules
│   │   ├── nav.js                 # Navigation component (injected)
│   │   └── blog-tracking.js       # GA4 event tracking
│   │
│   ├── translations.json           # i18n strings (~2,500+ keys)
│   ├── sitemap.xml                # Auto-generated SEO sitemap
│   ├── robots.txt                 # Crawler directives
│   └── llms.txt                   # LLM-friendly content index
│
├── generate-sitemap.js             # Node.js sitemap builder (build script)
├── vercel.json                     # Vercel deployment & security config
├── package.json                    # Minimal NPM config
├── CLAUDE.md                       # This file
└── .github/
    └── copilot-instructions.md    # Legacy AI guidelines (see this file)
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `public/index.html` | Main landing page with full design system (`:root` variables, hero, sections) |
| `public/blog.html` | Blog listing with `.article-card` grid |
| `public/investidores.html` | Investor-specific landing page |
| `public/components/nav.js` | Shared navigation component (injected via JS) |
| `public/styles/nav-unified.css` | Navigation styling (desktop + mobile) |
| `public/translations.json` | All i18n strings for language switching |
| `vercel.json` | Deployment config, security headers, redirects |
| `generate-sitemap.js` | Build script that generates sitemap.xml |

## Technology Stack

### Frontend
- **HTML5:** Semantic markup, no templating engine
- **CSS3:** CSS variables, Flexbox/Grid, responsive `@media` queries
- **JavaScript:** Vanilla ES5 (no transpilation needed)

### Fonts (Google Fonts)
- **DM Sans:** Body text (400/500/600/700)
- **DM Serif Display:** Headings (400)
- **Space Grotesk:** UI elements (500/600/700)

### Color System
```css
--accent: #1B3A5C;     /* Navy blue - primary */
--warm: #C8965A;       /* Amber - secondary */
--bg-light: #FAFBFD;   /* Light backgrounds */
--text-primary: #0D1B2A; /* Dark text */
```

### Analytics & Tracking
- Google Analytics 4 (GA4)
- Microsoft Clarity
- LinkedIn Conversion Pixel
- Custom scroll/CTA tracking in `blog-tracking.js`

### External Integrations
- Calendly (scheduling embeds)
- Formspree (form handling)
- WhatsApp Web API
- YouTube/Vimeo (embedded videos)

## Development Workflow

### Local Development
```bash
# No build required for most changes
# Serve the public directory locally:
python -m http.server 8000 -d public
# or
npx serve public
```

### Build Process
```bash
# Only needed when adding/removing blog posts
npm run build
# This runs: node generate-sitemap.js
```

### Deployment
- Push to main branch triggers Vercel auto-deploy
- Vercel runs `node generate-sitemap.js` as build command
- Output directory: `public/`
- Clean URLs enabled (no `.html` extension needed)

## CSS Architecture

### Dual-Style Pattern
This project uses **two CSS approaches intentionally**:

1. **Inline `<style>` blocks** in HTML `<head>`:
   - Critical above-the-fold CSS
   - Page-specific styles
   - `:root` variables for each page

2. **External CSS files** in `styles/`:
   - Shared components (nav, footer)
   - Cross-page reusable patterns

### Variable Duplication Warning
CSS variables are duplicated between:
- Inline `:root` in `index.html`, `blog.html`
- `styles/` CSS files

**When changing global colors/spacing:** Update BOTH the inline `:root` blocks AND the relevant `styles/*.css` files.

### Class Naming
Use BEM-like readable names:
- `.article-card`, `.qualification-box`, `.founder-profile`
- `.hero`, `.card`, `.two-col`
- Reuse existing classes; avoid creating new ones unnecessarily

## JavaScript Patterns

### Component Injection
`nav.js` injects the navigation component by replacing `<nav>` tags:
```javascript
// Auto-detects page depth for relative URLs
// Handles language toggle with localStorage
// Mobile hamburger menu with slide-out sidebar
```

### Event Tracking
`blog-tracking.js` sends GA4 events:
- `article_viewed` - on page load
- `article_scroll_depth` - at 25%, 50%, 75%, 100%
- `article_cta_click` - CTA interactions
- `article_language_switch` - language changes

### Conventions
- IIFE pattern for scope isolation
- `'use strict';` enabled
- Graceful degradation (check for `gtag`/`translations` before use)
- ES5 syntax (no `const`/`let`, arrow functions only where safe)

## Common Tasks

### Adding a New Blog Post

1. **Copy an existing article:**
   ```bash
   cp public/blog/posts/existing-article.html public/blog/posts/new-article.html
   ```

2. **Update the new file:**
   - `<title>` and `<meta name="description">`
   - `<meta property="og:*">` tags
   - `<link rel="canonical">` URL
   - Hero section title and content
   - Article body content

3. **Add thumbnail image:**
   ```
   public/assets/images/blog/new-article-thumb.jpg  (16:9 ratio)
   ```

4. **Update blog.html:**
   - Add new `.article-card` in the grid
   - Follow existing card markup pattern

5. **Regenerate sitemap:**
   ```bash
   npm run build
   ```

### Adding English Translation

1. Copy the Portuguese article:
   ```bash
   cp public/blog/posts/article.html public/blog/posts/article-en.html
   ```

2. Add `hreflang` links to both versions:
   ```html
   <link rel="alternate" hreflang="pt-BR" href="article.html">
   <link rel="alternate" hreflang="en" href="article-en.html">
   ```

3. Translate content and update metadata

### Updating Navigation

1. Edit `public/components/nav.js` for structure/behavior changes
2. Edit `public/styles/nav-unified.css` for styling changes
3. Test on multiple pages (nav is injected everywhere)

### Updating Translations

1. Edit `public/translations.json`
2. Keys follow dot notation: `"nav.home"`, `"hero.title"`
3. Both PT and EN values must be provided

## Security Configuration

`vercel.json` enforces strict security headers:

- **CSP:** Restricts script/style/frame sources
- **HSTS:** Forces HTTPS with 2-year max-age
- **X-Frame-Options:** SAMEORIGIN only
- **Permissions-Policy:** Blocks geolocation, microphone, camera, payment, USB

### CSP Allowlisted Domains
- Google Analytics/Tag Manager
- LinkedIn Pixel
- Calendly (frames)
- Formspree (forms)
- YouTube/Vimeo (embeds)
- Google Fonts

## Important Conventions for AI Assistants

### DO:
- Read files before editing them
- Make minimal, focused changes (1-3 files per PR)
- Reuse existing CSS classes and patterns
- Update both inline and external CSS when changing global variables
- Test changes by listing which pages to preview
- Follow existing code style and naming conventions

### DON'T:
- Create new files unless absolutely necessary
- Add new CSS classes when existing ones work
- Make sweeping refactors without explicit request
- Change security headers without understanding implications
- Modify `generate-sitemap.js` unless adding new page types
- Use ES6+ syntax that might break in older browsers

### When Uncertain:
- Ask for clarification about which pages must match visually
- Verify if a change should be page-specific or global
- Check if similar patterns exist elsewhere in the codebase

## File Previews for Testing

After making changes, recommend previewing:

| Change Type | Files to Preview |
|-------------|------------------|
| Navigation | `index.html`, `blog.html`, any blog post |
| Footer | `index.html`, `blog.html` |
| Colors/Typography | `index.html`, `blog.html`, blog posts |
| Blog post | `blog.html`, the new post itself |
| Translations | All pages with `data-i18n` attributes |

## Git Workflow

- Recent commits focus on: nav updates, translations, investor page
- Commit messages: `Update [filename]` or descriptive change summary
- Keep PRs small and focused
- List modified files in PR description

## Quick Commands

```bash
# Local development server
python -m http.server 8000 -d public

# Build sitemap
npm run build

# Check file structure
ls -la public/
ls -la public/blog/posts/
ls -la public/styles/
ls -la public/components/
```
