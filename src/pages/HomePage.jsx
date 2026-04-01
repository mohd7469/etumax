
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, CreditCard, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import InfiniteProductCarousel from '@/components/products/InfiniteProductCarousel';
import CategoryProductCarousel from '@/components/products/CategoryProductCarousel';
import ImageLinkCarouselSection from '@/components/products/ImageLinkCarouselSection';
import { useDesign } from '@/context/DesignContext';
import { useProducts } from '@/context/ProductContext';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductImage from '@/components/ui/ProductImage';

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.debug('Section Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center text-gray-500">
          <AlertTriangle className="w-6 h-6 mb-1 text-gray-400" />
          <p className="text-sm">This section is temporarily unavailable.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const HeroSlider = ({ slides, sliderSettings, navigateTo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = React.useCallback(() => {
    if (!slides || slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides]);

  const prevSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (sliderSettings?.autoPlay && slides && slides.length > 1) {
      const intervalId = setInterval(nextSlide, (sliderSettings.interval || 3) * 1000);
      return () => clearInterval(intervalId);
    }
  }, [slides, sliderSettings, nextSlide]);

  if (!slides || slides.length === 0) {
    return (
      <div className="h-[400px] bg-gray-200 flex items-center justify-center">
        <p>No slides configured.</p>
      </div>
    );
  }

  const activeSlide = slides[currentIndex];
  if (!activeSlide) return null;

  const bannerHeight = sliderSettings?.height || 500;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${bannerHeight}px` }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <ProductImage src={activeSlide.image} alt={activeSlide.heading} className="w-full h-full object-cover" aspectRatio="auto" lazy={false} />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <motion.div
          key={currentIndex + '-text'}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl text-white"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{activeSlide.heading}</h1>
          <p className="text-lg md:text-xl mb-6 text-white/90">{activeSlide.subheading}</p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-base px-6 py-4 rounded-full shadow-lg"
          >
            <Link to={activeSlide.buttonLink || '#'}>
              {activeSlide.buttonText} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProductSection = ({ sectionSettings, getProductsFromIds, isPreview, previewMode, mobileSettings }) => {
  if (!sectionSettings?.show) return null;
  
  const isMobileView = isPreview && previewMode === 'mobile';
  
  if (isMobileView && mobileSettings && mobileSettings.visible === false) return null;

  const limit = isMobileView && mobileSettings ? mobileSettings.limit : sectionSettings.limit;
  const products = getProductsFromIds(sectionSettings.productIds, limit);

  if (!products || products.length === 0) return null;

  const gridColsClass = isMobileView && mobileSettings
    ? `!grid-cols-${mobileSettings.columns}`
    : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-5';

  const handleViewAllLink = (category) => {
    if (category === 'all' || !category) {
      return '/products';
    }
    return `/products/${category}`;
  };

  return (
    <section className="container mx-auto px-4 py-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-3xl font-bold mb-1">{sectionSettings.title}</h2>
            <p className="text-sm text-gray-600">{sectionSettings.description}</p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden md:flex h-9"
          >
            <Link to={handleViewAllLink(sectionSettings.viewAllCategory)}>
              {'View All'} <ArrowRight className="ml-1 w-3 h-3" />
            </Link>
          </Button>
        </div>
        <div className={cn("grid gap-3 md:gap-4", gridColsClass)}>
          {products.map((product, idx) => (
            <motion.div
              key={product.id || idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

const DualHeroBanner = ({ sectionSettings }) => {
  if (!sectionSettings?.show || !sectionSettings.banners) return null;

  return (
    <section className="container mx-auto px-4 py-2">
      <div className="grid md:grid-cols-2 gap-4">
        {sectionSettings.banners.map((banner, idx) => (
          <motion.div key={banner.id || idx} whileHover={{ scale: 1.01 }} className="relative rounded-lg overflow-hidden h-64 group">
            <ProductImage src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" aspectRatio="auto" lazy={true} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">{banner.title}</h2>
              <p className="mb-3 text-sm text-white/90">{banner.subtitle}</p>
              <Button asChild variant="secondary" size="sm">
                <Link to={banner.buttonLink || '#'}>{banner.buttonText}</Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const CategoryHighlightBox = ({ sectionSettings, categories }) => {
  if (!sectionSettings?.show) return null;
  const category = categories.find(c => c.id === sectionSettings.categoryId);

  return (
    <section className="container mx-auto px-4 py-2">
      <div className="bg-card rounded-xl shadow border overflow-hidden grid md:grid-cols-2 items-center">
        <div className="p-6 md:p-8">
          <span className="inline-block bg-destructive text-destructive-foreground font-bold text-xs px-2.5 py-0.5 rounded-full mb-3">
            {sectionSettings.discountBadge}
          </span>
          <h2 className="text-3xl font-bold mb-2">{category?.name || sectionSettings.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">Explore our curated collection in the {category?.name || 'highlighted'} category.</p>
          <Button asChild size="sm">
            <Link to={sectionSettings.buttonLink || '#'}>{sectionSettings.buttonText}</Link>
          </Button>
        </div>
        <div className="h-48 md:h-full">
          <ProductImage src={sectionSettings.productImage} alt="Category Highlight" className="w-full h-full object-cover" aspectRatio="auto" lazy={true} />
        </div>
      </div>
    </section>
  );
};

const ProductGrid = ({ sectionSettings, getProductById }) => {
  if (!sectionSettings?.show) return null;
  const products = (sectionSettings.productIds || []).map(id => getProductById(id)).filter(Boolean).slice(0, sectionSettings.count || 8);
  if (!products || products.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-2">
      <h2 className="text-3xl font-bold text-center mb-4">{sectionSettings.title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

const FeaturedCarousel = ({ sectionSettings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!sectionSettings?.show || !Array.isArray(sectionSettings.slides) || sectionSettings.slides.length === 0 || !sectionSettings.autoPlay) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sectionSettings.slides.length);
    }, (sectionSettings.delay || 5) * 1000);
    return () => clearTimeout(timer);
  }, [currentIndex, sectionSettings]);

  if (!sectionSettings?.show || !Array.isArray(sectionSettings.slides) || sectionSettings.slides.length === 0) return null;

  const activeSlide = sectionSettings.slides[currentIndex];
  if (!activeSlide) return null;

  return (
    <section className="container mx-auto px-4 py-2">
      <div className="relative overflow-hidden rounded-xl h-64 md:h-80">
        <AnimatePresence>
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full h-full"
          >
            <ProductImage
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover"
              aspectRatio="auto"
              lazy={true}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/30 flex items-end p-6">
          <h3 className="text-white text-2xl font-bold">{activeSlide.title}</h3>
        </div>
        {sectionSettings.slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sectionSettings.slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)} className={cn("w-2 h-2 rounded-full", currentIndex === i ? "bg-white" : "bg-white/50")} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const CategoryBanners = ({ sectionSettings }) => {
  if (!sectionSettings?.show || !sectionSettings.banners) return null;
  const gridCols = `md:grid-cols-${sectionSettings.banners.length || 3}`;
  return (
    <section className="container mx-auto px-4 py-2">
      <div className={cn("grid gap-4", gridCols)}>
        {sectionSettings.banners.map((banner, idx) => (
          <motion.div whileHover={{ y: -3 }} key={banner.id || idx} className="relative rounded-lg overflow-hidden h-48 group">
            <Link to={banner.link || '#'}>
              <ProductImage src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" aspectRatio="auto" lazy={true} />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-xl font-bold">{banner.title}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const InfiniteProductPromo = ({ sectionSettings, carouselWidth, layoutType }) => {
  if (!sectionSettings?.show || !sectionSettings.selectedProductIds?.length) return null;

  const titleContainerClass = layoutType === 'full' 
    ? 'px-4 sm:px-6 mb-1' 
    : 'container mx-auto px-4 mb-1';

  return (
    <section className="py-1 w-full">
      <div className={titleContainerClass}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">{sectionSettings.title || 'Featured Products'}</h2>
        </motion.div>
      </div>
      
      <InfiniteProductCarousel 
        productIds={sectionSettings.selectedProductIds} 
        autoPlay={sectionSettings.autoPlay !== false} 
        speed={sectionSettings.speed || 30}
        carouselWidth={carouselWidth}
      />
    </section>
  );
};

const CategoryCarouselPromo = ({ sectionSettings, carouselWidth, layoutType }) => {
  if (!sectionSettings?.show || !sectionSettings.categoryId) return null;

  const titleContainerClass = layoutType === 'full' 
    ? 'px-4 sm:px-6 mb-1' 
    : 'container mx-auto px-4 mb-1';

  return (
    <section className="py-1 w-full">
      <div className={titleContainerClass}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">{sectionSettings.title || 'Category Highlights'}</h2>
        </motion.div>
      </div>
      
      <CategoryProductCarousel 
        categoryId={sectionSettings.categoryId} 
        autoPlay={sectionSettings.autoPlay !== false} 
        speed={sectionSettings.speed || 30}
        carouselWidth={carouselWidth}
      />
    </section>
  );
};

const BigPromoBanner = ({ sectionSettings }) => {
  if (!sectionSettings?.show) return null;

  return (
    <section className="w-full h-[400px] relative flex items-center justify-center text-center py-2">
      <ProductImage src={sectionSettings.image} alt={sectionSettings.title} className="absolute inset-0 w-full h-full object-cover" aspectRatio="auto" lazy={true} />
      <div style={{ backgroundColor: sectionSettings.overlayColor }} className="absolute inset-0"></div>
      <div className="relative z-10 p-6" style={{ color: sectionSettings.textColor }}>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-3">{sectionSettings.title}</h2>
        <p className="text-lg max-w-xl mx-auto mb-6">{sectionSettings.subtitle}</p>
        <Button asChild size="default" className="bg-background text-foreground hover:bg-background/90">
          <Link to={sectionSettings.buttonLink || '#'}>{sectionSettings.buttonText}</Link>
        </Button>
      </div>
    </section>
  );
};

const TrendingProducts = ({ sectionSettings, products }) => {
  if (!sectionSettings?.show) return null;

  const newArrivals = [...products].sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0)).slice(0, 8);
  const bestSellers = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 8);
  const trending = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

  return (
    <section className="container mx-auto px-4 py-2">
      <Tabs defaultValue={sectionSettings.defaultTab || 'trending'}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 gap-2">
          <h2 className="text-3xl font-bold">{sectionSettings.title}</h2>
          <TabsList className="h-9">
            <TabsTrigger value="trending" className="text-sm">Trending</TabsTrigger>
            <TabsTrigger value="new" className="text-sm">New</TabsTrigger>
            <TabsTrigger value="best" className="text-sm">Best Sellers</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="trending" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trending.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </TabsContent>
        <TabsContent value="new" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </TabsContent>
        <TabsContent value="best" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

const HomePage = ({ navigateTo, isPreview = false, previewMode = 'desktop', previewSettings, mobilePreviewSettings }) => {
  const { homePageSettings: liveSettings, mobileLayoutSettings: liveMobileSettings, initialHomePageSettings, boxLayoutSettings, getPageLayoutSettings } = useDesign();
  const { getProductById, products: allProductsFromContext, categories: allCategoriesFromContext } = useProducts();

  const homePageSettings = isPreview ? previewSettings || initialHomePageSettings : liveSettings;
  const mobileLayoutSettings = isPreview ? mobilePreviewSettings : liveMobileSettings;
  const carouselWidth = boxLayoutSettings?.carouselWidth || '110%';
  const homeLayout = getPageLayoutSettings('home');

  const getProductsFromIds = (ids, limit) => {
    if (!Array.isArray(ids)) return [];
    return ids.map(id => getProductById(id)).filter(Boolean).slice(0, limit);
  }

  const displayCategories = homePageSettings?.shopByCategory?.categories || [];

  const defaultSectionsOrder = [
    'hero', 'features', 'shopByCategory', 'featuredProducts', 'dualHeroBanner', 'categoryHighlight',
    'productGrid', 'featuredCarousel', 'categoryBanners', 'imageLinkCarousel1', 'imageLinkCarousel2', 'imageLinkCarousel3', 'categoryCarousel1', 'categoryCarousel2', 'categoryCarousel3', 'brandPromo', 'brandPromo2', 'brandPromo3', 'brandPromo4', 'brandPromo5', 'brandPromo6', 'bestSellers', 'bigPromoBanner', 'newArrivals', 'trendingProducts'
  ];

  const sectionsOrder = Array.isArray(homePageSettings?.sectionsOrder)
    ? homePageSettings.sectionsOrder
    : defaultSectionsOrder;

  const sectionComponents = {
    hero: <HeroSlider slides={homePageSettings?.hero?.slides} sliderSettings={homePageSettings?.hero?.sliderSettings} navigateTo={navigateTo} />,
    features: (
      <section className="container mx-auto px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'Orders > 100 AED' },
            { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
            { icon: CreditCard, title: 'Easy Returns', desc: '30-day guarantee' },
            { icon: Star, title: 'Best Quality', desc: 'Top-rated items' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-card border rounded-xl p-4 text-center shadow-sm"
            >
              <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <span className="font-semibold text-sm md:text-base block mb-1">{item.title}</span>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    ),
    shopByCategory: homePageSettings?.shopByCategory?.show && (
      <section className="container mx-auto px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-1">{homePageSettings.shopByCategory.title}</h2>
          <p className="text-sm text-center text-muted-foreground mb-4">{homePageSettings.shopByCategory.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {displayCategories.map((cat, idx) => (
              <motion.div
                key={cat.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-card border rounded-xl p-3 text-center group relative overflow-hidden h-28 shadow-sm"
              >
                <Link to={`/products/${cat.slug || cat.id}`} className="w-full h-full flex flex-col items-center justify-center">
                  {cat.image ? (
                    <>
                      <ProductImage src={cat.image} alt={cat.name} className="h-10 w-10 object-contain mb-2 group-hover:scale-110 transition-transform duration-300" aspectRatio="square" lazy={true} />
                      <span className="font-semibold text-sm">{cat.name}</span>
                    </>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                      <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{cat.icon}</span>
                      <span className="font-semibold text-sm">{cat.name}</span>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    ),
    featuredProducts: <ProductSection sectionSettings={homePageSettings?.featuredProducts} getProductsFromIds={getProductsFromIds} mobileSettings={mobileLayoutSettings?.homePage?.featuredProducts} isPreview={isPreview} previewMode={previewMode} />,
    bestSellers: <ProductSection sectionSettings={homePageSettings?.bestSellers} getProductsFromIds={getProductsFromIds} mobileSettings={mobileLayoutSettings?.homePage?.bestSellers} isPreview={isPreview} previewMode={previewMode} />,
    newArrivals: <ProductSection sectionSettings={homePageSettings?.newArrivals} getProductsFromIds={getProductsFromIds} mobileSettings={mobileLayoutSettings?.homePage?.newArrivals} isPreview={isPreview} previewMode={previewMode} />,
    dualHeroBanner: <DualHeroBanner sectionSettings={homePageSettings?.dualHeroBanner} />,
    categoryHighlight: <CategoryHighlightBox sectionSettings={homePageSettings?.categoryHighlight} categories={allCategoriesFromContext} />,
    productGrid: <ProductGrid sectionSettings={homePageSettings?.productGrid} getProductById={getProductById} />,
    featuredCarousel: <FeaturedCarousel sectionSettings={homePageSettings?.featuredCarousel} />,
    categoryBanners: <CategoryBanners sectionSettings={homePageSettings?.categoryBanners} />,
    imageLinkCarousel1: <ImageLinkCarouselSection sectionSettings={homePageSettings?.imageLinkCarousel1} carouselWidth={carouselWidth} />,
    imageLinkCarousel2: <ImageLinkCarouselSection sectionSettings={homePageSettings?.imageLinkCarousel2} carouselWidth={carouselWidth} />,
    imageLinkCarousel3: <ImageLinkCarouselSection sectionSettings={homePageSettings?.imageLinkCarousel3} carouselWidth={carouselWidth} />,
    brandPromo: <InfiniteProductPromo sectionSettings={homePageSettings?.brandPromo} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    brandPromo2: <InfiniteProductPromo sectionSettings={homePageSettings?.brandPromo2} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    brandPromo3: <InfiniteProductPromo sectionSettings={homePageSettings?.brandPromo3} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    brandPromo4: <InfiniteProductPromo sectionSettings={homePageSettings?.brandPromo4} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    brandPromo5: <InfiniteProductPromo sectionSettings={homePageSettings?.brandPromo5} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    brandPromo6: <InfiniteProductPromo sectionSettings={homePageSettings?.brandPromo6} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    categoryCarousel1: <CategoryCarouselPromo sectionSettings={homePageSettings?.categoryCarousel1} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    categoryCarousel2: <CategoryCarouselPromo sectionSettings={homePageSettings?.categoryCarousel2} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    categoryCarousel3: <CategoryCarouselPromo sectionSettings={homePageSettings?.categoryCarousel3} carouselWidth={carouselWidth} layoutType={homeLayout?.widthType} />,
    bigPromoBanner: <BigPromoBanner sectionSettings={homePageSettings?.bigPromoBanner} />,
    trendingProducts: <TrendingProducts sectionSettings={homePageSettings?.trendingProducts} products={allProductsFromContext} />
  };

  if (!homePageSettings) {
    return null;
  }

  return (
    <div className="space-y-2 pb-6 w-full pt-2">
      {homePageSettings?.hero?.promoBanner?.show && homePageSettings.hero.promoBanner.image && (
        <div className="container mx-auto px-4">
          <SectionErrorBoundary>
            <a href={homePageSettings.hero.promoBanner.link || '#'} target="_blank" rel="noopener noreferrer">
              <ProductImage src={homePageSettings.hero.promoBanner.image} alt="Promotional Banner" className="w-full h-auto rounded-lg shadow-sm" aspectRatio="auto" lazy={true} />
            </a>
          </SectionErrorBoundary>
        </div>
      )}

      {sectionsOrder.map(sectionId => {
        const section = homePageSettings?.[sectionId];
        if (!section || !section.show) return null;
        return (
          <SectionErrorBoundary key={sectionId}>
            {sectionComponents[sectionId]}
          </SectionErrorBoundary>
        )
      })}
    </div>
  );
};

export default HomePage;
