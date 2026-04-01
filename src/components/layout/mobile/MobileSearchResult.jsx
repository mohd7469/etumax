
import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useReviews } from '@/context/ReviewContext';
import { toast } from '@/components/ui/use-toast';

const MobileSearchResult = ({ product, formatPrice, onClick }) => {
  const { addToCart } = useCart();
  const { getReviewStatsForProduct } = useReviews();
  
  const stats = getReviewStatsForProduct(product?.id);
  const rating = stats?.averageRating > 0 ? stats.averageRating.toFixed(1) : (product.rating ? parseFloat(product.rating).toFixed(1) : '4.5');
  const reviewCount = stats?.reviewCount > 0 ? stats.reviewCount : (product.reviewCount || Math.floor(Math.random() * 100) + 5);

  const getImageUrl = (prod) => {
    if (prod.images && prod.images.length > 0) return prod.images[0];
    if (prod.image) return prod.image;
    return 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop';
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.inStock || product.stockStatus === 'instock') {
      addToCart(product);
      toast({
        title: 'Added to Cart',
        description: `${product.name} added to your cart.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Out of Stock',
        description: 'This item is currently unavailable.',
      });
    }
  };

  return (
    <div
      onClick={() => onClick(product)}
      className="flex items-center gap-3 p-3 bg-white border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer min-h-[80px]"
    >
      <div className="w-[60px] h-[60px] rounded-md overflow-hidden bg-gray-50 shrink-0 border border-gray-100 flex items-center justify-center p-1">
        <img
          src={getImageUrl(product)}
          alt={product.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
          {product.name}
        </h4>
        
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-[10px] h-[10px] fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] font-medium text-gray-700">{rating}</span>
          <span className="text-[10px] text-gray-400">({reviewCount})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="w-[44px] h-[44px] flex items-center justify-center bg-primary/10 text-primary rounded-full shrink-0 active:bg-primary/20 transition-colors"
        aria-label="Add to cart"
      >
        <ShoppingCart className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MobileSearchResult;
