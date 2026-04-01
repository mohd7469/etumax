import React, { createContext, useContext } from 'react';
import { useAppInitialization } from '@/hooks/useAppInitialization';

const AppInitContext = createContext();

export const useAppInit = () => {
  const context = useContext(AppInitContext);
  if (!context) {
    throw new Error('useAppInit must be used within AppInitProvider');
  }
  return context;
};

export const AppInitProvider = ({ children }) => {
  const { isInitialized, storeSettings, initError } = useAppInitialization();

  const value = {
    isInitialized,
    storeSettings: storeSettings || {},
    initError,
  };

  return (
    <AppInitContext.Provider value={value}>
      {children}
    </AppInitContext.Provider>
  );
};