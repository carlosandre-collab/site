#!/bin/bash
# ============================================
# Alavanka — index.html patch script
# Applies gate redesign changes (v4)
# 
# Usage: Run from the repo root:
#   bash patch-index.sh
#
# Changes applied:
# 1. Remove gate title "What brings you here?"
# 2. Update card 1 text (PT startup)
# 3. Update card 2 text (EN LatAm)  
# 4. Update skip link (investor → "Só quero conhecer")
# 5. Update setAudience 'other' handler (remove toast, use founder class)
# 6. Hide .gate-question and .gate-sub via CSS
# ============================================

FILE="public/index.html"

if [ ! -f "$FILE" ]; then
    echo "ERROR: $FILE not found. Run this script from the repo root."
    exit 1
fi

echo "Patching $FILE..."

# --- 1. Remove the gate title line ---
sed -i 's|        <h2 class="gate-question">What brings you here?</h2>||' "$FILE"
echo "  ✓ 1/6 Removed gate title"

# --- 2. Update card 1: label and desc ---
sed -i 's|<div class="gate-label">Minha empresa B2B precisa crescer</div>|<div class="gate-label">Minha startup precisa crescer</div>|' "$FILE"
sed -i 's|<div class="gate-desc">Estruturar operação de receita no Brasil ou LatAm</div>|<div class="gate-desc">Arquitetura de receita e GTM para B2B</div>|' "$FILE"
echo "  ✓ 2/6 Updated card 1 text"

# --- 3. Update card 2: label and desc ---
sed -i 's|<div class="gate-label">My company wants to enter Latin America</div>|<div class="gate-label">My company wants to enter LatAm</div>|' "$FILE"
sed -i 's|<div class="gate-desc">Expanding B2B tech into Brazil and LatAm</div>|<div class="gate-desc">Build, operate \&amp; transfer your expansion</div>|' "$FILE"
echo "  ✓ 3/6 Updated card 2 text"

# --- 4. Update skip link ---
sed -i "s|<button class=\"gate-skip\" onclick=\"selectAudience('investor')\" aria-label=\"Sou investidor ou VC\">Sou investidor / VC →</button>|<button class=\"gate-skip\" onclick=\"selectAudience('other')\" aria-label=\"Só quero conhecer a Alavanka\">Só quero conhecer a Alavanka →</button>|" "$FILE"
echo "  ✓ 4/6 Updated skip link"

# --- 5. Update setAudience 'other' handler (multi-line, uses Python) ---
python3 -c "
with open('$FILE', 'r') as f:
    content = f.read()

old = '''    if (audience === 'other') {
        document.body.classList.add('audience-other');
        showAudienceToast('\U0001f4a1 Conteúdo geral carregado. Você pode personalizar a qualquer momento.');
        return;'''

new = '''    if (audience === 'other') {
        document.body.classList.add('audience-founder');
        return;'''

content = content.replace(old, new)

with open('$FILE', 'w') as f:
    f.write(content)
"
echo "  ✓ 5/6 Updated setAudience 'other' handler"

# --- 6. Hide .gate-question and .gate-sub via CSS ---
sed -i "s|.gate-question{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(28px,5vw,40px);font-weight:400;color:#0D1B2A;margin-bottom:6px;line-height:1.1;opacity:0;animation:gateFade 0.4s ease 0.25s both;letter-spacing:-0.02em}|.gate-question{display:none}|" "$FILE"
sed -i "s|.gate-sub{font-size:14px;color:#8C8CA1;margin-bottom:32px;opacity:0;animation:gateFade 0.4s ease 0.35s both;font-family:'DM Sans',sans-serif}|.gate-sub{display:none}|" "$FILE"
echo "  ✓ 6/6 Hidden .gate-question and .gate-sub CSS"

echo ""
echo "✅ All patches applied to $FILE"
echo ""
echo "Deploy checklist:"
echo "  1. Replace public/components/nav.js with new nav.js"  
echo "  2. Run: bash patch-index.sh (this script — already done)"
echo "  3. git add -A && git commit -m 'Redesign nav + gate (need-based v4)' && git push"
echo ""
echo "Test these pages after deploy:"
echo "  - / (homepage — gate + nav PT context)"
echo "  - /blog (nav PT context, no gate)"
echo "  - /investidores (nav PT context, accessible via dropdown)"
echo "  - /assessment (nav PT context)"
echo "  - /market-entry (nav EN context)"
echo "  - /blog/posts/[any-article].html (nav PT, deep path)"
echo "  - /market-entry/posts/[any-article].html (nav EN, deep path)"
