
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Globe, Plus, X, Edit, Image as ImageIcon, Trash2, Tag, Check, ChevronsUpDown, ArrowUpDown, FileUp, FileDown, Download, Search, Settings2, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn, downloadCsv } from '@/lib/utils';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useIntegrations } from '@/context/IntegrationContext';
import { fetchWooCommerceProducts, fetchWooCommercePages, transformWooCommerceProduct, transformWooCommercePage } from '@/lib/woocommerce';
import { getAllDocuments } from '@/lib/firestoreService';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';

const slugify = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const { categories, brands, updateProduct, addProduct } = useProducts();
  const isNewProduct = !product.id;
  const [formData, setFormData] = useState({
    ...product,
    price: product.price || 0,
    categories: Array.isArray(product.categories) ? product.categories : [],
    brand: product.brand || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    features: Array.isArray(product.features) ? product.features : [],
    shortDescription: product.shortDescription || product.short_description || '',
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : ['']
  });
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const { toast } = useToast();

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: isNewProduct ? slugify(name) : prev.slug
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const openMediaModalForImage = (index) => {
    setActiveImageIndex(index);
    setIsMediaModalOpen(true);
  };

  const handleImageSelect = (imageUrl) => {
    if (activeImageIndex !== null) {
      handleImageChange(activeImageIndex, imageUrl);
    }
  };

  const addImageField = () => setFormData({ ...formData, images: [...formData.images, ''] });
  const removeImageField = (index) => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });

  const handleCategoryChange = (categoryName) => {
    setFormData(prev => {
      const newCategories = prev.categories.includes(categoryName)
        ? prev.categories.filter(c => c !== categoryName)
        : [...prev.categories, categoryName];
      return { ...prev, categories: newCategories };
    });
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleFeaturesChange = (e) => {
    const features = e.target.value.split('\n').map(feature => feature.trim());
    setFormData(prev => ({ ...prev, features }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      originalPrice: parseFloat(formData.originalPrice) || 0,
      images: formData.images.filter(img => img.trim() !== ''),
      features: formData.features.filter(f => f.trim() !== ''),
      dateAdded: formData.dateAdded || new Date().toISOString(),
    };

    if (finalData.name && finalData.price >= 0 && finalData.categories.length > 0) {
      if (isNewProduct) {
        addProduct(finalData);
      } else {
        updateProduct(product.id, finalData);
      }
      onSave(finalData);
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out name, a valid price, and at least one category.",
      });
    }
  };

  if (!isOpen) return null;

  const brandOptions = brands.map(b => ({ value: b, label: b }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b bg-white rounded-t-xl">
            <h2 className="text-2xl font-bold">{isNewProduct ? "Add New Product" : "Edit Product"}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-6 w-6" /></Button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6 max-h-[75vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" value={formData.name} onChange={handleNameChange} placeholder="e.g. Summer T-Shirt" required />
                    </div>
                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input id="slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. summer-t-shirt" />
                    </div>
                    <div>
                      <Label htmlFor="shortDescription">Short Description (Summary)</Label>
                      <Textarea 
                        id="shortDescription" 
                        value={formData.shortDescription} 
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} 
                        placeholder="Brief summary of the product..." 
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Full Description</Label>
                      <Textarea 
                        id="description" 
                        value={formData.description} 
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                        placeholder="Detailed product description..." 
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="features">Key Features & Details</Label>
                      <Textarea
                        id="features"
                        value={(formData.features || []).join('\n')}
                        onChange={handleFeaturesChange}
                        placeholder="e.g. 100% Cotton"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Enter each feature on a new line.</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Images (Firebase Storage)</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {img ? (
                           <img src={img} alt="Product Preview" className="h-10 w-10 object-cover rounded border" />
                        ) : (
                           <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded border"><ImageIcon className="h-4 w-4 text-gray-400" /></div>
                        )}
                        <Input value={img} onChange={e => handleImageChange(index, e.target.value)} placeholder="Firebase Storage URL" />
                        <Button type="button" variant="secondary" onClick={() => openMediaModalForImage(index)}>Upload</Button>
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeImageField(index)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addImageField}><Plus className="h-4 w-4 mr-2" /> Add Image Slot</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="99.99" required />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (for sale)</Label>
                      <Input id="originalPrice" type="number" step="0.01" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} placeholder="129.99" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader><CardTitle>Status & Visibility</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status || 'published'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Stock Status</Label>
                      <Select value={formData.inStock ? 'instock' : 'outofstock'} onValueChange={(value) => setFormData({ ...formData, inStock: value === 'instock' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instock">In Stock</SelectItem>
                          <SelectItem value="outofstock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm mb-2 text-purple-700 flex items-center"><Tag className="w-4 h-4 mr-2" /> Categories</p>
                      <ScrollArea className="h-40 rounded-md border p-2">
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={formData.categories.includes(category.name)}
                                onCheckedChange={() => handleCategoryChange(category.name)}
                              />
                              <Label htmlFor={`category-${category.id}`} className="font-normal cursor-pointer text-sm">
                                {category.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <div>
                      <Label className="font-semibold text-sm mb-2 text-purple-700 flex items-center"><Tag className="w-4 h-4 mr-2" /> Brand</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !formData.brand && "text-muted-foreground"
                            )}
                          >
                            {formData.brand
                              ? brandOptions.find(
                                (brand) => brand.value === formData.brand
                              )?.label
                              : "Select a brand"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search brand..." />
                            <CommandEmpty>No brand found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-40">
                                {brandOptions.map((brand) => (
                                  <CommandItem
                                    value={brand.label}
                                    key={brand.value}
                                    onSelect={() => {
                                      setFormData(prev => ({ ...prev, brand: brand.value }));
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        brand.value === formData.brand
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {brand.label}
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="tags" className="font-semibold text-sm mb-2 text-purple-700 flex items-center"><Tag className="w-4 h-4 mr-2" /> Tags</Label>
                      <Input
                        id="tags"
                        value={(formData.tags || []).join(', ')}
                        onChange={handleTagsChange}
                        placeholder="e.g. bestseller, new, featured"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate tags with commas.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t bg-white rounded-b-xl">
              <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
              <Button type="submit" size="lg">{isNewProduct ? "Create Product" : "Save Changes"}</Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      <MediaLibraryModal 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)} 
        onSelectImage={handleImageSelect} 
        uploadPath="products"
      />
    </AnimatePresence>
  );
};

const defaultVisibleColumns = {
  image: true,
  name: true,
  source: true,
  status: true,
  stock: true,
  price: true,
  category: true,
  date: true,
  actions: true,
};

const AdminProducts = ({ navigateTo }) => {
  const { products, formatPrice, addMultipleProducts, updateMultipleProducts, deleteProducts, categories } = useProducts();
  const { connectedStores = [], syncPages } = useIntegrations();
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [isImporting, setIsImporting] = useState(false);
  
  // Table Configuration & Pagination State
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const productCounts = useMemo(() => ({
    all: products.length,
    published: products.filter(p => p.status === 'published').length,
    draft: products.filter(p => p.status === 'draft').length,
    inStock: products.filter(p => p.inStock || p.stockStatus === 'instock').length,
    outOfStock: products.filter(p => !p.inStock && p.stockStatus !== 'instock').length,
  }), [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(lowerQuery) ||
        (p.sku && p.sku.toLowerCase().includes(lowerQuery)) ||
        (p.categories && p.categories.some(c => c.toLowerCase().includes(lowerQuery))) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(lowerQuery)))
      );
    }

    if (activeFilter !== 'all') {
      if (activeFilter === 'published') filtered = filtered.filter(p => p.status === 'published');
      if (activeFilter === 'draft') filtered = filtered.filter(p => p.status === 'draft');
      if (activeFilter === 'inStock') filtered = filtered.filter(p => p.inStock || p.stockStatus === 'instock');
      if (activeFilter === 'outOfStock') filtered = filtered.filter(p => !p.inStock && p.stockStatus !== 'instock');
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.categories && p.categories.includes(categoryFilter));
    }

    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchQuery, activeFilter, categoryFilter, sortConfig]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter, categoryFilter, sortConfig, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, id]);
    } else {
      setSelectedProducts(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleAddImportedProducts = (importedProducts) => {
    const newProducts = importedProducts.map(p => ({
      ...p,
      id: `prod_${Date.now()}_${Math.random()}`,
      price: parseFloat(p.price) || 0,
      originalPrice: parseFloat(p.originalPrice) || 0,
      inStock: p.inStock === 'TRUE' || p.inStock === true,
      images: typeof p.images === 'string' ? p.images.split('|') : [],
      categories: typeof p.categories === 'string' ? p.categories.split('|') : [],
      tags: typeof p.tags === 'string' ? p.tags.split('|') : [],
      features: typeof p.features === 'string' ? p.features.split('|') : [],
    }));
    addMultipleProducts(newProducts);
  };

  const handleBulkAction = (action) => {
    if (selectedProducts.length === 0) {
      toast({ variant: 'destructive', title: 'No products selected' });
      return;
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'publish':
        updateData = { status: 'published' };
        message = 'published';
        break;
      case 'draft':
        updateData = { status: 'draft' };
        message = 'moved to drafts';
        break;
      case 'instock':
        updateData = { inStock: true, stockStatus: 'instock' };
        message = 'marked as in stock';
        break;
      case 'outofstock':
        updateData = { inStock: false, stockStatus: 'outofstock' };
        message = 'marked as out of stock';
        break;
      default:
        toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" });
        return;
    }

    updateMultipleProducts(selectedProducts, updateData);
    toast({ title: `${selectedProducts.length} products ${message}.` });
    setSelectedProducts([]);
  };

  const handleBulkDelete = () => {
    deleteProducts(selectedProducts);
    toast({ title: `${selectedProducts.length} products deleted.` });
    setSelectedProducts([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleAddNew = () => {
    setEditingProduct({
      name: '', price: '', originalPrice: '', categories: [], brand: '', tags: [], features: [], shortDescription: '',
      description: '', inStock: true, stockStatus: 'instock', status: 'published', slug: '', images: [''],
      dateAdded: new Date().toISOString(),
    });
  };

  const handleSave = (savedProduct) => {
    toast({
      title: `Product ${savedProduct.id ? 'Updated' : 'Added'}! 🎉`,
      description: `${savedProduct.name} has been successfully saved.`,
    });
  };

  const handleExportAll = () => {
    downloadCsv(products, 'products.csv');
    toast({ title: "Products exported successfully!" });
  }

  const handleExportSelected = () => {
    if (selectedProducts.length === 0) return;

    const productsToExport = products
      .filter(p => selectedProducts.includes(p.id))
      .map(p => ({
        ...p,
        productUrl: `${window.location.origin}/product/${encodeURIComponent(p.slug || p.id)}`
      }));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `selected-products-${timestamp}`;

    try {
      if (exportFormat === 'csv') {
        downloadCsv(productsToExport, `${filename}.csv`);
      } else if (exportFormat === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(productsToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${filename}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } else if (exportFormat === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(productsToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      }

      toast({ title: `${productsToExport.length} products exported successfully! ✨` });
      setSelectedProducts([]);
    } catch (error) {
      console.error("Export error:", error);
      toast({ variant: "destructive", title: "Export Failed", description: error.message });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast({ variant: "destructive", title: "No file selected", description: "Please choose a CSV file to import." });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        handleAddImportedProducts(results.data);
        toast({ title: "Products imported successfully! ✨", description: `${results.data.length} products added.` });
      },
      error: (error) => {
        toast({ variant: "destructive", title: "Import Failed", description: `Error parsing CSV: ${error.message}` });
      }
    });
    event.target.value = null;
  };

  const handleImportWooCommerce = async () => {
    if (!connectedStores || connectedStores.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No WooCommerce Store Connected',
        description: 'Please connect a WooCommerce store first in Integrations.',
      });
      return;
    }

    setIsImporting(true);
    let totalImported = 0;
    let totalPagesImported = 0;

    try {
      for (const store of connectedStores) {
        if (store.type !== 'woocommerce') continue;

        toast({
          title: 'Importing Products...',
          description: `Fetching products from ${store.name}`,
        });

        const wcProducts = await fetchWooCommerceProducts(
          store.storeUrl,
          store.consumerKey,
          store.consumerSecret
        );

        const existingProducts = await getAllDocuments('products');
        const existingWcIds = new Set(existingProducts.filter(p => p.wc_id).map(p => p.wc_id));

        const newProducts = wcProducts
          .filter(wcProduct => !existingWcIds.has(wcProduct.id))
          .map(wcProduct => transformWooCommerceProduct(wcProduct, store.id, store.name));

        if (newProducts.length > 0) {
          addMultipleProducts(newProducts);
          totalImported += newProducts.length;
        }

        toast({
          title: 'Importing Pages...',
          description: `Fetching pages from ${store.name}`,
        });

        const wcPages = await fetchWooCommercePages(
          store.storeUrl,
          store.consumerKey,
          store.consumerSecret
        );

        const transformedPages = wcPages.map(wcPage =>
          transformWooCommercePage(wcPage, store.id, store.name)
        );

        if (transformedPages.length > 0) {
          await syncPages(store.id, transformedPages);
          totalPagesImported += transformedPages.length;
        }
      }

      toast({
        title: 'Import Complete! 🎉',
        description: `Successfully imported ${totalImported} products and ${totalPagesImported} pages.`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || 'Failed to import from WooCommerce.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleColumnToggle = (colKey) => setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }));

  const resetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setCategoryFilter('all');
    setSortConfig({ key: 'dateAdded', direction: 'desc' });
    setVisibleColumns(defaultVisibleColumns);
    setItemsPerPage(50);
    setCurrentPage(1);
    setSelectedProducts([]);
  };

  const isAllSelected = selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
          <Button variant="outline" onClick={handleImportClick}><FileUp className="mr-2 h-4 w-4" /> Import CSV</Button>
          <Button variant="outline" onClick={handleExportAll}><FileDown className="mr-2 h-4 w-4" /> Export All</Button>

          <div className="flex items-center gap-2 border-l pl-2 ml-1">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[90px] h-10">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExportSelected}
              disabled={selectedProducts.length === 0}
              className={selectedProducts.length === 0 ? "opacity-50 cursor-not-allowed" : "border-purple-200 hover:bg-purple-50 hover:text-purple-700"}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Selected
            </Button>
          </div>

          <Button
            onClick={handleImportWooCommerce}
            disabled={isImporting || !connectedStores || connectedStores.length === 0}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import WooCommerce'}
          </Button>
          <Button onClick={handleAddNew} className="bg-purple-600 hover:bg-purple-700"><Plus className="mr-2 h-4 w-4" /> Add New Product</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b pb-2">
        {Object.entries({ all: 'All', published: 'Published', draft: 'Draft', inStock: 'In Stock', outOfStock: 'Out of Stock' }).map(([key, label]) => (
          <button key={key} onClick={() => setActiveFilter(key)} className={`px-3 py-1 text-sm rounded-md transition-colors ${activeFilter === key ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            {label} <span className="text-xs bg-gray-200 rounded-full px-1.5 py-0.5 ml-1">{productCounts[key]}</span>
          </button>
        ))}
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4 justify-between bg-gray-50/40 rounded-lg p-2">
            <div className="flex flex-wrap items-center gap-3 flex-grow">
              <div className="relative flex-grow max-w-md shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by name, SKU, category, tag..." className="pl-10 h-10 bg-white border-gray-200" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-white border-gray-200"><SelectValue placeholder="Filter by category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 bg-white border-gray-200">
                    <Settings2 className="mr-2 h-4 w-4" /> Screen Options
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Columns Visibility</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(defaultVisibleColumns).map((col) => (
                          <div key={col} className="flex items-center space-x-2">
                            <Checkbox id={`col-${col}`} checked={visibleColumns[col]} onCheckedChange={() => handleColumnToggle(col)} />
                            <label htmlFor={`col-${col}`} className="text-sm capitalize leading-none cursor-pointer">
                              {col.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="font-medium text-sm">Pagination</h4>
                      <div className="flex items-center gap-3">
                        <label className="text-sm">Items per page:</label>
                        <Input type="number" min="1" max="500" className="w-20 h-8" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value) || 50)} />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" onClick={resetFilters} className="h-10 text-muted-foreground hover:text-foreground hover:bg-gray-200">
                <FilterX className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {selectedProducts.length > 0 && (
                <div className="bg-purple-100 text-purple-800 text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                  {selectedProducts.length} product(s) selected
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={selectedProducts.length === 0} className="h-10 bg-white border-gray-200">Bulk Actions <ChevronsUpDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleBulkAction('publish')}>Publish Selected</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('draft')}>Move to Draft</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('instock')}>Mark as In-Stock</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('outofstock')}>Mark as Out-of-Stock</DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 cursor-pointer">Delete Selected</DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedProducts.length} products. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-200">
            <table className="w-full text-left table-fixed min-w-[1000px] text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b">
                <tr>
                  <th className="p-4 w-12 text-center align-middle">
                    <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} className="border-gray-400" />
                  </th>
                  {visibleColumns.image && <th className="px-4 py-3 font-semibold w-20 text-center">Image</th>}
                  {visibleColumns.name && <th className="px-4 py-3 font-semibold cursor-pointer w-64 group" onClick={() => handleSort('name')}>Name <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50 group-hover:opacity-100" /></th>}
                  {visibleColumns.source && <th className="px-4 py-3 font-semibold w-32">Source</th>}
                  {visibleColumns.status && <th className="px-4 py-3 font-semibold w-28">Status</th>}
                  {visibleColumns.stock && <th className="px-4 py-3 font-semibold w-28">Stock</th>}
                  {visibleColumns.price && <th className="px-4 py-3 font-semibold cursor-pointer w-28 group" onClick={() => handleSort('price')}>Price <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50 group-hover:opacity-100" /></th>}
                  {visibleColumns.category && <th className="px-4 py-3 font-semibold w-40">Category</th>}
                  {visibleColumns.date && <th className="px-4 py-3 font-semibold cursor-pointer w-32 group" onClick={() => handleSort('dateAdded')}>Date <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50 group-hover:opacity-100" /></th>}
                  {visibleColumns.actions && <th className="px-4 py-3 font-semibold text-right w-24">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                    <tr key={product.id} className={cn("transition-colors group", isSelected ? "bg-purple-50 hover:bg-purple-100/80" : "hover:bg-gray-50")}>
                      <td className="px-4 py-3 text-center align-middle">
                        <Checkbox onCheckedChange={(checked) => handleSelectProduct(product.id, checked)} checked={isSelected} className="border-gray-300" />
                      </td>
                      {visibleColumns.image && (
                        <td className="px-4 py-3 text-center align-middle">
                          <button onClick={() => navigateTo('product-detail', { product })} className="mx-auto block">
                            <img alt={product.name} className="w-10 h-10 rounded-md object-cover border border-gray-200 cursor-pointer shadow-sm hover:shadow transition-shadow" src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1572635196237-14b3f281503f'} />
                          </button>
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-4 py-3 align-middle font-medium text-gray-900 truncate">
                          {product.name}
                          {product.sku && <div className="text-xs text-gray-500 font-normal mt-0.5">SKU: {product.sku}</div>}
                        </td>
                      )}
                      {visibleColumns.source && (
                        <td className="px-4 py-3 align-middle text-gray-600 truncate">
                          <div className="flex items-center gap-1.5 text-xs">
                            {product.sourceStoreName && product.sourceStoreName !== 'Local Store' ? <Globe className="h-3.5 w-3.5 text-blue-500" /> : <Settings2 className="h-3.5 w-3.5 text-gray-400" />}
                            <span>{product.sourceStoreName || 'Local Store'}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-4 py-3 align-middle">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${product.status === 'published' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{product.status || 'published'}</span>
                        </td>
                      )}
                      {visibleColumns.stock && (
                        <td className="px-4 py-3 align-middle">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.inStock || product.stockStatus === 'instock' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{product.inStock || product.stockStatus === 'instock' ? 'In Stock' : 'Out of Stock'}</span>
                        </td>
                      )}
                      {visibleColumns.price && <td className="px-4 py-3 align-middle text-gray-900 font-medium">{formatPrice(product.price)}</td>}
                      {visibleColumns.category && <td className="px-4 py-3 align-middle text-gray-600 capitalize text-xs truncate">{Array.isArray(product.categories) ? product.categories.join(', ') : '-'}</td>}
                      {visibleColumns.date && <td className="px-4 py-3 align-middle text-gray-500 text-xs">{product.dateAdded ? new Date(product.dateAdded).toLocaleDateString() : 'N/A'}</td>}
                      {visibleColumns.actions && (
                        <td className="px-4 py-3 align-middle text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="h-8 px-2 text-gray-500 hover:bg-purple-50 hover:text-purple-700 border border-transparent hover:border-purple-200 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100">
                            <Edit className="h-4 w-4 mr-1.5" /> Edit
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-500 bg-gray-50/50">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">No products found</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your search query or filters to find what you're looking for.</p>
                        {(searchQuery || activeFilter !== 'all' || categoryFilter !== 'all') && (
                          <Button variant="outline" size="sm" className="mt-4 border-gray-200" onClick={resetFilters}>Clear All Filters</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white text-sm mt-4">
              <div className="text-gray-500">
                Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}</span> of <span className="font-semibold text-gray-900">{filteredAndSortedProducts.length}</span> products
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 border-gray-200"><ChevronLeft className="h-4 w-4" /></Button>
                <div className="px-3 h-8 flex items-center bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </div>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 border-gray-200"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {editingProduct && (
        <ProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminProducts;
