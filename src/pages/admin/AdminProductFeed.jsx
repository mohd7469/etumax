import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductFeed } from '@/context/ProductFeedContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rss, Plus, Trash, ChevronsUpDown, Settings, X, Copy, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multi-select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const FeedSettingsModal = ({ feed, onSave, onCancel }) => {
	const { products, categories, brands } = useProductFeed();
	const [localFeed, setLocalFeed] = useState(feed);

	const handleMappingChange = (field, value) => {
		setLocalFeed(prev => ({ ...prev, mapping: { ...prev.mapping, [field]: value } }));
	};

	const handleRuleChange = (field, value) => {
		setLocalFeed(prev => ({ ...prev, rules: { ...prev.rules, [field]: value } }));
	};

	const handlePriceMarkupChange = (field, value) => {
		setLocalFeed(prev => ({ ...prev, rules: { ...prev.rules, priceMarkup: { ...prev.rules.priceMarkup, [field]: value } } }));
	}

	// These are the fields the user can map manually.
	const mappableGmcFields = [
		'g:id', 'g:title', 'g:description', 'g:price', 'g:sale_price', 'g:brand', 'g:gtin', 'g:mpn'
	];

	const productAttributes = ['id', 'name', 'description', 'slug', 'price', 'salePrice', 'originalPrice', 'inStock', 'sku', 'brand'];

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
			<Card className="w-full max-w-4xl h-[90vh]" onClick={e => e.stopPropagation()}>
				<CardHeader className="flex flex-row justify-between items-center">
					<div>
						<CardTitle>Feed Settings: {localFeed.name}</CardTitle>
						<CardDescription>Configure data mapping and filtering rules for this feed.</CardDescription>
					</div>
					<Button variant="ghost" size="icon" onClick={onCancel}><X /></Button>
				</CardHeader>
				<CardContent className="h-[calc(90vh-150px)] overflow-y-auto space-y-6 p-6">
					<Tabs defaultValue="mapping">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="mapping">Data Mapping</TabsTrigger>
							<TabsTrigger value="rules">Filtering & Rules</TabsTrigger>
						</TabsList>
						<TabsContent value="mapping" className="pt-4">
							<Card>
								<CardHeader><CardTitle>Field Mapping</CardTitle></CardHeader>
								<CardContent className="space-y-2">
									{mappableGmcFields.map(field => (
										<div key={field} className="grid grid-cols-3 gap-4 items-center">
											<Label className="font-mono text-sm text-right">{field}</Label>
											<div className="col-span-2">
												<Select value={localFeed.mapping[field]} onValueChange={value => handleMappingChange(field, value)}>
													<SelectTrigger><SelectValue /></SelectTrigger>
													<SelectContent>
														{productAttributes.map(attr => <SelectItem key={attr} value={attr}>{attr}</SelectItem>)}
													</SelectContent>
												</Select>
											</div>
										</div>
									))}
									<div className="grid grid-cols-3 gap-4 items-center pt-2 border-t">
										<Label className="font-mono text-sm text-right">g:google_product_category</Label>
										<div className="col-span-2">
											<Input placeholder="e.g. 2271" value={localFeed.mapping['g:google_product_category']} onChange={e => handleMappingChange('g:google_product_category', e.target.value)} />
										</div>
									</div>
									<p className="text-xs text-muted-foreground pt-2">Fields like 'link', 'availability', and 'image_link' are generated automatically.</p>
								</CardContent>
							</Card>
						</TabsContent>
						<TabsContent value="rules" className="pt-4">
							<div className="space-y-4">
								<Card>
									<CardHeader><CardTitle>Inclusion/Exclusion Rules</CardTitle></CardHeader>
									<CardContent className="space-y-4">
										<div className="flex items-center gap-2">
											<Switch id="inStockOnly" checked={localFeed.rules.inStockOnly} onCheckedChange={val => handleRuleChange('inStockOnly', val)} />
											<Label htmlFor="inStockOnly">Only include in-stock products</Label>
										</div>
										<div>
											<Label>Exclude Categories</Label>
											<MultiSelect options={categories.map(c => ({ value: c.name, label: c.name }))} selected={localFeed.rules.excludedCategories} onChange={val => handleRuleChange('excludedCategories', val)} placeholder="Select categories to exclude..." />
										</div>
										<div>
											<Label>Exclude Brands</Label>
											<MultiSelect options={brands.map(b => ({ value: b, label: b }))} selected={localFeed.rules.excludedBrands} onChange={val => handleRuleChange('excludedBrands', val)} placeholder="Select brands to exclude..." />
										</div>
										<div>
											<Label>Exclude Products</Label>
											<MultiSelect options={products.map(p => ({ value: p.id, label: p.name }))} selected={localFeed.rules.excludedProducts} onChange={val => handleRuleChange('excludedProducts', val)} placeholder="Select products to exclude..." />
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader><CardTitle>Pricing Rules</CardTitle></CardHeader>
									<CardContent className="grid grid-cols-2 gap-4">
										<div>
											<Label>Price Adjustment</Label>
											<Select value={localFeed.rules.priceMarkup.type} onValueChange={value => handlePriceMarkupChange('type', value)}>
												<SelectTrigger><SelectValue /></SelectTrigger>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													<SelectItem value="percentage">Percentage Markup/Discount</SelectItem>
													<SelectItem value="fixed">Fixed Markup/Discount</SelectItem>
												</SelectContent>
											</Select>
										</div>
										{localFeed.rules.priceMarkup.type !== 'none' && (
											<div>
												<Label>Value (+/-)</Label>
												<Input type="number" step="0.01" value={localFeed.rules.priceMarkup.value} onChange={e => handlePriceMarkupChange('value', e.target.value)} />
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
				<div className="p-4 border-t flex justify-end">
					<Button onClick={() => onSave(localFeed)}>Save & Close</Button>
				</div>
			</Card>
		</motion.div>
	);
};

const AdminProductFeed = () => {
	const { feeds, addFeed, updateFeed, deleteFeed, generateAndDownloadFeed, generateFeedContent } = useProductFeed();
	const { toast } = useToast();
	const [editingFeed, setEditingFeed] = useState(null);
	const [previewingFeed, setPreviewingFeed] = useState(null);
	const [feedContent, setFeedContent] = useState('');

	const handleSave = (feedData) => {
		updateFeed(feedData.id, feedData);
		toast({ title: 'Feed Settings Saved!' });
		setEditingFeed(null);
	};

	const handleGenerate = (feedId) => {
		generateAndDownloadFeed(feedId);
	};

	// The feed URL is now just a placeholder as direct serving is complex.
	const getFeedUrl = (feed) => `Your Store URL / ... / product-feed-${feed.id}.${feed.format}`;

	const handlePreview = (feed) => {
		try {
			const content = generateFeedContent(feed);
			setFeedContent(content || 'No products match the criteria for this feed.');
			setPreviewingFeed(feed);
		} catch (error) {
			console.error("Preview generation failed:", error);
			setFeedContent(`Error generating preview: ${error.message}`);
			setPreviewingFeed(feed);
		}
	};

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold flex items-center gap-2"><Rss /> Product Feeds</h1>
				<Button onClick={addFeed}><Plus className="mr-2 h-4 w-4" /> Add New Feed</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{feeds.map(feed => (
					<Card key={feed.id} className="flex flex-col">
						<CardHeader>
							<CardTitle className="flex justify-between items-start">
								<Input className="text-lg font-bold border-none -ml-2 p-1 h-auto" value={feed.name} onChange={e => updateFeed(feed.id, { ...feed, name: e.target.value })} />
								<DropdownMenu>
									<DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><ChevronsUpDown /></Button></DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem onClick={() => deleteFeed(feed.id)} className="text-red-600">Delete</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</CardTitle>
							<CardDescription>Last generated: {feed.lastGenerated ? new Date(feed.lastGenerated).toLocaleString() : 'Never'}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 flex-grow">
							<div className="flex justify-between items-center">
								<Label>Format</Label>
								<Select value={feed.format} onValueChange={value => updateFeed(feed.id, { ...feed, format: value })}>
									<SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="xml">XML</SelectItem>
										<SelectItem value="json">JSON</SelectItem>
										<SelectItem value="csv">CSV</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex justify-between items-center">
								<Label>Auto-Update</Label>
								<Select value={feed.schedule} onValueChange={value => updateFeed(feed.id, { ...feed, schedule: value })}>
									<SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="hourly">Hourly</SelectItem>
										<SelectItem value="daily">Daily</SelectItem>
										<SelectItem value="weekly">Weekly</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Feed Generation</Label>
								<p className="text-xs text-muted-foreground">Use the buttons below to generate and download your feed file.</p>
							</div>
						</CardContent>
						<div className="p-4 border-t flex flex-col gap-2">
							<Button onClick={() => setEditingFeed(feed)} variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
							<Button onClick={() => handlePreview(feed)} variant="outline">Preview</Button>
							<Button onClick={() => handleGenerate(feed.id)}><Download className="mr-2 h-4 w-4" /> Generate & Download</Button>
						</div>
					</Card>
				))}
			</div>

			<AnimatePresence>
				{editingFeed && <FeedSettingsModal feed={editingFeed} onSave={handleSave} onCancel={() => setEditingFeed(null)} />}
				{previewingFeed && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewingFeed(null)}>
						<Card className="w-full max-w-4xl h-[90vh]" onClick={e => e.stopPropagation()}>
							<CardHeader className="flex flex-row justify-between items-center">
								<div>
									<CardTitle>Feed Preview: {previewingFeed.name}</CardTitle>
									<CardDescription>Raw {previewingFeed.format.toUpperCase()} output</CardDescription>
								</div>
								<Button variant="ghost" size="icon" onClick={() => setPreviewingFeed(null)}><X /></Button>
							</CardHeader>
							<CardContent className="h-[calc(90vh-80px)]">
								<pre className="w-full h-full bg-gray-900 text-white font-mono text-xs p-4 rounded-md overflow-auto">
									<code>{feedContent}</code>
								</pre>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default AdminProductFeed;