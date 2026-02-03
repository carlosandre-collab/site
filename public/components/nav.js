/* ============================================
   Alavanka — Unified Navigation Component
   
   USAGE: Add to any page:
   <script src="[path]/components/nav.js"></script>
   
   Auto-detects page depth to fix relative paths.
   Replaces inline <nav> with unified version.
   
   UPDATED: 2026-02-03
   - Logo SVG com viewBox otimizado (sem espaço vazio)
   - Cores: Alavanka #1B3A5C | Último "a" #3D7AB5 | Tagline #6d6e71
   ============================================ */

(function () {
    'use strict';

    // ── Detect page depth based on nav.js script location ──
    var scripts = document.getElementsByTagName('script');
    var basePath = '';
    
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src || '';
        if (src.indexOf('components/nav.js') !== -1) {
            var scriptTag = scripts[i].getAttribute('src');
            if (scriptTag.indexOf('../../') === 0) {
                basePath = '../../';
            } else if (scriptTag.indexOf('../') === 0) {
                basePath = '../';
            } else {
                basePath = '';
            }
            break;
        }
    }

    // ── Determine current page for "active" link highlighting ──
    var currentPath = window.location.pathname;
    var isIndex = currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('.com.br');
    var isBlog = currentPath.endsWith('/blog.html');
    var isBlogPost = currentPath.indexOf('/blog/posts/') !== -1 || currentPath.indexOf('/blog/') !== -1;
    var isGuia = currentPath.indexOf('guia-fractional-cro-brasil') !== -1;
    var isAssessment = currentPath.indexOf('assessment') !== -1;
    var isPrecificacao = currentPath.indexOf('guia-precificacao') !== -1;
    var isInvestidores = currentPath.indexOf('investidores') !== -1;

    // ── Build URLs ──
    var indexUrl = basePath ? basePath + 'index.html' : 'index.html';
    var blogUrl = basePath ? basePath + 'blog.html' : 'blog.html';
    var guiaUrl = basePath ? basePath + 'guia-fractional-cro-brasil.html' : 'guia-fractional-cro-brasil.html';
    var investidoresUrl = basePath ? basePath + 'investidores.html' : 'investidores.html';
    
    // Section links helper
    var sectionLink = function (hash) {
        if (isIndex) return '#' + hash;
        return indexUrl + '#' + hash;
    };
    
    // Investor section links
    var invSectionLink = function (hash) {
        if (isInvestidores) return '#' + hash;
        return investidoresUrl + '#' + hash;
    };

    // Active class helpers
    var blogActive = (isBlog || isBlogPost || isPrecificacao) ? ' active' : '';
    var guiaActive = isGuia ? ' active' : '';
    var founderActive = (isIndex || isGuia) ? ' active' : '';
    var investidoresActive = isInvestidores ? ' active' : '';

    // ── Logo SVG OTIMIZADO - viewBox ajustado, sem espaço vazio ──
    // ViewBox original: 0 0 432.57 198 (muito espaço)
    // ViewBox otimizado: 107 63 210 95 (só o conteúdo: logo + tagline)
    var logoSvg = "<svg class='nav-logo-svg' aria-label='Alavanka - Sustainable Growth' viewBox='107 63 210 95' xmlns='http://www.w3.org/2000/svg'>"
        // Letra "a" (primeira)
        + "<path transform='matrix(1 0 0 -1 121.78 124.01)' d='m0 0c-1.971 0-3.038-0.99-3.038-2.515 0-1.444 0.989-2.507 3.498-2.507 3.426 0 5.933 1.826 5.933 3.952v1.07zm1.597 9.882c-2.734 0-4.71-1.064-6.233-2.809l-4.639 4.26c2.894 3.268 6.698 4.942 11.333 4.942 7.38 0 11.942-3.801 11.942-11.489v-15.214h-7.607v2.361c-1.748-2.058-4.255-3.037-7.3-3.037-5.247 0-9.661 2.58-9.661 8.669 0 5.101 4.49 7.607 10.195 7.607h6.766c-0.073 3.5-2.05 4.71-4.796 4.71' fill='#1B3A5C'/>"
        // Letra "l"
        + "<path transform='matrix(1,0,0,-1,0,198)' d='m149.41 120.71h-7.605v-57.145h7.605z' fill='#1B3A5C'/>"
        // Letra "a" (segunda)
        + "<path transform='matrix(1 0 0 -1 164.7 124.01)' d='m0 0c-1.98 0-3.042-0.99-3.042-2.515 0-1.444 0.994-2.507 3.502-2.507 3.42 0 5.93 1.826 5.93 3.952v1.07zm1.599 9.882c-2.74 0-4.716-1.064-6.238-2.809l-4.641 4.26c2.889 3.268 6.692 4.942 11.338 4.942 7.37 0 11.937-3.801 11.937-11.489v-15.214h-7.605v2.361c-1.744-2.058-4.264-3.037-7.301-3.037-5.242 0-9.661 2.58-9.661 8.669 0 5.101 4.485 7.607 10.19 7.607h6.772c-0.073 3.5-2.047 4.71-4.791 4.71' fill='#1B3A5C'/>"
        // Letra "v"
        + "<path transform='matrix(1 0 0 -1 180.85 108.41)' d='M0 0H8.516L14.753-12.625 20.762 0H28.371L14.448-26.696H14.144Z' fill='#1B3A5C'/>"
        // Letra "a" (terceira)
        + "<path transform='matrix(1 0 0 -1 220.95 124.01)' d='m0 0c-1.98 0-3.045-0.99-3.045-2.515 0-1.444 0.993-2.507 3.504-2.507 3.419 0 5.93 1.826 5.93 3.952v1.07zm1.598 9.882c-2.741 0-4.715-1.064-6.24-2.809l-4.641 4.26c2.892 3.268 6.693 4.942 11.339 4.942 7.372 0 11.937-3.801 11.937-11.489v-15.214h-7.604v2.361c-1.744-2.058-4.262-3.037-7.302-3.037-5.243 0-9.662 2.58-9.662 8.669 0 5.101 4.486 7.607 10.191 7.607h6.773c-0.076 3.5-2.048 4.71-4.791 4.71' fill='#1B3A5C'/>"
        // Letra "n"
        + "<path transform='matrix(1 0 0 -1 240.82 108.41)' d='m0 0h7.606v-3.349c1.667 2.809 4.482 4.032 8.13 4.032 5.785 0 9.817-4.032 9.817-10.956v-15.747h-7.611v15.213c0 2.892-1.517 4.646-4.636 4.646-3.653 0-5.7-1.984-5.7-5.86v-13.999h-7.606z' fill='#1B3A5C'/>"
        // Letra "k"
        + "<path transform='matrix(1 0 0 -1 279.61 134.44)' d='M0 0H-7.602V57.145H0V15.9L8.527 26.02H17.346L8.068 15.367 18.409 0H9.36L2.973 9.594 0 6.243Z' fill='#1B3A5C'/>"
        // Letra "a" (última - azul claro)
        + "<path transform='matrix(1 0 0 -1 307.41 97.822)' d='m0 0c-1.98 0-3.043-0.986-3.043-2.508 0-1.441 0.987-2.51 3.497-2.51 3.424 0 5.935 1.822 5.935 3.949v1.069zm1.597 9.889c-2.74 0-4.716-1.064-6.238-2.813l-4.641 4.257c2.889 3.269 6.692 4.943 11.334 4.943 7.376 0 11.942-3.799 11.942-11.483v-15.211h-7.605v2.352c-1.743-2.047-4.262-3.037-7.302-3.037-5.246 0-9.661 2.586-9.661 8.672 0 5.097 4.486 7.606 10.19 7.606h6.773c-0.08 3.498-2.048 4.714-4.792 4.714' fill='#3D7AB5'/>"
        // Tagline "SUSTAINABLE GROWTH"
        + "<path transform='matrix(1 0 0 -1 120.72 152)' d='M0 0C.08 .095 .159 .206 .238 .301 .396 .507 .57 .634 .792 .443 .903 .349 2.06-.761 3.469-.761 4.752-.761 5.592 .048 5.592 .982 5.592 2.075 4.642 2.725 2.819 3.484 1.077 4.245 .032 4.957 .032 6.763 .032 7.84 .888 9.582 3.405 9.582 4.958 9.582 6.114 8.774 6.114 8.774 6.209 8.727 6.399 8.537 6.209 8.236 6.146 8.141 6.082 8.03 6.02 7.936 5.877 7.713 5.718 7.65 5.465 7.793 5.354 7.855 4.356 8.521 3.39 8.521 1.711 8.521 1.204 7.444 1.204 6.779 1.204 5.718 2.012 5.1 3.343 4.546 5.48 3.675 6.858 2.867 6.858 1.029 6.858-.618 5.291-1.821 3.438-1.821 1.568-1.821 .302-.729 .096-.538-.031-.428-.189-.301 0 0' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 129.58 142.88)' d='M0 0C0 .158 .143 .301 .302 .301H.903C1.077 .301 1.204 .158 1.204 0V-6.604C1.204-8.41 2.329-9.82 4.182-9.82 6.051-9.82 7.191-8.442 7.191-6.637V0C7.191 .158 7.317 .301 7.492 .301H8.094C8.252 .301 8.395 .158 8.395 0V-6.7C8.395-9.107 6.685-10.944 4.182-10.944 1.695-10.944 0-9.107 0-6.7Z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 140.19 152)' d='M0 0C.08 .095 .159 .206 .238 .301 .396 .507 .57 .634 .792 .443 .903 .349 2.06-.761 3.469-.761 4.752-.761 5.592 .048 5.592 .982 5.592 2.075 4.642 2.725 2.819 3.484 1.077 4.245 .032 4.957 .032 6.763 .032 7.84 .888 9.582 3.405 9.582 4.958 9.582 6.114 8.774 6.114 8.774 6.209 8.727 6.399 8.537 6.209 8.236 6.146 8.141 6.082 8.03 6.02 7.936 5.877 7.713 5.718 7.65 5.465 7.793 5.354 7.855 4.356 8.521 3.39 8.521 1.711 8.521 1.204 7.444 1.204 6.779 1.204 5.718 2.012 5.1 3.343 4.546 5.48 3.675 6.858 2.867 6.858 1.029 6.858-.618 5.291-1.821 3.438-1.821 1.568-1.821 .302-.729 .096-.538-.031-.428-.189-.301 0 0' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 149.05 143.64)' d='M0 0V-9.725C0-9.883-.143-10.025-.301-10.025H-.903C-1.077-10.025-1.204-9.883-1.204-9.725V0H-3.96C-4.134 0-4.261 .143-4.261 .302V.761C-4.261 .919-4.134 1.062-3.96 1.062H2.756C2.93 1.062 3.057 .919 3.057 .761V.302C3.057 .143 2.93 0 2.756 0Z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 157.69 147.3)' d='M0 0 1.077-3.438H-1.077ZM-.476 4.039H.476C.618 4.039 .729 3.96 .776 3.833L3.819-6.398C3.882-6.588 3.755-6.731 3.565-6.731H2.978C2.835-6.731 2.724-6.652 2.677-6.525L2.012-4.371H-2.012L-2.677-6.525C-2.724-6.652-2.835-6.731-2.978-6.731H-3.565C-3.755-6.731-3.882-6.588-3.819-6.398L-.776 3.833C-.729 3.96-.618 4.039-.476 4.039' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 163.46 142.88)' d='M0 0C0 .158 .143 .301 .301 .301H.919C1.093 .301 1.22 .158 1.22 0V-10.485C1.22-10.644 1.093-10.786 .919-10.786H.301C.143-10.786 0-10.644 0-10.485Z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 167.18 142.88)' d='M0 0C0 .158 .127 .301 .301 .301H.808C.951 .301 1.045 .238 1.124 .111L5.607-6.414H5.654V0C5.654 .158 5.781 .301 5.955 .301H6.541C6.715 .301 6.858 .158 6.858 0V-10.485C6.858-10.644 6.715-10.786 6.556-10.786H6.066C5.923-10.786 5.829-10.723 5.75-10.596L1.251-4.055H1.204V-10.485C1.204-10.644 1.077-10.786 .903-10.786H.301C.127-10.786 0-10.644 0-10.485Z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 178.72 147.3)' d='M0 0 1.077-3.438H-1.077ZM-.476 4.039H.476C.618 4.039 .729 3.96 .776 3.833L3.819-6.398C3.882-6.588 3.755-6.731 3.565-6.731H2.978C2.835-6.731 2.724-6.652 2.677-6.525L2.012-4.371H-2.012L-2.677-6.525C-2.724-6.652-2.835-6.731-2.978-6.731H-3.565C-3.755-6.731-3.882-6.588-3.819-6.398L-.776 3.833C-.729 3.96-.618 4.039-.476 4.039' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 184.49 142.88)' d='M0 0C0 .158 .143 .301 .301 .301H2.884C4.991 .301 6.399-1.045 6.399-3.057 6.399-4.577 5.544-5.845 4.245-6.335L6.446-10.358C6.573-10.58 6.414-10.786 6.177-10.786H5.433C5.306-10.786 5.212-10.707 5.149-10.596L3.025-6.667H1.22V-10.485C1.22-10.644 1.093-10.786 .919-10.786H.301C.143-10.786 0-10.644 0-10.485ZM1.22-.682V-5.702H2.835C4.245-5.702 5.164-4.657 5.164-3.184 5.164-1.711 4.245-.682 2.835-.682Z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 193.04 142.88)' d='M0 0C0 .158 .143 .301 .301 .301H.919C1.093 .301 1.22 .158 1.22 0V-4.039L5.607-4.039C5.765-4.039 5.908-4.182 5.908-4.34V-4.832C5.908-4.99 5.765-5.133 5.607-5.133H1.22V-9.725H6.066C6.224-9.725 6.383-9.868 6.383-10.025V-10.485C6.383-10.644 6.224-10.786 6.066-10.786H.301C.143-10.786 0-10.644 0-10.485Z' fill='#6d6e71'/>"
        // Resto do tagline (GROWTH)
        + "<path transform='matrix(1 0 0 -1 212.99 148.01)' d='M0 0C-2.79 0-4.991-2.107-4.991-5.086 0-8.046 2.201-10.154 4.991-10.154 2.79-10.154 4.99-8.046 4.99-5.086 4.99-2.107 2.79 0 0 0M0 1.156C3.469 1.156 6.177-1.49 6.177-5.086 6.177-8.681 3.469-11.311 0-11.311-3.469-11.311-6.178-8.681-6.178-5.086-6.178-1.49-3.469 1.156 0 1.156' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 233.52 142.88)' d='M0 0C0 .158 .127 .301 .301 .301H.808C.951 .301 1.045 .238 1.124 .111L5.607-6.414H5.654V0C5.654 .158 5.781 .301 5.955 .301H6.541C6.715 .301 6.858 .158 6.858 0V-10.485C6.858-10.644 6.715-10.786 6.556-10.786H6.066C5.923-10.786 5.829-10.723 5.75-10.596L1.251-4.055H1.204V-10.485C1.204-10.644 1.077-10.786 .903-10.786H.301C.127-10.786 0-10.644 0-10.485Z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 249.64 152.72)' d='m0 0c2.518 0 4.593 2.06 4.593 4.577 0 2.519-2.075 4.61-4.593 4.61-2.519 0-4.578-2.091-4.578-4.61 0-2.517 2.059-4.577 4.578-4.577m0 10.295c3.167 0 5.701-2.55 5.701-5.718 0-3.167-2.534-5.685-5.701-5.685-3.168 0-5.687 2.518-5.687 5.685 0 3.168 2.519 5.718 5.687 5.718' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 256.52 142.96)' d='m0 0c-0.063 0.222 0.063 0.38 0.285 0.38h0.665c0.127 0 0.254-0.11 0.285-0.222l2.203-8.204h0.062l2.646 8.41c0.031 0.095 0.126 0.174 0.269 0.174h0.285c0.126 0 0.237-0.079 0.269-0.174l2.693-8.41h0.063l2.154 8.204c0.032 0.112 0.158 0.222 0.285 0.222h0.665c0.222 0 0.349-0.158 0.285-0.38l-2.993-10.644c-0.032-0.127-0.158-0.221-0.285-0.221h-0.254c-0.11 0-0.222 0.079-0.269 0.174l-2.74 8.569h-0.079l-2.692-8.569c-0.048-0.095-0.159-0.174-0.27-0.174h-0.254c-0.126 0-0.253 0.094-0.285 0.221z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 273.24 143.64)' d='M0 0H-2.756C-2.93 0-3.057 .143-3.057 .302V.761C-3.057 .919-2.93 1.062-2.756 1.062H3.96C4.134 1.062 4.261 .919 4.261 .761V.302C4.261 .143 4.134 0 3.96 0H1.204V-9.725C1.204-9.883 1.062-10.025 .902-10.025H.301C.143-10.025 0-9.883 0-9.725Z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 279.08 142.88)' d='M0 0C0 .158 .143 .301 .301 .301H.919C1.093 .301 1.22 .158 1.22 0V-4.625H7.65V0C7.65 .158 7.777 .301 7.951 .301H8.569C8.728 .301 8.87 .158 8.87 0V-10.485C8.87-10.644 8.728-10.786 8.569-10.786H7.951C7.777-10.786 7.65-10.644 7.65-10.485V-5.687H1.22V-10.485C1.22-10.644 1.093-10.786 .919-10.786H.301C.143-10.786 0-10.644 0-10.485Z' fill='#6d6e71'/>"
        + "</svg>";

    // ── Chevron SVG ──
    var chevronSvg = '<svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';

    // ── Build navigation HTML with dropdowns ──
    var navHTML = ''
        + '<nav role="navigation" aria-label="Navegação principal">'
        + '  <a href="' + (isIndex ? '#' : indexUrl) + '" class="logo" aria-label="Alavanka - Home">'
        + '    ' + logoSvg
        + '  </a>'
        + '  <button class="lang-toggle-mobile" id="langToggleMobile" onclick="alavankaNav.toggleLang()">EN</button>'
        + '  <button class="hamburger" id="hamburger" onclick="alavankaNav.toggleMenu()" aria-label="Menu" aria-expanded="false">'
        + '    <span></span><span></span><span></span>'
        + '  </button>'
        + '  <div class="nav-links" id="navLinks">'
        
        // Home icon
        + '    <a href="' + (isIndex ? '#' : indexUrl) + '" class="nav-home" title="Home"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></a>'
        
        // ── Founders Dropdown ──
        + '    <div class="nav-dropdown' + founderActive + '">'
        + '      <button class="nav-dropdown-trigger" data-i18n="nav.founders">Founders ' + chevronSvg + '</button>'
        + '      <div class="nav-dropdown-menu">'
        + '        <a href="' + sectionLink('problema') + '" data-i18n="nav.problem">O Problema</a>'
        + '        <a href="' + sectionLink('solucao') + '" data-i18n="nav.solution">A Solução</a>'
        + '        <a href="' + sectionLink('porque') + '" data-i18n="nav.why">Por Que Nós</a>'
        + '        <a href="' + sectionLink('processo') + '" data-i18n="nav.process">Como Funciona</a>'
        + '        <a href="' + sectionLink('faq') + '" data-i18n="nav.faq">FAQ</a>'
        + '      </div>'
        + '    </div>'
        
        // ── Investors Dropdown ──
        + '    <div class="nav-dropdown' + investidoresActive + '">'
        + '      <button class="nav-dropdown-trigger" data-i18n="nav.investors">Para Fundos ' + chevronSvg + '</button>'
        + '      <div class="nav-dropdown-menu">'
        + '        <a href="' + investidoresUrl + '" data-i18n="nav.investors.overview">Visão Geral</a>'
        + '        <a href="' + investidoresUrl + '#inv-faq" data-i18n="nav.investors.faq">FAQ</a>'
        + '        <a href="' + investidoresUrl + '#inv-cta" data-i18n="nav.investors.contact">Agendar Conversa</a>'
        + '      </div>'
        + '    </div>'
        
        // Playbook (standalone)
        + '    <a href="' + guiaUrl + '" data-i18n="nav.playbook" class="' + guiaActive + '">Playbook</a>'
        
        // Blog (standalone)
        + '    <a href="' + blogUrl + '" data-i18n="nav.blog" class="' + blogActive + '">Blog</a>'
        
        // Contact
        + '    <a href="' + sectionLink('contato') + '" data-i18n="nav.contact">Contato</a>'
        
        // Language toggle
        + '    <button class="lang-toggle" id="langToggle" onclick="alavankaNav.toggleLang()">EN</button>'
        + '  </div>'
        + '</nav>';

    // ── Inject nav ──
    var existingNav = document.querySelector('nav');
    if (existingNav) {
        existingNav.outerHTML = navHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    // ── Nav Behavior ──
    window.alavankaNav = {
        toggleMenu: function () {
            var hamburger = document.getElementById('hamburger');
            var navLinks = document.getElementById('navLinks');
            if (hamburger && navLinks) {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                hamburger.setAttribute('aria-expanded',
                    hamburger.classList.contains('active') ? 'true' : 'false');
                document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            }
        },
        toggleLang: function () {
            // Delegate to page-specific toggleLang if exists
            if (typeof window.toggleLang === 'function') {
                window.toggleLang();
            } else {
                // Default: just flip the button text
                var btn = document.getElementById('langToggle');
                var btnMobile = document.getElementById('langToggleMobile');
                var current = (btn && btn.textContent === 'EN') ? 'PT' : 'EN';
                if (btn) btn.textContent = current;
                if (btnMobile) btnMobile.textContent = current;
            }
        }
    };

    // ── Dropdown behavior (click for mobile, hover handled by CSS on desktop) ──
    document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            // On mobile, toggle dropdown open state
            if (window.innerWidth < 1024) {
                e.preventDefault();
                var dropdown = trigger.closest('.nav-dropdown');
                dropdown.classList.toggle('open');
            }
        });
    });

    // ── Close menu on link click (mobile) ──
    document.querySelectorAll('.nav-dropdown-menu a').forEach(function (link) {
        link.addEventListener('click', function () {
            var hamburger = document.getElementById('hamburger');
            var navLinks = document.getElementById('navLinks');
            if (hamburger && navLinks && window.innerWidth < 1024) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    });

    // ── Close mobile menu on Escape key ──
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var hamburger = document.getElementById('hamburger');
            var navLinks = document.getElementById('navLinks');
            if (hamburger && navLinks) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }
    });

})();
