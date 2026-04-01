import React, { createContext, useContext, useState, useEffect } from 'react';
import { listenToDocument, setDocument } from '@/lib/firestoreService';

const WhatsAppContext = createContext();

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  return context;
};

const defaultSettings = { enabled: true, phoneNumber: '', defaultMessage: 'Hello!', position: 'right', size: 'md', showOnDesktop: true, showOnMobile: true, iconUrl: '' };

export const WhatsAppProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const unsub = listenToDocument('settings', 'whatsapp', (data) => {
      if (data && data.default) setSettings({ ...defaultSettings, ...data.default });
    });
    return () => unsub();
  }, []);

  const updateSettings = async (newSettings) => {
    const settingsToSave = { ...settings, ...newSettings };
    await setDocument('settings', 'whatsapp', { default: settingsToSave });
    setSettings(settingsToSave);
  };

  return <WhatsAppContext.Provider value={{ settings, updateSettings }}>{children}</WhatsAppContext.Provider>;
};