# Site archive

Snapshots of the site taken before structural changes, so a change can be reversed
without digging through git history. Files here are copied **unchanged**.

`/_archive/` is `Disallow`ed in `robots.txt` for every crawler group. It is **not** in the
sitemap: `build.js` builds the sitemap from a fixed page list and never scans `public/`.
The files are still reachable by direct URL, because everything under `public/` is deployed.

---

## 2026-11-growth-execution/

**Archived:** 2026-11-17, before the Build-Operate-Transfer (BOT) consolidation.

**Why:** Alavanka stopped selling Growth Execution (fractional CRO) as a standalone offer.
BOT became the single front-door offer and the site became English-first. This folder is
the last state of the site in which Growth Execution was the homepage offer.

### What is in it

| Archived path | Original path | Notes |
|---|---|---|
| `index.html` | `public/index.html` | Growth Execution homepage with the founder/investor audience gate |
| `assessment.html` | `public/assessment.html` | Revenue-readiness assessment (Growth Execution) |
| `guia-crescimento-receita-b2b.html` | `public/guia-crescimento-receita-b2b.html` | Growth Execution guide. This file was formerly `guia-fractional-cro-brasil.html`, which now 301-redirects here (see `vercel.json`) |
| `translations.json` | `public/translations.json` | PT/EN strings |
| `blog.html` | `public/blog.html` | Blog listing (Portuguese default) |
| `market-entry.html` | `public/market-entry.html` | BOT landing page, before the readiness link and Commercial Engine section were added |
| `robots.txt` | `public/robots.txt` | Before the `_archive` Disallow rules |
| `llms.txt` | `public/llms.txt` | Two-service positioning (Growth Execution + BOT) |
| `components/nav.js` | `public/components/nav.js` | Nav v5: two contexts (Startup Growth / Expand to LatAm), Portuguese default |
| `styles/nav-unified.css` | `public/styles/nav-unified.css` | Nav styles |
| `blog/posts/*.html`, `blog/articles.json` | `public/blog/posts/`, `public/blog/articles.json` | **Generated** build output, kept as a reference of what was served. Do not copy these back: `build.js` regenerates them from `content/posts/`, which this consolidation did not change |
| `_repo-root/vercel.json` | `vercel.json` (repo root) | Before the `/` → `/market-entry` redirect |
| `_repo-root/build.js` | `build.js` (repo root) | Before the sitemap page list changed |

### Reversal procedure

From the repository root:

```bash
A=public/_archive/2026-11-growth-execution

# 1. Restore the archived files to their original paths
cp $A/index.html $A/assessment.html $A/guia-crescimento-receita-b2b.html \
   $A/translations.json $A/blog.html $A/market-entry.html $A/robots.txt $A/llms.txt public/
cp $A/components/nav.js   public/components/nav.js
cp $A/styles/nav-unified.css public/styles/nav-unified.css
cp $A/_repo-root/vercel.json $A/_repo-root/build.js .

# 2. Remove the pages created by the BOT consolidation
git rm public/market-entry/readiness.html public/commercial-playbook-latam.html

# 3. Rebuild (regenerates blog posts, articles.json and sitemap.xml)
npm run build

# 4. Commit
git add -A public vercel.json build.js
git commit -m "Revert BOT consolidation: restore Growth Execution site state"
```

Restoring `robots.txt` also removes the `_archive` Disallow rules. Re-add them if the archive
folder stays in place.

The `guia-crescimento-receita-b2b.html` copy only matters if that file was edited later;
the BOT consolidation added `hreflang` links to it.
