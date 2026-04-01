
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Plus, Edit, Trash, X, Globe, Eye, Search, RefreshCw, CheckCircle2, Clock, Database, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIntegrations } from '@/context/IntegrationContext';
import { useWooCommerce } from '@/context/WooCommerceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import DOMPurify from 'dompurify';
import { listenToCollection, getAllDocuments, deleteDocument, setDocument } from '@/lib/firestoreService';

const PageModal = ({ isOpen, onClose, page, onSave }) => {
  const [formData, setFormData] = useState(page || { title: '', path: '', content: '', status: 'draft', showOnStore: false });
  const isNewPage = !page?.id || page.id.toString().startsWith('local-');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  useEffect(() => {
    if (page) setFormData(page);
  }, [page]);

  if (!isOpen || !page) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isNewPage ? "Add New Page" : formData.isPolicy ? "Edit Policy Page" : "Edit Page"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">URL Path Slug</Label>
              <Input 
                id="path" 
                value={formData.slug || formData.path} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value, path: `/${e.target.value}` })} 
                required 
                disabled={!isNewPage || formData.isPolicy} 
              />
              {formData.isPolicy && <p className="text-xs text-muted-foreground">Policy slugs cannot be changed to maintain system links.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML supported)</Label>
              <Textarea id="content" className="font-mono text-sm" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={12} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Show on Store Navbar/Footer</Label>
                <div className="flex items-center h-10 rounded-md border px-3">
                  <Switch id="showOnStore" checked={formData.showOnStore} onCheckedChange={(val) => setFormData({ ...formData, showOnStore: val })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isNewPage ? "Create Page" : "Save Changes"}</Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const PageCard = ({ page, onEdit, onDelete }) => {
  const isSynced = page.id?.toString().startsWith('wc_page_');
  const isPolicy = page.isPolicy || page.id?.toString().startsWith('policy-');
  const previewText = page.content ? DOMPurify.sanitize(page.content, { ALLOWED_TAGS: [] }).substring(0, 120) + '...' : 'No content available';
  
  return (
    <Card className={`flex flex-col overflow-hidden hover:shadow-md transition-shadow ${isPolicy ? 'border-purple-200 dark:border-purple-900/50' : ''}`}>
      <CardHeader className="pb-3 bg-muted/30">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2 truncate pr-2">
            {isPolicy ? <Shield className="w-5 h-5 text-purple-600 shrink-0" /> : <FileText className="w-5 h-5 text-primary shrink-0" />}
            <span className="truncate">{page.title}</span>
            {isPolicy && <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 ml-2">Policy</Badge>}
          </CardTitle>
          <Badge variant={page.status === 'publish' ? 'default' : 'secondary'} className="capitalize shrink-0">
            {page.status || 'draft'}
          </Badge>
        </div>
        <CardDescription className="text-xs font-mono mt-1 truncate" title={page.path || `/${page.slug}`}>
          {page.path || `/${page.slug}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {previewText}
        </p>
        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
          {isSynced ? (
            <span className="flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
              <Globe className="w-3 h-3" /> WooCommerce
            </span>
          ) : isPolicy ? (
            <span className="flex items-center gap-1 text-purple-600 font-medium bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md">
              <Shield className="w-3 h-3" /> Core Page
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> Local Page
            </span>
          )}
          {page.lastSynced && (
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {new Date(page.lastSynced).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 pb-3 bg-muted/10 flex justify-between gap-2">
        <div className="flex items-center gap-2">
          <Switch 
            checked={page.showOnStore} 
            onCheckedChange={() => onEdit({...page, showOnStore: !page.showOnStore})} 
            title="Toggle Visibility in Store"
          />
          <Label className="text-xs cursor-pointer">Visible</Label>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={page.link || page.path || `/${page.slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4" />
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(page)}>
            <Edit className="w-4 h-4" />
          </Button>
          {!isPolicy && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-9 w-9">
                  <Trash className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Page?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the page "{page.title}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(page.id)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const AdminPages = () => {
  const { toast } = useToast();
  const { syncedPages, updateSyncedPage } = useIntegrations();
  const { syncPages, isSyncing, isConnected, syncInProgress } = useWooCommerce();
  
  const [localPages, setLocalPages] = useState([]);
  const [dbPages, setDbPages] = useState([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); 
  
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
  });

  // Load Local Pages (legacy support)
  useEffect(() => {
    const savedPages = localStorage.getItem('shophub_local_pages');
    if (savedPages) {
      setLocalPages(JSON.parse(savedPages));
    }
  }, []);

  // Listen to Firestore Pages
  useEffect(() => {
    setIsLoadingDb(true);
    const unsubscribe = listenToCollection('pages', (data) => {
      setDbPages(data);
      setIsLoadingDb(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setIsLoadingDb(true);
    try {
      const data = await getAllDocuments('pages');
      setDbPages(data);
      toast({ title: "Refreshed", description: `Successfully loaded ${data.length} pages from database.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Refresh Error", description: e.message });
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleSave = async (pageData) => {
    if (pageData.id?.toString().startsWith('local-') && !pageData.id.includes('policy-')) {
      const updatedLocal = localPages.some(p => p.id === pageData.id)
        ? localPages.map(p => p.id === pageData.id ? pageData : p)
        : [...localPages, pageData];
      
      setLocalPages(updatedLocal);
      localStorage.setItem('shophub_local_pages', JSON.stringify(updatedLocal));
      toast({ title: "Local Page Saved", description: `"${pageData.title}" has been updated.` });
    } else {
      // Save to Firestore
      try {
        const docId = pageData.id || `custom-${Date.now()}`;
        await setDocument('pages', docId, {
          ...pageData,
          updatedAt: new Date().toISOString()
        });
        toast({ title: "Page Saved", description: `"${pageData.title}" has been saved successfully.` });
      } catch (e) {
        toast({ variant: "destructive", title: "Error Saving", description: e.message });
      }
    }
  };

  const handleDelete = async (pageId) => {
    if (pageId.toString().startsWith('local-')) {
      const updatedLocal = localPages.filter(p => p.id !== pageId);
      setLocalPages(updatedLocal);
      localStorage.setItem('shophub_local_pages', JSON.stringify(updatedLocal));
      toast({ title: "Page Deleted", description: "Local page removed." });
    } else {
      try {
        await deleteDocument('pages', pageId);
        toast({ title: "Page Deleted", description: "Page removed from database." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete page from database." });
      }
    }
  };

  const handleManualSync = async () => {
    if (!isConnected) {
      toast({ variant: 'destructive', title: "Not Connected", description: "Please connect a WooCommerce store first." });
      return;
    }
    
    try {
      const success = await syncPages(100);
      if (success) {
        toast({ title: "Sync Complete", description: "Pages successfully synced from WooCommerce." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    }
  };

  const handleAddNew = () => {
    const newSlug = `new-page-${Date.now()}`;
    setEditingPage({ id: `custom-${Date.now()}`, title: 'New Page', path: `/page/${newSlug}`, slug: newSlug, status: 'draft', content: '', sourceStoreName: 'Local', showOnStore: true });
  };

  const allPages = useMemo(() => {
    // Merge dbPages with context fallback
    const contextPagesNotDb = syncedPages.filter(sp => !dbPages.some(dp => dp.id === sp.id));
    return [...localPages, ...dbPages, ...contextPagesNotDb];
  }, [localPages, dbPages, syncedPages]);

  const filteredPages = useMemo(() => {
    return allPages.filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (page.slug && page.slug.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const isSyncedPage = page.id?.toString().startsWith('wc_page_');
      const isPolicy = page.isPolicy || page.id?.toString().startsWith('policy-');
      
      const matchesFilter = viewFilter === 'all' || 
                           (viewFilter === 'synced' && isSyncedPage) || 
                           (viewFilter === 'local' && !isSyncedPage && !isPolicy) ||
                           (viewFilter === 'policy' && isPolicy);
                           
      return matchesSearch && matchesFilter;
    });
  }, [allPages, searchQuery, viewFilter]);

  const isActuallySyncing = isSyncing || syncInProgress?.pages;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">Manage content and policy pages for your store.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={handleManualSync} disabled={isActuallySyncing || !isConnected} className="flex-1 md:flex-none">
            <RefreshCw className={`w-4 h-4 mr-2 ${isActuallySyncing ? 'animate-spin' : ''}`} />
            {isActuallySyncing ? 'Syncing...' : 'Sync WooCommerce Pages'}
          </Button>
          <Button onClick={handleAddNew} className="flex-1 md:flex-none">
            <Plus className="mr-2 h-4 w-4" /> Add Page
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-muted/30 border-dashed md:col-span-2">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by title or slug..." 
                className="pl-9 bg-background w-full" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label className="shrink-0">View:</Label>
              <Select value={viewFilter} onValueChange={setViewFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-background">
                  <SelectValue placeholder="All Pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="policy">Policies Only</SelectItem>
                  <SelectItem value="local">Local Only</SelectItem>
                  <SelectItem value="synced">Synced Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Debug Panel */}
        <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                <Database className="w-4 h-4" /> Database Info
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh} disabled={isLoadingDb}>
                <RefreshCw className={`w-3 h-3 ${isLoadingDb ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Total local pages: <strong className="text-foreground">{localPages.length}</strong></p>
              <p>Total DB pages: <strong className="text-foreground">{dbPages.length}</strong></p>
              {isLoadingDb && <p className="text-blue-500 animate-pulse flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Fetching from database...</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoadingDb && dbPages.length === 0 ? (
        <div className="text-center py-20 bg-background border rounded-xl shadow-sm">
          <RefreshCw className="w-10 h-10 mx-auto text-muted-foreground/30 animate-spin mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Loading pages from database...</h3>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-20 bg-background border rounded-xl shadow-sm">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No pages found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery || viewFilter !== 'all' 
              ? "Try adjusting your search or filter criteria." 
              : "You haven't created any pages yet."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" /> Add Page</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPages.map((page) => (
              <motion.div
                key={page.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <PageCard 
                  page={page} 
                  onEdit={setEditingPage} 
                  onDelete={handleDelete} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {editingPage && (
        <PageModal 
          isOpen={!!editingPage} 
          onClose={() => setEditingPage(null)} 
          page={editingPage} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default AdminPages;
