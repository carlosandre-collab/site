// ============================================================
// Alavanka — Unified Lead Capture
// Google Apps Script  (Apps Script → Deploy → Web App)
// Execute as: Me | Who has access: Anyone
//
// Setup:
//   1. New Google Sheet → Extensions → Apps Script → paste this
//   2. Deploy → New deployment → Web app
//      Execute as: Me  |  Access: Anyone
//   3. Copy the /exec URL → replace ALAVANKA_GAS_URL in all HTML files
//   4. In the sheet: rename Sheet1 → "Leads"
//      (script auto-creates columns on first run)
// ============================================================

var ALERT_EMAIL   = 'carlos@alavanka.com';
var SHEET_NAME    = 'Leads';

// Column order in the sheet
var COLUMNS = [
  'timestamp',
  'source',
  'email',
  'name',
  'profile',
  'company',
  'score',
  'fit_level',
  'answers',
  'answer_labels',
  'indicators',
  'page',
  'lang',
  'raw'          // full payload dump for debugging
];

// ── Entry point ──────────────────────────────────────────────
function doPost(e) {
  try {
    var data = parsePayload(e);
    var row  = buildRow(data);
    appendRow(row);
    sendAlert(data);
  } catch (err) {
    Logger.log('Error: ' + err.message);
  }

  // Always return 200 — client uses no-cors, response is ignored
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Also handle GET (for browser-based testing)
function doGet(e) {
  return ContentService
    .createTextOutput('Alavanka lead endpoint — OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── Parse request (URLSearchParams or JSON body) ─────────────
function parsePayload(e) {
  var data = {};

  // URLSearchParams form (preferred — all pages should use this)
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    data = e.parameter;

  // JSON body fallback (legacy: index.html exit-intent, guia-crescimento)
  } else if (e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (jsonErr) {
      data = { raw: e.postData.contents };
    }
  }

  // Ensure timestamp exists
  if (!data.timestamp) {
    data.timestamp = new Date().toISOString();
  }

  return data;
}

// ── Map parsed data → sheet row ─────────────────────────────
function buildRow(data) {
  var row = [];
  for (var i = 0; i < COLUMNS.length; i++) {
    var col = COLUMNS[i];
    if (col === 'raw') {
      row.push(JSON.stringify(data));
    } else {
      row.push(data[col] !== undefined ? String(data[col]) : '');
    }
  }
  return row;
}

// ── Write to sheet ───────────────────────────────────────────
function appendRow(row) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Write header if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight('bold')
      .setBackground('#1B3A5C')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow(row);

  // Auto-resize columns on first data row
  if (sheet.getLastRow() === 2) {
    sheet.autoResizeColumns(1, COLUMNS.length);
  }
}

// ── Email alert ──────────────────────────────────────────────
function sendAlert(data) {
  var source  = data.source  || 'unknown';
  var email   = data.email   || '—';
  var name    = data.name    || '—';
  var profile = data.profile || '—';
  var company = data.company || '—';
  var score   = data.score   || '—';
  var level   = data.fit_level || '—';
  var ts      = data.timestamp || new Date().toISOString();

  // Source → human-readable label
  var sourceLabels = {
    'assessment':          '📊 Assessment GTM',
    'guia_7_sinais':       '📘 Guia 7 Sinais (Investidores)',
    'guia_growth_execution':'📄 Guia Crescimento B2B',
    'exit_intent':         '🚪 Exit Intent (index)',
    'investor_report':     '💼 Relatório Investidores',
    'market_entry_cta':    '🌎 Market Entry (alavanka.com)'
  };
  var sourceLabel = sourceLabels[source] || source;

  var subject = '🔔 Novo lead Alavanka — ' + sourceLabel + ' — ' + email;

  var body = [
    '<h2 style="color:#1B3A5C;font-family:sans-serif">Novo lead capturado</h2>',
    '<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">',
    row_('Fonte',    sourceLabel),
    row_('Email',    '<a href="mailto:' + email + '">' + email + '</a>'),
    row_('Nome',     name),
    row_('Perfil',   profile),
    row_('Empresa',  company),
    row_('Score',    score),
    row_('Fit level',level),
    row_('Data/hora',ts),
    '</table>',
    '<p style="margin-top:24px;font-size:12px;color:#888">',
    'Ver todos os leads: ',
    '<a href="https://docs.google.com/spreadsheets/d/' + SpreadsheetApp.getActiveSpreadsheet().getId() + '">',
    'Abrir planilha</a></p>'
  ].join('');

  MailApp.sendEmail({
    to:       ALERT_EMAIL,
    subject:  subject,
    htmlBody: body
  });
}

function row_(label, value) {
  return '<tr>'
    + '<td style="padding:6px 12px 6px 0;font-weight:bold;color:#1B3A5C;white-space:nowrap">' + label + '</td>'
    + '<td style="padding:6px 0">' + value + '</td>'
    + '</tr>';
}
