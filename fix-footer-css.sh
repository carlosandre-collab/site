#!/bin/bash
# fix-footer-css.sh
# Converte footer.css de render-blocking para carregamento não-bloqueante
# Aplica em todos os HTMLs que usam footer.css
# Roda de dentro do repo: bash fix-footer-css.sh ~/site/public

set -e
DIR="${1:-public}"

if [ ! -d "$DIR" ]; then
  echo "Diretório não encontrado: $DIR"
  exit 1
fi

python3 - "$DIR" << 'PYEOF'
import sys, os, glob

pub = sys.argv[1]

# Padrão render-blocking a substituir
OLD = '<link rel="stylesheet" href="{path}styles/footer.css">'
# Padrão não-bloqueante (preload + fallback noscript)
NEW_TEMPLATE = '<link rel="preload" href="{path}styles/footer.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript><link rel="stylesheet" href="{path}styles/footer.css"></noscript>'

changed = []

# Busca todos os HTMLs
for html_file in glob.glob(os.path.join(pub, '**/*.html'), recursive=True):
    with open(html_file) as f:
        content = f.read()
    
    if 'footer.css' not in content:
        continue
    
    original = content
    
    # Detecta o prefixo usado neste arquivo
    for prefix in ['', '../', '../../']:
        pattern = f'<link rel="stylesheet" href="{prefix}styles/footer.css">'
        if pattern in content:
            replacement = f'<link rel="preload" href="{prefix}styles/footer.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript><link rel="stylesheet" href="{prefix}styles/footer.css"></noscript>'
            content = content.replace(pattern, replacement)
            break
    
    if content != original:
        # Backup
        with open(html_file + '.bak', 'w') as f:
            f.write(original)
        with open(html_file, 'w') as f:
            f.write(content)
        changed.append(html_file.replace(pub + '/', ''))

if changed:
    print(f"footer.css convertido para non-blocking em {len(changed)} arquivo(s):")
    for f in changed:
        print(f"  ✓ {f}")
else:
    print("Nenhum arquivo com footer.css encontrado ou já convertido.")
PYEOF
