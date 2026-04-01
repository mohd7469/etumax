
import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Trash, GripVertical, Plus, Image as ImageIcon } from 'lucide-react';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
        className="pt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-grow min-w-0">{children}</div>
    </div>
  );
};

const AdminImageLinkCarouselEditor = ({ settings, setSettings }) => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);

  const speedValue = settings.speed || 30;
  const items = settings.items || [];

  const handleOpenMedia = (index) => {
    setActiveItemIndex(index);
    setIsMediaModalOpen(true);
  };

  const handleImageSelect = (url) => {
    if (activeItemIndex !== null) {
      setSettings(s => ({
        ...s,
        items: (s.items || []).map((item, i) => i === activeItemIndex ? { ...item, image: url } : item)
      }));
    }
    setIsMediaModalOpen(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSettings((s) => {
        const currentItems = s.items || [];
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        return { ...s, items: arrayMove(currentItems, oldIndex, newIndex) };
      });
    }
  };

  const addItem = () => {
    setSettings(s => ({
      ...s,
      items: [...(s.items || []), { id: `item_${Date.now()}`, image: '', link: '' }]
    }));
  };

  const removeItem = (id) => {
    setSettings(s => ({
      ...s,
      items: (s.items || []).filter(item => item.id !== id)
    }));
  };

  const updateItem = (index, field, value) => {
    setSettings(s => ({
      ...s,
      items: (s.items || []).map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Carousel Settings</CardTitle>
          <CardDescription>Configure the title and speed of the image carousel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input 
              placeholder="e.g., Our Partners" 
              value={settings.title || ''} 
              onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} 
              className="mt-1"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Image Links</CardTitle>
          <CardDescription>Add images and their destination URLs. Drag to reorder.</CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 mb-4">
                {items.length === 0 && (
                  <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground text-sm">
                    No images added yet. Click "Add Image Link" below.
                  </div>
                )}
                {items.map((item, index) => (
                  <SortableItem key={item.id} id={item.id}>
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                      <div className="flex-shrink-0 w-full md:w-32">
                        {item.image ? (
                          <div className="relative group">
                            <img src={item.image} alt="Preview" className="w-full h-20 object-cover rounded-md border" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                              <Button size="sm" variant="secondary" onClick={() => handleOpenMedia(index)}>Change</Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="w-full h-20 bg-muted border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                            onClick={() => handleOpenMedia(index)}
                          >
                            <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground">Select Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow space-y-2">
                        <div>
                          <Label className="text-xs">Image URL</Label>
                          <Input 
                            placeholder="https://..." 
                            value={item.image} 
                            onChange={(e) => updateItem(index, 'image', e.target.value)} 
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Link Destination (URL)</Label>
                          <Input 
                            placeholder="https://example.com" 
                            value={item.link} 
                            onChange={(e) => updateItem(index, 'link', e.target.value)} 
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button onClick={addItem} variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Add Image Link
          </Button>
        </CardContent>
      </Card>

      <MediaLibraryModal 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)} 
        onSelectImage={handleImageSelect} 
        uploadPath="carousel-images"
      />
    </div>
  );
};

export default AdminImageLinkCarouselEditor;
