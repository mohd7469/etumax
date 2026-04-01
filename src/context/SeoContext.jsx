
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useProducts } from './ProductContext';
import { useIntegrations } from './IntegrationContext';
import { listenToDocument, setDocument, getDocument } from '@/lib/firestoreService';
import { 
  generateSitemapIndex, 
  generateProductsSitemap, 
  generateCategoriesSitemap, 
  generatePagesSitemap 
} from '@/lib/sitemapGeneratorV2';

const SeoContext = createContext();

export const getSeoDataFor = async (pageOrProductId) => {
  try {
    const seoDoc = await getDocument('settings', 'seo');
    if (seoDoc && seoDoc.data && seoDoc.data[pageOrProductId]) {
      return seoDoc.data[pageOrProductId];
    }
    return { 
      title: '', 
      description: '', 
      keywords: '', 
      ogTitle: '', 
      ogDescription: '', 
      ogImage: '', 
      canonicalUrl: '' 
    };
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return { 
      title: '', 
      description: '', 
      keywords: '', 
      ogTitle: '', 
      ogDescription: '', 
      ogImage: '', 
      canonicalUrl: '' 
    };
  }
};

export const getSchemaDataFor = async (pageOrProductId) => {
  try {
    const seoDoc = await getDocument('settings', 'seo');
    if (seoDoc && seoDoc.schema && seoDoc.schema[pageOrProductId]) {
      return seoDoc.schema[pageOrProductId];
    }
    return null;
  } catch (error) {
    console.error('Error fetching schema data:', error);
    return null;
  }
};

export const useSeo = () => useContext(SeoContext);

const defaultGeneralSettings = { 
  title: ' - Your Best E Shop', 
  metaDescription: 'Discover amazing products at unbeatable prices.', 
  searchEngineVisibility: 'on', 
  autoGenerateMeta: true, 
  autoCanonical: true, 
  storeUrl: window.location.origin 
};

const defaultRobotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${window.location.origin}/sitemap_index.xml\n`;

export const SeoProvider = ({ children }) => {
  const { products, categories } = useProducts();
  const { syncedPages } = useIntegrations();
  
  const [generalSettings, setGeneralSettings] = useState(defaultGeneralSettings);
  const [sitemapSettings, setSitemapSettings] = useState({ autoGenerate: true });
  const [robotsTxt, setRobotsTxt] = useState(defaultRobotsTxt);
  const [redirects, setRedirects] = useState([]);
  const [verificationCodes, setVerificationCodes] = useState({ google: '', bing: '', pinterest: '' });
  const [seoData, setSeoData] = useState({});
  const [schemaData, setSchemaData] = useState({});

  // New Sitemap V2 State
  const [sitemapDomain, setSitemapDomain] = useState(window.location.origin);
  const [generatedSitemaps, setGeneratedSitemaps] = useState({
    index: '',
    products: '',
    categories: '',
    pages: ''
  });
  const [sitemapTimestamps, setSitemapTimestamps] = useState({
    index: null,
    products: null,
    categories: null,
    pages: null
  });

  useEffect(() => {
    const unsub = listenToDocument('settings', 'seo', (data) => {
      if (data) {
        const loadedGeneral = data.general || defaultGeneralSettings;
        if (!loadedGeneral.storeUrl) loadedGeneral.storeUrl = window.location.origin;
        setGeneralSettings(loadedGeneral);
        setSitemapDomain(loadedGeneral.storeUrl);
        setSitemapSettings(data.sitemap || { autoGenerate: true });
        setRobotsTxt(data.robots || defaultRobotsTxt);
        setRedirects(data.redirects || []);
        setVerificationCodes(data.verification || { google: '', bing: '', pinterest: '' });
        setSeoData(data.data || {});
        setSchemaData(data.schema || {});
      }
    });
    return () => unsub();
  }, []);

  const saveSettings = async (key, data) => {
    try {
      await setDocument('settings', 'seo', { [key]: data });
      toast({ title: 'Settings Saved!' });
      return { success: true };
    } catch (error) {
      console.error(`Error saving ${key} settings:`, error);
      toast({ 
        title: 'Error Saving Settings', 
        description: 'Failed to update database. Please try again.',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const saveGeneralSettings = (data) => {
    saveSettings('general', data);
    if (data.storeUrl) setSitemapDomain(data.storeUrl);
  };
  const saveSitemapSettings = (data) => saveSettings('sitemap', data);
  const saveRedirects = (data) => saveSettings('redirects', data);
  const saveVerificationCodes = (data) => saveSettings('verification', data);
  const saveSeoData = (id, data) => saveSettings('data', { ...seoData, [id]: data });
  const saveSchemaData = (id, data) => saveSettings('schema', { ...schemaData, [id]: data });

  // Explicitly defined saveRobotsTxt with try-catch and status return
  const saveRobotsTxt = async (data) => {
    try {
      setRobotsTxt(data); // update local state immediately
      const result = await saveSettings('robots', data);
      return result;
    } catch (error) {
      console.error('Error in saveRobotsTxt:', error);
      return { success: false, error };
    }
  };

  // Legacy sitemap generator (kept for backward compatibility if needed)
  const generateSitemap = (type) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    const siteUrl = generalSettings.storeUrl.replace(/\/$/, '');
    switch (type) {
      case 'product':
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        products.forEach(p => { if (p.slug) xml += `  <url>\n    <loc>${siteUrl}/product/${p.slug}</loc>\n  </url>\n`; });
        xml += `</urlset>`;
        break;
      case 'index':
        xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${siteUrl}/product-sitemap.xml</loc>\n  </sitemap>\n</sitemapindex>`;
        break;
      default:
        return 'Invalid sitemap type';
    }
    return xml;
  };

  // New V2 Sitemap Generators
  const generateSingleSitemap = useCallback((type) => {
    const now = new Date().toISOString();
    let content = '';

    try {
      switch (type) {
        case 'index':
          content = generateSitemapIndex(sitemapDomain);
          break;
        case 'products':
          content = generateProductsSitemap(products, sitemapDomain);
          break;
        case 'categories':
          content = generateCategoriesSitemap(categories, sitemapDomain);
          break;
        case 'pages':
          // Using syncedPages if available, otherwise empty array
          content = generatePagesSitemap(syncedPages || [], sitemapDomain);
          break;
        default:
          return;
      }

      setGeneratedSitemaps(prev => ({ ...prev, [type]: content }));
      setSitemapTimestamps(prev => ({ ...prev, [type]: now }));
      return content;
    } catch (error) {
      console.error(`Error generating ${type} sitemap:`, error);
      toast({ 
        title: 'Error Generating Sitemap', 
        description: `Failed to generate ${type} sitemap.`,
        variant: 'destructive'
      });
      return null;
    }
  }, [sitemapDomain, products, categories, syncedPages]);

  const generateAllSitemaps = useCallback(() => {
    generateSingleSitemap('index');
    generateSingleSitemap('products');
    generateSingleSitemap('categories');
    generateSingleSitemap('pages');
    toast({ title: 'Success', description: 'All sitemaps regenerated successfully.' });
  }, [generateSingleSitemap]);

  // Auto-generate if settings allow and data changes (debounced)
  useEffect(() => {
    if (sitemapSettings.autoGenerate && products.length > 0) {
      const timer = setTimeout(() => {
        generateSingleSitemap('products');
        generateSingleSitemap('categories');
        generateSingleSitemap('index');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [products, categories, sitemapSettings.autoGenerate, generateSingleSitemap]);

  return (
    <SeoContext.Provider value={{ 
      generalSettings, 
      sitemapSettings, 
      robotsTxt, 
      setRobotsTxt, 
      redirects, 
      verificationCodes, 
      saveGeneralSettings, 
      saveSitemapSettings, 
      saveRobotsTxt, 
      saveRedirects, 
      saveVerificationCodes, 
      generateSitemap, // Legacy
      defaultRobotsTxt, 
      getSeoDataFor, 
      saveSeoData, 
      getSchemaDataFor, 
      saveSchemaData,
      // V2 Exports
      sitemapDomain,
      setSitemapDomain,
      generatedSitemaps,
      sitemapTimestamps,
      generateSingleSitemap,
      generateAllSitemaps
    }}>
      {children}
    </SeoContext.Provider>
  );
};
