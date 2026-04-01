import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  LayoutGrid,
  Smartphone,
  Laptop,
  Watch,
  Heart,
  Zap,
  Gem,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import ProductImage from '@/components/ui/ProductImage';
import SortFilterControl from '@/components/products/SortFilterControl';
import { useProducts } from '@/context/ProductContext';
import { useDesign } from '@/context/DesignContext';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('mobile') || name.includes('phone')) return <Smartphone className="w-6 h-6" />;
  if (name.includes('laptop') || name.includes('computer')) return <Laptop className="w-6 h-6" />;
  if (name.includes('watch') || name.includes('wearable')) return <Watch className="w-6 h-6" />;
  if (name.includes('fashion') || name.includes('clothing')) return <Zap className="w-6 h-6" />;
  if (name.includes('beauty') || name.includes('care')) return <Heart className="w-6 h-6" />;
  if (name.includes('jewelry') || name.includes('accessory')) return <Gem className="w-6 h-6" />;
  if (name.includes('all')) return <LayoutGrid className="w-6 h-6" />;
  return <ShoppingBag className="w-6 h-6" />;
};

const INITIAL_LOAD_COUNT = 12;
const LOAD_MORE_COUNT = 8;

import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryIconSlider = ({ categories, activeCategory, onCategoryChange }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const slider = scrollRef.current;
    if (!slider) return;

    const scrollAmount = 200;

    slider.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full bg-white border-b overflow-hidden mb-6 py-3">
      
      {/* LEFT ARROW */}
      <button
        onClick={() => scroll('left')}
        className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-sm rounded-full w-8 h-8 items-center justify-center hover:bg-gray-100"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={() => scroll('right')}
        className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-sm rounded-full w-8 h-8 items-center justify-center hover:bg-gray-100"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="container mx-auto px-8"> {/* thoda padding arrows ke liye */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `.scrollbar-hide::-webkit-scrollbar { display: none; }`,
            }}
          />

          {categories.map((category) => {
            const isActive = activeCategory === (category.slug || category.id);

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[88px] transition-all duration-200",
                  isActive ? "scale-105" : "hover:scale-105"
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm overflow-hidden",
                    isActive
                      ? "bg-primary text-white shadow-primary/30"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-primary"
                  )}
                >
                  {category.image ? (
                    <ProductImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      aspectRatio="square"
                      lazy={true}
                    />
                  ) : (
                    <div className="scale-75 flex items-center justify-center w-full h-full">
                      {getCategoryIcon(category.name)}
                    </div>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[9px] font-semibold uppercase tracking-tight text-center leading-none whitespace-nowrap",
                    isActive ? "text-primary" : "text-gray-500"
                  )}
                >
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TopBanner = ({ settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (!settings?.enabled || !settings?.slides || settings.slides.length <= 1) return;
    const interval = setInterval(() => { setCurrentIndex((prev) => (prev + 1) % settings.slides.length); }, (settings.delay || 5) * 1000);
    return () => clearInterval(interval);
  }, [settings]);
  if (!settings?.enabled || !settings?.slides || settings.slides.length === 0) return null;
  const currentSlide = settings.slides[currentIndex];
  if (!currentSlide) return null;
  return (
    <div className="relative overflow-hidden mb-8 rounded-lg" style={{ height: `${settings.height || 300}px` }}>
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="absolute inset-0 w-full h-full">
          <ProductImage src={currentSlide.image} alt={`Slide ${currentIndex + 1}`} className="w-full h-full object-cover" aspectRatio="auto" lazy={false} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

const FeaturedProductsSlider = ({ settings }) => {
  const { getProductById } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);
  const featuredProducts = useMemo(() => {
    const productIds = settings?.productIds || [];
    return productIds.map((id) => getProductById(id)).filter(Boolean);
  }, [settings?.productIds, getProductById]);
  const resetTimeout = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  useEffect(() => {
    if (!settings?.enabled || featuredProducts.length <= (settings.columns || 4)) return;
    resetTimeout();
    timeoutRef.current = setTimeout(() => { setCurrentIndex((prev) => (prev + 1) % featuredProducts.length); }, (settings.delay || 5) * 1000);
    return () => resetTimeout();
  }, [currentIndex, settings, featuredProducts.length]);
  if (!settings?.enabled || featuredProducts.length === 0) return null;
  const getVisibleProducts = () => {
    const columns = settings.columns || 4;
    const numProducts = featuredProducts.length;
    if (numProducts <= columns) return featuredProducts;
    const visible = [];
    for (let i = 0; i < columns; i++) visible.push(featuredProducts[(currentIndex + i) % numProducts]);
    return visible;
  };
  const visibleProducts = getVisibleProducts();
  const gridColsClass = `grid-cols-${settings.columns || 4}`;
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Featured Products</h2>
      <div className={`grid ${gridColsClass} gap-6 overflow-hidden`} onMouseEnter={resetTimeout}>
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product, index) => (
            <motion.div layout key={product.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5, delay: index * 0.05 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProductListingPage = ({ navigateTo, isPreview, previewGridSettings, previewListingSettings, previewListingLayout }) => {
  const { category: categoryUrlParam } = useParams();
  const { categories, products, formatPrice } = useProducts();
  const { productGridLayout: liveProductGridLayout, productListingSettings: liveListingSettings, productListingLayout: liveListingLayout, getPageLayoutSettings } = useDesign();

  const productGridLayout = isPreview ? previewGridSettings : liveProductGridLayout;
  const productListingSettings = isPreview ? previewListingSettings : liveListingSettings;
  const productListingLayout = isPreview && previewListingLayout ? previewListingLayout : (liveListingLayout || { columnsPerRow: 4 });

  // Read layout settings for listing page
  const listingLayout = useMemo(() => getPageLayoutSettings('listing'), [getPageLayoutSettings]);

  // Extract source settings
  const sourceMode = productListingSettings?.productSource || 'all';
  const selectedIds = productListingSettings?.selectedProductIds || [];
  const hideOutOfStock = productListingSettings?.hideOutOfStock || false;
  const filtersEnabled = productListingSettings?.filtersEnabled !== false;
  const sortingEnabled = productListingSettings?.sortingEnabled !== false;
  const pinSelectedFirst = productListingSettings?.pinSelectedProductsFirst || false;
  const randomProductsCount = productListingSettings?.randomProductsCount || 12;
  const refreshRandomOnLoad = productListingSettings?.refreshRandomOnLoad || false;

  const [activeCategory, setActiveCategory] = useState(categoryUrlParam || 'all');
  const [activeMethod, setActiveMethod] = useState('category');
  const [randomSeed, setRandomSeed] = useState(Math.random());
  
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);

  const loadMoreRef = useRef(null);
  const navigate = useNavigate();

  const showTopCategories = productListingSettings?.showTopCategories !== false;
  const showSidebarPriceRange = productListingSettings?.showSidebarPriceRange !== false;
  const showSidebarCategories = productListingSettings?.showSidebarCategories !== false;

  const hasSidebarContent = filtersEnabled && (showSidebarPriceRange || showSidebarCategories);

  useEffect(() => {
    if (!isPreview) {
      setActiveCategory(categoryUrlParam || 'all');
      setActiveMethod('category');
      window.scrollTo(0, 0);
    }
  }, [categoryUrlParam, isPreview]);

  const categoriesWithProducts = useMemo(() => {
    const productCounts = (products || []).reduce((acc, product) => {
      if (product && product.categories) {
        (Array.isArray(product.categories) ? product.categories : [product.categories]).forEach((catName) => {
          const category = (categories || []).find((c) => c.name === catName || c.name === catName?.name);
          if (category) acc[category.id] = (acc[category.id] || 0) + 1;
        });
      }
      return acc;
    }, {});
    const allCategories = [{ id: 'all', name: 'All Products', slug: 'all' }, ...(categories || [])];
    return allCategories.filter((c) => c.status !== 'draft' && (c.id === 'all' || (productCounts[c.id] || 0) > 0));
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    let result = isPreview ? [...(products || [])] : [...(products || [])];

    // 1. Source Filter Logic
    if (sourceMode === 'selected') {
      result = result.filter(p => selectedIds.includes(p.id));
      result.sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id));
    } else if (sourceMode === 'featured') {
      result = result.filter(p => p.featured === true);
    } else if (sourceMode === 'latest') {
      result.sort((a, b) => new Date(b.dateAdded || b.createdAt || 0) - new Date(a.dateAdded || a.createdAt || 0));
    } else if (sourceMode === 'bestSelling') {
      result.sort((a, b) => (b.salesCount || b.sold || 0) - (a.salesCount || a.sold || 0));
    } else if (sourceMode === 'onSale') {
      result = result.filter(p => p.salePrice && Number(p.salePrice) < Number(p.price || p.regularPrice));
    } else if (sourceMode === 'random') {
      result.sort((a, b) => {
         if (refreshRandomOnLoad) {
            const hashA = (String(a.id).charCodeAt(a.id.length-1 || 0) * randomSeed) % 1;
            const hashB = (String(b.id).charCodeAt(b.id.length-1 || 0) * randomSeed) % 1;
            return hashA - hashB;
         } else {
            const hashA = (String(a.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 13.57) % 1;
            const hashB = (String(b.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 13.57) % 1;
            return hashA - hashB;
         }
      });
      result = result.slice(0, randomProductsCount);
    } else if (sourceMode === 'tag') {
      // Basic tag filter if applicable, otherwise behaves like 'all'
    }

    // 2. Hide Out of Stock
    if (hideOutOfStock) {
      result = result.filter(p => p.stockStatus !== 'outofstock' && p.stock !== 0 && p.outOfStock !== true);
    }

    // 3. User Price Filter
    result = result.filter(p => Number(p.price || 0) >= priceRange[0] && Number(p.price || 0) <= priceRange[1]);

    // 4. User Sort & Category (only if controls aren't explicitly overridden, but we respect active states)
    if (activeMethod === 'category') {
      if (activeCategory !== 'all' && sourceMode !== 'selected' && sourceMode !== 'random') {
        const categoryObj = categoriesWithProducts.find((c) => (c.slug || c.id) === activeCategory);
        if (categoryObj) {
          const inCat = [];
          const outCat = [];
          result.forEach(p => {
            let isMatch = false;
            if (p.categories) {
              if (Array.isArray(p.categories)) isMatch = p.categories.some(c => (typeof c === 'string' ? c : c?.name) === categoryObj.name);
              else if (typeof p.categories === 'string') isMatch = p.categories === categoryObj.name;
            }
            if (isMatch) inCat.push(p);
            else outCat.push(p);
          });
          const shuffledOutCat = [...outCat].sort(() => 0.5 - Math.random());
          result = [...inCat, ...shuffledOutCat];
        }
      }
    } else if (activeMethod === 'price' && sortingEnabled) {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (activeMethod === 'random' && sortingEnabled) {
      result.sort((a, b) => {
         const hashA = (String(a.id).charCodeAt(0) * randomSeed) % 1;
         const hashB = (String(b.id).charCodeAt(0) * randomSeed) % 1;
         return hashA - hashB;
      });
    }

    // 5. Pin Selected Products (moves them to top if not in 'selected' mode)
    if (pinSelectedFirst && sourceMode !== 'selected' && selectedIds.length > 0) {
      const pinned = [];
      const unpinned = [];
      result.forEach(p => {
        if (selectedIds.includes(p.id)) pinned.push(p);
        else unpinned.push(p);
      });
      pinned.sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id));
      result = [...pinned, ...unpinned];
    }

    return result;
  }, [sourceMode, selectedIds, hideOutOfStock, pinSelectedFirst, activeMethod, activeCategory, products, priceRange, isPreview, categoriesWithProducts, randomSeed, sortingEnabled, randomProductsCount, refreshRandomOnLoad]);

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => { setVisibleCount(INITIAL_LOAD_COUNT); }, [activeCategory, activeMethod, priceRange, sourceMode, hideOutOfStock, pinSelectedFirst, randomProductsCount]);

  useEffect(() => {
    if (!hasMoreProducts) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredProducts.length)); },
      { root: null, rootMargin: '300px 0px', threshold: 0 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => { observer.disconnect(); };
  }, [hasMoreProducts, filteredProducts.length]);

  const gridClasses = {
    desktop: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' },
    mobile: { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' }
  };

  const currentDesktopCols = productListingLayout?.columnsPerRow || productGridLayout?.desktop || 4;
  const desktopGridClass = gridClasses.desktop[currentDesktopCols] || 'lg:grid-cols-4';
  const mobileGridClass = gridClasses.mobile[productGridLayout?.mobile] || 'grid-cols-2';

  const handleCategoryChange = (category) => {
    const slug = typeof category === 'string' ? category : (category.slug || category.id);
    setActiveCategory(slug);
    setActiveMethod('category');
    setVisibleCount(INITIAL_LOAD_COUNT);
    if (!isPreview) navigate(slug === 'all' ? '/products' : `/products/${slug}`);
  };

  const handleMethodChange = (method) => {
    setActiveMethod(method);
    if (method === 'random') setRandomSeed(Math.random());
    setVisibleCount(INITIAL_LOAD_COUNT);
  };

  const FiltersSidebar = () => (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="p-4 lg:p-0">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-xl font-bold">Filters</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></Button>
        </div>
        {showSidebarPriceRange && (
          <div className="bg-white rounded-xl border p-4 shadow-sm mb-4">
            <h3 className="font-semibold mb-4 text-lg">Price Range</h3>
            <Slider value={[priceRange[1]]} max={1000} step={10} onValueChange={(value) => setPriceRange([0, value[0]])} />
            <div className="flex justify-between text-sm text-gray-600 mt-3">
              <span>{formatPrice(priceRange[0])}</span><span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        )}
        {showSidebarCategories && (
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="font-semibold mb-4 text-lg">Categories</h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
              {categoriesWithProducts.map(cat => {
                const isActive = activeCategory === (cat.slug || cat.id);
                return (
                  <button key={cat.id} onClick={() => handleCategoryChange(cat)} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between", isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-gray-100 text-gray-700")}>
                    <span>{cat.name}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  const getSourceDisplayName = () => {
    if (sourceMode === 'selected') return 'Selected Products';
    if (sourceMode === 'featured') return 'Featured Collection';
    if (sourceMode === 'latest') return 'New Arrivals';
    if (sourceMode === 'bestSelling') return 'Best Sellers';
    if (sourceMode === 'onSale') return 'Special Offers';
    if (sourceMode === 'random') return 'Random Selection';
    return categoriesWithProducts.find((c) => (c.slug || c.id) === activeCategory)?.name || 'All Products';
  };

  // Layout box styles from DesignContext
  const layoutBoxStyles = listingLayout?.enabled ? {
    maxWidth: listingLayout.widthValue,
    padding: listingLayout.padding ? `${listingLayout.padding}rem` : '1.5rem',
    backgroundColor: listingLayout.bg,
    boxShadow: listingLayout.shadow !== 'none' ? `var(--shadow-${listingLayout.shadow})` : 'none',
    borderColor: listingLayout.borderColor,
    borderWidth: listingLayout.borderWidth ? `${listingLayout.borderWidth}px` : '0px',
    borderRadius: listingLayout.radius ? `${listingLayout.radius}rem` : '0rem',
    margin: '0 auto',
    width: '100%',
  } : {};

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {showTopCategories && (
        <CategoryIconSlider categories={categoriesWithProducts} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
      )}
      
      <div 
        className={cn("mx-auto", !listingLayout?.enabled && "container px-4 py-4")}
        style={listingLayout?.enabled ? layoutBoxStyles : {}}
      >
        <TopBanner settings={productListingSettings?.topBanner} />
        <FeaturedProductsSlider settings={productListingSettings?.featuredProducts} />

        <div className="flex flex-col lg:flex-row gap-8">
          {hasSidebarContent && (
            <div className="hidden lg:block">
              <FiltersSidebar />
            </div>
          )}

          <main className="flex-1 w-full min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {activeMethod === 'category' ? getSourceDisplayName() : (activeMethod === 'price' ? 'Price Sort' : 'Random Selection')}
                </h1>
                <p className="text-gray-500 mt-1">Showing {visibleProducts.length} of {filteredProducts.length} results</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {hasSidebarContent && (
                  <Button onClick={() => setShowFilters(true)} variant="outline" className="lg:hidden flex-1 sm:flex-none">
                    <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                  </Button>
                )}
              </div>
            </div>

            {(filtersEnabled || sortingEnabled) && (
              <SortFilterControl 
                activeMethod={activeMethod}
                onMethodChange={handleMethodChange}
                onCategoryChange={handleCategoryChange}
                categories={categoriesWithProducts}
                currentCategory={activeCategory}
                filtersEnabled={filtersEnabled}
                sortingEnabled={sortingEnabled}
              />
            )}

            <AnimatePresence>
              {showFilters && hasSidebarContent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60] lg:hidden" onClick={() => setShowFilters(false)}>
                  <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute left-0 top-0 h-full w-72 bg-white shadow-lg p-4 z-[70] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <FiltersSidebar />
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl font-semibold text-gray-600 mb-2">No products found.</p>
                <p className="text-gray-400">Try adjusting your filters or checking back later.</p>
                {filtersEnabled && (
                  <Button variant="link" onClick={() => { setPriceRange([0, 1000]); setActiveCategory('all'); setActiveMethod('category'); setVisibleCount(INITIAL_LOAD_COUNT); if (!isPreview) navigate('/products'); }} className="mt-4 text-primary font-bold">
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className={cn("grid gap-4 md:gap-6", mobileGridClass, desktopGridClass)}>
                  {visibleProducts.map((product, idx) => (
                    <motion.div key={`${product.id}-${activeMethod}-${idx}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35, delay: (idx % 8) * 0.04 }}>
                      <ProductCard product={product} navigateTo={navigateTo} />
                    </motion.div>
                  ))}
                </div>
                {hasMoreProducts && (
                  <div ref={loadMoreRef} className="py-10 flex justify-center">
                    <div className="px-4 py-2 text-sm text-gray-500 bg-white rounded-full border shadow-sm">Loading more products...</div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;