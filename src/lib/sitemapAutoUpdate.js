
import { saveSitemapMetadata } from './sitemapStorage';
import { generateProductsSitemap, generateCategoriesSitemap, generatePagesSitemap, generateSitemapIndex } from './sitemapGenerator';

export const regenerateSitemaps = (products, categories, pages) => {
  try {
    const domain = typeof window !== 'undefined' ? window.location.origin : '';
    
    // In a real backend this would write to the filesystem.
    // Here we just generate the strings and update the local metadata stats.
    const productsXml = generateProductsSitemap(products, domain);
    const categoriesXml = generateCategoriesSitemap(categories, domain);
    const pagesXml = generatePagesSitemap(pages, domain);
    const indexXml = generateSitemapIndex(domain);

    saveSitemapMetadata(new Date().toISOString(), {
      productCount: products?.length || 0,
      categoryCount: categories?.length || 0,
      pageCount: pages?.length || 0,
      sizes: {
        products: productsXml.length,
        categories: categoriesXml.length,
        pages: pagesXml.length,
        index: indexXml.length
      }
    });

  } catch (error) {
    console.error('Silent sitemap regeneration failed:', error);
  }
};
