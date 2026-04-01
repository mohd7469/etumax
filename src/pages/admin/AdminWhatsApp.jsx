import React from 'react';
import { useWhatsApp } from '@/context/WhatsAppContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminWhatsApp = () => {
  const { settings, updateSettings } = useWhatsApp();

  const handleSave = () => {
    updateSettings(settings);
    toast({
      title: 'Settings Saved! ✅',
      description: 'Your WhatsApp settings have been updated.',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">WhatsApp Settings</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure the main functionality of the WhatsApp button.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="wa-enabled" className="font-semibold">Enable WhatsApp Button</Label>
                <Switch
                  id="wa-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSettings({ ...settings, enabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-number">WhatsApp Number</Label>
                <Input
                  id="wa-number"
                  placeholder="e.g., 15551234567 (with country code)"
                  value={settings.phoneNumber}
                  onChange={(e) => updateSettings({ ...settings, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-message">Default Message</Label>
                <Textarea
                  id="wa-message"
                  placeholder="Hello! I'm interested in..."
                  value={settings.defaultMessage}
                  onChange={(e) => updateSettings({ ...settings, defaultMessage: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Use placeholders: `[TITLE]` for product title, `[PRICE]` for product price, and `[URL]` for the page URL.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display & Visibility</CardTitle>
              <CardDescription>Control where and how the button appears.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Button Position</Label>
                  <Select
                    value={settings.position}
                    onValueChange={(value) => updateSettings({ ...settings, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Button Size</Label>
                  <Select
                    value={settings.size}
                    onValueChange={(value) => updateSettings({ ...settings, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-icon-url">Custom Icon URL</Label>
                <Input
                  id="wa-icon-url"
                  placeholder="https://example.com/icon.png"
                  value={settings.iconUrl || ''}
                  onChange={(e) => updateSettings({ ...settings, iconUrl: e.target.value })}
                />
                <p className="text-xs text-gray-500">Leave blank to use the default WhatsApp icon.</p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wa-desktop" className="font-semibold">Show on Desktop</Label>
                <Switch
                  id="wa-desktop"
                  checked={settings.showOnDesktop}
                  onCheckedChange={(checked) => updateSettings({ ...settings, showOnDesktop: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wa-mobile" className="font-semibold">Show on Mobile</Label>
                <Switch
                  id="wa-mobile"
                  checked={settings.showOnMobile}
                  onCheckedChange={(checked) => updateSettings({ ...settings, showOnMobile: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See how your button will look on the site.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">Preview Area</p>
                {settings.enabled && (
                  <div
                    className={`absolute bottom-4 ${settings.position === 'left' ? 'left-4' : 'right-4'}`}
                  >
                    <div
                      className={`
                        ${settings.size === 'sm' ? 'w-12 h-12' : ''}
                        ${settings.size === 'md' ? 'w-14 h-14' : ''}
                        ${settings.size === 'lg' ? 'w-16 h-16' : ''}
                        bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg overflow-hidden
                      `}
                    >
                      {settings.iconUrl ? (
                        <img src={settings.iconUrl} alt="WhatsApp Icon" className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg"
                          className={`
                            ${settings.size === 'sm' ? 'w-6 h-6' : ''}
                            ${settings.size === 'md' ? 'w-7 h-7' : ''}
                            ${settings.size === 'lg' ? 'w-8 h-8' : ''}
                          `}
                          viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.225 4.485 4.574-1.196z" /></svg>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminWhatsApp;