/* ============================================
   Alavanka — Unified Navigation Component
   
   CORRIGIDO: 2026-02-03
   - Usando imagem PNG ao invés de SVG inline
   - Logo: assets/images/brand/logo-completo-navy.png
   ============================================ */

(function () {
    'use strict';

    // ── Detect page depth ──
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

    // ── Determine current page ──
    var currentPath = window.location.pathname;
    var isIndex = currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('.com.br');
    var isBlog = currentPath.endsWith('/blog.html');
    var isBlogPost = currentPath.indexOf('/blog/posts/') !== -1 || currentPath.indexOf('/blog/') !== -1;
    var isGuia = currentPath.indexOf('guia-fractional-cro-brasil') !== -1;
    var isPrecificacao = currentPath.indexOf('guia-precificacao') !== -1;
    var isInvestidores = currentPath.indexOf('investidores') !== -1;

    // ── Build URLs ──
    var indexUrl = basePath ? basePath + 'index.html' : 'index.html';
    var blogUrl = basePath ? basePath + 'blog.html' : 'blog.html';
    var guiaUrl = basePath ? basePath + 'guia-fractional-cro-brasil.html' : 'guia-fractional-cro-brasil.html';
    var investidoresUrl = basePath ? basePath + 'investidores.html' : 'investidores.html';
    
    // Logo path (relativo à página atual)
    var logoPath = basePath + 'assets/images/brand/logo-completo-navy.png';
    
    var sectionLink = function (hash) {
        if (isIndex) return '#' + hash;
        return indexUrl + '#' + hash;
    };

    // Active class helpers
    var blogActive = (isBlog || isBlogPost || isPrecificacao) ? ' active' : '';
    var guiaActive = isGuia ? ' active' : '';
    var founderActive = (isIndex || isGuia) ? ' active' : '';
    var investidoresActive = isInvestidores ? ' active' : '';

    // ── Chevron SVG ──
    var chevronSvg = '<svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';

    // ── Build navigation HTML ──
    var navHTML = ''
        + '<nav role="navigation" aria-label="Navegação principal">'
        + '  <a href="' + (isIndex ? '#' : indexUrl) + '" class="logo" aria-label="Alavanka - Home">'
        + '    <img src="' + logoPath + '" alt="Alavanka - Sustainable Growth" class="nav-logo-img">'
        + '  </a>'
        + '  <button class="lang-toggle-mobile" id="langToggleMobile" onclick="alavankaNav.toggleLang()">EN</button>'
        + '  <button class="hamburger" id="hamburger" onclick="alavankaNav.toggleMenu()" aria-label="Menu" aria-expanded="false">'
        + '    <span></span><span></span><span></span>'
        + '  </button>'
        + '  <div class="nav-links" id="navLinks">'
        + '    <a href="' + (isIndex ? '#' : indexUrl) + '" class="nav-home" title="Home"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></a>'
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
        + '    <div class="nav-dropdown' + investidoresActive + '">'
        + '      <button class="nav-dropdown-trigger" data-i18n="nav.investors">Para Fundos ' + chevronSvg + '</button>'
        + '      <div class="nav-dropdown-menu">'
        + '        <a href="' + investidoresUrl + '" data-i18n="nav.investors.overview">Visão Geral</a>'
        + '        <a href="' + investidoresUrl + '#inv-faq" data-i18n="nav.investors.faq">FAQ</a>'
        + '        <a href="' + investidoresUrl + '#inv-cta" data-i18n="nav.investors.contact">Agendar Conversa</a>'
        + '      </div>'
        + '    </div>'
        + '    <a href="' + guiaUrl + '" data-i18n="nav.playbook" class="' + guiaActive + '">Playbook</a>'
        + '    <a href="' + blogUrl + '" data-i18n="nav.blog" class="' + blogActive + '">Blog</a>'
        + '    <a href="' + sectionLink('contato') + '" data-i18n="nav.contact">Contato</a>'
        + '    <button class="lang-toggle" id="langToggle" onclick="alavankaNav.toggleLang()">EN</button>'
        + '  </div>'
        + '  <div class="menu-overlay" id="menuOverlay" onclick="alavankaNav.closeMenu()"></div>'
        + '</nav>';

    // ── Replace existing nav ──
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
            if (typeof window.toggleLang === 'function') {
                window.toggleLang();
            } else {
                var langBtn = document.getElementById('langToggle');
                var langBtnMobile = document.getElementById('langToggleMobile');
                var currentLang = (langBtn && langBtn.textContent === 'EN') ? 'en' : 'pt';
                var newLang = currentLang === 'pt' ? 'en' : 'pt';
                if (langBtn) langBtn.textContent = newLang === 'pt' ? 'EN' : 'PT';
                if (langBtnMobile) langBtnMobile.textContent = newLang === 'pt' ? 'EN' : 'PT';
                window.dispatchEvent(new CustomEvent('langChange', { detail: { lang: newLang } }));
            }
        }
    };

    // ── Dropdown toggle for mobile ──
    document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            if (window.innerWidth < 1024) {
                e.preventDefault();
                this.closest('.nav-dropdown').classList.toggle('open');
            }
        });
    });

    // ── Close menu on link click ──
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth < 1024) alavankaNav.closeMenu();
        });
    });

    // ── Close menu on resize ──
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            alavankaNav.closeMenu();
            document.querySelectorAll('.nav-dropdown').forEach(function (d) { d.classList.remove('open'); });
        }
    });

})();
