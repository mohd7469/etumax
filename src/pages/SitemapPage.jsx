
import React, { useEffect, useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming Firebase initialized here

const SitemapPage = () => {
  const { products, categories } = useProducts();
  const [xmlContent, setXmlContent] = useState('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const baseUrl = window.location.origin;
        const urls = [];

        // Homepage
        urls.push({ loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' });

        // Products
        products.forEach(p => {
          urls.push({
            loc: `${baseUrl}/product/${p.slug || p.id}`,
            priority: '0.8',
            changefreq: 'weekly',
            lastmod: new Date().toISOString().split('T')[0]
          });
        });

        // Categories
        categories.forEach(c => {
          urls.push({
            loc: `${baseUrl}/products/${c.slug || c.id}`,
            priority: '0.7',
            changefreq: 'weekly'
          });
        });

        // Dynamic Pages
        try {
          if (db) {
            const pagesSnap = await getDocs(collection(db, 'pages'));
            pagesSnap.forEach(doc => {
              const data = doc.data();
              if (data.slug && data.showOnStore !== false) {
                urls.push({
                  loc: `${baseUrl}/page/${data.slug}`,
                  priority: '0.6',
                  changefreq: 'monthly'
                });
              }
            });
          }
        } catch (e) {
          console.log("Could not fetch dynamic pages for sitemap", e);
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        urls.forEach(u => {
          xml += `  <url>\n`;
          xml += `    <loc>${u.loc}</loc>\n`;
          if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
          if (u.changefreq) xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
          if (u.priority) xml += `    <priority>${u.priority}</priority>\n`;
          xml += `  </url>\n`;
        });
        
        xml += `</urlset>`;
        
        setXmlContent(xml);

        // Replace entire document content to serve raw XML natively
        document.documentElement.innerHTML = `<pre style="word-wrap: break-word; white-space: pre-wrap;">${xml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        document.title = 'sitemap.xml';

      } catch (error) {
        console.error("Error generating sitemap:", error);
      }
    };

    if (products.length > 0) {
      generateSitemap();
    }
  }, [products, categories]);

  return null; // Renders nothing in normal React tree
};

export default SitemapPage;
