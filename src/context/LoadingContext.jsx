import React, { createContext, useState, useContext, useCallback, useMemo, useRef, useEffect } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const isLoading = loadingCount > 0;
  const loadingTimers = useRef({});

  const startLoading = useCallback((id = 'global') => {
    setLoadingCount((count) => count + 1);

    // Set a timeout to automatically stop loading if it takes too long
    if (loadingTimers.current[id]) {
      clearTimeout(loadingTimers.current[id]);
    }
    loadingTimers.current[id] = setTimeout(() => {
      setLoadingCount(c => c > 0 ? c - 1 : 0);
      delete loadingTimers.current[id];
    }, 10000); // 10 seconds timeout
  }, []);

  const stopLoading = useCallback((id = 'global') => {
    setLoadingCount((count) => Math.max(0, count - 1));
    if (loadingTimers.current[id]) {
      clearTimeout(loadingTimers.current[id]);
      delete loadingTimers.current[id];
    }
  }, []);

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      Object.values(loadingTimers.current).forEach(clearTimeout);
    };
  }, []);

  const value = useMemo(() => ({ isLoading, startLoading, stopLoading }), [isLoading, startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};