import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Search, Heart, ShoppingCart, User, LayoutGrid, ChevronLeft, Package, Truck } from 'lucide-react';
import LanguageSwitcherWidget from '@/components/LanguageSwitcherWidget';
import { useCart } from '@/context/CartContext';
import SideCart from '@/components/cart/SideCart';
import { useNavigate } from 'react-router-dom';

const MobileLayoutPreviewRenderer = ({ settings }) => {
  const [imageError, setImageError] = useState(false);
  const { getCartCount, openCart } = useCart();
  const navigate = useNavigate();
  
  if (!settings) return null;

  const { topStrip, header, shopBar, bottomNav, pagePadding, sectionSpacing } = settings;
  const cartCount = getCartCount();

  const getIcon = (key) => {
    switch (key) {
      case 'store': return <Store className="w-5 h-5" />;
      case 'search': return <Search className="w-5 h-5" />;
      case 'wishlist': return <Heart className="w-5 h-5" />;
      case 'cart': return <ShoppingCart className="w-5 h-5" />;
      case 'account': return <User className="w-5 h-5" />;
      case 'categories': return <LayoutGrid className="w-5 h-5" />;
      case 'products': return <Package className="w-5 h-5" />;
      case 'tracking': return <Truck className="w-5 h-5" />;
      default: return <Store className="w-5 h-5" />;
    }
  };

  const handleNavClick = (item) => {
    if (item.key === 'cart') {
      openCart();
    } else if (item.link) {
      if (item.link.startsWith('http://') || item.link.startsWith('https://')) {
        window.open(item.link, '_blank');
      } else {
        navigate(item.link);
      }
    }
  };

  const visibleBottomNavItems = bottomNav?.items
    ?.filter(item => item.enabled)
    ?.sort((a, b) => a.order - b.order)
    ?.slice(0, bottomNav.maxIcons) || [];

  const paddingX = pagePadding?.horizontal ?? 12;
  const paddingY = pagePadding?.vertical ?? 12;
  const spacing = sectionSpacing ?? 16;

  const validPaddingX = Math.max(0, paddingX);
  const negativeMarginX = Math.min(0, paddingX);
  
  const validPaddingY = Math.max(0, paddingY);
  const negativeMarginY = Math.min(0, paddingY);
  
  const validGap = Math.max(0, spacing);
  const negativeGap = Math.min(0, spacing);

  return (
    <>
      <div className="mx-auto w-[320px] h-[650px] bg-white border-[10px] border-gray-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col ring-1 ring-gray-200">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-40 mx-auto z-50"></div>

        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 relative mt-6">
          
          <div style={{ paddingLeft: validPaddingX, paddingRight: validPaddingX, marginLeft: negativeMarginX, marginRight: negativeMarginX }} className="bg-white z-40 relative">
            {/* Top Strip */}
            <AnimatePresence>
              {topStrip?.enabled && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: topStrip.height, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ 
                    backgroundColor: topStrip.backgroundColor, 
                    color: topStrip.textColor,
                    paddingTop: topStrip.padding.top,
                    paddingBottom: topStrip.padding.bottom
                  }}
                  className="flex items-center justify-center text-xs font-medium overflow-hidden shrink-0"
                  dangerouslySetInnerHTML={{ __html: topStrip.content }}
                />
              )}
            </AnimatePresence>

            {/* Header */}
            <AnimatePresence>
              {header?.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: header.height, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    paddingTop: header.padding?.top || 8,
                    paddingBottom: header.padding?.bottom || 8,
                    justifyContent: header.alignment === 'center' ? 'center' : 'space-between'
                  }}
                  className={`bg-white border-b flex items-center shrink-0 shadow-sm relative ${header.alignment === 'left' ? 'justify-start gap-3' : ''}`}
                >
                  {header.alignment === 'center' && header.showBackButton && (
                    <div className="absolute left-0"><ChevronLeft className="w-5 h-5" /></div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {header.showBackButton && header.alignment !== 'center' && <ChevronLeft className="w-5 h-5" />}
                    
                    {header.showLogo && (
                      <div className="flex items-center justify-center">
                        {header.logoUrl && !imageError ? (
                          <img 
                            src={header.logoUrl} 
                            alt="Mobile Logo Preview" 
                            className="h-8 w-auto max-w-[100px] object-contain"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xs">
                            L
                          </div>
                        )}
                      </div>
                    )}
                    
                    {header.showPageTitle && <span className="font-semibold text-sm">Page Title</span>}
                  </div>

                  <div className={`flex items-center gap-2 ${header.alignment === 'center' ? 'absolute right-0' : ''}`}>
                    {header.showSearchIcon && <Search className="w-4 h-4 text-gray-700" />}
                    {header.showLanguageIcon && (
                      <div className="scale-90 origin-right flex items-center justify-center">
                        <LanguageSwitcherWidget inline={true} />
                      </div>
                    )}
                    {header.showCartIcon && (
                      <button onClick={openCart} className="relative p-1">
                        <ShoppingCart className="w-4 h-4 text-gray-700" />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground border-2 border-white shadow-sm">
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shop Bar */}
            <AnimatePresence>
              {shopBar?.enabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    paddingTop: shopBar.padding?.top || 8,
                    paddingBottom: shopBar.padding?.bottom || 8,
                    gap: shopBar.spacing || 8
                  }}
                  className={`bg-white flex flex-col shrink-0 ${shopBar.position === 'sticky-top' ? 'sticky top-0 shadow-sm' : 'border-b'}`}
                >
                  {shopBar.showSearchBar && (
                    <div className="w-full h-9 bg-gray-100 rounded-full flex items-center px-3 text-gray-400 text-xs">
                      <Search className="w-3 h-3 mr-2" /> Search products...
                    </div>
                  )}
                  {shopBar.showCategoryBar && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                      {['All', 'New', 'Sale', 'Tops'].map(cat => (
                        <div key={cat} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-medium whitespace-nowrap">
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Scroll Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 overflow-x-hidden">
            <div 
              className="flex flex-col relative"
              style={{
                paddingLeft: validPaddingX,
                paddingRight: validPaddingX,
                paddingTop: validPaddingY,
                paddingBottom: validPaddingY,
                marginLeft: negativeMarginX,
                marginRight: negativeMarginX,
                marginTop: negativeMarginY,
                marginBottom: negativeMarginY,
                gap: validGap
              }}
            >
              <div className="w-full h-32 bg-gray-200 rounded-xl animate-pulse shadow-sm" style={{ marginBottom: negativeGap }}></div>
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: negativeGap }}>
                <div className="h-40 bg-gray-200 rounded-xl animate-pulse shadow-sm"></div>
                <div className="h-40 bg-gray-200 rounded-xl animate-pulse shadow-sm"></div>
                <div className="h-40 bg-gray-200 rounded-xl animate-pulse shadow-sm"></div>
                <div className="h-40 bg-gray-200 rounded-xl animate-pulse shadow-sm"></div>
              </div>
              <div className="w-full h-24 bg-gray-200 rounded-xl animate-pulse shadow-sm"></div>
            </div>
          </div>

          {/* Bottom Nav */}
          <AnimatePresence>
            {bottomNav?.enabled && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className={`bg-white border-t flex items-center justify-around pb-6 pt-2 px-2 shrink-0 z-40 ${bottomNav.position === 'sticky-top' ? 'absolute top-0 w-full border-b border-t-0' : ''}`}
              >
                {visibleBottomNavItems.map(item => (
                  <div 
                    key={item.key} 
                    onClick={() => handleNavClick(item)}
                    className="flex flex-col items-center justify-center gap-1 relative w-12 cursor-pointer"
                  >
                    <div className="text-gray-500 hover:text-primary transition-colors">
                      {getIcon(item.key)}
                    </div>
                    {item.showLabel && (
                      <span className="text-[9px] font-medium text-gray-500 truncate w-full text-center">
                        {item.label}
                      </span>
                    )}
                    {item.key === 'cart' && item.badge?.enabled && cartCount > 0 && (
                      <div 
                        className="absolute -top-1 -right-1 flex items-center justify-center text-white font-bold"
                        style={{ 
                          backgroundColor: item.badge.color || '#8B5CF6',
                          ...(item.badge.type === 'dot' ? {
                            width: '8px', height: '8px', borderRadius: '50%'
                          } : {
                            width: '16px', height: '16px', borderRadius: '50%', fontSize: '9px'
                          })
                        }}
                      >
                        {item.badge.type === 'count' ? cartCount : ''}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      
      <SideCart navigateTo={navigate} />
    </>
  );
};

export default MobileLayoutPreviewRenderer;