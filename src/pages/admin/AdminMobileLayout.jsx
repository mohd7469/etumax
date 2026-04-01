
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import MobileLayoutPreviewRenderer from '@/components/admin/MobileLayoutPreviewRenderer';
import { Save, GripVertical, Image as ImageIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMobileLayout } from '@/context/MobileLayoutContext';

const SortableNavItem = ({ item, updateItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.key });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm mb-2">
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600"><GripVertical className="w-5 h-5" /></div>
      <Switch checked={item.enabled} onCheckedChange={(c) => updateItem(item.key, { enabled: c })} />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Label ({item.key})</Label>
          <Input value={item.label} onChange={(e) => updateItem(item.key, { label: e.target.value })} className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Link / URL</Label>
          <Input value={item.link || ''} onChange={(e) => updateItem(item.key, { link: e.target.value })} placeholder="/path" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col justify-end">
          <div className="flex items-center space-x-2 h-8">
            <Switch checked={item.showLabel} onCheckedChange={(c) => updateItem(item.key, { showLabel: c })} id={`lbl-${item.key}`} />
            <Label htmlFor={`lbl-${item.key}`} className="text-xs">Show Label</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminMobileLayout = () => {
  const { toast } = useToast();
  const { 
    settings, 
    loading, 
    updateSection, 
    updateTopLevel,
    updateBottomNavItem, 
    reorderBottomNavItems 
  } = useMobileLayout();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSave = () => {
    toast({ title: 'Settings Saved', description: 'Mobile layout configuration updated successfully.' });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = settings.bottomNav.items.findIndex(i => i.key === active.id);
      const newIndex = settings.bottomNav.items.findIndex(i => i.key === over.id);
      const newItems = arrayMove(settings.bottomNav.items, oldIndex, newIndex);
      reorderBottomNavItems(newItems.map((item, index) => ({ ...item, order: index + 1 })));
    }
  };

  const handleNumberInput = (value, fallback = 0) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mobile Layout Engine</h1>
          <p className="text-muted-foreground mt-1">Configure advanced mobile-specific UI behaviors and layout.</p>
        </div>
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="w-4 h-4" /> Save Layout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="header" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="topStrip">Top Strip</TabsTrigger>
              <TabsTrigger value="header">Header</TabsTrigger>
              <TabsTrigger value="shopBar">Shop Bar</TabsTrigger>
              <TabsTrigger value="bottomNav">Bottom Nav</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
            </TabsList>

            {/* TOP STRIP */}
            <TabsContent value="topStrip" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Announcement Strip</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Enable Top Strip</Label>
                    <Switch checked={settings.topStrip?.enabled} onCheckedChange={(c) => updateSection('topStrip', 'enabled', c)} />
                  </div>
                  {settings.topStrip?.enabled && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>Height (px)</Label>
                        <Input type="number" value={settings.topStrip.height} onChange={(e) => updateSection('topStrip', 'height', handleNumberInput(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex gap-2">
                          <input type="color" value={settings.topStrip.backgroundColor} onChange={(e) => updateSection('topStrip', 'backgroundColor', e.target.value)} className="h-10 w-10 rounded border p-1" />
                          <Input value={settings.topStrip.backgroundColor} onChange={(e) => updateSection('topStrip', 'backgroundColor', e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex gap-2">
                          <input type="color" value={settings.topStrip.textColor} onChange={(e) => updateSection('topStrip', 'textColor', e.target.value)} className="h-10 w-10 rounded border p-1" />
                          <Input value={settings.topStrip.textColor} onChange={(e) => updateSection('topStrip', 'textColor', e.target.value)} />
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Content Text (HTML Supported)</Label>
                        <Textarea value={settings.topStrip.content} onChange={(e) => updateSection('topStrip', 'content', e.target.value)} rows={4} placeholder="Enter plain text or HTML (e.g. <b>Bold</b>)" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* HEADER */}
            <TabsContent value="header" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Mobile Header</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Enable Custom Mobile Header</Label>
                    <Switch checked={settings.header?.enabled} onCheckedChange={(c) => updateSection('header', 'enabled', c)} />
                  </div>
                  {settings.header?.enabled && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                        <div className="flex flex-col space-y-2">
                          <Label>Show Logo</Label>
                          <Switch checked={settings.header.showLogo} onCheckedChange={(c) => updateSection('header', 'showLogo', c)} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Show Menu Icon</Label>
                          <Switch checked={settings.header.showMenuIcon !== false} onCheckedChange={(c) => updateSection('header', 'showMenuIcon', c)} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Show Page Title</Label>
                          <Switch checked={settings.header.showPageTitle} onCheckedChange={(c) => updateSection('header', 'showPageTitle', c)} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Show Back Button</Label>
                          <Switch checked={settings.header.showBackButton} onCheckedChange={(c) => updateSection('header', 'showBackButton', c)} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Show Search Icon</Label>
                          <Switch checked={settings.header.showSearchIcon} onCheckedChange={(c) => updateSection('header', 'showSearchIcon', c)} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Show Cart Icon</Label>
                          <Switch checked={settings.header.showCartIcon} onCheckedChange={(c) => updateSection('header', 'showCartIcon', c)} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Show Language Icon</Label>
                          <Switch checked={settings.header.showLanguageIcon} onCheckedChange={(c) => updateSection('header', 'showLanguageIcon', c)} />
                        </div>
                      </div>
                      
                      <div className="space-y-2 border-t pt-4">
                        <Label>Mobile Logo URL <span className="text-xs text-muted-foreground font-normal ml-1">(Applies only to mobile view)</span></Label>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                          <Input 
                            placeholder="Enter your logo image URL (e.g., https://example.com/logo.png)" 
                            value={settings.header.logoUrl || ''} 
                            onChange={(e) => updateSection('header', 'logoUrl', e.target.value)} 
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                          <Label>Header Height (px)</Label>
                          <Input type="number" value={settings.header.height} onChange={(e) => updateSection('header', 'height', handleNumberInput(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Alignment</Label>
                          <Select value={settings.header.alignment} onValueChange={(v) => updateSection('header', 'alignment', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left Aligned</SelectItem>
                              <SelectItem value="center">Center Aligned</SelectItem>
                              <SelectItem value="space-between">Space Between</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SHOP BAR */}
            <TabsContent value="shopBar" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Shop Navigation Bar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Enable Shop Bar</Label>
                    <Switch checked={settings.shopBar?.enabled} onCheckedChange={(c) => updateSection('shopBar', 'enabled', c)} />
                  </div>
                  {settings.shopBar?.enabled && (
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Show Search Input</Label>
                          <Switch checked={settings.shopBar.showSearchBar} onCheckedChange={(c) => updateSection('shopBar', 'showSearchBar', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Category Scroller</Label>
                          <Switch checked={settings.shopBar.showCategoryBar} onCheckedChange={(c) => updateSection('shopBar', 'showCategoryBar', c)} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Select value={settings.shopBar.position} onValueChange={(v) => updateSection('shopBar', 'position', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="below-header">Below Header (Static)</SelectItem>
                              <SelectItem value="sticky-top">Sticky Top (Scrolls with page)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Element Spacing (px)</Label>
                          <Input type="number" value={settings.shopBar.spacing} onChange={(e) => updateSection('shopBar', 'spacing', handleNumberInput(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* BOTTOM NAV */}
            <TabsContent value="bottomNav" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Bottom Navigation Builder</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Enable Bottom Nav</Label>
                    <Switch checked={settings.bottomNav?.enabled} onCheckedChange={(c) => updateSection('bottomNav', 'enabled', c)} />
                  </div>
                  
                  {settings.bottomNav?.enabled && (
                    <>
                      <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                          <Label>Maximum Visible Icons</Label>
                          <Select value={String(settings.bottomNav.maxIcons)} onValueChange={(v) => updateSection('bottomNav', 'maxIcons', Number(v))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 Icons</SelectItem>
                              <SelectItem value="4">4 Icons</SelectItem>
                              <SelectItem value="5">5 Icons</SelectItem>
                              <SelectItem value="6">6 Icons</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Select value={settings.bottomNav.position} onValueChange={(v) => updateSection('bottomNav', 'position', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bottom">Fixed Bottom (Default)</SelectItem>
                              <SelectItem value="sticky-top">Sticky Top</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="pt-4 border-t flex items-center justify-between">
                        <Label className="font-semibold text-sm">Show WhatsApp Icon above Bottom Nav</Label>
                        <Switch checked={settings.bottomNav?.showWhatsApp ?? true} onCheckedChange={(c) => updateSection('bottomNav', 'showWhatsApp', c)} />
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-sm mb-4">Nav Items (Drag to Reorder)</h4>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={settings.bottomNav.items.map(i => i.key)} strategy={verticalListSortingStrategy}>
                            {settings.bottomNav.items.map(item => (
                              <SortableNavItem key={item.key} item={item} updateItem={updateBottomNavItem} />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SPACING */}
            <TabsContent value="spacing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Global Spacing & Padding</CardTitle>
                  <p className="text-sm text-muted-foreground">Enter positive values for standard spacing, or negative values to create overlap and extended boundaries.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-foreground">Page Padding</h4>
                      <div className="space-y-2">
                        <Label>Left/Right Padding (px)</Label>
                        <Input 
                          type="number" 
                          value={settings.pagePadding?.horizontal ?? ''} 
                          onChange={(e) => updateSection('pagePadding', 'horizontal', handleNumberInput(e.target.value))} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Top/Bottom Padding (px)</Label>
                        <Input 
                          type="number" 
                          value={settings.pagePadding?.vertical ?? ''} 
                          onChange={(e) => updateSection('pagePadding', 'vertical', handleNumberInput(e.target.value))} 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-foreground">Section Spacing</h4>
                      <div className="space-y-2">
                        <Label>Vertical Gap Between Sections (px)</Label>
                        <Input 
                          type="number" 
                          value={settings.sectionSpacing !== undefined ? settings.sectionSpacing : 16} 
                          onChange={(e) => updateTopLevel('sectionSpacing', handleNumberInput(e.target.value, 16))} 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="font-semibold text-center mb-4 text-gray-500 uppercase tracking-wider text-sm">Live Preview</h3>
            <MobileLayoutPreviewRenderer settings={settings} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminMobileLayout;
