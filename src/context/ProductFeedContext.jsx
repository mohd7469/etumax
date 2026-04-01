import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useProducts } from './ProductContext';
import { useSeo } from './SeoContext';
import convert from 'xml-js';
import { listenToDocument, setDocument } from '@/lib/firestoreService';

const ProductFeedContext = createContext();

export const useProductFeed = () => useContext(ProductFeedContext);

// These functions will now live here, not in the database.
const dynamicMappings = {
  'link': (p, s) => s.storeUrl ? `${s.storeUrl}/product/${p.slug}` : `/product/${p.slug}`,
  'g:image_link': p => (p.images && p.images.length > 0 ? p.images[0] : ''),
  'g:availability': p => (p.inStock ? 'in_stock' : 'out_of_stock'),
  'g:product_type': p => (p.categories ? p.categories.join(' > ') : ''),
  'g:condition': () => 'new',
};

// This is the structure that will be saved to Firebase.
const defaultFeedSettings = {
  id: `feed_${Date.now()}`,
  name: 'Standard Google Feed',
  format: 'xml',
  schedule: 'daily',
  rules: {
    inStockOnly: true,
    excludedCategories: [],
    excludedBrands: [],
    excludedTags: [],
    excludedProducts: [],
    priceMarkup: { type: 'none', value: 0 },
  },
  // Only storing strings now. The functions are separate.
  mapping: {
    'g:id': 'id',
    'g:title': 'name',
    'g:description': 'description',
    'g:price': 'price',
    'g:sale_price': 'salePrice',
    'g:brand': 'brand',
    'g:gtin': 'sku',
    'g:mpn': 'sku',
    'g:google_product_category': '',
  },
  lastGenerated: null,
};


export const ProductFeedProvider = ({ children }) => {
  const [feeds, setFeeds] = useState([]);
  const { products, categories, brands } = useProducts();
  const { generalSettings: seoSettings } = useSeo();

  useEffect(() => {
    const unsubscribe = listenToDocument('settings', 'productFeeds', (data) => {
      // Exclude 'id' which might be injected by getDocument
      const { id, ...feedData } = data || {};
      if (feedData && Object.keys(feedData).length > 0) {
        setFeeds(Object.values(feedData));
      } else {
        // When initializing, save a clean version without functions.
        const initialFeeds = [defaultFeedSettings];
        saveFeeds(initialFeeds, true);
        setFeeds(initialFeeds);
      }
    });

    return () => unsubscribe();
  }, []);

  // The 'initial' flag prevents a loop on first load.
  const saveFeeds = async (newFeeds, initial = false) => {
    const dataToSave = newFeeds.reduce((acc, feed) => {
      acc[feed.id] = feed;
      return acc;
    }, {});
    
    await setDocument('settings', 'productFeeds', dataToSave);
    if (!initial) {
      setFeeds(newFeeds);
    }
  };

  const addFeed = () => {
    const newFeed = { ...defaultFeedSettings, id: `feed_${Date.now()}`, name: `New Feed ${feeds.length + 1}` };
    saveFeeds([...feeds, newFeed]);
  };

  const updateFeed = (feedId, updatedData) => {
    const newFeeds = feeds.map(f => (f.id === feedId ? { ...f, ...updatedData } : f));
    saveFeeds(newFeeds);
  };

  const deleteFeed = (feedId) => {
    const newFeeds = feeds.filter(f => f.id !== feedId);
    saveFeeds(newFeeds.length > 0 ? newFeeds : [defaultFeedSettings]);
  };

  const applyRules = (product, rules) => {
    if (!rules) return true;
    if (rules.inStockOnly && !product.inStock) return false;
    if (rules.excludedCategories?.length > 0 && product.categories?.some(c => rules.excludedCategories.includes(c))) return false;
    if (rules.excludedBrands?.length > 0 && rules.excludedBrands.includes(product.brand)) return false;
    if (rules.excludedTags?.length > 0 && product.tags?.some(t => rules.excludedTags.includes(t))) return false;
    if (rules.excludedProducts?.length > 0 && rules.excludedProducts.includes(product.id)) return false;
    return true;
  };

  const generateFeedContent = (feed) => {
    // Re-combine saved mapping with dynamic functions
    const fullMapping = { ...dynamicMappings, ...feed.mapping };
    let feedProducts = products.filter(p => applyRules(p, feed.rules));

    const mappedProducts = feedProducts.map(p => {
      let mapped = {};
      for (const key in fullMapping) {
        const mapValue = fullMapping[key];
        if (typeof mapValue === 'function') {
          mapped[key] = mapValue(p, seoSettings);
        } else if (p[mapValue] !== undefined && p[mapValue] !== null) {
          mapped[key] = p[mapValue];
        } else {
          mapped[key] = mapValue; // Static value
        }
      }

      const currency = seoSettings.currency || 'USD';
      if (feed.rules?.priceMarkup?.type !== 'none') {
        let price = parseFloat(mapped['g:price']);
        const markupValue = parseFloat(feed.rules.priceMarkup.value);
        if (!isNaN(price) && !isNaN(markupValue)) {
          if (feed.rules.priceMarkup.type === 'percentage') {
            price = price * (1 + markupValue / 100);
          } else if (feed.rules.priceMarkup.type === 'fixed') {
            price += markupValue;
          }
          mapped['g:price'] = `${price.toFixed(2)} ${currency}`;
        }
      } else if (mapped['g:price']) {
        mapped['g:price'] = `${parseFloat(mapped['g:price']).toFixed(2)} ${currency}`;
      }

      if (mapped['g:sale_price']) {
        mapped['g:sale_price'] = `${parseFloat(mapped['g:sale_price']).toFixed(2)} ${currency}`;
      }

      const finalMapped = {};
      for (const key in mapped) {
        if (mapped[key] || mapped[key] === 0) {
          finalMapped[key] = { _cdata: mapped[key] };
        }
      }

      return { item: finalMapped };
    });

    if (feed.format === 'xml') {
      const xmlObject = {
        _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
        rss: {
          _attributes: { 'xmlns:g': 'http://base.google.com/ns/1.0', version: '2.0' },
          channel: {
            title: { _cdata: feed.name },
            link: { _cdata: seoSettings.storeUrl || window.location.origin },
            description: { _cdata: 'Product feed generated by ShopHub' },
            ...mappedProducts
          }
        }
      };
      return convert.js2xml(xmlObject, { compact: true, spaces: 4 });
    } else if (feed.format === 'json') {
      const cleanedProducts = mappedProducts.map(p => {
        const cleaned = {};
        Object.keys(p.item).forEach(key => {
          cleaned[key] = p.item[key]._cdata;
        });
        return cleaned;
      });
      return JSON.stringify(cleanedProducts, null, 2);
    } else if (feed.format === 'csv') {
      if (mappedProducts.length === 0) return '';
      const cleanedProducts = mappedProducts.map(p => {
        const cleaned = {};
        Object.keys(p.item).forEach(key => {
          cleaned[key] = p.item[key]._cdata;
        });
        return cleaned;
      });
      const headers = Object.keys(cleanedProducts[0]);
      const csvRows = [
        headers.join(','),
        ...cleanedProducts.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))
      ];
      return csvRows.join('\n');
    }
  };

  const generateAndDownloadFeed = (feedId) => {
    const feed = feeds.find(f => f.id === feedId);
    if (!feed) {
      toast({ variant: 'destructive', title: 'Feed not found!' });
      return;
    }

    try {
      const content = generateFeedContent(feed);
      if (!content) {
        throw new Error("Generated content is empty.");
      }
      const blob = new Blob([content], { type: `application/${feed.format}` });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `product-feed-${feed.id}.${feed.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      updateFeed(feedId, { ...feed, lastGenerated: new Date().toISOString() });
      toast({ title: 'Feed Generated!', description: `Your ${feed.format.toUpperCase()} feed has been downloaded.` });
    } catch (error) {
      console.error("Feed generation failed:", error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: error.message });
    }
  };

  const value = {
    feeds,
    addFeed,
    updateFeed,
    deleteFeed,
    generateAndDownloadFeed,
    generateFeedContent,
    products,
    categories,
    brands,
  };

  return (
    <ProductFeedContext.Provider value={value}>
      {children}
    </ProductFeedContext.Provider>
  );
};