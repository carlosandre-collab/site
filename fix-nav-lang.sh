#!/usr/bin/env bash
# fix-nav-lang.sh
# Adds language switching to nav.js:
#   1. Reads localStorage on init so nav renders in the stored language
#   2. Wraps nav build in a function (buildAndInjectNav)
#   3. Adds langChange listener that calls buildAndInjectNav with the new language config
#
# Usage (from repo root):
#   bash fix-nav-lang.sh            # live
#   bash fix-nav-lang.sh --dry-run  # preview only
#
# Idempotent: SKIP if already applied

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${SCRIPT_DIR}/public/components/nav.js"
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

if $DRY_RUN; then MODE="DRY RUN"; else MODE="LIVE"; fi

echo "fix-nav-lang.sh"
echo "Target : ${TARGET}"
echo "Mode   : ${MODE}"
echo "──────────────────────────────────────────────────────"

[[ -f "$TARGET" ]] || { echo "ERROR: ${TARGET} not found"; exit 1; }

python3 - "$TARGET" "$($DRY_RUN && echo 1 || echo 0)" << 'PYEOF'
import sys, re, shutil

filepath = sys.argv[1]
dry_run  = sys.argv[2] == "1"

with open(filepath, 'r', encoding='utf-8') as f:
    nav = f.read()

# ── Guard ─────────────────────────────────────────────────────────────────────
if 'buildAndInjectNav' in nav and 'isMEPPage' in nav:
    print(f"SKIP  {filepath}  (already applied)")
    sys.exit(0)

changes = []

# ── Fix 1: localStorage on context detection ──────────────────────────────────
OLD1 = (
    "    var isEN = currentPath.indexOf('market-entry') !== -1;\n"
    "    var context = isEN ? 'en' : 'pt';"
)
NEW1 = (
    "    var isMEPPage = currentPath.indexOf('market-entry') !== -1;\n"
    "    var storedLang = localStorage.getItem('alavanka-lang');\n"
    "    var isEN = isMEPPage || (!isMEPPage && storedLang === 'en');\n"
    "    var context = isEN ? 'en' : 'pt';"
)
assert nav.count(OLD1) == 1, "Fix 1 pattern not found"
nav = nav.replace(OLD1, NEW1)
changes.append("  localStorage read on init (isMEPPage + storedLang)")

# ── Fix 2: find the nav build block boundaries ────────────────────────────────
# Start: "    // — Build navigation HTML —"
# End: just before "    // — Replace existing nav —"
# Inject: just before "    // — Navigation functions —"

BUILD_MARKER  = "    // — Build navigation HTML —"
INJECT_MARKER = "    // — Replace existing nav —"
FUNC_MARKER   = "    // — Navigation functions —"
IIFE_CLOSE    = "\n})();\n"

assert nav.count(BUILD_MARKER)  == 1, "BUILD_MARKER not found"
assert nav.count(INJECT_MARKER) == 1, "INJECT_MARKER not found"
assert nav.count(FUNC_MARKER)   == 1, "FUNC_MARKER not found"
assert nav.count(IIFE_CLOSE)    == 1, "IIFE_CLOSE not found"

# Extract the build block (from BUILD_MARKER up to but not including INJECT_MARKER)
idx_build  = nav.index(BUILD_MARKER)
idx_inject = nav.index(INJECT_MARKER)
idx_func   = nav.index(FUNC_MARKER)

build_and_inject_block = nav[idx_build:idx_func]

# ── Fix 3: wrap in function + add langChange listener ────────────────────────
FUNCTION_WRAPPER = (
    "    // — Build and inject nav HTML —\n"
    "    function buildAndInjectNav(activeCfg, activeContext) {\n"
    "        var cfg = activeCfg;\n"
    "        var context = activeContext;\n"
    # insert original build block (strip the old comment line)
)

# Build the replacement: function wrapping build block + inject + close brace
# then initial call + langChange listener

inject_code = (
    "        // Inject\n"
    "        var existingNav = document.querySelector('nav[role=\"navigation\"]') "
    "|| document.getElementById('main-nav');\n"
    "        if (existingNav) {\n"
    "            existingNav.outerHTML = navHTML;\n"
    "        } else {\n"
    "            document.body.insertAdjacentHTML('afterbegin', navHTML);\n"
    "        }\n"
    "    } // end buildAndInjectNav\n\n"
    "    // Initial render\n"
    "    buildAndInjectNav(cfg, context);\n\n"
    "    // Re-render nav when user toggles language\n"
    "    window.addEventListener('langChange', function (e) {\n"
    "        if (!e.detail || !e.detail.lang) return;\n"
    "        if (isMEPPage) return;\n"
    "        var newLang = e.detail.lang;\n"
    "        var newCfg = NAV_CONFIG[newLang];\n"
    "        if (!newCfg) return;\n"
    "        buildAndInjectNav(newCfg, newLang);\n"
    "    });\n\n"
)

# Get the original inject block (the replace existing nav lines)
original_inject = nav[idx_inject:idx_func]

# The build block (without the inject part) — from BUILD_MARKER to INJECT_MARKER
build_only = nav[idx_build:idx_inject]
# Remove the original "// — Build navigation HTML —" comment line (first line)
build_only_lines = build_only.split('\n')
# Skip first line (the comment), keep the rest, add 4-space indent
build_body = '\n'.join('    ' + l if l.strip() else l
                       for l in build_only_lines[1:])

# Assemble: function header + indented build body + inject_code
new_block = (
    "    // — Build and inject nav HTML —\n"
    "    function buildAndInjectNav(activeCfg, activeContext) {\n"
    "        var cfg = activeCfg;\n"
    "        var context = activeContext;\n" +
    build_body + "\n" +
    "        // Inject\n"
    "        var _existingNav = document.querySelector('nav[role=\"navigation\"]') "
    "|| document.getElementById('main-nav');\n"
    "        if (_existingNav) {\n"
    "            _existingNav.outerHTML = navHTML;\n"
    "        } else {\n"
    "            document.body.insertAdjacentHTML('afterbegin', navHTML);\n"
    "        }\n"
    "    }\n\n"
    "    // Initial render\n"
    "    buildAndInjectNav(cfg, context);\n\n"
    "    // Re-render nav when user toggles language\n"
    "    window.addEventListener('langChange', function (e) {\n"
    "        if (!e.detail || !e.detail.lang) return;\n"
    "        if (isMEPPage) return;\n"
    "        var newLang = e.detail.lang;\n"
    "        var newCfg = NAV_CONFIG[newLang];\n"
    "        if (!newCfg) return;\n"
    "        buildAndInjectNav(newCfg, newLang);\n"
    "    });\n\n"
)

# Replace from BUILD_MARKER through original inject block with our new block
old_section = nav[idx_build:idx_func]
nav = nav.replace(old_section, new_block)
changes.append("  buildAndInjectNav() function wrapping nav build")
changes.append("  langChange listener re-renders nav with NAV_CONFIG[newLang]")
changes.append("  buildAndInjectNav(cfg, context) called on init")

# ── Verify ────────────────────────────────────────────────────────────────────
assert 'buildAndInjectNav' in nav
assert 'isMEPPage' in nav
assert "window.addEventListener('langChange'" in nav
assert nav.count("})();") == 1, f"IIFE count: {nav.count('})();')}"

# Check NAV_CONFIG is before the listener (closure scope)
assert nav.index('var NAV_CONFIG') < nav.index("window.addEventListener('langChange'")

# ── Write ─────────────────────────────────────────────────────────────────────
tag = "DRYRUN" if dry_run else "FIXED "
print(f"{tag}  {filepath}")
for c in changes:
    print(c)

if not dry_run:
    shutil.copy2(filepath, filepath + ".bak")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(nav)
    print(f"  backup → {filepath}.bak")

PYEOF
exit $?
