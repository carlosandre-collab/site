#!/bin/bash
# patch-meta-v2.sh — Atualiza meta descriptions com conceito Startup Growth / LatAm Expansion
# Uso: bash patch-meta-v2.sh (na raiz do repo)

ERRORS=0

patch_file() {
  local FILE="$1"
  local NEW="$2"

  if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo não encontrado: $FILE"
    ERRORS=$((ERRORS+1))
    return
  fi

  cp "$FILE" "${FILE}.bak"

  python3 - "$FILE" "$NEW" <<'PYEOF'
import sys, re
path, new_content = sys.argv[1], sys.argv[2]
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_tag = f'<meta name="description" content="{new_content}">'
result = re.sub(r'<meta name="description" content="[^"]*">', new_tag, content, count=1)

if result == content:
    print(f"  ⚠️  Tag não encontrada em {path}")
    sys.exit(1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(result)
PYEOF

  echo "✅ $FILE"
  echo "   → $(grep 'meta name=\"description\"' "$FILE")"
}

# ── index.html ───────────────────────────────────────────────────────────────
patch_file "public/index.html" \
  "Startup Growth para B2B SaaS no Brasil. Fractional CRO com \$300M+ construído — execução hands-on, não consultoria."

# ── market-entry.html ────────────────────────────────────────────────────────
patch_file "public/market-entry.html" \
  "LatAm Expansion for B2B Tech. Build-Operate-Transfer model — Alavanka runs your operation end-to-end, you own the exit."

# ── market-entry/blog.html ───────────────────────────────────────────────────
patch_file "public/market-entry/blog.html" \
  "LatAm Expansion insights for B2B Tech — pricing, GTM fit, and go-to-market strategies from operators who built \$300M+ in the region."

# ── investidores.html ────────────────────────────────────────────────────────
patch_file "public/investidores.html" \
  "Startup Growth para portfolio companies B2B travadas. Diagnóstico em 30 dias, execução hands-on, success fee alinhado."

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "🎉 4 arquivos atualizados."
  echo ""
  echo "Próximo passo:"
  echo "  git add public/index.html public/market-entry.html public/investidores.html public/market-entry/blog.html"
  echo "  git commit -m 'SEO: meta descriptions v2 — Startup Growth / LatAm Expansion'"
  echo "  git push"
else
  echo "⚠️  $ERRORS erro(s). Verifique acima."
fi
