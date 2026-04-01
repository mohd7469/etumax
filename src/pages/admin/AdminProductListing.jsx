
import React, { useState, useEffect, useCallback } from 'react';
import { useDesign } from '@/context/DesignContext';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Image as ImageIcon, Plus, Minus, Trash, Save, Eye, LayoutGrid, Star, ShoppingBag, Database, GripVertical, X, Search } from 'lucide-react';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';
import { MultiSelect } from '@/components/ui/multi-select';
import ProductListingPage from '@/pages/ProductListingPage';
import ProductCard from '@/components/products/ProductCard';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableProductItem = ({ id, product, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-2 bg-white border rounded shadow-sm mb-2 group">
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={16} />
      </div>
      <img src={product?.mainImage || product?.image || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 object-cover rounded" />
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium truncate text-gray-900">{product?.name || 'Unknown Product'}</p>
        <p className="text-xs text-gray-500">{product?.sku ? `SKU: ${product.sku}` : 'No SKU'} • ${product?.price || 0}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={16} className="text-red-500" />
      </Button>
    </div>
  );
};

const AdminProductListing = () => {
  const { productListingSettings, saveProductListingSettings, productGridLayout, productListingLayout, saveProductListingLayout } = useDesign();
  const { products } = useProducts();

  const defaultSettings = {
    topBanner: { enabled: false, slides: [], height: 300, delay: 5 },
    featuredProducts: { enabled: false, productIds: [], delay: 5, columns: 4, visibleProducts: 8, showSaleTimer: false },
    categorySection: { bannerEnabled: false, bannerImage: '' },
    showTopCategories: true,
    showSidebarPriceRange: true,
    showSidebarCategories: true,
    productSource: 'all',
    selectedProductIds: [],
    hideOutOfStock: false,
    filtersEnabled: true,
    sortingEnabled: true,
    pinSelectedProductsFirst: false,
    randomProductsCount: 12,
    refreshRandomOnLoad: false
  };

  const [localSettings, setLocalSettings] = useState(defaultSettings);
  const [localColumnsPerRow, setLocalColumnsPerRow] = useState(productListingLayout?.columnsPerRow || 4);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaModalCallback, setMediaModalCallback] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (productListingSettings) {
      setLocalSettings(prev => ({
        ...defaultSettings,
        ...productListingSettings,
        topBanner: { ...defaultSettings.topBanner, ...(productListingSettings.topBanner || {}) },
        featuredProducts: { ...defaultSettings.featuredProducts, ...(productListingSettings.featuredProducts || {}) },
        categorySection: { ...defaultSettings.categorySection, ...(productListingSettings.categorySection || {}) },
        showTopCategories: productListingSettings.showTopCategories !== false,
        showSidebarPriceRange: productListingSettings.showSidebarPriceRange !== false,
        showSidebarCategories: productListingSettings.showSidebarCategories !== false,
        filtersEnabled: productListingSettings.filtersEnabled !== false,
        sortingEnabled: productListingSettings.sortingEnabled !== false,
        selectedProductIds: productListingSettings.selectedProductIds || []
      }));
    }
  }, [productListingSettings]);

  useEffect(() => {
    if (productListingLayout && productListingLayout.columnsPerRow) {
      setLocalColumnsPerRow(productListingLayout.columnsPerRow);
    }
  }, [productListingLayout]);

  const handleUpdate = (section, key, value) => {
    setLocalSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleRootUpdate = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleColumnsChange = (val) => {
    const newValue = Math.min(Math.max(val, 1), 6);
    setLocalColumnsPerRow(newValue);
    saveProductListingLayout({ columnsPerRow: newValue });
  };

  const handleBannerSlideChange = (index, key, value) => {
    const currentSlides = localSettings.topBanner?.slides || [];
    const newSlides = [...currentSlides];
    if (newSlides[index]) {
      newSlides[index] = { ...newSlides[index], [key]: value };
      handleUpdate('topBanner', 'slides', newSlides);
    }
  };

  const addBannerSlide = () => {
    const newSlide = { id: `slide_${Date.now()}`, image: '' };
    handleUpdate('topBanner', 'slides', [...(localSettings.topBanner?.slides || []), newSlide]);
  };

  const removeBannerSlide = (index) => {
    handleUpdate('topBanner', 'slides', (localSettings.topBanner?.slides || []).filter((_, i) => i !== index));
  };

  const openMediaModal = (callback) => {
    setMediaModalCallback(() => callback);
    setIsMediaModalOpen(true);
  };

  const handlePublish = () => {
    saveProductListingSettings(localSettings);
    toast({ title: 'Success!', description: 'Product Listing page settings saved.' });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = localSettings.selectedProductIds.indexOf(active.id);
      const newIndex = localSettings.selectedProductIds.indexOf(over.id);
      handleRootUpdate('selectedProductIds', arrayMove(localSettings.selectedProductIds, oldIndex, newIndex));
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const productOptions = safeProducts.map(p => ({ value: p.id, label: p.name }));
  
  const searchResults = safeProducts.filter(p => 
    !localSettings.selectedProductIds.includes(p.id) && 
    (productSearchQuery === '' || 
     p.name?.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
     p.sku?.toLowerCase().includes(productSearchQuery.toLowerCase()))
  ).slice(0, 8);

  const selectedProductsData = localSettings.selectedProductIds
    .map(id => safeProducts.find(p => p.id === id))
    .filter(Boolean);

  if (!localSettings) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Listing Page</h1>
          <p className="text-sm text-gray-500">Configure layout, sources, and features of your main shop page.</p>
        </div>
        <Button onClick={handlePublish} size="lg"><Save className="mr-2 h-4 w-4" /> Save Settings</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 max-h-[80vh] overflow-y-auto pr-2 pb-20">
          
          {/* PRODUCT SOURCE CARD */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-primary"><Database className="w-5 h-5" /> Product Source</CardTitle>
              <CardDescription>Control which products populate the grid.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label>Source Mode</Label>
                <Select value={localSettings.productSource} onValueChange={(v) => handleRootUpdate('productSource', v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products (Default)</SelectItem>
                    <SelectItem value="selected">Manually Selected Products</SelectItem>
                    <SelectItem value="category">Current Category</SelectItem>
                    <SelectItem value="featured">Featured Products Only</SelectItem>
                    <SelectItem value="latest">Latest Additions</SelectItem>
                    <SelectItem value="bestSelling">Best Selling</SelectItem>
                    <SelectItem value="onSale">On Sale / Discounted</SelectItem>
                    <SelectItem value="random">Random Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {localSettings.productSource === 'random' && (
                <div className="space-y-4 pt-4 border-t border-dashed">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Random Products Count</Label>
                    <Input 
                      type="number" 
                      min="1" max="100" 
                      className="w-24 text-center" 
                      value={localSettings.randomProductsCount || 12}
                      onChange={(e) => handleRootUpdate('randomProductsCount', parseInt(e.target.value) || 12)}
                    />
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="flex flex-col">
                      <Label className="text-sm">Refresh order on load</Label>
                      <span className="text-[10px] text-gray-500">Randomize on every page visit</span>
                    </div>
                    <Switch 
                      checked={localSettings.refreshRandomOnLoad || false} 
                      onCheckedChange={(val) => handleRootUpdate('refreshRandomOnLoad', val)} 
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Hide Out of Stock</Label>
                  <Switch checked={localSettings.hideOutOfStock} onCheckedChange={(val) => handleRootUpdate('hideOutOfStock', val)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable Filters</Label>
                  <Switch checked={localSettings.filtersEnabled} onCheckedChange={(val) => handleRootUpdate('filtersEnabled', val)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable Sorting</Label>
                  <Switch checked={localSettings.sortingEnabled} onCheckedChange={(val) => handleRootUpdate('sortingEnabled', val)} />
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex flex-col">
                    <Label className="text-sm">Pin Selected First</Label>
                    <span className="text-[10px] text-gray-500">Always show selected products at top</span>
                  </div>
                  <Switch checked={localSettings.pinSelectedProductsFirst} onCheckedChange={(val) => handleRootUpdate('pinSelectedProductsFirst', val)} />
                </div>
              </div>

              {(localSettings.productSource === 'selected' || localSettings.pinSelectedProductsFirst) && (
                <div className="space-y-4 pt-4 border-t border-dashed">
                  <div className="flex items-center justify-between">
                    <Label className="text-primary font-semibold">Manage Selected Products</Label>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{localSettings.selectedProductIds.length} items</span>
                  </div>
                  
                  {localSettings.productSource === 'selected' && localSettings.selectedProductIds.length === 0 && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                      Warning: Source is set to "Selected" but no products are chosen. The page will be empty.
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search by name or SKU..." 
                      className="pl-9 text-sm"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                    />
                  </div>

                  {productSearchQuery && searchResults.length > 0 && (
                    <div className="border rounded-md shadow-sm bg-gray-50 p-2 max-h-48 overflow-y-auto space-y-1">
                      {searchResults.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img src={p.mainImage || p.image || 'https://via.placeholder.com/30'} className="w-8 h-8 rounded object-cover" alt="" />
                            <div className="truncate">
                              <p className="text-xs font-medium truncate">{p.name}</p>
                              <p className="text-[10px] text-gray-500">{p.sku || 'No SKU'}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="secondary" className="h-7 text-xs px-2" onClick={() => {
                            handleRootUpdate('selectedProductIds', [...localSettings.selectedProductIds, p.id]);
                            setProductSearchQuery('');
                          }}>Add</Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {productSearchQuery && searchResults.length === 0 && (
                     <p className="text-xs text-center text-gray-500">No products found.</p>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg border min-h-[100px] max-h-80 overflow-y-auto">
                    {localSettings.selectedProductIds.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400 py-8">
                        No products selected
                      </div>
                    ) : (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={localSettings.selectedProductIds} strategy={verticalListSortingStrategy}>
                          {selectedProductsData.map((product) => (
                            <SortableProductItem 
                              key={product.id} 
                              id={product.id} 
                              product={product} 
                              onRemove={(id) => handleRootUpdate('selectedProductIds', localSettings.selectedProductIds.filter(pid => pid !== id))} 
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Visibility Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Top Categories Slider</Label>
                <Switch checked={localSettings.showTopCategories} onCheckedChange={(val) => handleRootUpdate('showTopCategories', val)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Sidebar Price Range</Label>
                <Switch checked={localSettings.showSidebarPriceRange} onCheckedChange={(val) => handleRootUpdate('showSidebarPriceRange', val)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Sidebar Categories</Label>
                <Switch checked={localSettings.showSidebarCategories} onCheckedChange={(val) => handleRootUpdate('showSidebarCategories', val)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LayoutGrid className="w-5 h-5" /> Products Per Row</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => handleColumnsChange(localColumnsPerRow - 1)} disabled={localColumnsPerRow <= 1}><Minus className="h-4 w-4" /></Button>
                <Input type="number" value={localColumnsPerRow} readOnly className="w-16 text-center font-bold" />
                <Button variant="outline" size="icon" onClick={() => handleColumnsChange(localColumnsPerRow + 1)} disabled={localColumnsPerRow >= 6}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Top Banner</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Top Banner</Label>
                <Switch checked={localSettings.topBanner?.enabled || false} onCheckedChange={(val) => handleUpdate('topBanner', 'enabled', val)} />
              </div>
              {localSettings.topBanner?.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Slides</Label>
                    <div className="space-y-2">
                      {(localSettings.topBanner?.slides || []).map((slide, index) => (
                        <div key={slide.id || index} className="flex items-center gap-2 p-2 border rounded">
                          <img src={slide.image || 'https://via.placeholder.com/40'} alt="slide" className="w-10 h-10 object-cover rounded" />
                          <Button variant="outline" size="sm" onClick={() => openMediaModal((url) => handleBannerSlideChange(index, 'image', url))}>Change</Button>
                          <Button variant="destructive" size="icon" onClick={() => removeBannerSlide(index)}><Trash className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-2 w-full" onClick={addBannerSlide}><Plus className="mr-2 h-4 w-4" /> Add Slide</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5" /> Featured Products</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Featured Carousel</Label>
                <Switch checked={localSettings.featuredProducts?.enabled || false} onCheckedChange={(val) => handleUpdate('featuredProducts', 'enabled', val)} />
              </div>
              {localSettings.featuredProducts?.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Select Products</Label>
                    <MultiSelect
                      options={productOptions}
                      selected={localSettings.featuredProducts?.productIds || []}
                      onChange={(selected) => handleUpdate('featuredProducts', 'productIds', selected)}
                      placeholder="Select products..."
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Sale Time Counter</Label>
                    <Switch checked={localSettings.featuredProducts?.showSaleTimer || false} onCheckedChange={(val) => handleUpdate('featuredProducts', 'showSaleTimer', val)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>Changes apply instantly in preview.</CardDescription>
            </CardHeader>
            <CardContent className="bg-gray-100 p-0 sm:p-4 rounded-lg border max-h-[80vh] overflow-y-auto">
              <div className="pointer-events-none sm:pointer-events-auto">
                <ProductListingPage 
                  isPreview={true} 
                  previewGridSettings={productGridLayout} 
                  previewListingSettings={localSettings} 
                  previewListingLayout={{ columnsPerRow: localColumnsPerRow }} 
                  navigateTo={() => {}}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={(url) => {
          if (mediaModalCallback) mediaModalCallback(url);
          setIsMediaModalOpen(false);
        }}
      />
    </div>
  );
};

export default AdminProductListing;
