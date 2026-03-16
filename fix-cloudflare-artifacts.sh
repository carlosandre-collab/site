#!/usr/bin/env bash
# fix-cloudflare-artifacts.sh
# Removes all Cloudflare email obfuscation artifacts injected when the site
# passed through a Cloudflare proxy. Restores plain mailto: links.
#
# Fixes in index.html:
#   1. Removes email-decode.min.js script tag (404 on Vercel)
#   2. Restores obfuscated email link → mailto:carlos@alavanka.com.br
#
# Fixes in market-entry.html:
#   1. Removes email-decode.min.js script tag (404 on Vercel)
#   2. Restores "Email Us" CTA → mailto:info@alavanka.com
#   3. Restores share-by-email button → mailto:?subject=...
#
# Safe to re-run: each step checks before applying.
# Usage: bash fix-cloudflare-artifacts.sh [path/to/public]

set -euo pipefail

PUBLIC="${1:-$HOME/site/public}"
INDEX="$PUBLIC/index.html"
ME="$PUBLIC/market-entry.html"

for f in "$INDEX" "$ME"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: File not found: $f"
    echo "Usage: bash fix-cloudflare-artifacts.sh /path/to/your/public"
    exit 1
  fi
done

echo "Backing up files..."
cp "$INDEX" "$INDEX.bak"
cp "$ME"    "$ME.bak"
echo "Backups created."
echo ""

# ─────────────────────────────────────────────────────────────────
# index.html — Fix 1: Remove email-decode.min.js script tag
# ─────────────────────────────────────────────────────────────────
echo "Patching index.html..."

if grep -q 'email-decode.min.js' "$INDEX"; then
  python3 - "$INDEX" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: content = f.read()
content = content.replace(
    '<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script>',
    '<script>'
)
with open(path, 'w') as f: f.write(content)
print("  [done] Removed email-decode.min.js script tag")
PYEOF
else
  echo "  [skip] email-decode.min.js already removed"
fi

# index.html — Fix 2: Restore obfuscated email → mailto:carlos@alavanka.com.br
if grep -q 'cdn-cgi/l/email-protection' "$INDEX"; then
  python3 - "$INDEX" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f: content = f.read()

# Replace the entire obfuscated anchor with a clean mailto link
OLD = '<a href="/cdn-cgi/l/email-protection#c3a0a2b1afacb083a2afa2b5a2ada8a2eda0acaeeda1b1"><span class="__cf_email__" data-cfemail="c3a0a2b1afacb083a2afa2b5a2ada8a2eda0acaeeda1b1">[email&#160;protected]</span></a>'
NEW = '<a href="mailto:carlos@alavanka.com.br">carlos@alavanka.com.br</a>'

if OLD in content:
    content = content.replace(OLD, NEW)
    with open(path, 'w') as f: f.write(content)
    print("  [done] Restored email link → mailto:carlos@alavanka.com.br")
else:
    print("  [skip] Email link already restored or pattern not found")
PYEOF
else
  echo "  [skip] Email link already clean"
fi

echo "  index.html — done"
echo ""

# ─────────────────────────────────────────────────────────────────
# market-entry.html — Fix 1: Remove email-decode.min.js
# ─────────────────────────────────────────────────────────────────
echo "Patching market-entry.html..."

if grep -q 'email-decode.min.js' "$ME"; then
  python3 - "$ME" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: content = f.read()
content = content.replace(
    '<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script>',
    '<script>'
)
with open(path, 'w') as f: f.write(content)
print("  [done] Removed email-decode.min.js script tag")
PYEOF
else
  echo "  [skip] email-decode.min.js already removed"
fi

# market-entry.html — Fix 2: Restore "Email Us" CTA → mailto:info@alavanka.com
if grep -q 'cdn-cgi/l/email-protection#076e69616847666b667166696c662964686a' "$ME"; then
  python3 - "$ME" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: content = f.read()
OLD = '/cdn-cgi/l/email-protection#076e69616847666b667166696c662964686a'
NEW = 'mailto:info@alavanka.com'
content = content.replace(OLD, NEW)
with open(path, 'w') as f: f.write(content)
print("  [done] Restored 'Email Us' CTA → mailto:info@alavanka.com")
PYEOF
else
  echo "  [skip] Email Us link already clean"
fi

# market-entry.html — Fix 3: Restore share-by-email button mailto
if grep -q 'cdn-cgi/l/email-protection#caf5b9bf' "$ME"; then
  python3 - "$ME" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: content = f.read()
OLD = '/cdn-cgi/l/email-protection#caf5b9bfa8a0afa9bef786abbe8ba7eff8fa87abb8a1afbeeff8fa8fa4beb8b3eff8fa284a5eeff8fa8ba6abbcaba4a1abeca8a5aeb3f79ea2a5bfada2beeff8fabea2a3b9eff8faa7a3ada2beeff8faa8afeff8fab8afa6afbcaba4beeff8faaca5b8eff8fab3a5bfb8eff8fa86abbe8ba7eff8faafb2baaba4b9a3a5a4eff8fabaa6aba4b9e4effa8beffa8ba2bebebab9eff98beff88ceff88cbdbdbde4aba6abbcaba4a1abe4a9a5a7e4a8b8eff88ca7abb8a1afbee7afa4beb8b3'
NEW = 'mailto:?subject=LatAm%20Market%20Entry%20%E2%80%94%20Alavanka&body=Thought%20this%20might%20be%20relevant%20for%20your%20LatAm%20expansion%20plans.%0A%0Ahttps%3A%2F%2Fwww.alavanka.com.br%2Fmarket-entry'
content = content.replace(OLD, NEW)
with open(path, 'w') as f: f.write(content)
print("  [done] Restored share email button → clean mailto: link")
PYEOF
else
  echo "  [skip] Share email already clean"
fi

echo "  market-entry.html — done"

# ─────────────────────────────────────────────────────────────────
# VERIFY
# ─────────────────────────────────────────────────────────────────
echo ""
echo "Verification:"
for f in "$INDEX" "$ME"; do
  name=$(basename "$f")
  echo ""
  echo "  $name"
  if grep -q 'email-decode.min.js' "$f"; then
    echo "    ✗ email-decode.min.js still present"
  else
    echo "    ✓ email-decode.min.js removed"
  fi
  if grep -q 'cdn-cgi' "$f"; then
    remaining=$(grep -c 'cdn-cgi' "$f")
    echo "    ✗ $remaining cdn-cgi reference(s) still present"
    grep -n 'cdn-cgi' "$f" | head -3
  else
    echo "    ✓ No cdn-cgi references remaining"
  fi
  if grep -q 'mailto:' "$f"; then
    echo "    ✓ Clean mailto: link(s) present"
  fi
done

echo ""
echo "Commit with:"
echo "  git add public/index.html public/market-entry.html"
echo "  git commit -m \"fix: remove Cloudflare email obfuscation artifacts\""
echo "  git push"
echo ""
echo "To roll back:"
echo "  cp $INDEX.bak $INDEX"
echo "  cp $ME.bak $ME"
