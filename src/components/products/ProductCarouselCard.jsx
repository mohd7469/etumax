import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Plus } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ProductImage from '@/components/ui/ProductImage';
import { isValidImageUrl } from '@/lib/utils';
import { useProducts } from '@/context/ProductContext';
import { useDesign } from '@/context/DesignContext';
import { useReviews } from '@/context/ReviewContext';

const ProductCarouselCard = ({ product }) => {
  const { toggleWishlist, wishlist } = useUser();
  const { addToCart } = useCart();
  const { formatPrice } = useProducts();
  const { productPageLayout } = useDesign();
  const { getReviewStatsForProduct } = useReviews();

  // Live review stats
  const stats = getReviewStatsForProduct(product?.id);

  // Rating + review count fallback logic same as ProductCard
  const { displayRating, displayCount } = useMemo(() => {
    if (!product) return { displayRating: '0.0', displayCount: 0 };

    if (stats?.reviewCount > 0 && stats?.averageRating > 0) {
      return {
        displayRating: stats.averageRating.toFixed(1),
        displayCount: stats.reviewCount,
      };
    }

    if (product.rating) {
      return {
        displayRating: parseFloat(product.rating).toFixed(1),
        displayCount: product.reviewCount
          ? parseInt(product.reviewCount, 10)
          : Math.floor(Math.random() * 491) + 10,
      };
    }

    // Random fallback if no real reviews and no product rating
    return {
      displayRating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
      displayCount: Math.floor(Math.random() * 491) + 10,
    };
  }, [stats?.reviewCount, stats?.averageRating, product?.rating, product?.reviewCount, product]);

  if (!product) return null;

  const isInWishlist = wishlist.some((item) => item.id === product.id);

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (product.inStock || product.stockStatus === 'instock') {
      addToCart(product);
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

  let imageUrl =
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080';

  if (product.mainImage && isValidImageUrl(product.mainImage)) {
    imageUrl = product.mainImage;
  } else if (product.images?.[0] && isValidImageUrl(product.images[0])) {
    imageUrl = product.images[0];
  }

  const categoryName = product.categories?.[0] || 'Store';

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

  const priceSettings =
    productPageLayout?.find((el) => el.id === 'price')?.settings || {};
  const customPriceColor = priceSettings.color;

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="block group w-[220px] flex-shrink-0"
    >
      <motion.div
        whileHover={{ y: -2 }}
        className="compact-card flex flex-row items-center h-[110px] gap-3 transition-all duration-300 hover:shadow-md hover:border-primary/30"
      >
        {/* IMAGE LEFT */}
        <div className="relative w-[85px] h-full overflow-hidden rounded-lg bg-gray-50 flex-shrink-0">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />

          {hasSale && (
            <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[8px] px-1.5 py-0.5 rounded-[4px] font-bold z-10">
              -{discount}%
            </div>
          )}

          <button
            onClick={handleToggleWishlist}
            className="absolute top-1 right-1 bg-white/90 backdrop-blur w-6 h-6 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
          >
            <Heart
              className={`h-3 w-3 ${
                isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* CONTENT RIGHT */}
        <div className="flex flex-col justify-between flex-1 min-w-0 h-full py-1">
          <div>
            {/* Category & Rating */}
            <div className="flex justify-between items-center mb-1 gap-1">
              <span className="text-[9px] uppercase text-muted-foreground tracking-wider line-clamp-1 mr-1">
                {categoryName}
              </span>

              <div
                className="flex items-center gap-0.5 text-yellow-500 flex-shrink-0"
                title={`${displayCount} Reviews`}
              >
                <Star className="h-2.5 w-2.5 fill-current" />
                <span className="text-[10px] font-semibold text-gray-700">
                  {displayRating}
                </span>
                <span className="text-[9px] text-muted-foreground ml-0.5">
                  ({displayCount})
                </span>
              </div>
            </div>

            {/* TITLE */}
            <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex justify-between items-end mt-auto">
            <div className="flex flex-col">
              {hasSale && (
                <span className="text-[9px] text-muted-foreground line-through mb-[1px]">
                  {formatPrice(normalPrice)}
                </span>
              )}
              <span
                className="text-[13px] font-bold text-foreground leading-none"
                style={customPriceColor ? { color: customPriceColor } : {}}
              >
                {formatPrice(displayPrice)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center bg-primary text-primary-foreground w-7 h-7 rounded-full hover:bg-primary/90 transition shadow-sm hover:scale-105 active:scale-95 flex-shrink-0"
              aria-label="Add to cart"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCarouselCard;