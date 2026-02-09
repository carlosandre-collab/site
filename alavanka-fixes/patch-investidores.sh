#!/bin/bash
# ============================================================
# ALAVANKA — Patch Script for investidores.html
# Applies all 5 patches identified in the bug audit
# 
# USAGE:
#   chmod +x patch-investidores.sh
#   ./patch-investidores.sh [path/to/investidores.html]
#
# Default path: ./public/investidores.html
# Creates backup at investidores.html.bak before patching
# ============================================================

set -euo pipefail

FILE="${1:-./public/investidores.html}"

if [ ! -f "$FILE" ]; then
    echo "❌ File not found: $FILE"
    echo "Usage: $0 [path/to/investidores.html]"
    exit 1
fi

# Backup
cp "$FILE" "${FILE}.bak"
echo "✅ Backup created: ${FILE}.bak"

PATCH_COUNT=0
fail() { echo "⚠️  PATCH $1 — $2 (pattern not found, skipping)"; }
ok()   { PATCH_COUNT=$((PATCH_COUNT + 1)); echo "✅ PATCH $1 — $2"; }

# ============================================================
# PATCH INV-1: Fix corrupted CSS block (orphaned rules)
# 
# The .btn-talk-now svg block is followed by orphaned properties
# that lost their .flag-icon selector. We restore the selector.
# ============================================================

# Look for orphaned CSS: closing brace of .btn-talk-now svg followed 
# by bare properties (width: 40px) without a selector
if grep -q 'btn-talk-now svg' "$FILE"; then
    # Pattern: after ".btn-talk-now svg { ... }" there's a bare "width: 40px;" 
    # without a selector. We need to add ".flag-icon {" before it.
    
    # Strategy: Find the pattern where } is immediately followed by 
    # whitespace and then "width: 40px" (no selector between them)
    perl -i -0pe '
        s/(\.btn-talk-now\s+svg\s*\{[^}]*\}\s*\n)(\s*)(width:\s*40px)/$1$2.flag-icon \{\n$2    $3/s
    ' "$FILE"
    
    # Verify the fix took effect
    if grep -qP '^\s*\.flag-icon\s*\{' "$FILE"; then
        ok "INV-1" "Restored .flag-icon selector to orphaned CSS rules"
    else
        # Fallback: try alternate pattern (properties might be indented differently)
        perl -i -pe '
            if (/^\s*width:\s*40px;/ && $prev =~ /^\s*\}/ && !$done) {
                $_ = "    .flag-icon {\n$_";
                $done = 1;
            }
            $prev = $_;
        ' "$FILE"
        
        if grep -qP '\.flag-icon\s*\{' "$FILE"; then
            ok "INV-1" "Restored .flag-icon selector (fallback method)"
        else
            fail "INV-1" "Could not locate orphaned CSS block"
        fi
    fi
else
    fail "INV-1" ".btn-talk-now svg CSS block"
fi

# ============================================================
# PATCH INV-2: Fix form submission error handling
# Add .catch() to the no-cors fetch for Google Apps Script
# ============================================================

if grep -q "mode.*no-cors" "$FILE" && grep -q "script\.google\.com" "$FILE"; then
    # Find the fetch with no-cors and add .catch() after the closing );
    # Pattern: fetch(url, { mode: 'no-cors', ... body: params });
    # We append .catch(function(error) { ... }) 
    
    perl -i -0pe '
        s/(fetch\([^)]*script\.google\.com[^)]*,\s*\{[^}]*mode:\s*.no-cors.[^}]*\}\s*\))\s*;/$1\n            .catch(function(error) {\n                console.error("Form submission failed:", error);\n                var statusEl = document.querySelector(".report-status, .form-status");\n                if (statusEl) {\n                    statusEl.innerHTML = "<p style=\\"color: var(--danger);\\">Erro ao enviar. Tente novamente ou entre em contato diretamente.<\\/p>";\n                }\n            });/s
    ' "$FILE"
    
    if grep -q '\.catch(function(error)' "$FILE"; then
        ok "INV-2" "Added .catch() to no-cors form fetch"
    else
        fail "INV-2" "Could not append .catch to fetch"
    fi
else
    fail "INV-2" "no-cors fetch to Google Apps Script"
fi

# ============================================================
# PATCH INV-3: Fix ARR input type for mobile keyboard
# Change inputmode="numeric" to inputmode="decimal" pattern="[0-9]*"
# ============================================================

if grep -q 'id="calcArr"' "$FILE"; then
    # Replace inputmode="numeric" with inputmode="decimal" pattern="[0-9]*"
    sed -i 's/\(id="calcArr"[^>]*\)inputmode="numeric"/\1inputmode="decimal" pattern="[0-9]*"/' "$FILE"
    
    # If inputmode wasn't "numeric" try the broader approach
    if grep -q 'id="calcArr".*inputmode="decimal"' "$FILE"; then
        ok "INV-3" "Fixed ARR input for mobile numeric keyboard"
    else
        # Fallback: just add pattern attribute
        sed -i 's/\(id="calcArr"[^>]*\)>/\1 pattern="[0-9]*">/' "$FILE"
        ok "INV-3" "Added pattern attribute to ARR input (fallback)"
    fi
else
    fail "INV-3" "calcArr input element"
fi

# ============================================================
# PATCH INV-4: Fix translation race condition
# Add guard to updateScorecardVerdict to check translations loaded
# ============================================================

if grep -q 'function updateScorecardVerdict' "$FILE"; then
    # Insert a guard right after the function declaration
    perl -i -pe '
        if (/function\s+updateScorecardVerdict\s*\(/) {
            $_ .= "        // Guard: skip if translations not loaded yet\n        if (!translations || Object.keys(translations).length === 0) return;\n";
        }
    ' "$FILE"
    
    if grep -q 'Guard: skip if translations not loaded' "$FILE"; then
        ok "INV-4" "Added translation load guard to updateScorecardVerdict"
    else
        fail "INV-4" "Could not insert guard into updateScorecardVerdict"
    fi
else
    fail "INV-4" "updateScorecardVerdict function"
fi

# ============================================================
# PATCH INV-5: Replace CSS file references (3 → 1)
# Same as index.html — remove old CSS, add consolidated
# ============================================================

# Remove styles-deferred.css link
if grep -q 'styles-deferred\.css' "$FILE"; then
    sed -i '/<link[^>]*styles-deferred\.css[^>]*>/d' "$FILE"
    ok "INV-5a" "Removed styles-deferred.css reference"
else
    fail "INV-5a" "styles-deferred.css reference"
fi

# Remove styles-ux-enhanced.css link
if grep -q 'styles-ux-enhanced\.css' "$FILE"; then
    sed -i '/<link[^>]*styles-ux-enhanced\.css[^>]*>/d' "$FILE"
    ok "INV-5b" "Removed styles-ux-enhanced.css reference"
else
    fail "INV-5b" "styles-ux-enhanced.css reference"
fi

# Remove p0-p1-additions.css link (if present)
if grep -q 'p0-p1-additions\.css' "$FILE"; then
    sed -i '/<link[^>]*p0-p1-additions\.css[^>]*>/d' "$FILE"
    ok "INV-5c" "Removed p0-p1-additions.css reference"
else
    echo "   ℹ️  PATCH INV-5c — p0-p1-additions.css not referenced (OK)"
fi

# Add styles-main.css after nav-unified.css (if not already present)
if ! grep -q 'styles-main\.css' "$FILE"; then
    sed -i '/<link[^>]*nav-unified\.css[^>]*>/a\    <link rel="stylesheet" href="styles/styles-main.css">' "$FILE"
    ok "INV-5d" "Added styles-main.css reference"
else
    echo "   ℹ️  PATCH INV-5d — styles-main.css already referenced (OK)"
fi

# ============================================================
# SUMMARY
# ============================================================

echo ""
echo "=================================================="
echo "  investidores.html — $PATCH_COUNT patches applied"
echo "=================================================="
echo "  Backup: ${FILE}.bak"
echo ""
echo "  Verify with:"
echo "    diff ${FILE}.bak $FILE"
echo ""
echo "  Revert with:"
echo "    cp ${FILE}.bak $FILE"
echo "=================================================="
