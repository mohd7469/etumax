
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getDocument, setDocument } from '@/lib/firestoreService';
import { Loader2, Save } from 'lucide-react';

const defaultSettings = {
  heading: 'Contact Us',
  subtitle: "We'd love to hear from you. Send us your question and our team will get back to you.",
  phone: '+1 (555) 123-4567',
  whatsapp: '+1 (555) 987-6543',
  email: 'support@example.com',
  address: '123 Commerce St, Suite 100\nNew York, NY 10001',
  workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat - Sun: Closed',
  mapEmbed: ''
};

const AdminContactSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getDocument('settings', 'contact');
        if (data) {
          setSettings({ ...defaultSettings, ...data });
        } else {
          await setDocument('settings', 'contact', defaultSettings);
        }
      } catch (error) {
        console.error("Error fetching contact settings:", error);
        toast({ variant: 'destructive', title: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDocument('settings', 'contact', settings);
      toast({ title: 'Settings saved successfully' });
    } catch (error) {
      console.error("Error saving contact settings:", error);
      toast({ variant: 'destructive', title: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contact Page Settings</h1>
        <p className="text-muted-foreground mt-1">Manage the content displayed on your public contact page</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
          <CardDescription>Hero section and introduction text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heading">Page Heading</Label>
            <Input id="heading" name="heading" value={settings.heading} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle / Intro Text</Label>
            <Textarea id="subtitle" name="subtitle" value={settings.subtitle} onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Details displayed in the contact info cards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={settings.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={settings.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input id="whatsapp" name="whatsapp" value={settings.whatsapp} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea id="address" name="address" value={settings.address} onChange={handleChange} className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours">Working Hours</Label>
              <Textarea id="workingHours" name="workingHours" value={settings.workingHours} onChange={handleChange} className="min-h-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Map Integration</CardTitle>
          <CardDescription>Optional Google Maps embed iframe code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapEmbed">Map Embed Code (HTML)</Label>
            <Textarea 
              id="mapEmbed" 
              name="mapEmbed" 
              value={settings.mapEmbed} 
              onChange={handleChange} 
              placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
              className="font-mono text-xs min-h-[120px]" 
            />
            <p className="text-xs text-muted-foreground">Go to Google Maps, find your location, click Share {'>'} Embed a map, and copy the HTML here.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminContactSettings;
