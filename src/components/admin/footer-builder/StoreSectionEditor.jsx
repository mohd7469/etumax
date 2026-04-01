import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const StoreSectionEditor = ({ section, onChange }) => {
  return (
    <div className="space-y-4 mt-4 p-4 border rounded-md bg-gray-50">
      <div className="space-y-2">
        <Label>Store Name / Title</Label>
        <Input
          value={section.title || ''}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={section.content || ''}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Opening Hours</Label>
        <Input
          value={section.hours || ''}
          placeholder="e.g. Mon-Fri: 9am - 5pm"
          onChange={(e) => onChange({ ...section, hours: e.target.value })}
        />
      </div>
    </div>
  );
};

export default StoreSectionEditor;