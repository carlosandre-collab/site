<!-- .github/copilot-instructions.md - Guidance for AI coding agents working on this repo -->
# Copilot instructions — site (static marketing/blog)

Purpose
- Help AI agents make small, safe, and useful edits to this repo: a static marketing + blog website built with plain HTML and CSS.

Big picture
- This is a static site (no build tool). Primary entry points are `index.html` and `blog.html`. Individual blog pages live in `blog/`.
- Styling is implemented in two ways: (a) many pages include a large inline `<style>` block (see `index.html`, `blog.html`) and (b) there is a `styles/` folder containing modular CSS files (`variables.css`, `nav.css`, `mobile-menu.css`, `footer.css`). Be careful — variables and rules can be duplicated between inline styles and `styles/`.

Key files & patterns (quick reference)
- `index.html` — main landing page; contains most of the inline design system (`:root` variables, nav, hero, sections). Use this to understand component structure and naming (e.g., `.hero`, `.card`, `.two-col`).
- `blog.html` — blog listing (grid of `.article-card`) and a simpler, page-specific `:root`. New blog posts are static `.html` files under `blog/*.html` (examples: `custo-invisivel-cro.html`).
- `blog/` — individual article pages; follow the markup pattern used by the existing articles (hero → content → footer).
- `styles/variables.css` — canonical variables intended for shared use, but not always imported by pages. Prefer aligning inline `:root` values with this file if you change global colors/spacing.
- `styles/nav.css`, `styles/mobile-menu.css`, `styles/footer.css` — modular CSS for common UI areas; edit here when the same behavior is needed across multiple pages.

Editing conventions for agents
- Make minimal, focused edits. Prefer updating `styles/*.css` when the change must apply to multiple pages; update an inline `<style>` block when the change is page-scoped.
- When adding a new blog post: copy an existing file from `blog/`, update front-matter-like metadata manually (title, `meta description`), and add any new thumbnail assets alongside the HTML. Also update `blog.html` (if you add a featured card or a direct link) — search for similar patterns in that file.
- Maintain existing naming: many classes use BEM-like readable names (e.g., `.article-card`, `.qualification-box`, `.founder-profile`). Reuse them rather than introducing many new class names.

Styling and variables notes
- There is duplication between inline `:root` in pages and `styles/variables.css`. If updating global colors, update both the inline `:root` in `index.html` and `blog.html` and `styles/variables.css` to avoid visual drift.
- Responsive breakpoints are implemented via `@media` blocks inside inline styles; prefer adding small, localized `@media` rules near the related selectors when editing a single page.

Workflows & checks
- No build or test system — changes are verified by opening the HTML in a browser. Recommend locally opening modified files in browser or using a simple `python -m http.server` to serve the folder for visual checks.

Examples (do these exact edits when applicable)
- Add a blog post link in the list:
  - Copy `blog/custo-invisivel-cro.html` → `blog/new-article-slug.html`
  - Edit `<title>` and `<meta name="description">` at the top
  - In `blog.html` add a new `.article-card` following an existing card markup; keep classes and container (`.blog-grid`) consistent.

- Update primary accent color consistently:
  - Change `--accent` in `index.html` and `blog.html` inline `:root` blocks
  - Update `--color-accent` / `--bg-*` equivalents in `styles/variables.css`

Integration & external dependencies
- This repo contains no build tools or package.json. There are no external JS libraries checked into the repo. Fonts are loaded from Google Fonts via link tags.

PR guidance for agents
- Keep changes isolated to 1–3 files per PR. Explain the visual change and list which pages to manually preview (e.g., `index.html`, `blog.html`, `blog/new-article.html`).
- If modifying variables, list files you updated (`index.html`, `blog.html`, `styles/variables.css`) in the PR description.

If anything is ambiguous
- Ask the human: prefer clarifying which pages must match visually (landing vs blog) before sweeping global refactors.

Want to improve this guide?
- Tell me which examples are missing or which workflows you run locally (e.g., deploy steps). I will iterate.
