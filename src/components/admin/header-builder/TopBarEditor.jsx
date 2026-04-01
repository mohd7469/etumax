
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const TopBarEditor = ({ settings, onChange }) => {
  const topBar = settings.topBar || { show: false, text: '', bg: '#000', textColor: '#fff' };

  const handleChange = (key, value) => {
    onChange({ ...settings, topBar: { ...topBar, [key]: value } });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <Label>Enable Top Bar</Label>
        <Switch
          checked={topBar.show}
          onCheckedChange={(v) => handleChange('show', v)}
        />
      </div>

      {topBar.show && (
        <>
          <div className="space-y-2">
            <Label>Top Bar Text / Announcement</Label>
            <textarea
              value={topBar.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Enter announcement text or HTML code..."
              className="w-full min-h-[140px] px-3 py-2 resize-y rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              You can add plain text or HTML code (div, span, a, img, strong, p tags supported with inline styles)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={topBar.bg || '#000000'} onChange={e => handleChange('bg', e.target.value)} className="w-12 h-10 p-1" />
                <Input value={topBar.bg || '#000000'} onChange={e => handleChange('bg', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={topBar.textColor || '#ffffff'} onChange={e => handleChange('textColor', e.target.value)} className="w-12 h-10 p-1" />
                <Input value={topBar.textColor || '#ffffff'} onChange={e => handleChange('textColor', e.target.value)} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TopBarEditor;
