#!/bin/bash
# ============================================================
# ALAVANKA — Patch Script for index.html
# Applies all 8 patches identified in the bug audit
# 
# USAGE:
#   chmod +x patch-index.sh
#   ./patch-index.sh [path/to/index.html]
#
# Default path: ./public/index.html
# Creates backup at index.html.bak before patching
# ============================================================

set -euo pipefail

FILE="${1:-./public/index.html}"

if [ ! -f "$FILE" ]; then
    echo "❌ File not found: $FILE"
    echo "Usage: $0 [path/to/index.html]"
    exit 1
fi

# Backup
cp "$FILE" "${FILE}.bak"
echo "✅ Backup created: ${FILE}.bak"

PATCH_COUNT=0
fail() { echo "⚠️  PATCH $1 — $2 (pattern not found, skipping)"; }
ok()   { PATCH_COUNT=$((PATCH_COUNT + 1)); echo "✅ PATCH $1 — $2"; }

# ============================================================
# PATCH 1: Replace 3 CSS file references with 1 consolidated
# ============================================================

# Remove styles-deferred.css link
if grep -q 'styles-deferred\.css' "$FILE"; then
    sed -i '/<link[^>]*styles-deferred\.css[^>]*>/d' "$FILE"
    ok "1a" "Removed styles-deferred.css reference"
else
    fail "1a" "styles-deferred.css reference"
fi

# Remove styles-ux-enhanced.css link
if grep -q 'styles-ux-enhanced\.css' "$FILE"; then
    sed -i '/<link[^>]*styles-ux-enhanced\.css[^>]*>/d' "$FILE"
    ok "1b" "Removed styles-ux-enhanced.css reference"
else
    fail "1b" "styles-ux-enhanced.css reference"
fi

# Remove p0-p1-additions.css link (if present)
if grep -q 'p0-p1-additions\.css' "$FILE"; then
    sed -i '/<link[^>]*p0-p1-additions\.css[^>]*>/d' "$FILE"
    ok "1c" "Removed p0-p1-additions.css reference"
else
    echo "   ℹ️  PATCH 1c — p0-p1-additions.css not referenced (OK)"
fi

# Add styles-main.css after nav-unified.css (if not already present)
if ! grep -q 'styles-main\.css' "$FILE"; then
    sed -i '/<link[^>]*nav-unified\.css[^>]*>/a\    <link rel="stylesheet" href="styles/styles-main.css">' "$FILE"
    ok "1d" "Added styles-main.css reference"
else
    echo "   ℹ️  PATCH 1d — styles-main.css already referenced (OK)"
fi

# ============================================================
# PATCH 2: Remove duplicate scroll progress HTML element
# The one WITHOUT id="scrollProgress" (has nested child div)
# ============================================================

# Count scroll-progress divs
SP_COUNT=$(grep -c 'class="scroll-progress"' "$FILE" || true)

if [ "$SP_COUNT" -gt 1 ]; then
    # Remove the one that has a nested .scroll-progress-bar child
    # This is a multi-line block: <div class="scroll-progress">\n...<div class="scroll-progress-bar">...</div>\n</div>
    perl -i -0pe 's/\s*<!--\s*P1:\s*Scroll Progress Indicator\s*-->\s*\n\s*<div class="scroll-progress">\s*\n\s*<div class="scroll-progress-bar"><\/div>\s*\n\s*<\/div>\s*\n//s' "$FILE"
    
    # If the perl above didn't catch it, try without comment
    SP_COUNT2=$(grep -c 'class="scroll-progress"' "$FILE" || true)
    if [ "$SP_COUNT2" -gt 1 ]; then
        # Remove any scroll-progress div that does NOT have id="scrollProgress"
        perl -i -0pe 's/<div class="scroll-progress">[\s\S]*?<div class="scroll-progress-bar"><\/div>[\s\S]*?<\/div>\s*\n//s' "$FILE"
    fi
    ok "2" "Removed duplicate scroll progress element"
else
    echo "   ℹ️  PATCH 2 — Only one scroll-progress element found (OK)"
fi

# ============================================================
# PATCH 3: Remove duplicate gate skip link (keep only bottom button)
# ============================================================

# Remove the <a> gate-skip-link that appears before the gate question
if grep -q 'gate-skip-link' "$FILE"; then
    perl -i -0pe 's/\s*<!--\s*UX P0:.*?-->\s*\n\s*<a[^>]*class="gate-skip-link"[^>]*>[\s\S]*?<\/a>\s*\n//s' "$FILE"
    
    # Verify it was removed
    if grep -q 'gate-skip-link' "$FILE"; then
        # Fallback: remove any line containing gate-skip-link (the <a> tag)
        sed -i '/gate-skip-link/d' "$FILE"
    fi
    ok "3" "Removed duplicate gate skip link"
else
    fail "3" "gate-skip-link element"
fi

# ============================================================
# PATCH 4: Fix mobile sticky CTA (button → anchor tag)
# ============================================================

if grep -q 'btn-mobile-sticky.*onclick.*location\.href' "$FILE"; then
    # Replace <button class="btn-mobile-sticky" onclick="location.href='assessment.html';"> 
    # with <a href="assessment.html" class="btn-mobile-sticky">
    perl -i -pe 's/<button\s+class="btn-mobile-sticky"\s+onclick="location\.href=.?assessment\.html.?;?"?>/<a href="assessment.html" class="btn-mobile-sticky">/g' "$FILE"
    
    # Now fix the closing tag: find </button> inside mobileCTA div
    # We need to be careful to only replace the one inside #mobileCTA
    # Strategy: replace the FIRST </button> that follows btn-mobile-sticky
    perl -i -0pe 's/(class="btn-mobile-sticky">[\s\S]*?)<\/button>/$1<\/a>/s' "$FILE"
    
    ok "4" "Converted mobile CTA button to anchor tag"
else
    fail "4" "btn-mobile-sticky with onclick"
fi

# ============================================================
# PATCH 5: Remove Section C duplicate scroll progress JS
# ============================================================

if grep -q '// C) Scroll Progress Bar' "$FILE" 2>/dev/null || grep -q 'C).*Scroll Progress' "$FILE" 2>/dev/null; then
    # Replace the entire IIFE that starts with "// C) Scroll Progress Bar"
    perl -i -0pe 's/\/\/\s*C\)\s*Scroll Progress Bar\s*\n\s*\(function\(\)\s*\{[\s\S]*?const bar = document\.getElementById\(.scrollProgress.\)[\s\S]*?\}\)\(\);\s*\n/\/\/ C) Scroll Progress Bar — single handler at section D\n/s' "$FILE"
    ok "5" "Removed Section C duplicate scroll progress JS"
else
    fail "5" "Section C scroll progress handler"
fi

# ============================================================
# PATCH 6: Remove bottom P1 duplicate scroll progress JS
# ============================================================

if grep -q 'P1: Scroll Progress Indicator' "$FILE" 2>/dev/null || grep -q 'P1.*Scroll Progress' "$FILE" 2>/dev/null; then
    # Remove the entire block from "// P1: Scroll Progress Indicator" to the closing })();
    perl -i -0pe 's/\s*\/\/\s*P1:\s*Scroll Progress Indicator\s*\n\s*\(function\(\)\s*\{\s*\n\s*var progressBar[\s\S]*?updateProgress\(\);\s*\/\/\s*Initial call\s*\n\s*\}\)\(\);\s*\n//s' "$FILE"
    ok "6" "Removed bottom P1 duplicate scroll progress JS"
else
    fail "6" "P1 Scroll Progress Indicator block"
fi

# ============================================================
# PATCH 7: Neutralize dynamic createMobileFAB function
# ============================================================

if grep -q 'function createMobileFAB' "$FILE"; then
    # Replace the function body with a no-op
    # Match from "function createMobileFAB()" to its closing brace
    # This is tricky because of nested braces; use a simpler approach:
    # Insert a return; right after the function opening
    perl -i -pe 'if (/function createMobileFAB\s*\(\)/) {
        $_ .= "        // DISABLED: FAB is now static HTML element (#mobileFab)\n        return;\n";
        $found = 1;
    }' "$FILE"
    ok "7" "Neutralized dynamic createMobileFAB function"
else
    fail "7" "createMobileFAB function"
fi

# ============================================================
# PATCH 8: Fix Cloudflare email fallback text
# ============================================================

if grep -q '\[email.\{0,10\}protected\]' "$FILE"; then
    sed -i 's/\[email&#160;protected\]/contato@alavanka.com/g' "$FILE"
    sed -i 's/\[email&amp;#160;protected\]/contato@alavanka.com/g' "$FILE"
    sed -i 's/\[email protected\]/contato@alavanka.com/g' "$FILE"
    ok "8" "Fixed Cloudflare email fallback text"
else
    fail "8" "Cloudflare email obfuscation pattern"
fi

# ============================================================
# SUMMARY
# ============================================================

echo ""
echo "============================================"
echo "  index.html — $PATCH_COUNT patches applied"
echo "============================================"
echo "  Backup: ${FILE}.bak"
echo ""
echo "  Verify with:"
echo "    diff ${FILE}.bak $FILE"
echo ""
echo "  Revert with:"
echo "    cp ${FILE}.bak $FILE"
echo "============================================"
