
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDesign } from '@/context/DesignContext';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Trash, GripVertical, Plus, Edit, ImagePlus, Image as ImageIcon } from 'lucide-react';
import HomePage from '@/pages/HomePage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/ui/color-picker';
import AdminBrandPromoSliderEditor from '@/components/admin/AdminBrandPromoSliderEditor';
import AdminImageLinkCarouselEditor from '@/components/admin/AdminImageLinkCarouselEditor';

const SortableItem = ({ id, children, handleProps }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 1,
    boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.15)' : 'none',
    position: isDragging ? 'relative' : 'static',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 p-3 rounded-lg border bg-background transition-colors ${
        isDragging ? 'border-primary ring-1 ring-primary/20 bg-accent/50' : 'border-border hover:border-border/80'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        {...handleProps}
        className="pt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-grow min-w-0">{children}</div>
    </div>
  );
};

const HeroEditor = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState({ type: null, index: null });

  const handleSlideChange = (index, field, value) => {
    const newSlides = [...(localSettings.slides || [])];
    newSlides[index][field] = value;
    setLocalSettings({ ...localSettings, slides: newSlides });
  };

  const addSlide = () => {
    setLocalSettings(prev => ({
      ...prev,
      slides: [...(prev.slides || []), { id: `slide${Date.now()}`, heading: 'New Slide', subheading: 'Describe your new slide', buttonText: 'Shop Now', buttonLink: '/products', image: '' }]
    }));
  };

  const removeSlide = (index) => {
    const newSlides = (localSettings.slides || []).filter((_, i) => i !== index);
    setLocalSettings({ ...localSettings, slides: newSlides });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalSettings(items => {
        const currentSlides = items.slides || [];
        const oldIndex = currentSlides.findIndex(s => s.id === active.id);
        const newIndex = currentSlides.findIndex(s => s.id === over.id);
        return { ...items, slides: arrayMove(currentSlides, oldIndex, newIndex) };
      });
    }
  };

  const handleOpenMediaModal = (type, index = null) => {
    setItemToUpdate({ type, index });
    setIsMediaModalOpen(true);
  };

  const handleImageSelect = (imageUrl) => {
    if (itemToUpdate.type === 'promoBanner') {
      setLocalSettings(s => ({ ...s, promoBanner: { ...s.promoBanner, image: imageUrl } }));
    } else if (itemToUpdate.type === 'slide' && itemToUpdate.index !== null) {
      handleSlideChange(itemToUpdate.index, 'image', imageUrl);
    }
    setIsMediaModalOpen(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Hero Banner</DialogTitle></DialogHeader>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-promo-banner">Promotional Banner (Above Hero)</Label>
                <Switch id="show-promo-banner" checked={localSettings.promoBanner?.show} onCheckedChange={c => setLocalSettings(s => ({ ...s, promoBanner: { ...s.promoBanner, show: c } }))} />
              </div>
              {localSettings.promoBanner?.show && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Firebase Storage URL" value={localSettings.promoBanner.image} onChange={e => setLocalSettings(s => ({ ...s, promoBanner: { ...s.promoBanner, image: e.target.value } }))} />
                    <Button variant="secondary" onClick={() => handleOpenMediaModal('promoBanner')}>Upload</Button>
                  </div>
                  <Input placeholder="Link URL" value={localSettings.promoBanner.link} onChange={e => setLocalSettings(s => ({ ...s, promoBanner: { ...s.promoBanner, link: e.target.value } }))} />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-4">
              <Label>Slider Settings</Label>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Switch id="autoplay-switch" checked={localSettings.sliderSettings?.autoPlay} onCheckedChange={c => setLocalSettings(s => ({ ...s, sliderSettings: { ...s.sliderSettings, autoPlay: c } }))} />
                  <Label htmlFor="autoplay-switch">Auto Play</Label>
                </div>
                <Input type="number" className="w-40" placeholder="Interval (seconds)" value={localSettings.sliderSettings?.interval} onChange={e => setLocalSettings(s => ({ ...s, sliderSettings: { ...s.sliderSettings, interval: Number(e.target.value) } }))} />
                <div className="col-span-2 space-y-2">
                  <Label>Banner Height: {localSettings.sliderSettings?.height || 600}px</Label>
                  <Slider
                    value={[localSettings.sliderSettings?.height || 600]}
                    onValueChange={([val]) => setLocalSettings(s => ({ ...s, sliderSettings: { ...s.sliderSettings, height: val } }))}
                    max={1000}
                    min={300}
                    step={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div>
            <Label>Slides (Drag to reorder)</Label>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={(localSettings.slides || []).map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4 mt-2">
                  {(localSettings.slides || []).map((slide, index) => (
                    <SortableItem key={slide.id} id={slide.id}>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Input placeholder="Heading" value={slide.heading} onChange={(e) => handleSlideChange(index, 'heading', e.target.value)} />
                          <Textarea placeholder="Subheading" value={slide.subheading} onChange={(e) => handleSlideChange(index, 'subheading', e.target.value)} />
                          <Input placeholder="Button Text" value={slide.buttonText} onChange={(e) => handleSlideChange(index, 'buttonText', e.target.value)} />
                          <Input placeholder="Button Link" value={slide.buttonLink} onChange={(e) => handleSlideChange(index, 'buttonLink', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input placeholder="Firebase Storage URL" value={slide.image} onChange={(e) => handleSlideChange(index, 'image', e.target.value)} />
                            <Button variant="secondary" onClick={() => handleOpenMediaModal('slide', index)}>Upload</Button>
                          </div>
                          {slide.image ? <img src={slide.image} alt="Preview" className="w-full h-24 object-cover rounded" /> : <div className="w-full h-24 bg-muted rounded flex items-center justify-center"><ImagePlus className="text-muted-foreground" /></div>}
                          <Button variant="destructive" className="w-full" onClick={() => removeSlide(index)}>Remove</Button>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <Button onClick={addSlide} variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Slide</Button>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <Button onClick={() => onSave(localSettings)}>Save Hero Settings</Button>
        </DialogFooter>
      </DialogContent>
      <MediaLibraryModal 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)} 
        onSelectImage={handleImageSelect} 
        uploadPath="banners"
      />
    </>
  );
};

const CategoryEditor = ({ settings, onSave }) => {
  const { categories: allCategories } = useProducts();
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [categoryToUpdateImage, setCategoryToUpdateImage] = useState(null);

  const [displayedCategories, setDisplayedCategories] = useState(() => (settings.categories || []).map(c => ({ ...c, key: c.id })));

  const availableCategories = allCategories.filter(
    (c) => c.id !== 'all' && !displayedCategories.some((dc) => dc.id === c.id)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDisplayedCategories((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleOpenMediaModal = (categoryId) => {
    setCategoryToUpdateImage(categoryId);
    setIsMediaModalOpen(true);
  };

  const handleImageSelect = (imageUrl) => {
    if (categoryToUpdateImage) {
      setDisplayedCategories(prev => prev.map(c => c.id === categoryToUpdateImage ? { ...c, image: imageUrl } : c));
    }
    setIsMediaModalOpen(false);
    setCategoryToUpdateImage(null);
  };

  const addCategory = (cat) => setDisplayedCategories((prev) => [...prev, { ...cat, key: cat.id }]);
  const removeCategory = (id) => setDisplayedCategories((prev) => prev.filter((c) => c.id !== id));

  const CategoryCard = ({ item }) => (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover border bg-muted" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium text-sm text-foreground">{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenMediaModal(item.id)}>Image</Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2" onClick={() => removeCategory(item.id)}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const handleSave = () => {
    onSave({ ...settings, categories: displayedCategories });
  };

  return (
    <>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit "Shop by Category"</DialogTitle>
          <CardDescription>Select, reorder, and customize categories for your homepage.</CardDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden flex-1">
          <div className="flex flex-col overflow-hidden">
            <Label className="mb-2 text-sm font-semibold">Available Categories</Label>
            <div className="flex-1 overflow-y-auto border border-border rounded-lg p-2 space-y-2 bg-muted/30">
              {availableCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center p-4">All categories added.</p>
              )}
              {availableCategories.map(cat => (
                <div key={cat.id} className="p-2 border border-border rounded-md bg-background flex items-center justify-between hover:border-primary/30 transition-colors">
                  <span className="text-sm font-medium pl-1">{cat.name}</span>
                  <Button size="sm" variant="secondary" onClick={() => addCategory(cat)}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <Label className="mb-2 text-sm font-semibold">Displayed Categories (Drag to reorder)</Label>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
              <SortableContext items={displayedCategories.map(c => c.key)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 overflow-y-auto border border-border rounded-lg p-2 space-y-2 bg-muted/30">
                  {displayedCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center p-4">No categories selected.</p>
                  )}
                  {displayedCategories.map(cat => (
                    <SortableItem key={cat.key} id={cat.key}>
                      <CategoryCard item={cat} />
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <DialogClose asChild><Button onClick={handleSave}>Save Categories</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
      <MediaLibraryModal 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)} 
        onSelectImage={handleImageSelect} 
        uploadPath="categories"
      />
    </>
  );
};

const ProductSectionEditor = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const { products, categories } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const productOptions = products.map(p => ({ value: p.id, label: p.name }));

  const filteredProducts = searchTerm
    ? productOptions.filter(p => p.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const addProduct = (productId) => {
    const currentIds = localSettings.productIds || [];
    if (!currentIds.includes(productId)) {
      setLocalSettings(s => ({ ...s, productIds: [...currentIds, productId] }));
    }
    setSearchTerm("");
  };

  const removeProduct = (productId) => {
    setLocalSettings(s => ({ ...s, productIds: (s.productIds || []).filter(id => id !== productId) }));
  };

  const selectedProducts = (localSettings.productIds || []).map(id => products.find(p => p.id === id)).filter(Boolean);

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Editing: {settings.title}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div><Label>Section Title</Label><Input value={localSettings.title} onChange={e => setLocalSettings(s => ({ ...s, title: e.target.value }))} /></div>
        <div><Label>Section Description</Label><Input value={localSettings.description} onChange={e => setLocalSettings(s => ({ ...s, description: e.target.value }))} /></div>
        <div>
          <Label>"View All" Button Link</Label>
          <Select value={localSettings.viewAllCategory} onValueChange={(v) => setLocalSettings(s => ({ ...s, viewAllCategory: v }))}>
            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={c.slug || c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Products</Label>
          <div className="relative">
            <Input placeholder="Search to add product..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            {searchTerm && (
              <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                {filteredProducts.map(p => (
                  <div key={p.value} onClick={() => addProduct(p.value)} className="p-2 hover:bg-accent cursor-pointer">{p.label}</div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 space-y-2 max-h-40 overflow-auto border p-2 rounded-md bg-muted/30">
            {selectedProducts.map(p => (
              <div key={p.id} className="flex justify-between items-center p-2 bg-background border border-border rounded">
                <span className="text-sm">{p.name}</span>
                <Button variant="ghost" size="sm" onClick={() => removeProduct(p.id)} className="h-8 w-8 p-0 text-destructive"><Trash className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </div>
        <div><Label>Display Limit</Label><Input type="number" value={localSettings.limit} onChange={e => setLocalSettings(s => ({ ...s, limit: Number(e.target.value) }))} /></div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
        <Button onClick={() => { onSave(localSettings); toast({ title: 'Saved!' }); }}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const SectionEditor = ({ settings, onSave, title, children }) => {
  const [localSettings, setLocalSettings] = useState(settings || {});

  useEffect(() => {
    setLocalSettings(settings || {});
  }, [settings]);

  const handleSave = () => onSave(localSettings);

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Editing: {title}</DialogTitle></DialogHeader>

      {React.cloneElement(children, { settings: localSettings, setSettings: setLocalSettings })}

      <DialogFooter>
        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
        <DialogClose asChild><Button onClick={handleSave}>Save</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

const DualHeroEditor = ({ settings, setSettings }) => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(null);

  const handleOpenMedia = (index) => {
    setActiveBannerIndex(index);
    setIsMediaModalOpen(true);
  };

  const handleImageSelect = (url) => {
    if (activeBannerIndex !== null) {
      setSettings(s => ({ ...s, banners: s.banners.map((b, i) => i === activeBannerIndex ? { ...b, image: url } : b) }))
    }
    setIsMediaModalOpen(false);
  };

  return (
    <>
      <div className="space-y-4">
        {(settings.banners || []).map((banner, index) => (
          <Card key={banner.id}>
            <CardHeader><CardTitle>Banner {index + 1}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Title" value={banner.title} onChange={e => setSettings(s => ({ ...s, banners: s.banners.map((b, i) => i === index ? { ...b, title: e.target.value } : b) }))} />
              <Input placeholder="Subtitle" value={banner.subtitle} onChange={e => setSettings(s => ({ ...s, banners: s.banners.map((b, i) => i === index ? { ...b, subtitle: e.target.value } : b) }))} />
              <Input placeholder="Button Text" value={banner.buttonText} onChange={e => setSettings(s => ({ ...s, banners: s.banners.map((b, i) => i === index ? { ...b, buttonText: e.target.value } : b) }))} />
              <Input placeholder="Button Link" value={banner.buttonLink} onChange={e => setSettings(s => ({ ...s, banners: s.banners.map((b, i) => i === index ? { ...b, buttonLink: e.target.value } : b) }))} />
              <div className="flex gap-2">
                <Input placeholder="Image URL" value={banner.image} onChange={e => setSettings(s => ({ ...s, banners: s.banners.map((b, i) => i === index ? { ...b, image: e.target.value } : b) }))} />
                <Button variant="secondary" onClick={() => handleOpenMedia(index)}>Upload</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" onClick={() => setSettings(s => ({ ...s, banners: [...(s.banners || []), { id: Date.now(), title: 'New Banner', subtitle: '', buttonText: 'Shop', buttonLink: '#', image: '' }] }))}><Plus className="w-4 h-4 mr-2" /> Add Banner</Button>
      </div>
      <MediaLibraryModal isOpen={isMediaModalOpen} onClose={() => setIsMediaModalOpen(false)} onSelectImage={handleImageSelect} uploadPath="banners" />
    </>
  );
};

const CategoryHighlightEditor = ({ settings, setSettings }) => {
  const { categories } = useProducts();
  return (
    <div className="space-y-4">
      <div><Label>Title</Label><Input placeholder="Title" value={settings.title || ''} onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} /></div>
      <div>
        <Label>Category</Label>
        <Select value={settings.categoryId || ''} onValueChange={val => setSettings(s => ({ ...s, categoryId: val }))}>
          <SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger>
          <SelectContent>
            {categories.filter(c => c.id !== 'all').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Discount Badge text</Label><Input placeholder="Discount Badge" value={settings.discountBadge || ''} onChange={e => setSettings(s => ({ ...s, discountBadge: e.target.value }))} /></div>
      <div><Label>Product Image URL</Label><Input placeholder="Product Image URL" value={settings.productImage || ''} onChange={e => setSettings(s => ({ ...s, productImage: e.target.value }))} /></div>
      <div><Label>Button Text</Label><Input placeholder="Button Text" value={settings.buttonText || ''} onChange={e => setSettings(s => ({ ...s, buttonText: e.target.value }))} /></div>
      <div><Label>Button Link</Label><Input placeholder="Button Link" value={settings.buttonLink || ''} onChange={e => setSettings(s => ({ ...s, buttonLink: e.target.value }))} /></div>
    </div>
  )
};

const ProductGridEditor = ({ settings, setSettings }) => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const productOptions = products.map(p => ({ value: p.id, label: p.name }));

  const filteredProducts = searchTerm
    ? productOptions.filter(p => p.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const addProduct = (productId) => {
    const currentIds = settings.productIds || [];
    if (!currentIds.includes(productId)) {
      setSettings(s => ({ ...s, productIds: [...currentIds, productId] }));
    }
    setSearchTerm("");
  };

  const removeProduct = (productId) => {
    setSettings(s => ({ ...s, productIds: (s.productIds || []).filter(id => id !== productId) }));
  };

  const selectedProducts = (settings.productIds || []).map(id => products.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="space-y-4">
      <div><Label>Title</Label><Input placeholder="Title" value={settings.title || ''} onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} /></div>
      <div>
        <Label>Products to show: {settings.count || 8}</Label>
        <Slider value={[settings.count || 8]} onValueChange={([v]) => setSettings(s => ({ ...s, count: v }))} min={4} max={12} step={1} />
      </div>
      <div>
        <Label>Products</Label>
        <div className="relative mt-2">
          <Input placeholder="Search to add product..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {searchTerm && (
            <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
              {filteredProducts.map(p => (
                <div key={p.value} onClick={() => addProduct(p.value)} className="p-2 hover:bg-accent cursor-pointer text-sm">{p.label}</div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 space-y-2 max-h-40 overflow-auto border p-2 rounded-md bg-muted/30">
          {selectedProducts.map(p => (
            <div key={p.id} className="flex justify-between items-center p-2 bg-background border border-border rounded">
              <span className="text-sm">{p.name}</span>
              <Button variant="ghost" size="sm" onClick={() => removeProduct(p.id)} className="h-8 w-8 p-0 text-destructive"><Trash className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};

const FeaturedCarouselEditor = ({ settings, setSettings }) => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const handleSelect = (url) => {
    if (activeIndex !== null) {
      setSettings(s => ({ ...s, slides: (s.slides || []).map((b, i) => i === activeIndex ? { ...b, image: url } : b) }));
    }
    setIsMediaModalOpen(false);
  }

  return (
    <>
      <div className="space-y-4">
        <div><Label>Title</Label><Input placeholder="Title" value={settings.title || ''} onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} /></div>
        <div className="flex items-center gap-2">
          <Switch id="carousel-autoplay" checked={settings.autoPlay} onCheckedChange={c => setSettings(s => ({ ...s, autoPlay: c }))} />
          <Label htmlFor="carousel-autoplay">Auto Play</Label>
        </div>
        <div>
          <Label>Auto Play Delay (seconds): {settings.delay || 5}</Label>
          <Slider value={[settings.delay || 5]} onValueChange={([v]) => setSettings(s => ({ ...s, delay: v }))} min={2} max={10} step={1} />
        </div>

        {(settings.slides || []).map((slide, index) => (
          <Card key={slide.id}>
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-base">Slide {index + 1}</CardTitle>
              <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => setSettings(s => ({ ...s, slides: (s.slides || []).filter(sl => sl.id !== slide.id) }))}><Trash className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input placeholder="Title" value={slide.title} onChange={e => setSettings(s => ({ ...s, slides: (s.slides || []).map((b, i) => i === index ? { ...b, title: e.target.value } : b) }))} /></div>
              <div>
                <Label className="text-xs">Image URL</Label>
                <div className="flex gap-2">
                  <Input placeholder="Image URL" value={slide.image} onChange={e => setSettings(s => ({ ...s, slides: (s.slides || []).map((b, i) => i === index ? { ...b, image: e.target.value } : b) }))} />
                  <Button variant="secondary" onClick={() => { setActiveIndex(index); setIsMediaModalOpen(true); }}>Upload</Button>
                </div>
              </div>
              <div><Label className="text-xs">Link</Label><Input placeholder="Link" value={slide.link} onChange={e => setSettings(s => ({ ...s, slides: (s.slides || []).map((b, i) => i === index ? { ...b, link: e.target.value } : b) }))} /></div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" className="w-full" onClick={() => setSettings(s => ({ ...s, slides: [...(s.slides || []), { id: Date.now(), title: 'New Slide', image: '', link: '' }] }))}><Plus className="w-4 h-4 mr-2"/> Add Slide</Button>
      </div>
      <MediaLibraryModal isOpen={isMediaModalOpen} onClose={() => setIsMediaModalOpen(false)} onSelectImage={handleSelect} uploadPath="banners" />
    </>
  );
};

const CategoryBannersEditor = ({ settings, setSettings }) => {
  const { categories } = useProducts();
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const handleSelect = (url) => {
    if (activeIndex !== null) {
      setSettings(s => ({ ...s, banners: (s.banners || []).map((b, i) => i === activeIndex ? { ...b, image: url } : b) }));
    }
    setIsMediaModalOpen(false);
  }

  return (
    <>
      <div className="space-y-4">
        <div><Label>Section Title</Label><Input placeholder="Section Title" value={settings.title || ''} onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} /></div>
        {(settings.banners || []).map((banner, index) => (
          <Card key={banner.id}>
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-base">Banner {index + 1}</CardTitle>
              <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => setSettings(s => ({ ...s, banners: (s.banners || []).filter(b => b.id !== banner.id) }))}><Trash className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Link to Category</Label>
                <Select value={banner.link} onValueChange={val => setSettings(s => ({ ...s, banners: (s.banners || []).map((b, i) => i === index ? { ...b, title: categories.find(c => `/products/${c.slug}` === val)?.name || b.title, link: val } : b) }))}>
                  <SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== 'all').map(c => <SelectItem key={c.id} value={`/products/${c.slug}`}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Image URL</Label>
                <div className="flex gap-2">
                  <Input placeholder="Image URL" value={banner.image} onChange={e => setSettings(s => ({ ...s, banners: (s.banners || []).map((b, i) => i === index ? { ...b, image: e.target.value } : b) }))} />
                  <Button variant="secondary" onClick={() => { setActiveIndex(index); setIsMediaModalOpen(true); }}>Upload</Button>
                </div>
              </div>
              <div><Label className="text-xs">Banner Title</Label><Input placeholder="Banner Title" value={banner.title} onChange={e => setSettings(s => ({ ...s, banners: (s.banners || []).map((b, i) => i === index ? { ...b, title: e.target.value } : b) }))} /></div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" className="w-full" onClick={() => setSettings(s => ({ ...s, banners: [...(s.banners || []), { id: Date.now(), title: 'New Banner', image: '', link: '' }] }))}><Plus className="w-4 h-4 mr-2"/> Add Banner</Button>
      </div>
      <MediaLibraryModal isOpen={isMediaModalOpen} onClose={() => setIsMediaModalOpen(false)} onSelectImage={handleSelect} uploadPath="banners" />
    </>
  )
};

const BigPromoBannerEditor = ({ settings, setSettings }) => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const handleSelect = (url) => {
    setSettings(s => ({ ...s, image: url }));
    setIsMediaModalOpen(false);
  };
  return (
    <>
      <div className="space-y-4">
        <div><Label>Title</Label><Input placeholder="Title" value={settings.title || ''} onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} /></div>
        <div><Label>Subtitle</Label><Textarea placeholder="Subtitle" value={settings.subtitle || ''} onChange={e => setSettings(s => ({ ...s, subtitle: e.target.value }))} /></div>
        <div><Label>Button Text</Label><Input placeholder="Button Text" value={settings.buttonText || ''} onChange={e => setSettings(s => ({ ...s, buttonText: e.target.value }))} /></div>
        <div><Label>Button Link</Label><Input placeholder="Button Link" value={settings.buttonLink || ''} onChange={e => setSettings(s => ({ ...s, buttonLink: e.target.value }))} /></div>
        <div>
          <Label>Image URL</Label>
          <div className="flex gap-2">
            <Input placeholder="Image URL" value={settings.image || ''} onChange={e => setSettings(s => ({ ...s, image: e.target.value }))} />
            <Button variant="secondary" onClick={() => setIsMediaModalOpen(true)}>Upload</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Text Color</Label><ColorPicker color={settings.textColor || '#ffffff'} onChange={c => setSettings(s => ({ ...s, textColor: c }))} /></div>
          <div><Label>Overlay Color</Label><ColorPicker color={settings.overlayColor || 'rgba(0,0,0,0.5)'} onChange={c => setSettings(s => ({ ...s, overlayColor: c }))} /></div>
        </div>
      </div>
      <MediaLibraryModal isOpen={isMediaModalOpen} onClose={() => setIsMediaModalOpen(false)} onSelectImage={handleSelect} uploadPath="banners" />
    </>
  );
};

const TrendingProductsEditor = ({ settings, setSettings }) => (
  <div className="space-y-4">
    <div><Label>Title</Label><Input placeholder="Title" value={settings.title || ''} onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} /></div>
    <div>
      <Label>Default Tab</Label>
      <Select value={settings.defaultTab || 'trending'} onValueChange={v => setSettings(s => ({ ...s, defaultTab: v }))}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="trending">Trending</SelectItem>
          <SelectItem value="new">New Arrivals</SelectItem>
          <SelectItem value="best">Best Sellers</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

const AdminCategoryCarouselEditor = ({ settings, setSettings }) => {
  const { categories } = useProducts();
  const speedValue = settings.speed || 30;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Section Settings</CardTitle>
          <CardDescription>Display all products from a specific category in an infinite scrolling carousel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input 
              placeholder="e.g., Top in Electronics" 
              value={settings.title || ''} 
              onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} 
              className="mt-1"
            />
          </div>
          <div>
            <Label>Select Category</Label>
            <Select 
              value={settings.categoryId || ''} 
              onValueChange={val => {
                const cat = categories.find(c => c.id === val);
                setSettings(s => ({ ...s, categoryId: val, categoryName: cat ? cat.name : '' }));
              }}
            >
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a category..." /></SelectTrigger>
              <SelectContent>
                {categories.filter(c => c.id !== 'all').map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label htmlFor="cat-auto-play-toggle">Auto Play Carousel</Label>
                <p className="text-xs text-muted-foreground">Continuously scroll products</p>
              </div>
              <Switch 
                id="cat-auto-play-toggle" 
                checked={settings.autoPlay !== false} 
                onCheckedChange={c => setSettings(s => ({ ...s, autoPlay: c }))} 
              />
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg border flex flex-col justify-center space-y-2">
              <div className="flex items-center justify-between">
                <Label>Animation Speed</Label>
                <span className="text-xs font-medium text-primary">{speedValue}</span>
              </div>
              <Slider
                value={[speedValue]}
                min={10}
                max={100}
                step={1}
                onValueChange={([val]) => setSettings(s => ({ ...s, speed: val }))}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


const SortableSections = ({ sectionIds, onReorder, children }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionIds.indexOf(active.id);
      const newIndex = sectionIds.indexOf(over.id);
      onReorder(arrayMove(sectionIds, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
};

const AdminHomeSettings = () => {
  const { homePageSettings, saveHomePageSettings, imageCompressionSettings, saveImageCompressionSettings } = useDesign();
  const [localSettings, setLocalSettings] = useState(homePageSettings);
  const [localCompressionSettings, setLocalCompressionSettings] = useState(imageCompressionSettings);
  const mockNavigate = () => { };

  useEffect(() => {
    setLocalSettings(homePageSettings);
  }, [homePageSettings]);

  useEffect(() => {
    setLocalCompressionSettings(imageCompressionSettings);
  }, [imageCompressionSettings]);

  const sectionConfig = {
    hero: { title: 'Hero Banner', description: 'The main banner at the top of your homepage', editor: HeroEditor },
    features: { title: 'Features Bar', description: 'Icons and text for shipping, payment, etc.' },
    shopByCategory: { title: 'Shop by Category', description: 'Main category grid', editor: CategoryEditor },
    featuredProducts: { title: 'Featured Products', description: 'Manually selected product carousel', editor: ProductSectionEditor },
    bestSellers: { title: 'Best Sellers', description: 'Product carousel for top sellers', editor: ProductSectionEditor },
    newArrivals: { title: 'New Arrivals', description: 'Product carousel for new items', editor: ProductSectionEditor },
    dualHeroBanner: { title: 'Dual Hero Banner', description: 'Side-by-side promotional banners', editor: (props) => <SectionEditor {...props} title="Dual Hero Banner"><DualHeroEditor /></SectionEditor> },
    categoryHighlight: { title: 'Category Highlight', description: 'Spotlight a single category', editor: (props) => <SectionEditor {...props} title="Category Highlight"><CategoryHighlightEditor /></SectionEditor> },
    productGrid: { title: 'Product Grid', description: 'A large grid of selected products', editor: (props) => <SectionEditor {...props} title="Product Grid"><ProductGridEditor /></SectionEditor> },
    featuredCarousel: { title: 'Featured Carousel', description: 'An auto-playing image carousel', editor: (props) => <SectionEditor {...props} title="Featured Carousel"><FeaturedCarouselEditor /></SectionEditor> },
    categoryBanners: { title: 'Category Banners', description: 'Multiple banners linking to categories', editor: (props) => <SectionEditor {...props} title="Category Banners"><CategoryBannersEditor /></SectionEditor> },
    imageLinkCarousel1: { title: 'Image Link Carousel 1', description: 'Continuous scrolling image links', editor: (props) => <SectionEditor {...props} title="Image Link Carousel 1"><AdminImageLinkCarouselEditor /></SectionEditor> },
    imageLinkCarousel2: { title: 'Image Link Carousel 2', description: 'Continuous scrolling image links', editor: (props) => <SectionEditor {...props} title="Image Link Carousel 2"><AdminImageLinkCarouselEditor /></SectionEditor> },
    imageLinkCarousel3: { title: 'Image Link Carousel 3', description: 'Continuous scrolling image links', editor: (props) => <SectionEditor {...props} title="Image Link Carousel 3"><AdminImageLinkCarouselEditor /></SectionEditor> },
    brandPromo: { title: 'Infinite Product Carousel 1', description: 'Continuous scrolling product display', editor: (props) => <SectionEditor {...props} title="Infinite Product Carousel 1"><AdminBrandPromoSliderEditor /></SectionEditor> },
    brandPromo2: { title: 'Infinite Product Carousel 2', description: 'Continuous scrolling product display', editor: (props) => <SectionEditor {...props} title="Infinite Product Carousel 2"><AdminBrandPromoSliderEditor /></SectionEditor> },
    brandPromo3: { title: 'Infinite Product Carousel 3', description: 'Continuous scrolling product display', editor: (props) => <SectionEditor {...props} title="Infinite Product Carousel 3"><AdminBrandPromoSliderEditor /></SectionEditor> },
    brandPromo4: { title: 'Infinite Product Carousel 4', description: 'Continuous scrolling product display', editor: (props) => <SectionEditor {...props} title="Infinite Product Carousel 4"><AdminBrandPromoSliderEditor /></SectionEditor> },
    brandPromo5: { title: 'Infinite Product Carousel 5', description: 'Continuous scrolling product display', editor: (props) => <SectionEditor {...props} title="Infinite Product Carousel 5"><AdminBrandPromoSliderEditor /></SectionEditor> },
    brandPromo6: { title: 'Infinite Product Carousel 6', description: 'Continuous scrolling product display', editor: (props) => <SectionEditor {...props} title="Infinite Product Carousel 6"><AdminBrandPromoSliderEditor /></SectionEditor> },
    categoryCarousel1: { title: 'Category Carousel 1', description: 'Infinite scroll by category', editor: (props) => <SectionEditor {...props} title="Category Carousel 1"><AdminCategoryCarouselEditor /></SectionEditor> },
    categoryCarousel2: { title: 'Category Carousel 2', description: 'Infinite scroll by category', editor: (props) => <SectionEditor {...props} title="Category Carousel 2"><AdminCategoryCarouselEditor /></SectionEditor> },
    categoryCarousel3: { title: 'Category Carousel 3', description: 'Infinite scroll by category', editor: (props) => <SectionEditor {...props} title="Category Carousel 3"><AdminCategoryCarouselEditor /></SectionEditor> },
    bigPromoBanner: { title: 'Big Promo Banner', description: 'Full-width promotional banner', editor: (props) => <SectionEditor {...props} title="Big Promo Banner"><BigPromoBannerEditor /></SectionEditor> },
    trendingProducts: { title: 'Trending Products', description: 'Tabs for trending, new, best sellers', editor: (props) => <SectionEditor {...props} title="Trending Products"><TrendingProductsEditor /></SectionEditor> },
  };

  const getSectionConfig = useCallback((id) => {
    return sectionConfig[id] || { title: id, description: 'Custom section' };
  }, []);

  const handleSectionToggle = (section, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), show: value }
    }));
  };

  const handleSave = (section, newSettings) => {
    setLocalSettings(prev => ({ ...prev, [section]: newSettings }));
  };

  const handleReorder = (newOrder) => {
    setLocalSettings(prev => ({ ...prev, sectionsOrder: newOrder }));
  };

  const handlePublish = () => {
    saveHomePageSettings(localSettings);
    saveImageCompressionSettings(localCompressionSettings);
    toast({
      title: 'Published! 🎉',
      description: 'Your homepage changes are now live.',
    });
  };

  const sectionsOrder = Array.isArray(localSettings?.sectionsOrder) ? localSettings.sectionsOrder : Object.keys(sectionConfig);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Homepage Customizer</h1>
        <Button onClick={handlePublish}>Publish</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>Your home page as visitors see it. Changes are previewed instantly.</CardDescription>
        </CardHeader>
        <CardContent className="border rounded-lg max-h-[600px] overflow-y-auto bg-background/50">
          <HomePage navigateTo={mockNavigate} isPreview={true} previewSettings={localSettings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Compression</CardTitle>
          <CardDescription>Enable and set the quality for automatic image compression to improve site speed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-compression">Enable Image Compression</Label>
            <Switch id="enable-compression" checked={localCompressionSettings.enabled} onCheckedChange={(val) => setLocalCompressionSettings(s => ({ ...s, enabled: val }))} />
          </div>
          {localCompressionSettings.enabled && (
            <div>
              <Label className="mb-2 block">Compression Quality: {localCompressionSettings.quality}%</Label>
              <Slider
                value={[localCompressionSettings.quality]}
                onValueChange={([val]) => setLocalCompressionSettings(s => ({ ...s, quality: val }))}
                max={100}
                min={0}
                step={1}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Sections</CardTitle>
          <CardDescription>Drag and drop to reorder sections. Use the switches to show or hide them.</CardDescription>
        </CardHeader>
        <CardContent>
          <SortableSections sectionIds={sectionsOrder} onReorder={handleReorder}>
            {sectionsOrder.map(sectionId => {
              const config = getSectionConfig(sectionId);
              const EditorComponent = config.editor;
              return (
                <SortableItem key={sectionId} id={sectionId}>
                  <div className="flex items-center justify-between p-1 w-full">
                    <div>
                      <h3 className="font-semibold text-foreground">{config.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{config.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 border-r border-border pr-4">
                        <Label htmlFor={`show-${sectionId}`} className="sr-only">Show</Label>
                        <Switch id={`show-${sectionId}`} checked={localSettings[sectionId]?.show ?? false} onCheckedChange={(val) => handleSectionToggle(sectionId, val)} />
                      </div>
                      {EditorComponent ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                          </DialogTrigger>
                          <EditorComponent settings={localSettings[sectionId]} onSave={(s) => handleSave(sectionId, s)} />
                        </Dialog>
                      ) : (
                        <div className="w-[72px]"></div>
                      )}
                    </div>
                  </div>
                </SortableItem>
              );
            })}
          </SortableSections>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminHomeSettings;
