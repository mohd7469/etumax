
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { getDocument, setDocument } from '@/lib/firestoreService';
import { Loader2, Save } from 'lucide-react';

const defaultSettings = {
  heading: "Get in Touch",
  subtitle: "We'd love to hear from you. Send us your question and our team will get back to you.",
  cards: {
    phone: { enabled: true, title: 'Phone', value: '+1 (555) 123-4567', order: 1 },
    whatsapp: { enabled: true, title: 'WhatsApp', value: '+1 (555) 987-6543', order: 2 },
    email: { enabled: true, title: 'Email', value: 'support@example.com', order: 3 },
    address: { enabled: true, title: 'Address', value: '123 Commerce St, Suite 100\nNew York, NY 10001', order: 4 },
    workingHours: { enabled: true, title: 'Working Hours', value: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat - Sun: Closed', order: 5 }
  }
};

const AdminContactPageSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getDocument('settings', 'contactPageSettings');
        if (data) {
          setSettings({
            ...defaultSettings,
            ...data,
            cards: {
              ...defaultSettings.cards,
              ...(data.cards || {})
            }
          });
        }
      } catch (error) {
        console.error("Error fetching contact page settings:", error);
        toast({ variant: 'destructive', title: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (cardKey, field, value) => {
    setSettings(prev => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardKey]: {
          ...prev.cards[cardKey],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDocument('settings', 'contactPageSettings', {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      toast({ title: 'Contact page settings saved successfully' });
    } catch (error) {
      console.error("Error saving contact page settings:", error);
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

  const cardConfig = [
    { key: 'phone', label: 'Phone' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'email', label: 'Email Address' },
    { key: 'address', label: 'Physical Address' },
    { key: 'workingHours', label: 'Working Hours' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Header Section</CardTitle>
          <CardDescription>Configure the main title and subtitle for the contact page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heading">Page Heading</Label>
            <Input id="heading" name="heading" value={settings.heading} onChange={handleGeneralChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea id="subtitle" name="subtitle" value={settings.subtitle} onChange={handleGeneralChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information Cards</CardTitle>
          <CardDescription>Manage the contact details displayed on the page. Use the order number to sort them.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cardConfig.map(({ key, label }) => {
            const cardData = settings.cards[key];
            return (
              <div key={key} className={`p-4 border rounded-xl space-y-4 ${!cardData.enabled ? 'bg-muted/50 opacity-70' : 'bg-card'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Switch 
                      id={`enable-${key}`} 
                      checked={cardData.enabled} 
                      onCheckedChange={(val) => handleCardChange(key, 'enabled', val)} 
                    />
                    <Label htmlFor={`enable-${key}`} className="font-semibold text-base">{label} Card</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`order-${key}`} className="text-xs text-muted-foreground">Order:</Label>
                    <Input 
                      id={`order-${key}`} 
                      type="number" 
                      className="w-20 h-8" 
                      value={cardData.order} 
                      onChange={(e) => handleCardChange(key, 'order', parseInt(e.target.value) || 0)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${key}`}>Card Title</Label>
                    <Input 
                      id={`title-${key}`} 
                      value={cardData.title} 
                      onChange={(e) => handleCardChange(key, 'title', e.target.value)} 
                      disabled={!cardData.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`value-${key}`}>Card Value</Label>
                    <Textarea 
                      id={`value-${key}`} 
                      value={cardData.value} 
                      onChange={(e) => handleCardChange(key, 'value', e.target.value)}
                      className="min-h-[80px]"
                      disabled={!cardData.enabled}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      HTML supported (e.g., &lt;b&gt;bold&lt;/b&gt;, &lt;br&gt; for line break, &lt;a href='#'&gt;link&lt;/a&gt;)
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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

export default AdminContactPageSettings;
