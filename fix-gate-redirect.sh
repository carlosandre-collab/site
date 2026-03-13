#!/bin/bash
# Fix: redireciona imediatamente para market-entry/investidores, sem esperar animação do gate
# Uso: bash fix-gate-redirect.sh index.html

FILE="${1:-index.html}"

python3 - "$FILE" << 'PYEOF'
import sys

path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

OLD = """    if (gate) {
        gate.classList.add('closing');
        setTimeout(function() {
            gate.remove();
            document.body.style.overflow = '';
            setAudience(audience, true);
        }, 500);
    } else {
        setAudience(audience);
    }"""

NEW = """    if (audience === 'investor') { window.location.href = 'investidores.html'; return; }
    if (audience === 'international') { window.location.href = 'market-entry.html'; return; }
    if (gate) {
        gate.classList.add('closing');
        setTimeout(function() {
            gate.remove();
            document.body.style.overflow = '';
            setAudience(audience, true);
        }, 500);
    } else {
        setAudience(audience);
    }"""

assert OLD in content, "ERRO: bloco não encontrado — verifique se o arquivo é o correto"
result = content.replace(OLD, NEW, 1)
with open(path, 'w', encoding='utf-8') as f:
    f.write(result)
print("OK: fix aplicado em", path)
PYEOF
