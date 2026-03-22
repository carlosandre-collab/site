const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.alavanka.com.br';

// Páginas estáticas
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/blog.html', priority: '0.9', changefreq: 'weekly' },
  { url: '/guia-crescimento-receita-b2b.html', priority: '0.9', changefreq: 'monthly' },
  { url: '/market-entry.html', priority: '0.9', changefreq: 'weekly' },
  { url: '/market-entry/blog.html', priority: '0.8', changefreq: 'weekly' },
  { url: '/investidores.html', priority: '0.7', changefreq: 'monthly' },
  { url: '/assessment.html', priority: '0.7', changefreq: 'monthly' }
];

// Extensões de arquivos que NÃO são artigos
const ignoredExtensions = [
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.css',
  '.js'
];

// Função para buscar todos HTMLs em /blog/posts (nova estrutura)
function getBlogPosts() {
  // Nova estrutura: /public/blog/posts
  let blogDir = path.join(__dirname, 'public', 'blog', 'posts');
  
  if (!fs.existsSync(blogDir)) {
    console.log('❌ Pasta /public/blog/posts não encontrada!');
    return [];
  }
  
  console.log('✅ Pasta blog/posts encontrada em:', blogDir);
  
  const files = fs.readdirSync(blogDir)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      
      // Ignorar arquivos de ilustração
      if (file.startsWith('ilustracao_') || file.startsWith('ilustracao-')) {
        console.log(`   ⏭️  Ignorando: ${file} (ilustração)`);
        return false;
      }
      
      // Ignorar imagens e outros arquivos não-HTML
      if (ignoredExtensions.includes(ext)) {
        console.log(`   ⏭️  Ignorando: ${file} (tipo: ${ext})`);
        return false;
      }
      
      // Ignorar arquivos que não são HTML
      if (!file.endsWith('.html')) {
        console.log(`   ⏭️  Ignorando: ${file} (não é HTML)`);
        return false;
      }
      
      console.log(`   ✅ Incluindo: ${file}`);
      return true;
    })
    .map(file => {
      const filePath = path.join(blogDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        url: `/blog/posts/${file}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: stats.mtime.toISOString().split('T')[0]
      };
    });
  
  console.log(`✅ Total de ${files.length} artigos encontrados`);
  return files;
}

// Função para buscar todos HTMLs em /market-entry/posts
function getMarketEntryPosts() {
  let dir = path.join(__dirname, 'public', 'market-entry', 'posts');

  if (!fs.existsSync(dir)) {
    console.log('⚠️  Pasta /public/market-entry/posts não encontrada — pulando.');
    return [];
  }

  console.log('✅ Pasta market-entry/posts encontrada em:', dir);

  const files = fs.readdirSync(dir)
    .filter(file => {
      if (!file.endsWith('.html')) return false;
      console.log(`   ✅ Incluindo: ${file}`);
      return true;
    })
    .map(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      return {
        url: `/market-entry/posts/${file}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: stats.mtime.toISOString().split('T')[0]
      };
    });

  console.log(`✅ Total de ${files.length} artigos market-entry encontrados`);
  return files;
}

// Gerar sitemap
function generateSitemap() {
  console.log('🔨 Iniciando geração do sitemap...');
  
  const allPages = [...staticPages, ...getBlogPosts(), ...getMarketEntryPosts()];
  
  // CRÍTICO: Declaração XML DEVE ser a primeira linha (sem espaços antes)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Salva em /public se existir, senão na raiz
  const publicDir = path.join(__dirname, 'public');
  const sitemapPath = fs.existsSync(publicDir) 
    ? path.join(publicDir, 'sitemap.xml')
    : path.join(__dirname, 'sitemap.xml');
  
  fs.writeFileSync(sitemapPath, sitemap);
  
  console.log(`\n✅ Sitemap gerado com sucesso!`);
  console.log(`📍 Local: ${sitemapPath}`);
  console.log(`📊 Total de páginas: ${allPages.length}\n`);
  console.log('📋 URLs incluídas:');
  allPages.forEach(page => {
    console.log(`   - ${page.url}`);
  });
  
  console.log('\n✨ Sitemap pronto para deploy!');
}

// Executar
try {
  generateSitemap();
} catch (error) {
  console.error('❌ Erro ao gerar sitemap:', error.message);
  process.exit(1);
}
