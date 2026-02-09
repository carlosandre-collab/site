#!/bin/bash
# ============================================================
# ALAVANKA — Master Deploy Script
# Runs all fixes: copies new files, deletes old ones, patches HTML
#
# USAGE:
#   chmod +x deploy-fixes.sh
#   ./deploy-fixes.sh [project_root]
#
# Default project root: . (current directory)
# Expects structure: project_root/public/
#
# WHAT IT DOES:
#   1. Copies styles-main.css (consolidated CSS)
#   2. Copies ux-enhancements.js (fixed JS)
#   3. Deletes old CSS files (styles-deferred, styles-ux-enhanced, p0-p1-additions)
#   4. Patches index.html (8 fixes)
#   5. Patches investidores.html (5 fixes)
#   6. Runs verification checks
# ============================================================

set -euo pipefail

ROOT="${1:-.}"
PUBLIC="$ROOT/public"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "╔══════════════════════════════════════════════╗"
echo "║  ALAVANKA — Bug Fix & CSS Optimization       ║"
echo "║  Deploying all fixes...                       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Validate project structure ──
if [ ! -d "$PUBLIC" ]; then
    echo "❌ Directory not found: $PUBLIC"
    echo "   Make sure you run this from the project root,"
    echo "   or pass the path: ./deploy-fixes.sh /path/to/project"
    exit 1
fi

if [ ! -f "$PUBLIC/index.html" ]; then
    echo "❌ index.html not found in $PUBLIC"
    exit 1
fi

echo "📁 Project root: $(cd "$ROOT" && pwd)"
echo ""

# ============================================================
# STEP 1: Deploy new CSS file
# ============================================================

echo "── STEP 1: Deploy consolidated CSS ──"

if [ ! -f "$SCRIPT_DIR/public/styles/styles-main.css" ]; then
    echo "❌ styles-main.css not found at $SCRIPT_DIR/public/styles/"
    echo "   Place the file there or run from the fix package directory."
    exit 1
fi

mkdir -p "$PUBLIC/styles"
cp "$SCRIPT_DIR/public/styles/styles-main.css" "$PUBLIC/styles/styles-main.css"
echo "✅ Copied styles-main.css → $PUBLIC/styles/"

# ============================================================
# STEP 2: Deploy fixed JS
# ============================================================

echo ""
echo "── STEP 2: Deploy fixed ux-enhancements.js ──"

if [ ! -f "$SCRIPT_DIR/public/components/ux-enhancements.js" ]; then
    echo "❌ ux-enhancements.js not found at $SCRIPT_DIR/public/components/"
    exit 1
fi

mkdir -p "$PUBLIC/components"
cp "$SCRIPT_DIR/public/components/ux-enhancements.js" "$PUBLIC/components/ux-enhancements.js"
echo "✅ Copied ux-enhancements.js → $PUBLIC/components/"

# ============================================================
# STEP 3: Delete old CSS files
# ============================================================

echo ""
echo "── STEP 3: Remove old CSS files ──"

for OLD_CSS in "styles-deferred.css" "styles-ux-enhanced.css" "p0-p1-additions.css"; do
    if [ -f "$PUBLIC/styles/$OLD_CSS" ]; then
        rm "$PUBLIC/styles/$OLD_CSS"
        echo "🗑️  Deleted $OLD_CSS"
    else
        echo "   ℹ️  $OLD_CSS not found (already removed or different location)"
    fi
done

# ============================================================
# STEP 4: Patch index.html
# ============================================================

echo ""
echo "── STEP 4: Patch index.html ──"

if [ -f "$SCRIPT_DIR/patch-index.sh" ]; then
    bash "$SCRIPT_DIR/patch-index.sh" "$PUBLIC/index.html"
else
    echo "⚠️  patch-index.sh not found, skipping"
fi

# ============================================================
# STEP 5: Patch investidores.html
# ============================================================

echo ""
echo "── STEP 5: Patch investidores.html ──"

if [ -f "$PUBLIC/investidores.html" ]; then
    if [ -f "$SCRIPT_DIR/patch-investidores.sh" ]; then
        bash "$SCRIPT_DIR/patch-investidores.sh" "$PUBLIC/investidores.html"
    else
        echo "⚠️  patch-investidores.sh not found, skipping"
    fi
else
    echo "⚠️  investidores.html not found in $PUBLIC, skipping"
fi

# ============================================================
# STEP 6: Verification
# ============================================================

echo ""
echo "── STEP 6: Verification ──"
echo ""

ERRORS=0

# Check: no references to deleted CSS files
for OLD_CSS in "styles-deferred.css" "styles-ux-enhanced.css" "p0-p1-additions.css"; do
    for HTML in "$PUBLIC/index.html" "$PUBLIC/investidores.html"; do
        if [ -f "$HTML" ] && grep -q "$OLD_CSS" "$HTML"; then
            echo "❌ FAIL: $(basename $HTML) still references $OLD_CSS"
            ERRORS=$((ERRORS + 1))
        fi
    done
done

# Check: styles-main.css is referenced
for HTML in "$PUBLIC/index.html" "$PUBLIC/investidores.html"; do
    if [ -f "$HTML" ]; then
        if grep -q 'styles-main\.css' "$HTML"; then
            echo "✅ PASS: $(basename $HTML) references styles-main.css"
        else
            echo "❌ FAIL: $(basename $HTML) does NOT reference styles-main.css"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

# Check: styles-main.css exists and has content
if [ -f "$PUBLIC/styles/styles-main.css" ]; then
    LINES=$(wc -l < "$PUBLIC/styles/styles-main.css")
    echo "✅ PASS: styles-main.css exists ($LINES lines)"
else
    echo "❌ FAIL: styles-main.css not found"
    ERRORS=$((ERRORS + 1))
fi

# Check: ux-enhancements.js doesn't have removed functions
if [ -f "$PUBLIC/components/ux-enhancements.js" ]; then
    if grep -q 'initScrollProgress\|initMobileStickyCTA\|initFAQAutoOpen\|initExitIntent\|initAudienceGate' "$PUBLIC/components/ux-enhancements.js"; then
        echo "❌ FAIL: ux-enhancements.js still has removed functions"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ PASS: ux-enhancements.js cleaned of duplicate handlers"
    fi
fi

# Check: no en-dash in CSS variables
if [ -f "$PUBLIC/styles/styles-main.css" ]; then
    if grep -P 'var\(–' "$PUBLIC/styles/styles-main.css" 2>/dev/null; then
        echo "❌ FAIL: styles-main.css still has en-dash in var()"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ PASS: No CSS variable typos (en-dash) found"
    fi
fi

# Check: scroll progress elements in index.html
if [ -f "$PUBLIC/index.html" ]; then
    SP_COUNT=$(grep -c 'class="scroll-progress"' "$PUBLIC/index.html" || true)
    if [ "$SP_COUNT" -le 1 ]; then
        echo "✅ PASS: Only $SP_COUNT scroll-progress element(s) in index.html"
    else
        echo "⚠️  WARN: $SP_COUNT scroll-progress elements in index.html (expected 1)"
    fi
fi

# Check: old CSS files are gone
for OLD_CSS in "styles-deferred.css" "styles-ux-enhanced.css" "p0-p1-additions.css"; do
    if [ -f "$PUBLIC/styles/$OLD_CSS" ]; then
        echo "⚠️  WARN: $OLD_CSS still exists on disk (deleted from HTML but file remains)"
    fi
done

echo ""
echo "╔══════════════════════════════════════════════╗"
if [ "$ERRORS" -eq 0 ]; then
    echo "║  ✅ ALL CHECKS PASSED                        ║"
else
    echo "║  ⚠️  $ERRORS CHECK(S) FAILED — review above    ║"
fi
echo "║                                              ║"
echo "║  Backups:                                    ║"
echo "║    $PUBLIC/index.html.bak          ║"
echo "║    $PUBLIC/investidores.html.bak   ║"
echo "║                                              ║"
echo "║  To revert everything:                       ║"
echo "║    cp $PUBLIC/index.html.bak $PUBLIC/index.html  ║"
echo "║    cp $PUBLIC/investidores.html.bak $PUBLIC/investidores.html ║"
echo "╚══════════════════════════════════════════════╝"
