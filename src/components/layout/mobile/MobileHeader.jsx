
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, ChevronLeft, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMobileLayout } from '@/context/MobileLayoutContext';
import { useAppInit } from '@/context/AppInitContext';
import LanguageSwitcherWidget from '@/components/LanguageSwitcherWidget';
import { useCart } from '@/context/CartContext';
import SideCart from '@/components/cart/SideCart';
import MobileSearchModal from './MobileSearchModal';
import MobileMenu from './MobileMenu';

const MobileHeader = () => {
  const { settings, loading } = useMobileLayout();
  const { storeSettings } = useAppInit();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);
  
  const { getCartCount, openCart } = useCart();
  
  // Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  if (loading || !settings) return null;
  
  const { header } = settings;
  const cartCount = getCartCount();

  const handleBack = () => navigate(-1);

  const getPageTitle = () => {
    if (location.pathname === '/') return storeSettings?.storeName || 'Home';
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const mainPart = pathParts[0];
      return mainPart.charAt(0).toUpperCase() + mainPart.slice(1).replace(/-/g, ' ');
    }
    return storeSettings?.storeName || 'Store';
  };

  const logoSrc = header.logoUrl && !imageError 
    ? header.logoUrl 
    : (storeSettings?.storeLogo || storeSettings?.logoUrl || storeSettings?.logo);

  return (
    <>
      <AnimatePresence>
        {header.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: header.height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              paddingLeft: header.padding.left,
              paddingRight: header.padding.right,
              paddingTop: header.padding.top,
              paddingBottom: header.padding.bottom,
              justifyContent: header.alignment === 'center' ? 'center' : 'space-between'
            }}
            className={`bg-white border-b flex items-center shrink-0 z-30 shadow-sm relative lg:hidden w-full ${header.alignment === 'left' ? 'justify-start gap-3' : ''}`}
          >
            {/* Absolute left for center alignment */}
            {header.alignment === 'center' && (
              <div className="absolute left-4 flex items-center">
                {header.showBackButton && location.pathname !== '/' ? (
                  <button onClick={handleBack} className="p-2 -ml-2 touch-target">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                ) : header.showMenuIcon ? (
                  <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 touch-target">
                    <Menu className="w-6 h-6 text-gray-700" />
                  </button>
                ) : null}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {/* Inline left for non-center alignment */}
              {header.alignment !== 'center' && (
                <>
                  {header.showBackButton && location.pathname !== '/' ? (
                    <button onClick={handleBack} className="p-2 -ml-2 touch-target">
                      <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                  ) : header.showMenuIcon ? (
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 touch-target">
                      <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                  ) : null}
                </>
              )}
              
              {header.showLogo && (
                <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer py-1">
                  {logoSrc ? (
                    <img 
                      src={logoSrc} 
                      alt={storeSettings?.storeName || "Store Logo"} 
                      className="h-8 w-auto max-w-[120px] object-contain" 
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xs">
                      {storeSettings?.storeName?.charAt(0) || 'S'}
                    </div>
                  )}
                </div>
              )}
              
              {header.showPageTitle && (
                <span className="font-semibold text-[15px] text-gray-900 line-clamp-1 max-w-[150px]">
                  {getPageTitle()}
                </span>
              )}
            </div>

            <div className={`flex items-center gap-1 ${header.alignment === 'center' ? 'absolute right-2' : ''}`}>
              {header.showSearchIcon && (
                <button 
                  onClick={() => setIsSearchOpen(true)} 
                  className="p-2 touch-target flex items-center justify-center"
                  aria-label="Search"
                >
                  <Search className="w-[22px] h-[22px] text-gray-700" />
                </button>
              )}
              
              {header.showLanguageIcon && (
                <div className="flex items-center px-1">
                  <LanguageSwitcherWidget inline={true} />
                </div>
              )}

              {header.showCartIcon && (
                <button 
                  onClick={openCart} 
                  className="p-2 touch-target relative flex items-center justify-center"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-[22px] h-[22px] text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute top-[2px] right-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-[1.5px] border-white shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SideCart navigateTo={navigate} />

      <MobileSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};

export default MobileHeader;
