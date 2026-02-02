/**
 * Alavanka — Blog Article GA4 Tracking (Tags 27-30)
 * Include in all blog/posts/*.html and pillar pages.
 * Requires gtag.js loaded in <head>.
 *
 * Reads article metadata from:
 *   <meta name="article:slug" content="...">       (optional, falls back to URL)
 *   <meta name="article:category" content="...">   (optional)
 *   <html lang="pt-BR|en">                         (language)
 */
(function() {
    if (typeof gtag !== 'function') return;

    // --- Extract article metadata ---
    var slugMeta = document.querySelector('meta[name="article:slug"]');
    var catMeta = document.querySelector('meta[name="article:category"]');
    var lang = (document.documentElement.lang || 'pt-BR').substring(0, 2);

    // Fallback slug from URL: /blog/posts/my-article.html → my-article
    var slug = '';
    if (slugMeta && slugMeta.content) {
        slug = slugMeta.content;
    } else {
        var path = window.location.pathname;
        var match = path.match(/\/([^\/]+)\.html?$/);
        slug = match ? match[1] : path;
    }

    var category = (catMeta && catMeta.content) ? catMeta.content : '';

    // --- Tag 27: article_viewed (on page load) ---
    gtag('event', 'article_viewed', {
        article_slug: slug,
        category: category,
        language: lang
    });

    // --- Tag 28: article_scroll_depth (25%, 50%, 75%, 100%) ---
    var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };

    window.addEventListener('scroll', function() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        var percent = Math.round((scrollTop / docHeight) * 100);

        [25, 50, 75, 100].forEach(function(milestone) {
            if (percent >= milestone && !scrollMilestones[milestone]) {
                scrollMilestones[milestone] = true;
                gtag('event', 'article_scroll_depth', {
                    article_slug: slug,
                    depth: milestone
                });
            }
        });
    }, { passive: true });

    // --- Tag 29: article_cta_click (clicks on CTAs within article) ---
    function closestLink(el) {
        while (el && el.tagName !== 'A') el = el.parentElement;
        return el;
    }

    document.addEventListener('click', function(e) {
        var link = closestLink(e.target);
        if (!link) return;

        var href = (link.getAttribute('href') || '').toLowerCase();
        var cls = ' ' + (link.className || '') + ' ';

        // Determine CTA type
        var ctaType = null;
        if (href.indexOf('calendly') !== -1) {
            ctaType = 'calendly';
        } else if (href.indexOf('wa.me') !== -1) {
            ctaType = 'whatsapp';
        } else if (href.indexOf('assessment') !== -1) {
            ctaType = 'assessment';
        } else if (href.indexOf('guia.alavanka') !== -1 || href.indexOf('.pdf') !== -1) {
            ctaType = 'download';
        } else if (href.indexOf('mailto:') !== -1 || href.indexOf('email-protection') !== -1) {
            ctaType = 'email';
        }

        if (!ctaType) return;

        // Determine position: inline (within article body) vs bottom (end CTA box)
        var isInCta = link.closest('.cta-box, .cta-inline, .article-cta, .cta-final-section, .author-cta');
        var position = isInCta ? 'bottom_cta' : 'inline';

        gtag('event', 'article_cta_click', {
            article_slug: slug,
            cta_type: ctaType,
            cta_position: position
        });
    });

    // --- Tag 30: article_language_switch (click on hreflang alternate) ---
    var altLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    var currentUrl = window.location.href.split('?')[0].split('#')[0];

    // Find the alternate language URL
    var altUrl = null;
    var altLang = null;
    altLinks.forEach(function(link) {
        var linkHref = link.href.split('?')[0].split('#')[0];
        if (linkHref !== currentUrl) {
            altUrl = linkHref;
            altLang = link.hreflang;
        }
    });

    // Listen for clicks on any link that points to the alternate version
    if (altUrl) {
        document.addEventListener('click', function(e) {
            var link = closestLink(e.target);
            if (!link) return;
            var linkHref = (link.href || '').split('?')[0].split('#')[0];
            if (linkHref === altUrl) {
                gtag('event', 'article_language_switch', {
                    from_lang: lang,
                    to_lang: altLang || (lang === 'pt' ? 'en' : 'pt')
                });
            }
        });
    }
})();
