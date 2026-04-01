
import React, { useEffect } from 'react';
import { generateProductsSitemapXml } from '@/lib/sitemapProductsGenerator';

const SitemapProductsXml = () => {
  useEffect(() => {
    const generateAndServeXml = async () => {
      const xmlString = await generateProductsSitemapXml();
      
      // In a purely client-side React app, we cannot intercept the initial HTTP response 
      // headers (like Content-Type: application/xml) without a backend like Express or Edge functions.
      // However, we can replace the document content dynamically so that if a user or 
      // simple scraper visits the page, they see the raw XML.
      
      // We use a Blob URL redirection as a fallback to force the browser to treat it as XML
      // if direct document writing doesn't trigger the browser's XML viewer.
      
      try {
        const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.location.replace(url);
      } catch (e) {
        // Fallback: overwrite DOM
        document.open();
        document.write(xmlString);
        document.close();
      }
    };

    generateAndServeXml();
  }, []);

  // Return null or a simple loader while it redirects
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      Generating XML Sitemap...
    </div>
  );
};

export default SitemapProductsXml;
