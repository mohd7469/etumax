import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Plus, Trash, GripVertical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesign } from '@/context/DesignContext';
import { useIntegrations } from '@/context/IntegrationContext';
import Header from '@/components/layout/Header';
import FooterBuilderWithPreview from '@/components/admin/footer-builder/FooterBuilderWithPreview';
import HeaderBuilderWithPreview from '@/components/admin/header-builder/HeaderBuilderWithPreview';

const AdminHeaderFooter = () => {
  const { toast } = useToast();
  const { headerSettings, footerSettings, saveHeaderSettings, saveFooterSettings, initialHeaderSettings, initialFooterSettings } = useDesign();
  const { syncedPages } = useIntegrations();
  const localPages = JSON.parse(localStorage.getItem('shophub_local_pages') || '[]');
  const allPages = [...localPages, ...syncedPages];

  const [localHeaderSettings, setLocalHeaderSettings] = useState(JSON.parse(JSON.stringify(headerSettings)));
  const [localFooterSettings, setLocalFooterSettings] = useState(JSON.parse(JSON.stringify(footerSettings)));
  const [activeTab, setActiveTab] = useState('header-builder');

  const fontFamilies = ['sans-serif', 'serif', 'monospace', 'Arial', 'Georgia', 'Verdana', 'Poppins', 'Roboto'];

  const handleHeaderChange = (key, value) => setLocalHeaderSettings(prev => ({ ...prev, [key]: value }));
  const handleFooterChange = (key, value) => setLocalFooterSettings(prev => ({ ...prev, [key]: value }));

  const handleHeaderNavLinkChange = (index, key, value) => {
    const newLinks = [...localHeaderSettings.navLinks];
    newLinks[index][key] = value;
    handleHeaderChange('navLinks', newLinks);
  };

  const addHeaderNavLink = (page = null) => {
    const newLink = page ? { text: page.title, url: page.path } : { text: 'New Link', url: '/' };
    handleHeaderChange('navLinks', [...localHeaderSettings.navLinks, newLink]);
    toast({ title: "Link Added", description: `"${newLink.text}" added to header.` });
  };

  const removeHeaderNavLink = (index) => handleHeaderChange('navLinks', localHeaderSettings.navLinks.filter((_, i) => i !== index));

  const [draggedLink, setDraggedLink] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedLink(localHeaderSettings.navLinks[index]);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const draggedOverItem = localHeaderSettings.navLinks[index];
    if (draggedLink === draggedOverItem) return;

    let items = localHeaderSettings.navLinks.filter(item => item !== draggedLink);
    items.splice(index, 0, draggedLink);

    handleHeaderChange('navLinks', items);
  };

  const handleDragEnd = () => {
    setDraggedLink(null);
  };

  const handleFooterLinkColumnChange = (colIndex, linkIndex, key, value) => {
    const newFooter = { ...localFooterSettings };
    newFooter.linkColumns[colIndex].links[linkIndex][key] = value;
    setLocalFooterSettings(newFooter);
  }

  const addFooterLink = (colIndex, page) => {
    const newLink = { text: page.title, url: page.path };
    const newFooter = { ...localFooterSettings };
    newFooter.linkColumns[colIndex].links.push(newLink);
    setLocalFooterSettings(newFooter);
    toast({ title: "Link Added", description: `"${newLink.text}" added to footer.` });
  }

  const removeFooterLink = (colIndex, linkIndex) => {
    const newFooter = { ...localFooterSettings };
    newFooter.linkColumns[colIndex].links.splice(linkIndex, 1);
    setLocalFooterSettings(newFooter);
  }

  const handlePublishHeader = () => {
    saveHeaderSettings(localHeaderSettings);
    toast({ title: 'Published! ✨', description: 'Header settings have been updated live.' });
  };

  const handlePublishBasicFooter = () => {
    saveFooterSettings(localFooterSettings);
    toast({ title: 'Published! ✨', description: 'Basic Footer settings have been updated live.' });
  };

  const handleReset = () => {
    setLocalHeaderSettings(JSON.parse(JSON.stringify(initialHeaderSettings)));
    setLocalFooterSettings(JSON.parse(JSON.stringify(initialFooterSettings)));
    toast({ title: 'Reset!', description: 'Settings have been reset to default. Publish to save.' });
  }

  const mockNavigate = (path) => toast({ title: `Navigating to: ${path}` });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Header & Footer Builders</h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b mb-6 pb-2">
        <Button variant={activeTab === 'header-builder' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('header-builder')} className="text-lg flex items-center gap-2">Advanced Header <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">New</span></Button>
        <Button variant={activeTab === 'footer-builder' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('footer-builder')} className="text-lg flex items-center gap-2">Advanced Footer <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">New</span></Button>
        <Button variant={activeTab === 'header' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('header')} className="text-lg text-gray-500">Basic Header</Button>
        <Button variant={activeTab === 'basic-footer' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('basic-footer')} className="text-lg text-gray-500">Basic Footer</Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {activeTab === 'header-builder' && (
            <HeaderBuilderWithPreview />
          )}

          {activeTab === 'header' && (
            <div className="space-y-6">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
                <Button onClick={handlePublishHeader}><Save className="h-4 w-4 mr-2" />Save Header</Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Live Header Preview</CardTitle>
                </CardHeader>
                <CardContent className="bg-gray-100 p-4 rounded-lg border">
                  <div className="bg-white shadow-lg rounded-lg overflow-hidden relative z-10 pointer-events-none opacity-80 pb-40">
                    <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm font-bold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded shadow-xl pointer-events-auto">Note: Ensure Advanced Header is disabled to use basic settings</div>
                    <Header navigateTo={mockNavigate} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Header Customization</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Logo Text</Label>
                      <Input value={localHeaderSettings.logoText} onChange={e => handleHeaderChange('logoText', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Logo Image URL</Label>
                      <Input value={localHeaderSettings.logoUrl} placeholder="e.g., /logo.png or https://..." onChange={e => handleHeaderChange('logoUrl', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Navigation Links</Label>
                    <div className="space-y-2">
                      {localHeaderSettings.navLinks.map((link, i) => (
                        <div key={i} className="flex gap-2 items-center p-2 bg-gray-50 rounded-md border" onDragOver={(e) => handleDragOver(e, i)}>
                          <div draggable onDragStart={(e) => handleDragStart(e, i)} onDragEnd={handleDragEnd} className="cursor-grab p-1">
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input placeholder="Link Text" value={link.text} onChange={e => handleHeaderNavLinkChange(i, 'text', e.target.value)} />
                          <Input placeholder="URL" value={link.url} onChange={e => handleHeaderNavLinkChange(i, 'url', e.target.value)} />
                          <Button variant="destructive" size="icon" onClick={() => removeHeaderNavLink(i)}><Trash className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => addHeaderNavLink()}><Plus className="h-4 w-4 mr-2" />Add Custom Link</Button>
                      <Select onValueChange={(pageId) => addHeaderNavLink(allPages.find(p => p.id === pageId))}>
                        <SelectTrigger className="w-[280px]"><SelectValue placeholder="Add a page to header..." /></SelectTrigger>
                        <SelectContent>
                          {allPages.filter(p => p.showOnStore).map(page => (
                            <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <Label>Styling</Label>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex items-center gap-2"><Input type="color" value={localHeaderSettings.backgroundColor} onChange={e => handleHeaderChange('backgroundColor', e.target.value)} className="p-1 h-10 w-16" /><span>{localHeaderSettings.backgroundColor}</span></div>
                      </div>
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex items-center gap-2"><Input type="color" value={localHeaderSettings.textColor} onChange={e => handleHeaderChange('textColor', e.target.value)} className="p-1 h-10 w-16" /><span>{localHeaderSettings.textColor}</span></div>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select value={localHeaderSettings.fontFamily} onValueChange={val => handleHeaderChange('fontFamily', val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{fontFamilies.map(f => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'footer-builder' && (
            <FooterBuilderWithPreview />
          )}

          {activeTab === 'basic-footer' && (
            <div className="space-y-6">
              <div className="flex justify-end gap-2">
                <Button onClick={handlePublishBasicFooter}><Save className="h-4 w-4 mr-2" />Save Basic Footer</Button>
              </div>
              <Card>
                <CardHeader><CardTitle>Basic Footer Customization</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md">
                    <strong>Note:</strong> If the Advanced Footer Builder is enabled, these settings will be ignored on the storefront.
                  </div>
                  <div className="space-y-2"><Label>About Text</Label><Textarea value={localFooterSettings.aboutText} onChange={e => handleFooterChange('aboutText', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Copyright Text</Label><Input value={localFooterSettings.copyrightText} onChange={e => handleFooterChange('copyrightText', e.target.value)} /></div>

                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                    {localFooterSettings.linkColumns.map((col, colIndex) => (
                      <div key={colIndex} className="space-y-2">
                        <Label>Column: {col.title}</Label>
                        {col.links.map((link, linkIndex) => (
                          <div key={linkIndex} className="flex gap-2 items-center">
                            <Input placeholder="Text" value={link.text} onChange={e => handleFooterLinkColumnChange(colIndex, linkIndex, 'text', e.target.value)} />
                            <Input placeholder="URL" value={link.url} onChange={e => handleFooterLinkColumnChange(colIndex, linkIndex, 'url', e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => removeFooterLink(colIndex, linkIndex)}><Trash className="h-4 w-4" /></Button>
                          </div>
                        ))}
                        <Select onValueChange={(pageId) => addFooterLink(colIndex, allPages.find(p => p.id === pageId))}>
                          <SelectTrigger><SelectValue placeholder="Add page to this column..." /></SelectTrigger>
                          <SelectContent>
                            {allPages.filter(p => p.showOnStore).map(page => (
                              <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
                    <div className="space-y-2"><Label>Background</Label><div className="flex items-center gap-2"><Input type="color" value={localFooterSettings.backgroundColor} onChange={e => handleFooterChange('backgroundColor', e.target.value)} className="p-1 h-10 w-16" /><span>{localFooterSettings.backgroundColor}</span></div></div>
                    <div className="space-y-2"><Label>Text Color</Label><div className="flex items-center gap-2"><Input type="color" value={localFooterSettings.textColor} onChange={e => handleFooterChange('textColor', e.target.value)} className="p-1 h-10 w-16" /><span>{localFooterSettings.textColor}</span></div></div>
                    <div className="space-y-2"><Label>Link Color</Label><div className="flex items-center gap-2"><Input type="color" value={localFooterSettings.linkColor} onChange={e => handleFooterChange('linkColor', e.target.value)} className="p-1 h-10 w-16" /><span>{localFooterSettings.linkColor}</span></div></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminHeaderFooter;