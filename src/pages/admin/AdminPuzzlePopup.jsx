
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, LayoutTemplate, Settings as SettingsIcon, Image as ImageIcon, 
  Ticket, Play, HelpCircle, RefreshCw, Palette, EyeOff, Plus, Trash2, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { usePuzzlePopup } from '@/context/PuzzlePopupContext';
import AdminPuzzleTimerSettings from '@/components/admin/AdminPuzzleTimerSettings';
import HomePage from '@/pages/HomePage';

const AdminPuzzlePopup = () => {
  const { settings: initialSettings, saveSettings } = usePuzzlePopup();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Ensure images array exists when component mounts
    let loadedSettings = { ...initialSettings };
    if (!loadedSettings.images || loadedSettings.images.length === 0) {
      if (loadedSettings.image) {
        loadedSettings.images = [loadedSettings.image];
      } else {
        loadedSettings.images = ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=500&auto=format&fit=crop'];
      }
    }
    setSettings(loadedSettings);
  }, [initialSettings]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    const currentImages = settings.images || [];
    handleChange('images', [...currentImages, '']);
  };

  const handleUpdateImage = (index, value) => {
    const newImages = [...(settings.images || [])];
    newImages[index] = value;
    handleChange('images', newImages);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...(settings.images || [])];
    newImages.splice(index, 1);
    handleChange('images', newImages);
  };

  const handleSave = async () => {
    // Validation
    const validImages = (settings.images || []).filter(url => url && url.trim() !== '');
    if (validImages.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide at least one valid image URL.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const settingsToSave = {
        ...settings,
        images: validImages
      };
      
      await saveSettings(settingsToSave);
      toast({
        title: "Success",
        description: "Puzzle Popup settings saved successfully!",
      });
      
      // Update local state with cleaned images
      setSettings(settingsToSave);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  // Safe fallback for preview image
  const previewImage = settings.images && settings.images.length > 0 
    ? settings.images[0] 
    : (settings.image || '');

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={showPreview ? "grid grid-cols-1 xl:grid-cols-2 gap-8" : "max-w-5xl mx-auto"}>
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Puzzle Popup</h1>
              <p className="text-gray-500 mt-1">Configure the interactive sliding puzzle gamification modal.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreview}>
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />} 
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-6 mb-6">
              <TabsTrigger value="general"><SettingsIcon className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">General</span></TabsTrigger>
              <TabsTrigger value="content"><LayoutTemplate className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Content</span></TabsTrigger>
              <TabsTrigger value="coupon"><Ticket className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Coupon</span></TabsTrigger>
              <TabsTrigger value="puzzle"><ImageIcon className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Puzzle</span></TabsTrigger>
              <TabsTrigger value="timer"><Clock className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Timer</span></TabsTrigger>
              <TabsTrigger value="design"><Palette className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Design</span></TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activation & Behavior</CardTitle>
                  <CardDescription>Control when and how the popup appears.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Enable Puzzle Popup</Label>
                      <p className="text-sm text-gray-500">Turn the puzzle modal on or off across the store.</p>
                    </div>
                    <Switch 
                      checked={settings.enabled} 
                      onCheckedChange={(val) => handleChange('enabled', val)} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Trigger Type</Label>
                      <Select 
                        value={settings.triggerType || 'delay'} 
                        onValueChange={(val) => handleChange('triggerType', val)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delay">Time Delay</SelectItem>
                          <SelectItem value="exit-intent">Exit Intent (Mouse Leave)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Delay Before Showing (seconds)</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={settings.delay ?? 5} 
                        onChange={(e) => handleChange('delay', parseInt(e.target.value, 10))} 
                        disabled={settings.triggerType === 'exit-intent'}
                      />
                      {settings.triggerType === 'exit-intent' && (
                        <p className="text-xs text-muted-foreground mt-1">Delay is ignored for exit-intent trigger.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Show Frequency</Label>
                      <Select 
                        value={settings.showFrequency || 'once_session'} 
                        onValueChange={(val) => handleChange('showFrequency', val)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">Always (Every Page Load)</SelectItem>
                          <SelectItem value="once_session">Once per Browser Session</SelectItem>
                          <SelectItem value="once_day">Once per Day</SelectItem>
                          <SelectItem value="once_week">Once per Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Settings */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Text Content & Images</CardTitle>
                  <CardDescription>Customize messaging and the pool of puzzle images.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2">Pre-Solve State (The Pitch)</h3>
                    <div className="space-y-2">
                      <Label>Popup Title</Label>
                      <Input 
                        value={settings.title || ''} 
                        onChange={(e) => handleChange('title', e.target.value)} 
                        placeholder="Solve the Puzzle & Win!"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description / Instructions</Label>
                      <Textarea 
                        value={settings.description || ''} 
                        onChange={(e) => handleChange('description', e.target.value)} 
                        placeholder="Put the image back together to reveal your secret discount code."
                      />
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label>Puzzle Image URLs</Label>
                          <p className="text-xs text-muted-foreground">Add multiple images. Used randomly or sequentially if image cycling is enabled.</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
                          <Plus className="w-4 h-4 mr-1" /> Add Image
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {(settings.images || []).map((url, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input 
                                value={url} 
                                onChange={(e) => handleUpdateImage(index, e.target.value)} 
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveImage(index)}
                              disabled={(settings.images || []).length <= 1}
                              title={(settings.images || []).length <= 1 ? "At least one image is required" : "Remove image"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Preview mini-gallery */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(settings.images || []).filter(u => u.trim() !== '').map((url, idx) => (
                          <div key={idx} className="w-16 h-16 rounded-md overflow-hidden border bg-gray-100 relative group">
                            <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/100x100?text=Error'} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-8">
                    <h3 className="font-semibold border-b pb-2">Post-Solve State (The Reward)</h3>
                    <div className="space-y-2">
                      <Label>Success Title</Label>
                      <Input 
                        value={settings.successTitle || ''} 
                        onChange={(e) => handleChange('successTitle', e.target.value)} 
                        placeholder="Congratulations!"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Success Message</Label>
                      <Textarea 
                        value={settings.successMessage || ''} 
                        onChange={(e) => handleChange('successMessage', e.target.value)} 
                        placeholder="You solved it! Here is your reward:"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Call to Action Button Text</Label>
                      <Input 
                        value={settings.buttonText || 'Shop Now'} 
                        onChange={(e) => handleChange('buttonText', e.target.value)} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coupon Settings */}
            <TabsContent value="coupon" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reward Configuration</CardTitle>
                  <CardDescription>Set the discount code shown after solving.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Coupon Code</Label>
                    <Input 
                      value={settings.couponCode || ''} 
                      onChange={(e) => handleChange('couponCode', e.target.value)} 
                      placeholder="e.g. SUMMER20"
                      className="font-mono text-lg"
                    />
                    <p className="text-xs text-gray-500">Ensure this code exists in your store coupons.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Discount Type</Label>
                      <Select 
                        value={settings.discountType || 'percentage'} 
                        onValueChange={(val) => handleChange('discountType', val)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="free_shipping">Free Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Value</Label>
                      <Input 
                        type="number"
                        value={settings.discountValue || 0} 
                        onChange={(e) => handleChange('discountValue', parseInt(e.target.value, 10))} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Puzzle Settings */}
            <TabsContent value="puzzle" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Game Configuration</CardTitle>
                  <CardDescription>Set up the puzzle mechanics and difficulty.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Puzzle Type</Label>
                      <Select 
                        value={settings.puzzleType || 'sliding'} 
                        onValueChange={(val) => handleChange('puzzleType', val)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sliding">Sliding Tiles</SelectItem>
                          <SelectItem value="jigsaw">Jigsaw (Coming Soon)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Difficulty (Grid Size)</Label>
                      <Select 
                        value={(settings.difficulty || 3).toString()} 
                        onValueChange={(val) => handleChange('difficulty', parseInt(val, 10))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3x3 (Easy)</SelectItem>
                          <SelectItem value="4">4x4 (Medium)</SelectItem>
                          <SelectItem value="5">5x5 (Hard)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-gray-500" />
                        <Label className="mb-0">Allow Hints</Label>
                      </div>
                      <Switch 
                        checked={settings.allowHint} 
                        onCheckedChange={(val) => handleChange('allowHint', val)} 
                      />
                    </div>
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                        <Label className="mb-0">Allow Reshuffle</Label>
                      </div>
                      <Switch 
                        checked={settings.allowReshuffle} 
                        onCheckedChange={(val) => handleChange('allowReshuffle', val)} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timer Settings */}
            <TabsContent value="timer" className="space-y-6">
              <AdminPuzzleTimerSettings settings={settings} onChange={handleChange} onSave={handleSave} />
            </TabsContent>

            {/* Design Settings */}
            <TabsContent value="design" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Design Configuration</CardTitle>
                  <CardDescription>Customize the look and feel of the popup.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1 cursor-pointer" 
                          value={settings.backgroundColor || '#ffffff'} 
                          onChange={(e) => handleChange('backgroundColor', e.target.value)} 
                        />
                        <Input 
                          type="text" 
                          className="flex-1" 
                          value={settings.backgroundColor || '#ffffff'} 
                          onChange={(e) => handleChange('backgroundColor', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1 cursor-pointer" 
                          value={settings.textColor || '#000000'} 
                          onChange={(e) => handleChange('textColor', e.target.value)} 
                        />
                        <Input 
                          type="text" 
                          className="flex-1" 
                          value={settings.textColor || '#000000'} 
                          onChange={(e) => handleChange('textColor', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Button Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1 cursor-pointer" 
                          value={settings.buttonColor || '#8B5CF6'} 
                          onChange={(e) => handleChange('buttonColor', e.target.value)} 
                        />
                        <Input 
                          type="text" 
                          className="flex-1" 
                          value={settings.buttonColor || '#8B5CF6'} 
                          onChange={(e) => handleChange('buttonColor', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select 
                        value={settings.fontFamily || 'Inter'} 
                        onValueChange={(val) => handleChange('fontFamily', val)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Animation Style</Label>
                      <Select 
                        value={settings.animationStyle || 'spring'} 
                        onValueChange={(val) => handleChange('animationStyle', val)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spring">Spring Bounce</SelectItem>
                          <SelectItem value="fade">Fade In</SelectItem>
                          <SelectItem value="slide">Slide Up</SelectItem>
                          <SelectItem value="zoom">Zoom In</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="xl:col-span-1">
            <Card className="sticky top-6 shadow-xl border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/50 border-b">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center"><Play className="w-4 h-4 mr-2 text-primary" /> Live Preview</CardTitle>
                  <CardDescription>See how the popup looks with current settings.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="p-0 bg-muted/30">
                <div className="h-[700px] overflow-y-auto relative no-scrollbar">
                  <HomePage navigateTo={() => {}} isPreview={true} previewSettings={{ puzzlePopup: settings }} />
                  
                  {settings.enabled ? (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                      <div 
                        className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col"
                        style={{ 
                          backgroundColor: settings.backgroundColor || '#ffffff', 
                          color: settings.textColor || '#000000',
                          fontFamily: settings.fontFamily || 'Inter'
                        }}
                      >
                        <div className="p-6 text-center space-y-4">
                          <h2 className="text-2xl font-bold">{settings.title}</h2>
                          <p className="text-sm opacity-90">{settings.description}</p>
                          
                          {previewImage && (
                            <div className="w-full aspect-square rounded-lg overflow-hidden border-4 relative" style={{ borderColor: `${settings.buttonColor}40` }}>
                               <img src={previewImage} alt="Puzzle" className="w-full h-full object-cover opacity-80" />
                               <div 
                                  className="absolute inset-0 grid gap-1 p-1" 
                                  style={{ gridTemplateColumns: `repeat(${settings.difficulty || 3}, minmax(0, 1fr))` }}
                               >
                                 {[...Array((settings.difficulty || 3) * (settings.difficulty || 3))].map((_, i) => (
                                   <div key={i} className="bg-white/20 backdrop-blur-sm rounded-sm border border-white/40"></div>
                                 ))}
                               </div>
                            </div>
                          )}
                          
                          <Button 
                            className="w-full text-white border-0 hover:opacity-90 transition-opacity" 
                            style={{ backgroundColor: settings.buttonColor || '#8B5CF6' }}
                          >
                             {settings.buttonText || 'Play Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                      <div className="bg-white p-6 rounded-lg text-center shadow-lg max-w-xs w-full">
                        <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="font-bold text-lg text-gray-900">Popup is Disabled</h3>
                        <p className="text-gray-500 text-sm mt-2">Enable it in General Settings to see the preview overlay.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPuzzlePopup;
