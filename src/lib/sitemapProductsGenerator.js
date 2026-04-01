
import { getAllDocuments } from '@/lib/firestoreService';

export const generateProductsSitemapXml = async () => {
  try {
    const products = await getAllDocuments('products');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    
    if (products && products.length > 0) {
      products.forEach(product => {
        if (!product.slug) return;
        
        const slug = product.slug;
        
        // Extract lastmod as YYYY-MM-DD
        let lastmod = new Date().toISOString().split('T')[0];
        if (product.updatedAt) {
          try {
            const d = product.updatedAt.toDate ? product.updatedAt.toDate() : new Date(product.updatedAt);
            if (!isNaN(d.getTime())) {
              lastmod = d.toISOString().split('T')[0];
            }
          } catch (e) {
            // fallback to current date already set
          }
        }
        
        // Extract main image URL
        const imgUrl = product.images?.[0] || product.mainImage || product.image || '';
        const name = product.name || product.title || 'Product';
        
        xml += `  <url>\n`;
        xml += `    <loc>https://etumaxgulf.com/product/${slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        
        if (imgUrl && imgUrl.startsWith('http')) {
          xml += `    <image:image>\n`;
          // Escape special characters for XML
          xml += `      <image:loc>${imgUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}</image:loc>\n`;
          xml += `      <image:title>${name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}</image:title>\n`;
          xml += `    </image:image>\n`;
        }
        
        xml += `  </url>\n`;
      });
    }
    
    xml += `</urlset>`;
    return xml;
  } catch (error) {
    // Return empty valid XML on error to ensure format is preserved
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>`;
  }
};
