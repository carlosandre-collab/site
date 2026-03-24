#!/usr/bin/env python3
"""
patch-newsletter-toggles.py
============================
Adds dual newsletter interest toggles (B2B Growth / LatAm Market Entry)
to all 6 Alavanka lead-capture forms.

Each form gets:
  - 2 pre-checked toggle switches side by side
  - Labels in the correct language, reactive to the page's lang toggle
  - newsletter_growth and newsletter_latam fields appended to GAS payload

Usage:
  python3 patch-newsletter-toggles.py --dir /path/to/public

After running:
  git add -A && git commit -m "feat: newsletter topic toggles on all lead forms" && git push
"""

import os
import sys
import shutil
import argparse

# ─────────────────────────────────────────────────────────────────────────────
# SHARED CSS — injected once per file inside an existing <style> block
# ─────────────────────────────────────────────────────────────────────────────
TOGGLE_CSS = """
/* ── Newsletter topic toggles ────────────────────────────── */
.nl-toggles-wrap {
  margin: 16px 0 4px;
}
.nl-toggles-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted, #8C8CA1);
  margin-bottom: 10px;
}
.nl-toggles-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.nl-toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.nl-toggle-item input[type="checkbox"] {
  display: none;
}
.nl-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--border, #E5E7EB);
  border-radius: 999px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.nl-toggle-item input:checked + .nl-switch {
  background: var(--accent, #1B3A5C);
}
.nl-switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.18);
}
.nl-toggle-item input:checked + .nl-switch::after {
  transform: translateX(16px);
}
.nl-toggle-text {
  font-size: 0.84rem;
  color: var(--text-secondary, #4A5568);
  line-height: 1.3;
}
/* Invert label colour on dark backgrounds (exit-intent modal) */
.nl-dark .nl-toggles-label,
.nl-dark .nl-toggle-text {
  color: rgba(255,255,255,0.75);
}
.nl-dark .nl-switch {
  background: rgba(255,255,255,0.25);
}
.nl-dark .nl-toggle-item input:checked + .nl-switch {
  background: var(--warm, #C8965A);
}
/* Compact variant for inline single-row forms (guia-crescimento, market-entry) */
.nl-toggles-wrap.nl-compact {
  margin: 12px 0 0;
}
.nl-toggles-wrap.nl-compact .nl-toggles-label {
  margin-bottom: 7px;
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# BILINGUAL toggle HTML block — injected before each submit button
# IDs are parameterised so each form is independent.
# ─────────────────────────────────────────────────────────────────────────────
def toggle_html(id_prefix, dark=False, compact=False, lang_aware=True,
                fixed_lang='pt',
                label_pt="Receber conteúdo sobre:",
                label_en="Receive content on:",
                opt1_pt="Growth B2B & Receita",
                opt1_en="B2B Growth Strategies",
                opt2_pt="Expansão para LatAm",
                opt2_en="Expanding into LatAm"):
    """Return the toggle HTML block for a specific form."""
    dark_cls   = " nl-dark" if dark else ""
    compact_cls = " nl-compact" if compact else ""

    if lang_aware:
        # Labels rendered via JS — placeholders replaced at runtime
        label_attr1_pt = f'data-nl-pt="{opt1_pt}" data-nl-en="{opt1_en}"'
        label_attr2_pt = f'data-nl-pt="{opt2_pt}" data-nl-en="{opt2_en}"'
        wrap_label     = f'data-nl-pt="{label_pt}" data-nl-en="{label_en}"'
        label_display1 = opt1_pt
        label_display2 = opt2_pt
        label_display0 = label_pt
    else:
        # Fixed language (market-entry = EN only)
        label_attr1_pt = ''
        label_attr2_pt = ''
        wrap_label     = ''
        label_display1 = opt1_en if fixed_lang == 'en' else opt1_pt
        label_display2 = opt2_en if fixed_lang == 'en' else opt2_pt
        label_display0 = label_en if fixed_lang == 'en' else label_pt

    return f"""
<div class="nl-toggles-wrap{dark_cls}{compact_cls}" id="{id_prefix}NlWrap">
  <p class="nl-toggles-label" {wrap_label} id="{id_prefix}NlLabel">{label_display0}</p>
  <div class="nl-toggles-row">
    <label class="nl-toggle-item">
      <input type="checkbox" id="{id_prefix}NlGrowth" checked>
      <span class="nl-switch"></span>
      <span class="nl-toggle-text" {label_attr1_pt} id="{id_prefix}NlGrowthLbl">{label_display1}</span>
    </label>
    <label class="nl-toggle-item">
      <input type="checkbox" id="{id_prefix}NlLatam" checked>
      <span class="nl-switch"></span>
      <span class="nl-toggle-text" {label_attr2_pt} id="{id_prefix}NlLatamLbl">{label_display2}</span>
    </label>
  </div>
</div>
"""

# ─────────────────────────────────────────────────────────────────────────────
# JS snippet to read toggle values and append to URLSearchParams
# ─────────────────────────────────────────────────────────────────────────────
def toggle_read_js(id_prefix):
    return (
        f"params.append('newsletter_growth', document.getElementById('{id_prefix}NlGrowth').checked ? 'yes' : 'no');\n"
        f"    params.append('newsletter_latam',  document.getElementById('{id_prefix}NlLatam').checked  ? 'yes' : 'no');"
    )

# ─────────────────────────────────────────────────────────────────────────────
# Lang-sync JS — appended once per file, wires toggles to the page's lang system
# ─────────────────────────────────────────────────────────────────────────────
def lang_sync_js(prefixes):
    """
    Returns a JS block that updates all toggle labels when the page language changes.
    prefixes = list of id_prefix strings used in this file.
    """
    prefix_list = ', '.join(f'"{p}"' for p in prefixes)
    return f"""
// ── Newsletter toggle lang sync ───────────────────────────
(function() {{
  var NL_PREFIXES = [{prefix_list}];

  function syncNlLang(lang) {{
    NL_PREFIXES.forEach(function(pfx) {{
      var wrap  = document.getElementById(pfx + 'NlWrap');
      if (!wrap) return;
      var attr  = lang === 'en' ? 'data-nl-en' : 'data-nl-pt';
      wrap.querySelectorAll('[data-nl-pt]').forEach(function(el) {{
        el.textContent = el.getAttribute(attr) || el.textContent;
      }});
    }});
  }}

  // Initial render
  var initLang = localStorage.getItem('alavanka-lang') || 'pt';
  syncNlLang(initLang);

  // Listen for page-level lang changes (fired by nav.js / toggleLang)
  document.addEventListener('langChange', function(e) {{
    syncNlLang(e.detail && e.detail.lang ? e.detail.lang : 'pt');
  }});
}})();
"""

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def backup(path):
    shutil.copy2(path, path + '.bak')

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def inject_css(content, filename):
    """Inject TOGGLE_CSS before the first </style> tag."""
    marker = '</style>'
    assert marker in content, f"No </style> found in {filename}"
    return content.replace(marker, TOGGLE_CSS + marker, 1)

def replace_once(content, old, new, label):
    assert old in content, f"PATTERN NOT FOUND in {label}:\n>>> {old[:160]}\n<<<"
    result = content.replace(old, new, 1)
    assert result != content, f"REPLACEMENT HAD NO EFFECT in {label}"
    return result

# ─────────────────────────────────────────────────────────────────────────────
# Per-file patch functions
# ─────────────────────────────────────────────────────────────────────────────

def patch_assessment(content):
    """
    assessment.html — bilingual, lang-aware.
    Insert toggle before <button class="btn-generate">.
    Append newsletter fields in submitAndDownload() before the fetch call.
    """
    # 1. HTML — before btn-generate
    OLD_HTML = '                        <button class="btn-generate" id="formBtn" onclick="submitAndDownload()">'
    NEW_HTML = toggle_html('asmt', lang_aware=True) + '                        <button class="btn-generate" id="formBtn" onclick="submitAndDownload()">'
    content = replace_once(content, OLD_HTML, NEW_HTML, 'assessment HTML')

    # 2. JS — append fields to params before the fetch
    OLD_JS = "    params.append('indicators', JSON.stringify(indicators));\n    params.append('timestamp', new Date().toISOString());"
    NEW_JS = (
        "    params.append('indicators', JSON.stringify(indicators));\n"
        "    params.append('timestamp', new Date().toISOString());\n"
        "    " + toggle_read_js('asmt').replace('\n', '\n    ')
    )
    content = replace_once(content, OLD_JS, NEW_JS, 'assessment JS')

    # 3. Lang sync JS — before closing </script> of the main script block
    OLD_END = "// Initialize\nupdateUI();"
    NEW_END = "// Initialize\nupdateUI();\n" + lang_sync_js(['asmt'])
    content = replace_once(content, OLD_END, NEW_END, 'assessment lang sync')

    return content


def patch_guia_7_sinais(content):
    """
    guia-7-sinais.html:
    - Remove the Cargo/Perfil row (role select + required attribute)
    - Move Fundo/Empresa to a single full-width field
    - Add newsletter toggles before btn-download
    - Append newsletter fields to GAS params
    """
    # 1. Remove role row + collapse fund into a single full-width row
    OLD_FORM_ROWS = (
        '                    <div class="form-row">\n'
        '                        <div class="form-group">\n'
        '                            <label for="role">Cargo</label>\n'
        '                            <select id="role" name="role" required>\n'
        '                                <option value="">Selecione...</option>\n'
        '                                <option value="gp">GP / Managing Partner</option>\n'
        '                                <option value="partner">Partner</option>\n'
        '                                <option value="principal">Principal / Director</option>\n'
        '                                <option value="ceo">CEO / Founder</option>\n'
        '                                <option value="cro">CRO / VP Sales</option>\n'
        '                                <option value="board">Board Member</option>\n'
        '                                <option value="other">Outro</option>\n'
        '                            </select>\n'
        '                        </div>\n'
        '                        <div class="form-group">\n'
        '                            <label for="fund">Fundo / Empresa (opcional)</label>\n'
        '                            <input type="text" id="fund" name="fund" placeholder="Ex: Kaszek, Monashees...">\n'
        '                        </div>\n'
        '                    </div>'
    )
    NEW_FORM_ROWS = (
        '                    <div class="form-row">\n'
        '                        <div class="form-group full">\n'
        '                            <label for="fund">Fundo / Empresa (opcional)</label>\n'
        '                            <input type="text" id="fund" name="fund" placeholder="Ex: Kaszek, Monashees...">\n'
        '                        </div>\n'
        '                    </div>'
    )
    content = replace_once(content, OLD_FORM_ROWS, NEW_FORM_ROWS, 'guia-7-sinais role removal')

    # 2. Remove role from FormPersist.save() call
    OLD_PERSIST = (
        "    FormPersist.save({\n"
        "        name: formData.name,\n"
        "        email: formData.email,\n"
        "        role: role,\n"
        "        fund: formData.company,\n"
        "        company: formData.company\n"
        "    });"
    )
    NEW_PERSIST = (
        "    FormPersist.save({\n"
        "        name: formData.name,\n"
        "        email: formData.email,\n"
        "        fund: formData.company,\n"
        "        company: formData.company\n"
        "    });"
    )
    content = replace_once(content, OLD_PERSIST, NEW_PERSIST, 'guia-7-sinais FormPersist')

    # 3. Remove role from formData object and profileLabels lookup
    OLD_FORMDATA = (
        "    const roleLabels = {'gp':'GP / Managing Partner','partner':'Partner','principal':'Principal / Director','ceo':'CEO / Founder','cro':'CRO / VP Sales','board':'Board Member','other':'Outro'};\n"
        "    const role = document.getElementById('role').value;\n"
        "    \n"
        "    const formData = {\n"
        "        email: document.getElementById('email').value,\n"
        "        name: document.getElementById('name').value,\n"
        "        profile: role,\n"
        "        profile_label: roleLabels[role] || role,\n"
        "        company: document.getElementById('fund').value || '',\n"
        "        source: 'guia_7_sinais',\n"
        "        timestamp: new Date().toISOString()\n"
        "    };"
    )
    NEW_FORMDATA = (
        "    const formData = {\n"
        "        email: document.getElementById('email').value,\n"
        "        name: document.getElementById('name').value,\n"
        "        company: document.getElementById('fund').value || '',\n"
        "        source: 'guia_7_sinais',\n"
        "        timestamp: new Date().toISOString()\n"
        "    };"
    )
    content = replace_once(content, OLD_FORMDATA, NEW_FORMDATA, 'guia-7-sinais formData')

    # 4. Remove role from URLSearchParams
    OLD_PARAMS = (
        "    params.append('source', 'guia_7_sinais');\n"
        "    params.append('email', formData.email);\n"
        "    params.append('name', formData.name);\n"
        "    params.append('profile', role);\n"
        "    params.append('company', formData.company);\n"
        "    params.append('timestamp', new Date().toISOString());"
    )
    NEW_PARAMS = (
        "    params.append('source', 'guia_7_sinais');\n"
        "    params.append('email', formData.email);\n"
        "    params.append('name', formData.name);\n"
        "    params.append('company', formData.company);\n"
        "    params.append('timestamp', new Date().toISOString());"
    )
    content = replace_once(content, OLD_PARAMS, NEW_PARAMS, 'guia-7-sinais params')

    # 5. HTML toggle — before btn-download
    OLD_BTN = '                    <button type="submit" class="btn-download" id="submitBtn">'
    NEW_BTN = toggle_html('g7s', lang_aware=True) + '                    <button type="submit" class="btn-download" id="submitBtn">'
    content = replace_once(content, OLD_BTN, NEW_BTN, 'guia-7-sinais toggle HTML')

    # 6. Newsletter fields into params (post-step-1: params already has timestamp)
    OLD_JS = "    params.append('timestamp', new Date().toISOString());\n    \n    fetch("
    NEW_JS = (
        "    params.append('timestamp', new Date().toISOString());\n"
        "    " + toggle_read_js('g7s').replace('\n', '\n    ') + "\n    \n    fetch("
    )
    content = replace_once(content, OLD_JS, NEW_JS, 'guia-7-sinais NL params')

    # 7. Lang sync
    OLD_END = "// Scroll Reveal - Otimizado"
    NEW_END = lang_sync_js(['g7s']) + "// Scroll Reveal - Otimizado"
    content = replace_once(content, OLD_END, NEW_END, 'guia-7-sinais lang sync')

    return content


def patch_guia_crescimento(content):
    """
    guia-crescimento-receita-b2b.html — bilingual, compact inline form.
    Original file uses JSON payload (sendBeacon). We replace the whole payload
    block with URLSearchParams and append newsletter fields at the same time.
    Insert toggle after <p class="pdf-capture-disclaimer"...>.
    """
    # 1. HTML — after disclaimer paragraph, before success div
    OLD_HTML = '            <p class="pdf-capture-disclaimer" data-i18n="ge.pdf.disclaimer">1 email/mês • Sem spam • Cancele quando quiser</p>'
    NEW_HTML = (
        OLD_HTML + "\n" +
        toggle_html('ge', lang_aware=True, compact=True)
    )
    content = replace_once(content, OLD_HTML, NEW_HTML, 'guia-crescimento HTML')

    # 2. JS — append newsletter fields to the URLSearchParams block (post gas-url-patch state)
    OLD_JS = (
        "            var params = new URLSearchParams();\n"
        "            params.append('source', 'guia_growth_execution');\n"
        "            params.append('email', emailVal);\n"
        "            params.append('timestamp', new Date().toISOString());\n"
        "            params.append('page', window.location.pathname);\n"
        "            fetch(GAS_URL, { method: 'POST', mode: 'no-cors', body: params }).catch(function() {});"
    )
    NEW_JS = (
        "            var params = new URLSearchParams();\n"
        "            params.append('source', 'guia_growth_execution');\n"
        "            params.append('email', emailVal);\n"
        "            params.append('timestamp', new Date().toISOString());\n"
        "            params.append('page', window.location.pathname);\n"
        "            params.append('newsletter_growth', document.getElementById('geNlGrowth').checked ? 'yes' : 'no');\n"
        "            params.append('newsletter_latam',  document.getElementById('geNlLatam').checked  ? 'yes' : 'no');\n"
        "            fetch(GAS_URL, { method: 'POST', mode: 'no-cors', body: params }).catch(function() {});"
    )
    content = replace_once(content, OLD_JS, NEW_JS, 'guia-crescimento JS')

    # 3. Lang sync — before the IIFE closing })(); — first one is the PDF IIFE
    OLD_END = "})();\n</script>\n\n\n<!-- ── CTA FINAL"
    NEW_END = lang_sync_js(['ge']) + "})();\n</script>\n\n\n<!-- ── CTA FINAL"
    content = replace_once(content, OLD_END, NEW_END, 'guia-crescimento lang sync')

    return content


def patch_index_exit_intent(content):
    """
    index.html — exit-intent modal built as innerHTML string using escaped double quotes.
    Inject toggle HTML before submit button, append newsletter fields to exitParams.
    """
    # Exact fragment from the file (uses \" escaping, not \' )
    OLD_MODAL_FRAG = (
        'id="exitEmailInput"><button type="submit" class="exit-btn-primary" id="exitSubmitBtn">\' + t.cta + \'</button>'
        '<div class="exit-error" id="exitError" style="display:none">\' + t.errorMsg + \'</div></form>'
    )

    TOGGLE_STR = (
        "' + '<div class=\"nl-toggles-wrap nl-dark\" id=\"exitNlWrap\">"
        "<p class=\"nl-toggles-label\" id=\"exitNlLabel\">' + (localStorage.getItem('alavanka-lang')==='en' ? 'Receive content on:' : 'Receber conteúdo sobre:') + '</p>"
        "<div class=\"nl-toggles-row\">"
        "<label class=\"nl-toggle-item\">"
        "<input type=\"checkbox\" id=\"exitNlGrowth\" checked>"
        "<span class=\"nl-switch\"></span>"
        "<span class=\"nl-toggle-text\" id=\"exitNlGrowthLbl\">' + (localStorage.getItem('alavanka-lang')==='en' ? 'B2B Growth Strategies' : 'Growth B2B &amp; Receita') + '</span>"
        "</label>"
        "<label class=\"nl-toggle-item\">"
        "<input type=\"checkbox\" id=\"exitNlLatam\" checked>"
        "<span class=\"nl-switch\"></span>"
        "<span class=\"nl-toggle-text\" id=\"exitNlLatamLbl\">' + (localStorage.getItem('alavanka-lang')==='en' ? 'Expanding into LatAm' : 'Expans&#227;o para LatAm') + '</span>"
        "</label>"
        "</div>"
        "</div>' + "
    )

    NEW_MODAL_FRAG = (
        'id="exitEmailInput">' +
        TOGGLE_STR +
        '<button type="submit" class="exit-btn-primary" id="exitSubmitBtn">\' + t.cta + \'</button>'
        '<div class="exit-error" id="exitError" style="display:none">\' + t.errorMsg + \'</div></form>'
    )
    content = replace_once(content, OLD_MODAL_FRAG, NEW_MODAL_FRAG, 'index exit modal HTML')

    # 2. JS — append newsletter fields to exitParams
    OLD_JS = "        exitParams.append('page', payload.page || window.location.pathname);\n        fetch("
    NEW_JS = (
        "        exitParams.append('page', payload.page || window.location.pathname);\n"
        "        exitParams.append('newsletter_growth', document.getElementById('exitNlGrowth') && document.getElementById('exitNlGrowth').checked ? 'yes' : 'no');\n"
        "        exitParams.append('newsletter_latam',  document.getElementById('exitNlLatam')  && document.getElementById('exitNlLatam').checked  ? 'yes' : 'no');\n"
        "        fetch("
    )
    content = replace_once(content, OLD_JS, NEW_JS, 'index exit JS params')

    # 3. Lang sync
    OLD_END = "function showExitSuccess(email) {"
    NEW_END = lang_sync_js(['exit']) + "\nfunction showExitSuccess(email) {"
    content = replace_once(content, OLD_END, NEW_END, 'index lang sync')

    return content


def patch_investidores(content):
    """
    investidores.html:
    - Add Outro/Other option to profile select
    - Add 'other' to profileLabels JS object
    - Add newsletter toggles before report-btn
    - Append newsletter fields to params
    """
    # 1. Add <option value="other"> after founder option
    OLD_SELECT = (
        '                            <option value="founder" data-i18n="investors.report.form.founder">Founder / CEO (portfolio)</option>\n'
        '                        </select>'
    )
    NEW_SELECT = (
        '                            <option value="founder" data-i18n="investors.report.form.founder">Founder / CEO (portfolio)</option>\n'
        '                            <option value="other" data-i18n="investors.report.form.other">Outro</option>\n'
        '                        </select>'
    )
    content = replace_once(content, OLD_SELECT, NEW_SELECT, 'investidores select other')

    # 2. Add 'other' to profileLabels JS
    OLD_LABELS = (
        "    var profileLabels = {\n"
        "        'gp': 'GP / Partner',\n"
        "        'principal': 'Principal / Director',\n"
        "        'analyst': 'Analyst / Associate',\n"
        "        'founder': 'Founder / CEO (portfolio)'\n"
        "    };"
    )
    NEW_LABELS = (
        "    var profileLabels = {\n"
        "        'gp': 'GP / Partner',\n"
        "        'principal': 'Principal / Director',\n"
        "        'analyst': 'Analyst / Associate',\n"
        "        'founder': 'Founder / CEO (portfolio)',\n"
        "        'other': 'Outro / Other'\n"
        "    };"
    )
    content = replace_once(content, OLD_LABELS, NEW_LABELS, 'investidores profileLabels')

    # 3. HTML toggle — before report-btn
    OLD_HTML = '                <button class="report-btn" onclick="generateReport()" id="reportBtn">'
    NEW_HTML = toggle_html('inv', lang_aware=True) + '                <button class="report-btn" onclick="generateReport()" id="reportBtn">'
    content = replace_once(content, OLD_HTML, NEW_HTML, 'investidores toggle HTML')

    # 4. Newsletter fields into params
    OLD_JS = "    for (var key in payload) {\n        if (payload.hasOwnProperty(key)) {\n            var val = payload[key];\n            params.append(key, val === null || val === undefined ? '' : String(val));\n        }\n    }"
    NEW_JS = (
        "    for (var key in payload) {\n"
        "        if (payload.hasOwnProperty(key)) {\n"
        "            var val = payload[key];\n"
        "            params.append(key, val === null || val === undefined ? '' : String(val));\n"
        "        }\n"
        "    }\n"
        "    params.append('newsletter_growth', document.getElementById('invNlGrowth') && document.getElementById('invNlGrowth').checked ? 'yes' : 'no');\n"
        "    params.append('newsletter_latam',  document.getElementById('invNlLatam')  && document.getElementById('invNlLatam').checked  ? 'yes' : 'no');"
    )
    content = replace_once(content, OLD_JS, NEW_JS, 'investidores NL params')

    # 5. Lang sync
    OLD_END = "window.toggleLang = function() {"
    NEW_END = lang_sync_js(['inv']) + "\nwindow.toggleLang = function() {"
    content = replace_once(content, OLD_END, NEW_END, 'investidores lang sync')

    return content


def patch_translations(base):
    """Add investors.report.form.other to translations.json (PT + EN)."""
    import json
    path = os.path.join(base, 'translations.json')
    if not os.path.exists(path):
        print(f'  SKIP (not found): translations.json')
        return
    shutil.copy2(path, path + '.bak')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    key = 'investors.report.form.other'
    changed = False
    if key not in data['pt']:
        data['pt'][key] = 'Outro'
        changed = True
    if key not in data['en']:
        data['en'][key] = 'Other'
        changed = True
    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'  ✓ Patched: translations.json  (added {key})')
    else:
        print(f'  ~ No changes: translations.json')


def patch_market_entry(content):
    """
    market-entry.html — EN only.
    Inject full email capture block (with toggles) before the final CTA section.
    Also update alavanka-gas.js URL placeholder if already patched, or inject fresh block.
    """
    ANCHOR = '  <!-- ========== CTA ========== -->'
    assert ANCHOR in content, 'market-entry CTA anchor not found'

    # Build the toggle HTML (EN fixed, no lang-awareness needed)
    nl_block = toggle_html(
        'me', lang_aware=False, fixed_lang='en', compact=True,
        label_en="Receive content on:",
        opt1_en="Startup Growth Strategies",
        opt2_en="Expanding into LatAm"
    )

    EMAIL_BLOCK = f"""  <!-- ========== EMAIL CAPTURE ========== -->
  <section style="padding: 72px 0; background: var(--bg); border-top: 1px solid var(--border);">
    <div class="container">
      <div style="max-width: 640px; margin: 0 auto; text-align: center;">
        <p style="font-family:'Space Grotesk',sans-serif; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--warm); margin-bottom:12px;">Free Resource</p>
        <h2 style="font-family:'Space Grotesk',sans-serif; font-size:1.75rem; font-weight:700; color:var(--text); margin-bottom:12px; line-height:1.25;">Get the BOT Playbook</h2>
        <p style="font-size:1rem; color:var(--text-secondary); line-height:1.65; margin-bottom:32px;">A practical guide to how the Build, Operate &amp; Transfer model works — phases, KPIs, investment structure, and what to expect in year one. No sales call needed.</p>
        <div id="meEmailCapture" style="max-width:480px; margin:0 auto;">
          <div id="meFormWrap">
            <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:8px;">
              <input type="email" id="meEmail" placeholder="your@company.com" autocomplete="email"
                style="padding:14px 20px; border:1.5px solid var(--border); border-radius:var(--r-full); font-size:0.97rem; font-family:'DM Sans',sans-serif; outline:none; min-width:240px; flex:1; max-width:300px; color:var(--text); background:#fff; transition:border-color 0.2s;"
                onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
              <button id="meSubmitBtn" onclick="meSubmit()"
                style="padding:14px 28px; background:linear-gradient(135deg,var(--warm),var(--warm-dark)); color:#fff; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:0.9rem; border:none; border-radius:var(--r-full); cursor:pointer; white-space:nowrap; box-shadow:0 4px 16px rgba(200,150,90,0.35); transition:transform 0.2s,box-shadow 0.2s;"
                onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(200,150,90,0.45)'"
                onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(200,150,90,0.35)'">
                Send me the Playbook &rarr;
              </button>
            </div>
            {nl_block}
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:8px;">No spam. One email with the PDF link.</p>
          </div>
          <div id="meSuccess" style="display:none; align-items:center; justify-content:center; gap:10px; color:var(--accent); font-family:'Space Grotesk',sans-serif; font-weight:600;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            Check your inbox — the playbook is on its way.
          </div>
        </div>
      </div>
    </div>
  </section>
  <script>
  function meSubmit() {{
    var emailEl = document.getElementById('meEmail');
    var btn     = document.getElementById('meSubmitBtn');
    var success = document.getElementById('meSuccess');
    var formWrap= document.getElementById('meFormWrap');
    var email   = emailEl ? emailEl.value.trim() : '';
    if (!email || email.indexOf('@') === -1) {{
      emailEl.style.borderColor = '#EF4444';
      emailEl.focus();
      return;
    }}
    btn.disabled = true;
    btn.textContent = 'Sending\u2026';
    var params = new URLSearchParams();
    params.append('source', 'market_entry_cta');
    params.append('email', email);
    params.append('timestamp', new Date().toISOString());
    params.append('page', window.location.pathname);
    params.append('newsletter_growth', document.getElementById('meNlGrowth').checked ? 'yes' : 'no');
    params.append('newsletter_latam',  document.getElementById('meNlLatam').checked  ? 'yes' : 'no');
    fetch('__ALAVANKA_GAS_URL__', {{ method: 'POST', mode: 'no-cors', body: params }}).catch(function() {{}});
    if (typeof gtag === 'function') {{
      gtag('event', 'generate_lead', {{ event_category: 'lead_generation', lead_source: 'market_entry_cta' }});
    }}
    formWrap.style.display = 'none';
    success.style.display  = 'flex';
  }}
  </script>

"""
    content = content.replace(ANCHOR, EMAIL_BLOCK + ANCHOR, 1)
    return content


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
PATCH_MAP = {
    'assessment.html':               patch_assessment,
    'guia-7-sinais.html':            patch_guia_7_sinais,
    'guia-crescimento-receita-b2b.html': patch_guia_crescimento,
    'index.html':                    patch_index_exit_intent,
    'investidores.html':             patch_investidores,
    'market-entry.html':             patch_market_entry,
}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dir', default='.', help='Directory containing the HTML files')
    args = parser.parse_args()
    base = args.dir

    errors = []
    for fname, patch_fn in PATCH_MAP.items():
        path = os.path.join(base, fname)
        if not os.path.exists(path):
            print(f'  SKIP (not found): {path}')
            continue

        backup(path)
        content = read(path)

        try:
            # 1. Inject CSS
            content = inject_css(content, fname)
            # 2. Apply file-specific patches
            content = patch_fn(content)
            write(path, content)
            print(f'  ✓ Patched: {fname}')
        except AssertionError as e:
            print(f'  ✗ FAILED:  {fname} — {e}')
            # Restore backup on failure
            shutil.copy2(path + '.bak', path)
            errors.append(fname)

    if errors:
        print(f'\n⚠ {len(errors)} file(s) failed — originals restored from .bak')
        sys.exit(1)
    else:
        # Patch translations.json last (no content object, direct file edit)
        patch_translations(base)
        print('\nAll done. Verify visually, then:')
        print('  git add -A && git commit -m "feat: newsletter toggles + form UX improvements" && git push')

if __name__ == '__main__':
    main()
