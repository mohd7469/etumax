
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/context/ProductContext';
import { useDesign } from '@/context/DesignContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLoading } from '@/context/LoadingContext';

const SearchResultsPage = ({ navigateTo: propNavigateTo }) => {
  const [searchParams] = useSearchParams();
  // Support both 'query' and 'q' parameters
  const query = searchParams.get('query') || searchParams.get('q') || '';
  const { searchProducts, products } = useProducts();
  const { productGridLayout } = useDesign();
  const navigate = useNavigate();
  const { isLoading } = useLoading();
  
  const [isSearching, setIsSearching] = useState(true);

  // Use the provided navigateTo or fallback to react-router navigate
  const handleNavigate = (path) => {
    if (propNavigateTo) {
      propNavigateTo(path);
    } else {
      if (path === 'home') navigate('/');
      else if (path === 'products') navigate('/products');
      else navigate(path);
    }
  };

  // Perform search and handle artificial loading state for better UX
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(query);
  }, [query, products, searchProducts]);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 400); // Small artificial delay to show loading state when typing/navigating
    
    return () => clearTimeout(timer);
  }, [query, products]);

  const gridClasses = {
    desktop: {
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      6: 'lg:grid-cols-6',
      7: 'lg:grid-cols-7',
      8: 'lg:grid-cols-8',
    },
    mobile: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
    }
  };

  const desktopGridClass = gridClasses.desktop[productGridLayout?.desktop] || 'lg:grid-cols-4';
  const mobileGridClass = gridClasses.mobile[productGridLayout?.mobile] || 'grid-cols-2';

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 text-gray-500 hover:text-gray-900 -ml-3"
            onClick={() => handleNavigate('products')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            Search Results
          </h1>
          {query ? (
            <p className="text-gray-600">
              Showing results for <span className="font-semibold text-gray-900">"{query}"</span>
              {!isSearching && !isLoading && (
                <span className="ml-2 text-sm text-gray-500">
                  ({results.length} {results.length === 1 ? 'item' : 'items'} found)
                </span>
              )}
            </p>
          ) : (
            <p className="text-gray-600">Please enter a search term to find products.</p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading || isSearching ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-500">Searching for products...</p>
          </motion.div>
        ) : !query.trim() ? (
          <motion.div 
            key="empty-query"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100"
          >
            <Search className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold mb-3 text-gray-800">What are you looking for?</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Type a product name, category, or description in the search bar to find exactly what you need.
            </p>
            <Button onClick={() => handleNavigate('products')} size="lg" className="rounded-full px-8">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse All Products
            </Button>
          </motion.div>
        ) : results.length === 0 ? (
          <motion.div 
            key="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100"
          >
            <Search className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold mb-3 text-gray-800">No results found</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We couldn't find any products matching "{query}". Try checking your spelling or using less specific terms.
            </p>
            <Button onClick={() => handleNavigate('products')} size="lg" className="rounded-full px-8">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("grid gap-4 sm:gap-6", mobileGridClass, desktopGridClass)}
          >
            {results.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                className="h-full"
              >
                <ProductCard product={product} navigateTo={propNavigateTo} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchResultsPage;
