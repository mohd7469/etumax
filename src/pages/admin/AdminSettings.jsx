import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIntegrations } from '@/context/IntegrationContext';
import { listenToDocument, setDocument } from '@/lib/firestoreService';
import { Link } from 'react-router-dom';
import { useSeo } from '@/context/SeoContext';

const AdminSettings = () => {
  const { syncedPages } = useIntegrations();
  const { generalSettings: seoSettings, saveGeneralSettings } = useSeo();

  const [settings, setSettings] = useState({
    storeName: '',
    storeUrl: '',
    siteIcon: '',
    maintenanceMode: false,
    currency: 'AED',
    currencySymbol: 'AED',
    currencyPosition: 'before',
    notificationPosition: 'bottom-right',
    notificationsEnabled: true,
    continueShoppingLink: '/',
    deliveryCharge: '',
    freeShippingThreshold: '',
  });

  const [currentSeoSettings, setCurrentSeoSettings] = useState(seoSettings);

  const currencies = {
    AED: { symbol: 'د.إ', name: 'UAE Dirham' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    INR: { symbol: '₹', name: 'Indian Rupee' },
  };

  const localPages = JSON.parse(localStorage.getItem('shophub_local_pages') || '[]');
  const allPages = [
    { slug: '/', title: 'Home Page' },
    { slug: '/products', title: 'All Products' },
    ...localPages.map(p => ({ slug: p.path, title: p.title })),
    ...(syncedPages || []).map(p => ({ slug: p.path, title: p.title }))
  ];


  useEffect(() => {
    const unsubscribe = listenToDocument('settings', 'generalSettings', (data) => {
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentSeoSettings(seoSettings);
  }, [seoSettings]);

  const handleSave = async () => {
    await setDocument('settings', 'generalSettings', settings);
    saveGeneralSettings(currentSeoSettings);

    toast({
      title: 'Settings Saved! ✅',
      description: 'Your website settings have been updated.',
    });
    window.dispatchEvent(new Event('settings_updated'));
  };

  const handleInputChange = (e) => {
    const { id, value, type } = e.target;
    setSettings(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSeoInputChange = (e) => {
    const { id, value } = e.target;
    setCurrentSeoSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id, checked) => {
    setSettings(prev => ({ ...prev, [id]: checked }));
  };

  const handleCurrencyChange = (value) => {
    setSettings(prev => ({ ...prev, currency: value, currencySymbol: currencies[value].symbol }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Website Settings</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Manage your store's basic information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" value={settings.storeName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Site Title</Label>
              <Input id="title" placeholder="Your Site Title" value={currentSeoSettings?.title || ''} onChange={handleSeoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Site Tagline / Description</Label>
              <Input id="metaDescription" placeholder="Your site's tagline or meta description" value={currentSeoSettings?.metaDescription || ''} onChange={handleSeoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeUrl">Store URL</Label>
              <Input id="storeUrl" type="url" value={settings.storeUrl} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteIcon">Site Icon URL</Label>
              <Input id="siteIcon" type="url" placeholder="https://example.com/favicon.ico" value={settings.siteIcon} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                For more advanced SEO options, visit the <Link to="/admin/seo" className="text-purple-600 hover:underline">SEO Settings</Link> page.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Settings</CardTitle>
            <CardDescription>Configure the currency for your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Store Currency</Label>
              <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger><SelectValue placeholder="Select a currency" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([code, { name }]) => (
                    <SelectItem key={code} value={code}>{name} ({code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency Position</Label>
              <Select value={settings.currencyPosition} onValueChange={value => setSettings(prev => ({ ...prev, currencyPosition: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before amount (e.g., $100)</SelectItem>
                  <SelectItem value="after">After amount (e.g., 100$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping & Delivery</CardTitle>
            <CardDescription>Set delivery costs and thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="deliveryCharge">Delivery Charge</Label>
              <Input id="deliveryCharge" type="number" value={settings.deliveryCharge} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
              <Input id="freeShippingThreshold" type="number" value={settings.freeShippingThreshold} onChange={handleInputChange} />
              <p className="text-xs text-gray-500">Orders over this amount get free shipping.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Customize toast notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
              <Switch id="notificationsEnabled" checked={settings.notificationsEnabled} onCheckedChange={(checked) => handleSwitchChange('notificationsEnabled', checked)} />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={settings.notificationPosition} onValueChange={value => setSettings(prev => ({ ...prev, notificationPosition: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cart Settings</CardTitle>
            <CardDescription>Customize cart page behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Continue Shopping Link</Label>
              <Select value={settings.continueShoppingLink} onValueChange={value => setSettings(prev => ({ ...prev, continueShoppingLink: value }))}>
                <SelectTrigger><SelectValue placeholder="Select a page..." /></SelectTrigger>
                <SelectContent>
                  {allPages.map(page => (
                    <SelectItem key={page.slug} value={page.slug}>{page.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
            <CardDescription>Temporarily take your store offline.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <Label htmlFor="maintenanceMode" className="font-semibold">Enable Maintenance Mode</Label>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSwitchChange('maintenanceMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminSettings;