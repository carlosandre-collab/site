/* ============================================
   Alavanka — Unified Navigation Component
   
   USAGE: Add to any page:
   <script src="[path]/components/nav.js"></script>
   
   Auto-detects page depth to fix relative paths.
   Replaces inline <nav> with unified version.
   
   UPDATED: 
   - Logo SVG PRETO completo (alavanka + sustainable growth)
   - Último "a" em #666666 (mais saliente)
   - Extraído do PDF da marca
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

    // ── Logo SVG PRETO completo (extraído do PDF da marca) ──
    // Alavanka: #000000 | Último "a": #666666 | Tagline: #6d6e71
    var logoSvg = "<svg class='nav-logo-svg' aria-label='Alavanka - Sustainable Growth' version='1.1' viewBox='0 0 432.57 198' xmlns='http://www.w3.org/2000/svg'><defs><clipPath id='a'><path transform='matrix(1,0,0,-1,0,198)' d='M0 198H432.567V0H0Z'/></clipPath></defs><g clip-path='url(#a)'><path transform='matrix(1 0 0 -1 121.78 124.01)' d='m0 0c-1.971 0-3.038-0.99-3.038-2.515 0-1.444 0.989-2.507 3.498-2.507 3.426 0 5.933 1.826 5.933 3.952v1.07zm1.597 9.882c-2.734 0-4.71-1.064-6.233-2.809l-4.639 4.26c2.894 3.268 6.698 4.942 11.333 4.942 7.38 0 11.942-3.801 11.942-11.489v-15.214h-7.607v2.361c-1.748-2.058-4.255-3.037-7.3-3.037-5.247 0-9.661 2.58-9.661 8.669 0 5.101 4.49 7.607 10.195 7.607h6.766c-0.073 3.5-2.05 4.71-4.796 4.71' fill='#000000'/><path transform='matrix(1,0,0,-1,0,198)' d='m149.41 120.71h-7.605v-57.145h7.605z' fill='#000000'/><path transform='matrix(1 0 0 -1 164.7 124.01)' d='m0 0c-1.98 0-3.042-0.99-3.042-2.515 0-1.444 0.994-2.507 3.502-2.507 3.42 0 5.93 1.826 5.93 3.952v1.07zm1.599 9.882c-2.74 0-4.716-1.064-6.238-2.809l-4.641 4.26c2.889 3.268 6.692 4.942 11.338 4.942 7.37 0 11.937-3.801 11.937-11.489v-15.214h-7.605v2.361c-1.744-2.058-4.264-3.037-7.301-3.037-5.242 0-9.661 2.58-9.661 8.669 0 5.101 4.485 7.607 10.19 7.607h6.772c-0.073 3.5-2.047 4.71-4.791 4.71' fill='#000000'/><path transform='matrix(1 0 0 -1 180.85 108.41)' d='M0 0H8.516L14.753-12.625 20.762 0H28.371L14.448-26.696H14.144Z' fill='#000000'/><path transform='matrix(1 0 0 -1 220.95 124.01)' d='m0 0c-1.98 0-3.045-0.99-3.045-2.515 0-1.444 0.993-2.507 3.504-2.507 3.419 0 5.93 1.826 5.93 3.952v1.07zm1.598 9.882c-2.741 0-4.715-1.064-6.24-2.809l-4.641 4.26c2.892 3.268 6.693 4.942 11.339 4.942 7.372 0 11.937-3.801 11.937-11.489v-15.214h-7.604v2.361c-1.744-2.058-4.262-3.037-7.302-3.037-5.243 0-9.662 2.58-9.662 8.669 0 5.101 4.486 7.607 10.191 7.607h6.773c-0.076 3.5-2.048 4.71-4.791 4.71' fill='#000000'/><path transform='matrix(1 0 0 -1 240.82 108.41)' d='m0 0h7.606v-3.349c1.667 2.809 4.482 4.032 8.13 4.032 5.785 0 9.817-4.032 9.817-10.956v-15.747h-7.611v15.213c0 2.892-1.517 4.646-4.636 4.646-3.653 0-5.7-1.984-5.7-5.86v-13.999h-7.606z' fill='#000000'/><path transform='matrix(1 0 0 -1 279.61 134.44)' d='M0 0H-7.602V57.145H0V15.9L8.527 26.02H17.346L8.068 15.367 18.409 0H9.36L2.973 9.594 0 6.243Z' fill='#000000'/><path transform='matrix(1 0 0 -1 307.41 97.822)' d='m0 0c-1.98 0-3.043-0.986-3.043-2.508 0-1.441 0.987-2.51 3.497-2.51 3.424 0 5.935 1.822 5.935 3.949v1.069zm1.597 9.889c-2.74 0-4.716-1.064-6.238-2.813l-4.641 4.257c2.889 3.269 6.692 4.943 11.334 4.943 7.376 0 11.942-3.799 11.942-11.483v-15.211h-7.605v2.352c-1.743-2.047-4.262-3.037-7.302-3.037-5.246 0-9.661 2.586-9.661 8.672 0 5.097 4.486 7.606 10.19 7.606h6.773c-0.08 3.498-2.048 4.714-4.792 4.714' fill='#666666'/><path transform='matrix(1 0 0 -1 120.72 152)' d='M0 0C.08 .095 .159 .206 .238 .301 .396 .507 .57 .634 .792 .443 .903 .349 2.06-.761 3.469-.761 4.752-.761 5.592 .048 5.592 .982 5.592 2.075 4.642 2.725 2.819 3.484 1.077 4.245 .032 4.957 .032 6.763 .032 7.84 .888 9.582 3.405 9.582 4.958 9.582 6.114 8.774 6.114 8.774 6.209 8.727 6.399 8.537 6.209 8.236 6.146 8.141 6.082 8.03 6.02 7.936 5.877 7.713 5.718 7.65 5.465 7.793 5.354 7.855 4.356 8.521 3.39 8.521 1.711 8.521 1.204 7.444 1.204 6.779 1.204 5.718 2.012 5.1 3.343 4.546 5.48 3.675 6.858 2.867 6.858 1.029 6.858-.618 5.291-1.821 3.438-1.821 1.568-1.821 .302-.729 .096-.538-.031-.428-.189-.301 0 0' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 129.58 142.88)' d='M0 0C0 .158 .143 .301 .302 .301H.903C1.077 .301 1.204 .158 1.204 0V-6.604C1.204-8.41 2.329-9.82 4.182-9.82 6.051-9.82 7.191-8.442 7.191-6.637V0C7.191 .158 7.317 .301 7.492 .301H8.094C8.252 .301 8.395 .158 8.395 0V-6.7C8.395-9.107 6.685-10.944 4.182-10.944 1.695-10.944 0-9.107 0-6.7Z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 140.19 152)' d='M0 0C.08 .095 .159 .206 .238 .301 .396 .507 .57 .634 .792 .443 .903 .349 2.06-.761 3.469-.761 4.752-.761 5.592 .048 5.592 .982 5.592 2.075 4.642 2.725 2.819 3.484 1.077 4.245 .032 4.957 .032 6.763 .032 7.84 .888 9.582 3.406 9.582 4.958 9.582 6.114 8.774 6.114 8.774 6.209 8.727 6.399 8.537 6.209 8.236 6.146 8.141 6.082 8.03 6.02 7.936 5.877 7.713 5.718 7.65 5.465 7.793 5.354 7.855 4.356 8.521 3.39 8.521 1.711 8.521 1.204 7.444 1.204 6.779 1.204 5.718 2.012 5.1 3.343 4.546 5.48 3.675 6.858 2.867 6.858 1.029 6.858-.618 5.291-1.821 3.438-1.821 1.568-1.821 .302-.729 .096-.538-.031-.428-.189-.301 0 0' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 150.75 143.64)' d='M0 0H-2.756C-2.93 0-3.057 .143-3.057 .302V.761C-3.057 .919-2.93 1.062-2.756 1.062H3.96C4.134 1.062 4.261 .919 4.261 .761V.302C4.261 .143 4.134 0 3.96 0H1.204V-9.725C1.204-9.883 1.062-10.025 .902-10.025H.301C.143-10.025 0-9.883 0-9.725Z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 162 149.9)' d='M0 0C-.776 1.727-1.536 3.469-2.313 5.195H-2.438L-4.751 0ZM-7.523-3.357-2.708 7.302C-2.661 7.396-2.581 7.476-2.438 7.476H-2.28C-2.138 7.476-2.059 7.396-2.012 7.302L2.772-3.357C2.867-3.563 2.74-3.77 2.503-3.77H1.869C1.727-3.77 1.632-3.675 1.6-3.596L.428-.981H-5.195L-6.351-3.596C-6.383-3.675-6.478-3.77-6.62-3.77H-7.254C-7.491-3.77-7.618-3.563-7.523-3.357' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 166.34 142.88)' d='M0 0C0 .158 .143 .301 .301 .301H.935C1.093 .301 1.235 .158 1.235 0V-10.485C1.235-10.644 1.093-10.786 .935-10.786H.301C.143-10.786 0-10.644 0-10.485Z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 170.64 142.71)' d='m0 0c0 0.159 0.143 0.285 0.301 0.285h0.396l7.144-8.901h0.031v8.442c0 0.158 0.127 0.301 0.301 0.301h0.555c0.158 0 0.3-0.143 0.3-0.301v-10.659c0-0.158-0.142-0.285-0.3-0.285h-0.286l-7.269 9.075h-0.017v-8.616c0-0.158-0.126-0.301-0.301-0.301h-0.554c-0.158 0-0.301 0.143-0.301 0.301z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 188.75 149.9)' d='M0 0C-.775 1.727-1.536 3.469-2.313 5.195H-2.438L-4.751 0ZM-7.523-3.357-2.708 7.302C-2.661 7.396-2.581 7.476-2.438 7.476H-2.28C-2.138 7.476-2.059 7.396-2.012 7.302L2.771-3.357C2.867-3.563 2.74-3.77 2.503-3.77H1.869C1.727-3.77 1.632-3.675 1.6-3.596L.428-.981H-5.195L-6.352-3.596C-6.383-3.675-6.478-3.77-6.62-3.77H-7.254C-7.491-3.77-7.618-3.563-7.523-3.357' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 196.85 147.55)' d='m0 0c1.22 0 1.901 0.871 1.901 1.98 0 1.141-0.681 1.901-1.901 1.901h-2.581v-3.881zm0.27-5.052c1.156 0 1.996 0.871 1.996 2.011 0 1.125-1.031 1.948-2.266 1.948h-2.613v-3.959zm-4.04 9.725c0 0.158 0.127 0.301 0.301 0.301h3.469c1.933 0 3.247-1.251 3.247-2.914 0-1.22-0.808-2.107-1.552-2.535 0.839-0.348 1.901-1.125 1.901-2.582 0-1.773-1.409-3.056-3.453-3.056h-3.612c-0.174 0-0.301 0.142-0.301 0.301z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 202.83 142.88)' d='m0 0c0 0.158 0.127 0.301 0.301 0.301h0.618c0.158 0 0.301-0.143 0.301-0.301v-9.725h4.561c0.175 0 0.301-0.142 0.301-0.3v-0.46c0-0.159-0.126-0.301-0.301-0.301h-5.48c-0.174 0-0.301 0.142-0.301 0.301z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 210.44 142.88)' d='m0 0c0 0.158 0.127 0.301 0.301 0.301h6.241c0.174 0 0.301-0.143 0.301-0.301v-0.459c0-0.159-0.127-0.302-0.301-0.302h-5.322v-3.864h4.546c0.158 0 0.3-0.143 0.3-0.301v-0.459c0-0.175-0.142-0.302-0.3-0.302h-4.546v-4.038h5.322c0.174 0 0.301-0.142 0.301-0.3v-0.46c0-0.159-0.127-0.301-0.301-0.301h-6.241c-0.174 0-0.301 0.142-0.301 0.301z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 227.93 142.42)' d='m0 0c1.6 0 2.756-0.554 3.833-1.473 0.127-0.127 0.143-0.316 0.016-0.443-0.143-0.143-0.317-0.301-0.444-0.443-0.142-0.159-0.237-0.143-0.412 0.015-0.807 0.713-1.947 1.236-3.009 1.236-2.503 0-4.403-2.091-4.403-4.546 0-2.439 1.9-4.577 4.403-4.577 1.743 0 2.851 0.665 2.851 0.665v2.217h-1.821c-0.174 0-0.301 0.127-0.301 0.286v0.585c0 0.174 0.127 0.301 0.301 0.301h2.74c0.158 0 0.285-0.142 0.285-0.301v-3.626c0-0.08-0.063-0.207-0.127-0.254 0 0-1.615-1.045-3.912-1.045-3.168 0-5.718 2.518-5.718 5.685 0 3.168 2.55 5.718 5.718 5.718' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 238.78 148.28)' d='m0 0c1.22 0 2.281 1.014 2.281 2.313 0 1.204-1.061 2.233-2.281 2.233h-3.072v-4.546zm-4.324 5.401c0 0.159 0.127 0.301 0.301 0.301h4.102c1.9 0 3.453-1.488 3.453-3.373 0-1.458-0.967-2.677-2.345-3.231l2.17-4.024c0.112-0.206 0-0.459-0.268-0.459h-0.808c-0.142 0-0.222 0.079-0.254 0.143l-2.106 4.197h-3.025v-4.039c0-0.158-0.143-0.301-0.301-0.301h-0.618c-0.174 0-0.301 0.143-0.301 0.301z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 249.64 152.72)' d='m0 0c2.518 0 4.593 2.06 4.593 4.577 0 2.519-2.075 4.61-4.593 4.61-2.519 0-4.578-2.091-4.578-4.61 0-2.517 2.059-4.577 4.578-4.577m0 10.295c3.167 0 5.701-2.55 5.701-5.718 0-3.167-2.534-5.685-5.701-5.685-3.168 0-5.687 2.518-5.687 5.685 0 3.168 2.519 5.718 5.687 5.718' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 256.52 142.96)' d='m0 0c-0.063 0.222 0.063 0.38 0.285 0.38h0.665c0.127 0 0.254-0.11 0.285-0.222l2.203-8.204h0.062l2.646 8.41c0.031 0.095 0.126 0.174 0.269 0.174h0.285c0.126 0 0.237-0.079 0.269-0.174l2.693-8.41h0.063l2.154 8.204c0.032 0.112 0.158 0.222 0.285 0.222h0.665c0.222 0 0.349-0.158 0.285-0.38l-2.993-10.644c-0.032-0.127-0.158-0.221-0.285-0.221h-0.254c-0.11 0-0.222 0.079-0.269 0.174l-2.74 8.569h-0.079l-2.692-8.569c-0.048-0.095-0.159-0.174-0.27-0.174h-0.254c-0.126 0-0.253 0.094-0.285 0.221z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 273.24 143.64)' d='M0 0H-2.756C-2.93 0-3.057 .143-3.057 .302V.761C-3.057 .919-2.93 1.062-2.756 1.062H3.96C4.134 1.062 4.261 .919 4.261 .761V.302C4.261 .143 4.134 0 3.96 0H1.204V-9.725C1.204-9.883 1.062-10.025 .902-10.025H.301C.143-10.025 0-9.883 0-9.725Z' fill='#6d6e71'/><path transform='matrix(1 0 0 -1 279.08 142.88)' d='M0 0C0 .158 .143 .301 .301 .301H.919C1.093 .301 1.22 .158 1.22 0V-4.625H7.65V0C7.65 .158 7.777 .301 7.951 .301H8.569C8.728 .301 8.87 .158 8.87 0V-10.485C8.87-10.644 8.728-10.786 8.569-10.786H7.951C7.777-10.786 7.65-10.644 7.65-10.485V-5.687H1.22V-10.485C1.22-10.644 1.093-10.786 .919-10.786H.301C.143-10.786 0-10.644 0-10.485Z' fill='#6d6e71'/></g></svg>";

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
            if (window.innerWidth < 900) {
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
            if (hamburger && navLinks && window.innerWidth < 900) {
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
