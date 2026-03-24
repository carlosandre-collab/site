#!/usr/bin/env python3
"""
patch-gas-url.py
================
Patches all Alavanka HTML files to:
  1. Replace both legacy GAS URLs with the single new unified URL
  2. Normalize guia-crescimento and index.html exit-intent to send
     URLSearchParams (not JSON), so Apps Script reads e.parameter.*
  3. Add the market-entry email capture block before the final CTA

Usage:
  python3 patch-gas-url.py --gas-url "https://script.google.com/macros/s/YOUR_NEW_EXEC_URL/exec"

After running:
  git add -A && git commit -m "fix: unify GAS lead endpoint + email alerts" && git push
"""

import sys
import os
import re
import shutil
import argparse

# ── Config ────────────────────────────────────────────────────
OLD_URLS = [
    'https://script.google.com/macros/s/AKfycbyoyTIHzqi1Fx0X0ZgOA5Lz7ZWf9Bp8sWYdtVZW54-tJvBFsEuwq_nBAZTGI1vCjr7aSA/exec',
    'https://script.google.com/macros/s/AKfycbyy_bNoqwbED3Fkn1N0H7xicE1wuTYMbhM7VG9wWHT4gMTracqCGEIgxy9qXzhnb2gF/exec',
]

FILES = [
    'assessment.html',
    'guia-7-sinais.html',
    'guia-crescimento-receita-b2b.html',
    'index.html',
    'investidores.html',
    'market-entry.html',
]

# ── Guia-crescimento: replace JSON sendBeacon/fetch with URLSearchParams ──
GUIA_OLD = """\
        try {
            var payload = {
                source: 'guia_growth_execution',
                email: emailVal,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            };
            var sent = navigator.sendBeacon && navigator.sendBeacon(GAS_URL, JSON.stringify(payload));
            if (!sent) {
                fetch(GAS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }).catch(function() {});
            }
        } catch(ignored) {}"""

GUIA_NEW = """\
        try {
            var params = new URLSearchParams();
            params.append('source', 'guia_growth_execution');
            params.append('email', emailVal);
            params.append('timestamp', new Date().toISOString());
            params.append('page', window.location.pathname);
            fetch(GAS_URL, { method: 'POST', mode: 'no-cors', body: params }).catch(function() {});
        } catch(ignored) {}"""

# ── index.html exit-intent: replace JSON sendBeacon with URLSearchParams ──
INDEX_OLD = """\
        var sent = navigator.sendBeacon && navigator.sendBeacon('https://script.google.com/macros/s/AKfycbyy_bNoqwbED3Fkn1N0H7xicE1wuTYMbhM7VG9wWHT4gMTracqCGEIgxy9qXzhnb2gF/exec', JSON.stringify(payload));
        if (!sent) { fetch('https://script.google.com/macros/s/AKfycbyy_bNoqwbED3Fkn1N0H7xicE1wuTYMbhM7VG9wWHT4gMTracqCGEIgxy9qXzhnb2gF/exec', { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }).catch(function() {}); }"""

# We'll replace with a version that uses URLSearchParams AND the new URL placeholder
# The actual URL will be substituted in step 1 (URL replacement pass)
INDEX_NEW_TEMPLATE = """\
        var exitParams = new URLSearchParams();
        exitParams.append('source', 'exit_intent');
        exitParams.append('email', payload.email || '');
        exitParams.append('timestamp', payload.timestamp || new Date().toISOString());
        exitParams.append('page', payload.page || window.location.pathname);
        fetch('__NEW_GAS_URL__', { method: 'POST', mode: 'no-cors', body: exitParams }).catch(function() {});"""

# ── market-entry.html: email capture block to inject ─────────
MARKET_ENTRY_ANCHOR = '  <!-- ========== CTA ========== -->'

MARKET_ENTRY_EMAIL_BLOCK = """\
  <!-- ========== EMAIL CAPTURE ========== -->
  <section style="padding: 72px 0; background: var(--bg); border-top: 1px solid var(--border);">
    <div class="container">
      <div style="max-width: 640px; margin: 0 auto; text-align: center;">
        <p style="font-family:'Space Grotesk',sans-serif; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--warm); margin-bottom:12px;">Free Resource</p>
        <h2 style="font-family:'Space Grotesk',sans-serif; font-size:1.75rem; font-weight:700; color:var(--text); margin-bottom:12px; line-height:1.25;">Get the BOT Playbook</h2>
        <p style="font-size:1rem; color:var(--text-secondary); line-height:1.65; margin-bottom:32px;">A practical guide to how the Build, Operate &amp; Transfer model works — phases, KPIs, investment structure, and what to expect in year one. No sales call needed.</p>
        <div id="meEmailCapture">
          <div id="meFormWrap" style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
            <input type="email" id="meEmail" placeholder="your@company.com" autocomplete="email"
              style="padding:14px 20px; border:1.5px solid var(--border); border-radius:var(--r-full); font-size:0.97rem; font-family:'DM Sans',sans-serif; outline:none; min-width:260px; flex:1; max-width:340px; color:var(--text); background:#fff; transition:border-color 0.2s;"
              onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
            <button id="meSubmitBtn" onclick="meSubmit()"
              style="padding:14px 28px; background:linear-gradient(135deg,var(--warm),var(--warm-dark)); color:#fff; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:0.9rem; border:none; border-radius:var(--r-full); cursor:pointer; white-space:nowrap; box-shadow:0 4px 16px rgba(200,150,90,0.35); transition:transform 0.2s,box-shadow 0.2s;"
              onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(200,150,90,0.45)'"
              onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(200,150,90,0.35)'">
              Send me the Playbook &rarr;
            </button>
          </div>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-top:12px;">No spam. One email with the PDF link.</p>
          <div id="meSuccess" style="display:none; align-items:center; justify-content:center; gap:10px; color:var(--accent); font-family:'Space Grotesk',sans-serif; font-weight:600;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            Check your inbox — the playbook is on its way.
          </div>
        </div>
      </div>
    </div>
  </section>
  <script>
  function meSubmit() {
    var emailEl = document.getElementById('meEmail');
    var btn     = document.getElementById('meSubmitBtn');
    var success = document.getElementById('meSuccess');
    var formWrap= document.getElementById('meFormWrap');
    var email   = emailEl ? emailEl.value.trim() : '';
    if (!email || email.indexOf('@') === -1) {
      emailEl.style.borderColor = '#EF4444';
      emailEl.focus();
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Sending…';
    var params = new URLSearchParams();
    params.append('source', 'market_entry_cta');
    params.append('email', email);
    params.append('timestamp', new Date().toISOString());
    params.append('page', window.location.pathname);
    fetch('__ALAVANKA_GAS_URL__', { method: 'POST', mode: 'no-cors', body: params }).catch(function() {});
    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', { event_category: 'lead_generation', lead_source: 'market_entry_cta' });
    }
    formWrap.style.display = 'none';
    success.style.display  = 'flex';
  }
  </script>

"""

# ── Helpers ───────────────────────────────────────────────────
def backup(path):
    shutil.copy2(path, path + '.bak')

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def replace_once(content, old, new, label):
    assert old in content, f"PATTERN NOT FOUND in {label}:\n{old[:120]}"
    result = content.replace(old, new, 1)
    assert result != content, f"REPLACEMENT HAD NO EFFECT in {label}"
    return result

# ── Main ──────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--gas-url', required=True, help='New unified GAS /exec URL')
    parser.add_argument('--dir', default='.', help='Directory containing the HTML files')
    args = parser.parse_args()

    new_url = args.gas_url.strip()
    base    = args.dir

    for fname in FILES:
        path = os.path.join(base, fname)
        if not os.path.exists(path):
            print(f'  SKIP (not found): {path}')
            continue

        backup(path)
        content = read(path)
        original = content

        # ── Step 1a: Normalize index.html exit-intent BEFORE URL swap
        #    (pattern still contains the old URL literal)
        if fname == 'index.html':
            assert INDEX_OLD in content, 'INDEX_OLD pattern not found in index.html'
            index_new = INDEX_NEW_TEMPLATE.replace('__NEW_GAS_URL__', new_url)
            content = content.replace(INDEX_OLD, index_new, 1)
            print(f'  ✓ Normalized exit-intent JSON→URLSearchParams: {fname}')

        # ── Step 1b: Replace all remaining old GAS URLs ──────
        for old_url in OLD_URLS:
            content = content.replace(old_url, new_url)

        # ── Step 2: Normalize guia-crescimento JSON → URLSearchParams ─
        if fname == 'guia-crescimento-receita-b2b.html':
            assert GUIA_OLD in content, 'GUIA_OLD pattern not found in guia-crescimento'
            content = content.replace(GUIA_OLD, GUIA_NEW, 1)
            print(f'  ✓ Normalized JSON→URLSearchParams: {fname}')

        # ── Step 3: Inject email capture into market-entry ───
        if fname == 'market-entry.html':
            assert MARKET_ENTRY_ANCHOR in content, 'MARKET_ENTRY_ANCHOR not found in market-entry.html'
            block = MARKET_ENTRY_EMAIL_BLOCK.replace('__ALAVANKA_GAS_URL__', new_url)
            content = content.replace(MARKET_ENTRY_ANCHOR, block + MARKET_ENTRY_ANCHOR, 1)
            print(f'  ✓ Injected email capture block: {fname}')

        # ── Write ────────────────────────────────────────────
        if content != original:
            write(path, content)
            url_count = sum(content.count(new_url) for _ in [1])
            print(f'  ✓ Patched: {fname}  (new URL appears {content.count(new_url)}x)')
        else:
            print(f'  ~ No changes: {fname}')

    print('\nDone. Review .bak files then: git add -A && git commit -m "fix: unify GAS lead endpoint + email alerts" && git push')

if __name__ == '__main__':
    main()
