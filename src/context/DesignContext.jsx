
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { produce } from 'immer';
import { defaultAdvancedFooterSettings } from '@/lib/footerBuilder';
import { defaultAdvancedHeaderSettings } from '@/lib/headerBuilder';
import { listenToDocument, setDocument } from '@/lib/firestoreService';

const DesignContext = createContext();

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};

const initialHeaderSettings = { logoText: '', logoUrl: '', navLinks: [{ text: 'Home', url: '/' }, { text: 'Products', url: '/products' }, { text: 'About', url: '/page/about-us' }, { text: 'Contact', url: '/page/contact' }], backgroundColor: '#FFFFFF', textColor: '#1f2937', fontFamily: 'Arial', useGradient: false, gradientFrom: '#8B5CF6', gradientTo: '#EC4899' };
const initialFooterSettings = { logoText: '', aboutText: 'The best place to find amazing products at great prices. High-quality items and fast shipping.', copyrightText: `© ${new Date().getFullYear()} . All Rights Reserved.`, backgroundColor: '#111827', textColor: '#F9FAFB', linkColor: '#9CA3AF', showNewsletter: true, showSocialIcons: true, socialLinks: [{ platform: 'facebook', url: '' }, { platform: 'twitter', url: '' }, { platform: 'instagram', url: '' }, { platform: 'youtube', url: '' }], linkColumns: [{ title: 'Shop', links: [{ text: 'All Products', url: '/products' }, { text: 'Electronics', url: '/products/electronics' }, { text: 'Fashion', url: '/products/fashion' }] }, { title: 'POLICIES', links: [{ text: 'About Us', url: '/page/about-us' }, { text: 'Contact', url: '/page/contact' }, { text: 'Privacy Policy', url: '#' }] }] };
const defaultSectionsOrder = ['hero', 'features', 'shopByCategory', 'featuredProducts', 'dualHeroBanner', 'categoryHighlight', 'productGrid', 'featuredCarousel', 'categoryBanners', 'imageLinkCarousel1', 'imageLinkCarousel2', 'imageLinkCarousel3', 'categoryCarousel1', 'categoryCarousel2', 'categoryCarousel3', 'brandPromo', 'brandPromo2', 'brandPromo3', 'brandPromo4', 'brandPromo5', 'brandPromo6', 'bestSellers', 'bigPromoBanner', 'newArrivals', 'trendingProducts'];
const initialHomePageSettings = { 
  hero: { show: true, slides: [{ id: 'slide1', heading: 'Discover Amazing Deals', subheading: 'Shop from thousands of quality products', buttonText: 'Shop Now', buttonLink: '/products', image: '' }], sliderSettings: { autoPlay: true, interval: 3, height: 600 } }, 
  features: { show: true }, 
  featuredProducts: { show: true, title: 'Featured Products', limit: 4, viewAllCategory: 'all' }, 
  bestSellers: { show: true, title: 'Best Sellers', limit: 4 }, 
  newArrivals: { show: true, title: 'New Arrivals', limit: 4 }, 
  shopByCategory: { show: true, title: 'Shop by Category', categories: [] },
  categoryCarousel1: { show: false, type: 'categoryProductCarousel', title: 'Top in Electronics', categoryId: '', speed: 30, autoPlay: true },
  categoryCarousel2: { show: false, type: 'categoryProductCarousel', title: 'Fashion Trends', categoryId: '', speed: 30, autoPlay: true },
  categoryCarousel3: { show: false, type: 'categoryProductCarousel', title: 'Home Essentials', categoryId: '', speed: 30, autoPlay: true },
  brandPromo: { show: true, title: 'Carousel 1', selectedProductIds: [], autoPlay: true, speed: 30 },
  brandPromo2: { show: false, title: 'Carousel 2', selectedProductIds: [], autoPlay: true, speed: 30 },
  brandPromo3: { show: false, title: 'Carousel 3', selectedProductIds: [], autoPlay: true, speed: 30 },
  brandPromo4: { show: false, title: 'Carousel 4', selectedProductIds: [], autoPlay: true, speed: 30 },
  brandPromo5: { show: false, title: 'Carousel 5', selectedProductIds: [], autoPlay: true, speed: 30 },
  brandPromo6: { show: false, title: 'Carousel 6', selectedProductIds: [], autoPlay: true, speed: 30 },
  imageLinkCarousel1: { show: false, title: 'Our Partners', speed: 30, items: [] },
  imageLinkCarousel2: { show: false, title: 'Sponsors', speed: 30, items: [] },
  imageLinkCarousel3: { show: false, title: 'More Links', speed: 30, items: [] },
  sectionsOrder: defaultSectionsOrder 
};
const initialProductPageLayout = [{ id: 'gallery', name: 'Product Gallery', visible: true, settings: {} }, { id: 'title', name: 'Product Title', visible: true, settings: { align: 'left', fontSize: '2.25rem', color: '#111827' } }, { id: 'meta', name: 'Product Meta (SKU, etc)', visible: true, settings: { align: 'left' } }, { id: 'reviews_stars', name: 'Reviews Stars', visible: true, settings: { align: 'left', size: 'medium' } }, { id: 'price', name: 'Price', visible: true, settings: { align: 'left', fontSize: '1.875rem', color: '#8B5CF6' } }, { id: 'short_description', name: 'Short Description', visible: true, settings: { align: 'left' } }, { id: 'variant_selector', name: 'Variant Selector', visible: true, settings: {} }, { id: 'quantity_selector', name: 'Quantity Selector', visible: true, settings: { align: 'left', defaultValue: 1 } }, { id: 'add_to_cart', name: 'Add to Cart Button', visible: true, settings: {} }, { id: 'trust_badges', name: 'Trust Badges', visible: true, settings: { align: 'left' } }, { id: 'product_tabs', name: 'Product Tabs', visible: true, settings: {} }, { id: 'related_products_bottom', name: 'Related Products (Bottom)', visible: true, settings: {} }, { id: 'recently_viewed', name: 'Recently Viewed', visible: true, settings: { limit: 4, columns: 4 } }];
const initialProductPageDesign = { layout: 'three-column', columnWidths: { gallery: 30, info: 45, sidebar: 25 }, sidebar: { show: true, title: 'Related Products', limit: 5 } };
const initialBundleSettings = { enabled: true, discountPercentage: 15, maxProducts: 3 };
const initialMobileLayoutSettings = { global: { fontSizeScale: 1.0, headerVisible: true, footerVisible: true }, homePage: {}, productPage: {} };
const initialProductGridLayoutSettings = { desktop: 4, mobile: 2 };
const initialBoxLayoutSettings = { globalBoxLayoutEnabled: false, carouselWidth: '110%', perPageBoxLayout: { home: { enabled: true, widthType: 'full' }, listing: { enabled: true, widthType: 'full' }, detail: { enabled: true, widthType: 'full' } } };
const initialProductListingSettings = { topBanner: { enabled: false }, featuredProducts: { enabled: false }, categorySection: { style: 'dropdown' }, randomProductsCount: 12, refreshRandomOnLoad: false };
const initialProductListingLayout = { columnsPerRow: 4 };
const initialImageCompressionSettings = { enabled: true, quality: 70 };
const initialLoaderSettings = { enabled: true, style: 'Rings', color: '#8B5CF6' };
const initialHeaderFooterCode = { header: '', body: '', footer: '' };

export const DesignProvider = ({ children }) => {
  const { themeConfig, activeTheme } = useTheme();

  const [themeSettings, setThemeSettings] = useState(themeConfig.colors);
  const [typography, setTypography] = useState(themeConfig.typography);
  const [buttonStyles, setButtonStyles] = useState({ ...themeConfig.button, background: themeConfig.colors.primary, text: themeConfig.colors['primary-foreground'] });
  const [headerSettings, setHeaderSettings] = useState(initialHeaderSettings);
  const [advancedHeaderSettings, setAdvancedHeaderSettings] = useState(defaultAdvancedHeaderSettings);
  const [footerSettings, setFooterSettings] = useState(initialFooterSettings);
  const [advancedFooterSettings, setAdvancedFooterSettings] = useState(defaultAdvancedFooterSettings);
  const [homePageSettings, setHomePageSettings] = useState(initialHomePageSettings);
  const [productPageLayout, setProductPageLayout] = useState(initialProductPageLayout);
  const [productPageDesign, setProductPageDesign] = useState(initialProductPageDesign);
  const [bundleSettings, setBundleSettings] = useState(initialBundleSettings);
  const [mobileLayoutSettings, setMobileLayoutSettings] = useState(initialMobileLayoutSettings);
  const [productGridLayout, setProductGridLayout] = useState(initialProductGridLayoutSettings);
  const [boxLayoutSettings, setBoxLayoutSettings] = useState(initialBoxLayoutSettings);
  const [productListingSettings, setProductListingSettings] = useState(initialProductListingSettings);
  const [productListingLayout, setProductListingLayout] = useState(initialProductListingLayout);
  const [imageCompressionSettings, setImageCompressionSettings] = useState(initialImageCompressionSettings);
  const [loaderSettings, setLoaderSettings] = useState(initialLoaderSettings);
  const [customCss, setCustomCss] = useState('');
  const [customCssHistory, setCustomCssHistory] = useState([]);
  const [headerFooterCode, setHeaderFooterCode] = useState(initialHeaderFooterCode);

  useEffect(() => {
    if (activeTheme !== 'custom') {
      setThemeSettings(themeConfig.colors);
      setTypography(themeConfig.typography);
      setButtonStyles({ ...themeConfig.button, background: themeConfig.colors.primary, text: themeConfig.colors['primary-foreground'] });
    }
  }, [themeConfig, activeTheme]);

  useEffect(() => {
    const unsubscribeDesign = listenToDocument('settings', 'design', (data) => {
      if (data) {
        if (data.activeTheme === 'custom' || !data.activeTheme) {
          setThemeSettings(data.themeSettings || themeConfig.colors);
          setTypography(data.typography || themeConfig.typography);
          setButtonStyles(data.buttonStyles || { ...themeConfig.button, background: themeConfig.colors.primary, text: themeConfig.colors['primary-foreground'] });
        }
        setHeaderSettings(data.headerSettings || initialHeaderSettings);
        setAdvancedHeaderSettings(data.advancedHeaderSettings || defaultAdvancedHeaderSettings);
        setFooterSettings(data.footerSettings || initialFooterSettings);
        setAdvancedFooterSettings(data.advancedFooterSettings || defaultAdvancedFooterSettings);
        
        // Ensure all carousels exist and have selectedProductIds/items
        const loadedHomePageSettings = data.homePageSettings || initialHomePageSettings;
        const brandCarouselKeys = ['brandPromo', 'brandPromo2', 'brandPromo3', 'brandPromo4', 'brandPromo5', 'brandPromo6'];
        const catCarouselKeys = ['categoryCarousel1', 'categoryCarousel2', 'categoryCarousel3'];
        const imageLinkKeys = ['imageLinkCarousel1', 'imageLinkCarousel2', 'imageLinkCarousel3'];
        
        brandCarouselKeys.forEach(key => {
          if (!loadedHomePageSettings[key]) {
            loadedHomePageSettings[key] = initialHomePageSettings[key];
          } else if (!loadedHomePageSettings[key].selectedProductIds) {
            loadedHomePageSettings[key].selectedProductIds = [];
          }
        });

        catCarouselKeys.forEach(key => {
            if (!loadedHomePageSettings[key]) {
              loadedHomePageSettings[key] = initialHomePageSettings[key];
            }
        });
        
        imageLinkKeys.forEach(key => {
          if (!loadedHomePageSettings[key]) {
            loadedHomePageSettings[key] = initialHomePageSettings[key];
          } else if (!loadedHomePageSettings[key].items) {
            loadedHomePageSettings[key].items = [];
          }
        });

        // Add missing carousels to sectionsOrder if it's an old config
        if (loadedHomePageSettings.sectionsOrder) {
            [...brandCarouselKeys, ...catCarouselKeys, ...imageLinkKeys].forEach(key => {
            if (!loadedHomePageSettings.sectionsOrder.includes(key)) {
              loadedHomePageSettings.sectionsOrder.push(key);
            }
          });
        }

        setHomePageSettings(loadedHomePageSettings);
        
        setProductPageLayout(data.productPageLayout || initialProductPageLayout);
        setProductPageDesign(data.productPageDesign || initialProductPageDesign);
        setBundleSettings(data.bundleSettings || initialBundleSettings);
        setMobileLayoutSettings(data.mobileLayoutSettings || initialMobileLayoutSettings);
        setProductGridLayout(data.productGridLayout || initialProductGridLayoutSettings);
        
        setBoxLayoutSettings({
            ...initialBoxLayoutSettings,
            ...(data.boxLayoutSettings || {})
        });

        setProductListingSettings(data.productListingSettings || initialProductListingSettings);
        setProductListingLayout(data.productListingLayout || initialProductListingLayout);
        setImageCompressionSettings(data.imageCompressionSettings || initialImageCompressionSettings);
        setLoaderSettings(data.loaderSettings || initialLoaderSettings);
        setCustomCss(data.customCss || '');
        setCustomCssHistory(data.customCssHistory || []);
        setHeaderFooterCode(data.headerFooterCode || initialHeaderFooterCode);
      }
    });

    const unsubscribeGeneral = listenToDocument('settings', 'general', (data) => {
        if (data && data.storeName) {
            const storeName = data.storeName;
            const copyrightText = `© ${new Date().getFullYear()} ${storeName}. All Rights Reserved.`;
            setHeaderSettings(prev => ({ ...prev, logoText: storeName }));
            setFooterSettings(prev => ({ ...prev, logoText: storeName, copyrightText }));
          }
    });

    return () => { unsubscribeDesign(); unsubscribeGeneral(); };
  }, [themeConfig]);

  const saveDesignData = async (key, data) => {
     await setDocument('settings', 'design', { [key]: data });
  };
  
  const makeThemeCustom = async () => {
    await setDocument('settings', 'design', { activeTheme: 'custom' });
  };

  const saveThemeSettings = (settings) => { setThemeSettings(settings); saveDesignData('themeSettings', settings); makeThemeCustom(); };
  const saveTypography = (settings) => { setTypography(settings); saveDesignData('typography', settings); makeThemeCustom(); };
  const saveButtonStyles = (settings) => { setButtonStyles(settings); saveDesignData('buttonStyles', settings); makeThemeCustom(); };
  const saveHeaderSettings = (settings) => { setHeaderSettings(settings); saveDesignData('headerSettings', settings); };
  const saveAdvancedHeaderSettings = (settings) => { setAdvancedHeaderSettings(settings); saveDesignData('advancedHeaderSettings', settings); };
  const saveFooterSettings = (settings) => { setFooterSettings(settings); saveDesignData('footerSettings', settings); };
  const saveAdvancedFooterSettings = (settings) => { setAdvancedFooterSettings(settings); saveDesignData('advancedFooterSettings', settings); };
  const saveHomePageSettings = (settings) => { setHomePageSettings(settings); saveDesignData('homePageSettings', settings); };
  const saveProductPageLayout = (layout) => { setProductPageLayout(layout); saveDesignData('productPageLayout', layout); };
  const saveProductPageDesign = (design) => { setProductPageDesign(design); saveDesignData('productPageDesign', design); };
  const saveBundleSettings = (settings) => { setBundleSettings(settings); saveDesignData('bundleSettings', settings); };
  const resetProductPageLayout = () => { setProductPageLayout(initialProductPageLayout); saveDesignData('productPageLayout', initialProductPageLayout); return initialProductPageLayout; };
  const saveMobileLayoutSettings = (settings) => { setMobileLayoutSettings(settings); saveDesignData('mobileLayoutSettings', settings); };
  const saveProductGridLayout = (settings) => { setProductGridLayout(settings); saveDesignData('productGridLayout', settings); };
  const saveBoxLayoutSettings = (settings) => { setBoxLayoutSettings(settings); saveDesignData('boxLayoutSettings', settings); };
  const saveProductListingSettings = (settings) => { setProductListingSettings(settings); saveDesignData('productListingSettings', settings); };
  const saveProductListingLayout = (layout) => { setProductListingLayout(layout); saveDesignData('productListingLayout', layout); };
  const saveImageCompressionSettings = (settings) => { setImageCompressionSettings(settings); saveDesignData('imageCompressionSettings', settings); };
  const saveLoaderSettings = (settings) => { setLoaderSettings(settings); saveDesignData('loaderSettings', settings); };
  const saveCustomCss = (css) => {
    const newHistoryEntry = { css, timestamp: Date.now() };
    const newHistory = [newHistoryEntry, ...customCssHistory.filter(h => h.css !== css)].slice(0, 3);
    setCustomCss(css); setCustomCssHistory(newHistory); saveDesignData('customCss', css); saveDesignData('customCssHistory', newHistory);
    const styleElement = document.getElementById('custom-css-style');
    if (styleElement) styleElement.innerHTML = css;
  };
  const revertCustomCss = (timestamp) => { const versionToRevert = customCssHistory.find(v => v.timestamp === timestamp); if (versionToRevert) saveCustomCss(versionToRevert.css); };
  const saveHeaderFooterCode = (code) => { setHeaderFooterCode(code); saveDesignData('headerFooterCode', code); };

  const getPageLayoutSettings = useCallback((pageType) => {
    const pageSettings = boxLayoutSettings.perPageBoxLayout[pageType];
    if (!pageSettings) return { enabled: false };
    let widthValue = '100%';
    if (pageSettings.widthType === 'container') widthValue = 'var(--container-width, 1280px)';
    if (pageSettings.widthType === 'fixed') widthValue = `${pageSettings.widthValue}px`;
    return { ...pageSettings, widthValue: widthValue };
  }, [boxLayoutSettings]);

  const value = {
    themeSettings, typography, buttonStyles, headerSettings, advancedHeaderSettings, footerSettings, advancedFooterSettings, homePageSettings, productPageLayout, productPageDesign,
    bundleSettings, mobileLayoutSettings, productGridLayout, boxLayoutSettings, productListingSettings, productListingLayout, imageCompressionSettings, loaderSettings, customCss, customCssHistory, headerFooterCode,
    setThemeSettings: saveThemeSettings, setTypography: saveTypography, setButtonStyles: saveButtonStyles, saveHeaderSettings, saveAdvancedHeaderSettings, saveFooterSettings, saveAdvancedFooterSettings,
    saveHomePageSettings, saveProductPageLayout, saveProductPageDesign, saveBundleSettings, resetProductPageLayout, saveMobileLayoutSettings, saveProductGridLayout,
    saveBoxLayoutSettings, saveProductListingSettings, saveProductListingLayout, saveImageCompressionSettings, saveLoaderSettings, getPageLayoutSettings, saveCustomCss, revertCustomCss, saveHeaderFooterCode,
    initialHeaderSettings, defaultAdvancedHeaderSettings, initialFooterSettings, initialHomePageSettings, initialProductPageLayout, initialProductPageDesign, initialBundleSettings, initialMobileLayoutSettings,
    initialBoxLayoutSettings, initialProductListingSettings, initialProductListingLayout, initialImageCompressionSettings, initialLoaderSettings, initialHeaderFooterCode, defaultAdvancedFooterSettings
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
};
