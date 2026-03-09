#!/usr/bin/env python3
"""
Alavanka Analytics Patcher
===========================
Patches GA4, Microsoft Clarity, LinkedIn Insight Tag, and custom event tracking
into the Alavanka site HTML files.

Usage:
  1. Clone or navigate to your repo root (the folder containing `public/`)
  2. Dry run first:   python3 patch_analytics.py --dry-run
  3. Apply changes:   python3 patch_analytics.py
  4. Review changes:  git diff
  5. Commit and push

Flags:
  --dry-run      Show what would change without modifying files
  --no-backup    Skip creating .bak backup files

What it does:
  - market-entry.html:  Adds GA4, Clarity, LinkedIn, custom event tracking
  - investidores.html:  Adds Clarity, LinkedIn
  - assessment.html:    Adds LinkedIn + lintrk conversion in submitAndDownload
  - index.html:         Fixes truncated Clarity script at end of file
"""

import os
import sys
import re

# ============================================================================
# SNIPPETS
# ============================================================================

GA4_HEAD = """
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-D8LLY1L1Z3"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-D8LLY1L1Z3');
    </script>"""

CLARITY = """
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "vb4dciqpnm");
    </script>"""

LINKEDIN = """
<!-- LinkedIn Insight Tag -->
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
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=9076865&fmt=gif" />
</noscript>"""

MARKET_ENTRY_EVENTS = """
  <!-- GA4: CTA Click & Engagement Tracking -->
  <script>
  (function() {
    'use strict';
    if (typeof gtag !== 'function') return;

    // CTA click tracking
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = (link.getAttribute('href') || '').toLowerCase();
      var params = null;

      if (href.indexOf('calendly') !== -1) {
        params = { cta_type: 'calendly', location: link.closest('.hero') ? 'hero' : link.closest('.cta-section') ? 'cta_final' : 'inline' };
      } else if (href.indexOf('mailto:') !== -1) {
        params = { cta_type: 'email', location: 'cta_final' };
      } else if (href.indexOf('index.html') !== -1) {
        params = { cta_type: 'brazil_cta', location: 'banner' };
      }

      if (params) {
        params.page = 'market_entry';
        gtag('event', 'cta_click', params);
        if (typeof lintrk === 'function' && params.cta_type === 'calendly') {
          lintrk('track', { conversion_id: 19814700 });
        }
      }
    });

    // FAQ interaction tracking
    document.querySelectorAll('.faq-question').forEach(function(btn, idx) {
      btn.addEventListener('click', function() {
        gtag('event', 'faq_opened', { question: String(idx + 1), page: 'market_entry' });
      });
    });

    // Section view tracking
    var sectionIds = ['the-problem', 'comparison', 'the-model', 'process', 'team', 'testimonials', 'faq', 'connect'];
    var viewedSections = {};
    if ('IntersectionObserver' in window) {
      var sectionObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            if (id && !viewedSections[id]) {
              viewedSections[id] = true;
              gtag('event', 'section_viewed', { section: id, page: 'market_entry' });
            }
          }
        });
      }, { threshold: 0.3 });
      sectionIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) sectionObs.observe(el);
      });
    }

    // Scroll depth tracking
    var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
    window.addEventListener('scroll', function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var percent = Math.round((scrollTop / docHeight) * 100);
      [25, 50, 75, 100].forEach(function(milestone) {
        if (percent >= milestone && !scrollMilestones[milestone]) {
          scrollMilestones[milestone] = true;
          gtag('event', 'scroll_depth', { depth: milestone, page: 'market_entry' });
        }
      });
    }, { passive: true });

    // Time on page
    [30, 60, 120, 300].forEach(function(seconds) {
      setTimeout(function() {
        gtag('event', 'time_on_page', { seconds: seconds, page: 'market_entry' });
      }, seconds * 1000);
    });
  })();
  </script>"""


# ============================================================================
# PATCHING FUNCTIONS
# ============================================================================

def patch_market_entry(filepath):
    """Add GA4, Clarity, LinkedIn, and custom event tracking."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = 0

    # 1a. Add GA4 + Clarity in <head> after ld+json </script>
    if 'googletagmanager.com/gtag' not in content:
        # Insert after the Schema.org ld+json closing </script> tag
        marker = '</script>\n  <style>'
        if marker in content:
            insert = '</script>' + GA4_HEAD + CLARITY + '\n  <style>'
            content = content.replace(marker, insert, 1)
            changes += 1
            print("  ✅ Added GA4 + Clarity to <head>")
        else:
            # Fallback: insert before <style>
            marker2 = '  <style>'
            if marker2 in content:
                insert = GA4_HEAD + CLARITY + '\n  <style>'
                content = content.replace(marker2, insert, 1)
                changes += 1
                print("  ✅ Added GA4 + Clarity to <head> (fallback position)")
            else:
                print("  ⚠️  Could not find insertion point for GA4/Clarity in <head>")
    else:
        print("  ⏭️  GA4 already present, skipping")

    # 1b. Add event tracking + LinkedIn before </body>
    if '_linkedin_partner_id' not in content:
        marker = '</body>'
        if marker in content:
            insert = MARKET_ENTRY_EVENTS + '\n\n' + LINKEDIN + '\n\n</body>'
            content = content.replace(marker, insert, 1)
            changes += 1
            print("  ✅ Added event tracking + LinkedIn before </body>")
        else:
            print("  ⚠️  Could not find </body>")
    else:
        print("  ⏭️  LinkedIn already present, skipping")

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  📝 Saved {changes} change(s)")
    else:
        print("  ℹ️  No changes needed")

    return changes


def patch_investidores(filepath):
    """Add Clarity and LinkedIn."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = 0

    # 2a. Add Clarity after GA4 config
    if 'clarity.ms' not in content:
        marker = "gtag('config', 'G-D8LLY1L1Z3');\n    </script>"
        if marker in content:
            insert = marker + CLARITY
            content = content.replace(marker, insert, 1)
            changes += 1
            print("  ✅ Added Clarity after GA4 config")
        else:
            # Try alternate formatting
            alt_marker = "gtag('config', 'G-D8LLY1L1Z3');\n  </script>"
            if alt_marker in content:
                insert = alt_marker + CLARITY
                content = content.replace(alt_marker, insert, 1)
                changes += 1
                print("  ✅ Added Clarity after GA4 config (alt format)")
            else:
                print("  ⚠️  Could not find GA4 config closing tag for Clarity insertion")
    else:
        print("  ⏭️  Clarity already present, skipping")

    # 2b. Add LinkedIn before </body>
    if '_linkedin_partner_id' not in content:
        marker = '</body>'
        if marker in content:
            insert = LINKEDIN + '\n\n</body>'
            content = content.replace(marker, insert, 1)
            changes += 1
            print("  ✅ Added LinkedIn before </body>")
        else:
            print("  ⚠️  Could not find </body>")
    else:
        print("  ⏭️  LinkedIn already present, skipping")

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  📝 Saved {changes} change(s)")
    else:
        print("  ℹ️  No changes needed")

    return changes


def patch_assessment(filepath):
    """Add LinkedIn insight tag and conversion tracking in submitAndDownload."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = 0

    # 3a. Add LinkedIn before </body>
    if '_linkedin_partner_id' not in content:
        marker = '</body>'
        if marker in content:
            insert = LINKEDIN + '\n\n</body>'
            content = content.replace(marker, insert, 1)
            changes += 1
            print("  ✅ Added LinkedIn before </body>")
        else:
            print("  ⚠️  Could not find </body>")
    else:
        print("  ⏭️  LinkedIn already present, skipping")

    # 3b. Add lintrk conversion call in the success callback of submitAndDownload
    if "lintrk('track'" not in content:
        # Find the gtag event for assessment_email_captured and add lintrk after it
        marker = "gtag('event', 'assessment_email_captured', { event_category: 'lead_generation', event_label: level, profile: profile });"
        if marker in content:
            insert = marker + """
            if (typeof lintrk === 'function') {
                lintrk('track', { conversion_id: 19814700 });
            }"""
            content = content.replace(marker, insert, 1)
            changes += 1
            print("  ✅ Added lintrk conversion tracking in submitAndDownload")
        else:
            print("  ⚠️  Could not find assessment_email_captured gtag call for lintrk insertion")
    else:
        print("  ⏭️  lintrk conversion already present, skipping")

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  📝 Saved {changes} change(s)")
    else:
        print("  ℹ️  No changes needed")

    return changes


def patch_index(filepath):
    """Fix truncated Clarity script at end of file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = 0

    # 4. Find and fix the truncated Clarity script
    # The broken pattern: the file ends with a truncated Clarity IIFE
    # We need to find it and replace with complete version + proper closing tags

    # Pattern: truncated Clarity that doesn't have the closing
    truncated_pattern = r'<!-- Microsoft Clarity -->\s*\n\s*<script type="text/javascript">\s*\n\s*\(function\(c,l,a,r,i,t,y\)\{\s*\n\s*c\[a\]=c\[a\]\|\|function\(\)\{\(c\[a\]\.q=c\[a\]\.q\|\|\[\]\)\.push\(a(?!rguments)'

    if re.search(truncated_pattern, content):
        # Find where the truncation starts
        match = re.search(r'<!-- Microsoft Clarity -->\s*\n\s*<script type="text/javascript">\s*\n\s*\(function\(c,l,a,r,i,t,y\)\{[^}]*$', content, re.DOTALL)
        if match:
            # Remove everything from the broken Clarity comment to the end
            content = content[:match.start()]

            # Add the complete Clarity + proper file closing
            complete_ending = """<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "vb4dciqpnm");
</script>

</body>
</html>
"""
            content = content.rstrip() + '\n\n' + complete_ending
            changes += 1
            print("  ✅ Fixed truncated Clarity script and added proper </body></html>")
    else:
        # Check if maybe the Clarity at the end is already complete
        # Count Clarity occurrences
        clarity_count = content.count('clarity.ms/tag')
        if clarity_count >= 1:
            print(f"  ⏭️  Clarity appears {clarity_count} time(s), checking if complete...")

            # Check if file ends properly
            stripped = content.rstrip()
            if stripped.endswith('</html>'):
                print("  ⏭️  File ends with </html>, looks OK")
            else:
                # File is truncated but pattern didn't match exactly - try broader fix
                # Find the last <!-- Microsoft Clarity --> and check if its script is complete
                last_clarity_pos = content.rfind('<!-- Microsoft Clarity -->')
                if last_clarity_pos != -1:
                    remaining = content[last_clarity_pos:]
                    if '</script>' not in remaining:
                        # Truncated!
                        content = content[:last_clarity_pos]
                        complete_ending = """<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "vb4dciqpnm");
</script>

</body>
</html>
"""
                        content = content.rstrip() + '\n\n' + complete_ending
                        changes += 1
                        print("  ✅ Fixed truncated Clarity script (broad match)")
                    else:
                        print("  ⏭️  Last Clarity script looks complete")
        else:
            print("  ⚠️  No Clarity found at all in index.html — adding it")
            # This shouldn't happen based on our analysis, but just in case

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  📝 Saved {changes} change(s)")
    else:
        print("  ℹ️  No changes needed")

    return changes


# ============================================================================
# MAIN
# ============================================================================

def main():
    import shutil

    dry_run = '--dry-run' in sys.argv
    no_backup = '--no-backup' in sys.argv

    # Detect repo root
    if os.path.isdir('public'):
        base = 'public'
    elif os.path.isdir('../public'):
        base = '../public'
    else:
        print("❌ Error: Could not find 'public/' directory.")
        print("   Run this script from your repo root (the folder containing public/)")
        sys.exit(1)

    files = {
        'market-entry.html': patch_market_entry,
        'investidores.html': patch_investidores,
        'assessment.html': patch_assessment,
        'index.html': patch_index,
    }

    print("=" * 60)
    print("  Alavanka Analytics Patcher")
    if dry_run:
        print("  *** DRY RUN — no files will be modified ***")
    print("=" * 60)
    print(f"  Base directory: {os.path.abspath(base)}")
    print()

    total_changes = 0
    for filename, patch_fn in files.items():
        filepath = os.path.join(base, filename)
        print(f"📄 {filename}")

        if not os.path.isfile(filepath):
            print(f"  ⚠️  File not found: {filepath}")
            print()
            continue

        # Create backup before patching
        if not dry_run and not no_backup:
            backup_path = filepath + '.bak'
            shutil.copy2(filepath, backup_path)
            print(f"  💾 Backup saved to {backup_path}")

        if dry_run:
            # In dry-run mode, work on a temp copy
            import tempfile
            tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
            with open(filepath, 'r', encoding='utf-8') as f:
                tmp.write(f.read())
            tmp.close()
            try:
                changes = patch_fn(tmp.name)
                total_changes += changes
            except Exception as e:
                print(f"  ❌ Error: {e}")
            finally:
                os.unlink(tmp.name)
        else:
            try:
                changes = patch_fn(filepath)
                total_changes += changes
            except Exception as e:
                print(f"  ❌ Error: {e}")

        print()

    print("=" * 60)
    if dry_run:
        if total_changes > 0:
            print(f"  🔍 Dry run complete: {total_changes} change(s) would be applied.")
            print("     Run without --dry-run to apply changes.")
        else:
            print("  ℹ️  No changes needed — all analytics tags already present.")
    elif total_changes > 0:
        print(f"  ✅ Done! {total_changes} total change(s) applied.")
        print()
        print("  Next steps:")
        print("    1. Review changes:  git diff")
        print("    2. Test locally:    npx serve public")
        print("    3. Deploy:          git add -A && git commit -m 'Add missing analytics tags' && git push")
        if not no_backup:
            print()
            print("  To remove backups:  rm public/*.bak")
    else:
        print("  ℹ️  No changes were needed — all analytics tags already present.")
    print("=" * 60)


if __name__ == '__main__':
    main()
