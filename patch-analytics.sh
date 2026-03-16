#!/usr/bin/env bash
# patch-analytics.sh
# Adds best-practice engagement tracking to market-entry.html and investidores.html
# Safe to re-run: checks for existing patches before applying.
# Usage: bash patch-analytics.sh [path/to/public]
#
# What this does per file:
#   market-entry.html  — Vercel Analytics, LinkedIn Insight Tag, scroll depth,
#                        section_viewed, time_on_page, Calendly CTA click events
#   investidores.html  — Vercel Analytics, scroll depth (replaces visual-only bar),
#                        section_viewed, time_on_page, Calendly CTA click events

set -euo pipefail

PUBLIC="${1:-$HOME/site/public}"

if [ ! -d "$PUBLIC" ]; then
  echo "ERROR: Directory not found: $PUBLIC"
  echo "Usage: bash patch-analytics.sh /path/to/your/public"
  exit 1
fi

ME="$PUBLIC/market-entry.html"
INV="$PUBLIC/investidores.html"

for f in "$ME" "$INV"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: File not found: $f"
    exit 1
  fi
done

echo "Backing up files..."
cp "$ME"  "$ME.bak"
cp "$INV" "$INV.bak"
echo "Backups created: *.bak"

# ─────────────────────────────────────────────────────────────────
# SHARED SNIPPETS (heredocs)
# ─────────────────────────────────────────────────────────────────

VERCEL_TAG='    <script defer src="/_vercel/insights/script.js"></script>'

LINKEDIN_BLOCK='<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
    window._linkedin_partner_id = "9076865";
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
    if (!window.lintrk) {
        window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q = [];
    }
    var s = document.getElementsByTagName("script")[0];
    var b = document.createElement("script");
    b.type = "text/javascript"; b.async = true;
    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    s.parentNode.insertBefore(b, s);
</script>
<noscript><img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=9076865&fmt=gif" /></noscript>'

# ─────────────────────────────────────────────────────────────────
# PATCH market-entry.html
# ─────────────────────────────────────────────────────────────────
echo ""
echo "Patching market-entry.html..."

# 1. Vercel Analytics — insert after <head>
if grep -q '/_vercel/insights/script.js' "$ME"; then
  echo "  [skip] Vercel Analytics already present"
else
  python3 - "$ME" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f: content = f.read()
tag = '    <script defer src="/_vercel/insights/script.js"></script>\n'
content = content.replace('<head>\n', '<head>\n' + tag, 1)
with open(path, 'w') as f: f.write(content)
print("  [done] Vercel Analytics added")
PYEOF
fi

# 2. LinkedIn Insight Tag — insert before </body>
if grep -q '_linkedin_partner_id' "$ME"; then
  echo "  [skip] LinkedIn tag already present"
else
  python3 - "$ME" "$LINKEDIN_BLOCK" <<'PYEOF'
import sys
path = sys.argv[1]
block = sys.argv[2]
with open(path, 'r') as f: content = f.read()
content = content.replace('</body>', block + '\n\n</body>', 1)
with open(path, 'w') as f: f.write(content)
print("  [done] LinkedIn Insight Tag added")
PYEOF
fi

# 3. Full engagement tracking block — scroll depth, section_viewed,
#    time_on_page, Calendly CTA click events — insert before </body>
if grep -q 'scroll_depth' "$ME"; then
  echo "  [skip] Scroll depth tracking already present"
else
  python3 - "$ME" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f: content = f.read()

block = '''<!-- GA4: Engagement Tracking -->
<script>
(function() {
    if (typeof gtag !== 'function') return;

    // 1. Scroll depth — 25/50/75/100%
    var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
    window.addEventListener('scroll', function() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        var percent = Math.round((scrollTop / docHeight) * 100);
        [25, 50, 75, 100].forEach(function(m) {
            if (percent >= m && !scrollMilestones[m]) {
                scrollMilestones[m] = true;
                gtag('event', 'scroll_depth', { depth: m, page: 'market-entry' });
            }
        });
    }, { passive: true });

    // 2. Section viewed via IntersectionObserver
    var sectionIds = ['the-problem', 'comparison', 'readiness-check', 'the-model',
                      'process', 'team', 'testimonials', 'faq', 'connect'];
    var viewedSections = {};
    if ('IntersectionObserver' in window) {
        var sectionObs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    if (id && !viewedSections[id]) {
                        viewedSections[id] = true;
                        gtag('event', 'section_viewed', { section: id, page: 'market-entry' });
                    }
                }
            });
        }, { threshold: 0.3 });
        sectionIds.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) sectionObs.observe(el);
        });
    }

    // 3. Time on page — 30/60/120/300s
    [30, 60, 120, 300].forEach(function(s) {
        setTimeout(function() {
            gtag('event', 'time_on_page', { seconds: s, page: 'market-entry' });
        }, s * 1000);
    });

    // 4. CTA click — Calendly (with LinkedIn conversion) + WhatsApp
    document.addEventListener('click', function(e) {
        var el = e.target;
        while (el && el.tagName !== 'A') el = el.parentElement;
        if (!el) return;
        var href = (el.getAttribute('href') || '').toLowerCase();
        var cls = ' ' + (el.className || '') + ' ';
        var params = null;
        if (href.indexOf('calendly') !== -1) {
            var loc = cls.indexOf('btn-hero') !== -1   ? 'hero'
                    : cls.indexOf('btn-primary') !== -1 ? 'cta_section'
                    : 'other';
            params = { cta_type: 'calendly', page: 'market-entry', location: loc };
        } else if (href.indexOf('wa.me') !== -1) {
            params = { cta_type: 'whatsapp', page: 'market-entry',
                       location: cls.indexOf('whatsapp-float') !== -1 ? 'float' : 'inline' };
        }
        if (params) {
            gtag('event', 'cta_click', params);
            if (typeof lintrk === 'function' && params.cta_type === 'calendly') {
                lintrk('track', { conversion_id: 19814700 });
            }
        }
    });
})();
</script>

'''

content = content.replace('</body>', block + '</body>', 1)
with open(path, 'w') as f: f.write(content)
print("  [done] Engagement tracking added (scroll, sections, time, CTA)")
PYEOF
fi

echo "  market-entry.html — done"

# ─────────────────────────────────────────────────────────────────
# PATCH investidores.html
# ─────────────────────────────────────────────────────────────────
echo ""
echo "Patching investidores.html..."

# 1. Vercel Analytics
if grep -q '/_vercel/insights/script.js' "$INV"; then
  echo "  [skip] Vercel Analytics already present"
else
  python3 - "$INV" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f: content = f.read()
tag = '    <script defer src="/_vercel/insights/script.js"></script>\n'
content = content.replace('<head>\n', '<head>\n' + tag, 1)
with open(path, 'w') as f: f.write(content)
print("  [done] Vercel Analytics added")
PYEOF
fi

# 2. Full engagement tracking — scroll depth (fires real GA4 events from existing
#    scroll listener), section_viewed, time_on_page, Calendly CTA click events
if grep -q 'scroll_depth' "$INV"; then
  echo "  [skip] Scroll depth tracking already present"
else
  python3 - "$INV" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path, 'r') as f: content = f.read()

block = '''<!-- GA4: Engagement Tracking -->
<script>
(function() {
    if (typeof gtag !== 'function') return;

    // 1. Scroll depth — 25/50/75/100%
    var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
    window.addEventListener('scroll', function() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        var percent = Math.round((scrollTop / docHeight) * 100);
        [25, 50, 75, 100].forEach(function(m) {
            if (percent >= m && !scrollMilestones[m]) {
                scrollMilestones[m] = true;
                gtag('event', 'scroll_depth', { depth: m, page: 'investidores' });
            }
        });
    }, { passive: true });

    // 2. Section viewed via IntersectionObserver
    var sectionIds = ['diagnostico', 'calculator', 'report', 'faq', 'cta'];
    var viewedSections = {};
    if ('IntersectionObserver' in window) {
        var sectionObs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    if (id && !viewedSections[id]) {
                        viewedSections[id] = true;
                        gtag('event', 'section_viewed', { section: id, page: 'investidores' });
                    }
                }
            });
        }, { threshold: 0.3 });
        sectionIds.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) sectionObs.observe(el);
        });
    }

    // 3. Time on page — 30/60/120/300s
    [30, 60, 120, 300].forEach(function(s) {
        setTimeout(function() {
            gtag('event', 'time_on_page', { seconds: s, page: 'investidores' });
        }, s * 1000);
    });

    // 4. CTA click — 6 Calendly buttons mapped by CSS class + WhatsApp float
    document.addEventListener('click', function(e) {
        var el = e.target;
        while (el && el.tagName !== 'A') el = el.parentElement;
        if (!el) return;
        var href = (el.getAttribute('href') || '').toLowerCase();
        var cls = ' ' + (el.className || '') + ' ';
        var params = null;
        if (href.indexOf('calendly') !== -1) {
            var loc = cls.indexOf('inv-hero-cta')        !== -1 ? 'hero'
                    : cls.indexOf('btn-talk-now')         !== -1 ? 'post_scorecard'
                    : cls.indexOf('btn-contextual-dark')  !== -1 ? 'section_dark'
                    : cls.indexOf('btn-contextual')       !== -1 ? 'inline'
                    : cls.indexOf('btn-primary')          !== -1 ? 'cta_final'
                    : 'other';
            params = { cta_type: 'calendly', page: 'investidores', location: loc };
        } else if (href.indexOf('wa.me') !== -1) {
            params = { cta_type: 'whatsapp', page: 'investidores',
                       location: cls.indexOf('whatsapp-float') !== -1 ? 'float' : 'inline' };
        }
        if (params) {
            gtag('event', 'cta_click', params);
            if (typeof lintrk === 'function' && params.cta_type === 'calendly') {
                lintrk('track', { conversion_id: 19814748 });
            }
        }
    });
})();
</script>

'''

content = content.replace('</body>', block + '</body>', 1)
with open(path, 'w') as f: f.write(content)
print("  [done] Engagement tracking added (scroll, sections, time, CTA)")
PYEOF
fi

echo "  investidores.html — done"

# ─────────────────────────────────────────────────────────────────
# VERIFY
# ─────────────────────────────────────────────────────────────────
echo ""
echo "Verification:"
for f in "$ME" "$INV"; do
  name=$(basename "$f")
  echo ""
  echo "  $name"
  grep -q '/_vercel/insights/script.js' "$f" \
    && echo "    ✓ Vercel Analytics" || echo "    ✗ Vercel Analytics MISSING"
  grep -q '_linkedin_partner_id' "$f" \
    && echo "    ✓ LinkedIn Insight Tag" || echo "    ✗ LinkedIn MISSING"
  grep -q 'scroll_depth' "$f" \
    && echo "    ✓ Scroll depth" || echo "    ✗ Scroll depth MISSING"
  grep -q 'section_viewed' "$f" \
    && echo "    ✓ Section viewed" || echo "    ✗ Section viewed MISSING"
  grep -q 'time_on_page' "$f" \
    && echo "    ✓ Time on page" || echo "    ✗ Time on page MISSING"
  grep -q 'cta_click' "$f" \
    && echo "    ✓ CTA click tracking" || echo "    ✗ CTA click MISSING"
done

echo ""
echo "All done. Commit with:"
echo "  git add public/market-entry.html public/investidores.html"
echo "  git commit -m 'feat: add best-practice engagement tracking to market-entry + investidores'"
echo ""
echo "To roll back:"
echo "  cp $ME.bak $ME"
echo "  cp $INV.bak $INV"
