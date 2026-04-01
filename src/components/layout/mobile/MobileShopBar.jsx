
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileLayout } from '@/context/MobileLayoutContext';
import { useProducts } from '@/context/ProductContext';

const MobileShopBar = () => {
  const { settings, loading } = useMobileLayout();
  const { categories, searchProducts, formatPrice } = useProducts();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setSearchResults(searchProducts(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchProducts]);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  if (loading || !settings) return null;

  const { shopBar } = settings;
  const displayCategories = [{ id: 'all', name: 'All', slug: 'all' }, ...categories].slice(0, 8);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug || product.id}`);
    setIsSearchOpen(false);
  };

  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.image) return product.image;
    return 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop';
  };

  return (
    <>
      <AnimatePresence>
        {shopBar.enabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              paddingLeft: shopBar.padding.left,
              paddingRight: shopBar.padding.right,
              paddingTop: shopBar.padding.top,
              paddingBottom: shopBar.padding.bottom,
              gap: shopBar.spacing
            }}
            className={`bg-white flex flex-col shrink-0 z-20 lg:hidden w-full ${shopBar.position === 'sticky-top' ? 'sticky top-0 shadow-sm' : 'border-b'}`}
          >
            {shopBar.showSearchBar && (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-full h-10 bg-gray-100 rounded-full flex items-center px-4 text-gray-500 text-sm border border-gray-200"
              >
                <Search className="w-4 h-4 mr-2" /> Search products...
              </button>
            )}
            
            {shopBar.showCategoryBar && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                {displayCategories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => navigate(cat.id === 'all' ? '/products' : `/products/${cat.slug || cat.id}`)}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-700 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 shadow-sm">
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Search Results
                  </h3>
                  {searchResults.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-primary/30 transition-colors"
                    >
                      <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 p-1">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h4>
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length > 1 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                  <p className="text-sm text-gray-500">
                    We couldn't find anything matching "{searchQuery}". Try different keywords.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-sm text-gray-500">Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileShopBar;
