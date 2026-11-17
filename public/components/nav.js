/* ============================================
   Alavanka — Unified Navigation Component v6

   REWRITTEN: 2026-11-17 (BOT consolidation, English-first)

   Architecture:
   - One navigation for every page. Build-Operate-Transfer is the single
     front-door offer, so all items point to the BOT pages.
     Order: Logo → Home → The Model → How It Works → Readiness Check →
            Commercial Playbook → Blog → FAQ → Contact → language toggle
   - Default language is English. With no stored choice, the nav follows
     the page's own language (<html lang>), so nav and content agree on
     Portuguese pages; every other page gets English.
   - The language toggle only appears on pages that have a Portuguese
     version: the page itself is Portuguese, or it declares a pt-BR
     <link rel="alternate" hreflang>. English-only pages hide it.
   - sessionStorage('alavanka-lang') is the single source of truth.
   - langChange event triggers re-render (nav.js dispatches it itself
     as fallback when page-level toggleLang forgets to).
   - investidores.html stays live but is intentionally not linked here.
   ============================================ */

(function () {
    'use strict';

    // ── 1. Detect page depth from script src ──────────────────
    var scripts = document.getElementsByTagName('script');
    var basePath = '';
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src || '';
        if (src.indexOf('components/nav.js') !== -1) {
            var tag = scripts[i].getAttribute('src');
            if (tag.indexOf('/') === 0) basePath = '/';           // root-absolute (generated blog posts, readiness)
            else if (tag.indexOf('../../') === 0) basePath = '../../';
            else if (tag.indexOf('../') === 0) basePath = '../';
            break;
        }
    }

    // ── 2. Build URLs ─────────────────────────────────────────
    var marketEntryUrl = basePath + 'market-entry.html';
    var readinessUrl = basePath + 'market-entry/readiness.html';
    var playbookUrl = basePath + 'commercial-playbook-latam.html';
    var blogUrl = basePath + 'blog.html';
    var logoPath = basePath + 'assets/images/brand/logo-completo-navy.png';

    // ── 3. Detect page context ────────────────────────────────
    var currentPath = window.location.pathname;
    function endsWith(str, suffix) {
        return str.length >= suffix.length && str.slice(-suffix.length) === suffix;
    }
    var isOnMEPLanding = endsWith(currentPath, '/market-entry') || endsWith(currentPath, '/market-entry.html');

    var pageLangAttr = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    var pageIsPortuguese = pageLangAttr.indexOf('pt') === 0;
    var hasPortugueseVersion = pageIsPortuguese ||
        !!document.querySelector('link[rel="alternate"][hreflang="pt-BR"], link[rel="alternate"][hreflang="pt"]');

    // Pages that translate in place (data-i18n + translations.json) follow the
    // visitor's stored choice. Every other page has a fixed content language
    // (generated posts, the playbook, blog.html once it has resolved ?lang=),
    // declared in <html lang>, and the nav must match it.
    var translatesInPlace = !!document.querySelector('[data-i18n]');

    // Language: English-only pages are always EN; fixed-language pages use
    // <html lang>; in-place pages use sessionStorage, then <html lang>.
    function getCurrentLang() {
        if (!hasPortugueseVersion) return 'en';
        var pageLang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en';
        if (!translatesInPlace) return pageLang;
        var stored = sessionStorage.getItem('alavanka-lang');
        if (stored === 'pt' || stored === 'en') return stored;
        return pageLang;
    }

    // ── 4. Nav configuration per language ─────────────────────
    function getItems(lang) {
        var pt = lang === 'pt';
        return [
            { label: pt ? 'Início' : 'Home', href: isOnMEPLanding ? '#' : marketEntryUrl },
            { label: pt ? 'O Modelo' : 'The Model', href: sectionUrl('the-model') },
            { label: pt ? 'Como Funciona' : 'How It Works', href: sectionUrl('process') },
            { label: pt ? 'Diagnóstico' : 'Readiness Check', href: readinessUrl },
            { label: pt ? 'Playbook Comercial' : 'Commercial Playbook', href: playbookUrl },
            { label: 'Blog', href: blogUrl },
            { label: 'FAQ', href: sectionUrl('faq') },
            { label: pt ? 'Contato' : 'Contact', href: sectionUrl('connect') }
        ];
    }

    // ── 5. URL builder for market-entry section anchors ───────
    function sectionUrl(anchor) {
        return isOnMEPLanding ? '#' + anchor : marketEntryUrl + '#' + anchor;
    }

    // ── 6. Build and inject nav HTML ──────────────────────────
    function buildAndInjectNav(lang) {
        var items = getItems(lang);

        var html = ''
            + '<nav role="navigation" aria-label="' + (lang === 'pt' ? 'Navegação principal' : 'Main navigation') + '">'
            + '  <a href="' + marketEntryUrl + '" class="logo" aria-label="Alavanka - Home">'
            + '    <img src="' + logoPath + '" alt="Alavanka" class="nav-logo-img">'
            + '  </a>'
            + '  <div class="nav-mobile-right">'
            + '    <button class="hamburger" id="hamburger" onclick="alavankaNav.toggleMenu()" aria-label="Menu" aria-expanded="false">'
            + '      <span></span><span></span><span></span>'
            + '    </button>'
            + '  </div>'
            + '  <div class="nav-links" id="navLinks">';

        for (var n = 0; n < items.length; n++) {
            html += '<a href="' + items[n].href + '" class="nav-link-desktop">' + items[n].label + '</a>';
            html += '<a href="' + items[n].href + '" class="nav-link-mobile">' + items[n].label + '</a>';
        }

        // Lang toggle (only on pages with a Portuguese version)
        if (hasPortugueseVersion) {
            var toggleLabel = lang === 'pt' ? 'EN' : 'PT';
            html += '<div class="nav-sep"></div>';
            html += '<button class="nav-lang-desktop" id="langToggle" onclick="alavankaNav.toggleLang()">' + toggleLabel + '</button>';
            html += '<div class="nav-lang-row-mobile">';
            html += '  <button class="nav-lang-btn' + (lang === 'en' ? ' active' : '') + '" onclick="alavankaNav.setLang(\'en\')">EN</button>';
            html += '  <button class="nav-lang-btn' + (lang === 'pt' ? ' active' : '') + '" onclick="alavankaNav.setLang(\'pt\')">PT</button>';
            html += '</div>';
        }

        html += '  </div>';
        html += '  <div class="menu-overlay" id="menuOverlay" onclick="alavankaNav.closeMenu()"></div>';
        html += '</nav>';

        // ── Inject ──
        var target = document.querySelector('nav[role="navigation"]') || document.getElementById('main-nav');
        if (target) {
            target.outerHTML = html;
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }

        // ── Bind: close sidebar on link click (mobile) ──
        var links = document.querySelectorAll('.nav-links a');
        for (var l = 0; l < links.length; l++) {
            links[l].addEventListener('click', function () {
                if (window.innerWidth < 1024) alavankaNav.closeMenu();
            });
        }
    }

    // ── 7. Initial render ─────────────────────────────────────
    buildAndInjectNav(getCurrentLang());

    // ── 8. Re-render on language change ───────────────────────
    window.addEventListener('langChange', function (e) {
        if (!e.detail || !e.detail.lang) return;
        if (!hasPortugueseVersion) return;
        buildAndInjectNav(e.detail.lang);
    });

    // ── 9. Public API ─────────────────────────────────────────
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

        setLang: function (lang) {
            if (!hasPortugueseVersion) return;
            var current = getCurrentLang();
            if (lang === current) return;
            sessionStorage.setItem('alavanka-lang', lang);

            // Delegate to page-level handler if it exists (handles page content i18n)
            if (typeof window.toggleLang === 'function' && window.toggleLang !== window.alavankaNav.toggleLang) {
                window.toggleLang();
            }

            // ALWAYS dispatch langChange — guarantees nav re-renders
            window.dispatchEvent(new CustomEvent('langChange', { detail: { lang: lang } }));
        },

        toggleLang: function () {
            var current = getCurrentLang();
            alavankaNav.setLang(current === 'pt' ? 'en' : 'pt');
        }
    };

    // ── 10. Close menu on resize to desktop ───────────────────
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            alavankaNav.closeMenu();
        }
    });

})();
