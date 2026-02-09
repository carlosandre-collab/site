#!/bin/bash
set -euo pipefail
FILE="${1:-./public/investidores.html}"
if [ ! -f "$FILE" ]; then echo "File not found: $FILE"; exit 1; fi
cp "$FILE" "${FILE}.bak"
echo "✅ Backup created: ${FILE}.bak"
PATCH_COUNT=0
fail() { echo "⚠️  PATCH $1 — $2 (pattern not found, skipping)"; }
ok()   { PATCH_COUNT=$((PATCH_COUNT + 1)); echo "✅ PATCH $1 — $2"; }

# INV-1: Fix corrupted CSS block
if grep -q 'btn-talk-now svg' "$FILE"; then
    perl -i -0pe 's/(\.btn-talk-now\s+svg\s*\{[^}]*\}\s*\n)(\s*)(width:\s*40px)/$1$2.flag-icon \{\n$2    $3/s' "$FILE"
    if grep -qP '\.flag-icon\s*\{' "$FILE"; then ok "INV-1" "Restored .flag-icon selector"; else fail "INV-1" "orphaned CSS block"; fi
else fail "INV-1" ".btn-talk-now svg CSS block"; fi

# INV-2: Fix form error handling
if grep -q "mode.*no-cors" "$FILE" && grep -q "script\.google\.com" "$FILE"; then
    cat > /tmp/_p2.pl << 'PEOF'
my $f=$ARGV[0]; open(F,'<',$f) or die $!; my $c=do{local $/;<F>}; close F;
$c=~s{(fetch\([^\n]*script\.google\.com.*?mode:\s*'no-cors'.*?\}\s*\))\s*;}{$1
            .catch(function(error) {
                console.error('Form submission failed:', error);
            });}s;
open(O,'>',$f) or die $!; print O $c; close O;
PEOF
    perl /tmp/_p2.pl "$FILE"; rm -f /tmp/_p2.pl
    if grep -q '.catch(function(error)' "$FILE"; then ok "INV-2" "Added .catch() to fetch"; else fail "INV-2" "Could not patch fetch"; fi
else fail "INV-2" "no-cors fetch"; fi

# INV-3: Fix ARR input
if grep -q 'id="calcArr"' "$FILE"; then
    sed -i 's/\(id="calcArr"[^>]*\)inputmode="numeric"/\1inputmode="decimal" pattern="[0-9]*"/' "$FILE"
    ok "INV-3" "Fixed ARR input for mobile keyboard"
else fail "INV-3" "calcArr input"; fi

# INV-4: Translation race condition
if grep -q 'function updateScorecardVerdict' "$FILE"; then
    cat > /tmp/_p4.pl << 'PEOF'
my $f=$ARGV[0]; open(F,'<',$f) or die $!; my $c=do{local $/;<F>}; close F;
$c=~s{(function\s+updateScorecardVerdict\s*\([^)]*\)\s*\{)}{$1
        if (!translations || Object.keys(translations).length === 0) return;}s;
open(O,'>',$f) or die $!; print O $c; close O;
PEOF
    perl /tmp/_p4.pl "$FILE"; rm -f /tmp/_p4.pl
    if grep -q 'Object.keys(translations)' "$FILE"; then ok "INV-4" "Added translation guard"; else fail "INV-4" "Could not insert guard"; fi
else fail "INV-4" "updateScorecardVerdict function"; fi

# INV-5: Replace CSS refs
if grep -q 'styles-deferred\.css' "$FILE"; then sed -i '/<link[^>]*styles-deferred\.css[^>]*>/d' "$FILE"; ok "INV-5a" "Removed styles-deferred.css"; else fail "INV-5a" "styles-deferred.css"; fi
if grep -q 'styles-ux-enhanced\.css' "$FILE"; then sed -i '/<link[^>]*styles-ux-enhanced\.css[^>]*>/d' "$FILE"; ok "INV-5b" "Removed styles-ux-enhanced.css"; else fail "INV-5b" "styles-ux-enhanced.css"; fi
if grep -q 'p0-p1-additions\.css' "$FILE"; then sed -i '/<link[^>]*p0-p1-additions\.css[^>]*>/d' "$FILE"; ok "INV-5c" "Removed p0-p1-additions.css"; fi
if ! grep -q 'styles-main\.css' "$FILE"; then sed -i '/<link[^>]*nav-unified\.css[^>]*>/a\    <link rel="stylesheet" href="styles/styles-main.css">' "$FILE"; ok "INV-5d" "Added styles-main.css"; fi

echo ""
echo "  investidores.html — $PATCH_COUNT patches applied"
