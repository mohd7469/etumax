import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const PaymentIconsSectionEditor = ({ section, onChange }) => {
  const icons = section.icons || { visa: true, mastercard: true, paypal: true, amex: true, applepay: false, googlepay: false };

  const toggleIcon = (key, value) => {
    onChange({ ...section, icons: { ...icons, [key]: value } });
  };

  return (
    <div className="space-y-4 mt-4 p-4 border rounded-md bg-gray-50">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={section.title || 'Accepted Payments'}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        {Object.keys(icons).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="capitalize">{key}</Label>
            <Switch
              checked={icons[key]}
              onCheckedChange={(v) => toggleIcon(key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentIconsSectionEditor;