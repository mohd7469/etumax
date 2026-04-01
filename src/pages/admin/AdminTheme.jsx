import React, { useState, useEffect } from 'react';
import { useDesign } from '@/context/DesignContext';
import { useTheme } from '@/context/ThemeContext';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ColorPicker } from '@/components/ui/color-picker';
import { motion } from 'framer-motion';
import { Check, Palette, Loader as LoaderIcon, SlidersHorizontal, Paintbrush, Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';
import LoaderDesigns from '@/components/admin/LoaderDesigns';
import { themes } from '@/lib/themes';


// ================================
// THEME SELECTOR (WITH CUSTOM TILE)
// ================================
const ThemeSwitcher = () => {
  const { themes: allThemes, activeTheme, applyTheme } = useTheme();
  const { themeSettings } = useDesign(); // custom colors from Firebase

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6" />
          Theme Selector
        </CardTitle>
        <CardDescription>
          Select a theme or load your custom color palette.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {/* ⭐ CUSTOM THEME TILE */}
          <motion.div
            key="custom"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <button
              onClick={() => applyTheme("custom")}
              className={cn(
                "w-full p-4 border-2 rounded-lg text-left transition-all duration-300",
                activeTheme === "custom"
                  ? 'border-primary shadow-lg'
                  : 'border-border hover:border-primary hover:shadow-md'
              )}
            >
              <div className="flex justify-center mb-3">
                {Object.values(themeSettings)
                  .slice(0, 5)
                  .map((color, index) => (
                    <div
                      key={index}
                      className="h-6 w-6 rounded-full -mr-2 border-2 border-card"
                      style={{ backgroundColor: color }}
                    />
                  ))}
              </div>

              <p className="font-semibold text-center text-sm">Custom Theme</p>
            </button>

            {activeTheme === "custom" && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            )}
          </motion.div>

          {/* DEFAULT / BUILT-IN THEMES */}
          {Object.entries(allThemes).map(([key, theme]) => {
            if (key === "custom") return null; // already handled above

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <button
                  onClick={() => applyTheme(key)}
                  className={cn(
                    "w-full p-4 border-2 rounded-lg text-left transition-all duration-300",
                    activeTheme === key
                      ? 'border-primary shadow-lg'
                      : 'border-border hover:border-primary hover:shadow-md'
                  )}
                >
                  <div className="flex justify-center mb-3">
                    {Object.values(theme.colors)
                      .slice(6, 11)
                      .map((color, index) => (
                        <div
                          key={index}
                          className="h-6 w-6 rounded-full -mr-2 border-2 border-card"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                  </div>

                  <p className="font-semibold text-center text-sm">{theme.name}</p>
                </button>

                {activeTheme === key && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {activeTheme === 'custom' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
            You are using a custom theme. Edit the colors below to modify your Custom theme.
          </div>
        )}
      </CardContent>
    </Card>
  );
};


// ================================
// MAIN PAGE
// ================================
const AdminTheme = () => {
  const {
    themeSettings, setThemeSettings,
    typography, setTypography,
    buttonStyles, setButtonStyles,
    loaderSettings, saveLoaderSettings: saveLoaderSettingsToContext,
  } = useDesign();

  const [localTheme, setLocalTheme] = useState(themeSettings);
  const [localTypography, setLocalTypography] = useState(typography);
  const [localButtonStyles, setLocalButtonStyles] = useState(buttonStyles);
  const [localLoaderSettings, setLocalLoaderSettings] = useState(loaderSettings);


  // Sync local state with saved DB state
  useEffect(() => {
    setLocalTheme(themeSettings);
    setLocalTypography(typography);
    setLocalButtonStyles(buttonStyles);
    setLocalLoaderSettings(loaderSettings);
  }, [themeSettings, typography, buttonStyles, loaderSettings]);


  // Helper to save custom theme
  const saveThemeSettings = () => {
    setThemeSettings(localTheme);
    toast({
      title: 'Custom Theme Saved',
      description: 'Your custom color palette has been applied.',
    });
  };


  const saveTypographySettings = () => {
    setTypography(localTypography);
    toast({
      title: 'Typography Saved',
      description: 'Your font settings have been updated.',
    });
  };

  const saveButtonSettings = () => {
    setButtonStyles(localButtonStyles);
    toast({
      title: 'Button Styles Saved',
      description: 'Your button style settings have been updated.',
    });
  };


  const saveLoaderSettings = () => {
    saveLoaderSettingsToContext(localLoaderSettings);
    toast({
      title: 'Loader Settings Saved',
      description: 'Loader style updated.',
    });
  };


  const ColorInput = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <ColorPicker color={value} onChange={onChange} />
    </div>
  );


  const FontSelect = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {[
            "Inter", "Roboto", "Poppins", "Montserrat", "Open Sans",
            "Lato", "Merriweather", "Playfair Display", "Source Sans Pro",
            "SF Pro Display", "SF Pro Text", "Segoe UI"
          ].map(font => (
            <SelectItem key={font} value={font}>{font}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 p-4 md:p-8"
    >
      <h1 className="text-3xl font-bold">Theme & Appearance</h1>

      {/* ======================= */}
      {/* THEME SELECTOR          */}
      {/* ======================= */}
      <ThemeSwitcher />


      {/* ======================= */}
      {/* TABS                    */}
      {/* ======================= */}
      <Tabs defaultValue="colors" className="w-full">

        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors"><Palette className="mr-2 h-4 w-4" /> Colors</TabsTrigger>
          <TabsTrigger value="typography"><SlidersHorizontal className="mr-2 h-4 w-4" /> Typography</TabsTrigger>
          <TabsTrigger value="buttons"><Paintbrush className="mr-2 h-4 w-4" /> Buttons</TabsTrigger>
          <TabsTrigger value="loader"><LoaderIcon className="mr-2 h-4 w-4" /> Loader</TabsTrigger>
        </TabsList>


        {/* ======================= */}
        {/* COLORS TAB              */}
        {/* ======================= */}
        <TabsContent value="colors" className="mt-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Custom Color Palette</CardTitle>
                <CardDescription>Edit your store’s color system.</CardDescription>
              </div>
              <Button onClick={saveThemeSettings}>
                <Check className="mr-2 h-4 w-4" />
                Save Custom
              </Button>
            </CardHeader>

            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(localTheme).map(([key, value]) => (
                <ColorInput
                  key={key}
                  label={key.replace(/-/g, ' ').toUpperCase()}
                  value={value}
                  onChange={(c) => setLocalTheme(prev => ({ ...prev, [key]: c }))}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>


        {/* ======================= */}
        {/* TYPOGRAPHY TAB          */}
        {/* ======================= */}
        <TabsContent value="typography" className="mt-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Typography Settings</CardTitle>
                <CardDescription>Select heading & body fonts.</CardDescription>
              </div>
              <Button onClick={saveTypographySettings}>
                <Check className="mr-2 h-4 w-4" />
                Save
              </Button>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FontSelect
                label="Heading Font"
                value={localTypography.headingFont}
                onChange={(v) =>
                  setLocalTypography((prev) => ({ ...prev, headingFont: v }))
                }
              />
              <FontSelect
                label="Body Font"
                value={localTypography.bodyFont}
                onChange={(v) =>
                  setLocalTypography((prev) => ({ ...prev, bodyFont: v }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>


        {/* ======================= */}
        {/* BUTTON TAB              */}
        {/* ======================= */}
        <TabsContent value="buttons" className="mt-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Button Styles</CardTitle>
                <CardDescription>Customize button radius, color & shadow.</CardDescription>
              </div>
              <Button onClick={saveButtonSettings}>
                <Check className="mr-2 h-4 w-4" />
                Save
              </Button>
            </CardHeader>

            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ColorInput
                label="Button Background"
                value={localButtonStyles.background}
                onChange={(c) => setLocalButtonStyles(prev => ({ ...prev, background: c }))}
              />

              <ColorInput
                label="Button Text"
                value={localButtonStyles.text}
                onChange={(c) => setLocalButtonStyles(prev => ({ ...prev, text: c }))}
              />

              <div className="space-y-2">
                <Label>Button Shape</Label>
                <Select
                  value={localButtonStyles.shape}
                  onValueChange={(v) => setLocalButtonStyles(prev => ({ ...prev, shape: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Shape" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0px">Square</SelectItem>
                    <SelectItem value="4px">Rounded</SelectItem>
                    <SelectItem value="8px">More Rounded</SelectItem>
                    <SelectItem value="9999px">Pill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Button Shadow</Label>
                <Input
                  value={localButtonStyles.shadow}
                  onChange={(e) =>
                    setLocalButtonStyles(prev => ({ ...prev, shadow: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* ======================= */}
        {/* LOADER TAB              */}
        {/* ======================= */}
        <TabsContent value="loader" className="mt-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Website Loader</CardTitle>
                <CardDescription>Customize the loading animation.</CardDescription>
              </div>
              <Button onClick={saveLoaderSettings}>
                <Check className="mr-2 h-4 w-4" />
                Save
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              <Label>Loader Style</Label>
              <LoaderDesigns
                selectedStyle={localLoaderSettings.style}
                onSelect={(style) => setLocalLoaderSettings(prev => ({ ...prev, style }))}
                color={localLoaderSettings.color}
                size={localLoaderSettings.size}
              />

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={localLoaderSettings.enabled}
                    onCheckedChange={(c) =>
                      setLocalLoaderSettings(prev => ({ ...prev, enabled: c }))
                    }
                  />
                  <Label>Enable Loader</Label>
                </div>

                <ColorInput
                  label="Loader Color"
                  value={localLoaderSettings.color}
                  onChange={(c) =>
                    setLocalLoaderSettings(prev => ({ ...prev, color: c }))
                  }
                />

                <ColorInput
                  label="Background Color"
                  value={localLoaderSettings.backgroundColor}
                  onChange={(c) =>
                    setLocalLoaderSettings(prev => ({ ...prev, backgroundColor: c }))
                  }
                />

                <div className="space-y-2">
                  <Label>Size: {localLoaderSettings.size}px</Label>
                  <Slider
                    value={[localLoaderSettings.size]}
                    onValueChange={([v]) =>
                      setLocalLoaderSettings(prev => ({ ...prev, size: v }))
                    }
                    min={20}
                    max={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hide Delay (seconds)</Label>
                  <Input
                    value={localLoaderSettings.delay}
                    onChange={(e) =>
                      setLocalLoaderSettings(prev => ({
                        ...prev,
                        delay: parseFloat(e.target.value) || 0
                      }))
                    }
                    type="number"
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </motion.div>
  );
};

export default AdminTheme;