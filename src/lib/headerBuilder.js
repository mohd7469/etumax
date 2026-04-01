
import { getDocument, setDocument } from '@/lib/firestoreService';

export const premiumHeaderPresets = {
  classic: {
    id: 'classic',
    name: 'Classic E-commerce',
    design: { bg: '#ffffff', text: '#1f2937', accent: '#3b82f6', border: '#e5e7eb', paddingY: '1rem', gap: '2rem' },
    topBar: { show: true, text: 'Free shipping on all orders over $50!', bg: '#1f2937', textColor: '#ffffff' },
    elements: ['logo', 'search', 'icons', 'nav'], // Classic often has Nav on a separate line or after, let's keep simple row
    logo: { type: 'text', text: 'MyStore', align: 'left' },
    search: { show: true, placeholder: 'Search products...', width: 'full' },
    nav: { align: 'center', links: [{ text: 'Home', url: '/' }, { text: 'Shop', url: '/products' }] },
    icons: { cart: true, wishlist: true, account: true, language: false }
  },
  marketplace: {
    id: 'marketplace',
    name: 'Marketplace Style',
    design: { bg: '#f8fafc', text: '#0f172a', accent: '#f97316', border: '#cbd5e1', paddingY: '1.5rem', gap: '1.5rem' },
    topBar: { show: false, text: '', bg: '#000', textColor: '#fff' },
    elements: ['logo', 'nav', 'search', 'icons'],
    logo: { type: 'text', text: 'MarketGrid', align: 'left' },
    search: { show: true, placeholder: 'Find anything...', width: 'full' },
    nav: { align: 'left', links: [{ text: 'Categories', url: '/products' }, { text: 'Deals', url: '#' }] },
    icons: { cart: true, wishlist: true, account: true, language: true }
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Premium',
    design: { bg: '#ffffff', text: '#000000', accent: '#000000', border: 'transparent', paddingY: '2rem', gap: '3rem' },
    topBar: { show: false, text: '', bg: '#000', textColor: '#fff' },
    elements: ['logo', 'nav', 'icons'],
    logo: { type: 'text', text: 'VOGUE', align: 'left' },
    search: { show: false, placeholder: '', width: 'auto' },
    nav: { align: 'center', links: [{ text: 'Collection', url: '/products' }, { text: 'Lookbook', url: '#' }, { text: 'About', url: '#' }] },
    icons: { cart: true, wishlist: false, account: true, language: false }
  },
  centered: {
    id: 'centered',
    name: 'Centered Logo',
    design: { bg: '#ffffff', text: '#333333', accent: '#d946ef', border: '#f3f4f6', paddingY: '1.5rem', gap: '2rem' },
    topBar: { show: true, text: 'Welcome to our premium store', bg: '#fdf4ff', textColor: '#d946ef' },
    elements: ['nav', 'logo', 'icons'],
    logo: { type: 'text', text: 'LUXE', align: 'center' },
    search: { show: false, placeholder: '', width: 'auto' },
    nav: { align: 'left', links: [{ text: 'Men', url: '#' }, { text: 'Women', url: '#' }] },
    icons: { cart: true, wishlist: true, account: true, language: false }
  },
  sales: {
    id: 'sales',
    name: 'Sales-Focused',
    design: { bg: '#ef4444', text: '#ffffff', accent: '#ffffff', border: '#dc2626', paddingY: '1rem', gap: '1rem' },
    topBar: { show: true, text: 'FLASH SALE: 50% OFF EVERYTHING', bg: '#000000', textColor: '#ffffff' },
    elements: ['logo', 'search', 'icons'],
    logo: { type: 'text', text: 'DEALZ', align: 'left' },
    search: { show: true, placeholder: 'Search deals...', width: 'full' },
    nav: { align: 'left', links: [] },
    icons: { cart: true, wishlist: false, account: true, language: false }
  }
};

export const defaultAdvancedHeaderSettings = {
  enabled: false,
  preset: 'classic',
  ...premiumHeaderPresets.classic
};

export const applyHeaderStyles = (design) => {
  if (!design) return {};
  return {
    '--header-bg': design.bg,
    '--header-text': design.text,
    '--header-accent': design.accent,
    '--header-border': design.border,
    '--header-padding-y': design.paddingY,
    '--header-gap': design.gap,
  };
};

export const getHeaderStyleConfig = (styleName) => {
  return premiumHeaderPresets[styleName] || premiumHeaderPresets.classic;
};

export const loadHeaderSettings = async () => {
  try {
    const data = await getDocument('settings', 'advancedHeaderSettings');
    if (data) {
      const { id, ...settings } = data;
      return Object.keys(settings).length > 0 ? settings : defaultAdvancedHeaderSettings;
    }
    return defaultAdvancedHeaderSettings;
  } catch (error) {
    console.error("Error loading header settings:", error);
    return defaultAdvancedHeaderSettings;
  }
};

export const saveHeaderSettings = async (settings) => {
  try {
    await setDocument('settings', 'advancedHeaderSettings', settings);
    return true;
  } catch (error) {
    console.error("Error saving header settings:", error);
    return false;
  }
};

export const generateHeaderHTML = (settings) => {
  return `<!-- Header generated from builder -->
    <header style="background:${settings.design.bg}; color:${settings.design.text}; border-bottom: 1px solid ${settings.design.border};">
      <!-- ... omitted for brevity as React will render it ... -->
    </header>
  `;
};
