
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useLoading } from '@/context/LoadingContext';
import { toast } from '@/components/ui/use-toast';
import { useReviews } from '@/context/ReviewContext';
import { isValidImageUrl } from '@/lib/utils';
import { listenToCollection, setDocument, deleteDocument, batchWrite } from '@/lib/firestoreService';
import { useWooCommerce } from '@/context/WooCommerceContext';
import { regenerateSitemaps } from '@/lib/sitemapAutoUpdate';
import { normalizeSlug, generateSlug } from '@/lib/slugUtils';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

const initialCategories = [
  { id: 'all', name: 'All Products', icon: '🛍️', image: null, synced: false, status: 'published' },
];

const normalizeCategories = (cats) => {
  if (!cats) return [];
  if (typeof cats === 'string') return [cats.trim()];
  if (Array.isArray(cats)) {
    return cats.map((c) => {
        if (!c) return null;
        if (typeof c === 'string') return c.trim();
        if (typeof c === 'object' && c.name) return c.name.trim();
        return null;
      }).filter(Boolean);
  }
  if (typeof cats === 'object') {
    if (cats.name) return [cats.name.trim()];
    return Object.values(cats).map((v) =>
        typeof v === 'string' ? v.trim() : v && typeof v === 'object' && v.name ? v.name.trim() : null
      ).filter(Boolean);
  }
  return [];
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState([]);
  const { getReviewStatsForProduct } = useReviews();
  const { syncProducts, isConnected } = useWooCommerce();
  
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('shophub_recently_viewed');
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch (error) {
      return [];
    }
  });
  const [currencySettings, setCurrencySettings] = useState({ symbol: 'AED', position: 'before' });
  const { startLoading, stopLoading } = useLoading();

  const updateProducts = useCallback((localProducts, syncedProducts) => {
    const asArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'object') return Object.values(value);
      return [];
    };

    const merged = [...asArray(syncedProducts), ...asArray(localProducts)];
    const map = new Map();

    merged.forEach((p) => {
      if (p && p.id != null) {
        const key = String(p.id);
        const existing = map.get(key) || {};
        map.set(key, { ...existing, ...p });
      }
    });

    const combined = Array.from(map.values()).map((p) => {
      if (!p || p.id == null) return null;
      const { reviewCount, averageRating } = getReviewStatsForProduct(p.id);
      let validImages = Array.isArray(p.images) ? p.images.filter(isValidImageUrl) : [];
      let mainImage = null;
      if (validImages.length > 0) mainImage = validImages[0];
      else if (isValidImageUrl(p.image)) { mainImage = p.image; validImages = [p.image]; }
      
      // Determine slug with consistent normalized fallback
      const slug = (p.slug && String(p.slug).trim() !== '') 
        ? p.slug 
        : (p.name ? generateSlug(p.name) : String(p.id));
      
      const parsedPrice = Number(p.price || 0);
      const parsedSalePrice = p.salePrice ? Number(p.salePrice) : null;
      const parsedRegularPrice = p.regularPrice ? Number(p.regularPrice) : (p.originalPrice ? Number(p.originalPrice) : parsedPrice);

      return { 
        ...p, 
        images: validImages, 
        reviewCount, 
        rating: averageRating, 
        mainImage, 
        slug,
        shortDescription: p.shortDescription || p.short_description || '',
        features: Array.isArray(p.features) ? p.features : [],
        price: parsedPrice,
        regularPrice: parsedRegularPrice,
        salePrice: parsedSalePrice,
        originalPrice: parsedRegularPrice // for backward compatibility
      };
    }).filter((p) => p && p.id);

    setProducts(combined);
    setBrands([...new Set(combined.map((p) => p.brand).filter(Boolean))]);
  }, [getReviewStatsForProduct]);

  useEffect(() => {
    startLoading();
    
    const unsubscribeProducts = listenToCollection('products', (localProducts) => {
      const syncedProducts = typeof window !== 'undefined' && window.localStorage
          ? JSON.parse(localStorage.getItem('temp_synced_products') || '[]') : [];
      updateProducts(localProducts, syncedProducts);
      stopLoading();
    });

    const unsubscribeCategories = listenToCollection('categories', (data) => {
      if (data && data.length > 0) {
        setCategories(data);
      } else {
        initialCategories.forEach(cat => setDocument('categories', cat.id, cat));
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, [startLoading, stopLoading, updateProducts]);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedSettings = localStorage.getItem('shophub_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setCurrencySettings({ symbol: parsed.currencySymbol || 'AED', position: parsed.currencyPosition || 'before' });
        }
      }
    };
    handleSettingsUpdate();
    if (typeof window !== 'undefined') window.addEventListener('settings_updated', handleSettingsUpdate);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('settings_updated', handleSettingsUpdate); };
  }, []);

  const triggerWCSync = () => {
    if (isConnected) {
      syncProducts().catch(e => console.error("WC Sync Error:", e));
    }
  };

  const addProduct = async (product) => {
    const slug = (product.slug && String(product.slug).trim() !== '') 
      ? product.slug 
      : (product.name ? generateSlug(product.name) : `product-${Date.now()}`);
    const newId = `prod_${Date.now()}`;
    const newProduct = { ...product, id: newId, slug, wooCommerceSync: true };
    await setDocument('products', newId, newProduct);
    triggerWCSync();
    regenerateSitemaps([...products, newProduct], categories, []);
    return newProduct;
  };

  const addMultipleProducts = async (newProducts) => {
    const ops = newProducts.map(p => {
      const slug = (p.slug && String(p.slug).trim() !== '') ? p.slug : (p.name ? generateSlug(p.name) : `product-${Date.now()}`);
      return { type: 'set', collection: 'products', id: p.id, data: { ...p, slug, wooCommerceSync: true } };
    });
    await batchWrite(ops);
    triggerWCSync();
    regenerateSitemaps([...products, ...newProducts], categories, []);
  };

  const updateProduct = async (productId, updatedProductData) => {
    await setDocument('products', productId, { ...updatedProductData, id: productId, wooCommerceSync: true });
    triggerWCSync();
    regenerateSitemaps(products.map(p => p.id === productId ? { ...p, ...updatedProductData } : p), categories, []);
  };

  const updateMultipleProducts = async (productIds, updateData) => {
    const ops = productIds.map(id => ({ type: 'update', collection: 'products', id, data: { ...updateData, wooCommerceSync: true } }));
    await batchWrite(ops);
    triggerWCSync();
    regenerateSitemaps(products.map(p => productIds.includes(p.id) ? { ...p, ...updateData } : p), categories, []);
  };

  const deleteProducts = async (productIds) => {
    const ops = productIds.map(id => ({ type: 'delete', collection: 'products', id }));
    await batchWrite(ops);
    regenerateSitemaps(products.filter(p => !productIds.includes(p.id)), categories, []);
  };

  const getProductById = (id) => products.find((p) => p && String(p.id) === String(id));
  const getProductByWcId = (wcId) => products.find((p) => p.wc_id === wcId);
  const getProductBySlug = (slug) => products.find((p) => p.slug === slug);

  const getProductsByCategory = (categorySlug) => {
    if (!categorySlug || categorySlug === 'all') return products;
    const category = categories.find((c) => c.slug === categorySlug);
    if (!category) return [];
    return products.filter((p) => normalizeCategories(p.categories).includes(category.name));
  };

  const searchProducts = (query) => {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    return products.filter((p) => {
      return (p.name || '').toLowerCase().includes(lowerCaseQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerCaseQuery)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(lowerCaseQuery)) ||
        normalizeCategories(p.categories).some((cat) => cat.toLowerCase().includes(lowerCaseQuery));
    });
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '';
    const formattedPrice = price.toFixed(2);
    return currencySettings.position === 'before' ? `${currencySettings.symbol} ${formattedPrice}` : `${formattedPrice} ${currencySettings.symbol}`;
  };

  const saveCategories = async (newCategories, sourceStoreId = null) => {
    let toSave = newCategories;
    if (sourceStoreId) {
       const otherCategories = categories.filter(c => c.sourceStoreId !== sourceStoreId && !c.synced);
       toSave = [...otherCategories, ...newCategories];
    }
    const ops = toSave.map(cat => ({ type: 'set', collection: 'categories', id: cat.id, data: cat }));
    await batchWrite(ops);
    regenerateSitemaps(products, toSave, []);
  };

  const addCategory = async (categoryData) => {
    const newCat = { ...categoryData, id: `cat_${Date.now()}`, synced: false, status: categoryData.status || 'published' };
    await setDocument('categories', newCat.id, newCat);
    regenerateSitemaps(products, [...categories, newCat], []);
  };

  const updateCategory = async (id, categoryData) => {
    await setDocument('categories', id, { ...categoryData, id });
    regenerateSitemaps(products, categories.map(c => c.id === id ? { ...c, ...categoryData } : c), []);
  };

  const updateMultipleCategoriesStatus = async (ids, status) => {
    const ops = ids.map(id => ({ type: 'update', collection: 'categories', id, data: { status } }));
    await batchWrite(ops);
    regenerateSitemaps(products, categories.map(c => ids.includes(c.id) ? { ...c, status } : c), []);
  };

  const deleteCategory = async (id) => {
    await deleteDocument('categories', id);
    regenerateSitemaps(products, categories.filter(c => c.id !== id), []);
  };
  
  const deleteMultipleCategories = async (ids) => {
    const ops = ids.map(id => ({ type: 'delete', collection: 'categories', id }));
    await batchWrite(ops);
    regenerateSitemaps(products, categories.filter(c => !ids.includes(c.id)), []);
  };

  const addRecentlyViewed = useCallback((productId) => {
    setRecentlyViewed((prev) => {
      const newRecentlyViewed = [productId, ...prev.filter((id) => id !== productId)].slice(0, 10);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('shophub_recently_viewed', JSON.stringify(newRecentlyViewed));
        }
      } catch (error) {}
      return newRecentlyViewed;
    });
  }, []);

  const getRecentlyViewedProducts = useCallback(() => {
    return recentlyViewed.map((id) => products.find((p) => p && String(p.id) === String(id))).filter(Boolean);
  }, [recentlyViewed, products]);

  const getRelatedProductsForBundle = useCallback((currentProduct, limit = 3, mode = 'auto', manualIds = []) => {
    if (!currentProduct) return [];
    if (mode === 'manual' && manualIds && manualIds.length > 0) {
      return products.filter(p => manualIds.includes(p.id) && p.id !== currentProduct.id).slice(0, limit);
    }
    const productCats = normalizeCategories(currentProduct.categories);
    return products.filter(p =>
        p.id !== currentProduct.id && (p.inStock || p.stockStatus === 'instock') &&
        normalizeCategories(p.categories).some(cat => productCats.includes(cat))
      ).sort(() => 0.5 - Math.random()).slice(0, limit);
  }, [products]);

  const value = {
    products, setProducts, categories, setCategories, brands, setBrands,
    addProduct, addMultipleProducts, updateProduct, updateMultipleProducts,
    deleteProducts, getProductById, getProductBySlug, getProductByWcId,
    getProductsByCategory, searchProducts, formatPrice, saveCategories,
    addCategory, updateCategory, updateMultipleCategoriesStatus,
    deleteCategory, deleteMultipleCategories, addRecentlyViewed,
    getRecentlyViewedProducts, getRelatedProductsForBundle,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
