
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { setDocument, getDocument, updateDocument } from '@/lib/firestoreService';
import { 
  validateWooCommerceCredentials,
  fetchWooCommerceProducts,
  createWooCommerceAuthHeader
} from '@/lib/woocommerceService';
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
    categories: false, pages: false, media: false, reviews: false, staged: false
  });
  
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLogs, setSyncLogs] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState({});
  const [autoSyncConfig, setAutoSyncConfig] = useState({ enabled: false, interval: 60 });
  
  // Two-stage workflow state
  const [stagedProducts, setStagedProducts] = useState([]);
  const [stagedSyncProgress, setStagedSyncProgress] = useState(0);
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0, isFetching: false, cancel: false });
  const [fetchMetadata, setFetchMetadata] = useState(null);
  
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
        }
        if (doc.autoSyncConfig) setAutoSyncConfig(doc.autoSyncConfig);
        if (doc.lastSyncTime) setLastSyncTime(doc.lastSyncTime);
      }
    };
    loadSettings();
  }, []);

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
        setCredentials(nextStore);
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
      setCredentials(store);
      setIsConnected(true);
      await saveSettings({ activeStoreId: storeId });
      toast({ title: 'Store Switched', description: `Switched to ${store.name}` });
    }
  };

  const addLog = (log) => setSyncLogs(prev => [{...log, storeId: activeStoreId}, ...prev].slice(0, 110));

  const connectWooCommerce = async (newCredentials) => {
    try {
      setIsSyncing(true);
      await validateWooCommerceCredentials(newCredentials.storeUrl, newCredentials.consumerKey, newCredentials.consumerSecret);
      const newStore = { id: `store_${Date.now()}`, name: new URL(newCredentials.storeUrl).hostname, ...newCredentials };
      const updatedStores = [...stores, newStore];
      setStores(updatedStores);
      setActiveStoreId(newStore.id);
      setCredentials(newCredentials);
      setIsConnected(true);
      await saveSettings({ stores: updatedStores, activeStoreId: newStore.id, isConnected: true });
      toast({ title: 'Success', description: 'Connected to WooCommerce successfully!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Connection Failed', description: error.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectWooCommerce = async () => { if (activeStoreId) await removeStore(activeStoreId); };

  const updateLastSyncTime = (type) => {
    const time = new Date().toISOString();
    setLastSyncTime(prev => { 
      const n = { ...prev, [`${activeStoreId}_${type}`]: time }; 
      saveSettings({ lastSyncTime: n }); 
      return n; 
    });
  };

  const setSyncState = (type, state) => {
    if (state) cancelSyncRefs.current[type] = false;
    else delete cancelSyncRefs.current[type];
    setSyncInProgress(prev => ({ ...prev, [type]: state }));
    setIsSyncing(state ? true : Object.values(syncInProgress).some(val => val));
  };

  const stopSync = (type) => {
    cancelSyncRefs.current[type] = true;
    setSyncInProgress(prev => ({ ...prev, [type]: false }));
    toast({ title: "Sync Stopping", description: `${type} sync abort requested.` });
  };

  const stopAllSyncs = () => {
    Object.keys(syncInProgress).forEach(key => { if (syncInProgress[key]) cancelSyncRefs.current[key] = true; });
    setSyncInProgress({ products: false, orders: false, customers: false, categories: false, pages: false, media: false, reviews: false, staged: false });
    setIsSyncing(false);
    toast({ title: "All Syncs Stopping", description: "Sent abort signals to all active syncs." });
  };

  // ---------------- TWO STAGE SYNC WORKFLOW ----------------

  const detectDuplicates = (wcProduct, localProducts) => {
    return localProducts.find(p => 
      (p.wc_id && String(p.wc_id) === String(wcProduct.id)) || 
      (p.sku && wcProduct.sku && p.sku === wcProduct.sku) ||
      (p.slug && wcProduct.slug && p.slug === wcProduct.slug)
    );
  };

  const getProductSyncStatus = (wcProduct, localProducts) => {
    const existing = detectDuplicates(wcProduct, localProducts);
    if (!existing) return 'New Product';
    
    const wcPrice = parseFloat(wcProduct.price || 0);
    const localPrice = parseFloat(existing.price || 0);
    const wcStock = wcProduct.stock_status === 'instock';
    const localStock = existing.inStock === true;
    
    if (wcPrice !== localPrice || wcStock !== localStock || wcProduct.name !== existing.name) {
      return 'Needs Update';
    }
    
    return 'Already Synced';
  };

  const loadProductsFromWooCommerce = async (localProducts, limit = 100) => {
    if (!isConnected) return;
    const startTime = Date.now();
    setSyncState('staged', true);
    setStagedProducts([]);
    setFetchProgress({ current: 0, total: Math.ceil(limit / 100), isFetching: true, cancel: false });
    
    const cancelToken = { current: false };
    cancelSyncRefs.current['fetchStaged'] = cancelToken;

    try {
      const result = await fetchWooCommerceProducts(
        credentials.storeUrl, 
        credentials.consumerKey, 
        credentials.consumerSecret, 
        limit,
        (current, total) => setFetchProgress(prev => ({ ...prev, current, total })),
        cancelToken
      );

      const mapped = result.products.map(p => ({
        ...p,
        syncStatus: getProductSyncStatus(p, localProducts)
      }));

      setStagedProducts(mapped);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      setFetchMetadata({
        pagesFetched: result.totalPages,
        totalCount: mapped.length,
        duration: duration,
        timestamp: new Date().toISOString()
      });

      if (!cancelToken.current) {
        toast({ title: "Products Fetched", description: `Successfully fetched ${mapped.length} products across ${result.totalPages} pages in ${duration}s.` });
      } else {
        toast({ title: "Fetch Cancelled", description: `Loaded ${mapped.length} products before cancellation.` });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error loading products', description: e.message });
    } finally {
      setFetchProgress(prev => ({ ...prev, isFetching: false }));
      setSyncState('staged', false);
    }
  };

  const cancelFetchStaged = () => {
    if (cancelSyncRefs.current['fetchStaged']) {
      cancelSyncRefs.current['fetchStaged'].current = true;
      setFetchProgress(prev => ({ ...prev, cancel: true }));
    }
  };

  const refreshStagedProduct = async (wcId, localProducts) => {
    if (!isConnected) return;
    try {
      const url = `${credentials.storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/${wcId}`;
      const headers = { Authorization: createWooCommerceAuthHeader(credentials.consumerKey, credentials.consumerSecret) };
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`WooCommerce API Error: ${res.status}`);
      
      const wcProduct = await res.json();
      const updated = {
        ...wcProduct,
        syncStatus: getProductSyncStatus(wcProduct, localProducts)
      };
      
      setStagedProducts(prev => prev.map(p => p.id === wcId ? updated : p));
      toast({ title: 'Refreshed', description: `${wcProduct.name} updated from WooCommerce.` });
    } catch(e) {
      toast({ variant: 'destructive', title: 'Refresh Failed', description: e.message });
    }
  };

  const syncSelectedProducts = async (selectedIds, localProducts, addProductFn, updateProductFn) => {
    if (!isConnected) return;
    setSyncState('staged', true);
    setStagedSyncProgress(0);
    
    const productsToSync = stagedProducts.filter(p => selectedIds.includes(p.id));
    const total = productsToSync.length;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < total; i++) {
      if (cancelSyncRefs.current['staged']) break;
      
      const wcP = productsToSync[i];
      const existing = detectDuplicates(wcP, localProducts);
      
      const productData = {
        name: wcP.name,
        sku: wcP.sku,
        price: parseFloat(wcP.price || 0),
        regularPrice: parseFloat(wcP.regular_price || 0),
        salePrice: wcP.sale_price ? parseFloat(wcP.sale_price) : null,
        stockStatus: wcP.stock_status,
        inStock: wcP.stock_status === 'instock',
        wc_id: wcP.id,
        wc_updated_at: wcP.date_modified,
        categories: (wcP.categories || []).map(c => c.name),
        images: (wcP.images || []).map(img => img.src),
        description: wcP.description || '',
        shortDescription: wcP.short_description || '',
      };

      try {
        if (existing) {
          await updateProductFn(existing.id, productData);
        } else {
          await addProductFn(productData);
        }
        successCount++;
        
        // Update local staged status immediately
        setStagedProducts(prev => prev.map(p => 
          p.id === wcP.id ? { ...p, syncStatus: 'Already Synced' } : p
        ));
      } catch (e) {
        console.error("Failed to sync", wcP.name, e);
        failedCount++;
      }
      
      setStagedSyncProgress(Math.round(((i + 1) / total) * 100));
    }

    updateLastSyncTime('products');
    setSyncState('staged', false);
    
    if (failedCount > 0) {
      toast({ variant: 'destructive', title: 'Sync Completed with Errors', description: `Synced ${successCount}, Failed ${failedCount}.` });
    } else {
      toast({ title: 'Sync Complete', description: `Successfully synced ${successCount} products.` });
    }
  };

  const updateProductSyncStatus = () => {
    // Re-evaluate staged products against current local state could be implemented here
  };

  // ---------------------------------------------------------

  const syncProducts = async (limit = 110) => {
    if (!isConnected) return;
    setSyncState('products', true);
    setSyncProgress(25);
    const log1 = await syncProductsFromWooCommerce(credentials, limit);
    addLog(log1);
    if (cancelSyncRefs.current['products']) { setSyncState('products', false); return; }
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
    if (cancelSyncRefs.current['orders']) { setSyncState('orders', false); return; }
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

  const toggleAutoSync = (enabled, interval) => {
    const config = { enabled, interval: interval || autoSyncConfig.interval };
    setAutoSyncConfig(config);
    saveSettings({ autoSyncConfig: config });
    toast({ title: 'Auto-sync Updated', description: enabled ? `Enabled every ${config.interval} mins` : 'Disabled' });
  };

  const clearSyncLogs = () => setSyncLogs([]);
  const pushOrderToWooCommerce = async (order) => await syncNewOrderToWooCommerce(order, { isConnected, credentials });
  const updateOrderSyncStatus = async (orderId, status) => { try { await updateDocument('orders', orderId, { syncStatus: status }); } catch (e) {} };
  const getOrderSyncStatus = async (orderId) => { const doc = await getDocument('orders', orderId); return doc?.syncStatus || 'pending'; };

  return (
    <WooCommerceContext.Provider value={{
      stores, activeStoreId, credentials, isConnected, isSyncing, syncInProgress, 
      syncProgress, syncLogs, lastSyncTime, autoSyncConfig,
      addStore, removeStore, setActiveStore, stopSync, stopAllSyncs,
      connectWooCommerce, disconnectWooCommerce,
      syncProducts, syncOrders, syncCustomers, syncCategories, syncPages, syncMedia, syncReviews,
      clearSyncLogs, toggleAutoSync,
      pushOrderToWooCommerce, updateOrderSyncStatus, getOrderSyncStatus,
      // Staged Sync Workflow
      stagedProducts, setStagedProducts, loadProductsFromWooCommerce, syncSelectedProducts, 
      updateProductSyncStatus, getProductSyncStatus, stagedSyncProgress, refreshStagedProduct,
      fetchProgress, cancelFetchStaged, fetchMetadata
    }}>
      {children}
    </WooCommerceContext.Provider>
  );
};
