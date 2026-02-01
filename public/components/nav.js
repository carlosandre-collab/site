/* ============================================
   Alavanka — Unified Navigation Component
   
   USAGE: Add to any page:
   <script src="[path]/components/nav.js"></script>
   
   Auto-detects page depth to fix relative paths.
   Replaces inline <nav> with unified version.
   ============================================ */

(function () {
    'use strict';

    // ── Detect page depth based on nav.js script location ──
    // If script src contains "../../" → page is 2 levels deep (blog/posts/)
    // If script src contains "./" or just "components/" → page is at root
    var scripts = document.getElementsByTagName('script');
    var basePath = '';
    
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src || '';
        if (src.indexOf('components/nav.js') !== -1) {
            // Extract the path prefix before "components/nav.js"
            var idx = src.indexOf('components/nav.js');
            var prefix = src.substring(0, idx);
            
            // Get relative base from the HTML file's perspective
            // by looking at how the script tag was written
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

    // ── Build navigation HTML ──
    var indexUrl = basePath ? basePath + 'index.html' : 'index.html';
    var blogUrl = basePath ? basePath + 'blog.html' : 'blog.html';
    var guiaUrl = basePath ? basePath + 'guia-fractional-cro-brasil.html' : 'guia-fractional-cro-brasil.html';
    var logoSrc = basePath + 'assets/images/brand/logo-preto.png';
    
    // For root-level pages, use anchor links; for sub-pages, use full paths
    var sectionLink = function (hash) {
        if (isIndex) return '#' + hash;
        return indexUrl + '#' + hash;
    };

    // Active class helper
    var blogActive = (isBlog || isBlogPost || isPrecificacao) ? ' active' : '';
    var guiaActive = isGuia ? ' active' : '';

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
        + '    <a href="' + sectionLink('problema') + '" data-i18n="nav.problem">O Problema</a>'
        + '    <a href="' + sectionLink('solucao') + '" data-i18n="nav.solution">A Solução</a>'
        + '    <a href="' + sectionLink('porque') + '" data-i18n="nav.why">Por Que Nós</a>'
        + '    <a href="' + sectionLink('processo') + '" data-i18n="nav.process">Como Funciona</a>'
        + '    <a href="' + guiaUrl + '" data-i18n="nav.playbook" class="' + guiaActive + '">Playbook</a>'
        + '    <a href="' + blogUrl + '" data-i18n="nav.blog" class="' + blogActive + '">Blog</a>'
        + '    <a href="' + sectionLink('faq') + '" data-i18n="nav.faq">FAQ</a>'
        + '    <a href="' + sectionLink('contato') + '" data-i18n="nav.contact">Contato</a>'
        + '    <button class="lang-toggle" id="langToggle" onclick="alavankaNav.toggleLang()">EN</button>'
        + '  </div>'
        + '</nav>';

    // ── Inject nav ──
    // Strategy: find existing <nav> and replace, OR inject at start of <body>
    var existingNav = document.querySelector('nav');
    if (existingNav) {
        existingNav.outerHTML = navHTML;
    } else {
        // Insert at beginning of body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    // ── Nav Behavior (exposed as alavankaNav global) ──
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
        },

        toggleLang: function () {
            // If the page has its own translation system, delegate to it
            if (typeof window.toggleLang === 'function') {
                window.toggleLang();
                return;
            }
            if (typeof window.toggleLanguage === 'function') {
                window.toggleLanguage();
                return;
            }

            // Fallback: basic toggle for pages without full i18n
            var currentLang = window._alavankaLang || 'pt';
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            window._alavankaLang = currentLang;
            
            var btnText = currentLang === 'pt' ? 'EN' : 'PT';
            var langToggle = document.getElementById('langToggle');
            var langToggleMobile = document.getElementById('langToggleMobile');
            if (langToggle) langToggle.textContent = btnText;
            if (langToggleMobile) langToggleMobile.textContent = btnText;
            
            localStorage.setItem('alavanka-lang', currentLang);

            // Apply translations if available
            if (window.translations && window.translations[currentLang]) {
                document.querySelectorAll('[data-i18n]').forEach(function(el) {
                    var key = el.getAttribute('data-i18n');
                    if (window.translations[currentLang][key]) {
                        el.innerHTML = window.translations[currentLang][key];
                    }
                });
            }
        },

        // Sync lang buttons with current language state
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

    // ── Event Listeners ──

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            alavankaNav.closeMenu();
        });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
        var navLinks = document.getElementById('navLinks');
        var hamburger = document.getElementById('hamburger');
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
