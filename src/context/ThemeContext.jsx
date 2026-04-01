import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, defaultTheme } from '@/lib/themes';
import { listenToDocument, setDocument } from '@/lib/firestoreService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function hexToHsl(hex) {
  if (!hex) return { h: 0, s: 0, l: 0 };
  hex = hex.replace('#', '');
  if (hex.length !== 6) return { h: 0, s: 0, l: 0 };
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState('default');
  const [themeConfig, setThemeConfig] = useState(defaultTheme);

  useEffect(() => {
    const unsubscribe = listenToDocument('settings', 'design', (data) => {
        const themeName = data?.activeTheme;
        if (themeName === 'custom') {
            setActiveTheme('custom');
            setThemeConfig({
              ...defaultTheme,
              name: "Custom",
              colors: data?.themeSettings || defaultTheme.colors
            });
        } else if (themeName && themes[themeName]) {
            setActiveTheme(themeName);
            setThemeConfig(themes[themeName]);
        } else {
            setActiveTheme('default');
            setThemeConfig(defaultTheme);
        }
    });

    return () => unsubscribe();
  }, []);

  const applyTheme = async (themeName) => {
    await setDocument('settings', 'design', { activeTheme: themeName });
  };

  useEffect(() => {
    if (!themeConfig || !themeConfig.colors) return;
    const root = document.documentElement;
    Object.entries(themeConfig.colors).forEach(([key, hex]) => {
      if (!hex) return;
      const { h, s, l } = hexToHsl(hex);
      root.style.setProperty(`--${key}`, `${h} ${s}% ${l}%`);
    });
    if (themeConfig.button?.shape) {
      root.style.setProperty('--radius', themeConfig.button.shape);
    }
  }, [themeConfig]);

  return (
    <ThemeContext.Provider value={{ activeTheme, themeConfig, themes, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};