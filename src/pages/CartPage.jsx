
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  X,
  Heart,
  Info,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { useCheckout } from '@/context/CheckoutContext';
import { useCoupon } from '@/context/CouponContext';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import PriceDisplay from '@/components/ui/PriceDisplay';

const CartPage = ({ navigateTo }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartSubtotal,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const { toggleWishlist, wishlist } = useUser();
  const { validateAndGetDiscount } = useCoupon();
  const { formatPrice } = useProducts();
  const { settings: checkoutSettings } = useCheckout();

  const [continueShoppingLink, setContinueShoppingLink] = useState('/');
  const [localCouponCode, setLocalCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('shophub_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setContinueShoppingLink(settings.continueShoppingLink || '/');
    }
  }, []);

  useEffect(() => {
    const footerSelectors = ['footer', '.site-footer', '#footer'];
    const foundFooters = [];

    footerSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!foundFooters.includes(el)) {
          foundFooters.push(el);
        }
      });
    });

    const originalStyles = foundFooters.map((el) => ({
      el,
      display: el.style.display,
    }));

    foundFooters.forEach((el) => {
      el.style.display = 'none';
    });

    return () => {
      originalStyles.forEach(({ el, display }) => {
        el.style.display = display;
      });
    };
  }, []);

  const handleContinueShopping = () => {
    try {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
    } catch (e) { }
    navigateTo(continueShoppingLink);
  };

  const handleOpenProduct = (item) => {
    if (!item) return;

    if (item.slug) {
      navigateTo(`/product/${item.slug}`);
      return;
    }

    if (item.id) {
      navigateTo(`/product/${item.id}`);
      return;
    }

    navigateTo('products');
  };

  const handleApplyCoupon = async () => {
    if (!localCouponCode) return;
    setIsApplyingCoupon(true);

    try {
      const subtotal = getCartSubtotal();
      const { code, discountValue } = validateAndGetDiscount(
        localCouponCode,
        cartItems,
        subtotal
      );
      applyCoupon(code, discountValue);
      toast({
        title: 'Coupon Applied!',
        description: 'Your discount has been added.',
      });
      setLocalCouponCode('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Invalid Coupon',
        description: error.message,
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast({ title: 'Coupon Removed' });
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast({ title: 'Cart cleared' });
    }
  };

  // ---------- PRODUCT DISCOUNT HELPERS ----------
  const getItemRegularPrice = (item) => {
    const regular = parseFloat(
      item.regularPrice ||
      item.regular_price ||
      item.originalPrice ||
      item.compareAtPrice ||
      0
    );

    const current = parseFloat(item.salePrice || item.sale_price || item.price || 0);

    if (regular > current) return regular;
    return current;
  };

  const getItemCurrentPrice = (item) => {
    return parseFloat(item.salePrice || item.sale_price || item.price || 0);
  };

  const getItemProductDiscount = (item) => {
    const regular = getItemRegularPrice(item);
    const current = getItemCurrentPrice(item);
    const qty = Number(item.quantity || 1);

    if (regular > current) {
      return (regular - current) * qty;
    }

    return 0;
  };

  const getItemLineTotal = (item) => {
    const current = getItemCurrentPrice(item);
    const qty = Number(item.quantity || 1);
    return current * qty;
  };

  const productDiscount = cartItems.reduce(
    (sum, item) => sum + getItemProductDiscount(item),
    0
  );

  const subtotal = getCartSubtotal();
  const freeShippingThreshold = checkoutSettings?.freeShippingThreshold ?? Infinity;
  const deliveryCharge = checkoutSettings?.deliveryCharge || 0;
  
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : deliveryCharge;

  const couponDiscount = discount || 0;
  const totalSavings = productDiscount + couponDiscount;
  const totalAmount = Math.max(0, subtotal - couponDiscount + shippingCost);

  const remainingForFreeDelivery = freeShippingThreshold === Infinity ? 0 : Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = freeShippingThreshold === Infinity ? 100 : Math.min(100, (subtotal / freeShippingThreshold) * 100);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    const items = cartItems.map((item) => ({
      item_id: String(item.id || item.sku || item.slug || 'unknown'),
      item_name: item.name || 'Unnamed Product',
      price: Number(
        item.salePrice || item.sale_price || item.price || 0
      ),
      quantity: Number(item.quantity || 1),
      item_category: Array.isArray(item.categories)
        ? item.categories[0] || ''
        : item.categories || '',
      item_brand: item.brand || item.manufacturer || item.storeBrand || '',
    }));

    const viewCartKey = `view_cart_${cartItems
      .map((item) => `${item.id || item.sku || item.slug}:${item.quantity}`)
      .join('|')}_${totalAmount}`;

    if (sessionStorage.getItem(viewCartKey)) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });

    window.dataLayer.push({
      event: 'view_cart',
      ecommerce: {
        currency: 'AED',
        value: Number(totalAmount || 0),
        items,
      },
    });

    console.log('GA4 view_cart fired', {
      value: Number(totalAmount || 0),
      items,
    });

    sessionStorage.setItem(viewCartKey, 'true');
  }, [cartItems, totalAmount]);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cart is empty',
        description: 'Please add items to your cart before proceeding to checkout.',
      });
      return;
    }

    const items = cartItems.map((item) => ({
      item_id: String(item.id || item.sku || item.slug || 'unknown'),
      item_name: item.name || 'Unnamed Product',
      price: Number(
        item.salePrice || item.sale_price || item.price || 0
      ),
      quantity: Number(item.quantity || 1),
      item_category: Array.isArray(item.categories)
        ? item.categories[0] || ''
        : item.categories || '',
      item_brand: item.brand || item.manufacturer || item.storeBrand || '',
    }));

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });

    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'AED',
        value: Number(totalAmount || 0),
        coupon: couponCode || '',
        items,
      },
    });

    console.log('GA4 begin_checkout fired from cart', {
      value: Number(totalAmount || 0),
      items,
    });

    navigateTo('checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart!</p>

          <Button
            onClick={handleContinueShopping}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-8 max-w-6xl pb-36 sm:pb-40">
      <div className="px-4 pt-6 sm:pt-0">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Your cart</h1>

          <button
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-700 font-semibold transition-colors hover:underline text-sm"
          >
            Clear cart
          </button>
        </div>

        {totalSavings > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-full mb-4 text-sm font-semibold"
          >
            🎉 You save {formatPrice(totalSavings)} on this order!
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-10">
        <div className="lg:col-span-2">
          <div className="divide-y">
            {cartItems.map((item, idx) => {
              const isWishlisted = wishlist.some((wItem) => wItem.id === item.id);

              const optionLine =
                item.selectedOptions && Object.keys(item.selectedOptions).length > 0
                  ? Object.keys(item.selectedOptions)
                    .map((k) => item.selectedOptions[k])
                    .filter(Boolean)
                    .join(' · ')
                  : '';

              const regularLineTotal = getItemRegularPrice(item) * Number(item.quantity || 1);
              const lineTotal = getItemLineTotal(item);
              const lineProductDiscount = getItemProductDiscount(item);

              return (
                <motion.div
                  key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="px-4 py-4 bg-white"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenProduct(item)}
                      className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border flex-shrink-0 block cursor-pointer hover:opacity-90 transition-opacity"
                      aria-label={`Open ${item.name}`}
                    >
                      <img
                        alt={item.name}
                        className="w-full h-full object-cover"
                        src={
                          item.images && item.images.length > 0
                            ? item.images[0]
                            : 'https://images.unsplash.com/photo-1572635196237-14b3f281503f'
                        }
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleOpenProduct(item)}
                        className="text-left block w-full"
                      >
                        <h3 className="text-[15px] sm:text-lg font-bold text-gray-900 leading-snug truncate hover:text-primary transition-colors cursor-pointer">
                          {item.name}
                        </h3>
                      </button>

                      {(optionLine || item.variant || item.size) && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 mb-2">
                          {optionLine || item.variant || item.size}
                        </p>
                      )}

                      <div className="mt-1 mb-2">
                        <PriceDisplay product={item} size="sm" />
                      </div>

                      {lineProductDiscount > 0 && (
                        <div className="shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-[1px] text-[8px] font-medium text-primary">
                          <BadgePercent className="w-3.5 h-3.5" />
                          Product discount: {formatPrice(lineProductDiscount)}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            toggleWishlist(item);
                            toast({
                              title: isWishlisted
                                ? 'Removed from favourites'
                                : 'Added to favourites',
                            });
                          }}
                          className="text-xs sm:text-sm text-gray-400 hover:text-pink-600 underline underline-offset-4 font-medium inline-flex items-center gap-1.5"
                        >
                          <Heart
                            className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500 text-pink-500' : ''
                              }`}
                          />
                          <span className="hidden sm:inline">Add to favourites</span>
                        </button>

                        <button
                          onClick={() => removeFromCart(item.id, item.selectedOptions)}
                          className="text-xs sm:text-sm text-gray-400 hover:text-red-600 underline underline-offset-4 font-medium inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center border border-red-200 rounded-xl overflow-hidden bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1, item.selectedOptions)
                          }
                          className="px-2.5 py-2 text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="px-3 py-2 font-bold text-red-500 min-w-[2.25rem] text-center border-x border-red-100">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1, item.selectedOptions)
                          }
                          className="px-2.5 py-2 text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right leading-tight mt-auto">
                        {lineProductDiscount > 0 && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(regularLineTotal)}
                          </p>
                        )}
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          {formatPrice(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-t lg:border lg:rounded-xl p-4 sm:p-6 lg:sticky lg:top-24 shadow-sm"
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4 border-b pb-3">
              Order Summary
            </h2>

            <div className="space-y-4 mb-5">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Coupon code"
                  value={localCouponCode}
                  onChange={(e) => setLocalCouponCode(e.target.value)}
                  disabled={!!couponCode}
                  className="bg-gray-50"
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={!localCouponCode || !!couponCode || isApplyingCoupon}
                  variant="secondary"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </Button>
              </div>

              <div className="space-y-3 text-sm pt-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                {productDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-700">
                    <span className="flex items-center gap-1.5">
                      <BadgePercent className="h-4 w-4" />
                      Product Discount
                    </span>
                    <span>{formatPrice(productDiscount)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold text-red-700 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Tag className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        Coupon ({couponCode})
                      </span>

                      <button
                        className="text-red-400 hover:text-red-600 ml-1 p-0.5 rounded-full hover:bg-red-50 transition-colors shrink-0"
                        onClick={handleRemoveCoupon}
                        title="Remove coupon"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="shrink-0 whitespace-nowrap">
                      - {formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}

                <div className="pt-3 pb-1 border-t">
                  {freeShippingThreshold !== Infinity && (
                    <>
                      {remainingForFreeDelivery > 0 ? (
                        <div className="mb-2 text-sm text-gray-700">
                          Add{' '}
                          <span className="font-bold text-primary">
                            {formatPrice(remainingForFreeDelivery)}
                          </span>{' '}
                          more to get{' '}
                          <span className="font-bold">free delivery</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="ml-1 text-primary hover:underline font-medium inline-flex items-center">
                                  learn more <Info className="w-3 h-3 ml-0.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Free delivery applies to standard items. Mega deals and
                                  oversized items are excluded.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        <div className="mb-2 text-sm text-green-600 font-bold flex items-center gap-1.5">
                          🎉 You qualify for free delivery!
                        </div>
                      )}

                      <div className="relative pt-1 mb-3">
                        <Progress value={progressPercentage} className="h-2.5 bg-gray-100" />
                      </div>
                    </>
                  )}

                  <div className="flex justify-between mt-3">
                    <span className="text-gray-600">Shipping Cost</span>
                    <span className="font-semibold text-gray-900">
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <p className="text-right text-xs text-sm font-bold text-green-700">
                    Total savings: {formatPrice(totalSavings)}
                  </p>
                )}
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-2">
              <Button
                onClick={handleProceedToCheckout}
                size="lg"
                className="w-full text-base font-semibold h-12 sm:h-14"
              >
                Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                onClick={handleContinueShopping}
                variant="outline"
                className="w-full h-12 text-gray-700"
              >
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {formatPrice(totalAmount)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">{cartItems.length} item(s)</p>
              {totalSavings > 0 && (
                <p className="text-xs font-medium text-green-600">
                  Saved {formatPrice(totalSavings)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleContinueShopping}
              variant="outline"
              className="h-12 sm:h-14 text-sm sm:text-base font-semibold"
            >
              Continue Shopping
            </Button>

            <Button
              onClick={handleProceedToCheckout}
              className="h-12 sm:h-14 text-sm sm:text-base font-semibold"
            >
              Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
