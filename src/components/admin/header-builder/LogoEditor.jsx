import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LogoEditor = ({ settings, onChange }) => {
  const logo = settings.logo || { type: 'text', text: 'Store', align: 'left', url: '' };

  const handleChange = (key, value) => {
    onChange({ ...settings, logo: { ...logo, [key]: value } });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="space-y-2">
        <Label>Logo Type</Label>
        <Select value={logo.type} onValueChange={(v) => handleChange('type', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text Logo</SelectItem>
            <SelectItem value="image">Image Logo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logo.type === 'text' ? (
        <div className="space-y-2">
          <Label>Logo Text</Label>
          <Input
            value={logo.text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            placeholder="https://..."
            value={logo.url || ''}
            onChange={(e) => handleChange('url', e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Logo Alignment</Label>
        <Select value={logo.align || 'left'} onValueChange={(v) => handleChange('align', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LogoEditor;