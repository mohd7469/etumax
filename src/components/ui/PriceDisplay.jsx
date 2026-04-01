import React from 'react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/context/ProductContext';
import { useDesign } from '@/context/DesignContext';

const PriceDisplay = ({ product, className, size = 'default' }) => {
  const { formatPrice } = useProducts();
  const { productPageLayout } = useDesign();

  if (!product) return null;

  const basePrice = parseFloat(product.price || 0);
  const pRegPrice = parseFloat(
    product.regularPrice || product.originalPrice || product.compareAtPrice || 0
  );
  const pSalePrice = parseFloat(product.salePrice || product.discountedPrice || 0);

  let normalPrice = pRegPrice > 0 ? pRegPrice : basePrice;
  let currentPrice = pSalePrice > 0 ? pSalePrice : basePrice;

  // If regular exists and base is lower but no explicit sale price
  if (pRegPrice > basePrice && basePrice > 0 && pSalePrice === 0) {
    currentPrice = basePrice;
  }

  // Ignore invalid sale price
  if (currentPrice >= normalPrice) {
    normalPrice = currentPrice > 0 ? currentPrice : normalPrice;
    currentPrice = 0;
  }

  const hasSale = currentPrice > 0 && currentPrice < normalPrice;
  const displayPrice = hasSale ? currentPrice : normalPrice;

  const discountPercentage =
    hasSale && normalPrice > 0
      ? Math.round(((normalPrice - currentPrice) / normalPrice) * 100)
      : 0;

  // Optional custom price color from design settings
  const priceSettings =
    productPageLayout?.find((el) => el.id === 'price')?.settings || {};
  const customPriceColor = priceSettings.color;

  const sizeClasses = {
    sm: {
      price: 'text-sm',
      badge: 'text-[10px] px-1.5 py-0.5',
      wrap: 'gap-1.5',
    },
    default: {
      price: 'text-[14px]',
      badge: 'text-[10px] px-2 py-0.5',
      wrap: 'gap-2',
    },
    lg: {
      price: 'text-2xl',
      badge: 'text-xs px-2 py-1',
      wrap: 'gap-2.5',
    },
  };

  const s = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={cn('flex flex-wrap items-center', s.wrap, className)}>
      {hasSale ? (
        <>
          <span
            className={cn('font-bold text-black transition-colors', s.price)}
            style={customPriceColor ? { color: customPriceColor } : {}}
          >
            {formatPrice(displayPrice)}
          </span>

          <span className="text-[10px] text-gray-400 line-through">
            {formatPrice(normalPrice)}
          </span>

          <span className={cn('bg-red-500 text-white rounded-[8px] font-bold', s.badge)}>
            SAVE {discountPercentage}%
          </span>
        </>
      ) : (
        <span
          className={cn('font-bold text-black transition-colors', s.price)}
          style={customPriceColor ? { color: customPriceColor } : {}}
        >
          {formatPrice(displayPrice)}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;