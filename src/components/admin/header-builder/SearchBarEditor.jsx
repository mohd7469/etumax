import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SearchBarEditor = ({ settings, onChange }) => {
  const search = settings.search || { show: true, placeholder: 'Search products...', width: 'full' };

  const handleChange = (key, value) => {
    onChange({ ...settings, search: { ...search, [key]: value } });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <Label>Show Search Bar</Label>
        <Switch
          checked={search.show}
          onCheckedChange={(v) => handleChange('show', v)}
        />
      </div>

      {search.show && (
        <>
          <div className="space-y-2">
            <Label>Placeholder Text</Label>
            <Input
              value={search.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Width Style</Label>
            <Select value={search.width || 'full'} onValueChange={(v) => handleChange('width', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width (Expanded)</SelectItem>
                <SelectItem value="auto">Auto (Compact)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchBarEditor;