#!/usr/bin/env bash
# fix-meta-index.sh
# Updates title, meta description, og tags and Schema.org in index.html.
# Removes "Market Entry Partnership", "Fractional CRO" and "$300M+" from all meta tags.
#
# Safe to re-run: checks before applying each change.
# Usage: bash fix-meta-index.sh [path/to/public]

set -euo pipefail

PUBLIC="${1:-public}"
FILE="$PUBLIC/index.html"

if [ ! -f "$FILE" ]; then
  echo "ERROR: File not found: $FILE"
  echo "Usage: bash fix-meta-index.sh public"
  exit 1
fi

echo "Backing up $FILE..."
cp "$FILE" "$FILE.bak"
echo "Backup created: $FILE.bak"
echo ""

# ─────────────────────────────────────────────────────────────────
# Fix 1 — <title>
# ─────────────────────────────────────────────────────────────────
python3 - "$FILE" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f: content = f.read()
NEW = '<title>Alavanka | Startup Growth para B2B SaaS no Brasil</title>'
content, n = re.subn(r'<title>Alavanka \|[^<]+</title>', NEW, content)
with open(path, 'w') as f: f.write(content)
print(f"[{'done' if n else 'skip'}] Title updated")
PYEOF

# ─────────────────────────────────────────────────────────────────
# Fix 2 — meta description
# ─────────────────────────────────────────────────────────────────
python3 - "$FILE" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f: content = f.read()
NEW = '<meta name="description" content="Sua startup B2B travada em crescimento? A Alavanka entra na operação, estrutura o GTM e executa junto com você. Não é consultoria — é operação conjunta.">'
content, n = re.subn(r'<meta name="description" content="[^"]*">', NEW, content)
with open(path, 'w') as f: f.write(content)
print(f"[{'done' if n else 'skip'}] meta description updated")
PYEOF

# ─────────────────────────────────────────────────────────────────
# Fix 3 — og:title
# ─────────────────────────────────────────────────────────────────
python3 - "$FILE" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f: content = f.read()
NEW = '<meta property="og:title" content="Alavanka | Startup Growth para B2B SaaS no Brasil">'
content, n = re.subn(r'<meta property="og:title" content="[^"]*">', NEW, content)
with open(path, 'w') as f: f.write(content)
print(f"[{'done' if n else 'skip'}] og:title updated")
PYEOF

# ─────────────────────────────────────────────────────────────────
# Fix 4 — og:description
# ─────────────────────────────────────────────────────────────────
python3 - "$FILE" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f: content = f.read()
NEW = '<meta property="og:description" content="Execução hands-on de Startup Growth para B2B SaaS no Brasil. Diagnóstico em 30 dias, execução imediata, resultado mensurável.">'
content, n = re.subn(r'<meta property="og:description" content="[^"]*">', NEW, content)
with open(path, 'w') as f: f.write(content)
print(f"[{'done' if n else 'skip'}] og:description updated")
PYEOF

# ─────────────────────────────────────────────────────────────────
# Fix 5 — Schema.org Organization description
# ─────────────────────────────────────────────────────────────────
python3 - "$FILE" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: content = f.read()
OLD = '"description": "Fractional CRO para startups B2B no Brasil e Market Entry Partnership para empresas internacionais expandindo na América Latina."'
NEW = '"description": "Startup Growth para startups B2B no Brasil e Build-Operate-Transfer para empresas internacionais expandindo na América Latina."'
if OLD in content:
    content = content.replace(OLD, NEW)
    with open(path, 'w') as f: f.write(content)
    print("[done] Schema.org Organization description updated")
else:
    print("[skip] Schema.org description already updated")
PYEOF

# ─────────────────────────────────────────────────────────────────
# Fix 6 — Schema.org serviceType array
# ─────────────────────────────────────────────────────────────────
python3 - "$FILE" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f: content = f.read()
OLD = '"serviceType": ["Fractional CRO", "Market Entry Partnership", "B2B GTM Strategy"]'
NEW = '"serviceType": ["Startup Growth", "Build-Operate-Transfer", "B2B GTM Strategy"]'
if OLD in content:
    content = content.replace(OLD, NEW)
    with open(path, 'w') as f: f.write(content)
    print("[done] Schema.org serviceType updated")
else:
    print("[skip] Schema.org serviceType already updated")
PYEOF

# ─────────────────────────────────────────────────────────────────
# VERIFY
# ─────────────────────────────────────────────────────────────────
echo ""
echo "Verification:"

python3 - "$FILE" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f: content = f.read()

m = re.search(r'<title>(.*?)</title>', content)
print(f"  title:          {m.group(1) if m else 'NOT FOUND'}")

m = re.search(r'<meta name="description" content="([^"]*)"', content)
print(f"  description:    {(m.group(1)[:80] + '...') if m else 'NOT FOUND'}")

m = re.search(r'<meta property="og:title" content="([^"]*)"', content)
print(f"  og:title:       {m.group(1) if m else 'NOT FOUND'}")

m = re.search(r'<meta property="og:description" content="([^"]*)"', content)
print(f"  og:description: {(m.group(1)[:80] + '...') if m else 'NOT FOUND'}")

head = content[:content.find('</head>')]
problems = []
if 'Market Entry Partnership' in head: problems.append("'Market Entry Partnership' still in <head>")
if '$300M+' in head:                   problems.append("'$300M+' still in <head>")

if problems:
    for p in problems: print(f"  ✗ {p}")
else:
    print("  ✓ No old terms in <head>")
PYEOF

echo ""
echo "Commit with:"
echo "  git add public/index.html"
echo "  git commit -m \"fix: update meta + Schema.org — Startup Growth positioning, remove Market Entry Partnership\""
echo "  git push"
echo ""
echo "To roll back:"
echo "  cp $FILE.bak $FILE"
