/**
 * ALAVANKA UX ENHANCEMENTS v3.0
 * Interactive behaviors for improved engagement
 * AUDIT DATE: 2026-02-06
 * PRIORITIES: P0 + P1 implemented
 */

(function() {
    'use strict';
    
    // ===== UTILITY FUNCTIONS =====
    
    /**
     * Cookie management
     */
    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
    }
    
    function getCookie(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    /**
     * Debounce function for performance
     */
    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Check if element is in viewport
     */
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
    
    // ===== P0-1: IMPROVED AUDIENCE GATE =====
    
    function initAudienceGate() {
        var gate = document.querySelector('.audience-gate');
        if (!gate) return;
        
        // Check if should show gate
        function shouldShowGate() {
            // Check localStorage
            var localPref = localStorage.getItem('alavanka-audience');
            if (localPref) return false;
            
            // Check cookie (7-day persistence)
            var cookiePref = getCookie('alavanka-pref');
            if (cookiePref) return false;
            
            // Check if returning from same domain
            var referrer = document.referrer;
            if (referrer && referrer.indexOf('alavanka.com') !== -1) return false;
            
            return true;
        }
        
        // Show gate if needed
        if (shouldShowGate()) {
            // Remove skip class if present
            document.documentElement.classList.remove('gate-skip');
            
            // Show gate with slight delay for smooth entrance
            setTimeout(function() {
                gate.classList.add('visible');
            }, 100);
        } else {
            // Add skip class to prevent flash
            document.documentElement.classList.add('gate-skip');
        }
        
        // Handle gate choice
        var founderBtn = gate.querySelector('[data-choice="founder"]');
        var investorBtn = gate.querySelector('[data-choice="investidor"]');
        var skipLink = gate.querySelector('.gate-skip-link');
        
        function handleChoice(choice) {
            // Store preference (dual storage for redundancy)
            localStorage.setItem('alavanka-audience', choice);
            setCookie('alavanka-pref', choice, 7); // 7 days
            
            // Hide gate
            gate.classList.remove('visible');
            
            // Scroll to relevant section if investor
            if (choice === 'investidor') {
                setTimeout(function() {
                    var investorSection = document.getElementById('investidores');
                    if (investorSection) {
                        investorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            }
            
            // Track in analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'audience_selected', {
                    'event_category': 'engagement',
                    'event_label': choice
                });
            }
        }
        
        if (founderBtn) {
            founderBtn.addEventListener('click', function() {
                handleChoice('founder');
            });
        }
        
        if (investorBtn) {
            investorBtn.addEventListener('click', function() {
                handleChoice('investidor');
            });
        }
        
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                handleChoice('skip');
            });
        }
    }
    
    // ===== P0-2: SCROLL PROGRESS INDICATOR =====
    
    function initScrollProgress() {
        var progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            // Create if doesn't exist
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            document.body.appendChild(progressBar);
        }
        
        function updateProgress() {
            var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        }
        
        window.addEventListener('scroll', debounce(updateProgress, 10));
        updateProgress(); // Initial call
    }
    
    // ===== P0-3: MOBILE STICKY CTA =====
    
    function initMobileStickyCTA() {
        // Only on mobile
        if (window.innerWidth >= 768) return;
        
        var stickyCTA = document.querySelector('.mobile-sticky-cta');
        if (!stickyCTA) return;
        
        var heroSection = document.querySelector('.hero-section');
        var showThreshold = heroSection ? heroSection.offsetHeight - 200 : 500;
        
        function updateStickyVisibility() {
            var scrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollY > showThreshold) {
                stickyCTA.classList.add('visible');
                document.body.classList.add('sticky-cta-active');
            } else {
                stickyCTA.classList.remove('visible');
                document.body.classList.remove('sticky-cta-active');
            }
        }
        
        window.addEventListener('scroll', debounce(updateStickyVisibility, 50));
        updateStickyVisibility(); // Initial check
        
        // Track CTA clicks
        var ctaBtn = stickyCTA.querySelector('.btn-mobile-primary');
        if (ctaBtn && typeof gtag !== 'undefined') {
            ctaBtn.addEventListener('click', function() {
                gtag('event', 'click', {
                    'event_category': 'cta',
                    'event_label': 'mobile_sticky_cta'
                });
            });
        }
    }
    
    // ===== P1-1: CTA IDLE PULSE ANIMATION =====
    
    function initCTAPulse() {
        var heroCTA = document.querySelector('.btn-hero-primary');
        if (!heroCTA) return;
        
        var idleTime = 0;
        var idleInterval;
        
        // Reset idle timer on any user activity
        function resetIdleTimer() {
            idleTime = 0;
            heroCTA.classList.remove('idle-pulse');
        }
        
        // Increment idle time
        function incrementIdleTime() {
            idleTime++;
            if (idleTime >= 5) { // 5 seconds of inactivity
                heroCTA.classList.add('idle-pulse');
            }
        }
        
        // Start idle detection
        idleInterval = setInterval(incrementIdleTime, 1000);
        
        // Reset on user activity
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('keypress', resetIdleTimer);
        document.addEventListener('scroll', resetIdleTimer);
        document.addEventListener('touchstart', resetIdleTimer);
        
        // Stop pulse on CTA interaction
        heroCTA.addEventListener('mouseenter', resetIdleTimer);
        heroCTA.addEventListener('click', resetIdleTimer);
    }
    
    // ===== P1-2: TRUST TICKER ROTATION =====
    
    function initTrustTicker() {
        var ticker = document.querySelector('.trust-ticker');
        if (!ticker) return;
        
        var items = ticker.querySelectorAll('.ticker-item');
        if (items.length === 0) return;
        
        var currentIndex = 0;
        
        // Show first item
        items[0].classList.add('active');
        
        // Rotate every 3 seconds
        setInterval(function() {
            items[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].classList.add('active');
        }, 3000);
    }
    
    // ===== P1-3: PROGRESSIVE DISCLOSURE =====
    
    function initProgressiveDisclosure() {
        var expandTriggers = document.querySelectorAll('.expand-trigger');
        
        expandTriggers.forEach(function(trigger) {
            trigger.addEventListener('click', function() {
                var targetId = this.getAttribute('data-expand');
                var target = document.getElementById(targetId);
                
                if (!target) return;
                
                // Toggle expanded state
                if (target.classList.contains('expanded')) {
                    target.classList.remove('expanded');
                    this.classList.remove('expanded');
                    this.textContent = this.textContent.replace('Ocultar', 'Ver mais');
                } else {
                    target.classList.add('expanded');
                    this.classList.add('expanded');
                    this.textContent = this.textContent.replace('Ver mais', 'Ocultar');
                }
                
                // Track in analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'expand_content', {
                        'event_category': 'engagement',
                        'event_label': targetId
                    });
                }
            });
        });
    }
    
    // ===== P1-4: SCROLL-TRIGGERED REVEALS =====
    
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
        
        // Check on scroll
        window.addEventListener('scroll', debounce(checkReveals, 100));
        
        // Initial check
        checkReveals();
    }
    
    // ===== P1-5: FAQ AUTO-OPEN FIRST QUESTION =====
    
    function initFAQAutoOpen() {
        var firstFAQ = document.querySelector('.faq-item:first-child');
        if (!firstFAQ) return;
        
        var question = firstFAQ.querySelector('.faq-question');
        var answer = firstFAQ.querySelector('.faq-answer');
        
        if (!question || !answer) return;
        
        // Auto-open first FAQ
        firstFAQ.classList.add('active');
        var content = answer.querySelector('.faq-answer-content');
        if (content) {
            answer.style.maxHeight = content.scrollHeight + 'px';
        }
        
        // Add click handlers to all FAQ questions
        var faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(function(q) {
            q.addEventListener('click', function() {
                var item = this.closest('.faq-item');
                var answerEl = item.querySelector('.faq-answer');
                var contentEl = answerEl.querySelector('.faq-answer-content');
                
                // Toggle active state
                var isActive = item.classList.contains('active');
                
                if (isActive) {
                    item.classList.remove('active');
                    answerEl.style.maxHeight = null;
                } else {
                    // Close all other FAQs
                    document.querySelectorAll('.faq-item.active').forEach(function(activeItem) {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                            var activeAnswer = activeItem.querySelector('.faq-answer');
                            activeAnswer.style.maxHeight = null;
                        }
                    });
                    
                    // Open clicked FAQ
                    item.classList.add('active');
                    answerEl.style.maxHeight = contentEl.scrollHeight + 'px';
                }
                
                // Track in analytics
                if (typeof gtag !== 'undefined' && !isActive) {
                    var questionText = this.textContent.trim().substring(0, 50);
                    gtag('event', 'faq_open', {
                        'event_category': 'engagement',
                        'event_label': questionText
                    });
                }
            });
        });
    }
    
    // ===== P2: EXIT INTENT DETECTION (DESKTOP ONLY) =====
    
    function initExitIntent() {
        // Only on desktop
        if (window.innerWidth < 1024) return;
        
        var hasShownExitIntent = sessionStorage.getItem('exit-intent-shown');
        if (hasShownExitIntent) return;
        
        var exitModal = document.querySelector('.exit-intent-modal');
        if (!exitModal) return; // Modal must exist in HTML
        
        var threshold = 50; // pixels from top
        
        document.addEventListener('mouseleave', function(e) {
            if (e.clientY <= threshold && !hasShownExitIntent) {
                exitModal.classList.add('visible');
                sessionStorage.setItem('exit-intent-shown', 'true');
                
                // Track
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'exit_intent_triggered', {
                        'event_category': 'engagement'
                    });
                }
            }
        });
        
        // Close modal handlers
        var closeBtn = exitModal.querySelector('.exit-intent-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                exitModal.classList.remove('visible');
            });
        }
        
        // Click outside to close
        exitModal.addEventListener('click', function(e) {
            if (e.target === exitModal) {
                exitModal.classList.remove('visible');
            }
        });
    }
    
    // ===== ACCESSIBILITY ENHANCEMENTS =====
    
    function initAccessibility() {
        // Trap focus in modals when open
        var modals = document.querySelectorAll('.audience-gate, .exit-intent-modal');
        
        modals.forEach(function(modal) {
            modal.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('visible')) {
                    modal.classList.remove('visible');
                }
                
                // Tab trap
                if (e.key === 'Tab') {
                    var focusableElements = modal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
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
        
        // Announce dynamic content changes to screen readers
        function announceToScreenReader(message) {
            var announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            
            setTimeout(function() {
                document.body.removeChild(announcement);
            }, 1000);
        }
        
        // Expose for use by other functions
        window.announceToScreenReader = announceToScreenReader;
    }
    
    // ===== PERFORMANCE MONITORING =====
    
    function initPerformanceMonitoring() {
        if (typeof gtag === 'undefined') return;
        
        // Core Web Vitals tracking
        if ('PerformanceObserver' in window) {
            // LCP (Largest Contentful Paint)
            var lcpObserver = new PerformanceObserver(function(entryList) {
                var entries = entryList.getEntries();
                var lastEntry = entries[entries.length - 1];
                
                gtag('event', 'web_vitals', {
                    'event_category': 'performance',
                    'event_label': 'LCP',
                    'value': Math.round(lastEntry.renderTime || lastEntry.loadTime)
                });
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // Silently fail if not supported
            }
            
            // FID (First Input Delay)
            var fidObserver = new PerformanceObserver(function(entryList) {
                var entries = entryList.getEntries();
                entries.forEach(function(entry) {
                    gtag('event', 'web_vitals', {
                        'event_category': 'performance',
                        'event_label': 'FID',
                        'value': Math.round(entry.processingStart - entry.startTime)
                    });
                });
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // Silently fail if not supported
            }
        }
    }
    
    // ===== INITIALIZATION =====
    
    function init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        // Initialize all modules
        initAudienceGate();
        initScrollProgress();
        initMobileStickyCTA();
        initCTAPulse();
        initTrustTicker();
        initProgressiveDisclosure();
        initScrollReveals();
        initFAQAutoOpen();
        initExitIntent();
        initAccessibility();
        initPerformanceMonitoring();
        
        // Re-initialize mobile CTA on resize (debounced)
        window.addEventListener('resize', debounce(function() {
            initMobileStickyCTA();
        }, 250));
    }
    
    // Start initialization
    init();
    
})();
