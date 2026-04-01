
import React, { createContext, useState, useEffect, useContext } from 'react';
import { listenToDocument, setDocument } from '@/lib/firestoreService';

const MobileLayoutContext = createContext();

export const useMobileLayout = () => {
  const context = useContext(MobileLayoutContext);
  if (!context) {
    throw new Error('useMobileLayout must be used within a MobileLayoutProvider');
  }
  return context;
};

const defaultSettings = {
  topStrip: { enabled: true, height: 30, backgroundColor: "#8B5CF6", textColor: "#ffffff", padding: { top: 5, bottom: 5 }, content: "Free shipping on orders over $50!" },
  header: { 
    enabled: true, 
    showLogo: true, 
    logoUrl: "",
    showPageTitle: false, 
    showBackButton: true, 
    showMenuIcon: true,
    showSearchIcon: true,
    showCartIcon: true,
    showLanguageIcon: true,
    height: 60, 
    padding: { left: 16, right: 16, top: 8, bottom: 8 }, 
    alignment: "space-between" 
  },
  shopBar: { enabled: true, showCategoryBar: true, showSearchBar: true, position: "below-header", spacing: 8, padding: { left: 12, right: 12, top: 8, bottom: 8 } },
  bottomNav: { enabled: true, position: "bottom", maxIcons: 5, items: [
    { key: "store", enabled: true, label: "Store", showLabel: true, order: 1, link: "/" },
    { key: "search", enabled: true, label: "Search", showLabel: true, order: 2, link: "/search" },
    { key: "wishlist", enabled: true, label: "Wishlist", showLabel: true, order: 3, link: "/wishlist" },
    { key: "cart", enabled: true, label: "Cart", showLabel: true, order: 4, link: "/cart", badge: { enabled: true, type: "count", color: "#ef4444" } },
    { key: "account", enabled: true, label: "Account", showLabel: true, order: 5, link: "/account" },
    { key: "categories", enabled: false, label: "Categories", showLabel: true, order: 6, link: "/categories" },
    { key: "products", enabled: false, label: "Products", showLabel: true, order: 7, link: "/products" },
    { key: "tracking", enabled: false, label: "Tracking", showLabel: true, order: 8, link: "/order-tracking" }
  ]},
  pagePadding: { horizontal: 12, vertical: 12 },
  sectionSpacing: 16
};

export const MobileLayoutProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToDocument('settings', 'mobileLayout', (data) => {
      if (data) {
        let migratedData = { ...data };
        
        // Migration: Handle old showActions property and new logoUrl/showMenuIcon
        let updatedHeader = { ...migratedData.header };
        if (updatedHeader && updatedHeader.showActions !== undefined) {
          if (updatedHeader.showSearchIcon === undefined) updatedHeader.showSearchIcon = updatedHeader.showActions;
          if (updatedHeader.showCartIcon === undefined) updatedHeader.showCartIcon = updatedHeader.showActions;
          if (updatedHeader.showLanguageIcon === undefined) updatedHeader.showLanguageIcon = updatedHeader.showActions;
          delete updatedHeader.showActions;
        }
        if (updatedHeader && updatedHeader.logoUrl === undefined) {
          updatedHeader.logoUrl = "";
        }
        if (updatedHeader && updatedHeader.showMenuIcon === undefined) {
          updatedHeader.showMenuIcon = true;
        }
        
        // Migration: Handle spacing to pagePadding & sectionSpacing
        if (migratedData.spacing) {
          if (!migratedData.pagePadding) {
            migratedData.pagePadding = {
              horizontal: migratedData.spacing.padding?.left || 12,
              vertical: migratedData.spacing.padding?.top || 12
            };
          }
          if (migratedData.sectionSpacing === undefined) {
            migratedData.sectionSpacing = migratedData.spacing.sectionGap || 16;
          }
        }

        // Migration: Ensure all bottom nav items exist and have links
        if (migratedData.bottomNav && migratedData.bottomNav.items) {
          const currentItems = migratedData.bottomNav.items;
          const newItems = [...currentItems];
          
          // Ensure products & tracking exist
          if (!newItems.some(i => i.key === 'products')) {
            newItems.push({ key: "products", enabled: false, label: "Products", showLabel: true, order: newItems.length + 1, link: "/products" });
          }
          if (!newItems.some(i => i.key === 'tracking')) {
            newItems.push({ key: "tracking", enabled: false, label: "Tracking", showLabel: true, order: newItems.length + 2, link: "/order-tracking" });
          }

          // Ensure every item has a fallback link
          migratedData.bottomNav.items = newItems.map(item => {
            if (!item.link) {
              const defaultItem = defaultSettings.bottomNav.items.find(d => d.key === item.key);
              return { ...item, link: defaultItem ? defaultItem.link : `/${item.key}` };
            }
            return item;
          });
        }

        setSettings({ 
          ...defaultSettings, 
          ...migratedData,
          header: { ...defaultSettings.header, ...updatedHeader },
          pagePadding: { ...defaultSettings.pagePadding, ...migratedData.pagePadding }
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveSettings = async (newSettings) => {
    try {
      await setDocument('settings', 'mobileLayout', newSettings);
    } catch (error) {
      console.error('Failed to save mobile layout settings:', error);
    }
  };

  const updateTopLevel = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateSection = (section, key, value) => {
    const newSettings = {
      ...settings,
      [section]: { ...settings[section], [key]: value }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateNested = (section, parentKey, key, value) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [parentKey]: { ...settings[section][parentKey], [key]: value }
      }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateBottomNavItem = (key, updates) => {
    const newSettings = {
      ...settings,
      bottomNav: {
        ...settings.bottomNav,
        items: settings.bottomNav.items.map(item => item.key === key ? { ...item, ...updates } : item)
      }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const reorderBottomNavItems = (newItems) => {
    const newSettings = {
      ...settings,
      bottomNav: {
        ...settings.bottomNav,
        items: newItems
      }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <MobileLayoutContext.Provider value={{
      settings,
      loading,
      updateTopLevel,
      updateSection,
      updateNested,
      updateBottomNavItem,
      reorderBottomNavItems
    }}>
      {children}
    </MobileLayoutContext.Provider>
  );
};
