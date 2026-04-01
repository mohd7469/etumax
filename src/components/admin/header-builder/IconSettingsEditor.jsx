import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const IconSettingsEditor = ({ settings, onChange }) => {
  const icons = settings.icons || { cart: true, wishlist: true, account: true, language: false };

  const handleChange = (key, value) => {
    onChange({ ...settings, icons: { ...icons, [key]: value } });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label>Show Cart</Label>
          <Switch checked={icons.cart} onCheckedChange={(v) => handleChange('cart', v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Show Wishlist</Label>
          <Switch checked={icons.wishlist} onCheckedChange={(v) => handleChange('wishlist', v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Show Account</Label>
          <Switch checked={icons.account} onCheckedChange={(v) => handleChange('account', v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Show Language</Label>
          <Switch checked={icons.language} onCheckedChange={(v) => handleChange('language', v)} />
        </div>
      </div>
    </div>
  );
};

export default IconSettingsEditor;