/* ============================================
   Alavanka — Unified Footer Component
   
   CREATED: 2026-02-15
   - Shared footer injected on all pages
   - Dual context: BR / MEP
   - Cross-links between sections
   - Usage: <footer id="main-footer"></footer>
   ============================================ */

(function () {
    'use strict';

    // — Detect page depth (same logic as nav.js) —
    var scripts = document.getElementsByTagName('script');
    var basePath = '';
    
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src || '';
        if (src.indexOf('components/footer.js') !== -1) {
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

    // — Detect context —
    var currentPath = window.location.pathname;
    var isMEP = currentPath.indexOf('/market-entry') !== -1;

    // — Build URLs —
    var indexUrl = basePath + 'index.html';
    var blogUrl = basePath + 'blog.html';
    var guiaUrl = basePath + 'guia-fractional-cro-brasil.html';
    var marketEntryUrl = basePath + 'market-entry.html';
    var assessmentUrl = basePath + 'assessment.html';
    var investidoresUrl = basePath + 'investidores.html';
    var logoPath = basePath + 'assets/images/brand/logo-completo-branco.png';

    // MEP blog URL
    var mepBlogUrl;
    if (basePath === '../../') {
        mepBlogUrl = '../blog.html';
    } else if (basePath === '../') {
        mepBlogUrl = 'blog.html';
    } else {
        mepBlogUrl = 'market-entry/blog.html';
    }

    var footerHTML;

    if (isMEP) {
        // ========== MEP FOOTER (English) ==========
        footerHTML = ''
            + '<footer class="site-footer">'
            + '  <div class="footer-container">'
            + '    <div class="footer-top">'
            + '      <div class="footer-brand-col">'
            + '        <img src="' + logoPath + '" alt="Alavanka" class="footer-logo">'
            + '        <p class="footer-tagline">Market Entry Partnership for B2B Tech companies expanding into Latin America.</p>'
            + '      </div>'
            + '      <div class="footer-links-col">'
            + '        <div class="footer-group">'
            + '          <h4>Partnership</h4>'
            + '          <a href="' + marketEntryUrl + '#the-problem">The Challenge</a>'
            + '          <a href="' + marketEntryUrl + '#the-model">4-Year Model</a>'
            + '          <a href="' + marketEntryUrl + '#process">Framework</a>'
            + '          <a href="' + marketEntryUrl + '#team">Team</a>'
            + '        </div>'
            + '        <div class="footer-group">'
            + '          <h4>Resources</h4>'
            + '          <a href="' + mepBlogUrl + '">Insights</a>'
            + '          <a href="' + marketEntryUrl + '#faq">FAQ</a>'
            + '        </div>'
            + '        <div class="footer-group">'
            + '          <h4>Connect</h4>'
            + '          <a href="https://calendly.com/carlos-andre-alavanka/30min" target="_blank">Schedule Call</a>'
            + '          <a href="https://www.linkedin.com/company/alavankacro" target="_blank" rel="noopener noreferrer">LinkedIn</a>'
            + '          <a href="https://wa.me/5511975341961" target="_blank">WhatsApp</a>'
            + '        </div>'
            + '      </div>'
            + '    </div>'
            + '    <div class="footer-cross">'
            + '      <span>&#127463;&#127479;</span> <strong>Brazilian startup or VC?</strong> <a href="' + indexUrl + '">Visit Alavanka Brasil &rarr;</a>'
            + '    </div>'
            + '    <div class="footer-bottom">'
            + '      <span>&copy; 2026 Alavanka. All rights reserved.</span>'
            + '      <a href="' + basePath + 'privacy.html" class="footer-privacy">Privacy Policy</a>'
            + '    </div>'
            + '  </div>'
            + '</footer>';

    } else {
        // ========== BR FOOTER (Portuguese) ==========
        footerHTML = ''
            + '<footer class="site-footer">'
            + '  <div class="footer-container">'
            + '    <div class="footer-top">'
            + '      <div class="footer-brand-col">'
            + '        <img src="' + logoPath + '" alt="Alavanka" class="footer-logo">'
            + '        <p class="footer-tagline" data-i18n="footer.tagline">Fractional CRO para startups B2B. Execu\u00e7\u00e3o de GTM com accountability.</p>'
            + '      </div>'
            + '      <div class="footer-links-col">'
            + '        <div class="footer-group">'
            + '          <h4 data-i18n="footer.nav">Navega\u00e7\u00e3o</h4>'
            + '          <a href="' + indexUrl + '" data-i18n="footer.home">Home</a>'
            + '          <a href="' + blogUrl + '" data-i18n="footer.blog">Blog</a>'
            + '          <a href="' + guiaUrl + '" data-i18n="footer.playbook">Playbook</a>'
            + '          <a href="' + investidoresUrl + '" data-i18n="footer.investors">Investidores</a>'
            + '        </div>'
            + '        <div class="footer-group">'
            + '          <h4 data-i18n="footer.company">Empresa</h4>'
            + '          <a href="' + indexUrl + '#porque" data-i18n="footer.about">Sobre</a>'
            + '          <a href="' + assessmentUrl + '" data-i18n="footer.assessment">Assessment</a>'
            + '          <a href="' + indexUrl + '#faq" data-i18n="footer.faq">FAQ</a>'
            + '        </div>'
            + '        <div class="footer-group">'
            + '          <h4 data-i18n="footer.contact">Contato</h4>'
            + '          <a href="' + indexUrl + '#contato" data-i18n="footer.talk">Agendar Conversa</a>'
            + '          <a href="https://www.linkedin.com/company/alavankacro" target="_blank" rel="noopener noreferrer">LinkedIn</a>'
            + '          <a href="https://wa.me/5511975341961" target="_blank">WhatsApp</a>'
            + '        </div>'
            + '      </div>'
            + '    </div>'
            + '    <div class="footer-cross">'
            + '      <span>&#127758;</span> <strong data-i18n="footer.crossTitle">International company?</strong> <a href="' + marketEntryUrl + '" data-i18n="footer.crossLink">Market Entry Partnership &rarr;</a>'
            + '    </div>'
            + '    <div class="footer-bottom">'
            + '      <span data-i18n="footer.rights">&copy; 2026 Alavanka. Todos os direitos reservados.</span>'
            + '      <a href="' + basePath + 'privacy.html" class="footer-privacy">Política de Privacidade</a>'
            + '    </div>'
            + '  </div>'
            + '</footer>';
    }

    // — Replace existing footer —
    var existingFooter = document.getElementById('main-footer');
    if (existingFooter) {
        existingFooter.outerHTML = footerHTML;
    }

})();
