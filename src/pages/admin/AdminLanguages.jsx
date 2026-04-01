import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Save, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { MultiSelect } from '@/components/ui/multi-select';
import LanguageSwitcherWidget from '@/components/LanguageSwitcherWidget';

const AdminLanguages = () => {
  const { languageSettings, saveLanguageSettings, allLanguages } = useLanguage();
  const [settings, setSettings] = useState(languageSettings);
  const { toast } = useToast();

  useEffect(() => {
    setSettings(languageSettings);
  }, [languageSettings]);

  const handleSave = () => {
    saveLanguageSettings(settings);
    toast({
      title: 'Language Settings Saved! 🌍',
      description: 'Your translation settings have been updated.',
    });
  };

  const handleSwitchChange = (id, checked) => {
    setSettings(prev => ({ ...prev, [id]: checked }));
  };

  const handleSelectChange = (id, value) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const languageOptions = allLanguages.map(lang => ({
    value: lang.code,
    label: `${lang.flag} ${lang.name}`
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Globe />Languages</h1>
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Main Configuration</CardTitle>
              <CardDescription>Enable or disable translation and choose your method.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <Label htmlFor="enabled" className="font-semibold text-lg">Enable Language Switcher</Label>
                <Switch id="enabled" checked={settings.enabled} onCheckedChange={(checked) => handleSwitchChange('enabled', checked)} />
              </div>
              <div className="space-y-2">
                <Label>Translation Method</Label>
                <Select value={settings.method} onValueChange={(value) => handleSelectChange('method', value)} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gtranslate">GTranslate (Recommended)</SelectItem>
                    <SelectItem value="key-based" disabled>Key-based (Manual)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">GTranslate provides automatic translation for your entire site.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Widget Appearance</CardTitle>
              <CardDescription>Customize how the language switcher looks and behaves.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Widget Style</Label>
                  <Select value={settings.widgetStyle} onValueChange={(value) => handleSelectChange('widgetStyle', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                      <SelectItem value="flags">Flags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Widget Position</Label>
                  <Select value={settings.position} onValueChange={(value) => handleSelectChange('position', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Switch id="showFlags" checked={settings.showFlags} onCheckedChange={(c) => handleSwitchChange('showFlags', c)} />
                  <Label htmlFor="showFlags">Show Flags</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="showNames" checked={settings.showNames} onCheckedChange={(c) => handleSwitchChange('showNames', c)} />
                  <Label htmlFor="showNames">Show Language Names</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Language Configuration</CardTitle>
              <CardDescription>Choose which languages are available on your store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Original Language</Label>
                <Select value={settings.originalLanguage} onValueChange={(value) => handleSelectChange('originalLanguage', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {languageOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Available Languages</Label>
                <MultiSelect
                  options={languageOptions}
                  selected={settings.availableLanguages}
                  onChange={(selected) => handleSelectChange('availableLanguages', selected)}
                  placeholder="Select languages..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye /> Live Preview</CardTitle>
              <CardDescription>This is how your language switcher will appear to visitors.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Your website content would be here.</p>
                <LanguageSwitcherWidget />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminLanguages;