import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const FooterDesignSettings = ({ settings, onUpdateSettings }) => {
  const design = settings.design || {};
  const bottomBar = settings.bottomBar || {};

  const handleDesignChange = (key, value) => {
    onUpdateSettings({
      ...settings,
      design: { ...design, [key]: value }
    });
  };

  const handleBottomBarChange = (key, value) => {
    onUpdateSettings({
      ...settings,
      bottomBar: { ...bottomBar, [key]: value }
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Background</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.bg || '#111827'} onChange={e => handleDesignChange('bg', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.bg || '#111827'} onChange={e => handleDesignChange('bg', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.text || '#F9FAFB'} onChange={e => handleDesignChange('text', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.text || '#F9FAFB'} onChange={e => handleDesignChange('text', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Link Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.link || '#9CA3AF'} onChange={e => handleDesignChange('link', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.link || '#9CA3AF'} onChange={e => handleDesignChange('link', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Link Hover Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.hover || '#FFFFFF'} onChange={e => handleDesignChange('hover', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.hover || '#FFFFFF'} onChange={e => handleDesignChange('hover', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={design.accent || '#3b82f6'} onChange={e => handleDesignChange('accent', e.target.value)} className="w-12 h-10 p-1" />
              <Input value={design.accent || '#3b82f6'} onChange={e => handleDesignChange('accent', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Typography & Spacing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vertical Padding</Label>
            <Select value={design.paddingY || '4rem'} onValueChange={v => handleDesignChange('paddingY', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2rem">Small (2rem)</SelectItem>
                <SelectItem value="4rem">Medium (4rem)</SelectItem>
                <SelectItem value="6rem">Large (6rem)</SelectItem>
                <SelectItem value="8rem">Extra Large (8rem)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Grid Gap</Label>
            <Select value={design.gap || '2rem'} onValueChange={v => handleDesignChange('gap', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1rem">Tight (1rem)</SelectItem>
                <SelectItem value="2rem">Normal (2rem)</SelectItem>
                <SelectItem value="3rem">Loose (3rem)</SelectItem>
                <SelectItem value="4rem">Wide (4rem)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Bottom Bar (Copyright)</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Bottom Bar</Label>
            <Switch checked={bottomBar.show !== false} onCheckedChange={v => handleBottomBarChange('show', v)} />
          </div>
          <div className="space-y-2">
            <Label>Copyright Text</Label>
            <Input value={bottomBar.copyright || ''} onChange={e => handleBottomBarChange('copyright', e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Social Icons</Label>
            <Switch checked={bottomBar.showSocial !== false} onCheckedChange={v => handleBottomBarChange('showSocial', v)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterDesignSettings;