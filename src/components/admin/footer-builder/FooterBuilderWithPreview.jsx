import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone, Save, Undo } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import FooterStylePresets from './FooterStylePresets';
import FooterSectionManager from './FooterSectionManager';
import FooterDesignSettings from './FooterDesignSettings';
import FooterLivePreview from './FooterLivePreview';

import { useDesign } from '@/context/DesignContext';

const FooterBuilderWithPreview = () => {
  const { advancedFooterSettings, saveAdvancedFooterSettings, defaultAdvancedFooterSettings } = useDesign();
  const { toast } = useToast();

  const [localSettings, setLocalSettings] = useState(advancedFooterSettings || defaultAdvancedFooterSettings);
  const [deviceView, setDeviceView] = useState('desktop');

  useEffect(() => {
    if (advancedFooterSettings) {
      setLocalSettings(advancedFooterSettings);
    }
  }, [advancedFooterSettings]);

  const handleSave = () => {
    saveAdvancedFooterSettings(localSettings);
    toast({
      title: 'Footer Settings Saved! ✨',
      description: 'Your advanced footer has been updated live.',
    });
  };

  const handleDiscard = () => {
    setLocalSettings(advancedFooterSettings || defaultAdvancedFooterSettings);
    toast({ title: 'Changes discarded', variant: 'destructive' });
  };

  const isEnabled = localSettings.enabled || false;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
          <div>
            <h3 className="font-semibold text-lg">Advanced Footer</h3>
            <p className="text-sm text-gray-500">Enable advanced builder mode</p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(v) => setLocalSettings({ ...localSettings, enabled: v })}
          />
        </div>

        <div className={`flex-1 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col ${!isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <Tabs defaultValue="sections" className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="presets">Presets</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <TabsContent value="presets" className="mt-0">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Choose a starting point. This will override current colors and structure.</p>
                  <FooterStylePresets
                    currentPreset={localSettings.preset}
                    onSelectPreset={(newSettings) => setLocalSettings({ ...newSettings, enabled: true })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="sections" className="mt-0">
                <FooterSectionManager
                  settings={localSettings}
                  onUpdateSettings={setLocalSettings}
                />
              </TabsContent>

              <TabsContent value="design" className="mt-0">
                <FooterDesignSettings
                  settings={localSettings}
                  onUpdateSettings={setLocalSettings}
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-4 border-t bg-gray-50 flex gap-3">
            <Button variant="outline" className="w-1/2 bg-white" onClick={handleDiscard}>
              <Undo className="w-4 h-4 mr-2" /> Discard
            </Button>
            <Button className="w-1/2" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-3 border-b flex justify-between items-center bg-gray-50/80">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live Preview
          </h3>
          <div className="flex bg-white rounded-lg border shadow-sm p-1">
            <Button variant={deviceView === 'desktop' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setDeviceView('desktop')}><Monitor className="w-4 h-4" /></Button>
            <Button variant={deviceView === 'tablet' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setDeviceView('tablet')}><Tablet className="w-4 h-4" /></Button>
            <Button variant={deviceView === 'mobile' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setDeviceView('mobile')}><Smartphone className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {isEnabled ? (
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 lg:p-8">
              <FooterLivePreview settings={localSettings} deviceView={deviceView} />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-400">
              <div className="w-24 h-24 mb-4 opacity-20"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg></div>
              <p>Advanced Footer Builder is disabled.</p>
              <p className="text-sm mt-1">Enable it to use the new layout engine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterBuilderWithPreview;