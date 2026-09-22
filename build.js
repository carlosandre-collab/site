#!/usr/bin/env node
/**
 * Alavanka site build
 * ------------------------------------------------------------
 *  content/posts/*.html  (front matter + article body)
 *      └─► public/blog/posts/<slug>.html   (via templates/post.html)
 *      └─► public/blog/articles.json       (listing index, both sections, both languages)
 *      └─► public/sitemap.xml
 *
 *  Run locally:  node build.js        (Vercel runs it on every deploy — see vercel.json)
 *  The build FAILS (non-zero exit) when a post references a missing thumbnail,
 *  a missing alternate-language post, or a dead internal link — so a broken
 *  blog never reaches production.
 *
 *  Front matter keys (content/posts/<slug>.html, between two "---" lines):
 *    title, description, lang (pt|en), section (growth|market-entry), category,
 *    date (YYYY-MM-DD), readTime (minutes), thumbnail (/assets/...), thumbnailAlt,
 *    alternate (slug of the other-language version, optional), featured (true, optional),
 *    series (e.g. "Canais B2B — Post 2 de 4", optional),
 *    cta (diagnostic|conversation|assessment|market-entry), ctaTitle/ctaText/ctaButton (optional overrides),
 *    faq (JSON array of {q,a}, optional)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content', 'posts');
const PUBLIC = path.join(ROOT, 'public');
const OUT_POSTS = path.join(PUBLIC, 'blog', 'posts');
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'templates', 'post.html'), 'utf8');
const BASE_URL = 'https://www.alavanka.com.br';

const SECTIONS = {
    'growth':       { label: { pt: 'Startup Growth', en: 'Startup Growth' }, home: '/', blog: '/blog' },
    'market-entry': { label: { pt: 'Market Entry',   en: 'Market Entry'   }, home: '/market-entry', blog: '/blog?section=market-entry' },
};
const CTAS = {
    diagnostic: {
        pt: { title: 'Receita travou e você não sabe onde está o problema?', text: 'Nosso diagnóstico gratuito percorre cada camada — do produto ao vendedor — e identifica onde a receita está travando na sua operação.', button: 'Agendar Diagnóstico Gratuito', link: '/#contato' },
        en: { title: "Revenue stalled and you don't know where the problem is?", text: 'Our free diagnostic reviews every layer — from product to sales rep — and identifies where revenue is stuck in your operation.', button: 'Schedule Free Diagnostic', link: '/#contato' },
    },
    conversation: {
        pt: { title: 'Pronto para uma conversa direta?', text: '30 minutos para entender sua situação e avaliar se faz sentido trabalharmos juntos. Sem pitch, sem pressão.', button: 'Agendar Conversa', link: 'https://calendly.com/carlos-andre-alavanka/30min' },
        en: { title: 'Ready for a direct conversation?', text: '30 minutes to understand your situation and evaluate if it makes sense to work together. No pitch, no pressure.', button: 'Schedule a Conversation', link: 'https://calendly.com/carlos-andre-alavanka/30min' },
    },
    assessment: {
        pt: { title: 'Quer avaliar sua operação de vendas?', text: 'Assessment de 2 minutos que revela os principais gaps na sua máquina de vendas — sem compromisso.', button: 'Fazer Assessment Gratuito', link: '/assessment' },
        en: { title: 'Want to assess your sales operation?', text: '2-minute assessment that reveals the main gaps in your sales engine — no strings attached.', button: 'Take Free Assessment', link: '/assessment' },
    },
    'market-entry': {
        pt: { title: 'Entrando na América Latina?', text: 'O modelo Build, Operate & Transfer coloca um operador no mercado certo primeiro — com a sequência de territórios, as referências locais e as decisões de canal já mapeadas.', button: 'Conhecer o modelo Build, Operate & Transfer →', link: '/market-entry' },
        en: { title: 'Entering Latin America?', text: 'The Build, Operate & Transfer model puts an operator on the ground in the right hub first — with the territory sequence, the local references and the channel decisions already mapped.', button: 'Explore the Build, Operate & Transfer Model →', link: '/market-entry' },
    },
};
const MONTHS = {
    pt: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};

// ---------- helpers ----------
const esc = s => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+|[a-z]+);)/g, '&amp;').replace(/"/g, '&quot;');
const stripTags = s => String(s).replace(/<[^>]+>/g, '');
const errors = [];
const warn = m => console.warn('  ⚠ ' + m);
const fail = m => { errors.push(m); console.error('  ✖ ' + m); };

function parseFrontMatter(raw, file) {
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) throw new Error(`${file}: missing front matter (--- ... ---)`);
    const fm = {};
    for (const line of m[1].split(/\r?\n/)) {
        if (!line.trim() || line.trim().startsWith('#')) continue;
        const i = line.indexOf(':');
        if (i < 0) throw new Error(`${file}: bad front matter line "${line}"`);
        const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
        fm[k] = k === 'faq' ? JSON.parse(v) : v;
    }
    return { fm, body: m[2] };
}

function dateLabel(date, lang, short) {
    const [y, mo] = date.split('-').map(Number);
    const name = MONTHS[lang][mo - 1];
    return short ? `${name.slice(0, 3)} ${y}` : (lang === 'pt' ? `${name} ${y}` : `${name} ${y}`);
}
function longDate(date, lang) {
    const [y, mo, d] = date.split('-').map(Number);
    const name = MONTHS[lang][mo - 1];
    return lang === 'pt' ? `${d} de ${name.toLowerCase()} de ${y}` : `${name} ${d}, ${y}`;
}

// ---------- load posts ----------
if (!fs.existsSync(CONTENT)) { console.error('content/posts not found'); process.exit(1); }
const files = fs.readdirSync(CONTENT).filter(f => f.endsWith('.html')).sort();
const posts = [];
for (const f of files) {
    const slug = f.replace(/\.html$/, '');
    const { fm, body } = parseFrontMatter(fs.readFileSync(path.join(CONTENT, f), 'utf8'), f);
    for (const k of ['title', 'description', 'lang', 'section', 'category', 'date', 'readTime', 'thumbnail', 'thumbnailAlt']) {
        if (!fm[k]) fail(`${f}: missing "${k}"`);
    }
    if (!SECTIONS[fm.section]) fail(`${f}: unknown section "${fm.section}"`);
    if (!['pt', 'en'].includes(fm.lang)) fail(`${f}: lang must be pt|en`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date || '')) fail(`${f}: date must be YYYY-MM-DD`);
    if (fm.thumbnail && !fs.existsSync(path.join(PUBLIC, fm.thumbnail.replace(/^\//, '')))) fail(`${f}: thumbnail not found: ${fm.thumbnail}`);
    posts.push({ slug, fm, body, file: f });
}
const bySlug = Object.fromEntries(posts.map(p => [p.slug, p]));
for (const p of posts) {
    if (p.fm.alternate && !bySlug[p.fm.alternate]) fail(`${p.file}: alternate "${p.fm.alternate}" does not exist`);
    if (p.fm.alternate && bySlug[p.fm.alternate] && bySlug[p.fm.alternate].fm.lang === p.fm.lang) fail(`${p.file}: alternate "${p.fm.alternate}" has the same language`);
}

// ---------- link check (internal links inside bodies) ----------
const existsPublic = rel => fs.existsSync(path.join(PUBLIC, rel)) || fs.existsSync(path.join(PUBLIC, rel + '.html'));
for (const p of posts) {
    const links = [...p.body.matchAll(/href="([^"#?]+)[^"]*"/g)].map(m => m[1]);
    for (const l of links) {
        if (/^(https?:|mailto:|tel:|\/\/)/.test(l)) continue;
        let rel;
        if (l.startsWith('/')) rel = l.slice(1);
        else if (l.startsWith('../../')) rel = l.slice(6);
        else if (l.startsWith('../')) rel = 'blog/' + l.slice(3);
        else rel = 'blog/posts/' + l;
        rel = rel.replace(/\.html$/, '');
        if (rel.startsWith('blog/posts/')) { if (!bySlug[rel.slice(11)]) fail(`${p.file}: dead link to post "${l}"`); }
        else if (!existsPublic(rel)) fail(`${p.file}: dead internal link "${l}"`);
    }
}
if (errors.length) { console.error(`\nBuild aborted: ${errors.length} problem(s).`); process.exit(1); }

// ---------- render posts ----------
fs.mkdirSync(OUT_POSTS, { recursive: true });
// remove previously generated posts (anything not in content/) so deletions propagate
for (const f of fs.readdirSync(OUT_POSTS)) {
    if (f.endsWith('.html') && !bySlug[f.replace(/\.html$/, '')]) { fs.unlinkSync(path.join(OUT_POSTS, f)); console.log('  − removed stale ' + f); }
}

function render(p) {
    const { fm, slug, body } = p;
    const lang = fm.lang, sec = SECTIONS[fm.section];
    const url = `${BASE_URL}/blog/posts/${slug}`;
    const alt = fm.alternate ? bySlug[fm.alternate] : null;
    const ptSlug = lang === 'pt' ? slug : (alt ? alt.slug : null);
    const enSlug = lang === 'en' ? slug : (alt ? alt.slug : null);
    const altLinks = [];
    if (ptSlug) altLinks.push(`    <link rel="alternate" hreflang="pt-BR" href="${BASE_URL}/blog/posts/${ptSlug}">`);
    if (enSlug) altLinks.push(`    <link rel="alternate" hreflang="en" href="${BASE_URL}/blog/posts/${enSlug}">`);
    altLinks.push(`    <link rel="alternate" hreflang="x-default" href="${BASE_URL}/blog/posts/${ptSlug || enSlug}">`);
    const ogImage = fm.thumbnail.endsWith('.html') ? `${BASE_URL}/assets/images/brand/og-default.jpg` : BASE_URL + fm.thumbnail;
    const schema = {
        '@context': 'https://schema.org', '@type': 'Article', headline: stripTags(fm.title), description: fm.description,
        image: ogImage,
        author: { '@type': 'Person', name: 'Carlos André', jobTitle: 'Founder, Alavanka', url: BASE_URL },
        publisher: { '@type': 'Organization', name: 'Alavanka', logo: { '@type': 'ImageObject', url: `${BASE_URL}/assets/images/brand/logo-preto.png` } },
        datePublished: fm.date, dateModified: fm.date, inLanguage: lang === 'pt' ? 'pt-BR' : 'en',
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };
    let schemaFaq = '';
    if (fm.faq && fm.faq.length) {
        const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: fm.faq.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) };
        schemaFaq = `    <script type="application/ld+json">\n${JSON.stringify(faq, null, 2)}\n    </script>`;
    }
    const cta = Object.assign({}, CTAS[fm.cta || (fm.section === 'market-entry' ? 'market-entry' : 'diagnostic')][lang]);
    if (fm.ctaTitle) cta.title = fm.ctaTitle;
    if (fm.ctaText) cta.text = fm.ctaText;
    if (fm.ctaButton) cta.button = fm.ctaButton;
    if (fm.ctaLink) cta.link = fm.ctaLink;
    const hero = fm.thumbnail.endsWith('.html')
        ? `                <div class="hero-image"><iframe src="${fm.thumbnail}" title="${esc(fm.thumbnailAlt)}" loading="lazy"></iframe></div>`
        : `                <div class="hero-image"><img src="${fm.thumbnail}" alt="${esc(fm.thumbnailAlt)}" width="1200" height="630" fetchpriority="high"></div>`;
    const vars = {
        htmlLang: lang === 'pt' ? 'pt-BR' : 'en', lang, slug, section: fm.section, category: esc(fm.category),
        title: esc(stripTags(fm.title)), titleHtml: fm.title, titleTag: esc(stripTags(fm.titleTag || fm.title)),
        description: esc(fm.description), url, ogImage, ogLocale: lang === 'pt' ? 'pt_BR' : 'en_US', date: fm.date,
        readTime: fm.readTime, readTimeLabel: lang === 'pt' ? `${fm.readTime} min de leitura` : `${fm.readTime} min read`,
        dateLabel: longDate(fm.date, lang), alternateLinks: altLinks.join('\n'),
        schemaArticle: JSON.stringify(schema, null, 2).replace(/^/gm, '    '), schemaFaq,
        skipLink: lang === 'pt' ? 'Pular para o conteúdo' : 'Skip to content',
        sectionHome: sec.home, sectionLabel: sec.label[lang], blogUrl: sec.blog,
        seriesMeta: fm.series ? `\n                        <span class="meta-dot" aria-hidden="true"></span>\n                        <span class="series-tag">${esc(fm.series)}</span>` : '',
        hero, body: body.replace(/\s+$/, '').replace(/^/gm, '                    '),
        ctaTitle: cta.title, ctaText: cta.text, ctaButton: cta.button, ctaLink: cta.link,
        ctaTarget: /^https?:/.test(cta.link) ? ' target="_blank" rel="noopener noreferrer"' : '',
        toggleUrl: alt ? `/blog/posts/${alt.slug}` : (lang === 'pt' ? '/blog?lang=en' : '/blog?lang=pt'),
    };
    return TEMPLATE.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : (fail(`template var ${k} missing`), '')));
}

for (const p of posts) fs.writeFileSync(path.join(OUT_POSTS, p.slug + '.html'), render(p));
console.log(`✓ ${posts.length} posts rendered to public/blog/posts/`);

// ---------- articles.json ----------
const index = {
    generated: new Date().toISOString().slice(0, 10),
    sections: Object.fromEntries(Object.entries(SECTIONS).map(([k, v]) => [k, v.label])),
    posts: posts.map(p => ({
        slug: p.slug, lang: p.fm.lang, section: p.fm.section, category: p.fm.category,
        title: stripTags(p.fm.title), excerpt: p.fm.description, date: p.fm.date,
        dateLabel: dateLabel(p.fm.date, p.fm.lang, true), readTime: Number(p.fm.readTime),
        thumbnail: p.fm.thumbnail, thumbnailAlt: p.fm.thumbnailAlt,
        alternate: p.fm.alternate || null, featured: p.fm.featured === 'true' || p.fm.featured === true,
        series: p.fm.series || null,
    })).sort((a, b) => b.date.localeCompare(a.date)),
};
fs.writeFileSync(path.join(PUBLIC, 'blog', 'articles.json'), JSON.stringify(index, null, 2));
console.log(`✓ articles.json (${index.posts.length} entries)`);

// ---------- sitemap ----------
const staticPages = [
    ['/', '1.0', 'weekly'], ['/blog', '0.9', 'weekly'], ['/guia-crescimento-receita-b2b', '0.9', 'monthly'],
    ['/market-entry', '0.9', 'weekly'], ['/investidores', '0.7', 'monthly'], ['/assessment', '0.7', 'monthly'],
    ['/guia-7-sinais', '0.7', 'monthly'], ['/privacy', '0.3', 'yearly'],
];
const today = new Date().toISOString().slice(0, 10);
let sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
for (const [u, pr, cf] of staticPages) sm += `  <url><loc>${BASE_URL}${u}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>\n`;
for (const p of posts) {
    const alt = p.fm.alternate ? bySlug[p.fm.alternate] : null;
    sm += `  <url><loc>${BASE_URL}/blog/posts/${p.slug}</loc><lastmod>${p.fm.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>`;
    if (alt) {
        const pt = p.fm.lang === 'pt' ? p.slug : alt.slug, en = p.fm.lang === 'en' ? p.slug : alt.slug;
        sm += `<xhtml:link rel="alternate" hreflang="pt-BR" href="${BASE_URL}/blog/posts/${pt}"/><xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/blog/posts/${en}"/>`;
    }
    sm += '</url>\n';
}
sm += '</urlset>\n';
fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), sm);
console.log(`✓ sitemap.xml (${staticPages.length + posts.length} URLs)`);
