/* ============================================
   Alavanka — Unified Navigation Component v3
   
   UPDATED: 2026-02-16
   Gate-driven navigation:
   - 3 audience categories: Startups, Fundos & VCs, LatAm Entry
   - Active context (from gate/navigation) gets expanded dropdown
   - Other 2 categories = simple links to their pages
   - CTA changes per context (assessment / calendly / schedule call)
   - Blog/Insights link changes per context
   - Lang toggle hidden for LatAm (English-only)
   - sessionStorage persistence (resets on browser close)
   ============================================ */

(function () {
    'use strict';

    // — Detect page depth —
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

    // — Context definitions —
    var CONTEXTS = {
        startups: {
            label: 'Startups',
            ctaLabel: 'Diagnóstico Gratuito',
            ctaLabelEN: 'Free Assessment',
            ctaUrl: null, // built from basePath
            contentLabel: 'Blog',
            contentUrl: null,
            langToggle: true,
            sections: [
                { label: 'O Cenário', labelEN: 'The Scenario', anchor: 'problema' },
                { label: 'A Solução', labelEN: 'The Solution', anchor: 'solucao' },
                { label: 'Track Record', labelEN: 'Track Record', anchor: 'porque' },
                { label: 'Como Funciona', labelEN: 'How It Works', anchor: 'processo' },
                { label: 'FAQ', labelEN: 'FAQ', anchor: 'faq' }
            ],
            contentItems: [
                { label: '📖 Guia Fractional CRO', labelEN: '📖 Fractional CRO Guide', url: null }
            ]
        },
        investidores: {
            label: 'Fundos & VCs',
            ctaLabel: 'Agendar Conversa',
            ctaLabelEN: 'Schedule Call',
            ctaUrl: 'https://calendly.com/carlos-andre-alavanka/30min',
            contentLabel: 'Blog',
            contentUrl: null,
            langToggle: true,
            sections: [
                { label: 'Visão Geral', labelEN: 'Overview', anchor: 'overview' },
                { label: 'O Problema', labelEN: 'The Problem', anchor: 'problema-inv' },
                { label: 'Como Ajudamos', labelEN: 'How We Help', anchor: 'como-ajudamos' },
                { label: 'FAQ', labelEN: 'FAQ', anchor: 'inv-faq' }
            ],
            contentItems: [
                { label: '📖 Guia Fractional CRO', labelEN: '📖 Fractional CRO Guide', url: null }
            ]
        },
        latam: {
            label: 'LatAm Entry',
            ctaLabel: 'Schedule Call',
            ctaLabelEN: 'Schedule Call',
            ctaUrl: 'https://calendly.com/carlos-andre-alavanka/30min',
            contentLabel: 'Insights',
            contentUrl: null,
            langToggle: false,
            sections: [
                { label: 'The Challenge', labelEN: 'The Challenge', anchor: 'the-problem' },
                { label: 'Compare Models', labelEN: 'Compare Models', anchor: 'comparison' },
                { label: '4-Year Journey', labelEN: '4-Year Journey', anchor: 'the-model' },
                { label: '8-Step Framework', labelEN: '8-Step Framework', anchor: 'process' }
            ],
            contentItems: []
        }
    };

    var CTX_KEYS = ['startups', 'investidores', 'latam'];

    // — Build URLs based on depth —
    var indexUrl = basePath ? basePath + 'index.html' : 'index.html';
    var blogUrl = basePath ? basePath + 'blog.html' : 'blog.html';
    var guiaUrl = basePath ? basePath + 'guia-fractional-cro-brasil.html' : 'guia-fractional-cro-brasil.html';
    var investidoresUrl = basePath ? basePath + 'investidores.html' : 'investidores.html';
    var marketEntryUrl = basePath ? basePath + 'market-entry.html' : 'market-entry.html';
    var assessmentUrl = basePath ? basePath + 'assessment.html' : 'assessment.html';
    var logoPath = basePath + 'assets/images/brand/logo-completo-navy.png';

    // MEP blog URL
    var mepBlogUrl;
    if (basePath === '../../') {
        mepBlogUrl = '../../market-entry/blog.html';
    } else if (basePath === '../') {
        mepBlogUrl = '../market-entry/blog.html';
    } else {
        mepBlogUrl = 'market-entry/blog.html';
    }

    // Set dynamic URLs
    CONTEXTS.startups.ctaUrl = assessmentUrl;
    CONTEXTS.startups.contentUrl = blogUrl;
    CONTEXTS.startups.contentItems[0].url = guiaUrl;
    CONTEXTS.investidores.contentUrl = blogUrl;
    CONTEXTS.investidores.contentItems[0].url = guiaUrl;
    CONTEXTS.latam.contentUrl = mepBlogUrl;

    // Page URLs per context
    var PAGE_URLS = {
        startups: indexUrl,
        investidores: investidoresUrl,
        latam: marketEntryUrl
    };

    // — Detect current page context —
    var currentPath = window.location.pathname;
    var detectedContext = 'startups'; // default
    if (currentPath.indexOf('investidor') !== -1) detectedContext = 'investidores';
    else if (currentPath.indexOf('market-entry') !== -1) detectedContext = 'latam';

    // — Get active context from sessionStorage or page detection —
    var storedAudience = sessionStorage.getItem('alavanka-audience');
    var activeContext = detectedContext;
    
    // Map gate values to nav contexts
    if (storedAudience === 'founder') activeContext = 'startups';
    else if (storedAudience === 'investor') activeContext = 'investidores';
    else if (storedAudience === 'international') activeContext = 'latam';
    
    // Override with page detection (dropdown expands based on current page)
    activeContext = detectedContext;

    // — Section link builder —
    var isIndex = currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('.com.br');
    var isInvestidores = currentPath.indexOf('investidor') !== -1;
    var isMEP = currentPath.indexOf('market-entry') !== -1;

    function sectionUrl(ctx, anchor) {
        var pageUrl = PAGE_URLS[ctx];
        var isOnPage = (ctx === 'startups' && isIndex) ||
                       (ctx === 'investidores' && isInvestidores) ||
                       (ctx === 'latam' && isMEP);
        if (isOnPage) return '#' + anchor;
        return pageUrl + '#' + anchor;
    }

    // — Chevron SVG —
    var chevronSvg = '<svg class="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

    // — Build expanded dropdown HTML —
    function buildDropdown(ctx) {
        var data = CONTEXTS[ctx];
        var html = '<div class="nav-dropdown-menu">';
        
        // "Go to page" link
        var goLabel = ctx === 'latam' ? '→ Go to page' : '→ Ir para página';
        html += '<a href="' + PAGE_URLS[ctx] + '" class="nav-dropdown-page-link" data-i18n-go="' + ctx + '">' + goLabel + '</a>';
        
        // Section links
        for (var i = 0; i < data.sections.length; i++) {
            var s = data.sections[i];
            html += '<a href="' + sectionUrl(ctx, s.anchor) + '" data-i18n-section="' + ctx + '.' + i + '">' + s.label + '</a>';
        }
        
        // Content items (separator + links)
        if (data.contentItems.length > 0) {
            html += '<div class="nav-dropdown-separator"></div>';
            for (var j = 0; j < data.contentItems.length; j++) {
                var c = data.contentItems[j];
                html += '<a href="' + c.url + '" class="nav-dropdown-content-link" data-i18n-content="' + ctx + '.' + j + '">' + c.label + '</a>';
            }
        }
        
        html += '</div>';
        return html;
    }

    // — Build navigation HTML —
    var ctxData = CONTEXTS[activeContext];

    var navHTML = ''
        + '<nav role="navigation" aria-label="' + (activeContext === 'latam' ? 'Main navigation' : 'Navegação principal') + '">'
        // Logo
        + '  <a href="' + PAGE_URLS[activeContext] + '" class="logo" aria-label="Alavanka - Home">'
        + '    <img src="' + logoPath + '" alt="Alavanka" class="nav-logo-img">'
        + '  </a>'
        // Mobile CTA + hamburger
        + '  <div class="nav-mobile-right">'
        + '    <a href="' + (ctxData.ctaUrl.indexOf('http') === 0 ? ctxData.ctaUrl : ctxData.ctaUrl) + '" class="nav-cta nav-cta-mobile"'
        + (ctxData.ctaUrl.indexOf('http') === 0 ? ' target="_blank" rel="noopener noreferrer"' : '')
        + '>' + ctxData.ctaLabel + '</a>'
        + '    <button class="hamburger" id="hamburger" onclick="alavankaNav.toggleMenu()" aria-label="Menu" aria-expanded="false">'
        + '      <span></span><span></span><span></span>'
        + '    </button>'
        + '  </div>'
        // Nav links container
        + '  <div class="nav-links" id="navLinks">';

    // Build nav items for each context
    for (var k = 0; k < CTX_KEYS.length; k++) {
        var key = CTX_KEYS[k];
        var data = CONTEXTS[key];
        var isActive = key === activeContext;

        if (isActive) {
            // Expanded dropdown
            navHTML += ''
                + '    <div class="nav-dropdown nav-dropdown-active">'
                + '      <button class="nav-dropdown-trigger nav-trigger-active" data-ctx="' + key + '">'
                + '        <span>' + data.label + '</span> ' + chevronSvg
                + '      </button>'
                + buildDropdown(key)
                + '    </div>';
        } else {
            // Simple link
            navHTML += '    <a href="' + PAGE_URLS[key] + '" class="nav-ctx-link">' + data.label + '</a>';
        }
    }

    // Separator
    navHTML += '    <div class="nav-separator"></div>';

    // Contextual content link (Blog / Insights)
    navHTML += '    <a href="' + ctxData.contentUrl + '" class="nav-content-link">' + ctxData.contentLabel + '</a>';

    // Separator before CTA
    navHTML += '    <div class="nav-separator"></div>';

    // CTA (desktop)
    navHTML += '    <a href="' + ctxData.ctaUrl + '" class="nav-cta nav-cta-desktop"'
        + (ctxData.ctaUrl.indexOf('http') === 0 ? ' target="_blank" rel="noopener noreferrer"' : '')
        + '>' + ctxData.ctaLabel + ' →</a>';

    // Lang toggle (only for BR contexts)
    if (ctxData.langToggle) {
        navHTML += '    <button class="lang-toggle" id="langToggle" onclick="alavankaNav.toggleLang()">EN</button>';
    }

    // Mobile-only: contact + lang in sidebar footer
    navHTML += '    <div class="nav-mobile-footer">';
    navHTML += '      <div class="nav-mobile-contact-label">' + (activeContext === 'latam' ? 'Direct contact' : 'Contato direto') + '</div>';
    navHTML += '      <div class="nav-mobile-contact-row">';
    navHTML += '        <a href="https://calendly.com/carlos-andre-alavanka/30min" target="_blank" rel="noopener noreferrer" class="nav-contact-btn nav-contact-calendly">';
    navHTML += '          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    navHTML += '          Calendly</a>';
    navHTML += '        <a href="https://wa.me/5511975341961" target="_blank" rel="noopener noreferrer" class="nav-contact-btn nav-contact-whatsapp">';
    navHTML += '          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';
    navHTML += '          WhatsApp</a>';
    navHTML += '      </div>';
    if (ctxData.langToggle) {
        navHTML += '      <div class="nav-mobile-lang">';
        navHTML += '        <button class="nav-lang-btn nav-lang-active" onclick="alavankaNav.toggleLang()">PT</button>';
        navHTML += '        <button class="nav-lang-btn" onclick="alavankaNav.toggleLang()">EN</button>';
        navHTML += '      </div>';
    }
    navHTML += '    </div>';

    navHTML += '  </div>';
    navHTML += '  <div class="menu-overlay" id="menuOverlay" onclick="alavankaNav.closeMenu()"></div>';
    navHTML += '</nav>';

    // — Replace existing nav —
    var existingNav = document.getElementById('main-nav');
    if (existingNav) {
        existingNav.outerHTML = navHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    // — Navigation functions —
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
                var currentLang = (langBtn && langBtn.textContent === 'EN') ? 'en' : 'pt';
                var newLang = currentLang === 'pt' ? 'en' : 'pt';
                if (langBtn) langBtn.textContent = newLang === 'pt' ? 'EN' : 'PT';
                
                // Update mobile lang buttons
                var mobileLangBtns = document.querySelectorAll('.nav-lang-btn');
                mobileLangBtns.forEach(function (btn) {
                    var isPT = btn.textContent === 'PT';
                    var isEN = btn.textContent === 'EN';
                    if (newLang === 'en') {
                        btn.classList.toggle('nav-lang-active', isEN);
                    } else {
                        btn.classList.toggle('nav-lang-active', isPT);
                    }
                });
                
                window.dispatchEvent(new CustomEvent('langChange', { detail: { lang: newLang } }));
            }
        }
    };

    // — Desktop: hover to open dropdown —
    var dropdownEl = document.querySelector('.nav-dropdown-active');
    if (dropdownEl) {
        var menuEl = dropdownEl.querySelector('.nav-dropdown-menu');
        var hideTimeout;

        dropdownEl.addEventListener('mouseenter', function () {
            clearTimeout(hideTimeout);
            if (menuEl && window.innerWidth >= 1024) {
                menuEl.classList.add('visible');
            }
        });
        dropdownEl.addEventListener('mouseleave', function () {
            hideTimeout = setTimeout(function () {
                if (menuEl && window.innerWidth >= 1024) {
                    menuEl.classList.remove('visible');
                }
            }, 150);
        });
    }

    // — Mobile: tap trigger to toggle dropdown —
    var trigger = document.querySelector('.nav-dropdown-trigger');
    if (trigger) {
        trigger.addEventListener('click', function (e) {
            if (window.innerWidth < 1024) {
                e.preventDefault();
                var dd = this.closest('.nav-dropdown');
                if (dd) dd.classList.toggle('open');
            }
        });
    }

    // — Close menu on link click (mobile) —
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth < 1024) alavankaNav.closeMenu();
        });
    });

    // — Close menu on resize —
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            alavankaNav.closeMenu();
            var dd = document.querySelector('.nav-dropdown');
            if (dd) dd.classList.remove('open');
            var menu = document.querySelector('.nav-dropdown-menu');
            if (menu) menu.classList.remove('visible');
        }
    });

})();
