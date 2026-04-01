import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HeaderDesignSettings = ({ settings, onChange }) => {
  const design = settings.design || { bg: '#ffffff', text: '#000000', accent: '#3b82f6', border: '#e5e7eb', paddingY: '1rem', gap: '2rem' };

  const handleChange = (key, value) => {
    onChange({ ...settings, design: { ...design, [key]: value } });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Background</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.bg || '#ffffff'} onChange={e => handleChange('bg', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.bg || '#ffffff'} onChange={e => handleChange('bg', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Text/Icons</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.text || '#000000'} onChange={e => handleChange('text', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.text || '#000000'} onChange={e => handleChange('text', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Accent/Hover</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.accent || '#3b82f6'} onChange={e => handleChange('accent', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.accent || '#3b82f6'} onChange={e => handleChange('accent', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Border</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.border || '#e5e7eb'} onChange={e => handleChange('border', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.border || '#e5e7eb'} onChange={e => handleChange('border', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Spacing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vertical Padding</Label>
            <Select value={design.paddingY || '1rem'} onValueChange={v => handleChange('paddingY', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5rem">Compact (0.5rem)</SelectItem>
                <SelectItem value="1rem">Normal (1rem)</SelectItem>
                <SelectItem value="1.5rem">Relaxed (1.5rem)</SelectItem>
                <SelectItem value="2rem">Loose (2rem)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Element Gap</Label>
            <Select value={design.gap || '2rem'} onValueChange={v => handleChange('gap', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1rem">Tight (1rem)</SelectItem>
                <SelectItem value="2rem">Normal (2rem)</SelectItem>
                <SelectItem value="3rem">Loose (3rem)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderDesignSettings;