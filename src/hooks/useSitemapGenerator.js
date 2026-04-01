import { useProducts } from '@/context/ProductContext';
import { useIntegrations } from '@/context/IntegrationContext';

export const useSitemapGenerator = () => {
  const { products, categories } = useProducts();
  const { syncedPages } = useIntegrations();

  const formatDateForSitemap = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const escapeXmlString = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const generateSitemapIndex = (baseUrl) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/product-sitemap.xml</loc>
    <lastmod>${formatDateForSitemap()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/category-sitemap.xml</loc>
    <lastmod>${formatDateForSitemap()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/page-sitemap.xml</loc>
    <lastmod>${formatDateForSitemap()}</lastmod>
  </sitemap>
</sitemapindex>`;
  };

  const generateProductsSitemap = (baseUrl) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    products.forEach(product => {
      const slug = product.slug || product.id;
      xml += `  <url>
    <loc>${baseUrl}/product/${escapeXmlString(slug)}</loc>
    <lastmod>${formatDateForSitemap(product.updatedAt || product.createdAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  };

  const generateCategoriesSitemap = (baseUrl) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    categories.forEach(category => {
      const slug = category.slug || category.id;
      if (slug !== 'all') {
        xml += `  <url>
    <loc>${baseUrl}/products/${escapeXmlString(slug)}</loc>
    <lastmod>${formatDateForSitemap()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      }
    });

    xml += `</urlset>`;
    return xml;
  };

  const generatePagesSitemap = (baseUrl) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    const staticPages = [
      { path: '', priority: '1.0' },
      { path: 'products', priority: '0.9' },
    ];

    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}/${page.path}</loc>
    <lastmod>${formatDateForSitemap()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
    });

    // Dynamic Pages
    syncedPages?.filter(p => p.showOnStore).forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}/page/${escapeXmlString(page.slug)}</loc>
    <lastmod>${formatDateForSitemap(page.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  };

  return {
    generateSitemapIndex,
    generateProductsSitemap,
    generateCategoriesSitemap,
    generatePagesSitemap,
    formatDateForSitemap,
    escapeXmlString
  };
};