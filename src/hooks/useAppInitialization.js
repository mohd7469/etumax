
import { useState, useEffect } from 'react';
import { listenToDocument } from '@/lib/firestoreService';

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    const initializeApp = async () => {
      try {
        unsubscribe = listenToDocument('settings', 'generalSettings', (data) => {
          if (isMounted) {
            setStoreSettings(data || {});
            setIsInitialized(true);
          }
        });
      } catch (error) {
        console.error('App initialization error:', error);
        if (isMounted) {
          setInitError(error);
          setStoreSettings({});
          setIsInitialized(true);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    isInitialized,
    storeSettings,
    initError,
  };
};
