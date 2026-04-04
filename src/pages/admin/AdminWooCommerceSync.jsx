
import React, { useState, useEffect, useMemo } from 'react';
import { useWooCommerce } from '@/context/WooCommerceContext';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, RefreshCw, Search, FilterX, Eye, ArrowRight, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import ProductDetailsModal from '@/components/admin/ProductDetailsModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ITEMS_PER_PAGE = 10;

const AdminWooCommerceSync = () => {
  const { 
    isConnected, 
    syncInProgress, 
    stagedProducts,
    setStagedProducts,
    loadProductsFromWooCommerce, 
    syncSelectedProducts,
    stagedSyncProgress,
    refreshStagedProduct,
    fetchProgress,
    cancelFetchStaged,
    fetchMetadata
  } = useWooCommerce();
  
  const { products: localProducts, addProduct, updateProduct } = useProducts();

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalProduct, setDetailModalProduct] = useState(null);
  const [fetchLimit, setFetchLimit] = useState(100);
  
  // Modals state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, payload: null });
  const [refreshingId, setRefreshingId] = useState(null);

  const isLoading = fetchProgress.isFetching;
  const isSyncing = syncInProgress.staged && stagedSyncProgress > 0 && !fetchProgress.isFetching;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadProducts = async () => {
    if (!isConnected) {
      toast({ variant: 'destructive', title: 'Not Connected', description: 'Please connect to WooCommerce in Integrations first.' });
      return;
    }
    
    const limit = Number(fetchLimit);
    if (isNaN(limit) || limit < 5 || limit > 5000) {
      toast({ variant: 'destructive', title: 'Invalid Limit', description: 'Please enter a valid fetch limit between 5 and 5000.' });
      return;
    }

    await loadProductsFromWooCommerce(localProducts, limit);
    setSelectedIds([]);
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    return stagedProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchStatus = statusFilter === 'All' || p.syncStatus === statusFilter;
      const matchStock = stockFilter === 'All' || 
                        (stockFilter === 'In Stock' && p.stock_status === 'instock') || 
                        (stockFilter === 'Out of Stock' && p.stock_status === 'outofstock') ||
                        (stockFilter === 'On Backorder' && p.stock_status === 'onbackorder');
      const matchCategory = categoryFilter === 'All' || 
                            p.categories?.some(c => c.name === categoryFilter);
      
      return matchSearch && matchStatus && matchStock && matchCategory;
    });
  }, [stagedProducts, debouncedSearch, statusFilter, stockFilter, categoryFilter]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    stagedProducts.forEach(p => p.categories?.forEach(c => cats.add(c.name)));
    return ['All', ...Array.from(cats)];
  }, [stagedProducts]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  // Pagination bounds check
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAllVisible = () => {
    const visibleIds = filteredProducts.map(p => p.id);
    const newSelected = new Set([...selectedIds, ...visibleIds]);
    setSelectedIds(Array.from(newSelected));
  };

  const unselectAll = () => setSelectedIds([]);

  const handleConfirmAction = async () => {
    const { type, payload } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, payload: null });
    
    if (type === 'sync_selected') {
      await syncSelectedProducts(payload, localProducts, addProduct, updateProduct);
      setSelectedIds([]);
    } else if (type === 'update_selected') {
      const needsUpdateIds = stagedProducts.filter(p => payload.includes(p.id) && p.syncStatus === 'Needs Update').map(p => p.id);
      await syncSelectedProducts(needsUpdateIds, localProducts, addProduct, updateProduct);
      setSelectedIds(prev => prev.filter(id => !needsUpdateIds.includes(id)));
    } else if (type === 'sync_single') {
      await syncSelectedProducts([payload], localProducts, addProduct, updateProduct);
      setSelectedIds(prev => prev.filter(id => id !== payload));
    }
  };

  const handleSkipSelected = () => {
    setStagedProducts(prev => prev.map(p => 
      selectedIds.includes(p.id) ? { ...p, syncStatus: 'Already Synced' } : p
    ));
    setSelectedIds([]);
    toast({ title: 'Products Skipped', description: 'Selected products marked as Already Synced locally.' });
  };

  const handleRefreshSingle = async (id) => {
    setRefreshingId(id);
    await refreshStagedProduct(id, localProducts);
    setRefreshingId(null);
  };

  const getStatusBadgeVariant = (status) => {
    if (status === 'Already Synced') return 'default';
    if (status === 'Needs Update') return 'secondary';
    return 'destructive';
  };

  // Summary counts
  const summary = useMemo(() => ({
    total: stagedProducts.length,
    selected: selectedIds.length,
    newProducts: stagedProducts.filter(p => p.syncStatus === 'New Product').length,
    needsUpdate: stagedProducts.filter(p => p.syncStatus === 'Needs Update').length,
    synced: stagedProducts.filter(p => p.syncStatus === 'Already Synced').length,
  }), [stagedProducts, selectedIds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staged Product Sync</h1>
          <p className="text-muted-foreground mt-1">Review and select WooCommerce products before importing.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-2">
            <label htmlFor="fetchLimit" className="text-sm font-medium whitespace-nowrap">
              Products to Fetch:
            </label>
            <Input
              id="fetchLimit"
              type="number"
              min={5}
              max={5000}
              value={fetchLimit}
              onChange={(e) => setFetchLimit(e.target.value)}
              className="w-24"
              disabled={isLoading}
            />
          </div>
          
          {isLoading ? (
            <Button variant="destructive" onClick={cancelFetchStaged} className="w-full sm:w-auto">
              <XCircle className="w-4 h-4 mr-2" /> Cancel Fetch
            </Button>
          ) : (
            <Button onClick={handleLoadProducts} disabled={syncInProgress.staged} className="w-full sm:w-auto">
              <DownloadCloud className="w-4 h-4 mr-2" />
              {stagedProducts.length > 0 ? "Reload Products" : "Fetch Products from WC"}
            </Button>
          )}
        </div>
      </div>

      {fetchProgress.isFetching && (
        <div className="bg-card border rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium animate-pulse text-primary flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Fetching Products...
            </span>
            <span className="font-medium">Page {fetchProgress.current} of {fetchProgress.total}</span>
          </div>
          <Progress value={fetchProgress.total > 0 ? (fetchProgress.current / fetchProgress.total) * 100 : 0} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {fetchProgress.cancel ? "Cancelling..." : "Loading products from WooCommerce API"}
          </p>
        </div>
      )}

      {!fetchProgress.isFetching && fetchMetadata && stagedProducts.length > 0 && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1"><DownloadCloud className="w-4 h-4" /> <strong>{fetchMetadata.totalCount}</strong> Products Retrieved</div>
          <div className="flex items-center gap-1"><RefreshCw className="w-4 h-4" /> <strong>{fetchMetadata.pagesFetched}</strong> Pages Fetched</div>
          <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> Duration: <strong>{fetchMetadata.duration}s</strong></div>
        </div>
      )}

      {stagedProducts.length > 0 && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border p-3 rounded-lg text-center shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Total Loaded</div>
            <div className="text-2xl font-bold">{summary.total}</div>
          </div>
          <div className="bg-card border p-3 rounded-lg text-center shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Selected</div>
            <div className="text-2xl font-bold text-primary">{summary.selected}</div>
          </div>
          <div className="bg-card border p-3 rounded-lg text-center shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3 text-blue-500" /> New</div>
            <div className="text-2xl font-bold text-blue-600">{summary.newProducts}</div>
          </div>
          <div className="bg-card border p-3 rounded-lg text-center shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1"><RefreshCw className="w-3 h-3 text-orange-500" /> Update</div>
            <div className="text-2xl font-bold text-orange-600">{summary.needsUpdate}</div>
          </div>
          <div className="bg-card border p-3 rounded-lg text-center shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Synced</div>
            <div className="text-2xl font-bold text-green-600">{summary.synced}</div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedIds.length > 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-20 z-40 bg-card border shadow-lg rounded-lg p-4 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="font-semibold text-primary flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">{selectedIds.length}</span> 
              Selected
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={unselectAll}>Clear</Button>
              <Button variant="outline" size="sm" onClick={handleSkipSelected}>
                <XCircle className="w-4 h-4 mr-2" /> Skip Selected
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmModal({ isOpen: true, type: 'update_selected', payload: selectedIds })}>
                <RefreshCw className="w-4 h-4 mr-2" /> Update Selected
              </Button>
              <Button size="sm" onClick={() => setConfirmModal({ isOpen: true, type: 'sync_selected', payload: selectedIds })}>
                <DownloadCloud className="w-4 h-4 mr-2" /> Sync Selected
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSyncing && (
        <div className="bg-card border rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium animate-pulse">Syncing Products to Local Database...</span>
            <span>{stagedSyncProgress}%</span>
          </div>
          <Progress value={stagedSyncProgress} className="h-2" />
        </div>
      )}

      <div className="bg-card border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b space-y-4 bg-muted/20">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search by name or SKU..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} disabled={isLoading}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sync Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Already Synced">Already Synced</SelectItem>
                <SelectItem value="New Product">New Product</SelectItem>
                <SelectItem value="Needs Update">Needs Update</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v); setCurrentPage(1); }} disabled={isLoading}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stock Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Stock</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                <SelectItem value="On Backorder">On Backorder</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }} disabled={isLoading}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setStatusFilter('All'); setCategoryFilter('All'); setStockFilter('All'); setCurrentPage(1); }} disabled={isLoading}>
              <FilterX className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Showing {isLoading ? 0 : filteredProducts.length} filtered results</span>
              {filteredProducts.length > 0 && !isLoading && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border inline-block"></span>
                  <button onClick={selectAllVisible} className="text-primary hover:underline font-medium">Select All Visible</button>
                  <button onClick={unselectAll} className="text-primary hover:underline font-medium">Unselect All</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"><Checkbox checked={!isLoading && filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id))} onCheckedChange={selectAllVisible} disabled={isLoading} /></TableHead>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Product Info</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="w-4 h-4" /></TableCell>
                    <TableCell><Skeleton className="w-10 h-10 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="w-48 h-4 mb-2" /><Skeleton className="w-24 h-3" /></TableCell>
                    <TableCell><Skeleton className="w-16 h-4" /></TableCell>
                    <TableCell><Skeleton className="w-20 h-5" /></TableCell>
                    <TableCell><Skeleton className="w-24 h-5" /></TableCell>
                    <TableCell><Skeleton className="w-20 h-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map(p => (
                  <TableRow key={p.id} className={selectedIds.includes(p.id) ? "bg-muted/30" : ""}>
                    <TableCell>
                      <Checkbox checked={selectedIds.includes(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                    </TableCell>
                    <TableCell>
                      <img src={p.images?.[0]?.src || p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.name} className="w-10 h-10 rounded-md object-cover border bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span>SKU: {p.sku || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-border inline-block"></span>
                        <span>ID: {p.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>${p.price}</TableCell>
                    <TableCell>
                      <Badge variant={p.stock_status === 'instock' ? 'outline' : 'secondary'} className={p.stock_status === 'instock' ? 'text-green-600 border-green-200 bg-green-50' : ''}>
                        {p.stock_status === 'instock' ? 'In Stock' : p.stock_status === 'onbackorder' ? 'Backorder' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(p.syncStatus)}>{p.syncStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleRefreshSingle(p.id)} disabled={refreshingId === p.id} title="Refresh from WC">
                          <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshingId === p.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDetailModalProduct(p)} title="View Details">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setConfirmModal({ isOpen: true, type: 'sync_single', payload: p.id })}
                          disabled={p.syncStatus === 'Already Synced' || syncInProgress.staged}
                        >
                          <ArrowRight className="w-4 h-4 mr-1" /> Sync
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    {stagedProducts.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <DownloadCloud className="w-8 h-8 opacity-20" />
                        <p>No products loaded. Click 'Fetch Products' to begin.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FilterX className="w-8 h-8 opacity-20" />
                        <p>No products match your current filters.</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && !isLoading && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/10">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <ProductDetailsModal 
        isOpen={!!detailModalProduct} 
        onClose={() => setDetailModalProduct(null)} 
        product={detailModalProduct} 
        onSync={(p) => setConfirmModal({ isOpen: true, type: 'sync_single', payload: p.id })}
      />

      <AlertDialog open={confirmModal.isOpen} onOpenChange={(open) => !open && setConfirmModal({ isOpen: false, type: null, payload: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmModal.type === 'sync_selected' && `Sync ${confirmModal.payload?.length} Products?`}
              {confirmModal.type === 'update_selected' && `Update Selected Products?`}
              {confirmModal.type === 'sync_single' && `Sync Product?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmModal.type === 'sync_selected' && "You are about to sync selected products to your local database. Products that already exist will be updated."}
              {confirmModal.type === 'update_selected' && "You are about to update selected products that have changes in WooCommerce. New products and already synced products will be skipped."}
              {confirmModal.type === 'sync_single' && "Are you sure you want to sync this product to your database?"}
              <br/><br/>This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminWooCommerceSync;
