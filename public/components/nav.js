/* ============================================
   Alavanka — Unified Navigation Component v5

   REWRITTEN: 2026-03-27 (post-audit)

   Architecture:
   - Two contexts: Startup Growth (PT/EN) + Expand to LatAm (EN-only)
   - Context auto-detected from URL path + sessionStorage
   - buildAndInjectNav() renders full nav HTML and binds events
   - langChange event triggers re-render (nav.js dispatches it itself
     as fallback when page-level toggleLang forgets to)
   - MEP pages are always EN, no lang toggle shown
   - sessionStorage('alavanka-lang') is the single source of truth
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
            if (tag.indexOf('../../') === 0) basePath = '../../';
            else if (tag.indexOf('../') === 0) basePath = '../';
            break;
        }
    }

    // ── 2. Build URLs ─────────────────────────────────────────
    var indexUrl = basePath + 'index.html';
    var blogUrl = basePath + 'blog.html';
    var guiaUrl = basePath + 'guia-crescimento-receita-b2b.html';
    var investidoresUrl = basePath + 'investidores.html';
    var marketEntryUrl = basePath + 'market-entry.html';
    var assessmentUrl = basePath + 'assessment.html';
    var logoPath = basePath + 'assets/images/brand/logo-completo-navy.png';

    // MEP blog URL — path-aware (basePath is ambiguous for blog/posts vs market-entry/posts)
    var loc = window.location.pathname;
    var mepBlogUrl;
    if (loc.indexOf('/market-entry/posts/') !== -1) {
        mepBlogUrl = '../blog.html';
    } else if (loc.indexOf('/market-entry/') !== -1) {
        mepBlogUrl = 'blog.html';
    } else if (basePath === '../../') {
        mepBlogUrl = '../../market-entry/blog.html';
    } else {
        mepBlogUrl = 'market-entry/blog.html';
    }

    // ── 3. Detect page context ────────────────────────────────
    var currentPath = window.location.pathname;
    var isMEPPage = currentPath.indexOf('market-entry') !== -1;
    var isIndex = currentPath === '/' || currentPath.indexOf('index') !== -1 ||
                  currentPath.endsWith('.com.br') || currentPath.endsWith('.com.br/');
    var isInvestidores = currentPath.indexOf('investidor') !== -1;

    // Language: MEP is always EN; others follow sessionStorage
    function getCurrentLang() {
        if (isMEPPage) return 'en';
        return sessionStorage.getItem('alavanka-lang') || 'pt';
    }

    // ── 4. Nav configuration per language ─────────────────────
    function getConfig(lang) {
        var isEN = lang === 'en';
        return {
            sg: {
                sections: isEN
                    ? [{ label: 'Solution', anchor: 'solucao' }, { label: 'Why Alavanka', anchor: 'porque' }]
                    : [{ label: 'Solução', anchor: 'solucao' }, { label: 'Por que Alavanka', anchor: 'porque' }]
            },
            blogLabel: 'Blog',
            blogUrl: isMEPPage ? mepBlogUrl : blogUrl,
            guiaLabel: isEN ? 'Growth Guide' : 'Guia Crescimento',
            vcsLabel: isEN ? 'VCs' : 'Fundos/VCs',
            latamLabel: 'Expand to LatAm',
            sgLabel: 'Startup Growth',
            ariaLabel: isEN ? 'Main navigation' : 'Navegação principal',
            mep: {
                sections: [
                    { label: 'The Challenge', anchor: 'the-problem' },
                    { label: 'The Origin', anchor: 'origin' },
                    { label: '4-Year Journey', anchor: 'the-model' },
                    { label: 'Compare', anchor: 'comparison' },
                    { label: 'How It Works', anchor: 'process' },
                    { label: 'Our Team', anchor: 'team' },
                    { label: 'FAQ', anchor: 'faq' }
                ]
            }
        };
    }

    // ── 5. URL builder for section anchors ────────────────────
    // Only use #anchor when we're on the EXACT target page (not sub-pages like blog.html)
    var isOnMEPLanding = currentPath.indexOf('market-entry') !== -1 &&
                         currentPath.indexOf('market-entry/') === -1;
    // Also match /market-entry (clean URL without .html)
    if (currentPath.endsWith('/market-entry') || currentPath.endsWith('/market-entry.html')) {
        isOnMEPLanding = true;
    }

    function sectionUrl(anchor, targetPage) {
        if (targetPage === indexUrl && isIndex) return '#' + anchor;
        if (targetPage === marketEntryUrl && isOnMEPLanding) return '#' + anchor;
        if (targetPage === investidoresUrl && isInvestidores) return '#' + anchor;
        return targetPage + '#' + anchor;
    }

    // ── 6. Build and inject nav HTML ──────────────────────────
    function buildAndInjectNav(lang) {
        var cfg = getConfig(lang);

        var html = ''
            + '<nav role="navigation" aria-label="' + cfg.ariaLabel + '">'
            + '  <a href="' + indexUrl + '" class="logo" aria-label="Alavanka - Home">'
            + '    <img src="' + logoPath + '" alt="Alavanka" class="nav-logo-img">'
            + '  </a>'
            + '  <div class="nav-mobile-right">'
            + '    <button class="hamburger" id="hamburger" onclick="alavankaNav.toggleMenu()" aria-label="Menu" aria-expanded="false">'
            + '      <span></span><span></span><span></span>'
            + '    </button>'
            + '  </div>'
            + '  <div class="nav-links" id="navLinks">';

        if (isMEPPage) {
            // ── MEP context ──
            var mepSections = cfg.mep.sections;
            for (var m = 0; m < mepSections.length; m++) {
                var ms = mepSections[m];
                var mUrl = sectionUrl(ms.anchor, marketEntryUrl);
                html += '<a href="' + mUrl + '" class="nav-link-desktop">' + ms.label + '</a>';
                html += '<a href="' + mUrl + '" class="nav-link-mobile">' + ms.label + '</a>';
            }
            // Blog — visually distinct on mobile
            html += '<div class="nav-sep"></div>';
            html += '<a href="' + cfg.blogUrl + '" class="nav-link-desktop">' + cfg.blogLabel + '</a>';
            html += '<a href="' + cfg.blogUrl + '" class="nav-link-mobile nav-link-highlight">' + cfg.blogLabel + '</a>';
            // Startup Growth cross-link
            html += '<div class="nav-sep"></div>';
            html += '<a href="' + indexUrl + '" class="nav-badge-pill">' + cfg.sgLabel + '</a>';
            html += '<a href="' + indexUrl + '" class="nav-link-mobile nav-link-cross">' + cfg.sgLabel + '</a>';

        } else {
            // ── Startup Growth context ──
            var sgSections = cfg.sg.sections;
            for (var s = 0; s < sgSections.length; s++) {
                var sec = sgSections[s];
                var sUrl = sectionUrl(sec.anchor, indexUrl);
                html += '<a href="' + sUrl + '" class="nav-link-desktop">' + sec.label + '</a>';
                html += '<a href="' + sUrl + '" class="nav-link-mobile">' + sec.label + '</a>';
            }
            // Blog
            html += '<a href="' + cfg.blogUrl + '" class="nav-link-desktop">' + cfg.blogLabel + '</a>';
            html += '<a href="' + cfg.blogUrl + '" class="nav-link-mobile">' + cfg.blogLabel + '</a>';
            // Guia
            html += '<a href="' + guiaUrl + '" class="nav-link-desktop">' + cfg.guiaLabel + '</a>';
            html += '<a href="' + guiaUrl + '" class="nav-link-mobile">' + cfg.guiaLabel + '</a>';
            // VCs
            html += '<div class="nav-sep"></div>';
            html += '<a href="' + investidoresUrl + '" class="nav-link-vcs">' + cfg.vcsLabel + '</a>';
            html += '<a href="' + investidoresUrl + '" class="nav-link-mobile nav-link-vcs-mobile">' + cfg.vcsLabel + '</a>';
            // LatAm badge
            html += '<div class="nav-sep"></div>';
            html += '<a href="' + marketEntryUrl + '" class="nav-badge-pill">' + cfg.latamLabel + '</a>';
            html += '<a href="' + marketEntryUrl + '" class="nav-link-mobile nav-link-cross">' + cfg.latamLabel + '</a>';
        }

        // Lang toggle (not on MEP pages)
        if (!isMEPPage) {
            var toggleLabel = lang === 'pt' ? 'EN' : 'PT';
            html += '<button class="nav-lang-desktop" id="langToggle" onclick="alavankaNav.toggleLang()">' + toggleLabel + '</button>';
            html += '<div class="nav-lang-row-mobile">';
            html += '  <button class="nav-lang-btn' + (lang === 'pt' ? ' active' : '') + '" onclick="alavankaNav.setLang(\'pt\')">PT</button>';
            html += '  <button class="nav-lang-btn' + (lang === 'en' ? ' active' : '') + '" onclick="alavankaNav.setLang(\'en\')">EN</button>';
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
        document.querySelectorAll('.nav-links a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth < 1024) alavankaNav.closeMenu();
            });
        });
    }

    // ── 7. Initial render ─────────────────────────────────────
    buildAndInjectNav(getCurrentLang());

    // ── 8. Re-render on language change ───────────────────────
    window.addEventListener('langChange', function (e) {
        if (!e.detail || !e.detail.lang) return;
        if (isMEPPage) return;
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
            var current = getCurrentLang();
            if (lang === current) return;
            sessionStorage.setItem('alavanka-lang', lang);

            // Delegate to page-level handler if it exists (handles page content i18n)
            if (typeof window.toggleLang === 'function' && window.toggleLang !== window.alavankaNav.toggleLang) {
                window.toggleLang();
            }

            // ALWAYS dispatch langChange — guarantees nav re-renders
            // This is the key fix: even if page's toggleLang doesn't dispatch it, we do
            window.dispatchEvent(new CustomEvent('langChange', { detail: { lang: lang } }));
        },

        toggleLang: function () {
            var current = getCurrentLang();
            var newLang = current === 'pt' ? 'en' : 'pt';
            alavankaNav.setLang(newLang);
        }
    };

    // ── 10. Close menu on resize to desktop ───────────────────
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            alavankaNav.closeMenu();
        }
    });

})();
