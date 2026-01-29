#!/bin/bash
# Script para converter imagens PNG para WebP
# Execute na pasta public/assets/images/brand/

# Requer: cwebp (instalar com: brew install webp ou apt install webp)

cd public/assets/images/brand/

# Converter cada imagem com qualidade 80 (bom balanço tamanho/qualidade)
for img in logo-preto.png oracle.png att.png informatica.png; do
    if [ -f "$img" ]; then
        output="${img%.png}.webp"
        cwebp -q 80 "$img" -o "$output"
        echo "Converted: $img -> $output"
        echo "  Original: $(ls -lh $img | awk '{print $5}')"
        echo "  WebP:     $(ls -lh $output | awk '{print $5}')"
    fi
done

echo ""
echo "Done! WebP versions created alongside PNG files."
echo "The HTML already has <picture> tags for fallback."
