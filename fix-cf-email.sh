#!/usr/bin/env bash
# fix-cf-email.sh
# Replaces Cloudflare email obfuscation with plain mailto: links.
#
# What it fixes:
#   1. href="/cdn-cgi/l/email-protection#<hex>"  → href="mailto:<decoded>"
#   2. <span class="__cf_email__" data-cfemail="<hex>">...</span>  → plain email
#   3. Dead <script src="/cdn-cgi/.../email-decode.min.js"> tag  → removed
#
# Usage (run from repo root):
#   bash fix-cf-email.sh            # live — writes files, creates .bak backups
#   bash fix-cf-email.sh --dry-run  # preview only, no writes
#
# investidores.html is intentionally excluded.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PUBLIC_DIR="${SCRIPT_DIR}/public"
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
fi

if $DRY_RUN; then MODE="DRY RUN (no files written)"; else MODE="LIVE"; fi

# Files to fix — investidores.html excluded by design
TARGETS=(
    "${PUBLIC_DIR}/index.html"
    "${PUBLIC_DIR}/market-entry.html"
    "${PUBLIC_DIR}/privacy.html"
)

echo "fix-cf-email.sh"
echo "Public dir : ${PUBLIC_DIR}"
echo "Mode       : ${MODE}"
echo "──────────────────────────────────────────────────────"

ERRORS=0

for FILEPATH in "${TARGETS[@]}"; do

    if [[ ! -f "$FILEPATH" ]]; then
        echo "MISSING  ${FILEPATH}"
        (( ERRORS++ )) || true
        continue
    fi

    if $DRY_RUN; then DRY_FLAG="1"; else DRY_FLAG="0"; fi

    python3 - "$FILEPATH" "$DRY_FLAG" << 'PYEOF'
import sys, re, shutil

filepath = sys.argv[1]
dry_run  = sys.argv[2] == "1"

def cf_decode(hex_str):
    r = int(hex_str[:2], 16)
    return "".join(chr(int(hex_str[i:i+2], 16) ^ r) for i in range(2, len(hex_str), 2))

with open(filepath, "r", encoding="utf-8") as fh:
    original = fh.read()

html = original
changes = []

# 1. href="/cdn-cgi/l/email-protection#<hex>"
def replace_href(m):
    decoded = cf_decode(m.group(1))
    new_href = decoded if decoded.startswith("mailto:") else f"mailto:{decoded}"
    changes.append(f"  href   /cdn-cgi/... → {new_href[:80]}")
    return f'href="{new_href}"'

html = re.sub(
    r'href="/cdn-cgi/l/email-protection#([0-9a-f]+)"',
    replace_href, html
)

# 2. <span class="__cf_email__" data-cfemail="<hex>">...</span>
def replace_span(m):
    email = cf_decode(m.group(1))
    changes.append(f"  span   __cf_email__ → {email}")
    return email

html = re.sub(
    r'<span class="__cf_email__" data-cfemail="([0-9a-f]+)">[^<]*</span>',
    replace_span, html
)

# 3. Dead email-decode.min.js script tag
before = len(html)
html = re.sub(
    r'<script data-cfasync="false" src="/cdn-cgi/scripts/[^"]+/cloudflare-static/email-decode\.min\.js"></script>',
    "", html
)
if len(html) < before:
    changes.append("  script  email-decode.min.js removed")

if not changes:
    print(f"SKIP     {filepath}  (already clean)")
    sys.exit(0)

tag = "DRYRUN" if dry_run else "FIXED "
print(f"{tag}   {filepath}")
for c in changes:
    print(c)

if not dry_run:
    shutil.copy2(filepath, filepath + ".bak")
    with open(filepath, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"  backup → {filepath}.bak")
PYEOF

    if [[ $? -ne 0 ]]; then
        (( ERRORS++ )) || true
    fi

done

echo "──────────────────────────────────────────────────────"
if [[ $ERRORS -eq 0 ]]; then
    if $DRY_RUN; then
        echo "Done. (dry run — no files written)"
    else
        echo "Done. Originals saved as <file>.html.bak"
    fi
else
    echo "Done with ${ERRORS} error(s)."
fi
exit $ERRORS
