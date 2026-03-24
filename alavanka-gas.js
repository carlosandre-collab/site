// ============================================================
// Alavanka — Unified Lead Capture
// Google Apps Script  (Apps Script → Deploy → Web App)
// Execute as: Me | Who has access: Anyone
//
// Setup:
//   1. sheets.google.com → criar planilha nova → renomear aba para "Leads"
//   2. Extensions → Apps Script → colar este arquivo inteiro → salvar
//   3. Deploy → New deployment → Web app
//      Execute as: Me  |  Access: Anyone
//   4. Copiar a URL /exec
//   5. No terminal do repo:
//      python3 tools/patch-gas-url.py \
//        --gas-url "https://script.google.com/macros/s/SUA_URL/exec" \
//        --dir ./public
//      git add -A && git commit -m "fix: GAS URL de produção" && git push
// ============================================================

var ALERT_EMAIL = 'carlos@alavanka.com';
var SHEET_NAME  = 'Leads';

// ── Colunas do Sheet ─────────────────────────────────────────
// Para adicionar campos no futuro: inclua o nome aqui E no Sheet
// (se já houver dados, adicione a coluna manualmente primeiro).
var COLUMNS = [
  'timestamp',          // ISO 8601 — quando o lead foi capturado
  'source',             // qual form: assessment | guia_7_sinais | guia_growth_execution | exit_intent | investor_report | market_entry_cta
  'email',              // email do visitante
  'name',               // nome (nem todos os forms capturam)
  'profile',            // cargo/perfil selecionado
  'company',            // empresa ou fundo
  'newsletter_growth',  // 'yes' / 'no' — interesse em B2B Growth
  'newsletter_latam',   // 'yes' / 'no' — interesse em LatAm Market Entry
  'score',              // assessment only: pontuação total (1–15)
  'fit_level',          // assessment only: 'high' | 'medium' | 'low'
  'answers',            // assessment only: JSON com respostas por pergunta
  'answer_labels',      // assessment only: JSON com labels das respostas
  'indicators',         // assessment only: JSON com diagnóstico por indicador
  'page',               // pathname da página no momento do submit
  'lang',               // idioma ativo: 'pt' | 'en'
  'raw'                 // dump completo do payload (debug)
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
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput('Alavanka lead endpoint — OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── Parse request ────────────────────────────────────────────
function parsePayload(e) {
  var data = {};
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    data = e.parameter;
  } else if (e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (jsonErr) {
      data = { raw: e.postData.contents };
    }
  }
  if (!data.timestamp) {
    data.timestamp = new Date().toISOString();
  }
  return data;
}

// ── Montar linha ─────────────────────────────────────────────
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

// ── Gravar no Sheet ──────────────────────────────────────────
function appendRow(row) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight('bold')
      .setBackground('#1B3A5C')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, COLUMNS.length);
  }
  sheet.appendRow(row);
}

// ── Email alert ──────────────────────────────────────────────
function sendAlert(data) {
  var source   = data.source            || 'unknown';
  var email    = data.email             || '—';
  var name     = data.name              || '—';
  var profile  = data.profile           || '—';
  var company  = data.company           || '—';
  var score    = data.score             || '—';
  var level    = data.fit_level         || '—';
  var growth   = data.newsletter_growth || '—';
  var latam    = data.newsletter_latam  || '—';
  var ts       = data.timestamp         || new Date().toISOString();

  var sourceLabels = {
    'assessment':           '📊 Assessment GTM',
    'guia_7_sinais':        '📘 Guia 7 Sinais (Investidores)',
    'guia_growth_execution':'📄 Guia Crescimento B2B',
    'exit_intent':          '🚪 Exit Intent (index.html)',
    'investor_report':      '💼 Relatório Investidores',
    'market_entry_cta':     '🌎 Market Entry (alavanka.com)'
  };
  var sourceLabel = sourceLabels[source] || source;

  var nlGrowthIcon = growth === 'yes' ? '✅' : '☐';
  var nlLatamIcon  = latam  === 'yes' ? '✅' : '☐';

  var subject = '🔔 Novo lead — ' + sourceLabel + ' — ' + email;

  var body = [
    '<div style="font-family:sans-serif;max-width:520px">',
    '<h2 style="color:#1B3A5C;margin-bottom:4px">Novo lead capturado</h2>',
    '<p style="color:#8C8CA1;font-size:12px;margin-top:0">' + ts + '</p>',
    '<table style="border-collapse:collapse;font-size:14px;width:100%">',
    row_('Fonte',   '<strong>' + sourceLabel + '</strong>'),
    row_('Email',   '<a href="mailto:' + email + '" style="color:#1B3A5C">' + email + '</a>'),
    row_('Nome',    name),
    row_('Perfil',  profile),
    row_('Empresa', company),
    '</table>',
    '<h3 style="color:#1B3A5C;font-size:13px;margin:20px 0 8px;text-transform:uppercase;letter-spacing:0.05em">Newsletter</h3>',
    '<table style="border-collapse:collapse;font-size:14px;width:100%">',
    row_(nlGrowthIcon + ' B2B Growth & Receita', growth === 'yes' ? 'Sim' : 'Não'),
    row_(nlLatamIcon  + ' Expansão para LatAm',  latam  === 'yes' ? 'Sim' : 'Não'),
    '</table>',
    score !== '—' ? (
      '<h3 style="color:#1B3A5C;font-size:13px;margin:20px 0 8px;text-transform:uppercase;letter-spacing:0.05em">Diagnóstico</h3>' +
      '<table style="border-collapse:collapse;font-size:14px;width:100%">' +
      row_('Score',     score + ' / 15') +
      row_('Fit level', fitBadge(level)) +
      '</table>'
    ) : '',
    '<p style="margin-top:24px;font-size:12px;color:#8C8CA1">',
    '<a href="https://docs.google.com/spreadsheets/d/' + SpreadsheetApp.getActiveSpreadsheet().getId() + '" style="color:#1B3A5C">',
    'Ver todos os leads →</a></p>',
    '</div>'
  ].join('');

  MailApp.sendEmail({ to: ALERT_EMAIL, subject: subject, htmlBody: body });
}

function row_(label, value) {
  return '<tr>'
    + '<td style="padding:6px 12px 6px 0;color:#4A5568;white-space:nowrap;vertical-align:top">' + label + '</td>'
    + '<td style="padding:6px 0;color:#0D1B2A">' + (value || '—') + '</td>'
    + '</tr>';
}

function fitBadge(level) {
  var colors = { 'high':'background:#D1FAE5;color:#065F46', 'medium':'background:#FEF3C7;color:#92400E', 'low':'background:#FEE2E2;color:#991B1B' };
  var labels = { 'high':'Alto', 'medium':'Médio', 'low':'Baixo' };
  var style  = colors[level] || 'background:#F3F4F6;color:#374151';
  return '<span style="' + style + ';padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600">' + (labels[level] || level) + '</span>';
}
