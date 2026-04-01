import React from 'react';
import { Search, ShoppingCart, User, Heart, Globe, Menu } from 'lucide-react';
import { applyHeaderStyles } from '@/lib/headerBuilder';

const HeaderLivePreview = ({ settings, deviceView }) => {
  const styles = applyHeaderStyles(settings.design);
  const { topBar, logo, search, nav, icons, elements } = settings;

  const getContainerClass = () => {
    switch (deviceView) {
      case 'mobile': return 'w-[375px] mx-auto border shadow-xl rounded-b-lg overflow-hidden transition-all duration-300 bg-gray-50 h-[600px] flex flex-col relative';
      case 'tablet': return 'w-[768px] mx-auto border shadow-xl rounded-b-lg overflow-hidden transition-all duration-300 bg-gray-50 h-[600px] flex flex-col relative';
      default: return 'w-full border shadow-xl rounded-b-lg overflow-hidden transition-all duration-300 bg-gray-50 min-h-[400px] relative';
    }
  };

  const isMobile = deviceView === 'mobile';

  const renderLogo = () => (
    <div className={`font-bold text-xl flex-shrink-0 ${!isMobile && logo.align === 'center' ? 'mx-auto' : ''}`} style={{ color: 'var(--header-text)' }}>
      {logo.type === 'image' && logo.url ? (
        <img src={logo.url} alt="Logo" className="h-8 object-contain" />
      ) : (
        logo.text || 'StoreLogo'
      )}
    </div>
  );

  const renderSearch = () => {
    if (!search.show) return null;
    return (
      <div className={`relative flex items-center ${search.width === 'full' ? 'flex-1 max-w-2xl' : 'w-48'}`}>
        <Search className="absolute left-3 w-4 h-4 opacity-50" style={{ color: 'var(--header-text)' }} />
        <input
          disabled
          placeholder={search.placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-full border bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--header-border)', color: 'var(--header-text)' }}
        />
      </div>
    );
  };

  const renderNav = () => {
    if (isMobile) return null; // Mobile nav usually in drawer
    return (
      <nav className={`flex items-center gap-6 ${nav.align === 'center' ? 'flex-1 justify-center' : ''}`}>
        {(nav.links || []).map((l, i) => (
          <a key={i} href="#" onClick={e => e.preventDefault()} className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--header-text)' }}>
            {l.text}
          </a>
        ))}
      </nav>
    );
  };

  const renderIcons = () => (
    <div className="flex items-center gap-4 flex-shrink-0" style={{ color: 'var(--header-text)' }}>
      {icons.language && <Globe className="w-5 h-5 hover:opacity-80 transition-opacity cursor-pointer" />}
      {icons.account && <User className="w-5 h-5 hover:opacity-80 transition-opacity cursor-pointer" />}
      {icons.wishlist && (
        <div className="relative cursor-pointer">
          <Heart className="w-5 h-5 hover:opacity-80 transition-opacity" />
          <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">2</span>
        </div>
      )}
      {icons.cart && (
        <div className="relative cursor-pointer">
          <ShoppingCart className="w-5 h-5 hover:opacity-80 transition-opacity" />
          <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--header-accent)' }}>3</span>
        </div>
      )}
      {isMobile && <Menu className="w-6 h-6 ml-2" />}
    </div>
  );

  return (
    <div className="bg-gray-200 p-4 lg:p-8 flex items-start justify-center overflow-auto rounded-lg min-h-[600px]">
      <div className={getContainerClass()} style={styles}>
        {/* Top Bar */}
        {topBar.show && (
          <div
            className="w-full text-center py-1.5 text-xs font-medium"
            style={{ backgroundColor: topBar.bg, color: topBar.textColor }}
          >
            {topBar.text}
          </div>
        )}

        {/* Main Header */}
        <header
          className="w-full flex items-center justify-between transition-all"
          style={{
            backgroundColor: 'var(--header-bg)',
            borderBottom: `1px solid var(--header-border)`,
            paddingTop: 'var(--header-padding-y)',
            paddingBottom: 'var(--header-padding-y)',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            gap: isMobile ? '1rem' : 'var(--header-gap)'
          }}
        >
          {isMobile ? (
            // Mobile layout is fixed usually: Logo left, icons right
            <>
              {renderLogo()}
              <div className="ml-auto">{renderIcons()}</div>
            </>
          ) : (
            // Desktop respects element ordering
            elements.map((el, idx) => {
              if (el === 'logo') return <React.Fragment key={idx}>{renderLogo()}</React.Fragment>;
              if (el === 'search') return <React.Fragment key={idx}>{renderSearch()}</React.Fragment>;
              if (el === 'nav') return <React.Fragment key={idx}>{renderNav()}</React.Fragment>;
              if (el === 'icons') return <React.Fragment key={idx}>{renderIcons()}</React.Fragment>;
              return null;
            })
          )}
        </header>

        {/* Mobile Search - Often pushed to a separate row on mobile if enabled */}
        {isMobile && search.show && (
          <div className="w-full p-3 border-b" style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--header-border)' }}>
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3 w-4 h-4 opacity-50" style={{ color: 'var(--header-text)' }} />
              <input
                disabled
                placeholder={search.placeholder}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full border bg-transparent focus:outline-none"
                style={{ borderColor: 'var(--header-border)', color: 'var(--header-text)' }}
              />
            </div>
          </div>
        )}

        {/* Dummy Content to show header boundary */}
        <div className="flex-1 p-8 text-center text-gray-400">
          Page Content Area
        </div>
      </div>
    </div>
  );
};

export default HeaderLivePreview;