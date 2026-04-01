
export const SEO_CACHE_KEY = 'seo_cache_';
export const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const cacheProductSEO = (productId, seoData) => {
  if (!productId || !seoData) return;
  try {
    const data = {
      seoData,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${SEO_CACHE_KEY}${productId}`, JSON.stringify(data));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Clearing old SEO cache.');
      invalidateAllSEOCache();
      try {
        localStorage.setItem(`${SEO_CACHE_KEY}${productId}`, JSON.stringify({ seoData, timestamp: Date.now() }));
      } catch (e) {
        console.error('Failed to cache SEO data after clearing quota.', e);
      }
    } else {
      console.error('Error caching product SEO:', error);
    }
  }
};

export const getCachedProductSEO = (productId) => {
  if (!productId) return null;
  try {
    const cached = localStorage.getItem(`${SEO_CACHE_KEY}${productId}`);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const now = Date.now();

    if (now - parsed.timestamp > CACHE_EXPIRATION_MS) {
      invalidateProductSEOCache(productId);
      return null;
    }

    return parsed.seoData;
  } catch (error) {
    console.error('Error retrieving cached product SEO:', error);
    return null;
  }
};

export const invalidateProductSEOCache = (productId) => {
  if (!productId) return;
  try {
    localStorage.removeItem(`${SEO_CACHE_KEY}${productId}`);
  } catch (error) {
    console.error('Error invalidating product SEO cache:', error);
  }
};

export const invalidateAllSEOCache = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SEO_CACHE_KEY)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error invalidating all SEO cache:', error);
  }
};
