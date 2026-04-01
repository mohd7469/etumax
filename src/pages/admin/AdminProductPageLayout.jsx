
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, RefreshCw, Eye, EyeOff, Settings, GripVertical, AlignLeft, AlignCenter, AlignRight, Columns, Layout, HelpCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDesign } from '@/context/DesignContext';
import ProductDetailPage from '@/pages/ProductDetailPage';
import { useProducts } from '@/context/ProductContext';
import { useCoupon } from '@/context/CouponContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const ElementSettingsEditor = ({ element, onSave, onCancel }) => {
  const [localSettings, setLocalSettings] = useState(element.settings || {});

  useEffect(() => {
    setLocalSettings(element.settings || {});
  }, [element]);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onCancel}>
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>Editing: {element.name}</CardTitle>
          <CardDescription>Configure display settings for this element</CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-4">
            {localSettings.align !== undefined && (
              <div className="space-y-2">
                <Label>Alignment</Label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map(align => (
                    <Button key={align} variant={localSettings.align === align ? 'default' : 'outline'} size="icon" onClick={() => handleSettingChange('align', align)}>
                      {align === 'left' && <AlignLeft className="h-4 w-4" />}
                      {align === 'center' && <AlignCenter className="h-4 w-4" />}
                      {align === 'right' && <AlignRight className="h-4 w-4" />}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {localSettings.fontSize !== undefined && (
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Input value={localSettings.fontSize} onChange={e => handleSettingChange('fontSize', e.target.value)} placeholder="e.g., 1.25rem or 20px" />
              </div>
            )}
            {localSettings.color !== undefined && (
              <div className="space-y-2">
                <Label>Color (Hex)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={localSettings.color} 
                    onChange={e => handleSettingChange('color', e.target.value)} 
                    className="flex-1 font-mono uppercase" 
                    placeholder="#000000"
                  />
                  <Input 
                    type="color" 
                    value={localSettings.color} 
                    onChange={e => handleSettingChange('color', e.target.value)} 
                    className="w-10 h-10 p-1 cursor-pointer rounded-md border-gray-300" 
                  />
                </div>
                <p className="text-[10px] text-gray-500">Pick a color to instantly update the price display.</p>
              </div>
            )}
            {localSettings.size !== undefined && (
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={localSettings.size} onValueChange={v => handleSettingChange('size', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {localSettings.defaultValue !== undefined && (
              <div className="space-y-2">
                <Label>Default Value</Label>
                <Input type="number" min="1" value={localSettings.defaultValue} onChange={e => handleSettingChange('defaultValue', parseInt(e.target.value) || 1)} />
              </div>
            )}
            {localSettings.limit !== undefined && (
              <div className="space-y-2">
                <Label>Number of Items</Label>
                <Input type="number" min="1" max="20" value={localSettings.limit} onChange={e => handleSettingChange('limit', parseInt(e.target.value) || 4)} />
              </div>
            )}
            {localSettings.columns !== undefined && (
              <div className="space-y-2">
                <Label>Columns</Label>
                <Input type="number" min="1" max="6" value={localSettings.columns} onChange={e => handleSettingChange('columns', parseInt(e.target.value) || 4)} />
              </div>
            )}
          </CardContent>
        </ScrollArea>
        <div className="p-6 pt-0 flex justify-end gap-2 border-t">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(localSettings)}>Apply Settings</Button>
        </div>
      </Card>
    </motion.div>
  );
};

const AdminProductPageLayout = () => {
  const { toast } = useToast();
  const {
    productPageLayout, saveProductPageLayout, resetProductPageLayout,
    productPageDesign, saveProductPageDesign, initialProductPageDesign,
    bundleSettings, saveBundleSettings, initialProductPageLayout
  } = useDesign();
  const { products, categories, formatPrice } = useProducts();
  const { coupons } = useCoupon();
  const [layout, setLayout] = useState([]);
  const [design, setDesign] = useState(productPageDesign);
  const [bundleState, setBundleState] = useState(bundleSettings);
  const [editingElement, setEditingElement] = useState(null);

  useEffect(() => {
    // Ensure all elements from initialProductPageLayout are present, even if missing from saved state
    if (productPageLayout && initialProductPageLayout) {
      const mergedLayout = [...productPageLayout];
      const existingIds = mergedLayout.map(item => item.id);

      initialProductPageLayout.forEach(defaultItem => {
        if (!existingIds.includes(defaultItem.id)) {
          mergedLayout.push(defaultItem);
        }
      });

      setLayout(mergedLayout);
    } else {
      setLayout(productPageLayout || []);
    }
  }, [productPageLayout, initialProductPageLayout]);

  useEffect(() => {
    setDesign(productPageDesign);
  }, [productPageDesign]);

  useEffect(() => {
    setBundleState(bundleSettings);
  }, [bundleSettings]);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLayout(items);
  };

  const toggleVisibility = (id) => {
    setLayout(layout.map(el => el.id === id ? { ...el, visible: !el.visible } : el));
  };

  const handleSaveSettings = (settings) => {
    setLayout(layout.map(el => el.id === editingElement.id ? { ...el, settings: settings } : el));
    setEditingElement(null);
    toast({ title: 'Element settings applied to preview.', description: 'Click "Publish" to save changes live.' });
  };

  const handlePublish = () => {
    saveProductPageLayout(layout);
    saveProductPageDesign(design);
    saveBundleSettings(bundleState);
    toast({ title: 'Published! ✨', description: 'Product page layout has been updated live.' });
  };

  const handleReset = () => {
    const defaultLayout = resetProductPageLayout();
    setLayout(defaultLayout);
    saveProductPageDesign(initialProductPageDesign);
    setDesign(initialProductPageDesign);
    toast({ title: 'Layout Reset!', description: 'Product page layout has been reset to default.' });
  };

  const handleDesignChange = (key, value) => {
    setDesign(prev => ({ ...prev, [key]: value }));
  };

  const handleSidebarChange = (key, value) => {
    handleDesignChange('sidebar', { ...design.sidebar, [key]: value });
  };

  const handleColumnWidthChange = (values) => {
    const [gallery, info] = values;
    const sidebar = 100 - gallery - info;
    handleDesignChange('columnWidths', { gallery, info, sidebar });
  };

  const handleBundleChange = (key, value) => {
    setBundleState(prev => ({ ...prev, [key]: value }));
  };

  const toggleManualProduct = (productId) => {
    setBundleState(prev => {
      const currentIds = prev.manualProductIds || [];
      if (currentIds.includes(productId)) {
        return { ...prev, manualProductIds: currentIds.filter(id => id !== productId) };
      } else {
        return { ...prev, manualProductIds: [...currentIds, productId] };
      }
    });
  };

  const mockProduct = products[0] || {
    id: 'preview-1',
    name: 'Sample Product Title',
    price: 210.00,
    originalPrice: 290.00,
    description: 'This is a sample product description to showcase the layout. You can edit this text in the product settings.',
    short_description: 'A brief, catchy summary of your awesome product goes here.',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop'],
    rating: 4.5,
    reviewCount: 120,
    inStock: true,
    sku: 'SMPL-PRD-01',
    categories: ['Sample', 'Preview'],
    tags: ['tag1', 'tag2'],
    options: [],
    features: ['Feature A', 'Feature B'],
  };

  const mockNavigate = (path, data) => toast({ title: `Preview navigating to: ${path}`, description: data ? JSON.stringify(data) : '' });

  const selectedCoupon = bundleState.bundleCouponId
    ? coupons.find(c => c.id === bundleState.bundleCouponId)
    : null;

  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">

            {/* Product Page Design */}
            <Card>
              <CardHeader>
                <CardTitle>Page Design</CardTitle>
                <CardDescription>Configure the overall look of the product page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Layout Style</Label>
                  <Select value={design.layout} onValueChange={v => handleDesignChange('layout', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stacked"><Layout className="w-4 h-4 inline-block mr-2" />Stacked (2 Columns)</SelectItem>
                      <SelectItem value="three-column"><Columns className="w-4 h-4 inline-block mr-2" />3 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {design.layout === 'three-column' && (
                  <>
                    <div className="space-y-4">
                      <Label>Column Widths</Label>
                      <Slider
                        value={[design.columnWidths.gallery, design.columnWidths.gallery + design.columnWidths.info]}
                        onValueChange={handleColumnWidthChange}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Gallery: {design.columnWidths.gallery}%</span>
                        <span>Info: {design.columnWidths.info}%</span>
                        <span>Sidebar: {design.columnWidths.sidebar}%</span>
                      </div>
                    </div>
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-sidebar">Show Sidebar</Label>
                        <Switch id="show-sidebar" checked={design.sidebar.show} onCheckedChange={v => handleSidebarChange('show', v)} />
                      </div>
                      {design.sidebar.show && (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label>Sidebar Title</Label>
                            <Input value={design.sidebar.title} onChange={e => handleSidebarChange('title', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Products to Show</Label>
                            <Input type="number" value={design.sidebar.limit} onChange={e => handleSidebarChange('limit', parseInt(e.target.value))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Columns</Label>
                            <Input type="number" min="1" max="2" value={design.sidebar.columns} onChange={e => handleSidebarChange('columns', parseInt(e.target.value))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Product Source</Label>
                            <Select value={design.sidebar.category} onValueChange={v => handleSidebarChange('category', v)}>
                              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="related">Related to Current Product</SelectItem>
                                <SelectItem value="all">All Products</SelectItem>
                                {categories.filter(c => c.slug !== 'all').map(cat => (
                                  <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="show-random">Show Random Products</Label>
                              <Tooltip>
                                <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                                <TooltipContent>Overrides the Product Source setting to show random products.</TooltipContent>
                              </Tooltip>
                            </div>
                            <Switch id="show-random" checked={design.sidebar.showRandom} onCheckedChange={v => handleSidebarChange('showRandom', v)} />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Frequently Bought Together Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Bought Together</CardTitle>
                <CardDescription>Configure bundle deals and upsells on product pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-bundle">Enable Bundle Section</Label>
                  <Switch id="enable-bundle" checked={bundleState.enabled} onCheckedChange={v => handleBundleChange('enabled', v)} />
                </div>

                {bundleState.enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Discount Percentage (%)</Label>
                      <Input
                        type="number"
                        min="0" max="100"
                        value={bundleState.discountPercentage || 0}
                        onChange={e => handleBundleChange('discountPercentage', parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">General discount applied to the total bundle price.</p>
                    </div>

                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-bundle-coupon" className="font-semibold text-primary">Apply Coupon to Bundle</Label>
                        <Switch
                          id="enable-bundle-coupon"
                          checked={bundleState.bundleCouponEnabled || false}
                          onCheckedChange={v => handleBundleChange('bundleCouponEnabled', v)}
                        />
                      </div>

                      {bundleState.bundleCouponEnabled && (
                        <div className="space-y-2 pt-2 border-t border-gray-200">
                          <Label className="text-xs">Select Coupon</Label>
                          <Select
                            value={bundleState.bundleCouponId || ''}
                            onValueChange={v => handleBundleChange('bundleCouponId', v)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Choose a coupon..." />
                            </SelectTrigger>
                            <SelectContent>
                              {coupons.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.code} - {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`} OFF
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedCoupon && (
                            <p className="text-xs font-medium text-green-600 bg-green-50 p-2 rounded border border-green-100">
                              Selected: {selectedCoupon.code} <br />
                              <span className="text-gray-600 font-normal">{selectedCoupon.description}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Max Products to Show</Label>
                      <Input
                        type="number"
                        min="1" max="10"
                        value={bundleState.maxProducts}
                        onChange={e => handleBundleChange('maxProducts', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration Timer (Minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={bundleState.expirationMinutes}
                        onChange={e => handleBundleChange('expirationMinutes', parseInt(e.target.value) || 60)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Selection Mode</Label>
                      <RadioGroup value={bundleState.selectionMode} onValueChange={v => handleBundleChange('selectionMode', v)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="auto" id="mode-auto" />
                          <Label htmlFor="mode-auto" className="font-normal">Auto (Related Categories)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id="mode-manual" />
                          <Label htmlFor="mode-manual" className="font-normal">Manual Selection</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {bundleState.selectionMode === 'manual' && (
                      <div className="space-y-2">
                        <Label>Select Manual Products</Label>
                        <ScrollArea className="h-[200px] border rounded-md p-3">
                          <div className="space-y-3">
                            {products.map(p => (
                              <div key={p.id} className="flex items-center gap-3">
                                <Checkbox
                                  id={`prod-${p.id}`}
                                  checked={(bundleState.manualProductIds || []).includes(p.id)}
                                  onCheckedChange={() => toggleManualProduct(p.id)}
                                />
                                <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <Label htmlFor={`prod-${p.id}`} className="flex-1 font-normal line-clamp-1 cursor-pointer">
                                  {p.name}
                                </Label>
                                <span className="text-xs font-semibold">{formatPrice(p.price)}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <p className="text-xs text-muted-foreground">Selected products will appear in every bundle if they are different from the current product.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Element Layout Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Element Order & Visibility</CardTitle>
                <CardDescription>Drag to reorder. Use toggles to show/hide elements.</CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="layout-elements">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''}`}
                      >
                        {layout.map((el, index) => (
                          <Draggable key={el.id} draggableId={el.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-2 p-3 bg-white rounded-md border transition-all ${snapshot.isDragging
                                    ? 'shadow-lg ring-2 ring-primary/50 opacity-90 rotate-1'
                                    : 'hover:shadow-md hover:border-gray-300'
                                  }`}
                              >
                                <GripVertical className={`h-5 w-5 flex-shrink-0 transition-colors ${snapshot.isDragging ? 'text-primary' : 'text-gray-400'}`} />
                                <span className="flex-1 font-medium text-sm">{el.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleVisibility(el.id)}
                                >
                                  {el.visible ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingElement(el)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <p className="text-xs text-muted-foreground mt-4">
                  {layout.length} elements configured
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-2 p-6 pt-0">
              <Button onClick={handlePublish} className="w-full"><Save className="h-4 w-4 mr-2" />Publish</Button>
              <Button onClick={handleReset} variant="outline" className="w-full"><RefreshCw className="h-4 w-4 mr-2" />Reset Layout</Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>This is how your product page will look to customers.</CardDescription>
              </CardHeader>
              <CardContent className="bg-gray-100 p-4 rounded-lg border">
                <div className="bg-white shadow-lg rounded-lg overflow-y-auto max-h-[120vh] no-scrollbar">
                  <ProductDetailPage
                    product={mockProduct}
                    navigateTo={mockNavigate}
                    isPreview={true}
                    previewLayout={layout}
                    previewDesign={design}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <AnimatePresence>
            {editingElement && (
              <ElementSettingsEditor
                element={editingElement}
                onSave={handleSaveSettings}
                onCancel={() => setEditingElement(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminProductPageLayout;
