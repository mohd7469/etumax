import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Home, Package, Phone, Truck, Heart, Settings, LayoutGrid, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Load wishlist count when menu opens
      try {
        const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(saved.length);
      } catch (e) {
        setWishlistCount(0);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery('');
    }
  };

  const navigateTo = (path) => {
    navigate(path);
    onClose();
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: LayoutGrid },
    { label: 'Contact', path: '/contact', icon: Phone },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[110] lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white z-[120] flex flex-col shadow-xl lg:hidden"
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Menu</h2>
              <button 
                onClick={onClose}
                className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-sm border border-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search store..."
                  className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>

            {/* Scrollable Links */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-3 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => navigateTo(link.path)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                        isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                      {link.label}
                    </button>
                  );
                })}
              </div>

              <div className="my-4 border-t border-gray-100" />

              <div className="px-3 space-y-1">
<button
  onClick={() => navigateTo('/track-order')}
  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-left"
>
  <Truck className="w-5 h-5 text-gray-400" />
  Order Tracking
</button>

{/* NEW MY ACCOUNT BUTTON */}
<button
  onClick={() => navigateTo('/account')}
  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-left"
>
  <User className="w-5 h-5 text-gray-400" />
  My Account
</button>
                <button
                  onClick={() => navigateTo('/wishlist')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-gray-400" />
                    Wishlist
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Footer / Admin Link */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => navigateTo('/admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors"
              >
                <Settings className="w-4 h-4" />
                Store Admin
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;