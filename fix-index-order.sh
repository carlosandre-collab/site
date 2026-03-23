#!/usr/bin/env bash
# fix-index-order.sh
# Reordena as seções da index.html e renomeia âncoras:
#
#   Antes:  problema → consequences → modelo-certo → solucao → fit → porque → contato → faq
#   Depois: problema → consequences → solucao      → como    → fit → casos  → porque  → contato → faq
#
#   Mudanças:
#     1. #modelo-certo → #solucao  (como resolvemos)
#     2. #solucao      → #como     (como fazemos)
#     3. #porque partido em dois:
#        - founder-case-study → nova seção #casos (onde já foi feito)
#        - credentials + founder bio → permanece em #porque (por que nós)
#     4. Ordem física: #casos vem antes de #porque
#
# Usage (from repo root):
#   bash fix-index-order.sh            # live
#   bash fix-index-order.sh --dry-run  # preview, sem escrita
#
# Idempotente: SKIP se já aplicado.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${SCRIPT_DIR}/public/index.html"
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

if $DRY_RUN; then MODE="DRY RUN"; else MODE="LIVE"; fi

echo "fix-index-order.sh"
echo "Target : ${TARGET}"
echo "Mode   : ${MODE}"
echo "──────────────────────────────────────────────────────"

[[ -f "$TARGET" ]] || { echo "ERROR: ${TARGET} not found"; exit 1; }

python3 - "$TARGET" "$($DRY_RUN && echo 1 || echo 0)" << 'PYEOF'
import sys, re, shutil

filepath = sys.argv[1]
dry_run  = sys.argv[2] == "1"

with open(filepath, "r", encoding="utf-8") as fh:
    content = fh.read()

# ── Guard: already applied? ───────────────────────────────────────────────────
anchors = re.findall(r'<section id="([^"]+)"', content)
expected = ['problema', 'solucao', 'como', 'fit', 'casos', 'porque', 'contato', 'faq']
if anchors == expected:
    print(f"SKIP  {filepath}  (already applied)")
    sys.exit(0)

changes = []

# ── Delimiters (exact strings found in the file) ──────────────────────────────
SEP = '\n\n<div class="section-hr" aria-hidden="true"></div>\n\n'

D_PROB    = SEP + '<!-- Pain Section -->\n<section id="problema"'
D_CONSEQ  = SEP + '<!-- Consequences -->\n<section class="consequences">'
D_SOL     = SEP + '<!-- O Modelo Certo — Seção 5 -->\n<section id="modelo-certo"'
D_COMO    = SEP + '<!-- Growth Execution — Seção 6 -->\n<section id="solucao"'
D_FIT     = SEP + '<!-- Fit -->\n<section id="fit"'
D_PORQUE  = SEP + '<!-- Why Alavanka -->\n<section id="porque"'
D_CONTATO = '\n\n<!-- CTA Final -->\n<section id="contato"'
D_FAQ     = SEP + '<!-- FAQ -->\n<section id="faq"'
CASE_DIV  = '\n    <div class="founder-case-study">'

def between(html, start, end):
    s = html.index(start)
    e = html.index(end, s + len(start))
    return html[s:e]

def from_marker(html, start):
    return html[html.index(start):]

# ── Extract all blocks ────────────────────────────────────────────────────────
hero_block    = content[:content.index(D_PROB)]
prob_block    = between(content, D_PROB,    D_CONSEQ)
conseq_block  = between(content, D_CONSEQ,  D_SOL)
solucao_block = between(content, D_SOL,     D_COMO)
como_block    = between(content, D_COMO,    D_FIT)
fit_block     = between(content, D_FIT,     D_PORQUE)
porque_block  = between(content, D_PORQUE,  D_CONTATO)
contato_block = between(content, D_CONTATO, D_FAQ)
faq_block     = from_marker(content, D_FAQ)

# Split #porque into credentials/bio + case study
assert porque_block.count(CASE_DIV) == 1, "founder-case-study not found in #porque"
porque_creds = porque_block[:porque_block.index(CASE_DIV)]
porque_cases = porque_block[porque_block.index(CASE_DIV):]

# ── Rename anchors ────────────────────────────────────────────────────────────
# solucao_block: #modelo-certo → #solucao
solucao_block = solucao_block.replace(
    '<section id="modelo-certo" class="solution-intro-section">',
    '<section id="solucao" class="solution-intro-section">'
)
# Update comment too
solucao_block = solucao_block.replace(
    '<!-- O Modelo Certo — Seção 5 -->\n',
    '<!-- Como resolvemos -->\n'
)
changes.append('  #modelo-certo → #solucao')

# como_block: #solucao → #como
como_block = como_block.replace(
    '<section id="solucao" class="solution-section">',
    '<section id="como" class="solution-section">'
)
como_block = como_block.replace(
    '<!-- Growth Execution — Seção 6 -->\n',
    '<!-- Como fazemos -->\n'
)
changes.append('  #solucao → #como')

# ── Build #casos section ──────────────────────────────────────────────────────
# Close #porque_creds, open #casos, put cases content, close #casos
# The porque_creds block starts with SEP + <!-- Why Alavanka --> + <section id="porque"...>
# We keep that opening but close it before case study, then reopen as #casos

casos_section = (
    SEP + '<!-- Onde já foi feito -->\n'
    '<section id="casos" class="why-section">\n'
    '    <div class="section-header">\n'
    '        <h2 data-i18n="cases.title">Onde Já <span class="hl">Foi Feito</span></h2>\n'
    '        <p data-i18n="cases.subtitle">Um exemplo documentado: como uma fundação comercial sólida gera desdobramentos que se compõem por anos.</p>\n'
    '    </div>' +
    porque_cases +   # has the founder-case-study div + closing </section>
    '\n'
)
changes.append('  #casos criado (founder-case-study extraído de #porque)')

# ── Reassemble in new order ───────────────────────────────────────────────────
# New order: hero → problema → consequences → solucao → como → fit → casos → porque_creds (close+reopen) → contato → faq
#
# porque_creds: currently starts with SEP + <!-- Why Alavanka --> + <section id="porque"...
# It needs </section> at the end (we extracted it without the closing </section> + contato)
# Actually porque_creds ends just before CASE_DIV — so it's missing its </section>
# We need to add </section> to close #porque after porque_creds

porque_section = (
    SEP + '<!-- Por que nós -->\n'
    '<section id="porque" class="why-section">' +
    # Strip the original opening from porque_creds (it contains SEP + comment + <section...>)
    re.sub(r'^' + re.escape(SEP) + r'<!-- Why Alavanka -->\n<section id="porque" class="why-section">', '', porque_creds) +
    '</section>'
)
changes.append('  #porque mantém apenas founder bio + credentials')

new_content = (
    hero_block +
    prob_block +
    conseq_block +
    solucao_block +
    como_block +
    fit_block +
    casos_section +
    porque_section +
    contato_block +
    faq_block
)

# ── Verify ────────────────────────────────────────────────────────────────────
new_anchors = re.findall(r'<section id="([^"]+)"', new_content)
opens  = len(re.findall(r'<section[ >]', new_content))
closes = len(re.findall(r'</section>', new_content))

assert new_anchors == expected, f"Wrong order: {new_anchors}"
assert opens == closes, f"Unbalanced sections: {opens} open vs {closes} close"

changes.append(f'  anchor order: {" → ".join("#"+a for a in new_anchors)}')
changes.append(f'  section balance: {opens} open = {closes} close')

# ── Output ────────────────────────────────────────────────────────────────────
tag = "DRYRUN" if dry_run else "FIXED "
print(f"{tag}  {filepath}")
for c in changes:
    print(c)

if not dry_run:
    shutil.copy2(filepath, filepath + ".bak")
    with open(filepath, "w", encoding="utf-8") as fh:
        fh.write(new_content)
    print(f"  backup → {filepath}.bak")

PYEOF

exit $?
