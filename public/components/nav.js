/* ============================================
   Alavanka — Unified Navigation Component
   
   USAGE: Add to any page:
   <script src="[path]/components/nav.js"></script>
   
   Auto-detects page depth to fix relative paths.
   Replaces inline <nav> with unified version.
   
   UPDATED: Added dropdown menus for Founders & Investors
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
    var logoSrc = basePath + 'assets/images/brand/logo-preto.png';
    
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

    // ── Chevron SVG ──
    var chevronSvg = '<svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';

    // ── Build navigation HTML with dropdowns ──
    var navHTML = ''
        + '<nav role="navigation" aria-label="Navegação principal">'
        + '  <a href="' + (isIndex ? '#' : indexUrl) + '" class="logo" aria-label="Alavanka - Home">'
        + '    <img src="' + logoSrc + '" alt="Alavanka" width="108" height="36">'
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
                    hamburger.classList.contains('active') ? 'true' : 'false'
                );
            }
        },

        closeMenu: function () {
            var hamburger = document.getElementById('hamburger');
            var navLinks = document.getElementById('navLinks');
            if (hamburger && navLinks) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            // Also close all dropdowns
            document.querySelectorAll('.nav-dropdown').forEach(function(d) {
                d.classList.remove('open');
            });
        },

        toggleDropdown: function (dropdown) {
            var wasOpen = dropdown.classList.contains('open');
            // Close all dropdowns first
            document.querySelectorAll('.nav-dropdown').forEach(function(d) {
                d.classList.remove('open');
            });
            // Toggle the clicked one
            if (!wasOpen) {
                dropdown.classList.add('open');
            }
        },

        toggleLang: function () {
            if (typeof window.toggleLang === 'function') {
                window.toggleLang();
                return;
            }
            if (typeof window.toggleLanguage === 'function') {
                window.toggleLanguage();
                return;
            }

            var currentLang = window._alavankaLang || 'pt';
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            window._alavankaLang = currentLang;
            
            var btnText = currentLang === 'pt' ? 'EN' : 'PT';
            var langToggle = document.getElementById('langToggle');
            var langToggleMobile = document.getElementById('langToggleMobile');
            if (langToggle) langToggle.textContent = btnText;
            if (langToggleMobile) langToggleMobile.textContent = btnText;
            
            localStorage.setItem('alavanka-lang', currentLang);

            if (window.translations && window.translations[currentLang]) {
                document.querySelectorAll('[data-i18n]').forEach(function(el) {
                    var key = el.getAttribute('data-i18n');
                    if (window.translations[currentLang][key]) {
                        el.innerHTML = window.translations[currentLang][key];
                    }
                });
            }
        },

        syncLang: function () {
            var saved = localStorage.getItem('alavanka-lang') || 'pt';
            window._alavankaLang = saved;
            var btnText = saved === 'pt' ? 'EN' : 'PT';
            var langToggle = document.getElementById('langToggle');
            var langToggleMobile = document.getElementById('langToggleMobile');
            if (langToggle) langToggle.textContent = btnText;
            if (langToggleMobile) langToggleMobile.textContent = btnText;
        }
    };

    // ── Dropdown Event Listeners ──
    document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            alavankaNav.toggleDropdown(trigger.parentElement);
        });
    });

    // Desktop: click behavior only (no hover)

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            alavankaNav.closeMenu();
        });
    });

    // Close menu/dropdowns on outside click
    document.addEventListener('click', function (e) {
        var navLinks = document.getElementById('navLinks');
        var hamburger = document.getElementById('hamburger');
        
        // Close dropdowns if clicked outside
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown').forEach(function(d) {
                d.classList.remove('open');
            });
        }
        
        // Close mobile menu if clicked outside
        if (navLinks && hamburger &&
            !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            alavankaNav.closeMenu();
        }
    });

    // Close menu on desktop resize
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            alavankaNav.closeMenu();
        }
    });

    // Sync lang buttons on load
    alavankaNav.syncLang();

})();
