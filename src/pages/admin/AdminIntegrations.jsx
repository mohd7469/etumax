import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, Users, Tag, Plus, RefreshCw, Trash2, ShieldCheck, Link2, AlertTriangle, CheckCircle, Database, FileText, Image as ImageIcon, Star, XCircle } from 'lucide-react';
import { useWooCommerce } from '@/context/WooCommerceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { getDocument, setDocument } from '@/lib/firestoreService';
import SyncCard from '@/components/admin/SyncCard';
import StoreManagementModal from '@/components/admin/StoreManagementModal';
import { toast } from '@/components/ui/use-toast';

const defaultLimits = {
  products: 100, orders: 100, customers: 100,
  categories: 100, pages: 100, media: 100, reviews: 100
};

const AdminIntegrations = () => {
  const { 
    stores, activeStoreId, credentials, isConnected, isSyncing, syncInProgress, syncProgress, syncLogs, lastSyncTime, autoSyncConfig,
    connectWooCommerce, addStore, removeStore, setActiveStore, stopSync, stopAllSyncs,
    syncProducts, syncOrders, syncCustomers, syncCategories, syncPages, syncMedia, syncReviews,
    clearSyncLogs, toggleAutoSync
  } = useWooCommerce();

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [formStoreUrl, setFormStoreUrl] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formSecret, setFormSecret] = useState('');
  const [syncInterval, setSyncInterval] = useState(autoSyncConfig.interval.toString());
  
  const [syncLimits, setSyncLimits] = useState(defaultLimits);

  useEffect(() => {
    const loadLimits = async () => {
      try {
        const doc = await getDocument('integrations', 'syncLimits');
        if (doc) setSyncLimits({ ...defaultLimits, ...doc });
      } catch (error) {
        console.error("Failed to load sync limits", error);
      }
    };
    loadLimits();
  }, []);

  const handleLimitChange = async (type, value) => {
    let validValue = Math.max(10, Math.min(10000, value));
    if (isNaN(validValue)) validValue = defaultLimits[type];
    
    const newLimits = { ...syncLimits, [type]: validValue };
    setSyncLimits(newLimits);
    
    try {
      await setDocument('integrations', 'syncLimits', newLimits);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save sync limit' });
    }
  };

  const handleConnectLegacy = async (e) => {
    e.preventDefault();
    await connectWooCommerce({ storeUrl: formStoreUrl, consumerKey: formKey, consumerSecret: formSecret });
  };

  const handleAddStore = (storeData) => {
    addStore(storeData);
  };

  const activeStore = stores.find(s => s.id === activeStoreId);
  const anySyncRunning = Object.values(syncInProgress).some(Boolean);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">WooCommerce Integrations</h1>
        <Button onClick={() => setIsStoreModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Store
        </Button>
      </div>

      <StoreManagementModal 
        isOpen={isStoreModalOpen} 
        onClose={() => setIsStoreModalOpen(false)} 
        onSave={handleAddStore} 
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" /> Active Store Configuration
                </div>
                {isConnected && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" /> Connected
                  </span>
                )}
              </CardTitle>
              <CardDescription>Manage and switch between your connected WooCommerce stores.</CardDescription>
            </CardHeader>
            <CardContent>
              {stores.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                  <div className="w-full sm:flex-1 space-y-2">
                    <Label>Select Store</Label>
                    <Select value={activeStoreId} onValueChange={setActiveStore}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a store" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name} ({new URL(store.storeUrl).hostname})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Store
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Store?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will disconnect the store "{activeStore?.name}" and stop all sync operations. Synced data will remain in Firestore.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeStore(activeStoreId)} className="bg-destructive hover:bg-destructive/90">
                          Remove Store
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <form onSubmit={handleConnectLegacy} className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-medium">Connect Your First Store</h3>
                  <div className="space-y-2">
                    <Label>Store URL</Label>
                    <Input type="url" placeholder="https://yourstore.com" value={formStoreUrl} onChange={e => setFormStoreUrl(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Consumer Key</Label>
                      <Input type="text" placeholder="ck_..." value={formKey} onChange={e => setFormKey(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Consumer Secret</Label>
                      <Input type="password" placeholder="cs_..." value={formSecret} onChange={e => setFormSecret(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSyncing} className="w-full">
                    {isSyncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
                    Connect Store
                  </Button>
                </form>
              )}
            </CardContent>
            {activeStore && (
              <CardFooter className="bg-muted/30 text-sm text-muted-foreground pt-4 border-t">
                Active Store URL: <strong className="ml-2 text-foreground">{activeStore.storeUrl}</strong>
              </CardFooter>
            )}
          </Card>

          {isConnected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" /> Data Synchronization
                    </div>
                    {anySyncRunning && (
                      <Button variant="destructive" size="sm" onClick={stopAllSyncs}>
                        <XCircle className="w-4 h-4 mr-2" /> Stop All Syncs
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>Trigger and monitor synchronization for {activeStore?.name}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {anySyncRunning && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sync in progress...</span>
                        <span>{syncProgress}%</span>
                      </div>
                      <Progress value={syncProgress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SyncCard
                      title="Products"
                      icon={Package}
                      lastSync={lastSyncTime[`${activeStoreId}_products`]}
                      limit={syncLimits.products}
                      onLimitChange={(v) => handleLimitChange('products', v)}
                      onSync={() => syncProducts(syncLimits.products)}
                      onStop={() => stopSync('products')}
                      isSyncing={syncInProgress.products}
                      colorClass="text-purple-600"
                    />
                    <SyncCard
                      title="Orders"
                      icon={ShoppingCart}
                      lastSync={lastSyncTime[`${activeStoreId}_orders`]}
                      limit={syncLimits.orders}
                      onLimitChange={(v) => handleLimitChange('orders', v)}
                      onSync={() => syncOrders(syncLimits.orders)}
                      onStop={() => stopSync('orders')}
                      isSyncing={syncInProgress.orders}
                      colorClass="text-blue-600"
                    />
                    <SyncCard
                      title="Customers"
                      icon={Users}
                      lastSync={lastSyncTime[`${activeStoreId}_customers`]}
                      limit={syncLimits.customers}
                      onLimitChange={(v) => handleLimitChange('customers', v)}
                      onSync={() => syncCustomers(syncLimits.customers)}
                      onStop={() => stopSync('customers')}
                      isSyncing={syncInProgress.customers}
                      colorClass="text-green-600"
                    />
                    <SyncCard
                      title="Categories"
                      icon={Tag}
                      lastSync={lastSyncTime[`${activeStoreId}_categories`]}
                      limit={syncLimits.categories}
                      onLimitChange={(v) => handleLimitChange('categories', v)}
                      onSync={() => syncCategories(syncLimits.categories)}
                      onStop={() => stopSync('categories')}
                      isSyncing={syncInProgress.categories}
                      colorClass="text-orange-600"
                    />
                    <SyncCard
                      title="Pages"
                      icon={FileText}
                      lastSync={lastSyncTime[`${activeStoreId}_pages`]}
                      limit={syncLimits.pages}
                      onLimitChange={(v) => handleLimitChange('pages', v)}
                      onSync={() => syncPages(syncLimits.pages)}
                      onStop={() => stopSync('pages')}
                      isSyncing={syncInProgress.pages}
                      colorClass="text-teal-600"
                    />
                    <SyncCard
                      title="Media"
                      icon={ImageIcon}
                      lastSync={lastSyncTime[`${activeStoreId}_media`]}
                      limit={syncLimits.media}
                      onLimitChange={(v) => handleLimitChange('media', v)}
                      onSync={() => syncMedia(syncLimits.media)}
                      onStop={() => stopSync('media')}
                      isSyncing={syncInProgress.media}
                      colorClass="text-pink-600"
                    />
                    <SyncCard
                      title="Reviews"
                      icon={Star}
                      lastSync={lastSyncTime[`${activeStoreId}_reviews`]}
                      limit={syncLimits.reviews}
                      onLimitChange={(v) => handleLimitChange('reviews', v)}
                      onSync={() => syncReviews(syncLimits.reviews)}
                      onStop={() => stopSync('reviews')}
                      isSyncing={syncInProgress.reviews}
                      colorClass="text-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg border mt-6 gap-4">
                    <div>
                      <Label className="text-base font-semibold">Auto-Sync Scheduler</Label>
                      <p className="text-xs text-muted-foreground">Automatically sync data in the background.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          className="w-20 h-8" 
                          value={syncInterval} 
                          onChange={e => setSyncInterval(e.target.value)} 
                          onBlur={() => toggleAutoSync(autoSyncConfig.enabled, parseInt(syncInterval))}
                        />
                        <span className="text-sm text-muted-foreground">mins</span>
                      </div>
                      <Switch checked={autoSyncConfig.enabled} onCheckedChange={(val) => toggleAutoSync(val, parseInt(syncInterval))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </div>

        <Card className="xl:col-span-1 h-fit sticky top-24">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sync Logs</CardTitle>
              <CardDescription>Recent history across all stores</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={clearSyncLogs} title="Clear Logs">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full rounded-md border bg-slate-950 p-4">
              {syncLogs.length > 0 ? syncLogs.map((log, index) => (
                <div key={index} className="mb-3 border-b border-slate-800 pb-2 last:border-0 text-xs font-mono">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <div className="flex gap-1">
                      {log.storeId && <span className="px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 text-[10px]">Store: {log.storeId.replace('store_', '')}</span>}
                      <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {log.operation}
                      </span>
                    </div>
                  </div>
                  <p className={log.status === 'error' ? 'text-red-300' : 'text-slate-300'}>{log.message}</p>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                  <Database className="w-8 h-8 opacity-20" />
                  <p>No logs available</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminIntegrations;