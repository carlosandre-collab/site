/**
 * ALAVANKA UX ENHANCEMENTS v4.0 (Fixed)
 * Interactive behaviors for improved engagement
 * 
 * CHANGES from v3.0:
 * - REMOVED: initScrollProgress (handled by inline script in each page)
 * - REMOVED: initMobileStickyCTA (handled by inline script in each page)
 * - REMOVED: initFAQAutoOpen (conflicts with inline onclick handlers)
 * - REMOVED: initExitIntent (handled by inline script in index.html)
 * - FIXED: initAudienceGate selectors (data-choice → data-audience)
 * - KEPT: initCTAPulse, initTrustTicker, initProgressiveDisclosure,
 *         initScrollReveals, initAccessibility, initPerformanceMonitoring
 */

(function() {
    'use strict';
    
    // ===== UTILITY FUNCTIONS =====
    
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
    
    function isInViewport(element, offset) {
        offset = offset || 0;
        var rect = element.getBoundingClientRect();
        return (
            rect.top >= offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // ===== CTA IDLE PULSE ANIMATION =====
    
    function initCTAPulse() {
        var heroCTA = document.querySelector('.btn-hero');
        if (!heroCTA) return;
        
        var idleTime = 0;
        
        function resetIdleTimer() {
            idleTime = 0;
            heroCTA.classList.remove('idle-pulse');
        }
        
        setInterval(function() {
            idleTime++;
            if (idleTime >= 5) {
                heroCTA.classList.add('idle-pulse');
            }
        }, 1000);
        
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('keypress', resetIdleTimer);
        document.addEventListener('scroll', resetIdleTimer);
        document.addEventListener('touchstart', resetIdleTimer);
        
        heroCTA.addEventListener('mouseenter', resetIdleTimer);
        heroCTA.addEventListener('click', resetIdleTimer);
    }
    
    // ===== TRUST TICKER ROTATION =====
    
    function initTrustTicker() {
        var ticker = document.querySelector('.trust-ticker');
        if (!ticker) return;
        
        var items = ticker.querySelectorAll('.ticker-item');
        if (items.length === 0) return;
        
        var currentIndex = 0;
        items[0].classList.add('active');
        
        setInterval(function() {
            items[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].classList.add('active');
        }, 3000);
    }
    
    // ===== PROGRESSIVE DISCLOSURE =====
    
    function initProgressiveDisclosure() {
        var expandTriggers = document.querySelectorAll('.expand-trigger');
        
        expandTriggers.forEach(function(trigger) {
            trigger.addEventListener('click', function() {
                var targetId = this.getAttribute('data-expand');
                var target = document.getElementById(targetId);
                if (!target) return;
                
                if (target.classList.contains('expanded')) {
                    target.classList.remove('expanded');
                    this.classList.remove('expanded');
                    this.textContent = this.textContent.replace('Ocultar', 'Ver mais');
                } else {
                    target.classList.add('expanded');
                    this.classList.add('expanded');
                    this.textContent = this.textContent.replace('Ver mais', 'Ocultar');
                }
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'expand_content', {
                        'event_category': 'engagement',
                        'event_label': targetId
                    });
                }
            });
        });
    }
    
    // ===== SCROLL-TRIGGERED REVEALS =====
    
    function initScrollReveals() {
        var revealElements = document.querySelectorAll('[data-reveal]');
        if (revealElements.length === 0) return;
        
        function checkReveals() {
            revealElements.forEach(function(element) {
                if (isInViewport(element, -100)) {
                    element.classList.add('revealed');
                }
            });
        }
        
        window.addEventListener('scroll', debounce(checkReveals, 100));
        checkReveals();
    }
    
    // ===== ACCESSIBILITY ENHANCEMENTS =====
    
    function initAccessibility() {
        var modals = document.querySelectorAll('.audience-gate, .exit-modal');
        
        modals.forEach(function(modal) {
            modal.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && (modal.classList.contains('visible') || modal.classList.contains('active'))) {
                    modal.classList.remove('visible');
                    modal.classList.remove('active');
                }
                
                if (e.key === 'Tab') {
                    var focusableElements = modal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    if (focusableElements.length === 0) return;
                    var firstElement = focusableElements[0];
                    var lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey && document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            });
        });
    }
    
    // ===== PERFORMANCE MONITORING =====
    
    function initPerformanceMonitoring() {
        if (typeof gtag === 'undefined') return;
        if (!('PerformanceObserver' in window)) return;
        
        try {
            new PerformanceObserver(function(entryList) {
                var entries = entryList.getEntries();
                var lastEntry = entries[entries.length - 1];
                gtag('event', 'web_vitals', {
                    'event_category': 'performance',
                    'event_label': 'LCP',
                    'value': Math.round(lastEntry.renderTime || lastEntry.loadTime)
                });
            }).observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) { /* Not supported */ }
        
        try {
            new PerformanceObserver(function(entryList) {
                entryList.getEntries().forEach(function(entry) {
                    gtag('event', 'web_vitals', {
                        'event_category': 'performance',
                        'event_label': 'FID',
                        'value': Math.round(entry.processingStart - entry.startTime)
                    });
                });
            }).observe({ entryTypes: ['first-input'] });
        } catch (e) { /* Not supported */ }
    }
    
    // ===== INITIALIZATION =====
    
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        initCTAPulse();
        initTrustTicker();
        initProgressiveDisclosure();
        initScrollReveals();
        initAccessibility();
        initPerformanceMonitoring();
    }
    
    init();
    
})();
