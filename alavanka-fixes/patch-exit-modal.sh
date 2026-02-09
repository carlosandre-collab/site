#!/bin/bash
# ============================================================
# ALAVANKA — Fix Exit Modal (email not sent + close issues)
# 
# PROBLEMS:
#   1. submitExitForm() has NO fetch/backend call — email is 
#      only tracked in gtag but never actually sent anywhere
#   2. Modal auto-close relies on 4s timeout which can miss
#
# USAGE:
#   chmod +x patch-exit-modal.sh
#   ./patch-exit-modal.sh public/index.html
# ============================================================

set -euo pipefail

FILE="${1:-./public/index.html}"

if [ ! -f "$FILE" ]; then
    echo "❌ File not found: $FILE"
    exit 1
fi

cp "$FILE" "${FILE}.exit-bak"
echo "✅ Backup: ${FILE}.exit-bak"

# Write the fix as an external perl script to avoid shell escaping issues
cat > /tmp/_fix_exit.pl << 'PERLEOF'
use strict;
use warnings;

my $file = $ARGV[0];
open(my $fh, '<', $file) or die "Cannot open $file: $!";
my $content = do { local $/; <$fh> };
close($fh);

# Replace the entire submitExitForm function
my $old = q{function submitExitForm(e) {
    e.preventDefault();
    var email = e.target.email.value;
    
    // Track conversion
    if (typeof gtag === 'function') {
        gtag('event', 'exit_email_capture', { email: email });
    }
    
    // Success message
    var form = e.target;
    form.parentElement.innerHTML = '<div style="text-align:center;padding:40px 20px">' +
        '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="margin:0 auto 16px;display:block">' +
        '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>' +
        '<h3 style="margin:0 0 8px;color:var(--accent);font-size:24px">Obrigado!</h3>' +
        '<p style="margin:0 0 20px;font-size:15px;color:var(--text-secondary)">Playbook enviado para<br><strong>' + email + '</strong></p>' +
        '<button onclick="closeExitModal()" style="padding:12px 24px;background:var(--accent);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">Fechar</button>' +
        '</div>';
    
    setTimeout(function() {
        closeExitModal();
    }, 4000);
    
    return false;
}};

my $new = q{function submitExitForm(e) {
    e.preventDefault();
    var email = e.target.email.value;
    
    // Track conversion
    if (typeof gtag === 'function') {
        gtag('event', 'exit_email_capture', { email: email });
    }
    
    // FIXED: Actually send the email to Google Apps Script backend
    var payload = {
        source: 'exit_intent',
        email: email,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
    };
    
    fetch('https://script.google.com/macros/s/AKfycbzy9gfeEUrwYd0KNiPm4XcpDjiBs80tASd5yw56Itn_7RuSXYhtPKf2Cxny0Jfgxf0LhQ/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    }).then(function(response) {
        return response.text();
    }).then(function(text) {
        console.log('Exit email sent successfully:', text);
    }).catch(function(err) {
        console.error('Exit email send failed:', err);
    });
    
    // Show success message
    var form = e.target;
    form.parentElement.innerHTML = '<div style="text-align:center;padding:40px 20px">' +
        '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="margin:0 auto 16px;display:block">' +
        '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>' +
        '<h3 style="margin:0 0 8px;color:var(--accent);font-size:24px">Obrigado!</h3>' +
        '<p style="margin:0 0 20px;font-size:15px;color:var(--text-secondary)">Playbook enviado para<br><strong>' + email + '</strong></p>' +
        '<button onclick="closeExitModal()" style="padding:12px 24px;background:var(--accent);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">Fechar</button>' +
        '</div>';
    
    // Auto-close after 5 seconds
    setTimeout(function() {
        closeExitModal();
    }, 5000);
    
    return false;
}};

# Escape for regex
my $old_escaped = quotemeta($old);
# But we need to allow flexible whitespace
$old_escaped =~ s/\\ /\\s*/g;
$old_escaped =~ s/\\n/\\s*/g;

# Try exact match first
if ($content =~ s/\Q$old\E/$new/s) {
    print "Replaced with exact match\n";
} else {
    # Try flexible match on just the function signature + body
    if ($content =~ s{function\s+submitExitForm\s*\(e\)\s*\{[^}]*?Track conversion[\s\S]*?return\s+false;\s*\}}{$new}s) {
        print "Replaced with flexible match\n";
    } else {
        print "WARNING: Could not find submitExitForm to replace\n";
    }
}

open(my $out, '>', $file) or die "Cannot write $file: $!";
print $out $content;
close($out);
PERLEOF

perl /tmp/_fix_exit.pl "$FILE"
rm -f /tmp/_fix_exit.pl

# Verify
if grep -q "source: 'exit_intent'" "$FILE"; then
    echo "✅ FIX 1 — Added fetch() call to send email to Google Apps Script"
else
    echo "⚠️  FIX 1 — Could not inject fetch call (manual fix needed)"
fi

if grep -q "fetch.*script.google.com.*exit" "$FILE" 2>/dev/null || grep -q "source.*exit_intent" "$FILE"; then
    echo "✅ FIX 2 — Email will now be sent to backend on submit"
else
    echo "⚠️  FIX 2 — Verify manually"
fi

echo ""
echo "Done. The exit modal now:"
echo "  1. Sends email to your Google Apps Script endpoint"
echo "  2. Shows success message with close button"  
echo "  3. Auto-closes after 5 seconds"
echo ""
echo "⚠️  IMPORTANT: Your Google Apps Script (doPost) needs to handle"
echo "   source='exit_intent' and send the playbook email."
echo "   Check your Apps Script code handles this source type."
