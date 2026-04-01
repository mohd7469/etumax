import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { setDocument, getDocument, updateDocument } from '@/lib/firestoreService';
import { validateWooCommerceCredentials } from '@/lib/woocommerceService';
import { 
  syncProductsFromWooCommerce, syncProductsToWooCommerce,
  syncOrdersFromWooCommerce, syncOrdersToWooCommerce,
  syncCustomersFromWooCommerce, syncCustomersToWooCommerce,
  syncCategoriesFromWooCommerce, syncCategoriesToWooCommerce,
  syncPagesFromWooCommerce, syncMediaFromWooCommerce, syncReviewsFromWooCommerce
} from '@/lib/woocommerceSyncService';
import { startAutoSync, stopAutoSync } from '@/lib/woocommerceSyncScheduler';
import { syncNewOrderToWooCommerce } from '@/lib/orderSyncService';

const WooCommerceContext = createContext();

export const useWooCommerce = () => {
  const context = useContext(WooCommerceContext);
  if (!context) throw new Error('useWooCommerce must be used within a WooCommerceProvider');
  return context;
};

export const WooCommerceProvider = ({ children }) => {
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState('');
  const [credentials, setCredentials] = useState({ storeUrl: '', consumerKey: '', consumerSecret: '' });
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState({
    products: false, orders: false, customers: false,
    categories: false, pages: false, media: false, reviews: false
  });
  
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLogs, setSyncLogs] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState({});
  const [autoSyncConfig, setAutoSyncConfig] = useState({ enabled: false, interval: 60 });
  
  const cancelSyncRefs = useRef({});

  useEffect(() => {
    const loadSettings = async () => {
      const doc = await getDocument('settings', 'woocommerce');
      if (doc) {
        if (doc.stores) setStores(doc.stores);
        if (doc.activeStoreId) {
          setActiveStoreId(doc.activeStoreId);
          const activeStore = doc.stores?.find(s => s.id === doc.activeStoreId);
          if (activeStore) {
            setCredentials({
              storeUrl: activeStore.storeUrl,
              consumerKey: activeStore.consumerKey,
              consumerSecret: activeStore.consumerSecret
            });
            setIsConnected(true);
          }
        } else if (doc.credentials?.storeUrl) {
          // Legacy support migration
          const legacyStore = {
            id: 'store_legacy_1',
            name: 'Main Store',
            storeUrl: doc.credentials.storeUrl,
            consumerKey: doc.credentials.consumerKey,
            consumerSecret: doc.credentials.consumerSecret
          };
          setStores([legacyStore]);
          setActiveStoreId(legacyStore.id);
          setCredentials(doc.credentials);
          setIsConnected(doc.isConnected || false);
        }
        
        if (doc.autoSyncConfig) setAutoSyncConfig(doc.autoSyncConfig);
        if (doc.lastSyncTime) setLastSyncTime(doc.lastSyncTime);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (autoSyncConfig.enabled && isConnected) {
      startAutoSync(autoSyncConfig.interval, handleFullSync);
    } else {
      stopAutoSync();
    }
  }, [autoSyncConfig, isConnected]);

  const saveSettings = async (newData) => {
    await setDocument('settings', 'woocommerce', {
      stores,
      activeStoreId,
      autoSyncConfig,
      lastSyncTime,
      ...newData
    });
  };

  const addStore = async (storeData) => {
    const newStores = [...stores, storeData];
    setStores(newStores);
    
    // If it's the first store, set it as active
    if (newStores.length === 1) {
      setActiveStoreId(storeData.id);
      setCredentials({
        storeUrl: storeData.storeUrl,
        consumerKey: storeData.consumerKey,
        consumerSecret: storeData.consumerSecret
      });
      setIsConnected(true);
    }
    
    await saveSettings({ stores: newStores, activeStoreId: newStores.length === 1 ? storeData.id : activeStoreId });
    toast({ title: 'Success', description: 'Store added successfully.' });
  };

  const removeStore = async (storeId) => {
    const newStores = stores.filter(s => s.id !== storeId);
    setStores(newStores);
    
    if (activeStoreId === storeId) {
      const nextStore = newStores[0];
      if (nextStore) {
        setActiveStoreId(nextStore.id);
        setCredentials({
          storeUrl: nextStore.storeUrl,
          consumerKey: nextStore.consumerKey,
          consumerSecret: nextStore.consumerSecret
        });
        setIsConnected(true);
        await saveSettings({ stores: newStores, activeStoreId: nextStore.id });
      } else {
        setActiveStoreId('');
        setCredentials({ storeUrl: '', consumerKey: '', consumerSecret: '' });
        setIsConnected(false);
        await saveSettings({ stores: newStores, activeStoreId: '' });
      }
    } else {
      await saveSettings({ stores: newStores });
    }
    toast({ title: 'Store Removed', description: 'The store has been removed.' });
  };

  const setActiveStore = async (storeId) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setActiveStoreId(storeId);
      setCredentials({
        storeUrl: store.storeUrl,
        consumerKey: store.consumerKey,
        consumerSecret: store.consumerSecret
      });
      setIsConnected(true);
      await saveSettings({ activeStoreId: storeId });
      toast({ title: 'Store Switched', description: `Switched to ${store.name}` });
    }
  };

  const addLog = (log) => {
    setSyncLogs(prev => [{...log, storeId: activeStoreId}, ...prev].slice(0, 110));
  };

  const connectWooCommerce = async (newCredentials) => {
    try {
      setIsSyncing(true);
      await validateWooCommerceCredentials(newCredentials.storeUrl, newCredentials.consumerKey, newCredentials.consumerSecret);
      
      const newStore = {
        id: `store_${Date.now()}`,
        name: new URL(newCredentials.storeUrl).hostname,
        ...newCredentials
      };
      
      const updatedStores = [...stores, newStore];
      setStores(updatedStores);
      setActiveStoreId(newStore.id);
      setCredentials(newCredentials);
      setIsConnected(true);
      
      await saveSettings({ stores: updatedStores, activeStoreId: newStore.id, isConnected: true });
      toast({ title: 'Success', description: 'Connected to WooCommerce successfully!' });
      addLog({ operation: 'Connection', status: 'success', message: 'Successfully connected', timestamp: new Date().toISOString() });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Connection Failed', description: error.message });
      addLog({ operation: 'Connection', status: 'error', message: error.message, timestamp: new Date().toISOString() });
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectWooCommerce = async () => {
    if (activeStoreId) {
      await removeStore(activeStoreId);
    }
  };

  const updateLastSyncTime = (type) => {
    const time = new Date().toISOString();
    setLastSyncTime(prev => { 
      const n = { ...prev, [`${activeStoreId}_${type}`]: time }; 
      saveSettings({ lastSyncTime: n }); 
      return n; 
    });
  };

  const checkSyncState = () => {
    const isAnySyncing = Object.values(cancelSyncRefs.current).some(val => val === false);
    setIsSyncing(isAnySyncing);
  };

  const setSyncState = (type, state) => {
    if (state) {
      cancelSyncRefs.current[type] = false;
    } else {
      delete cancelSyncRefs.current[type];
    }
    setSyncInProgress(prev => ({ ...prev, [type]: state }));
    setIsSyncing(state ? true : Object.values(syncInProgress).some(val => val));
  };

  const stopSync = (type) => {
    cancelSyncRefs.current[type] = true;
    setSyncInProgress(prev => ({ ...prev, [type]: false }));
    toast({ title: "Sync Stopping", description: `${type} sync abort requested.` });
    checkSyncState();
  };

  const stopAllSyncs = () => {
    Object.keys(syncInProgress).forEach(key => {
      if (syncInProgress[key]) {
        cancelSyncRefs.current[key] = true;
      }
    });
    setSyncInProgress({
      products: false, orders: false, customers: false,
      categories: false, pages: false, media: false, reviews: false
    });
    setIsSyncing(false);
    toast({ title: "All Syncs Stopping", description: "Sent abort signals to all active syncs." });
  };

  const syncProducts = async (limit = 110) => {
    if (!isConnected) return;
    setSyncState('products', true);
    setSyncProgress(25);
    
    const log1 = await syncProductsFromWooCommerce(credentials, limit);
    addLog(log1);
    
    if (cancelSyncRefs.current['products']) {
      setSyncState('products', false);
      return;
    }
    
    setSyncProgress(75);
    const log2 = await syncProductsToWooCommerce(credentials);
    addLog(log2);
    
    setSyncProgress(110);
    updateLastSyncTime('products');
    setSyncState('products', false);
    toast({ title: 'Products Synced' });
  };

  const syncOrders = async (limit = 110) => {
    if (!isConnected) return;
    setSyncState('orders', true);
    setSyncProgress(50);
    
    const log = await syncOrdersFromWooCommerce(credentials, limit);
    addLog(log);
    
    if (cancelSyncRefs.current['orders']) {
      setSyncState('orders', false);
      return;
    }
    
    const log2 = await syncOrdersToWooCommerce(credentials);
    addLog(log2);
    setSyncProgress(110);
    updateLastSyncTime('orders');
    setSyncState('orders', false);
    toast({ title: 'Orders Synced' });
  };

  const syncCustomers = async (limit = 110) => {
    if (!isConnected) return;
    setSyncState('customers', true);
    setSyncProgress(50);
    
    const log = await syncCustomersFromWooCommerce(credentials, limit);
    addLog(log);
    
    setSyncProgress(110);
    updateLastSyncTime('customers');
    setSyncState('customers', false);
    toast({ title: 'Customers Synced' });
  };

  const syncCategories = async (limit = 110) => {
    if (!isConnected) return;
    setSyncState('categories', true);
    setSyncProgress(50);
    
    const log = await syncCategoriesFromWooCommerce(credentials, limit);
    addLog(log);
    
    setSyncProgress(110);
    updateLastSyncTime('categories');
    setSyncState('categories', false);
    toast({ title: 'Categories Synced' });
  };

  const syncPages = async (limit = 110) => {
    if (!isConnected) return;
    setSyncState('pages', true);
    setSyncProgress(50);
    
    const log = await syncPagesFromWooCommerce(credentials, limit);
    addLog(log);
    
    setSyncProgress(110);
    updateLastSyncTime('pages');
    setSyncState('pages', false);
    toast({ title: 'Pages Synced' });
    return log.status === 'success';
  };

  const syncMedia = async (limit = 110) => {
    if (!isConnected) return;
    setSyncState('media', true);
    setSyncProgress(50);
    
    const log = await syncMediaFromWooCommerce(credentials, limit);
    addLog(log);
    
    setSyncProgress(110);
    updateLastSyncTime('media');
    setSyncState('media', false);
    toast({ title: 'Media Synced' });
    return log.status === 'success';
  };

  const syncReviews = async (limit = 110) => {
    if (!isConnected) return;
    setSyncState('reviews', true);
    setSyncProgress(50);
    
    const log = await syncReviewsFromWooCommerce(credentials, limit);
    addLog(log);
    
    setSyncProgress(110);
    updateLastSyncTime('reviews');
    setSyncState('reviews', false);
    toast({ title: 'Reviews Synced' });
    return log.status === 'success';
  };

  const handleFullSync = useCallback(async () => {
    if (!isConnected) return;
    await syncProducts();
    await syncOrders();
    await syncCustomers();
    await syncCategories();
  }, [isConnected, credentials]);

  const clearSyncLogs = () => setSyncLogs([]);

  const toggleAutoSync = (enabled, interval) => {
    const config = { enabled, interval: interval || autoSyncConfig.interval };
    setAutoSyncConfig(config);
    saveSettings({ autoSyncConfig: config });
    toast({ title: 'Auto-sync Updated', description: enabled ? `Enabled every ${config.interval} mins` : 'Disabled' });
  };

  const pushOrderToWooCommerce = async (order) => {
    if (!isConnected) throw new Error("WooCommerce not connected");
    const config = { isConnected, credentials };
    return await syncNewOrderToWooCommerce(order, config);
  };

  const updateOrderSyncStatus = async (orderId, status) => {
     try {
       await updateDocument('orders', orderId, { syncStatus: status });
     } catch (e) {
       console.error("Failed to update sync status locally", e);
     }
  };

  const getOrderSyncStatus = async (orderId) => {
      const doc = await getDocument('orders', orderId);
      return doc?.syncStatus || 'pending';
  };

  return (
    <WooCommerceContext.Provider value={{
      stores, activeStoreId, credentials, isConnected, isSyncing, syncInProgress, 
      syncProgress, syncLogs, lastSyncTime, autoSyncConfig,
      addStore, removeStore, setActiveStore, stopSync, stopAllSyncs,
      connectWooCommerce, disconnectWooCommerce,
      syncProducts, syncOrders, syncCustomers, syncCategories, syncPages, syncMedia, syncReviews,
      clearSyncLogs, toggleAutoSync,
      pushOrderToWooCommerce, updateOrderSyncStatus, getOrderSyncStatus
    }}>
      {children}
    </WooCommerceContext.Provider>
  );
};