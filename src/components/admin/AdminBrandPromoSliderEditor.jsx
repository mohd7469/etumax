
import React, { useState, useMemo } from 'react';
import { useProducts } from '@/context/ProductContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash, Search, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

const AdminBrandPromoSliderEditor = ({ settings, setSettings }) => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const selectedIds = settings.selectedProductIds || [];
  // Use range 10-100, default 30
  const speedValue = settings.speed || 30;

  const handleToggleProduct = (productId) => {
    setSettings((prev) => {
      const currentIds = prev.selectedProductIds || [];
      if (currentIds.includes(productId)) {
        return { ...prev, selectedProductIds: currentIds.filter(id => id !== productId) };
      } else {
        return { ...prev, selectedProductIds: [...currentIds, productId] };
      }
    });
  };

  const handleClearAll = () => {
    setSettings((prev) => ({ ...prev, selectedProductIds: [] }));
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products.slice(0, 50); // Show max 50 default
    const lowerTerm = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(lowerTerm) || 
      p.sku?.toLowerCase().includes(lowerTerm)
    );
  }, [products, searchTerm]);

  const selectedProducts = useMemo(() => {
    return selectedIds.map(id => products.find(p => p.id === id)).filter(Boolean);
  }, [selectedIds, products]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Section Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input 
              placeholder="e.g., Trending Now" 
              value={settings.title || ''} 
              onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} 
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label htmlFor="auto-play-toggle">Auto Play Carousel</Label>
                <p className="text-xs text-muted-foreground">Continuously scroll products</p>
              </div>
              <Switch 
                id="auto-play-toggle" 
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            Select Products
            <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
              {selectedProducts.length} Selected
            </span>
          </CardTitle>
          <CardDescription>Choose products to display in the infinite carousel.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Product Selector */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products by name..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredProducts.map(product => {
                    const isSelected = selectedIds.includes(product.id);
                    const thumb = product.mainImage || (product.images?.[0]) || 'https://via.placeholder.com/40';
                    return (
                      <div 
                        key={product.id} 
                        onClick={() => handleToggleProduct(product.id)}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted border border-transparent'
                        }`}
                      >
                        <div className="relative w-10 h-10 rounded bg-white border flex-shrink-0 overflow-hidden">
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-primary drop-shadow" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium line-clamp-1 text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.price} AED</p>
                        </div>
                      </div>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground p-4">No products found.</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Selected Products Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Selected Items Order</Label>
                {selectedProducts.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-destructive">
                    <Trash className="w-3 h-3 mr-1" /> Clear All
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[300px] border rounded-md bg-muted/20">
                <div className="p-2 space-y-2">
                  {selectedProducts.map((product) => {
                    const thumb = product.mainImage || (product.images?.[0]) || 'https://via.placeholder.com/40';
                    return (
                      <div key={`selected-${product.id}`} className="flex items-center justify-between p-2 bg-background border rounded-md shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={thumb} alt="" className="w-8 h-8 rounded border object-cover" />
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => handleToggleProduct(product.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {selectedProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                      <p className="text-sm">No products selected.</p>
                      <p className="text-xs mt-1">Search and click products on the left to add them.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBrandPromoSliderEditor;
