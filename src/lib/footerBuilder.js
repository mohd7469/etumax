
import { getDocument, setDocument } from '@/lib/firestoreService';

export const premiumPresets = {
  google: {
    id: 'google',
    name: 'Google-Inspired',
    design: { bg: '#1a2332', text: '#e8eaed', link: '#8ab4f8', hover: '#c6dafc', accent: '#4285f4', borderColor: 'rgba(255,255,255,0.1)', paddingY: '4rem', gap: '2rem', fontFamily: 'Roboto, sans-serif' },
    sections: [
      { id: 's1', type: 'search', title: 'Find what you need', placeholder: 'Search site...', buttonText: 'Search', colSpan: 4, fullWidth: true },
      { id: 's2', type: 'links', title: 'Products', links: [{ text: 'Cloud', url: '#' }, { text: 'Workspace', url: '#' }], colSpan: 1 },
      { id: 's3', type: 'links', title: 'Services', links: [{ text: 'Consulting', url: '#' }, { text: 'Support', url: '#' }], colSpan: 1 },
      { id: 's4', type: 'links', title: 'Help', links: [{ text: 'Documentation', url: '#' }, { text: 'Community', url: '#' }], colSpan: 1 },
      { id: 's5', type: 'contact', title: 'Contact', email: 'hello@example.com', colSpan: 1 }
    ]
  },
  astra: {
    id: 'astra',
    name: 'Astra Security',
    design: { bg: '#0b1121', text: '#ffffff', link: '#94a3b8', hover: '#38bdf8', accent: '#0ea5e9', borderColor: '#1e293b', paddingY: '5rem', gap: '3rem', fontFamily: 'inherit' },
    sections: [
      { id: 's1', type: 'about', title: 'SecurityFirst', content: 'Making the internet a safer place for businesses worldwide.', colSpan: 1 },
      { id: 's2', type: 'links', title: 'Platform', links: [{ text: 'Features', url: '#' }, { text: 'Pricing', url: '#' }], colSpan: 1 },
      { id: 's3', type: 'links', title: 'Resources', links: [{ text: 'Blog', url: '#' }, { text: 'Guides', url: '#' }], colSpan: 1 },
      { id: 's4', type: 'badges', title: 'Trusted By', badges: [{ text: 'G2 High Performer' }, { text: 'Capterra Top 20' }], colSpan: 1 }
    ]
  },
  wok: {
    id: 'wok',
    name: 'Wok Culture',
    design: { bg: '#222222', text: '#f4f4f5', link: '#d4d4d8', hover: '#ef4444', accent: '#ef4444', borderColor: '#3f3f46', paddingY: '4rem', gap: '2rem', fontFamily: 'serif' },
    sections: [
      { id: 's1', type: 'about', title: 'Wok Culture', content: 'Authentic flavors delivered to your door.', colSpan: 1 },
      { id: 's2', type: 'store', title: 'Our Location', content: 'Downtown Branch', hours: 'Mon-Sun: 11am - 10pm', colSpan: 1 },
      { id: 's3', type: 'contact', title: 'Order Now', phone: '555-0192', colSpan: 1 },
      { id: 's4', type: 'payments', title: 'We Accept', icons: { visa: true, mastercard: true, applepay: true }, colSpan: 1 }
    ]
  },
  circle: {
    id: 'circle',
    name: 'Circle Location',
    design: { bg: '#f8fafc', text: '#334155', link: '#64748b', hover: '#f97316', accent: '#f97316', borderColor: '#e2e8f0', paddingY: '4rem', gap: '2rem', fontFamily: 'inherit' },
    sections: [
      { id: 's1', type: 'map', title: 'Find Us Here', height: 250, colSpan: 2 },
      { id: 's2', type: 'links', title: 'Explore', links: [{ text: 'Collections', url: '#' }, { text: 'New Arrivals', url: '#' }], colSpan: 1 },
      { id: 's3', type: 'contact', title: 'Get in Touch', address: '100 Circle Way', email: 'hello@circle.com', colSpan: 1 }
    ]
  },
  arshakir: {
    id: 'arshakir',
    name: 'AR Shakir',
    design: { bg: '#ffffff', text: '#18181b', link: '#71717a', hover: '#000000', accent: '#18181b', borderColor: '#f4f4f5', paddingY: '6rem', gap: '3rem', fontFamily: 'inherit' },
    sections: [
      { id: 's1', type: 'about', title: 'Studio.', content: 'A digital product design agency creating exceptional experiences.', colSpan: 2 },
      { id: 's2', type: 'links', title: 'Work', links: [{ text: 'Portfolio', url: '#' }, { text: 'Case Studies', url: '#' }], colSpan: 1 },
      { id: 's3', type: 'links', title: 'Company', links: [{ text: 'About', url: '#' }, { text: 'Careers', url: '#' }], colSpan: 1 }
    ]
  },
  ataraxis: {
    id: 'ataraxis',
    name: 'Ataraxis',
    design: { bg: '#1a4d4d', text: '#f3f4f6', link: '#cbd5e1', hover: '#fbbf24', accent: '#fbbf24', borderColor: 'rgba(255,255,255,0.15)', paddingY: '4rem', gap: '2rem', fontFamily: 'inherit' },
    sections: [
      { id: 's1', type: 'about', title: 'Ataraxis', content: 'Find your peace of mind with our curated wellness products.', colSpan: 1 },
      { id: 's2', type: 'links', title: 'Shop', links: [{ text: 'All Products', url: '#' }, { text: 'Best Sellers', url: '#' }], colSpan: 1 },
      { id: 's3', type: 'newsletter', title: 'Stay Updated', description: 'Join our mindful community.', buttonText: 'Subscribe', colSpan: 2 }
    ]
  }
};

export const defaultAdvancedFooterSettings = {
  enabled: false,
  preset: 'google',
  ...premiumPresets.google,
  bottomBar: {
    show: true,
    copyright: `© ${new Date().getFullYear()} Your Store. All Rights Reserved.`,
    showSocial: true
  }
};

export const applyFooterStyles = (design) => {
  if (!design) return {};
  return {
    '--footer-bg': design.bg,
    '--footer-text': design.text,
    '--footer-link': design.link,
    '--footer-hover': design.hover,
    '--footer-accent': design.accent || design.link,
    '--footer-border-color': design.borderColor,
    '--footer-padding-y': design.paddingY,
    '--footer-gap': design.gap,
    '--footer-font-family': design.fontFamily,
    '--footer-title-size': design.titleSize || '1.125rem',
    '--footer-text-size': design.textSize || '0.875rem',
  };
};

export const getStyleConfig = (styleName) => {
  return premiumPresets[styleName] || premiumPresets.google;
};

export const mergeCustomizations = (baseStyle, customizations) => {
  return {
    ...baseStyle,
    design: { ...baseStyle.design, ...(customizations.design || {}) },
    sections: customizations.sections || baseStyle.sections,
    bottomBar: customizations.bottomBar || baseStyle.bottomBar
  };
};

export const loadFooterSettings = async () => {
  try {
    const data = await getDocument('settings', 'advancedFooterSettings');
    if (data) {
      // Return without id if it was appended
      const { id, ...settings } = data;
      return Object.keys(settings).length > 0 ? settings : defaultAdvancedFooterSettings;
    }
    return defaultAdvancedFooterSettings;
  } catch (error) {
    console.error("Error loading footer settings:", error);
    return defaultAdvancedFooterSettings;
  }
};

export const saveFooterSettings = async (settings) => {
  try {
    await setDocument('settings', 'advancedFooterSettings', settings);
    return true;
  } catch (error) {
    console.error("Error saving footer settings:", error);
    return false;
  }
};
