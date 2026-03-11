#!/usr/bin/env python3
"""
Aplica as 3 mudancas do gate need-based routing no index.html
Uso: python3 apply_gate_patch.py public/index.html
"""
import sys

def apply_patch(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # ── PATCH 1: CSS cor do icone international (verde → navy) ──────────────
    old1 = '.gate-option[data-audience="international"] .gate-icon{background:linear-gradient(135deg,#10B981,#059669);box-shadow:0 4px 12px rgba(16,185,129,0.25)}'
    new1 = '.gate-option[data-audience="international"] .gate-icon{background:linear-gradient(135deg,#2D5F8A,#1B3A5C);box-shadow:0 4px 12px rgba(45,95,138,0.25)}'

    if old1 not in content:
        print("ERRO patch 1: string nao encontrada")
        return False
    content = content.replace(old1, new1, 1)
    print("OK  patch 1: cor do icone international atualizada (verde → navy)")

    # ── PATCH 2: CSS gate-options delay (0.45s → 0.35s, sub foi removida) ───
    old2 = '.gate-options{display:flex;flex-direction:column;gap:10px;opacity:0;animation:gateFade 0.4s ease 0.45s both}'
    new2 = '.gate-options{display:flex;flex-direction:column;gap:10px;opacity:0;animation:gateFade 0.4s ease 0.35s both}'

    if old2 not in content:
        print("ERRO patch 2: string nao encontrada")
        return False
    content = content.replace(old2, new2, 1)
    print("OK  patch 2: delay da animacao gate-options ajustado (0.45s → 0.35s)")

    # ── PATCH 3: HTML bloco gate (3 opcoes identidade → 2 opcoes necessidade) ─
    old3 = """        <h2 class="gate-question">Let's grow!</h2>
        <p class="gate-sub">Selecione seu perfil para uma experiência personalizada</p>
        <div class="gate-options">
            <button class="gate-option" data-audience="founder" onclick="selectAudience('founder')">
                <div class="gate-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21L3 14L8 9L13 12L21 3"/><path d="M17 3H21V7"/></svg>
                </div>
                <div class="gate-text">
                    <div class="gate-label">Founder / CEO</div>
                    <div class="gate-desc">Preciso estruturar minha operação de receita</div>
                </div>
                <div class="gate-arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
            </button>
            <button class="gate-option" data-audience="investor" onclick="selectAudience('investor')">
                <div class="gate-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M12 11v4"/><path d="M10 13h4"/></svg>
                </div>
                <div class="gate-text">
                    <div class="gate-label">Investidor / VC</div>
                    <div class="gate-desc">Quero destravar o crescimento das minhas investidas</div>
                </div>
                <div class="gate-arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
            </button>
            <button class="gate-option" data-audience="international" onclick="selectAudience('international')">
                <div class="gate-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div class="gate-text">
                    <div class="gate-label">International Company</div>
                    <div class="gate-desc">Expanding B2B tech into Latin America</div>
                </div>
                <div class="gate-arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
            </button>
        </div>
        <button class="gate-skip" onclick="selectAudience('founder', 'skip')" aria-label="Pular seleção">Pular e ver como Founder →</button>"""

    new3 = """        <h2 class="gate-question">What brings you here?</h2>
        <div class="gate-options">
            <button class="gate-option" data-audience="founder" onclick="selectAudience('founder')">
                <div class="gate-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21L3 14L8 9L13 12L21 3"/><path d="M17 3H21V7"/></svg>
                </div>
                <div class="gate-text">
                    <div class="gate-label">Minha empresa B2B precisa crescer</div>
                    <div class="gate-desc">Estruturar operação de receita no Brasil ou LatAm</div>
                </div>
                <div class="gate-arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
            </button>
            <button class="gate-option" data-audience="international" onclick="selectAudience('international')">
                <div class="gate-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div class="gate-text">
                    <div class="gate-label">My company wants to enter Latin America</div>
                    <div class="gate-desc">Expanding B2B tech into Brazil and LatAm</div>
                </div>
                <div class="gate-arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
            </button>
        </div>
        <button class="gate-skip" onclick="selectAudience('investor')" aria-label="Sou investidor ou VC">Sou investidor / VC →</button>"""

    if old3 not in content:
        print("ERRO patch 3: bloco HTML do gate nao encontrado")
        return False
    content = content.replace(old3, new3, 1)
    print("OK  patch 3: bloco HTML do gate substituido (3 opcoes → 2 + link investor)")

    if content == original:
        print("\nERRO: nenhuma mudanca foi aplicada")
        return False

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\nSucesso! {filepath} atualizado com 3 patches.")
    print("Verifique visualmente em: http://localhost:8000")
    print("\nCommit sugerido:")
    print('  git add public/index.html')
    print('  git commit -m "UX: need-based gate routing (2 options + investor link) — rec #4"')
    print('  git push')
    return True

if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'public/index.html'
    ok = apply_patch(path)
    sys.exit(0 if ok else 1)
