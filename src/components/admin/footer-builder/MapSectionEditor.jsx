import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

const MapSectionEditor = ({ section, onChange }) => {
  return (
    <div className="space-y-4 mt-4 p-4 border rounded-md bg-gray-50">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={section.title || ''}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Google Maps Embed URL / Iframe Src</Label>
        <Input
          placeholder="https://www.google.com/maps/embed?pb=..."
          value={section.mapUrl || ''}
          onChange={(e) => onChange({ ...section, mapUrl: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Map Height ({section.height || 200}px)</Label>
        <Slider
          value={[section.height || 200]}
          min={100} max={600} step={10}
          onValueChange={([val]) => onChange({ ...section, height: val })}
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Label>Full Width (Overrides columns)</Label>
        <Switch
          checked={section.fullWidth || false}
          onCheckedChange={(val) => onChange({ ...section, fullWidth: val })}
        />
      </div>
    </div>
  );
};

export default MapSectionEditor;