#!/bin/bash
# fix-nav-logo.sh — troca PNG→SVG + fetchpriority=high no nav.js
# Uso: bash fix-nav-logo.sh ~/site/public/components/nav.js

set -e
FILE="${1:-public/components/nav.js}"
[ -f "$FILE" ] || { echo "Não encontrado: $FILE"; exit 1; }
cp "$FILE" "${FILE}.bak"

python3 - "$FILE" << 'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()

# 1. PNG → SVG
old1 = "var logoPath = basePath + 'assets/images/brand/logo-completo-navy.png';"
new1 = "var logoPath = basePath + 'assets/images/brand/logo-completo-navy.svg';"
assert old1 in content, "logoPath PNG não encontrado"
content = content.replace(old1, new1)

# 2. Adiciona width, height e fetchpriority na img tag
old2 = '+ \'    <img src="\' + logoPath + \'" alt="Alavanka" class="nav-logo-img">\''
new2 = '+ \'    <img src="\' + logoPath + \'" alt="Alavanka" class="nav-logo-img" width="201" height="77" fetchpriority="high">\''
if old2 in content:
    content = content.replace(old2, new2)
    print("✓ fetchpriority=high + width/height adicionados")
else:
    print("⚠ IMG tag não encontrada com sintaxe esperada — apenas PNG→SVG aplicado")

with open(path, 'w') as f:
    f.write(content)
print("✓ logo-completo-navy.png → .svg")
print(f"  Backup: {path}.bak")
PYEOF
