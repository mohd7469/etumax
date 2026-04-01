export const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const generateSitemapIndex = (baseUrl) => {
  const url = (baseUrl || window.location.origin).replace(/\/$/, '');
  const now = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${url}/sitemap_products.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${url}/sitemap_categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${url}/sitemap_pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
};

export const generateProductsSitemap = (products, baseUrl) => {
  const url = (baseUrl || window.location.origin).replace(/\/$/, '');
  
  const urls = (products || []).map(product => {
    const slug = escapeXml(product.slug || product.id);
    const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
    return `  <url>
    <loc>${url}/product/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

export const generateCategoriesSitemap = (categories, baseUrl) => {
  const url = (baseUrl || window.location.origin).replace(/\/$/, '');
  
  const urls = (categories || []).map(category => {
    const slug = escapeXml(category.slug || category.id || category.name?.toLowerCase().replace(/\s+/g, '-'));
    const lastMod = category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString();
    return `  <url>
    <loc>${url}/categories/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

export const generatePagesSitemap = (pages, baseUrl) => {
  const url = (baseUrl || window.location.origin).replace(/\/$/, '');
  const now = new Date().toISOString();
  
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/products', priority: '0.9', changefreq: 'daily' },
    { loc: '/categories', priority: '0.8', changefreq: 'weekly' },
    { loc: '/cart', priority: '0.5', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
  ];

  const staticUrls = staticPages.map(page => `  <url>
    <loc>${url}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  const dynamicUrls = (pages || []).map(page => {
    const slug = escapeXml(page.slug || page.id);
    const lastMod = page.updatedAt ? new Date(page.updatedAt).toISOString() : now;
    return `  <url>
    <loc>${url}/page/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${dynamicUrls ? '\n' + dynamicUrls : ''}
</urlset>`;
};

export const downloadSitemapFile = (filename, xmlContent) => {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 100);
};