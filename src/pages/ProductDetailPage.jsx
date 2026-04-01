import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Share2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import ProductCard from '@/components/products/ProductCard';
import FrequentlyBoughtTogether from '@/components/products/FrequentlyBoughtTogether';
import { useProducts } from '@/context/ProductContext';
import { useDesign } from '@/context/DesignContext';
import { useReviews } from '@/context/ReviewContext';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn, getOptimizedOGImageUrl } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCoupon } from '@/context/CouponContext';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useLoading } from '@/context/LoadingContext';
import { validateAndNormalizeImageUrl } from '@/lib/metaTags';
import OpenGraphMeta from '@/components/seo/OpenGraphMeta';
import ProductImage from '@/components/ui/ProductImage';
import PriceDisplay from '@/components/ui/PriceDisplay';
import { normalizeSlug, generateSlug } from '@/lib/slugUtils';

const normalizeCategories = (cats) => {
  if (!cats) return [];
  if (typeof cats === 'string') return [cats.trim()];
  if (Array.isArray(cats)) {
    return cats
      .map((c) => {
        if (!c) return null;
        if (typeof c === 'string') return c.trim();
        if (typeof c === 'object' && c.name) return c.name.trim();
        return null;
      })
      .filter(Boolean);
  }
  if (typeof cats === 'object') {
    if (cats.name) return [cats.name.trim()];
    return Object.values(cats)
      .map((v) =>
        typeof v === 'string'
          ? v.trim()
          : v && typeof v === 'object' && v.name
            ? v.name.trim()
            : null
      )
      .filter(Boolean);
  }
  return [];
};

const stripHtml = (html = '') =>
  String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const makePlainText = (value = '') =>
  String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const getFallbackProductTitle = (product) =>
  product?.name || product?.title || 'Premium Product';

const getFallbackDescriptionText = (product) => {
  const raw =
    product?.metaDescription ||
    product?.shortDescription ||
    product?.short_description ||
    product?.description ||
    '';

  const cleaned = makePlainText(raw).slice(0, 160);
  if (cleaned) return cleaned;

  return `Buy ${getFallbackProductTitle(product)} online in UAE at best price.`;
};

const getFallbackDescriptionHtml = (product) => {
  return (
    product?.description ||
    product?.shortDescription ||
    product?.short_description ||
    `<p>${getFallbackDescriptionText(product)}</p>`
  );
};

const getFallbackShortDescriptionHtml = (product) => {
  return (
    product?.shortDescription ||
    product?.short_description ||
    (product?.description ? `<p>${stripHtml(product.description).slice(0, 220)}</p>` : '') ||
    `<p>${getFallbackDescriptionText(product)}</p>`
  );
};

const getFallbackBrand = (product) =>
  product?.brand || product?.manufacturer || product?.storeBrand || 'Generic';

const getSafeProductImages = (product) => {
  const images =
    product?.images?.filter(Boolean)?.length > 0
      ? product.images.filter(Boolean)
      : product?.mainImage
        ? [product.mainImage]
        : [
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop',
          ];

  return images;
};

const getSafePrice = (product) => {
  const value = Number(
    product?.salePrice || product?.discountedPrice || product?.price || 0
  );
  return value > 0 ? value : 0;
};

const RightSidebarProductCard = ({ product }) => {
  if (!product) return null;

  const productUrl = `/product/${encodeURIComponent(product.slug || product.id)}`;

  return (
    <Link
      to={productUrl}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-2.5 transition-all hover:border-primary/30 hover:bg-accent/30"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        <ProductImage
          src={product.mainImage || (product.images?.length ? product.images[0] : null)}
          alt={getFallbackProductTitle(product)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          aspectRatio="square"
          lazy={true}
        />
      </div>
      <div className="min-w-0">
        <h4 className="text-xs font-medium line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">
          {getFallbackProductTitle(product)}
        </h4>
        <div className="mt-1">
          <PriceDisplay product={product} size="sm" />
        </div>
      </div>
    </Link>
  );
};

const ProductDetailSidebar = ({ product, isPreview, designSettings }) => {
  const { products } = useProducts();
  const { productPageDesign } = useDesign();

  const sidebarSettings = isPreview ? designSettings?.sidebar : productPageDesign?.sidebar;
  if (!sidebarSettings?.show || !product) return null;

  const productCats = normalizeCategories(product.categories);

  const sidebarProducts = products
    .map((p) => ({ ...p, _cats: normalizeCategories(p.categories) }))
    .filter((p) => p.id !== product.id && p._cats.some((cat) => productCats.includes(cat)))
    .sort(() => 0.5 - Math.random())
    .slice(0, sidebarSettings.limit || 5);

  if (sidebarProducts.length === 0) return null;

  return (
    <aside className="lg:block w-full flex-shrink-0 space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-4 shadow-sm mt-6">
        <h3 className="text-base font-bold mb-3 text-foreground">
          {sidebarSettings.title || 'You May Also Like'}
        </h3>
        <div className={`grid gap-3 grid-cols-${sidebarSettings.columns || 1}`}>
          {sidebarProducts.map((p) => (
            <RightSidebarProductCard key={`sidebar-${p.id}`} product={p} />
          ))}
        </div>
      </div>
    </aside>
  );
};

const ReviewForm = ({ productId }) => {
  const { addReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0 || !author || !email || !content) {
      toast({ variant: 'destructive', title: 'Please fill all fields' });
      return;
    }

    addReview({ productId, rating, author, email, content });
    toast({ title: 'Review submitted for approval!' });
    setRating(0);
    setAuthor('');
    setEmail('');
    setContent('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 md:p-6 space-y-4 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-bold text-foreground">Write a review</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Share your experience with this product.
        </p>
      </div>

      <div>
        <span className="text-sm font-semibold text-foreground">Your rating:</span>
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                'w-5 h-5 cursor-pointer transition-colors',
                i < (hoverRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-muted-foreground/30'
              )}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(i + 1)}
            />
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Your review..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="text-sm min-h-[120px] bg-background"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Your Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="text-sm bg-background"
          required
        />
        <Input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-sm bg-background"
          required
        />
      </div>

      <Button type="submit" size="sm" className="px-6">
        Submit Review
      </Button>
    </form>
  );
};

const ProductReviews = ({ productId }) => {
  const { getReviewsForProduct } = useReviews();
  const reviews = getReviewsForProduct(productId);

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl border border-border/60 bg-background/70 p-4 md:p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <h4 className="text-sm font-bold text-foreground">{review.author}</h4>
            <span className="text-xs text-muted-foreground">
              {new Date(review.submittedOn).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-foreground/80 leading-6">{review.content}</p>
        </div>
      ))}
    </div>
  );
};

const BundleOffers = ({ product, formatPrice }) => {
  const { addToCart } = useCart();
  const { bundleDiscounts } = useCoupon();
  const [selectedBundle, setSelectedBundle] = useState(null);

  const sortedBundles = React.useMemo(
    () => [...(bundleDiscounts || [])].sort((a, b) => a.quantity - b.quantity),
    [bundleDiscounts]
  );

  if (sortedBundles.length === 0 || !product) return null;

  const handleAddBundleToCart = () => {
    if (!selectedBundle) {
      toast({ variant: 'destructive', title: 'No bundle selected' });
      return;
    }

    const bundle = sortedBundles.find((b) => b.id === selectedBundle);
    if (bundle) addToCart(product, bundle.quantity, {}, bundle.coupon);
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/60">
      <h3 className="text-sm font-bold text-center mb-3 text-foreground">
        Buy More, Save More!
      </h3>
      <RadioGroup value={selectedBundle} onValueChange={setSelectedBundle} className="space-y-2">
        {sortedBundles.map((bundle) => {
          const originalPrice = Number(product.price || 0) * bundle.quantity;
          const discountedPrice = originalPrice * (1 - bundle.discount / 100);

          return (
            <Label
              key={bundle.id}
              htmlFor={bundle.id}
              className="flex items-center p-3 border border-border rounded-xl cursor-pointer has-[:checked]:bg-primary/5 has-[:checked]:border-primary/40 transition-all relative"
            >
              <RadioGroupItem value={bundle.id} id={bundle.id} className="mr-3" />
              <div className="flex-grow">
                <p className="text-xs font-semibold text-foreground">{`Buy ${bundle.quantity} get ${bundle.discount}% off`}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{formatPrice(discountedPrice)}</p>
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </p>
              </div>
            </Label>
          );
        })}
      </RadioGroup>

      <Button
        onClick={handleAddBundleToCart}
        disabled={!selectedBundle || !(product.inStock || product.stockStatus === 'instock')}
        size="sm"
        className="w-full mt-3 h-10"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add Bundle
      </Button>
    </div>
  );
};

const ProductDetailPage = ({
  product: initialProduct,
  navigateTo,
  isPreview = false,
  previewMode = 'desktop',
  previewLayout,
  previewDesign,
  mobilePreviewSettings,
}) => {
  const { slug } = useParams();
  const {
    products,
    categories,
    formatPrice,
    addRecentlyViewed,
    getRecentlyViewedProducts,
  } = useProducts();

  const product = useMemo(() => {
    if (initialProduct) return initialProduct;
    if (!slug || !products || products.length === 0) return null;

    const targetSlug = normalizeSlug(slug);

    return products.find((p) => {
      if (p.slug && normalizeSlug(p.slug) === targetSlug) return true;
      if (p.name && generateSlug(p.name) === targetSlug) return true;
      if (p.legacySlug && normalizeSlug(p.legacySlug) === targetSlug) return true;
      if (String(p.id) === targetSlug || String(p.id) === slug) return true;
      return false;
    }) || null;
  }, [initialProduct, slug, products]);

  const {
    productPageLayout: designLayout,
    productPageDesign: liveDesign,
    mobileLayoutSettings: liveMobileSettings,
    bundleSettings,
    getPageLayoutSettings,
  } = useDesign();

  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useUser();
  const { bundleCoupon } = useCoupon();
  const { isLoading } = useLoading();
  const { getReviewsForProduct } = useReviews();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [recentCartActivity, setRecentCartActivity] = useState({
    count: 0,
    hours: 24,
  });
  const [stockUrgency, setStockUrgency] = useState(5);

  const tabsRef = useRef(null);
  const isMobileView = isPreview && previewMode === 'mobile';

  const detailLayout = useMemo(() => getPageLayoutSettings('detail'), [getPageLayoutSettings]);

  const openReviews = () => {
    setActiveTab('reviews');
    requestAnimationFrame(() => {
      const el = tabsRef.current || document.getElementById('product-tabs-section');
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const productCats = useMemo(() => normalizeCategories(product?.categories), [product?.categories]);
  const fallbackTitle = useMemo(() => getFallbackProductTitle(product), [product]);
  const productDescription = useMemo(() => {
    // For SEO meta tags, we prioritize the full/detailed description and use a longer limit
    const raw = product?.description || product?.metaDescription || product?.shortDescription || '';
    return makePlainText(raw).slice(0, 350);
  }, [product]);
  const shortDescriptionHtml = useMemo(() => getFallbackShortDescriptionHtml(product), [product]);
  const fullDescriptionHtml = useMemo(() => getFallbackDescriptionHtml(product), [product]);
  const fallbackBrand = useMemo(() => getFallbackBrand(product), [product]);

  const liveReviews = useMemo(() => {
    if (!product?.id) return [];
    const rows = getReviewsForProduct(product.id) || [];
    return Array.isArray(rows) ? rows : [];
  }, [product?.id, getReviewsForProduct]);

  const liveReviewStats = useMemo(() => {
    if (!liveReviews.length) {
      return {
        count: 0,
        rating: 0,
      };
    }

    const validRatings = liveReviews
      .map((r) => Number(r?.rating || 0))
      .filter((r) => r > 0);

    if (!validRatings.length) {
      return {
        count: 0,
        rating: 0,
      };
    }

    const avg =
      validRatings.reduce((sum, value) => sum + value, 0) / validRatings.length;

    return {
      count: validRatings.length,
      rating: Number(avg.toFixed(1)),
    };
  }, [liveReviews]);

  const displayedReviewData = useMemo(() => {
    if (liveReviewStats.count > 0 && liveReviewStats.rating > 0) {
      return {
        rating: liveReviewStats.rating,
        count: liveReviewStats.count,
        isFake: false,
      };
    }

    const productReviewCount = Number(product?.reviewCount || 0);
    const productRating = Number(product?.rating || 0);

    if (productReviewCount > 0 && productRating > 0) {
      return {
        rating: productRating,
        count: productReviewCount,
        isFake: false,
      };
    }

    const randomCount = Math.floor(Math.random() * (390 - 160 + 1)) + 160;
    const randomRating = (Math.random() * (4.9 - 4.1) + 4.1).toFixed(1);

    return {
      rating: Number(randomRating),
      count: randomCount,
      isFake: true,
    };
  }, [
    liveReviewStats.count,
    liveReviewStats.rating,
    product?.reviewCount,
    product?.rating,
    product?.id,
  ]);

  const estimatedDeliveryText = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);

    const end = new Date();
    end.setDate(end.getDate() + 2);

    const formatPart = (date) => {
      const day = date.getDate();
      const weekday = date.toLocaleString('en-US', { weekday: 'short' });
      return `${day} ${weekday}`;
    };

    const startText = formatPart(start);
    const endText = formatPart(end);
    const endMonth = end.toLocaleString('en-US', { month: 'short' });

    return `${startText} to ${endText} ${endMonth}`;
  }, []);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl =
    typeof window !== 'undefined' && product
      ? `${siteUrl}/product/${encodeURIComponent(product?.slug || product?.id)}`
      : siteUrl;

  const productImages = useMemo(() => getSafeProductImages(product), [product]);
  const mainImage = productImages[mainImageIndex] || productImages[0];

  const normalizedSeoImage = useMemo(() => {
    if (!product) return null;

    let img =
      product.mainImage || (product.images?.length > 0 ? product.images[0] : null);

    if (!img) {
      img =
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop';
    }

    img = getOptimizedOGImageUrl(img) || img;
    return validateAndNormalizeImageUrl(img);
  }, [product]);

  const safePrice = getSafePrice(product);

  useEffect(() => {
    if (product && product.id && !isPreview) addRecentlyViewed(product.id);
  }, [product, addRecentlyViewed, isPreview]);

  useEffect(() => {
    setActiveTab('description');
    setMainImageIndex(0);
    setQuantity(1);
    setSelectedOptions({});
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [product?.id, slug]);

  useEffect(() => {
    if (!product?.id) return;

    const generated = {
      count: Math.floor(Math.random() * 19) + 2,
      hours: Math.floor(Math.random() * 25) + 24,
    };

    setRecentCartActivity(generated);
    setStockUrgency(Math.floor(Math.random() * 6) + 3);
  }, [product?.id]);

  useEffect(() => {
    if (!product || !product.id || isPreview) return;

    const viewItemKey = `view_item_sent_${product.id}_${slug || ''}`;
    if (sessionStorage.getItem(viewItemKey)) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });

    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: product?.currency || 'AED',
        value: Number(safePrice || 0),
        items: [
          {
            item_id: String(product.id || product.sku || product.slug || 'unknown-product'),
            item_name: fallbackTitle || 'Unnamed Product',
            price: Number(safePrice || 0),
            item_category: productCats?.[0] || '',
            item_brand: fallbackBrand || '',
            quantity: 1,
          },
        ],
      },
    });

    console.log('GA4 view_item fired:', {
      item_id: product.id,
      item_name: fallbackTitle,
    });

    sessionStorage.setItem(viewItemKey, 'true');
  }, [product, isPreview, slug, safePrice, fallbackTitle, productCats, fallbackBrand]);

  if (isLoading && !product) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    const keywords = (slug || '').split('-').filter((w) => w.length > 2);
    let related = products;

    if (keywords.length > 0) {
      related = products
        .filter((p) =>
          keywords.some((word) =>
            (p.name || '').toLowerCase().includes(word.toLowerCase())
          )
        )
        .slice(0, 10);
    } else {
      related = [...products].slice(0, 10);
    }

    return (
      <div className="container mx-auto px-4 py-10">
        <Helmet prioritizeSeoTags>
          <title>Product Not Found</title>
          <meta
            name="description"
            content="The requested product could not be found. Browse other products from our store."
          />
        </Helmet>

        <h1 className="text-2xl font-bold mb-6">Products You May Like</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} navigateTo={navigateTo} />
          ))}
        </div>
        <Button onClick={() => navigateTo('products')} variant="outline" className="mt-8">
          Browse All
        </Button>
      </div>
    );
  }

  const mobileLayoutSettings = isPreview ? mobilePreviewSettings : liveMobileSettings;
  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const orderedLayout = isPreview ? previewLayout : designLayout;
  const pageDesign = isPreview ? previewDesign : liveDesign;

  const relatedProductsBottom = products
    .filter(
      (p) =>
        p.id !== product.id &&
        normalizeCategories(p.categories).some((cat) => productCats.includes(cat))
    )
    .slice(
      0,
      isMobileView && mobileLayoutSettings?.productPage?.relatedProducts
        ? mobileLayoutSettings.productPage.relatedProducts.quantity
        : 10
    );

  const recentlyViewedProducts = getRecentlyViewedProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  const primaryCategory = categories.find((c) => c.name === productCats[0]);
  const primaryCategoryUrl = primaryCategory
    ? `${siteUrl}/products/${encodeURIComponent(primaryCategory.slug || primaryCategory.id)}`
    : `${siteUrl}/products`;

  const shippingRateValue =
    Number(product?.shippingCost || product?.shippingRate || 0) >= 0
      ? Number(product?.shippingCost || product?.shippingRate || 0)
      : 0;

  const merchantReturnDays =
    Number(product?.returnDays || product?.merchantReturnDays || 7) > 0
      ? Number(product?.returnDays || product?.merchantReturnDays || 7)
      : 7;

  const handleAddToCart = () => {
    if (isPreview) {
      toast({ title: 'Preview Mode', description: 'Add to cart disabled.' });
      return;
    }

    addToCart(product, quantity, selectedOptions);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: product?.currency || 'AED',
        value: Number(safePrice || 0) * Number(quantity || 1),
        items: [
          {
            item_id: String(product.id || product.sku || product.slug || 'unknown-product'),
            item_name: fallbackTitle || 'Unnamed Product',
            price: Number(safePrice || 0),
            item_category: productCats?.[0] || '',
            item_brand: fallbackBrand || '',
            quantity: Number(quantity || 1),
          },
        ],
      },
    });

    console.log('GA4 add_to_cart fired:', {
      item_id: product.id,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (isPreview) {
      toast({ title: 'Preview Mode', description: 'Buy now disabled.' });
      return;
    }

    addToCart(product, quantity, selectedOptions);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });

    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: product?.currency || 'AED',
        value: Number(safePrice || 0) * Number(quantity || 1),
        items: [
          {
            item_id: String(product.id || product.sku || product.slug || 'unknown-product'),
            item_name: fallbackTitle || 'Unnamed Product',
            price: Number(safePrice || 0),
            item_category: productCats?.[0] || '',
            item_brand: fallbackBrand || '',
            quantity: Number(quantity || 1),
          },
        ],
      },
    });

    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: product?.currency || 'AED',
        value: Number(safePrice || 0) * Number(quantity || 1),
        items: [
          {
            item_id: String(product.id || product.sku || product.slug || 'unknown-product'),
            item_name: fallbackTitle || 'Unnamed Product',
            price: Number(safePrice || 0),
            item_category: productCats?.[0] || '',
            item_brand: fallbackBrand || '',
            quantity: Number(quantity || 1),
          },
        ],
      },
    });

    console.log('GA4 begin_checkout fired from Buy Now:', {
      item_id: product.id,
      quantity,
    });

    navigateTo('checkout');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({ title: 'Link Copied!' });
  };

  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: fallbackTitle,
    image: productImages,
    description: productDescription,
    sku: product?.sku || product?.id || 'N/A',
    category: productCats.length ? productCats.join(', ') : 'General',
    brand: {
      '@type': 'Brand',
      name: fallbackBrand,
    },
    ...(product?.gtin
      ? { gtin: String(product.gtin) }
      : product?.barcode
        ? { gtin: String(product.barcode) }
        : {}),
    ...(product?.mpn
      ? { mpn: String(product.mpn) }
      : product?.partNumber
        ? { mpn: String(product.partNumber) }
        : {}),
    ...(liveReviewStats.count > 0 && liveReviewStats.rating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: liveReviewStats.rating.toFixed(1),
            reviewCount: liveReviewStats.count,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: currentUrl,
      priceCurrency: product?.currency || 'AED',
      price: safePrice.toFixed(2),
      availability:
        product?.inStock || product?.stockStatus === 'instock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: shippingRateValue.toFixed(2),
          currency: product?.currency || 'AED',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'AE',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'AE',
        returnPolicyCategory:
          'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: merchantReturnDays,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${siteUrl}/products`,
      },
      ...(productCats.length > 0
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: productCats[0],
              item: primaryCategoryUrl,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: productCats.length > 0 ? 4 : 3,
        name: fallbackTitle,
        item: currentUrl,
      },
    ],
  };

  const reviewSchema =
    liveReviewStats.count > 0 && liveReviewStats.rating > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: fallbackTitle,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: liveReviewStats.rating.toFixed(1),
            reviewCount: liveReviewStats.count,
          },
          review: liveReviews.slice(0, 5).map((review) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: review.author || 'Customer',
            },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: Number(review.rating || 5),
              bestRating: 5,
            },
            reviewBody: review.content || '',
            ...(review.submittedOn
              ? {
                  datePublished: new Date(review.submittedOn).toISOString(),
                }
              : {}),
          })),
        }
      : null;

  const nextImage = () =>
    setMainImageIndex((prev) => (prev + 1) % productImages.length);

  const prevImage = () =>
    setMainImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);

  const getElementStyle = (elementId) => {
    const element = orderedLayout.find((el) => el.id === elementId);

    if (element?.settings) {
      return {
        textAlign: element.settings.align,
        fontSize: element.settings.fontSize,
        color: element.settings.color,
      };
    }

    return {};
  };

  const renderElement = (el) => {
    if (!el || !el.visible) return null;

    switch (el.id) {
      case 'gallery':
        return (
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm group shadow-sm">
              <ProductImage
                alt={fallbackTitle}
                className="w-full h-full object-cover"
                src={mainImage}
                aspectRatio="square"
                lazy={false}
              />
              {productImages.length > 1 && (
                <>
                  <Button
                    onClick={prevImage}
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={nextImage}
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImageIndex(index)}
                    className={cn(
                      'w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-card transition-all',
                      mainImageIndex === index
                        ? 'border-primary shadow-sm'
                        : 'border-border/60 hover:border-primary/40'
                    )}
                  >
                    <ProductImage
                      src={img}
                      alt="thumb"
                      className="w-full h-full object-cover"
                      aspectRatio="square"
                      lazy={true}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'title':
        return (
          <h1
            className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-foreground"
            style={getElementStyle('title')}
          >
            {fallbackTitle}
          </h1>
        );

      case 'reviews_stars':
        return (
          <button
            type="button"
            onClick={openReviews}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ justifyContent: getElementStyle('reviews_stars').textAlign }}
          >
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                const fullStars = Math.floor(displayedReviewData.rating);
                const hasHalfStar = displayedReviewData.rating - fullStars >= 0.5;

                return (
                  <div key={i} className="relative w-4 h-4">
                    <Star className="absolute inset-0 w-4 h-4 text-muted-foreground/30" />
                    {i < fullStars ? (
                      <Star className="absolute inset-0 w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ) : i === fullStars && hasHalfStar ? (
                      <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <span className="text-sm text-muted-foreground font-medium underline underline-offset-2">
              {displayedReviewData.rating.toFixed(1)} ({displayedReviewData.count} reviews)
            </span>
          </button>
        );

      case 'price':
        return (
          <div className="py-2 rounded-xl" style={{ textAlign: getElementStyle('price').textAlign }}>
            <PriceDisplay product={product} size="lg" />
          </div>
        );

      case 'short_description':
        return (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-2.5 md:p-3"
          >
            <div
              className="text-xs text-foreground/75 leading-5 line-clamp-2 overflow-hidden"
              style={getElementStyle('short_description')}
              dangerouslySetInnerHTML={{
                __html: shortDescriptionHtml,
              }}
            />
          </motion.div>
        );

      case 'variant_selector':
        return (
          <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-4 md:p-5">
            {product.options?.map((option) => (
              <div key={option.name}>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
                  {option.name}:{' '}
                  <span className="text-foreground">
                    {selectedOptions[option.name] || 'Select'}
                  </span>
                </span>
                <div className="flex gap-2 flex-wrap">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleOptionSelect(option.name, value)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-lg border transition-all',
                        selectedOptions[option.name] === value
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'quantity_selector':
        return (
          <div className="flex items-center justify-between py-1 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center bg-muted/50 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center hover:bg-background rounded-lg transition-colors"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center hover:bg-background rounded-lg transition-colors"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-3">
              {product.inStock || product.stockStatus === 'instock' ? (
                <span className="text-xs text-green-600 font-bold flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle className="w-3.5 h-3.5" /> In Stock
                </span>
              ) : (
                <span className="text-xs text-red-500 font-bold whitespace-nowrap">
                  Out of Stock
                </span>
              )}

              <Button
                onClick={() => !isPreview && toggleWishlist(product)}
                variant="outline"
                className="w-10 h-10 p-0 rounded-lg"
              >
                <Heart
                  className={cn(
                    'w-4 h-4',
                    isInWishlist ? 'fill-pink-500 text-pink-500' : ''
                  )}
                />
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-10 h-10 p-0 rounded-lg"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      case 'add_to_cart':
        return (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!(product.inStock || product.stockStatus === 'instock')}
                className="flex-[2] h-11 rounded-xl text-sm font-bold"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={!(product.inStock || product.stockStatus === 'instock')}
                variant="outline"
                className="flex-[1] h-11 rounded-xl text-sm font-bold border border-primary bg-background text-primary hover:bg-primary/5"
              >
                Buy Now
              </Button>
            </div>

            <BundleOffers product={product} formatPrice={formatPrice} />
          </div>
        );

      case 'trust_badges':
        return (
          <div className="mt-4 space-y-2.5">
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-primary/[0.04]" />

              <div className="relative flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 md:px-4">
                <div className="flex flex-wrap items-center gap-2">
                  <motion.div
                    animate={{
                      opacity: [1, 0.45, 1],
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 0 0px rgba(0,0,0,0)',
                        '0 0 18px hsl(var(--primary) / 0.18)',
                        '0 0 0px rgba(0,0,0,0)',
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary shadow-sm shrink-0"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Free delivery
                  </motion.div>

                  <motion.div
                    animate={{ opacity: [1, 0.65, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive"
                  >
                    Selling fast
                  </motion.div>
                </div>

                <div className="flex items-center gap-1 text-xs leading-5 text-muted-foreground">
                  <span className="font-medium">Est.</span>
                  <span className="font-extrabold tracking-wide text-foreground">
                    {estimatedDeliveryText}
                  </span>
                  <span className="text-muted-foreground/70">· UAE</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 backdrop-blur-sm px-3 py-2.5 shadow-sm space-y-1.5">
              <p className="text-xs leading-5 text-foreground/80">
                <span className="font-bold text-primary">
                  {recentCartActivity.count} people
                </span>{' '}
                added this product to cart in the last{' '}
                <span className="font-semibold text-foreground">
                  {recentCartActivity.hours} hours
                </span>
                .
              </p>

              <p className="flex items-center gap-1.5 text-[11px] leading-5 text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>

                Only <span className="font-bold text-foreground">{stockUrgency}</span> left in
                stock
              </p>
            </div>
          </div>
        );

      case 'meta':
        return (
          <div
            className="text-xs text-muted-foreground pt-3 border-t border-border/60"
            style={{ textAlign: getElementStyle('meta').textAlign }}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="whitespace-nowrap">
                SKU: <span className="text-foreground/80">{product?.sku || product?.id || 'N/A'}</span>
              </p>

              <p className="whitespace-nowrap">
                Categories:{' '}
                <span className="text-foreground/80">
                  {normalizeCategories(product?.categories).join(', ') || 'General'}
                </span>
              </p>

              <p className="whitespace-nowrap">
                Brand: <span className="text-foreground/80">{fallbackBrand}</span>
              </p>
            </div>
          </div>
        );

      case 'product_tabs':
        return (
          <div className="w-full pt-4" ref={tabsRef} id="product-tabs-section">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-5">
              {['description', 'features', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2.5 rounded-full text-sm font-semibold capitalize transition-all border',
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
                  )}
                >
                  {tab === 'reviews'
                    ? `reviews (${displayedReviewData.count})`
                    : tab}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 md:p-7 min-h-[180px] shadow-sm w-full min-w-0 overflow-hidden">
              {activeTab === 'description' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full min-w-0 overflow-hidden"
                >
                  <div
                    className="prose prose-sm md:prose-base max-w-full text-foreground/80 prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 [&_*]:max-w-full [&_*]:min-w-0 [&_*]:whitespace-normal [&_*]:break-words [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_img]:h-auto [&_img]:max-w-full"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                    }}
                    dangerouslySetInnerHTML={{ __html: fullDescriptionHtml }}
                  />
                </motion.div>
              )}

              {activeTab === 'features' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {product.features?.length > 0 ? (
                    <ul className="grid gap-3">
                      {product.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-xl border border-border/60 bg-background/70 p-3.5"
                        >
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span
                            className="text-sm text-foreground/80 leading-6"
                            dangerouslySetInnerHTML={{ __html: f }}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : shortDescriptionHtml ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Product Highlights
                      </h4>
                      <div
                        className="text-sm text-foreground/75 leading-7 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                      <p className="text-sm text-muted-foreground">No features listed.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <>
                  <ProductReviews productId={product.id} />
                  <ReviewForm productId={product.id} />
                </>
              )}
            </div>
          </div>
        );

      case 'related_products_bottom': {
        const cols =
          isMobileView && mobileLayoutSettings?.productPage?.relatedProducts?.columns
            ? mobileLayoutSettings.productPage.relatedProducts.columns
            : 5;

        return (
          <div className="pt-8">
            <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-foreground">
              Related Products
            </h2>
            <div
              className={cn(
                'grid gap-3',
                isMobileView ? `!grid-cols-${cols}` : 'grid-cols-2 md:grid-cols-5'
              )}
            >
              {relatedProductsBottom.map((p) => (
                <ProductCard key={p.id} product={p} navigateTo={navigateTo} />
              ))}
            </div>
          </div>
        );
      }

      case 'recently_viewed':
        if (recentlyViewedProducts.length === 0) return null;

        return (
          <div className="pt-8">
            <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-foreground">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {recentlyViewedProducts.map((p) => (
                <ProductCard key={p.id} product={p} navigateTo={navigateTo} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const bottomElements = ['product_tabs', 'related_products_bottom', 'recently_viewed'];
  const infoElements = orderedLayout.filter(
    (el) => !bottomElements.includes(el.id) && el.id !== 'gallery'
  );

  const mainLayout = (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:w-1/2"
      >
        {renderElement(orderedLayout.find((el) => el.id === 'gallery'))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:w-1/2 space-y-3"
      >
        {infoElements.map((el) => (
          <div key={el.id}>{renderElement(el)}</div>
        ))}

        <FrequentlyBoughtTogether
          currentProduct={product}
          bundleSettings={bundleSettings}
          navigateTo={navigateTo}
          bundleCoupon={bundleCoupon}
        />
      </motion.div>
    </div>
  );

  const threeColLayout = (
    <div className="flex flex-col lg:flex-row gap-6">
      <div style={{ flexBasis: `${pageDesign?.columnWidths?.gallery || 40}%` }}>
        {renderElement(orderedLayout.find((el) => el.id === 'gallery'))}
      </div>

      <div
        className="space-y-3"
        style={{ flexBasis: `${pageDesign?.columnWidths?.info || 40}%` }}
      >
        {infoElements.map((el) => (
          <div key={el.id}>{renderElement(el)}</div>
        ))}
      </div>

      <div style={{ flexBasis: `${pageDesign?.columnWidths?.sidebar || 20}%` }}>
        <FrequentlyBoughtTogether
          currentProduct={product}
          bundleSettings={bundleSettings}
          navigateTo={navigateTo}
          bundleCoupon={bundleCoupon}
        />
        <ProductDetailSidebar
          product={product}
          isPreview={isPreview}
          designSettings={pageDesign}
        />
      </div>
    </div>
  );

  const layoutBoxStyles = detailLayout?.enabled
    ? {
        maxWidth: detailLayout.widthValue,
        padding: detailLayout.padding ? `${detailLayout.padding}rem` : '1.5rem',
        backgroundColor: detailLayout.bg,
        boxShadow:
          detailLayout.shadow !== 'none'
            ? `var(--shadow-${detailLayout.shadow})`
            : 'none',
        borderColor: detailLayout.borderColor,
        borderWidth: detailLayout.borderWidth ? `${detailLayout.borderWidth}px` : '0px',
        borderRadius: detailLayout.radius ? `${detailLayout.radius}rem` : '0rem',
        margin: '0 auto',
        width: '100%',
      }
    : {};

  return (
    <div
      className={cn('mx-auto', !detailLayout?.enabled && 'max-w-7xl px-4 py-6')}
      style={detailLayout?.enabled ? layoutBoxStyles : {}}
    >
      <OpenGraphMeta
        title={product?.seoTitle || product?.metaTitle || fallbackTitle}
        description={productDescription}
        image={normalizedSeoImage}
        url={currentUrl}
        type="product"
        price={product?.price}
        currency={product?.currency || 'AED'}
        siteName=""
      />

      <Helmet prioritizeSeoTags>
        <title>{product?.seoTitle || product?.metaTitle || fallbackTitle}</title>
        <meta name="description" content={productDescription} />

        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {reviewSchema && (
          <script type="application/ld+json">{JSON.stringify(reviewSchema)}</script>
        )}
      </Helmet>

      {!isPreview && (
        <button
          onClick={() => navigateTo('products')}
          className="flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-4 uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Shop
        </button>
      )}

      <div className="mb-10">
        {pageDesign?.layout === 'three-column' ? threeColLayout : mainLayout}
      </div>

      <div className="space-y-10 border-t border-border/60 pt-8">
        {orderedLayout
          .filter((el) => bottomElements.includes(el.id))
          .map((el) => (
            <div key={el.id}>{renderElement(el)}</div>
          ))}
      </div>
    </div>
  );
};

export default ProductDetailPage;