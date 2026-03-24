/* ============================================
   Alavanka — Unified Navigation Component v4
   
   UPDATED: 2026-03-11
   Need-based navigation:
   - 2 service paths: Startup Growth (PT) + Expand to LatAm (EN)
   - Active context (current page) gets expanded dropdown
   - Other service = simple link to its page
   - Entire nav switches language based on page context (PT vs EN)
   - Blog is always "Blog"
   - CTA changes per context (assessment / schedule call)
   - Lang toggle only on PT pages
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

    // — Build URLs based on depth —
    var indexUrl = basePath ? basePath + 'index.html' : 'index.html';
    var blogUrl = basePath ? basePath + 'blog.html' : 'blog.html';
    // MEP blog URL (market-entry/blog.html relative to current depth)
    var mepBlogUrl;
    if (basePath === '../../') {
        mepBlogUrl = '../market-entry/blog.html';
    } else if (basePath === '../') {
        mepBlogUrl = 'market-entry/blog.html';
    } else {
        mepBlogUrl = 'market-entry/blog.html';
    }
    var guiaUrl = basePath ? basePath + 'guia-crescimento-receita-b2b.html' : 'guia-crescimento-receita-b2b.html';
    var investidoresUrl = basePath ? basePath + 'investidores.html' : 'investidores.html';
    var marketEntryUrl = basePath ? basePath + 'market-entry.html' : 'market-entry.html';
    var assessmentUrl = basePath ? basePath + 'assessment.html' : 'assessment.html';
    var logoPath = basePath + 'assets/images/brand/logo-completo-navy.png';

    // — Detect current page context —
    var currentPath = window.location.pathname;
    var isMEPPage = currentPath.indexOf('market-entry') !== -1;
    var storedLang = sessionStorage.getItem('alavanka-lang');
    var isEN = isMEPPage || (!isMEPPage && storedLang === 'en');
    var context = isEN ? 'en' : 'pt';

    // Page detection for active state + anchor links
    var isIndex = currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('.com.br') || currentPath.endsWith('.com.br/');
    var isInvestidores = currentPath.indexOf('investidor') !== -1;
    var isMEP = currentPath.indexOf('market-entry') !== -1;
    var isBlog = currentPath.indexOf('blog') !== -1;
    var isAssessment = currentPath.indexOf('assessment') !== -1;
    var isGuia = currentPath.indexOf('guia-fractional') !== -1 || currentPath.indexOf('guia-crescimento') !== -1;

    // Which service page are we on?
    var onStartupGrowthPage = isIndex || isInvestidores || isAssessment || isGuia;
    var onExpandLatAmPage = isMEP;

    // — Context definitions —
    var NAV_CONFIG = {
        pt: {
            startupGrowth: {
                label: 'Startup Growth',
                page: indexUrl,
                hasDropdown: onStartupGrowthPage,
                sections: [
                    { label: 'Problema', anchor: 'problema', page: indexUrl },
                    { label: 'Solu\u00e7\u00e3o', anchor: 'solucao', page: indexUrl },
                    { label: 'Como', anchor: 'como', page: indexUrl },
                    { label: 'Para quem', anchor: 'fit', page: indexUrl },
                    { label: 'Por que Alavanka', anchor: 'porque', page: indexUrl }
                ],
                extraItems: [
                    { label: 'Blog', url: blogUrl },
                    { label: 'Guia Crescimento', url: guiaUrl },
                    { label: 'Fundos/VCs', url: investidoresUrl },
                    { label: 'Expandir p/ LatAm', url: marketEntryUrl }
                ]
            },
            expandLatAm: {
                label: 'Expandir p/ LatAm',
                page: marketEntryUrl,
                hasDropdown: false
            },
            blog: { label: 'Blog', url: blogUrl },
            cta: {
                label: 'Diagn\u00f3stico Gratuito \u2192',
                url: assessmentUrl,
                isExternal: false
            },
            langToggle: true,
            ariaLabel: 'Navega\u00e7\u00e3o principal',
            contactLabel: 'Contato direto'
        },
        en: {
            startupGrowth: {
                label: 'Startup Growth',
                page: indexUrl,
                hasDropdown: onStartupGrowthPage,
                sections: [
                    { label: 'Problem', anchor: 'problema', page: indexUrl },
                    { label: 'Solution', anchor: 'solucao', page: indexUrl },
                    { label: 'How', anchor: 'como', page: indexUrl },
                    { label: 'Who', anchor: 'fit', page: indexUrl },
                    { label: 'Why Alavanka', anchor: 'porque', page: indexUrl }
                ],
                extraItems: [
                    { label: 'Blog', url: mepBlogUrl },
                    { label: 'Growth Guide', url: guiaUrl },
                    { label: 'VCs', url: investidoresUrl },
                    { label: 'Expand to LatAm', url: marketEntryUrl }
                ]
            },
            expandLatAm: {
                label: 'Expand to LatAm',
                page: marketEntryUrl,
                hasDropdown: onExpandLatAmPage,
                sections: [
                    { label: 'The Challenge', anchor: 'the-problem', page: marketEntryUrl },
                    { label: 'BOT vs Traditional', anchor: 'comparison', page: marketEntryUrl },
                    { label: '4-Year Journey', anchor: 'the-model', page: marketEntryUrl },
                    { label: 'From Call to Ownership', anchor: 'process', page: marketEntryUrl },
                    { label: 'Our Team', anchor: 'team', page: marketEntryUrl },
                    { label: 'FAQ', anchor: 'faq', page: marketEntryUrl }
                ],
                extraItems: []
            },
            blog: { label: 'Blog', url: mepBlogUrl },
            cta: {
                label: 'Schedule Call \u2192',
                url: 'https://calendly.com/carlos-andre-alavanka/30min',
                isExternal: true
            },
            langToggle: true,
            ariaLabel: 'Main navigation',
            contactLabel: 'Direct contact'
        }
    };

    var cfg = NAV_CONFIG[context];

    // — Chevron SVG —
    var chevronSvg = '<svg class="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

    // — Section link builder —
    function buildSectionUrl(section) {
        var samePageAsSection = false;
        if (section.page === indexUrl && isIndex) samePageAsSection = true;
        if (section.page === marketEntryUrl && isMEP) samePageAsSection = true;
        if (section.page === investidoresUrl && isInvestidores) samePageAsSection = true;
        if (samePageAsSection) return '#' + section.anchor;
        return section.page + '#' + section.anchor;
    }

    // — Build dropdown HTML —
    function buildDropdown(serviceConfig, activeContext) {
        var html = '<div class="nav-dropdown-menu">';
        // Sections — sem link Ir para página
        if (serviceConfig.sections) {
            for (var i = 0; i < serviceConfig.sections.length; i++) {
                var s = serviceConfig.sections[i];
                html += '<a href="' + buildSectionUrl(s) + '">' + s.label + '</a>';
            }
        }
        // Extra items — separador só antes do último
        if (serviceConfig.extraItems && serviceConfig.extraItems.length > 0) {
            for (var j = 0; j < serviceConfig.extraItems.length; j++) {
                var item = serviceConfig.extraItems[j];
                if (j === serviceConfig.extraItems.length - 1) {
                    html += '<div class="nav-dropdown-separator"></div>';
                }
                html += '<a href="' + item.url + '" class="nav-dropdown-content-link">' + item.label + '</a>';
            }
        }
        html += '</div>';
        return html;
    }

    // — Build a nav item —
    function buildNavItem(serviceConfig, isActiveService, activeContext) {
        var _ctx = activeContext !== undefined ? activeContext : context;

        if (serviceConfig.hasDropdown && isActiveService) {
            var flat = '';
            if (serviceConfig.sections) {
                for (var si = 0; si < serviceConfig.sections.length; si++) {
                    var sec = serviceConfig.sections[si];
                    flat += '<a href="' + buildSectionUrl(sec) + '" class="nav-flat-link">' + sec.label + '</a>';
                }
            }
            // Accordion mobile oculto no desktop via .nav-mobile-only
            flat += '<div class="nav-dropdown nav-dropdown-active nav-mobile-only">'
                 +  '  <button class="nav-dropdown-trigger nav-trigger-active">'
                 +  '    <span>' + serviceConfig.label + '</span> ' + chevronSvg
                 +  '  </button>'
                 +  buildDropdown(serviceConfig, _ctx)
                 +  '</div>';
            return flat;
        }

        if (!isActiveService && serviceConfig === cfg.expandLatAm) {
            return '<a href="' + serviceConfig.page + '" class="nav-latam-badge">' + serviceConfig.label + '</a>';
        }

        return '<a href="' + serviceConfig.page + '" class="nav-ctx-link">' + serviceConfig.label + '</a>';
    }

    // — Build and inject nav HTML —
    function buildAndInjectNav(activeCfg, activeContext) {
        var cfg = activeCfg;
        var context = activeContext;
        var ctaTarget = cfg.cta.isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    var navHTML = ''
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
        // Contexto market-entry: itens flat do MEP + sep + badge Startup Growth
        if (cfg.expandLatAm.sections) {
            for (var mi = 0; mi < cfg.expandLatAm.sections.length; mi++) {
                var ms = cfg.expandLatAm.sections[mi];
                navHTML += '<a href="' + buildSectionUrl(ms) + '" class="nav-flat-link">' + ms.label + '</a>';
                // Mobile version
                navHTML += '<a href="' + buildSectionUrl(ms) + '" class="nav-ctx-link nav-desktop-hide">' + ms.label + '</a>';
            }
        }
        navHTML += '<div class="nav-separator"></div>';
        navHTML += '<a href="' + indexUrl + '" class="nav-latam-badge">Startup Growth</a>';
        navHTML += '<a href="' + indexUrl + '" class="nav-ctx-link nav-desktop-hide">Startup Growth</a>';
    } else {
        // Contexto Startup Growth: anchors + Blog + Guia + sep + Fundos/VCs + sep + badge LatAm
        navHTML += buildNavItem(cfg.startupGrowth, onStartupGrowthPage, context);
        // Desktop: flat links
        navHTML += '<a href="' + cfg.blog.url + '" class="nav-flat-link">' + cfg.blog.label + '</a>';
        var guiaLabel = context === 'en' ? 'Growth Guide' : 'Guia Crescimento';
        navHTML += '<a href="' + guiaUrl + '" class="nav-flat-link">' + guiaLabel + '</a>';
        navHTML += '<div class="nav-separator"></div>';
        var vcsLabel = context === 'en' ? 'VCs' : 'Fundos/VCs';
        navHTML += '<a href="' + investidoresUrl + '" class="nav-vcs-link">' + vcsLabel + '</a>';
        navHTML += '<div class="nav-separator"></div>';
        navHTML += buildNavItem(cfg.expandLatAm, onExpandLatAmPage, context);

    }

    // Lang toggle — always on non-MEP pages, label shows what you switch TO
    if (!isMEPPage) {
        var _curLang = sessionStorage.getItem('alavanka-lang') || 'pt';
        var _toggleLabel = _curLang === 'pt' ? 'EN' : 'PT';
        navHTML += '<button class="lang-toggle" id="langToggle" onclick="alavankaNav.toggleLang()">' + _toggleLabel + '</button>';
    }

    // Mobile-only: contact + lang in sidebar footer
    navHTML += '<div class="nav-mobile-footer">';
    navHTML += '  <div class="nav-mobile-contact-label">' + cfg.contactLabel + '</div>';
    navHTML += '  <div class="nav-mobile-contact-row">';
    navHTML += '    <a href="https://calendly.com/carlos-andre-alavanka/30min" target="_blank" rel="noopener noreferrer" class="nav-contact-btn nav-contact-calendly">';
    navHTML += '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    navHTML += '      Calendly</a>';
    navHTML += '    <a href="https://wa.me/5511975341961" target="_blank" rel="noopener noreferrer" class="nav-contact-btn nav-contact-whatsapp">';
    navHTML += '      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';
    navHTML += '      WhatsApp</a>';
    navHTML += '  </div>';
    if (!isMEPPage) {
        var _mobLang = sessionStorage.getItem('alavanka-lang') || 'pt';
        navHTML += '  <div class="nav-mobile-lang">';
        navHTML += '    <button class="nav-lang-btn' + (_mobLang === 'pt' ? ' nav-lang-active' : '') + '" onclick="alavankaNav.toggleLang()">PT</button>';
        navHTML += '    <button class="nav-lang-btn' + (_mobLang === 'en' ? ' nav-lang-active' : '') + '" onclick="alavankaNav.toggleLang()">EN</button>';
        navHTML += '  </div>';
    }
    navHTML += '</div>';

    navHTML += '  </div>';
    navHTML += '  <div class="menu-overlay" id="menuOverlay" onclick="alavankaNav.closeMenu()"></div>';
    navHTML += '</nav>';

        // — Inject —
        var existingNav = document.querySelector('nav[role="navigation"]') || document.getElementById('main-nav');
        if (existingNav) {
            existingNav.outerHTML = navHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', navHTML);
        }
        // Re-bind all event listeners after re-render
        var _dd = document.querySelector('.nav-dropdown-active');
        if (_dd) {
            var _menu = _dd.querySelector('.nav-dropdown-menu');
            var _ht;
            if (_menu) {
                _dd.addEventListener('mouseenter', function () {
                    clearTimeout(_ht);
                    if (window.innerWidth >= 1024) _menu.classList.add('visible');
                });
                _dd.addEventListener('mouseleave', function () {
                    _ht = setTimeout(function () {
                        if (_menu && window.innerWidth >= 1024) _menu.classList.remove('visible');
                    }, 150);
                });
            }
            document.querySelectorAll('.nav-dropdown-trigger').forEach(function (t) {
                t.addEventListener('click', function (e) {
                    if (window.innerWidth < 1024) {
                        e.preventDefault();
                        var dd = this.closest('.nav-dropdown');
                        if (dd) dd.classList.toggle('open');
                    }
                });
            });
        }
        document.querySelectorAll('.nav-links a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth < 1024 && window.alavankaNav) alavankaNav.closeMenu();
            });
        });
    }

    // Initial render
    buildAndInjectNav(cfg, context);

    // — Listen for language change and re-render nav —
    window.addEventListener('langChange', function (e) {
        if (!e.detail || !e.detail.lang) return;
        if (isMEPPage) return; // MEP pages are always EN
        var newContext = e.detail.lang;
        var newCfg = NAV_CONFIG[newContext];
        if (!newCfg) return;
        buildAndInjectNav(newCfg, newContext);
    });

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
            var currentLang = sessionStorage.getItem('alavanka-lang') || 'pt';
            var newLang = currentLang === 'pt' ? 'en' : 'pt';
            sessionStorage.setItem('alavanka-lang', newLang);
            var langBtn = document.getElementById('langToggle');
            if (langBtn) langBtn.textContent = newLang === 'pt' ? 'EN' : 'PT';
            
            var mobileLangBtns = document.querySelectorAll('.nav-lang-btn');
            mobileLangBtns.forEach(function (btn) {
                var isPT = btn.textContent === 'PT';
                var isENBtn = btn.textContent === 'EN';
                if (newLang === 'en') {
                    btn.classList.toggle('nav-lang-active', isENBtn);
                } else {
                    btn.classList.toggle('nav-lang-active', isPT);
                }
            });
            
            window.dispatchEvent(new CustomEvent('langChange', { detail: { lang: newLang } }));
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
    document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            if (window.innerWidth < 1024) {
                e.preventDefault();
                var dd = this.closest('.nav-dropdown');
                if (dd) dd.classList.toggle('open');
            }
        });
    });

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
