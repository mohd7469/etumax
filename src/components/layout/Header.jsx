import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, Menu, Heart, X, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useProducts } from '@/context/ProductContext';
import { useDesign } from '@/context/DesignContext';
import { useAppInit } from '@/context/AppInitContext';
import { compressImage } from '@/lib/utils';
import LanguageSwitcherWidget from '@/components/LanguageSwitcherWidget';
import { applyHeaderStyles } from '@/lib/headerBuilder';

const CompressedImage = ({ src, alt, className, ...props }) => {
  const { imageCompressionSettings } = useDesign();
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    let isMounted = true;
    if (src && imageCompressionSettings.enabled) {
      compressImage(src, imageCompressionSettings.quality / 100)
        .then(compressedSrc => {
          if (isMounted) {
            setImageSrc(compressedSrc);
          }
        });
    } else {
      setImageSrc(src);
    }
    return () => { isMounted = false; };
  }, [src, imageCompressionSettings]);

  return <img src={imageSrc} alt={alt} className={className} {...props} />;
};

const Header = ({ navigateTo }) => {
  const { getCartCount, openCart } = useCart();
  const { user, wishlist } = useUser();
  const { searchProducts, formatPrice } = useProducts();
  const { headerSettings, advancedHeaderSettings } = useDesign();
  const { storeSettings } = useAppInit();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = searchProducts(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('search', { query: searchQuery });
      setSearchQuery('');
      setSearchResults([]);
      setIsSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const handleResultClick = (product) => {
    navigateTo('product-detail', { product });
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) return product.images[0];
    return 'https://ae.pharmacydxb.ae/wp-content/uploads/2026/03/Untitled-1.png';
  };

  if (advancedHeaderSettings && advancedHeaderSettings.enabled) {
    const { topBar, logo, search, nav, icons, elements, design } = advancedHeaderSettings;
    const styles = applyHeaderStyles(design);

    const displayLogoText = logo.text || storeSettings?.storeName || '';
    const displayLogoUrl = logo.url || storeSettings?.siteLogo || '';

    const renderLogo = () => (
      <Link to="/" className={`font-bold text-2xl flex-shrink-0 ${logo.align === 'center' ? 'mx-auto' : ''}`} style={{ color: 'var(--header-text)' }}>
        {logo.type === 'image' && displayLogoUrl ? (
          <CompressedImage src={displayLogoUrl} alt={displayLogoText || 'Store Logo'} className="h-10 object-contain" />
        ) : (
          displayLogoText || 'Store'
        )}
      </Link>
    );

    const renderSearch = () => {
      if (!search.show) return null;
      return (
        <div ref={searchContainerRef} className={`relative flex items-center ${search.width === 'full' ? 'flex-1 max-w-2xl mx-6' : 'w-64 mx-4'}`}>
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" style={{ color: 'var(--header-text)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={search.placeholder}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full border focus:outline-none focus:ring-1 focus:ring-opacity-50"
                style={{
                  borderColor: 'var(--header-border)',
                  color: 'var(--header-text)',
                  backgroundColor: 'transparent',
                  '--tw-ring-color': 'var(--header-accent)'
                }}
              />
            </div>
          </form>
          <AnimatePresence>
            {isSearchFocused && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden"
              >
                <ul className="max-h-96 overflow-y-auto">
                  {searchResults.map(product => (
                    <li key={product.id}>
                      <Link to={`/product/${product.slug || product.id}`} onClick={() => handleResultClick(product)} className="w-full text-left flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors text-gray-800">
                        <CompressedImage alt={product.name} className="w-10 h-10 rounded object-cover flex-shrink-0" src={getProductImage(product)} />
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs" style={{ color: 'var(--header-accent)' }}>{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

    const renderNav = () => (
      <nav className={`hidden lg:flex items-center gap-6 px-4 ${nav.align === 'center' ? 'flex-1 justify-center' : nav.align === 'right' ? 'ml-auto' : ''}`}>
        <Link to="/categories" className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-1.5" style={{ color: 'var(--header-text)' }}>
          Categories
        </Link>
        {(nav.links || []).map((l, i) => (
          <Link key={i} to={l.url} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--header-text)' }}>
            {l.text}
          </Link>
        ))}
      </nav>
    );

    const renderIcons = () => (
      <div className="flex items-center gap-5 flex-shrink-0 ml-auto" style={{ color: 'var(--header-text)' }}>
        {icons.language && (
          <div className="flex">
            <LanguageSwitcherWidget inline={true} customColor={design.text} />
          </div>
        )}
        {icons.account && (
          <Link to="/account" className="hover:opacity-80 transition-opacity hidden sm:block">
            <User className="w-5 h-5" />
          </Link>
        )}
        {icons.wishlist && (
          <Link to={user ? "/wishlist" : "/account"} className="relative cursor-pointer hover:opacity-80 transition-opacity hidden sm:block">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {wishlist.length}
              </span>
            )}
          </Link>
        )}
        {icons.cart && (
          <button onClick={openCart} className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <ShoppingCart className="w-6 h-6" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--header-accent)' }}>
                {getCartCount()}
              </span>
            )}
          </button>
        )}
        <div className="lg:hidden flex items-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 ml-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    );

    return (
      <div className="sticky top-0 z-50 w-full advanced-header shadow-sm" style={styles}>
        {topBar.show && (
          <div className="w-full text-center py-2 text-sm font-medium" style={{ backgroundColor: topBar.bg, color: topBar.textColor }}>
            <div className="container mx-auto px-4" dangerouslySetInnerHTML={{ __html: topBar.text }} />
          </div>
        )}
        <div className="container mx-auto px-4">
          <div
            className="flex items-center justify-between"
            style={{
              paddingTop: 'var(--header-padding-y)',
              paddingBottom: 'var(--header-padding-y)',
              gap: 'var(--header-gap)'
            }}
          >
            <div className="lg:hidden flex items-center justify-between w-full">
              {renderLogo()}
              {renderIcons()}
            </div>
            <div className="hidden lg:flex items-center w-full">
              {elements.map((el, idx) => {
                if (el === 'logo') return <React.Fragment key={idx}>{renderLogo()}</React.Fragment>;
                if (el === 'search') return <React.Fragment key={idx}>{renderSearch()}</React.Fragment>;
                if (el === 'nav') return <React.Fragment key={idx}>{renderNav()}</React.Fragment>;
                if (el === 'icons') return <React.Fragment key={idx}>{renderIcons()}</React.Fragment>;
                return null;
              })}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden py-4 px-4 bg-white border-t"
              style={{ borderColor: 'var(--header-border)' }}
            >
              {search.show && (
                <form onSubmit={handleSearchSubmit} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={search.placeholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-full border focus:outline-none focus:ring-1 text-sm text-gray-800"
                      style={{ borderColor: 'var(--header-border)', '--tw-ring-color': 'var(--header-accent)' }}
                    />
                  </div>
                </form>
              )}

              <nav className="flex flex-col gap-1">
                <Link
                  to="/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm text-gray-800 flex items-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4" /> Categories
                </Link>
                {(nav.links || []).map((link, index) => (
                  <Link
                    key={index}
                    to={link.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm text-gray-800"
                  >
                    {link.text}
                  </Link>
                ))}
                <div className="h-px bg-gray-200 my-2 mx-2"></div>
                <Link
                  to={user ? "/wishlist" : "/account"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 text-sm font-medium text-gray-800"
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</span>
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 text-sm font-medium text-gray-800"
                >
                  <User className="w-5 h-5" />
                  <span>{user ? user.name : 'Account'}</span>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const displayLogoText = headerSettings.logoText || storeSettings?.storeName || 'Store';
  const displayLogoUrl = headerSettings.logoUrl || storeSettings?.siteLogo || '';

  const headerStyle = {
    background: headerSettings.useGradient ? `linear-gradient(to right, ${headerSettings.gradientFrom}, ${headerSettings.gradientTo})` : headerSettings.backgroundColor,
    color: headerSettings.textColor,
  };
  const linkStyle = {
    color: headerSettings.textColor,
    fontFamily: headerSettings.fontFamily,
  };

  return (
    <header style={headerStyle} className="sticky top-0 z-50 backdrop-blur-lg border-b border-purple-100 shadow-sm relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-medium" style={{ fontFamily: headerSettings.fontFamily }}>
              {displayLogoUrl ? (
                <CompressedImage alt={displayLogoText} className="h-8 max-w-xs" src={displayLogoUrl} />
              ) : (
                displayLogoText
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/categories" style={linkStyle} className="text-sm font-medium hover:text-purple-600 transition-colors">
                Categories
              </Link>
              {headerSettings.navLinks.map((link, index) => (
                <Link key={index} to={link.url} style={linkStyle} className="text-sm font-medium hover:text-purple-600 transition-colors">
                  {link.text}
                </Link>
              ))}
            </nav>
          </div>

          <div ref={searchContainerRef} className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={"Search products..."}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white/80"
                />
              </div>
            </form>
            <AnimatePresence>
              {isSearchFocused && searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <ul className="max-h-96 overflow-y-auto">
                    {searchResults.map(product => (
                      <li key={product.id}>
                        <Link to={`/product/${product.slug || product.id}`} onClick={() => handleResultClick(product)} className="w-full text-left flex items-center gap-4 p-3 hover:bg-purple-50 transition-colors text-gray-800">
                          <CompressedImage alt={product.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" src={getProductImage(product)} />
                          <div>
                            <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                            <p className="text-sm text-purple-600">{formatPrice(product.price)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center mr-1 md:mr-2">
              <LanguageSwitcherWidget inline={true} customColor={headerSettings.textColor} />
            </div>

            <div className="hidden md:flex items-center gap-4 border-l border-white/20 pl-4 ml-1">
              <Link to="/account" className="flex items-center gap-2 hover:text-purple-600 transition-colors relative" style={linkStyle}>
                <User className="w-5 h-5" />
                <span className="text-sm font-bold hidden xl:inline">{user ? user.name : 'Account'}</span>
              </Link>

              <Link to={user ? "/wishlist" : "/account"} className="relative">
                <Heart style={linkStyle} className="w-5 h-5 hover:text-pink-600 transition-colors" />
                {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{wishlist.length}</span>}
              </Link>
            </div>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={openCart} className="relative ml-2">
              <ShoppingCart style={linkStyle} className="w-6 h-6 hover:text-purple-600 transition-colors" />
              {getCartCount() > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ backgroundColor: "hsl(var(--primary))" }} className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{getCartCount()}</motion.span>}
            </motion.button>

            <div className="lg:hidden flex items-center ml-2">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1" style={linkStyle}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden border-t border-purple-100 py-4">
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={"Search products..."} className="w-full pl-10 pr-4 py-2.5 rounded-full border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 text-sm" />
                </div>
              </form>
              <nav className="flex flex-col gap-1">
                <Link to="/categories" onClick={() => setMobileMenuOpen(false)} style={linkStyle} className="text-left px-4 py-3 hover:bg-black/5 rounded-lg transition-colors font-medium text-sm flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> Categories
                </Link>
                {headerSettings.navLinks.map((link, index) => (
                  <Link key={index} to={link.url} onClick={() => setMobileMenuOpen(false)} style={linkStyle} className="text-left px-4 py-3 hover:bg-black/5 rounded-lg transition-colors font-medium text-sm">{link.text}</Link>
                ))}
                <div className="h-px bg-white/20 my-2 mx-2"></div>
                <Link to={user ? "/wishlist" : "/account"} onClick={() => setMobileMenuOpen(false)} style={linkStyle} className="text-left px-4 py-3 hover:bg-black/5 rounded-lg transition-colors flex items-center gap-3 text-sm font-medium">
                  <Heart className="w-5 h-5" /><span>Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</span>
                </Link>
                <Link to="/account" onClick={() => setMobileMenuOpen(false)} style={linkStyle} className="text-left px-4 py-3 hover:bg-black/5 rounded-lg transition-colors flex items-center gap-3 text-sm font-medium">
                  <User className="w-5 h-5" /><span>{user ? user.name : 'Account'}</span>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;