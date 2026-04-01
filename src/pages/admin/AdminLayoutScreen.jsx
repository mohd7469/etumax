
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Laptop, Box, Droplets, Paintbrush, Shield as Shadow, Ruler, ShoppingBag, Filter, ChevronDown, Heart, Star, ShoppingCart, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDesign } from '@/context/DesignContext';
import { ColorPicker } from '@/components/ui/color-picker';
import HomePage from '@/pages/HomePage';
import { cn } from '@/lib/utils';
import { produce } from 'immer';

// Mock Data for Previews
const MOCK_PRODUCTS = [
	{ id: 1, name: "Premium Wireless Headphones", price: 149.99, originalPrice: 199.99, rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
	{ id: 2, name: "Organic Dark Roast Coffee", price: 24.99, originalPrice: null, rating: 4.9, reviews: 89, image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80" },
	{ id: 3, name: "Smart Fitness Watch Ultra", price: 299.00, originalPrice: 349.00, rating: 4.5, reviews: 256, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
	{ id: 4, name: "Mechanical Gaming Keyboard", price: 129.50, originalPrice: null, rating: 4.7, reviews: 42, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80" },
	{ id: 5, name: "Minimalist LED Desk Lamp", price: 59.99, originalPrice: null, rating: 4.6, reviews: 18, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80" },
	{ id: 6, name: "Active Noise Cancelling Earbuds", price: 179.00, originalPrice: 220.00, rating: 4.4, reviews: 312, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80" },
];

const MOCK_REVIEWS = [
	{ id: 1, name: "Alex Johnson", rating: 5, date: "Oct 12, 2023", comment: "Absolutely love these! The sound quality is amazing and they are incredibly comfortable for long sessions." },
	{ id: 2, name: "Sarah Smith", rating: 4, date: "Sep 28, 2023", comment: "Great battery life. Sometimes the Bluetooth connection drops for a second, but otherwise a solid product." },
	{ id: 3, name: "Michael T.", rating: 5, date: "Sep 15, 2023", comment: "Worth every penny. The noise cancellation blocks out everything in my busy office." }
];

const MockListingPage = () => {
	return (
		<div className="bg-background min-h-[600px] w-full p-4 sm:p-6 lg:p-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-extrabold text-foreground tracking-tight">All Products</h1>
					<p className="text-muted-foreground mt-1">Showing 6 of 24 results</p>
				</div>
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<Button variant="outline" className="flex-1 sm:flex-none">
						<Filter className="w-4 h-4 mr-2" /> Filters
					</Button>
					<div className="relative flex-1 sm:flex-none">
						<select className="w-full appearance-none cursor-pointer bg-background text-sm pl-4 pr-10 py-2.5 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
							<option>Featured</option>
							<option>Price: Low to High</option>
							<option>Price: High to Low</option>
							<option>Newest Arrivals</option>
						</select>
						<ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{MOCK_PRODUCTS.map((p) => (
					<div key={p.id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden group hover:shadow-md transition-all flex flex-col h-full">
						<div className="aspect-square bg-muted relative overflow-hidden">
							<img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
							{p.originalPrice && (
								<div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
									Sale
								</div>
							)}
							<button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
								<Heart className="w-4 h-4 text-muted-foreground" />
							</button>
						</div>
						<div className="p-4 flex flex-col flex-1">
							<div className="flex items-center text-xs text-muted-foreground mb-2">
								<div className="flex items-center text-yellow-400 mr-1">
									<Star className="w-3.5 h-3.5 fill-current" />
									<span className="text-foreground ml-1 font-medium">{p.rating}</span>
								</div>
								<span>({p.reviews})</span>
							</div>
							<h3 className="font-medium text-sm mb-2 line-clamp-2 h-10 text-card-foreground">{p.name}</h3>
							<div className="mt-auto pt-3 flex flex-col gap-3">
								<div className="flex items-center gap-2">
									<span className="text-lg font-bold text-primary">${p.price}</span>
									{p.originalPrice && (
										<span className="text-sm text-muted-foreground line-through">${p.originalPrice}</span>
									)}
								</div>
								<Button size="sm" className="w-full">
									<ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const MockDetailPage = () => {
	const mainProduct = MOCK_PRODUCTS[0];
	const discount = mainProduct.originalPrice ? Math.round((1 - mainProduct.price / mainProduct.originalPrice) * 100) : 0;

	return (
		<div className="bg-background min-h-[600px] w-full p-4 sm:p-6 lg:p-8">
			<div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
				{/* Image Gallery */}
				<div className="lg:w-1/2">
					<div className="aspect-square rounded-xl overflow-hidden bg-muted mb-4 border border-border shadow-sm">
						<img src={mainProduct.image} alt={mainProduct.name} className="w-full h-full object-cover" />
					</div>
					<div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
						{[mainProduct.image, MOCK_PRODUCTS[2].image, MOCK_PRODUCTS[3].image].map((img, idx) => (
							<div key={idx} className={cn("w-20 h-20 rounded-md overflow-hidden flex-shrink-0 cursor-pointer border-2", idx === 0 ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}>
								<img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
							</div>
						))}
					</div>
				</div>

				{/* Product Info */}
				<div className="lg:w-1/2 flex flex-col">
					<h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">{mainProduct.name}</h1>
					
					<div className="flex items-center gap-4 mb-6">
						<div className="flex items-center">
							{[...Array(5)].map((_, i) => (
								<Star key={i} className={cn("w-4 h-4", i < Math.floor(mainProduct.rating) ? "text-yellow-400 fill-current" : "text-muted")} />
							))}
						</div>
						<span className="text-sm font-medium text-primary hover:underline cursor-pointer">{mainProduct.reviews} Reviews</span>
					</div>

					<div className="flex items-end gap-3 mb-6">
						<span className="text-3xl font-extrabold text-primary">${mainProduct.price}</span>
						{mainProduct.originalPrice && (
							<>
								<span className="text-lg text-muted-foreground line-through mb-1">${mainProduct.originalPrice}</span>
								<span className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs font-bold mb-1 uppercase tracking-wider">
									Save {discount}%
								</span>
							</>
						)}
					</div>

					<p className="text-muted-foreground mb-8 leading-relaxed">
						Experience unmatched audio clarity with our premium wireless headphones. Featuring state-of-the-art active noise cancellation, 30 hours of continuous battery life, and ultra-plush memory foam ear cushions designed for all-day comfort. Perfect for audiophiles and busy professionals alike.
					</p>

					<div className="flex items-center gap-4 mb-8">
						<div className="flex items-center bg-muted rounded-lg p-1 border border-border">
							<button className="w-10 h-10 flex items-center justify-center hover:bg-background rounded text-foreground font-medium transition-colors">-</button>
							<span className="w-12 text-center font-bold text-foreground">1</span>
							<button className="w-10 h-10 flex items-center justify-center hover:bg-background rounded text-foreground font-medium transition-colors">+</button>
						</div>
						<span className="text-sm text-green-600 font-bold flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> In Stock</span>
					</div>

					<div className="flex gap-4">
						<Button className="flex-1 h-12 text-base font-bold shadow-md">
							<ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
						</Button>
						<Button variant="outline" className="w-12 h-12 p-0 flex-shrink-0 border-border hover:bg-muted">
							<Heart className="w-5 h-5 text-muted-foreground" />
						</Button>
					</div>
				</div>
			</div>

			{/* Frequently Bought Together */}
			<div className="border-t border-border pt-10 mb-10">
				<h2 className="text-2xl font-bold text-foreground mb-6">Frequently Bought Together</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{MOCK_PRODUCTS.slice(4, 6).map((rp) => (
						<div key={rp.id} className="border border-border rounded-lg p-4 flex gap-4 items-center bg-card hover:border-primary transition-colors cursor-pointer shadow-sm">
							<img src={rp.image} alt={rp.name} className="w-20 h-20 object-cover rounded-md bg-muted" />
							<div>
								<h4 className="text-sm font-semibold text-card-foreground line-clamp-2 mb-1">{rp.name}</h4>
								<p className="text-base font-bold text-primary">${rp.price}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Customer Reviews */}
			<div className="border-t border-border pt-10">
				<h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
				<div className="space-y-6">
					{MOCK_REVIEWS.map((r) => (
						<div key={r.id} className="bg-muted/50 border border-border p-6 rounded-xl">
							<div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
								<div>
									<p className="font-bold text-foreground">{r.name}</p>
									<div className="flex items-center text-yellow-400 mt-1">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className={cn("w-3.5 h-3.5", i < r.rating ? "fill-current" : "text-muted-foreground")} />
										))}
									</div>
								</div>
								<span className="text-sm text-muted-foreground font-medium">{r.date}</span>
							</div>
							<p className="text-foreground/80 leading-relaxed text-sm">{r.comment}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

const PagePreview = ({ page, settings, isPreview, homePageSettings }) => {
	const mockNavigate = () => { };

	const wrapperStyle = {
		'--layout-width': settings.widthType === 'fixed' ? `${settings.widthValue}px` : (settings.widthType === 'container' ? 'var(--container-width, 1280px)' : '100%'),
		'--layout-padding': `${settings.padding}rem`,
		'--layout-gap': `${settings.gap}rem`,
		'--layout-radius': `${settings.radius}rem`,
		'--layout-shadow': `var(--shadow-${settings.shadow})`,
		'--layout-bg': settings.bg,
		'--layout-border-color': settings.borderColor,
		'--layout-border-width': `${settings.borderWidth}px`,
	};

	const PageComponent = () => {
		switch (page) {
			case 'home':
				return <HomePage navigateTo={mockNavigate} isPreview={isPreview} previewSettings={homePageSettings} />;
			case 'listing':
				return <MockListingPage />;
			case 'detail':
				return <MockDetailPage />;
			default:
				return null;
		}
	};

	const effectiveEnabled = settings.enabled;

	return (
		<div className="bg-slate-200 p-4 rounded-lg">
			{effectiveEnabled ? (
				<div
					style={wrapperStyle}
					className={cn('layout-box', `layout-box--${page}`)}
				>
					<PageComponent />
				</div>
			) : (
				<div className='relative'>
					<div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
						<div className="bg-background p-4 rounded-lg shadow-xl border">Box layout is disabled for this page.</div>
					</div>
					<div className='blur-sm'><PageComponent /></div>
				</div>
			)}
		</div>
	);
};


const PerPageEditor = ({ pageType, settings, onChange }) => {
	const handleInputChange = (field, value) => {
		let processedValue = value;
		if (['widthValue', 'padding', 'gap', 'radius', 'borderWidth'].includes(field)) {
			processedValue = Math.max(0, Number(value)) || 0;
		}
		onChange(pageType, field, processedValue);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="capitalize">{pageType} Page</CardTitle>
					<div className="flex items-center gap-2">
						<Label htmlFor={`enable-${pageType}`}>Enable Layout</Label>
						<Switch
							id={`enable-${pageType}`}
							checked={settings.enabled}
							onCheckedChange={(val) => onChange(pageType, 'enabled', val)}
						/>
					</div>
				</div>
			</CardHeader>
			{settings.enabled && (
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label><Box className="w-4 h-4 inline-block mr-2" />Width</Label>
							<div className="flex gap-2">
								<Select value={settings.widthType} onValueChange={(val) => handleInputChange('widthType', val)}>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="full">Full Width</SelectItem>
										<SelectItem value="container">Container</SelectItem>
										<SelectItem value="fixed">Fixed</SelectItem>
									</SelectContent>
								</Select>
								{settings.widthType === 'fixed' && (
									<Input type="number" value={settings.widthValue} onChange={(e) => handleInputChange('widthValue', e.target.value)} placeholder="e.g., 1200" />
								)}
							</div>
						</div>
						<div className="space-y-2">
							<Label><Ruler className="w-4 h-4 inline-block mr-2" />Padding (rem)</Label>
							<Input type="number" step="0.1" value={settings.padding} onChange={(e) => handleInputChange('padding', e.target.value)} />
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label><Paintbrush className="w-4 h-4 inline-block mr-2" />Background Color</Label>
							<ColorPicker color={settings.bg} onChange={(val) => handleInputChange('bg', val)} />
						</div>
						<div className="space-y-2">
							<Label><Shadow className="w-4 h-4 inline-block mr-2" />Shadow</Label>
							<Select value={settings.shadow} onValueChange={(val) => handleInputChange('shadow', val)}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None</SelectItem>
									<SelectItem value="light">Light</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="strong">Strong</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label><Droplets className="w-4 h-4 inline-block mr-2" />Border Color</Label>
							<ColorPicker color={settings.borderColor} onChange={(val) => handleInputChange('borderColor', val)} />
						</div>
						<div className="space-y-2">
							<Label>Border Width (px)</Label>
							<Input type="number" value={settings.borderWidth} onChange={(e) => handleInputChange('borderWidth', e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Border Radius (rem)</Label>
							<Input type="number" step="0.1" value={settings.radius} onChange={(e) => handleInputChange('radius', e.target.value)} />
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	);
};

const AdminLayoutScreen = () => {
	const { toast } = useToast();
	const { boxLayoutSettings, homePageSettings, saveBoxLayoutSettings, initialBoxLayoutSettings } = useDesign();
	const [localSettings, setLocalSettings] = useState(boxLayoutSettings);
	const [previewTab, setPreviewTab] = useState('home');

	useEffect(() => {
		setLocalSettings(boxLayoutSettings || initialBoxLayoutSettings);
	}, [boxLayoutSettings, initialBoxLayoutSettings]);

	const handleGlobalChange = (field, value) => {
		setLocalSettings(prev => ({ ...prev, [field]: value }));
	};

	const handlePerPageChange = (pageType, field, value) => {
		setLocalSettings(produce(draft => {
			draft.perPageBoxLayout[pageType][field] = value;
		}));
	};

	const handlePublish = () => {
		try {
			saveBoxLayoutSettings(localSettings);
			toast({
				title: 'Layout Settings Published! ✨',
				description: 'Your box layout changes are now live.',
			});
		} catch (error) {
			console.error("Error publishing layout settings:", error);
			toast({
				title: 'Error Saving Settings',
				description: 'There was a problem saving your layout settings.',
				variant: 'destructive',
			});
		}
	};

	if (!localSettings) {
		return <div>Loading settings...</div>;
	}

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Layout Screen Customizer</h1>
				<Button onClick={handlePublish}><Save className="h-4 w-4 mr-2" />Publish</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-1 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Global Settings</CardTitle>
							<CardDescription>Control the box layout for your entire site.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<Label htmlFor="enable-global-box" className="font-semibold">Enable Box Layout Globally</Label>
								<Switch
									id="enable-global-box"
									checked={localSettings.globalBoxLayoutEnabled}
									onCheckedChange={(val) => handleGlobalChange('globalBoxLayoutEnabled', val)}
								/>
							</div>
              <div className="space-y-2">
                  <Label className="font-semibold">Global Carousel Width</Label>
                  <Select value={localSettings.carouselWidth || '110%'} onValueChange={(val) => handleGlobalChange('carouselWidth', val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="100%">100% (Contained)</SelectItem>
                          <SelectItem value="110%">110% (Extended)</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
						</CardContent>
					</Card>
					<div className="space-y-4">
						<h2 className="text-xl font-bold">Per-Page Overrides</h2>
						{Object.keys(localSettings.perPageBoxLayout).map(pageType => (
							<PerPageEditor
								key={pageType}
								pageType={pageType}
								settings={localSettings.perPageBoxLayout[pageType]}
								onChange={handlePerPageChange}
							/>
						))}
					</div>
				</div>

				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle>Live Preview</CardTitle>
									<CardDescription>Preview your layout changes in draft mode.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="border-t">
							<Tabs value={previewTab} onValueChange={setPreviewTab} className="pt-4">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="home"><Laptop className="w-4 h-4 mr-2" />Home Page</TabsTrigger>
									<TabsTrigger value="listing"><Box className="w-4 h-4 mr-2" />Product Listing</TabsTrigger>
									<TabsTrigger value="detail"><ShoppingBag className="w-4 h-4 mr-2" />Product Detail</TabsTrigger>
								</TabsList>
								<div className="mt-4 p-4 bg-gray-100 rounded-lg max-h-[80vh] overflow-y-auto overflow-x-hidden">
									<AnimatePresence mode="wait">
										<motion.div
											key={previewTab}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
										>
											<TabsContent value="home" forceMount={previewTab === 'home'}>
												<PagePreview page="home" settings={localSettings.globalBoxLayoutEnabled ? localSettings.perPageBoxLayout.home : { enabled: false }} isPreview={true} homePageSettings={homePageSettings} />
											</TabsContent>
											<TabsContent value="listing" forceMount={previewTab === 'listing'}>
												<PagePreview page="listing" settings={localSettings.globalBoxLayoutEnabled ? localSettings.perPageBoxLayout.listing : { enabled: false }} isPreview={true} />
											</TabsContent>
											<TabsContent value="detail" forceMount={previewTab === 'detail'}>
												<PagePreview page="detail" settings={localSettings.globalBoxLayoutEnabled ? localSettings.perPageBoxLayout.detail : { enabled: false }} isPreview={true} />
											</TabsContent>
										</motion.div>
									</AnimatePresence>
								</div>
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</div>
		</motion.div>
	);
};

export default AdminLayoutScreen;
