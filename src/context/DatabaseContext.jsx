import React, { createContext, useContext } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useMedia } from '@/context/MediaContext';
import { useReviews } from '@/context/ReviewContext';
import { useUser } from '@/context/UserContext';
import { useDesign } from '@/context/DesignContext';
import { useCheckout } from '@/context/CheckoutContext';
import { useIntegrations } from '@/context/IntegrationContext';
import { useWhatsApp } from '@/context/WhatsAppContext';
import { useAccess } from '@/context/AccessContext';
import { toast } from '@/components/ui/use-toast';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const productsContext = useProducts();
  const mediaContext = useMedia();
  const reviewsContext = useReviews();
  const userContext = useUser();
  const designContext = useDesign();
  const checkoutContext = useCheckout();
  const integrationsContext = useIntegrations();
  const whatsAppContext = useWhatsApp();
  const accessContext = useAccess();

  const getWebsiteData = () => {
    // NOTE: For security reasons, sensitive data like user passwords are not included.
    const localPages = JSON.parse(localStorage.getItem('ShopHub_local_pages') || '[]');

    return {
      products: productsContext.products || [],
      categories: productsContext.categories || [],
      brands: productsContext.brands || [],
      mediaItems: mediaContext.mediaItems || [],
      reviews: reviewsContext.reviews || [],
      orders: userContext.orders || [],
      customers: (userContext.customers || []).map(({ password, ...c }) => c), // Omit passwords
      pages: [...localPages, ...(integrationsContext.syncedPages || [])],
      design: {
        headerSettings: designContext.headerSettings,
        footerSettings: designContext.footerSettings,
        homePageSettings: designContext.homePageSettings,
        productPageLayout: designContext.productPageLayout,
        mobileLayoutSettings: designContext.mobileLayoutSettings,
        customCss: designContext.customCss,
        themeSettings: designContext.themeSettings,
      },
      checkout: checkoutContext.settings,
      integrations: {
        stores: (integrationsContext.stores || []).map(({ consumerKey, consumerSecret, ...s }) => s), // Omit secrets
        syncedProducts: integrationsContext.syncedProducts || [],
        syncedOrders: integrationsContext.syncedOrders || [],
        syncedPages: integrationsContext.syncedPages || [],
        useCorsProxy: integrationsContext.useCorsProxy,
        manualWhitelist: integrationsContext.manualWhitelist,
      },
      whatsApp: whatsAppContext.settings,
      access: {
        users: (accessContext.users || []).map(({ password, ...u }) => u), // Omit passwords
        roles: accessContext.roles || [],
      },
      generalSettings: JSON.parse(localStorage.getItem('ShopHub_settings') || '{}'),
    };
  };

  const exportData = () => {
    try {
      const data = getWebsiteData();
      const dataString = `window.websiteData = ${JSON.stringify(data, null, 2)};`;

      const blob = new Blob([dataString], { type: 'application/javascript' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'websiteData.js';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Export Successful!", description: "Your website data has been downloaded as websiteData.js." });
    } catch (error) {
      console.error("Export failed:", error);
      toast({ variant: "destructive", title: "Export Failed", description: "There was an error while exporting your data." });
    }
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // This is a simplified and potentially unsafe way to parse the data.
        // A production environment would need a much more robust and secure parser.
        const fileContent = e.target.result;
        // Extract the JSON part from the JS file
        const jsonString = fileContent.substring(fileContent.indexOf('{'), fileContent.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);

        // Call setters from each context
        productsContext.setProducts(data.products || []);
        productsContext.setCategories(data.categories || []);
        productsContext.setBrands(data.brands || []);
        mediaContext.setMediaItems(data.mediaItems || []);
        reviewsContext.setReviews(data.reviews || []);
        userContext.setOrders(data.orders || []);
        userContext.setCustomers(data.customers || []);

        const localPages = (data.pages || []).filter(p => !p.sourceStoreId);
        localStorage.setItem('ShopHub_local_pages', JSON.stringify(localPages));

        if (data.design) {
          designContext.setHeaderSettings(data.design.headerSettings || {});
          designContext.setFooterSettings(data.design.footerSettings || {});
          designContext.setHomePageSettings(data.design.homePageSettings || {});
          designContext.setProductPageLayout(data.design.productPageLayout || []);
          designContext.setMobileLayoutSettings(data.design.mobileLayoutSettings || {});
          designContext.setCustomCss(data.design.customCss || '');
          designContext.setThemeSettings(data.design.themeSettings || {});
        }

        checkoutContext.setSettings(data.checkout || {});

        if (data.integrations) {
          integrationsContext.setStores(data.integrations.stores || []);
          integrationsContext.setSyncedProducts(data.integrations.syncedProducts || []);
          integrationsContext.setSyncedOrders(data.integrations.syncedOrders || []);
          integrationsContext.setSyncedPages(data.integrations.syncedPages || []);
        }

        whatsAppContext.setSettings(data.whatsApp || {});

        if (data.access) {
          accessContext.setUsers(data.access.users || []);
          accessContext.setRoles(data.access.roles || []);
        }

        localStorage.setItem('ShopHub_settings', JSON.stringify(data.generalSettings || {}));
        window.dispatchEvent(new Event('settings_updated'));


        toast({ title: "Import Successful!", description: "Your website data has been loaded." });
        // Force a reload to ensure all components re-render with new context data
        window.location.reload();

      } catch (error) {
        console.error("Import failed:", error);
        toast({ variant: "destructive", title: "Import Failed", description: "The file format is invalid or corrupted." });
      }
    };
    reader.readAsText(file);
  };

  const value = {
    getWebsiteData,
    exportData,
    importData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};