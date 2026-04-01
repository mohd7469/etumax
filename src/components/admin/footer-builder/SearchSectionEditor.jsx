import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SearchSectionEditor = ({ section, onChange }) => {
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
        <Label>Search Placeholder</Label>
        <Input
          value={section.placeholder || 'Search...'}
          onChange={(e) => onChange({ ...section, placeholder: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Button Text</Label>
        <Input
          value={section.buttonText || 'Search'}
          onChange={(e) => onChange({ ...section, buttonText: e.target.value })}
        />
      </div>
    </div>
  );
};

export default SearchSectionEditor;