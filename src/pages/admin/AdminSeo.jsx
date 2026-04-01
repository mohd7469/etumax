import React, { useState, useMemo } from 'react';
import { useSeo } from '@/context/SeoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Search, Trash, Plus, RefreshCw, Rss } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useProducts } from '@/context/ProductContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SitemapPreviewCard from '@/components/admin/SitemapPreviewCard';
import SitemapRegenerator from '@/components/admin/SitemapRegenerator';

const SeoMetaEditor = ({ type, items }) => {
  const { getSeoDataFor, saveSeoData } = useSeo();
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() =>
    items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    , [items, search]);

  const seoData = selectedItem ? getSeoDataFor(type, selectedItem.id) : {};

  const handleDataChange = (field, value) => {
    const newSeoData = { ...seoData, [field]: value };
    saveSeoData(`${type}-${selectedItem.id}`, newSeoData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Input placeholder={`Search ${type}...`} value={search} onChange={e => setSearch(e.target.value)} className="mb-2" />
        <div className="max-h-96 overflow-y-auto border rounded-md">
          {filteredItems.map(item => (
            <div key={item.id} onClick={() => setSelectedItem(item)} className={`p-3 cursor-pointer text-sm ${selectedItem?.id === item.id ? 'bg-primary/10' : 'hover:bg-muted'}`}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        {selectedItem ? (
          <Card>
            <CardHeader>
              <CardTitle>Editing: {selectedItem.name}</CardTitle>
              <CardDescription>Optimize SEO and social sharing for this {type}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><Label>SEO Title</Label><Input value={seoData.title || ''} onChange={e => handleDataChange('title', e.target.value)} /></div>
              <div><Label>Meta Description</Label><Textarea value={seoData.description || ''} onChange={e => handleDataChange('description', e.target.value)} /></div>
              <div><Label>Meta Keywords</Label><Input value={seoData.keywords || ''} onChange={e => handleDataChange('keywords', e.target.value)} placeholder="keyword1, keyword2" /></div>
              <div><Label>Canonical URL</Label><Input value={seoData.canonical || ''} onChange={e => handleDataChange('canonical', e.target.value)} /></div>
              <div className="pt-4 border-t"><h4 className="font-semibold mb-2">Social (Open Graph)</h4></div>
              <div><Label>OG Title</Label><Input value={seoData.ogTitle || ''} onChange={e => handleDataChange('ogTitle', e.target.value)} /></div>
              <div><Label>OG Description</Label><Textarea value={seoData.ogDescription || ''} onChange={e => handleDataChange('ogDescription', e.target.value)} /></div>
              <div><Label>OG Image URL</Label><Input value={seoData.ogImage || ''} onChange={e => handleDataChange('ogImage', e.target.value)} /></div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Select an item to edit its SEO data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminSeo = () => {
  const {
    generalSettings, saveGeneralSettings,
    sitemapSettings, saveSitemapSettings,
    robotsTxt, setRobotsTxt, saveRobotsTxt,
    redirects, saveRedirects,
    verificationCodes, saveVerificationCodes,
    sitemapDomain, setSitemapDomain,
    generatedSitemaps, sitemapTimestamps,
    generateSingleSitemap, generateAllSitemaps
  } = useSeo();
  
  const { products, categories } = useProducts();
  const { toast } = useToast();

  const handleSave = async (saver, data) => {
    const result = await saver(data);
    if (result && !result.success) {
      // Handled in context directly
    }
  };

  const [newRedirect, setNewRedirect] = useState({ from: '', to: '', type: '301' });
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const handleAddRedirect = () => {
    if (!newRedirect.from || !newRedirect.to) {
      toast({ variant: 'destructive', title: 'Invalid Redirect', description: 'Please provide both "From" and "To" paths.' });
      return;
    }
    saveRedirects([...redirects, newRedirect]);
    setNewRedirect({ from: '', to: '', type: '301' });
  };

  const handleRemoveRedirect = (index) => {
    saveRedirects(redirects.filter((_, i) => i !== index));
  };

  const handleRegenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      await generateAllSitemaps();
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const multiSitemapRobots = `User-agent: *
Allow: /

Sitemap: ${sitemapDomain || 'https://etumaxgulf.com'}/sitemap_index.xml`;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Search /> SEO Settings</h1>
      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-5 md:grid-cols-5 overflow-x-auto h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="titles-meta">Titles & Meta</TabsTrigger>
          <TabsTrigger value="sitemaps-v2">Sitemaps</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card><CardHeader><CardTitle>Overall SEO Score</CardTitle></CardHeader><CardContent><p className="text-5xl font-bold text-green-500">88/100</p><p className="text-sm text-muted-foreground">Looking good!</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Indexing Status</CardTitle></CardHeader><CardContent>{generalSettings.searchEngineVisibility === 'on' ? <p className="text-green-600">✓ Site is visible to search engines.</p> : <p className="text-red-600">✗ Site is hidden from search engines.</p>}</CardContent></Card>
            <Card><CardHeader><CardTitle>Sitemap Status</CardTitle></CardHeader><CardContent><p className="text-green-600">✓ Sitemaps configured.</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="general" className="pt-6">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {generalSettings.searchEngineVisibility === 'off' && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive"><AlertTriangle className="inline-block mr-2" />Your site is currently hidden from search engines.</div>}
              <div className="flex items-center justify-between"><Label>Search Engine Visibility</Label><Switch checked={generalSettings.searchEngineVisibility === 'on'} onCheckedChange={v => handleSave(saveGeneralSettings, { ...generalSettings, searchEngineVisibility: v ? 'on' : 'off' })} /></div>
              <div className="flex items-center justify-between"><Label>Auto-generate Meta Descriptions</Label><Switch checked={generalSettings.autoGenerateMeta} onCheckedChange={v => handleSave(saveGeneralSettings, { ...generalSettings, autoGenerateMeta: v })} /></div>
              <div className="flex items-center justify-between"><Label>Auto-generate Canonical URLs</Label><Switch checked={generalSettings.autoCanonical} onCheckedChange={v => handleSave(saveGeneralSettings, { ...generalSettings, autoCanonical: v })} /></div>
              <div className="space-y-2 pt-4 border-t">
                <Label>Store Base URL</Label>
                <Input value={generalSettings.storeUrl} onChange={e => handleSave(saveGeneralSettings, { ...generalSettings, storeUrl: e.target.value })} />
                <p className="text-xs text-muted-foreground">This URL is used as the base for all sitemap and canonical links.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="titles-meta" className="pt-6">
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="pt-4"><SeoMetaEditor type="product" items={products} /></TabsContent>
            <TabsContent value="categories" className="pt-4"><SeoMetaEditor type="category" items={categories} /></TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="sitemaps-v2" className="pt-6 space-y-6">
          <SitemapRegenerator />
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><Rss className="w-5 h-5" /> Live API Sitemaps (Legacy)</CardTitle>
                  <CardDescription>These sitemaps are generated on-the-fly via React routes.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleRegenerateAll} disabled={isGeneratingAll}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingAll ? 'animate-spin' : ''}`} />
                  Refresh Previews
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-2 p-4 bg-muted/30 rounded-lg border">
                <Label htmlFor="sitemapDomain">Base Domain URL</Label>
                <div className="flex gap-2">
                  <Input 
                    id="sitemapDomain"
                    value={sitemapDomain} 
                    onChange={e => setSitemapDomain(e.target.value)} 
                    placeholder="https://example.com"
                  />
                  <Button variant="outline" onClick={() => saveGeneralSettings({...generalSettings, storeUrl: sitemapDomain})}>
                    Save Default
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SitemapPreviewCard 
                  title="Sitemap Index" 
                  type="index" 
                  content={generatedSitemaps.index} 
                  timestamp={sitemapTimestamps.index} 
                  onRegenerate={generateSingleSitemap}
                  filename="sitemap_index.xml"
                />
                <SitemapPreviewCard 
                  title="Products Sitemap" 
                  type="products" 
                  content={generatedSitemaps.products} 
                  timestamp={sitemapTimestamps.products} 
                  onRegenerate={generateSingleSitemap}
                  filename="sitemap_products.xml"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="pt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>Robots.txt Editor</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={robotsTxt || multiSitemapRobots} onChange={e => setRobotsTxt(e.target.value)} rows={10} className="font-mono" />
              <div className="flex gap-2">
                <Button onClick={() => handleSave(saveRobotsTxt, robotsTxt)}>Save robots.txt</Button>
                <Button variant="outline" onClick={() => {
                  setRobotsTxt(multiSitemapRobots);
                  handleSave(saveRobotsTxt, multiSitemapRobots);
                }}>Reset to Default</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Redirect Manager</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                <Input placeholder="/old-path" value={newRedirect.from} onChange={e => setNewRedirect({ ...newRedirect, from: e.target.value })} />
                <Input placeholder="/new-path" value={newRedirect.to} onChange={e => setNewRedirect({ ...newRedirect, to: e.target.value })} />
                <Select value={newRedirect.type} onValueChange={v => setNewRedirect({ ...newRedirect, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="301">301 (Permanent)</SelectItem><SelectItem value="302">302 (Temporary)</SelectItem></SelectContent>
                </Select>
                <Button onClick={handleAddRedirect}><Plus className="mr-2 h-4 w-4" /> Add</Button>
              </div>
              <div className="space-y-2">
                {redirects.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div className="font-mono text-sm"><span>{r.from}</span> → <span>{r.to}</span> <span className="text-xs p-1 bg-muted rounded">{r.type}</span></div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRedirect(i)}><Trash className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Verification Codes</CardTitle><CardDescription>Add meta tags for verifying site ownership.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Google Search Console</Label><Input placeholder="Verification code..." value={verificationCodes.google || ''} onChange={e => saveVerificationCodes({ ...verificationCodes, google: e.target.value })} /></div>
              <div><Label>Bing Webmaster Tools</Label><Input placeholder="Verification code..." value={verificationCodes.bing || ''} onChange={e => saveVerificationCodes({ ...verificationCodes, bing: e.target.value })} /></div>
              <div><Label>Pinterest</Label><Input placeholder="Verification code..." value={verificationCodes.pinterest || ''} onChange={e => saveVerificationCodes({ ...verificationCodes, pinterest: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSeo;