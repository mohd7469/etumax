import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams, Navigate, matchPath } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import ProductListingPage from '@/pages/ProductListingPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AccountPage from '@/pages/AccountPage';
import WishlistPage from '@/pages/WishlistPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import SitemapPage from '@/pages/SitemapPage';
import CategoriesPage from '@/pages/CategoriesPage';
import ContactPage from '@/pages/ContactPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsConditionsPage from '@/pages/TermsConditionsPage';
import RefundPolicyPage from '@/pages/RefundPolicyPage';
import ShippingPolicyPage from '@/pages/ShippingPolicyPage';
import PaymentPolicyPage from '@/pages/PaymentPolicyPage';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminIntegrations from '@/pages/admin/AdminIntegrations';
import AdminWhatsApp from '@/pages/admin/AdminWhatsApp';
import AdminPages from '@/pages/admin/AdminPages';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminCheckout from '@/pages/admin/AdminCheckout';
import AdminHomeSettings from '@/pages/admin/AdminHomeSettings';
import AdminHeaderFooter from '@/pages/admin/AdminHeaderFooter';
import AdminProductPageLayout from '@/pages/admin/AdminProductPageLayout';
import AdminLayoutScreen from '@/pages/admin/AdminLayoutScreen';
import AdminMobileLayout from '@/pages/admin/AdminMobileLayout';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminCustomCss from '@/pages/admin/AdminCustomCss';
import AdminAccessManager from '@/pages/admin/AdminAccessManager';
import AdminMedia from '@/pages/admin/AdminMedia';
import AdminTheme from '@/pages/admin/AdminTheme';
import AdminDatabase from '@/pages/admin/AdminDatabase';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminSeo from '@/pages/admin/AdminSeo';
import AdminProductFeed from '@/pages/admin/AdminProductFeed';
import AdminProductListing from '@/pages/admin/AdminProductListing';
import AdminContactForms from '@/pages/admin/AdminContactForms';
import AdminContactSettings from '@/pages/admin/AdminContactSettings';
import AdminPuzzlePopup from '@/pages/admin/AdminPuzzlePopup';
import OrderTrackingPage from '@/pages/OrderTrackingPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import { CartProvider, useCart } from '@/context/CartContext';
import { UserProvider, useUser } from '@/context/UserContext';
import { IntegrationProvider, useIntegrations } from '@/context/IntegrationContext';
import { WhatsAppProvider } from '@/context/WhatsAppContext';
import { ProductProvider, useProducts } from '@/context/ProductContext';
import { DesignProvider, useDesign } from '@/context/DesignContext';
import { CheckoutProvider } from '@/context/CheckoutContext';
import { ReviewProvider } from '@/context/ReviewContext';
import { AccessProvider } from '@/context/AccessContext';
import { MediaProvider } from '@/context/MediaContext';
import { DatabaseProvider } from '@/context/DatabaseContext';
import { CouponProvider } from '@/context/CouponContext';
import { SeoProvider, useSeo } from '@/context/SeoContext';
import { ProductFeedProvider } from '@/context/ProductFeedContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AppInitProvider, useAppInit } from '@/context/AppInitContext';
import { WooCommerceProvider } from '@/context/WooCommerceContext';
import { MobileLayoutProvider } from '@/context/MobileLayoutContext';
import { PuzzlePopupProvider } from '@/context/PuzzlePopupContext';
import PuzzlePopupWrapper from '@/components/puzzle/PuzzlePopupWrapper';
import MobileLayoutWrapper from '@/components/layout/MobileLayoutWrapper';
import WhatsAppButton from '@/components/WhatsAppButton';
import DynamicPage from '@/pages/DynamicPage';
import SideCart from '@/components/cart/SideCart';
import CartNotificationPopup from '@/components/cart/CartNotificationPopup';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ScrollToTop from '@/components/ScrollToTop';
import WebsiteLoader from '@/components/layout/WebsiteLoader';
import { cn } from '@/lib/utils';
import MetaInjector from '@/components/seo/MetaInjector';
import SitemapRenderer from '@/components/seo/SitemapRenderer';
import ProductSitemapRenderer from '@/components/seo/ProductSitemapRenderer';
import { ProductSitemapXml, CategorySitemapXml } from '@/components/seo/RawXmlSitemaps';
import OpenGraphMeta from '@/components/seo/OpenGraphMeta';
import { injectHeaderCode, injectFooterCode, injectCustomCSS } from '@/lib/codeInjection';
import { initializeFirestoreCollections } from '@/lib/firestoreInit';
import { initializeGoogleTranslate } from '@/lib/GoogleTranslateManager';
import SitemapProductsXml from '@/components/seo/SitemapProductsXml';

const LayoutWrapper = ({ children, pageType }) => {
  const { boxLayoutSettings, getPageLayoutSettings } = useDesign();
  const layoutSettings = getPageLayoutSettings(pageType);

  if (!boxLayoutSettings.globalBoxLayoutEnabled || !layoutSettings.enabled) {
    return <>{children}</>;
  }

  const wrapperStyle = {
    '--layout-width': layoutSettings.widthValue,
    '--layout-padding': `${layoutSettings.padding}rem`,
    '--layout-gap': `${layoutSettings.gap}rem`,
    '--layout-radius': `${layoutSettings.radius}rem`,
    '--layout-shadow': `var(--shadow-${layoutSettings.shadow})`,
    '--layout-bg': layoutSettings.bg,
    '--layout-border-color': layoutSettings.borderColor,
    '--layout-border-width': `${layoutSettings.borderWidth}px`,
  };

  return (
    <div style={wrapperStyle} className={cn('layout-box', `layout-box--${pageType}`)}>
      {children}
    </div>
  );
};

const ProductDetailWrapper = ({ navigateTo }) => {
  const { slug } = useParams();
  const { getProductBySlug } = useProducts();
  const product = getProductBySlug(decodeURIComponent(slug));

  return (
    <LayoutWrapper pageType="detail">
      <ProductDetailPage product={product || null} navigateTo={navigateTo} />
    </LayoutWrapper>
  );
};

const ProductListingWrapper = ({ navigateTo }) => (
  <LayoutWrapper pageType="listing">
    <ProductListingPage navigateTo={navigateTo} />
  </LayoutWrapper>
);

const SearchResultsWrapper = ({ navigateTo }) => (
  <SearchResultsPage
    query={new URLSearchParams(useLocation().search).get('query')}
    navigateTo={navigateTo}
  />
);

const DynamicPageWrapper = () => {
  const { slug } = useParams();
  const { syncedPages } = useIntegrations();
  const page = syncedPages.find((p) => p.slug === decodeURIComponent(slug) && p.showOnStore);

  return page ? <DynamicPage page={page} /> : <div className="text-center p-20">Page not found!</div>;
};

const CustomCssInjector = () => {
  const { customCss } = useDesign();

  useEffect(() => {
    const cleanup = injectCustomCSS(customCss);
    return () => cleanup();
  }, [customCss]);

  return null;
};

const CustomCodeInjector = () => {
  const { headerFooterCode } = useDesign();

  useEffect(() => {
    if (headerFooterCode?.header) injectHeaderCode(headerFooterCode.header);
    if (headerFooterCode?.footer) injectFooterCode(headerFooterCode.footer);
  }, [headerFooterCode]);

  return null;
};

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user || !user.isAdmin) {
    return <Navigate to="/account" state={{ from: location }} replace />;
  }

  return children;
};

const GlobalCartNotification = ({ navigateTo }) => {
  const { cartItems, notificationTrigger } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notificationTrigger > 0) setIsVisible(true);
  }, [notificationTrigger]);

  return (
    <CartNotificationPopup
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
      cartItems={cartItems}
      onNavigateToCart={() => {
        setIsVisible(false);
        navigateTo('cart');
      }}
    />
  );
};

const AppInitializer = ({ children }) => {
  const { isInitialized } = useAppInit();

  useEffect(() => {
    initializeFirestoreCollections();
  }, []);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getProductBySlug } = useProducts();
  const { generalSettings } = useSeo();
  const { storeSettings } = useAppInit();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isXmlRoute = location.pathname.endsWith('.xml');
  const [notificationSettings] = useState({
    position: 'bottom-right',
    enabled: true,
  });

  useEffect(() => {
    // Initialize Google Translate plugin
    initializeGoogleTranslate();
  }, []);

  const navigateTo = (page, data = {}) => {
    let path = '/';

    if (page.startsWith('/')) {
      path = page;
    } else {
      switch (page) {
        case 'home':
          path = '/';
          break;
        case 'products':
          path = data.category ? `/products/${encodeURIComponent(data.category)}` : '/products';
          break;
        case 'product-detail':
          path = `/product/${encodeURIComponent(data.product.slug || data.product.id)}`;
          break;
        case 'cart':
          path = '/cart';
          break;
        case 'checkout':
          path = '/checkout';
          break;
        case 'account':
          path = '/account';
          break;
        case 'wishlist':
          path = '/wishlist';
          break;
        case 'search':
          path = `/search?query=${encodeURIComponent(data.query)}`;
          break;
        case 'track-order':
          path = '/track-order';
          break;
        case 'order-confirmation':
          path = `/order-confirmation/${data.orderId}`;
          break;
        case 'categories':
          path = '/categories';
          break;
        case 'contact':
          path = '/contact';
          break;
        default:
          path = '/';
      }
    }

    navigate(path);
  };

  const stripHtmlText = (value = '') =>
    String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const productRouteMatch = matchPath('/product/:slug', location.pathname);

  const currentProduct = productRouteMatch?.params?.slug
    ? getProductBySlug(decodeURIComponent(productRouteMatch.params.slug))
    : null;

  const productTitle =
    currentProduct?.seoTitle ||
    currentProduct?.metaTitle ||
    currentProduct?.name ||
    currentProduct?.title ||
    '';

  const defaultTitle =
    storeSettings?.storeName ||
    generalSettings?.title ||
    '';

  const defaultDescription =
    generalSettings?.metaDescription ||
    '';

  const finalTitle = productRouteMatch ? productTitle : defaultTitle;

  const finalDescription = productRouteMatch
    ? stripHtmlText(
        currentProduct?.metaDescription ||
        currentProduct?.shortDescription ||
        currentProduct?.short_description ||
        currentProduct?.description ||
        ''
      )
    : stripHtmlText(defaultDescription);

  const ogType = productRouteMatch ? 'product' : 'website';

  return (
    <>
      {!isXmlRoute && <WebsiteLoader />}
      {!isXmlRoute && <ScrollToTop />}
      <MetaInjector />
      <CustomCssInjector />
      <CustomCodeInjector />

      {!isXmlRoute && (
        <>
          <Helmet prioritizeSeoTags>
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
          </Helmet>

          <OpenGraphMeta
            title={finalTitle}
            description={finalDescription}
            type={ogType}
            siteName={defaultTitle}
          />
        </>
      )}

      {!isXmlRoute && <GlobalCartNotification navigateTo={navigateTo} />}
      {!isXmlRoute && <SideCart navigateTo={navigateTo} />}

      {isAdminRoute && user?.isAdmin ? (
        <Routes>
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/products" element={<AdminProducts navigateTo={navigateTo} />} />
                    <Route path="/reviews" element={<AdminReviews />} />
                    <Route path="/contact-forms" element={<AdminContactForms />} />
                    <Route path="/orders" element={<AdminOrders />} />
                    <Route path="/customers" element={<AdminCustomers />} />
                    <Route path="/analytics" element={<AdminAnalytics />} />
                    <Route path="/integrations" element={<AdminIntegrations />} />
                    <Route path="/whatsapp" element={<AdminWhatsApp />} />
                    <Route path="/settings" element={<AdminSettings />} />
                    <Route path="/pages" element={<AdminPages />} />
                    <Route path="/categories" element={<AdminCategories />} />
                    <Route path="/coupons" element={<AdminCoupons />} />
                    <Route path="/checkout" element={<AdminCheckout />} />
                    <Route path="/database" element={<AdminDatabase />} />
                    <Route path="/access-manager" element={<AdminAccessManager />} />
                    <Route path="/media" element={<AdminMedia />} />
                    <Route path="/seo" element={<AdminSeo />} />
                    <Route path="/product-feed" element={<AdminProductFeed />} />
                    <Route path="/puzzle-popup" element={<AdminPuzzlePopup />} />
                    <Route path="/design/theme" element={<AdminTheme />} />
                    <Route path="/design/header-footer" element={<AdminHeaderFooter />} />
                    <Route path="/design/home-page" element={<AdminHomeSettings />} />
                    <Route path="/design/product-page" element={<AdminProductPageLayout />} />
                    <Route path="/design/product-listing" element={<AdminProductListing />} />
                    <Route path="/design/contact-settings" element={<AdminContactSettings />} />
                    <Route path="/design/layout-screen" element={<AdminLayoutScreen />} />
                    <Route path="/design/mobile-layout" element={<AdminMobileLayout />} />
                    <Route path="/design/custom-css" element={<AdminCustomCss />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      ) : (
        <PuzzlePopupWrapper>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            {!isXmlRoute && (
              <div className="hidden lg:block w-full">
                <Header navigateTo={navigateTo} />
              </div>
            )}
            <MobileLayoutWrapper>
              <Routes>
                <Route
                  path="/"
                  element={
                    <LayoutWrapper pageType="home">
                      <HomePage navigateTo={navigateTo} />
                    </LayoutWrapper>
                  }
                />
                <Route path="/products" element={<ProductListingWrapper navigateTo={navigateTo} />} />
                <Route path="/products/:category" element={<ProductListingWrapper navigateTo={navigateTo} />} />
                <Route path="/categories" element={<LayoutWrapper pageType="listing"><CategoriesPage navigateTo={navigateTo} /></LayoutWrapper>} />
                <Route path="/product/:slug" element={<ProductDetailWrapper navigateTo={navigateTo} />} />
                <Route path="/cart" element={<CartPage navigateTo={navigateTo} />} />
                <Route path="/checkout" element={<CheckoutPage navigateTo={navigateTo} />} />
                <Route path="/account" element={<AccountPage navigateTo={navigateTo} />} />
                <Route path="/wishlist" element={<WishlistPage navigateTo={navigateTo} />} />
                <Route path="/search" element={<SearchResultsWrapper navigateTo={navigateTo} />} />
                <Route path="/track-order" element={<OrderTrackingPage />} />
                <Route path="/order-confirmation/:orderId?" element={<OrderConfirmationPage navigateTo={navigateTo} />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Policy Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-conditions" element={<TermsConditionsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/payment-policy" element={<PaymentPolicyPage />} />

                <Route path="/sitemap.xml" element={<SitemapPage />} />
                <Route path="/sitemap_products.xml" element={<SitemapProductsXml />} />
                <Route path="/sitemaps/products.xml" element={<ProductSitemapXml />} />
                <Route path="/sitemaps/categories.xml" element={<CategorySitemapXml />} />
                <Route path="/sitemaps/products-view" element={<ProductSitemapRenderer />} />
                <Route path="/sitemaps/categories-view" element={<SitemapRenderer type="category" />} />
                <Route path="/page-sitemap.xml" element={<SitemapRenderer type="page" />} />

                <Route path="/page/:slug" element={<DynamicPageWrapper />} />
                <Route path="/admin/*" element={<Navigate to="/account" replace />} />
              </Routes>
            </MobileLayoutWrapper>
            {!isXmlRoute && (
              <>
                <Footer navigateTo={navigateTo} />
                <WhatsAppButton />
                <MobileBottomNav navigateTo={navigateTo} />
              </>
            )}
          </div>
        </PuzzlePopupWrapper>
      )}

      {notificationSettings.enabled && !isXmlRoute && <Toaster position={notificationSettings.position} />}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <LoadingProvider>
          <LanguageProvider>
            <WooCommerceProvider>
              <UserProvider>
                <AccessProvider>
                  <MediaProvider>
                    <ReviewProvider>
                      <ProductProvider>
                        <IntegrationProvider>
                          <CouponProvider>
                            <CartProvider>
                              <WhatsAppProvider>
                                <ThemeProvider>
                                  <DesignProvider>
                                    <MobileLayoutProvider>
                                      <CheckoutProvider>
                                        <SeoProvider>
                                          <ProductFeedProvider>
                                            <DatabaseProvider>
                                              <AppInitProvider>
                                                <PuzzlePopupProvider>
                                                  <AppInitializer>
                                                    <AppContent />
                                                  </AppInitializer>
                                                </PuzzlePopupProvider>
                                              </AppInitProvider>
                                            </DatabaseProvider>
                                          </ProductFeedProvider>
                                        </SeoProvider>
                                      </CheckoutProvider>
                                    </MobileLayoutProvider>
                                  </DesignProvider>
                                </ThemeProvider>
                              </WhatsAppProvider>
                            </CartProvider>
                          </CouponProvider>
                        </IntegrationProvider>
                      </ProductProvider>
                    </ReviewProvider>
                  </MediaProvider>
                </AccessProvider>
              </UserProvider>
            </WooCommerceProvider>
          </LanguageProvider>
        </LoadingProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;