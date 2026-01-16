const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.alavanka.com.br';

// Páginas estáticas
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/blog.html', priority: '0.9', changefreq: 'weekly' }
];

// Função para buscar todos HTMLs em /blog (procura em 2 lugares)
function getBlogPosts() {
  // Tenta procurar em /public/blog primeiro
  let blogDir = path.join(__dirname, 'public', 'blog');
  
  // Se não existir, procura em /blog na raiz
  if (!fs.existsSync(blogDir)) {
    console.log('⚠️ /public/blog não encontrado, procurando em /blog');
    blogDir = path.join(__dirname, 'blog');
  }
  
  if (!fs.existsSync(blogDir)) {
    console.log('❌ Pasta /blog não encontrada em lugar nenhum!');
    console.log('   Procurei em:', path.join(__dirname, 'public', 'blog'));
    console.log('   E também em:', path.join(__dirname, 'blog'));
    return [];
  }
  
  console.log('✅ Pasta blog encontrada em:', blogDir);
  
  const files = fs.readdirSync(blogDir)
    .filter(file => {
      const isHtml = file.endsWith('.html');
      console.log(`   Arquivo: ${file} - HTML? ${isHtml}`);
      return isHtml;
    })
    .map(file => {
      const filePath = path.join(blogDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        url: `/blog/${file}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: stats.mtime.toISOString().split('T')[0]
      };
    });
  
  console.log(`✅ Encontrados ${files.length} artigos`);
  return files;
}

// Gerar sitemap
function generateSitemap() {
  const allPages = [...staticPages, ...getBlogPosts()];
  
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
  
  console.log(`✅ Sitemap gerado com ${allPages.length} páginas em: ${sitemapPath}`);
  allPages.forEach(page => {
    console.log(`   - ${page.url}`);
  });
}

generateSitemap();
