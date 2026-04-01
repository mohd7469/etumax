
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Search, Heart, User, X, ChevronRight, ShoppingCart, LayoutGrid, Package, Truck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useMobileLayout } from '@/context/MobileLayoutContext';
import { useWhatsApp } from '@/context/WhatsAppContext';

const SearchModal = ({ isOpen, onClose, navigateTo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchProducts, formatPrice } = useProducts();
  const results = searchQuery.length > 1 ? searchProducts(searchQuery) : [];

  const handleResultClick = (product) => {
    onClose();
    navigateTo('product-detail', { product });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      navigateTo('search', { query: searchQuery });
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[100] p-4 flex flex-col"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl p-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-4">
          <Search className="text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={"Search products..."}
            autoFocus
            className="w-full bg-transparent focus:outline-none"
          />
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <X />
          </Button>
        </form>
        {searchQuery.length > 1 && (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              results.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product)}
                  className="w-full text-left flex items-center gap-4 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                  <div>
                    <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                    <p className="text-sm text-purple-600">{formatPrice(product.price)}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">{'No results found.'}</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const CategoriesPanel = ({ isOpen, onClose, navigateTo }) => {
  const { categories } = useProducts();

  const handleCategoryClick = (category) => {
    onClose();
    const categoryId = category.slug || category.id;
    navigateTo('products', { category: categoryId });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[100]"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">{'Categories'}</h3>
              <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
            </div>
            <div className="p-4 space-y-2">
              <button onClick={() => handleCategoryClick({ id: 'all' })} className="flex justify-between items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors">
                <span>{'All Products'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => handleCategoryClick(cat)} className="flex justify-between items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <span>{cat.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MobileBottomNav = ({ navigateTo }) => {
  const location = useLocation();
  const { getCartCount, openCart } = useCart();
  const { settings, loading } = useMobileLayout();
  const { settings: waSettings } = useWhatsApp();
  const { products, formatPrice } = useProducts();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  if (loading || !settings || !settings.bottomNav?.enabled) return null;

  const cartCount = getCartCount();
  const { bottomNav } = settings;
  const showMobileWhatsApp = bottomNav?.showWhatsApp !== false && waSettings?.enabled;

  const getIcon = (key) => {
    switch (key) {
      case 'store': return Store;
      case 'search': return Search;
      case 'wishlist': return Heart;
      case 'cart': return ShoppingCart;
      case 'account': return User;
      case 'categories': return LayoutGrid;
      case 'products': return Package;
      case 'tracking': return Truck;
      default: return Store;
    }
  };

  const handleAction = (item) => {
    try {
      if (item.key === 'search' && (!item.link || item.link === '/search')) {
        return setIsSearchOpen(true);
      }
      if (item.key === 'categories' && (!item.link || item.link === '/categories')) {
        return setIsCategoriesOpen(true);
      }
      if (item.key === 'cart' && (!item.link || item.link === '/cart')) {
        return openCart ? openCart() : navigateTo('cart');
      }

      if (item.link) {
        if (item.link.startsWith('http://') || item.link.startsWith('https://')) {
          window.open(item.link, '_blank', 'noopener,noreferrer');
        } else {
          navigateTo(item.link);
        }
      } else {
        navigateTo('/');
      }
    } catch (err) {
      console.error(`Error navigating to ${item.key}:`, err);
    }
  };

  const handleWhatsAppAction = () => {
    let msg = waSettings?.defaultMessage || "";
    
    // Quick auto-message attempt based on current URL
    const url = window.location.href;
    msg = msg.replace(/\[URL\]/gi, url);

    if (location.pathname.includes("/product/")) {
      const slug = location.pathname.split("/product/")[1]?.split("/")[0];
      const product = products?.find((p) => p.slug === slug);
      if (product) {
        const title = product.name || "";
        const price = product.price ? formatPrice(product.price) : "";
        msg = msg.replace(/\[TITLE\]/gi, title);
        msg = msg.replace(/\[PRICE\]/gi, price);
      }
    } else {
      msg = msg.replace(/\[TITLE\]/gi, "");
      msg = msg.replace(/\[PRICE\]/gi, "");
    }

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${waSettings.phoneNumber}?text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  const visibleItems = bottomNav.items
    .filter(item => item.enabled)
    .sort((a, b) => a.order - b.order)
    .slice(0, bottomNav.maxIcons);

  return (
    <>
      <div className={`fixed left-0 right-0 h-16 bg-white border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center z-40 lg:hidden ${bottomNav.position === 'sticky-top' ? 'top-0 border-b' : 'bottom-0 border-t'}`}>
        {visibleItems.map((item) => {
          const Icon = getIcon(item.key);
          const path = item.link || '/';
          const isActive = (path === '/' && location.pathname === '/') || 
                           (path !== '/' && location.pathname.startsWith(path)) || 
                           (item.key === 'search' && isSearchOpen) ||
                           (item.key === 'categories' && isCategoriesOpen);
          
          return (
            <button
              key={item.key}
              onClick={() => handleAction(item)}
              className={`flex flex-col items-center justify-center text-gray-500 transition-colors relative w-16 h-full ${isActive ? 'text-primary' : 'hover:text-primary'}`}
            >
              <div className="relative flex flex-col items-center">
                <Icon className="w-5 h-5 mb-1" />
                {item.showLabel && (
                  <span className="text-[10px] font-medium truncate w-full px-1">{item.label}</span>
                )}
                
                {item.key === 'cart' && item.badge?.enabled && cartCount > 0 && (
                  <span 
                    className="absolute -top-1.5 -right-2 flex items-center justify-center text-white font-bold"
                    style={{ 
                      backgroundColor: item.badge.color || '#ef4444',
                      ...(item.badge.type === 'dot' ? {
                        width: '8px', height: '8px', borderRadius: '50%'
                      } : {
                        width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px'
                      })
                    }}
                  >
                    {item.badge.type === 'count' ? (cartCount > 9 ? '9+' : cartCount) : ''}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* Inline WhatsApp Nav Item */}
        {showMobileWhatsApp && (
          <button
            onClick={handleWhatsAppAction}
            className="flex flex-col items-center justify-center text-gray-500 hover:text-green-500 transition-colors relative w-16 h-full"
          >
            <div className="relative flex items-center justify-center w-8 h-8 bg-[#25D366] rounded-full shadow-sm mb-1">
              <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></span>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                className="w-5 h-5 relative z-10"
                alt="WhatsApp"
              />
            </div>
          </button>
        )}
      </div>
      
      {bottomNav.position !== 'sticky-top' && <div className="block lg:hidden h-16" />}
      
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} navigateTo={navigateTo} />
      <CategoriesPanel isOpen={isCategoriesOpen} onClose={() => setIsCategoriesOpen(false)} navigateTo={navigateTo} />
    </>
  );
};

export default MobileBottomNav;
