
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProducts } from '@/context/ProductContext';
import { useReviews } from '@/context/ReviewContext';
import { normalizeSlug, generateSlug } from '@/lib/slugUtils';

export const useProductDetail = (slug, initialProduct = null) => {
  const location = useLocation();
  const { products, getRecentlyViewedProducts } = useProducts();
  const { getReviewsForProduct, getReviewStatsForProduct } = useReviews();

  // Check router state for preloaded minimal product data to avoid perceived delay
  const preloadedProduct = location.state?.preloadedProduct || null;

  // PRIORITY 1: Core Data
  const [coreData, setCoreData] = useState(initialProduct || preloadedProduct || null);
  const [coreLoading, setCoreLoading] = useState(!initialProduct && !preloadedProduct);

  // PRIORITY 2: Secondary Data
  const [secondaryData, setSecondaryData] = useState({ 
    reviews: [], 
    reviewStats: { reviewCount: 0, averageRating: 0 },
    related: [], 
    recentlyViewed: [] 
  });
  const [secondaryLoading, setSecondaryLoading] = useState(true);

  // Effect for fetching Core Data
  useEffect(() => {
    if (initialProduct) {
      setCoreData(initialProduct);
      setCoreLoading(false);
      return;
    }

    if (!slug || products.length === 0) return;
    
    const targetSlug = normalizeSlug(slug);
    
    const found = products.find(p => {
      // 1. Match saved product slug
      if (p.slug && normalizeSlug(p.slug) === targetSlug) return true;
      // 2. Match slug generated from product name
      if (p.name && generateSlug(p.name) === targetSlug) return true;
      // 3. Match legacy slug if exists
      if (p.legacySlug && normalizeSlug(p.legacySlug) === targetSlug) return true;
      // 4. Fallback to ID match
      if (String(p.id) === targetSlug || String(p.id) === slug) return true;
      return false;
    });
    
    if (found) {
      setCoreData(found);
    }
    setCoreLoading(false);
  }, [slug, products, initialProduct]);

  // Effect for fetching Secondary Data (Parallel Loading)
  useEffect(() => {
    if (!coreData || products.length === 0) return;
    
    let isMounted = true;
    setSecondaryLoading(true);

    const fetchSecondaryData = async () => {
      try {
        const [reviews, reviewStats, related, recentlyViewed] = await Promise.all([
          new Promise(resolve => resolve(getReviewsForProduct(coreData.id))),
          new Promise(resolve => resolve(getReviewStatsForProduct(coreData.id))),
          new Promise(resolve => {
            const productCats = coreData.categories || [];
            const rel = products.filter(p => 
              p.id !== coreData.id && 
              (p.categories || []).some(c => productCats.includes(c))
            );
            resolve(rel);
          }),
          new Promise(resolve => resolve(getRecentlyViewedProducts().filter(p => p.id !== coreData.id)))
        ]);

        if (isMounted) {
          setSecondaryData({ reviews, reviewStats, related, recentlyViewed });
          setSecondaryLoading(false);
        }
      } catch (error) {
        console.error("Failed to load secondary data:", error);
        if (isMounted) setSecondaryLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSecondaryData();
    }, 50);

    return () => { 
      isMounted = false; 
      clearTimeout(timer);
    };
  }, [coreData?.id, products, getReviewsForProduct, getReviewStatsForProduct, getRecentlyViewedProducts]);

  return { 
    product: coreData, 
    coreLoading, 
    secondaryData, 
    secondaryLoading 
  };
};
