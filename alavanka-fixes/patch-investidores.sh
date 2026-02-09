#!/bin/bash
# ============================================================
# ALAVANKA — Patch Script for investidores.html (FIXED v2)
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
# ============================================================

if grep -q 'btn-talk-now svg' "$FILE"; then
    perl -i -0pe '
        s/(\.btn-talk-now\s+svg\s*\{[^}]*\}\s*\n)(\s*)(width:\s*40px)/$1$2.flag-icon \{\n$2    $3/s
    ' "$FILE"
    
    if grep -qP '\.flag-icon\s*\{' "$FILE"; then
        ok "INV-1" "Restored .flag-icon selector to orphaned CSS rules"
    else
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
# Uses external perl script to avoid shell quote escaping hell
# ============================================================

if grep -q "mode.*no-cors" "$FILE" && grep -q "script\.google\.com" "$FILE"; then

    cat > /tmp/_patch_inv2.pl << 'PERLEOF'
use strict;
use warnings;
my $file = $ARGV[0];
open(my $fh, '<', $file) or die "Cannot open $file: $!";
my $content = do { local $/; <$fh> };
close($fh);

$content =~ s{
    (fetch\([^\n]*script\.google\.com[^\n]*\n(?:.*?\n)*?.*?mode:\s*'no-cors'.*?\}\s*\))\s*;
}{$1
            .catch(function(error) {
                console.error('Form submission failed:', error);
                var statusEl = document.querySelector('.report-status, .form-status');
                if (statusEl) {
                    statusEl.innerHTML = '<p style="color:var(--danger)">Erro ao enviar. Tente novamente.</p>';
                }
            });}sx;

open(my $out, '>', $file) or die "Cannot write $file: $!";
print $out $content;
close($out);
PERLEOF

    perl /tmp/_patch_inv2.pl "$FILE"
    rm -f /tmp/_patch_inv2.pl
    
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
# ============================================================

if grep -q 'id="calcArr"' "$FILE"; then
    sed -i 's/\(id="calcArr"[^>]*\)inputmode="numeric"/\1inputmode="decimal" pattern="[0-9]*"/' "$FILE"
    
    if grep -q 'id="calcArr".*inputmode="decimal"' "$FILE"; then
        ok "INV-3" "Fixed ARR input for mobile numeric keyboard"
    else
        sed -i 's/\(id="calcArr"[^>]*\)>/\1 pattern="[0-9]*">/' "$FILE"
        ok "INV-3" "Added pattern attribute to ARR input (fallback)"
    fi
else
    fail "INV-3" "calcArr input element"
fi

# ============================================================
# PATCH INV-4: Fix translation race condition
# Uses external perl script to avoid escaping issues
# ============================================================

if grep -q 'function updateScorecardVerdict' "$FILE"; then

    cat > /tmp/_patch_inv4.pl << 'PERLEOF'
use strict;
use warnings;
my $file = $ARGV[0];
open(my $fh, '<', $file) or die "Cannot open $file: $!";
my $content = do { local $/; <$fh> };
close($fh);

$content =~ s{
    (function\s+updateScorecardVerdict\s*\([^)]*\)\s*\{)
}{$1
        // Guard: skip if translations not loaded yet
        if (!translations || Object.keys(translations).length === 0) return;}sx;

open(my $out, '>', $file) or die "Cannot write $file: $!";
print $out $content;
close($out);
PERLEOF

    perl /tmp/_patch_inv4.pl "$FILE"
    rm -f /tmp/_patch_inv4.pl
    
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
# ============================================================

if grep -q 'styles-deferred\.css' "$FILE"; then
    sed -i '/<link[^>]*styles-deferred\.css[^>]*>/d' "$FILE"
    ok "INV-5a" "Removed styles-deferred.css reference"
else
    fail "INV-5a" "styles-deferred.css reference"
fi

if grep -q 'styles-ux-enhanced\.css' "$FILE"; then
    sed -i '/<link[^>]*styles-ux-enhanced\.css[^>]*>/d' "$FILE"
    ok "INV-5b" "Removed styles-ux-enhanced.css reference"
else
    fail "INV-5b" "styles-ux-enhanced.css reference"
fi

if grep -q 'p0-p1-additions\.css' "$FILE"; then
    sed -i '/<link[^>]*p0-p1-additions\.css[^>]*>/d' "$FILE"
    ok "INV-5c" "Removed p0-p1-additions.css reference"
else
    echo "   ℹ️  PATCH INV-5c — p0-p1-additions.css not referenced (OK)"
fi

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
