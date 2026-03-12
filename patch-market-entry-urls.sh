#!/bin/bash
# patch-market-entry-urls.sh
# Corrige canonical, og:url, hreflang e Schema.org nos artigos market-entry/posts/
# que ainda apontam para /blog/posts/ (caminho errado)
# Também adiciona hreflang x-default onde falta
# Uso: bash patch-market-entry-urls.sh (na raiz do repo)

DIR="public/market-entry/posts"
ERRORS=0

if [ ! -d "$DIR" ]; then
  echo "❌ Pasta não encontrada: $DIR"
  exit 1
fi

python3 - "$DIR" <<'PYEOF'
import sys, os

dir_path = sys.argv[1]
files = [f for f in os.listdir(dir_path) if f.endswith('.html')]
errors = 0

for fname in sorted(files):
    fpath = os.path.join(dir_path, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False
    slug = fname  # e.g. ai-latam-gtm-strategies-en.html

    # 1. Fix wrong canonical path: /blog/posts/ → /market-entry/posts/
    wrong = f'https://www.alavanka.com.br/blog/posts/{slug}'
    correct = f'https://www.alavanka.com.br/market-entry/posts/{slug}'
    if wrong in content:
        content = content.replace(wrong, correct)
        changed = True
        print(f'  🔧 Canonical/og:url corrigido: blog/posts → market-entry/posts')

    # 2. Fix optimizing-latam (2-space indent hreflang)
    old_2sp = f'  <link rel="alternate" hreflang="en" href="{correct}">'
    new_4sp = f'    <link rel="alternate" hreflang="en" href="{correct}">'
    if old_2sp in content and new_4sp not in content:
        content = content.replace(old_2sp, new_4sp)
        changed = True

    # 3. Add x-default if missing
    hreflang_en = f'    <link rel="alternate" hreflang="en" href="{correct}">'
    hreflang_xd = f'    <link rel="alternate" hreflang="x-default" href="{correct}">'
    if hreflang_en in content and hreflang_xd not in content:
        content = content.replace(
            hreflang_en,
            hreflang_en + '\n' + hreflang_xd
        )
        changed = True
        print(f'  ✅ hreflang x-default adicionado')

    if changed:
        # Backup
        with open(fpath + '.bak', 'w', encoding='utf-8') as f:
            f.write(open(fpath, 'r', encoding='utf-8').read())
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✅ {fname} — atualizado')
    else:
        print(f'⏭️  {fname} — sem alterações necessárias')

print(f'\n{"🎉 Concluído sem erros!" if errors == 0 else f"⚠️ {errors} erro(s)"}')
PYEOF

echo ""
echo "Verificação final:"
grep -n "hreflang\|canonical" "$DIR"/*.html | grep -v ".bak"

echo ""
echo "Próximo passo:"
echo "  npm run build"
echo "  git add public/market-entry/posts/ generate-sitemap.js public/sitemap.xml"
echo "  git commit -m 'SEO: corrige canonical/og:url/hreflang nos artigos market-entry, sitemap completo'"
echo "  git push"
