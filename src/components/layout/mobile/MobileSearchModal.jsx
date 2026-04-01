
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/context/ProductContext';
import MobileSearchResult from './MobileSearchResult';

const MobileSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { searchProducts, formatPrice } = useProducts();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input after slight delay to allow animation to complete
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        // Simulate slight network delay for visual feedback if desired, or just search synchronously
        const res = searchProducts(query);
        setResults(res);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchProducts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleResultClick = (product) => {
    navigate(`/product/${product.slug || product.id}`);
    onClose();
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-gray-50 flex flex-col lg:hidden mobile-search-modal"
        >
          {/* Header & Search Input */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
            <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
              <div className="absolute left-3 flex items-center justify-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full h-[44px] pl-10 pr-10 bg-gray-100 text-gray-900 rounded-full text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mobile-search-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-1 w-[44px] h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95 transition-transform touch-target"
                  aria-label="Clear search"
                >
                  <XCircle className="w-5 h-5 fill-gray-200" />
                </button>
              )}
            </form>
            <button 
              onClick={onClose} 
              className="text-gray-500 font-medium text-[14px] active:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto w-full relative">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                <p className="text-sm">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="bg-white">
                <div className="px-4 py-2 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b border-gray-100">
                  Products ({results.length})
                </div>
                <div className="flex flex-col">
                  {results.map((product) => (
                    <MobileSearchResult
                      key={product.id}
                      product={product}
                      formatPrice={formatPrice}
                      onClick={handleResultClick}
                    />
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button 
                    onClick={handleSubmit}
                    className="w-full h-[48px] bg-gray-100 text-gray-900 font-medium rounded-xl active:bg-gray-200 transition-colors text-[14px]"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              </div>
            ) : query.trim().length > 1 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-5 border border-gray-100">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-[14px] text-gray-500 max-w-[250px]">
                  We couldn't find any products matching <span className="font-medium text-gray-900">"{query}"</span>. Try checking for typos or using different keywords.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 opacity-60">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-[14px] text-gray-500">Type at least 2 characters to search</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileSearchModal;
