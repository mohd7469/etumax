import React, { useEffect, useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import { Helmet } from 'react-helmet-async';

// Helper to escape XML characters
const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.toString().replace(/[<>&'"]/g, (c) => {
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

export const ProductSitemapXml = () => {
  const { products } = useProducts();
  const [xml, setXml] = useState('');

  useEffect(() => {
    // Note: In a pure client-side SPA, setting true HTTP response headers is not possible.
    // A backend/SSR approach is needed for true `Content-Type: application/xml`.
    // We render the raw XML string so it can be viewed and scraped.
    const generatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products.map(p => `  <url>
    <loc>https://shaapar.com/product/${escapeXml(p.slug || p.id)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
    setXml(generatedXml);
  }, [products]);

  return (
    <>
      <Helmet>
        <title>products.xml</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', margin: 0, padding: '20px', fontFamily: 'monospace' }}>
        {xml}
      </pre>
    </>
  );
};

export const CategorySitemapXml = () => {
  const { categories } = useProducts();
  const [xml, setXml] = useState('');

  useEffect(() => {
    const generatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.filter(c => c.id !== 'all').map(c => `  <url>
    <loc>https://shaapar.com/category/${escapeXml(c.slug || c.id)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;
    setXml(generatedXml);
  }, [categories]);

  return (
    <>
      <Helmet>
        <title>categories.xml</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', margin: 0, padding: '20px', fontFamily: 'monospace' }}>
        {xml}
      </pre>
    </>
  );
};

export const MainSitemapXml = () => {
  const [xml, setXml] = useState('');

  useEffect(() => {
    const generatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://shaapar.com/sitemaps/products.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://shaapar.com/sitemaps/categories.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://shaapar.com/sitemaps/pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
    setXml(generatedXml);
  }, []);

  return (
    <>
      <Helmet>
        <title>sitemap.xml</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', margin: 0, padding: '20px', fontFamily: 'monospace' }}>
        {xml}
      </pre>
    </>
  );
};