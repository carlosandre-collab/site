#!/bin/bash
# ============================================
# Alavanka — index.html patch script (macOS compatible)
# Applies gate redesign changes (v4)
# 
# Usage: Run from the repo root:
#   bash patch-index-v2.sh
# ============================================

FILE="public/index.html"

if [ ! -f "$FILE" ]; then
    echo "ERROR: $FILE not found. Run this script from the repo root."
    exit 1
fi

echo "Patching $FILE..."

python3 << 'PYEOF'
import sys

filepath = "public/index.html"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

original = content
changes = 0

# --- 1. Remove gate title ---
old = '        <h2 class="gate-question">What brings you here?</h2>'
if old in content:
    content = content.replace(old, '')
    changes += 1
    print("  ✓ 1/6 Removed gate title")
else:
    print("  ⚠ 1/6 Gate title not found (may already be removed)")

# --- 2. Update card 1 text ---
old = '<div class="gate-label">Minha empresa B2B precisa crescer</div>'
new = '<div class="gate-label">Minha startup precisa crescer</div>'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("  ✓ 2a/6 Updated card 1 label")
else:
    print("  ⚠ 2a/6 Card 1 label not found (may already be updated)")

old = '<div class="gate-desc">Estruturar operação de receita no Brasil ou LatAm</div>'
new = '<div class="gate-desc">Arquitetura de receita e GTM para B2B</div>'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("  ✓ 2b/6 Updated card 1 desc")
else:
    print("  ⚠ 2b/6 Card 1 desc not found (may already be updated)")

# --- 3. Update card 2 text ---
old = '<div class="gate-label">My company wants to enter Latin America</div>'
new = '<div class="gate-label">My company wants to enter LatAm</div>'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("  ✓ 3a/6 Updated card 2 label")
else:
    print("  ⚠ 3a/6 Card 2 label not found (may already be updated)")

old = '<div class="gate-desc">Expanding B2B tech into Brazil and LatAm</div>'
new = '<div class="gate-desc">Build, operate &amp; transfer your expansion</div>'
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("  ✓ 3b/6 Updated card 2 desc")
else:
    print("  ⚠ 3b/6 Card 2 desc not found (may already be updated)")

# --- 4. Update skip link ---
old = """<button class="gate-skip" onclick="selectAudience('investor')" aria-label="Sou investidor ou VC">Sou investidor / VC →</button>"""
new = """<button class="gate-skip" onclick="selectAudience('other')" aria-label="Só quero conhecer a Alavanka">Só quero conhecer a Alavanka →</button>"""
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("  ✓ 4/6 Updated skip link")
else:
    print("  ⚠ 4/6 Skip link not found (may already be updated)")

# --- 5. Update setAudience 'other' handler ---
old = """    if (audience === 'other') {
        document.body.classList.add('audience-other');
        showAudienceToast('\U0001f4a1 Conteúdo geral carregado. Você pode personalizar a qualquer momento.');
        return;"""
new = """    if (audience === 'other') {
        document.body.classList.add('audience-founder');
        return;"""
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("  ✓ 5/6 Updated setAudience 'other' handler")
else:
    print("  ⚠ 5/6 setAudience handler not found (may already be updated)")

# --- 6. Hide .gate-question and .gate-sub CSS ---
old = ".gate-question{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(28px,5vw,40px);font-weight:400;color:#0D1B2A;margin-bottom:6px;line-height:1.1;opacity:0;animation:gateFade 0.4s ease 0.25s both;letter-spacing:-0.02em}"
new = ".gate-question{display:none}"
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("  ✓ 6a/6 Hidden .gate-question CSS")
else:
    print("  ⚠ 6a/6 .gate-question CSS not found (may already be updated)")

old = ".gate-sub{font-size:14px;color:#8C8CA1;margin-bottom:32px;opacity:0;animation:gateFade 0.4s ease 0.35s both;font-family:'DM Sans',sans-serif}"
new = ".gate-sub{display:none}"
if old in content:
    content = content.replace(old, new)
    changes += 1
    print("  ✓ 6b/6 Hidden .gate-sub CSS")
else:
    print("  ⚠ 6b/6 .gate-sub CSS not found (may already be updated)")

if content != original:
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n✅ {changes} changes applied to {filepath}")
else:
    print(f"\n⚠ No changes needed — file may already be patched")

PYEOF

echo ""
echo "Deploy:"
echo "  git add -A && git commit -m 'Fix: apply gate patches (macOS compat)' && git push"
echo ""
echo "Test these pages after deploy:"
echo "  - / (homepage — gate + nav PT context)"
echo "  - /blog (nav PT context)"
echo "  - /investidores (nav PT context, accessible via dropdown)"
echo "  - /assessment (nav PT context)"
echo "  - /market-entry (nav EN context)"
