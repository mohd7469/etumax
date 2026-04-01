import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Trash2 } from 'lucide-react';

const NavigationMenuEditor = ({ settings, onChange }) => {
  const nav = settings.nav || { align: 'center', links: [] };
  const links = nav.links || [];

  const [draggedItem, setDraggedItem] = useState(null);

  const handleChange = (key, value) => {
    onChange({ ...settings, nav: { ...nav, [key]: value } });
  };

  const updateLink = (index, key, value) => {
    const newLinks = [...links];
    newLinks[index][key] = value;
    handleChange('links', newLinks);
  };

  const addLink = () => {
    handleChange('links', [...links, { text: 'New Link', url: '#' }]);
  };

  const removeLink = (index) => {
    handleChange('links', links.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const items = [...links];
    const draggedItemContent = items[draggedItem];
    items.splice(draggedItem, 1);
    items.splice(index, 0, draggedItemContent);

    handleChange('links', items);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="space-y-2">
        <Label>Menu Alignment</Label>
        <Select value={nav.align || 'center'} onValueChange={(v) => handleChange('align', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Navigation Links</Label>
        {links.map((link, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 bg-white border rounded"
            onDragOver={(e) => handleDragOver(e, i)}
          >
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              className="cursor-grab p-1 text-gray-400 hover:text-black"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <Input
              placeholder="Link Text"
              value={link.text || ''}
              onChange={(e) => updateLink(i, 'text', e.target.value)}
            />
            <Input
              placeholder="URL"
              value={link.url || ''}
              onChange={(e) => updateLink(i, 'url', e.target.value)}
            />
            <Button variant="ghost" size="icon" onClick={() => removeLink(i)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addLink} className="mt-2 w-full border-dashed">
          + Add Link
        </Button>
      </div>
    </div>
  );
};

export default NavigationMenuEditor;