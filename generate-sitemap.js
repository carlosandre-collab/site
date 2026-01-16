const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.alavanka.com.br';

// Páginas estáticas
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/blog.html', priority: '0.9', changefreq: 'weekly' }
];

// Função para buscar todos HTMLs em /blog
function getBlogPosts() {
  const blogDir = path.join(__dirname, 'blog');
  
  if (!fs.existsSync(blogDir)) {
    return [];
  }
  
  const files = fs.readdirSync(blogDir)
    .filter(file => file.endsWith('.html'))
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

  fs.writeFileSync('sitemap.xml', sitemap);
  console.log(`✅ Sitemap gerado com ${allPages.length} páginas`);
  
  allPages.forEach(page => {
    console.log(`   - ${page.url}`);
  });
}

generateSitemap();
