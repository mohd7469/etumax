import { getAllDocuments } from '@/lib/firestoreService';
import JSZip from 'jszip';

const CURRENT_DATE = '2026-03-31';

const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
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

const formatDate = (dateInput) => {
  if (!dateInput) return CURRENT_DATE;
  try {
    const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    // fallback
  }
  return CURRENT_DATE;
};

export const generateProductsSitemap = async (baseUrl = 'https://www.etumaxgulf.com') => {
  try {
    const products = await getAllDocuments('products');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    
    if (products && products.length > 0) {
      products.forEach(product => {
        if (!product.slug) return;
        
        const lastmod = formatDate(product.updatedAt || product.createdAt);
        const imgUrl = product.images?.[0] || product.mainImage || product.image || '';
        const name = product.name || product.title || '';
        
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/products/${escapeXml(product.slug)}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        
        if (imgUrl && imgUrl.startsWith('http')) {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${escapeXml(imgUrl)}</image:loc>\n`;
          if (name) xml += `      <image:title>${escapeXml(name)}</image:title>\n`;
          xml += `    </image:image>\n`;
        }
        
        xml += `  </url>\n`;
      });
    }
    
    xml += `</urlset>`;
    return xml;
  } catch (error) {
    console.error("Error generating products sitemap:", error);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>`;
  }
};

export const generateCategoriesSitemap = async (baseUrl = 'https://www.etumaxgulf.com') => {
  try {
    const categories = await getAllDocuments('categories');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        if (!category.slug) return;
        
        const lastmod = formatDate(category.updatedAt || category.createdAt);
        
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/category/${escapeXml(category.slug)}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });
    }
    
    xml += `</urlset>`;
    return xml;
  } catch (error) {
    console.error("Error generating categories sitemap:", error);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  }
};

export const generatePagesSitemap = (baseUrl = 'https://www.etumaxgulf.com') => {
  const pages = [
    { path: '', priority: '1.0' },
    { path: '/products', priority: '0.9' },
    { path: '/categories', priority: '0.8' },
    { path: '/contact', priority: '0.7' },
    { path: '/privacy-policy', priority: '0.6' },
    { path: '/refund-policy', priority: '0.6' },
    { path: '/shipping-policy', priority: '0.6' },
    { path: '/terms-conditions', priority: '0.6' },
    { path: '/payment-policy', priority: '0.6' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  pages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });
  
  xml += `</urlset>`;
  return xml;
};

export const generateSitemapIndex = (baseUrl = 'https://www.etumaxgulf.com') => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  const sitemaps = ['products', 'categories', 'pages'];
  
  sitemaps.forEach(type => {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap_${type}.xml</loc>\n`;
    xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  });
  
  xml += `</sitemapindex>`;
  return xml;
};

export const generateRobotsTxt = (baseUrl = 'https://www.etumaxgulf.com') => {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap_index.xml
`;
};

export const downloadSitemapFile = async (sitemapsData) => {
  try {
    const zip = new JSZip();
    
    if (sitemapsData.index) zip.file('sitemap_index.xml', sitemapsData.index);
    if (sitemapsData.products) zip.file('sitemap_products.xml', sitemapsData.products);
    if (sitemapsData.categories) zip.file('sitemap_categories.xml', sitemapsData.categories);
    if (sitemapsData.pages) zip.file('sitemap_pages.xml', sitemapsData.pages);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemaps.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Error downloading sitemaps zip:", error);
    return false;
  }
};