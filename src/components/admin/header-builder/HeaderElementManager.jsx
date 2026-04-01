import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { GripVertical } from 'lucide-react';

const HeaderElementManager = ({ settings, onChange }) => {
  const elements = settings.elements || ['logo', 'search', 'nav', 'icons'];
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const items = [...elements];
    const draggedItemContent = items[draggedItem];
    items.splice(draggedItem, 1);
    items.splice(index, 0, draggedItemContent);

    onChange({ ...settings, elements: items });
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getElementLabel = (el) => {
    switch (el) {
      case 'logo': return 'Logo / Branding';
      case 'search': return 'Search Bar';
      case 'nav': return 'Navigation Menu';
      case 'icons': return 'Action Icons (Cart, Account)';
      default: return el;
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <Label>Desktop Header Layout Order (Drag to reorder)</Label>
      <div className="space-y-2 mt-2">
        {elements.map((el, i) => (
          <div
            key={el}
            className="flex items-center gap-3 p-3 bg-white border rounded shadow-sm"
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
            <span className="font-medium text-sm">{getElementLabel(el)}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Note: Mobile layout automatically stacks elements optimally.</p>
    </div>
  );
};

export default HeaderElementManager;