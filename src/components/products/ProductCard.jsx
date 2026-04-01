import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ProductImage from '@/components/ui/ProductImage';
import { isValidImageUrl } from '@/lib/utils';
import { useProducts } from '@/context/ProductContext';
import { useDesign } from '@/context/DesignContext';
import { useReviews } from '@/context/ReviewContext';

const ProductCard = ({ product }) => {
  const { toggleWishlist, wishlist } = useUser();
  const { addToCart } = useCart();
  const { formatPrice } = useProducts();
  const { productPageLayout } = useDesign();
  const { getReviewStatsForProduct } = useReviews();

  // Fetch live review stats
  const stats = getReviewStatsForProduct(product?.id);

  // Calculate rating and count with fallbacks
  const { displayRating, displayCount } = useMemo(() => {
    if (!product) return { displayRating: '0.0', displayCount: 0 };

    if (stats?.reviewCount > 0 && stats?.averageRating > 0) {
      return {
        displayRating: stats.averageRating.toFixed(1),
        displayCount: stats.reviewCount
      };
    }
    if (product.rating) {
      return {
        displayRating: parseFloat(product.rating).toFixed(1),
        displayCount: product.reviewCount ? parseInt(product.reviewCount, 10) : Math.floor(Math.random() * 491) + 10
      };
    }
    return {
      displayRating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
      displayCount: Math.floor(Math.random() * 491) + 10
    };
  }, [stats?.reviewCount, stats?.averageRating, product?.rating, product?.reviewCount, product]);

  const isInWishlist = wishlist.some((item) => item.id === product?.id);

  if (!product) return null;

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product);
  };

  let imageUrl =
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080';

  if (product.mainImage && isValidImageUrl(product.mainImage)) {
    imageUrl = product.mainImage;
  } else if (product.images?.[0] && isValidImageUrl(product.images[0])) {
    imageUrl = product.images[0];
  }

  const categoryName = product.categories?.[0] || 'Fashion';

  const basePrice = parseFloat(product.price || 0);
  const regPrice = parseFloat(product.regularPrice || 0);
  const salePrice = parseFloat(product.salePrice || 0);

  let normalPrice = regPrice > 0 ? regPrice : basePrice;
  let currentPrice = salePrice > 0 ? salePrice : basePrice;

  if (currentPrice >= normalPrice) {
    currentPrice = 0;
  }

  const hasSale = currentPrice > 0;
  const displayPrice = hasSale ? currentPrice : normalPrice;

  const discount =
    hasSale && normalPrice > 0
      ? Math.round(((normalPrice - currentPrice) / normalPrice) * 100)
      : 0;

  const cleanShortDescription = String(
    product.short_description ||
    product.shortDescription ||
    ''
  )
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const priceSettings = productPageLayout?.find((el) => el.id === 'price')?.settings || {};
  const customPriceColor = priceSettings.color;

  const safePrice = Number(displayPrice || 0);
  const safeCurrency = product.currency || 'AED';
  const safeItemId = String(product.id || product.sku || product.slug || 'unknown-product');
  const safeItemName = product.name || 'Unnamed Product';
  const safeBrand =
    product.brand || product.manufacturer || product.storeBrand || '';
  const safeCategory =
    Array.isArray(product.categories)
      ? product.categories[0] || ''
      : product.categories || '';

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (product.inStock || product.stockStatus === 'instock') {
      addToCart(product);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currency: safeCurrency,
          value: safePrice,
          items: [
            {
              item_id: safeItemId,
              item_name: safeItemName,
              price: safePrice,
              item_category: safeCategory,
              item_brand: safeBrand,
              quantity: 1,
            },
          ],
        },
      });

      toast({
        title: 'Added to Cart',
        description: `${product.name} added to cart`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Out of Stock',
      });
    }
  };

  return (
    <Link to={`/product/${product.slug || product.id}`} className="block group w-full">
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-[18px] border border-gray-200 bg-[#f7f7f8] p-2 shadow-sm h-full flex flex-col overflow-hidden"
      >
        <div className="relative aspect-square overflow-hidden rounded-[14px] bg-gray-100 flex-shrink-0">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />

          {hasSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-[8px] font-bold z-10">
              SALE -{discount}%
            </div>
          )}

          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 bg-white w-8 h-8 rounded-full flex items-center justify-center shadow z-10"
          >
            <Heart
              className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`}
            />
          </button>
        </div>

        <div className="px-1.5 pt-2 pb-1 flex flex-col flex-grow min-w-0">
          <div className="flex justify-between items-center mb-1 gap-1 w-full overflow-hidden">
            <span className="text-[10px] uppercase text-gray-500 tracking-wide truncate flex-shrink">
              {categoryName}
            </span>

            <div
              className="flex items-center gap-0.5 bg-gray-100/80 backdrop-blur-sm px-1.5 py-0.5 rounded cursor-help flex-shrink-0 max-w-[60%] sm:max-w-none"
              title={`${displayCount} Reviews`}
            >
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-400 fill-yellow-400 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-800 whitespace-nowrap">{displayRating}</span>
              <span className="text-[8px] sm:text-[9px] text-gray-500 ml-0.5 truncate overflow-hidden">
                ({displayCount})
              </span>
            </div>
          </div>

          <h3 className="text-[12px] sm:text-[13px] font-bold text-black leading-tight mb-1 line-clamp-2 min-h-[2.4em]">
            {product.name}
          </h3>

          <p className="text-[10px] sm:text-[11px] text-gray-600 mb-2 line-clamp-1">
            {cleanShortDescription}
          </p>

          <div className="h-px bg-gray-200 mb-2 mt-auto" />

          <div className="flex justify-between items-end gap-2">
            <div className="min-w-0 flex-1">
              {hasSale && (
                <div className="text-[9px] sm:text-[10px] text-gray-400 line-through truncate">
                  {formatPrice(normalPrice)}
                </div>
              )}

              <div
                className="text-[13px] sm:text-[14px] font-bold text-black transition-colors truncate"
                style={customPriceColor ? { color: customPriceColor } : {}}
              >
                {formatPrice(displayPrice)}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-[10px] sm:text-[11px] font-medium px-3 sm:px-4 h-9 rounded-full hover:bg-primary/90 transition shrink-0 whitespace-nowrap"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;