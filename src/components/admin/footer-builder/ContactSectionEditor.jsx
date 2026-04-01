import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ContactSectionEditor = ({ section, onChange }) => {
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
        <Label>Address</Label>
        <Input
          value={section.address || ''}
          onChange={(e) => onChange({ ...section, address: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          value={section.phone || ''}
          onChange={(e) => onChange({ ...section, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={section.email || ''}
          onChange={(e) => onChange({ ...section, email: e.target.value })}
        />
      </div>
    </div>
  );
};

export default ContactSectionEditor;