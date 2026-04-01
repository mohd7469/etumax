
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { allLanguages } from '@/lib/languages';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const initialSettings = {
  enabled: true,
  method: 'gtranslate',
  widgetStyle: 'dropdown',
  position: 'bottom-right',
  showFlags: true,
  showNames: true,
  originalLanguage: 'en',
  availableLanguages: ['en', 'ar', 'ur', 'hi', 'am', 'fil', 'es', 'fr', 'de', 'pt', 'zh', 'ja'],
};

export const LanguageProvider = ({ children }) => {
  const [languageSettings, setLanguageSettings] = useState(initialSettings);
  const [selectedLanguage, setSelectedLanguageState] = useState(initialSettings.originalLanguage);

  useEffect(() => {
    try {
      // 1. Check localStorage for a saved language preference
      const savedLang = localStorage.getItem('selectedLanguage');
      
      // 2. If a saved preference exists and is supported, use that language
      if (savedLang && initialSettings.availableLanguages.includes(savedLang)) {
        setSelectedLanguageState(savedLang);
      } else {
        // 3. If no saved preference exists, detect the browser language
        let detectedLang = null;
        
        if (typeof navigator !== 'undefined') {
          // Gracefully handle edge cases like undefined navigator properties
          const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
          
          for (let lang of browserLangs) {
            if (!lang) continue;
            
            // Extract the base language code (e.g., 'en-US' -> 'en')
            const shortLang = lang.split('-')[0].toLowerCase();
            
            // 4. Match the detected language code against the availableLanguages array
            if (initialSettings.availableLanguages.includes(shortLang)) {
              detectedLang = shortLang;
              break;
            }
          }
        }
        
        // 5 & 6. If detected language is supported use it, else default to English ('en')
        const finalLang = detectedLang || initialSettings.originalLanguage;
        
        setSelectedLanguageState(finalLang);
        localStorage.setItem('selectedLanguage', finalLang);
      }
    } catch (error) {
      console.error('Error detecting browser language:', error);
      // Fallback to default in case of restricted environments
      setSelectedLanguageState(initialSettings.originalLanguage);
    }
  }, []); // 8. Empty dependency array ensures this runs only once on mount

  const saveLanguageSettings = useCallback(async (settings) => {
    setLanguageSettings(settings);
  }, []);

  const setSelectedLanguage = useCallback((langCode) => {
    // 7. Save manual choice to localStorage so it persists across visits
    try {
      localStorage.setItem('selectedLanguage', langCode);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
    setSelectedLanguageState(langCode);
  }, []);

  const value = {
    languageSettings,
    saveLanguageSettings,
    selectedLanguage,
    setSelectedLanguage,
    allLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
