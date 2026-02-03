/* ============================================
   Alavanka — Unified Navigation Component
   
   USAGE: Add to any page:
   <script src="[path]/components/nav.js"></script>
   
   Auto-detects page depth to fix relative paths.
   Replaces inline <nav> with unified version.
   
   CORRIGIDO: 2026-02-03
   - Logo SVG com viewBox corrigido (sem corte)
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

    // ── Logo SVG - viewBox CORRIGIDO para não cortar ──
    // ViewBox: 107 50 210 110 (ajustado para incluir todo o conteúdo)
    var logoSvg = "<svg class='nav-logo-svg' aria-label='Alavanka - Sustainable Growth' viewBox='107 50 210 110' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid meet'>"
        // Letra "a" (primeira)
        + "<path transform='matrix(1 0 0 -1 121.78 124.01)' d='m0 0c-1.971 0-3.038-0.99-3.038-2.515 0-1.444 0.989-2.507 3.498-2.507 3.426 0 5.933 1.826 5.933 3.952v1.07zm1.597 9.882c-2.734 0-4.71-1.064-6.233-2.809l-4.639 4.26c2.894 3.268 6.698 4.942 11.333 4.942 7.38 0 11.942-3.801 11.942-11.489v-15.214h-7.607v2.361c-1.748-2.058-4.255-3.037-7.3-3.037-5.247 0-9.661 2.58-9.661 8.669 0 5.101 4.49 7.607 10.195 7.607h6.766c-0.073 3.5-2.05 4.71-4.796 4.71' fill='#1B3A5C'/>"
        // Letra "l"
        + "<path transform='matrix(1,0,0,-1,0,198)' d='m149.41 120.71h-7.605v-57.145h7.605z' fill='#1B3A5C'/>"
        // Letra "a" (segunda)
        + "<path transform='matrix(1 0 0 -1 164.7 124.01)' d='m0 0c-1.98 0-3.042-0.99-3.042-2.515 0-1.444 0.994-2.507 3.502-2.507 3.42 0 5.93 1.826 5.93 3.952v1.07zm1.599 9.882c-2.74 0-4.716-1.064-6.238-2.809l-4.641 4.26c2.889 3.268 6.692 4.942 11.338 4.942 7.37 0 11.937-3.801 11.937-11.489v-15.214h-7.605v2.361c-1.744-2.058-4.264-3.037-7.301-3.037-5.242 0-9.661 2.58-9.661 8.669 0 5.101 4.485 7.607 10.19 7.607h6.772c-0.073 3.5-2.047 4.71-4.791 4.71' fill='#1B3A5C'/>"
        // Letra "v"
        + "<path transform='matrix(1 0 0 -1 180.85 108.41)' d='M0 0H8.516L14.753-12.625 20.762 0H28.371L14.448-26.696H14.144Z' fill='#1B3A5C'/>"
        // Letra "a" (terceira)
        + "<path transform='matrix(1 0 0 -1 220.95 124.01)' d='m0 0c-1.98 0-3.045-0.99-3.045-2.515 0-1.444 0.993-2.507 3.504-2.507 3.419 0 5.93 1.826 5.93 3.952v1.07zm1.598 9.882c-2.741 0-4.715-1.064-6.24-2.809l-4.641 4.26c2.892 3.268 6.693 4.942 11.339 4.942 7.372 0 11.937-3.801 11.937-11.489v-15.214h-7.604v2.361c-1.744-2.058-4.262-3.037-7.302-3.037-5.243 0-9.662 2.58-9.662 8.669 0 5.101 4.486 7.607 10.191 7.607h6.771c-0.079 3.5-2.053 4.71-4.797 4.71' fill='#1B3A5C'/>"
        // Letra "n"
        + "<path transform='matrix(1 0 0 -1 247.92 108.41)' d='M0 0H7.607V-16.196C7.607-19.468 9.808-21.663 13.227-21.663 16.646-21.663 18.854-19.468 18.854-16.196V0H26.461V-17.49C26.461-24.025 21.816-27.832 13.227-27.832 4.639-27.832 0-24.025 0-17.49Z' fill='#1B3A5C'/>"
        // Letra "k"
        + "<path transform='matrix(1 0 0 -1 277.89 80.69)' d='M0 0H7.605V-12.936L17.343-27.722H8.668L1.671-16.883-5.392-27.722H-14.067L-4.33-12.936V-12.172L-15.592 0H-6.69L0-10.578 6.69 0Z' fill='#1B3A5C'/>"
        // Letra "a" (última - cor diferente)
        + "<path transform='matrix(1 0 0 -1 297.25 124.01)' d='m0 0c-1.971 0-3.038-0.99-3.038-2.515 0-1.444 0.989-2.507 3.498-2.507 3.426 0 5.933 1.826 5.933 3.952v1.07zm1.597 9.882c-2.734 0-4.71-1.064-6.233-2.809l-4.639 4.26c2.894 3.268 6.698 4.942 11.333 4.942 7.38 0 11.942-3.801 11.942-11.489v-15.214h-7.607v2.361c-1.748-2.058-4.255-3.037-7.3-3.037-5.247 0-9.661 2.58-9.661 8.669 0 5.101 4.49 7.607 10.195 7.607h6.766c-0.073 3.5-2.05 4.71-4.796 4.71' fill='#3D7AB5'/>"
        // Tagline: SUSTAINABLE
        + "<path transform='matrix(1 0 0 -1 154.69 147.54)' d='M0 0C1.552 0 2.755-.793 2.755-2.186 2.755-3.262 2.059-3.944 .935-4.197L-.618-4.577C-1.441-4.767-1.79-5.101-1.79-5.623-1.79-6.257-1.156-6.684-.317-6.684 .491-6.684 1.109-6.288 1.267-5.607L2.423-5.797C2.186-6.937 1.188-7.746-.317-7.746-1.79-7.746-2.993-6.906-2.993-5.56-2.993-4.546-2.391-3.786-1.125-3.501L.444-3.121C1.236-2.946 1.552-2.565 1.552-2.09 1.552-1.409.856-.951 0-.951-.903-.951-1.631-1.378-1.758-2.138L-2.946-1.948C-2.724-.713-1.616 0 0 0' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 166.03 147.54)' d='M0 0C1.885 0 3.262-1.188 3.262-3.04V-7.587H2.059V-3.168C2.059-.967 1.394-.967.016-.967-.016-1.966.016-3.04.016-3.04V-7.587H-1.188V0H-.016V-.729C.428-.158 1.109.016 1.695 0Z' fill='#6d6e71'/>"
        + "<path transform='matrix(1 0 0 -1 170.4 150.53)' d='M0 0C0 .158.143.301.301.301H.919C1.093.301 1.22.158 1.22 0V-10.485C1.22-10.644 1.093-10.786.919-10.786H.301C.143-10.786 0-10.644 0-10.485Z' fill='#6d6e71'/>"
        // Resto do tagline (GROWTH)
        + "<path transform='matrix(1 0 0 -1 212.99 148.01)' d='M0 0C-2.79 0-4.991-2.107-4.991-5.086 0-8.046 2.201-10.154 4.991-10.154 2.79-10.154 4.99-8.046 4.99-5.086 4.99-2.107 2.79 0 0 0M0 1.156C3.469 1.156 6.177-1.49 6.177-5.086 6.177-8.681 3.469-11.311 0-11.311-3.469-11.311-6.178-8.681-6.178-5.086-6.178-1.49-3.469 1.156 0 1.156' fill='#6d6e71'/>"
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
        
        // CTA
        + '    <a href="' + sectionLink('contato') + '" data-i18n="nav.contact">Contato</a>'
        
        // Lang toggle inside sidebar
        + '    <button class="lang-toggle" id="langToggle" onclick="alavankaNav.toggleLang()">EN</button>'
        
        + '  </div>'
        + '  <div class="menu-overlay" id="menuOverlay" onclick="alavankaNav.closeMenu()"></div>'
        + '</nav>';

    // ── Replace existing nav or inject ──
    var existingNav = document.getElementById('main-nav');
    if (existingNav) {
        existingNav.outerHTML = navHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    // ── Navigation functions ──
    window.alavankaNav = {
        toggleMenu: function () {
            var hamburger = document.getElementById('hamburger');
            var navLinks = document.getElementById('navLinks');
            var overlay = document.getElementById('menuOverlay');
            
            if (hamburger && navLinks && overlay) {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                overlay.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', navLinks.classList.contains('active'));
            }
        },
        
        closeMenu: function () {
            var hamburger = document.getElementById('hamburger');
            var navLinks = document.getElementById('navLinks');
            var overlay = document.getElementById('menuOverlay');
            
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        },
        
        toggleLang: function () {
            // Check if page has its own toggleLang
            if (typeof window.toggleLang === 'function') {
                window.toggleLang();
            } else {
                // Default: toggle between PT and EN display
                var langBtn = document.getElementById('langToggle');
                var langBtnMobile = document.getElementById('langToggleMobile');
                var currentLang = (langBtn && langBtn.textContent === 'EN') ? 'en' : 'pt';
                var newLang = currentLang === 'pt' ? 'en' : 'pt';
                
                if (langBtn) langBtn.textContent = newLang === 'pt' ? 'EN' : 'PT';
                if (langBtnMobile) langBtnMobile.textContent = newLang === 'pt' ? 'EN' : 'PT';
                
                // Dispatch event for pages to handle
                window.dispatchEvent(new CustomEvent('langChange', { detail: { lang: newLang } }));
            }
        }
    };

    // ── Dropdown toggle for mobile ──
    document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            // On mobile, toggle dropdown
            if (window.innerWidth < 1024) {
                e.preventDefault();
                var dropdown = this.closest('.nav-dropdown');
                dropdown.classList.toggle('open');
            }
        });
    });

    // ── Close menu on link click (mobile) ──
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth < 1024) {
                alavankaNav.closeMenu();
            }
        });
    });

    // ── Close menu on resize to desktop ──
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            alavankaNav.closeMenu();
            document.querySelectorAll('.nav-dropdown').forEach(function (d) {
                d.classList.remove('open');
            });
        }
    });

})();
