#!/usr/bin/env bash
# patch-analytics-index.sh
# Moves GA4, Clarity and Vercel Analytics to <head> in index.html.
# Removes the old PATCH 1 / PATCH 6 workarounds that deferred tags to
# end of <body>, which caused early bounces to be missed in GA4 and Clarity.
#
# Safe to re-run: each step checks before applying.
# Usage: bash patch-analytics-index.sh [path/to/public]

set -euo pipefail

PUBLIC="${1:-$HOME/site/public}"
FILE="$PUBLIC/index.html"

if [ ! -f "$FILE" ]; then
  echo "ERROR: File not found: $FILE"
  echo "Usage: bash patch-analytics-index.sh /path/to/your/public"
  exit 1
fi

echo "Backing up $FILE..."
cp "$FILE" "$FILE.bak"
echo "Backup created: $FILE.bak"
echo ""

# ─────────────────────────────────────────────────────────────────
# STEP 1 — Fix <html> block: move Vercel inside <head> and add
#           GA4 + Clarity right after, replacing PATCH 1 stub
# ─────────────────────────────────────────────────────────────────
if grep -q 'Analytics — in <head>' "$FILE"; then
  echo "[skip] Step 1 — analytics already in <head>"
else
  python3 - "$FILE" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

OLD = '''<!DOCTYPE html>
<html lang="pt-BR">
<script defer src="/_vercel/insights/script.js"></script>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>Alavanka | Fractional CRO Brasil &amp; LatAm Market Entry Partnership</title>'''

NEW = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>Alavanka | Fractional CRO Brasil &amp; LatAm Market Entry Partnership</title>'''

if OLD not in content:
    # Try without &amp; (some editors save as &)
    OLD = OLD.replace('&amp;', '&')
    NEW = NEW.replace('&amp;', '&')

content = content.replace(OLD, NEW, 1)

# Now replace PATCH 1 stub with full analytics block
PATCH1 = '''    <!-- PATCH 1: dataLayer init sem bloquear render (gtag movido para fim do body) -->
    <script>window.dataLayer = window.dataLayer || [];</script>'''

ANALYTICS = '''    <!-- Analytics — in <head> so early bounces are captured -->
    <script defer src="/_vercel/insights/script.js"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-D8LLY1L1Z3"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-D8LLY1L1Z3', {'send_page_view': true});
    </script>
    <script type="text/javascript">
      (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script","vb4dciqpnm");
    </script>'''

content = content.replace(PATCH1, ANALYTICS, 1)

with open(path, 'w') as f:
    f.write(content)
print("[done] Step 1 — Vercel + GA4 + Clarity moved to <head>")
PYEOF
fi

# ─────────────────────────────────────────────────────────────────
# STEP 2 — Remove PATCH 6 (duplicate GA4 + Clarity at end of body)
# ─────────────────────────────────────────────────────────────────
if grep -q 'PATCH 6' "$FILE"; then
  python3 - "$FILE" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

OLD = '''<!-- PATCH 6: GA4 async no fim do body + gtag init (não bloqueia mais o render) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-D8LLY1L1Z3"></script>
<script>
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-D8LLY1L1Z3', {'send_page_view': true});
</script>

<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "vb4dciqpnm");
</script>'''

content = content.replace(OLD, '', 1)

with open(path, 'w') as f:
    f.write(content)
print("[done] Step 2 — duplicate GA4 + Clarity removed from end of body")
PYEOF
else
  echo "[skip] Step 2 — PATCH 6 already removed"
fi

# ─────────────────────────────────────────────────────────────────
# VERIFY
# ─────────────────────────────────────────────────────────────────
echo ""
echo "Verification:"

# Vercel inside <head>
python3 - "$FILE" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

head_end = content.find('</head>')
vercel_pos = content.find('/_vercel/insights/script.js')

if vercel_pos == -1:
    print("  ✗ Vercel Analytics NOT FOUND")
elif vercel_pos < head_end:
    print("  ✓ Vercel Analytics — inside <head>")
else:
    print("  ✗ Vercel Analytics — still outside <head>")

ga4_pos = content.find('googletagmanager.com/gtag/js?id=G-D8LLY1L1Z3')
if ga4_pos != -1 and ga4_pos < head_end:
    print("  ✓ GA4 — inside <head>")
elif content.count('googletagmanager.com/gtag/js?id=G-D8LLY1L1Z3') > 1:
    print("  ✗ GA4 — duplicate tags found")
else:
    print("  ✗ GA4 — not in <head>")

clarity_count = content.count('clarity.ms/tag')
if clarity_count == 1:
    print("  ✓ Clarity — single instance")
else:
    print(f"  ✗ Clarity — {clarity_count} instances (should be 1)")

if 'PATCH 6' not in content:
    print("  ✓ PATCH 6 removed")
else:
    print("  ✗ PATCH 6 still present")

if 'PATCH 1' not in content:
    print("  ✓ PATCH 1 stub removed")
else:
    print("  ✗ PATCH 1 stub still present")

# Existing engagement tracking still intact
for event in ['scroll_depth', 'section_viewed', 'time_on_page', 'cta_click']:
    if event in content:
        print(f"  ✓ {event} tracking intact")
    else:
        print(f"  ✗ {event} tracking MISSING")
PYEOF

echo ""
echo "Commit with:"
echo "  git add public/index.html"
echo "  git commit -m 'fix: move GA4 + Clarity + Vercel Analytics to <head> in index.html'"
echo ""
echo "To roll back:"
echo "  cp $FILE.bak $FILE"
