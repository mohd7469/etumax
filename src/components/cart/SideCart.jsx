import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  Trash2,
  BadgePercent,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { useCoupon } from '@/context/CouponContext';
import { toast } from '@/components/ui/use-toast';
import ProductImage from '@/components/ui/ProductImage';

const SideCart = ({ navigateTo }) => {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartSubtotal,
    getCartCount,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { formatPrice } = useProducts();
  const { validateAndGetDiscount } = useCoupon();

  const [localCouponCode, setLocalCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = getCartSubtotal();
  const couponDiscount = discount || 0;

  const getItemRegularPrice = (item) => {
    const regular = parseFloat(
      item.regularPrice ||
        item.regular_price ||
        item.originalPrice ||
        item.compareAtPrice ||
        0
    );

    const current = parseFloat(
      item.salePrice ||
        item.sale_price ||
        item.discountedPrice ||
        item.price ||
        0
    );

    return regular > current ? regular : current;
  };

  const getItemCurrentPrice = (item) => {
    return parseFloat(
      item.salePrice ||
        item.sale_price ||
        item.discountedPrice ||
        item.price ||
        0
    );
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
    return getItemCurrentPrice(item) * Number(item.quantity || 1);
  };

  const productDiscount = cartItems.reduce(
    (sum, item) => sum + getItemProductDiscount(item),
    0
  );

  const orderTotalDiscount = productDiscount + couponDiscount;
  const total = Math.max(0, subtotal - couponDiscount);

  const handleNavigate = (path) => {
    closeCart();
    navigateTo(path);
  };

  const handleOpenProduct = (item) => {
    closeCart();

    if (item?.slug) {
      navigateTo(`/product/${item.slug}`);
      return;
    }

    if (item?.id) {
      navigateTo(`/product/${item.id}`);
      return;
    }

    navigateTo('products');
  };

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen]);

  const handleApplyCoupon = () => {
    if (!localCouponCode) return;
    setIsApplyingCoupon(true);

    try {
      const sub = getCartSubtotal();
      const { code, discountValue } = validateAndGetDiscount(
        localCouponCode,
        cartItems,
        sub
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
    clearCart?.();
    toast({
      title: 'Cart cleared successfully',
    });
  };

  const imageUrl = (item) =>
    item.images && item.images.length > 0
      ? item.images[0]
      : 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop';

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-black/45"
            onClick={closeCart}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-[100] flex h-full w-full max-w-md flex-col bg-background text-foreground shadow-2xl"
          >
            <div className="border-b border-border bg-background/95 backdrop-blur">
              <div className="flex items-start justify-between px-4 py-3">
                <div>
                  <h2 className="text-[16px] font-bold leading-none text-foreground">
                    Your Cart ({getCartCount()})
                  </h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Review your selected items
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {cartItems.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleClearCart}
                      className="h-10 rounded-2xl px-4 text-[13px] font-semibold shadow-sm"
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Clear Cart
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeCart}
                    className="h-9 w-9 rounded-full text-foreground hover:bg-accent"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Your cart is empty
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Looks like you haven&apos;t added anything yet.
                </p>
                <Button
                  onClick={() => handleNavigate('products')}
                  className="mt-4 rounded-xl"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-3 py-2.5">
                  <div className="space-y-2.5">
                    {cartItems.map((item) => {
                      const lineProductDiscount = getItemProductDiscount(item);
                      const regularLineTotal =
                        getItemRegularPrice(item) * Number(item.quantity || 1);
                      const lineTotal = getItemLineTotal(item);

                      return (
                        <div
                          key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
                          className="rounded-[18px] border border-border bg-card px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                        >
                          <div className="flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleOpenProduct(item)}
                              className="h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[12px] border border-border bg-background"
                              aria-label={`Open ${item.name}`}
                            >
                              <ProductImage
                                src={imageUrl(item)}
                                alt={item.name}
                                className="h-full w-full object-contain p-1"
                                aspectRatio="square"
                                lazy={true}
                              />
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenProduct(item)}
                                  className="min-w-0 text-left"
                                >
                                  <p className="line-clamp-2 text-[14px] font-semibold leading-[1.2] text-foreground">
                                    {item.name}
                                  </p>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(item.id, item.selectedOptions)
                                  }
                                  className="shrink-0 text-[11px] font-medium text-destructive hover:opacity-90"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="mt-1 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  {lineProductDiscount > 0 ? (
                                    <>
                                      <p className="text-[11px] leading-none text-muted-foreground line-through">
                                        {formatPrice(getItemRegularPrice(item))}
                                      </p>
                                      <p className="mt-1 text-[14px] font-semibold leading-none text-foreground">
                                        {formatPrice(getItemCurrentPrice(item))}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-[14px] font-semibold leading-none text-foreground">
                                      {formatPrice(getItemCurrentPrice(item))}
                                    </p>
                                  )}
                                </div>

                                {lineProductDiscount > 0 && (
                                  <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-[6px] text-[10px] font-medium text-primary">
                                    <BadgePercent className="h-3 w-3" />
                                    <span className="whitespace-nowrap">
                                      Discount: {formatPrice(lineProductDiscount)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-2 flex items-end justify-between gap-2">
                                <div className="inline-flex h-[38px] items-center rounded-[12px] border border-border bg-background px-1 shadow-sm">
                                  <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        item.quantity - 1,
                                        item.selectedOptions
                                      )
                                    }
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>

                                  <span className="flex min-w-[24px] items-center justify-center text-[14px] font-semibold text-foreground">
                                    {item.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        item.quantity + 1,
                                        item.selectedOptions
                                      )
                                    }
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <div className="text-right">
                                  {lineProductDiscount > 0 && (
                                    <p className="text-[11px] leading-none text-muted-foreground line-through">
                                      {formatPrice(regularLineTotal)}
                                    </p>
                                  )}
                                  <p className="mt-1 text-[15px] font-bold leading-none text-foreground">
                                    {formatPrice(lineTotal)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-border bg-background px-3 pb-3 pt-2">
                  <div className="rounded-[22px] border border-border bg-card p-3 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={localCouponCode}
                        onChange={(e) => setLocalCouponCode(e.target.value)}
                        disabled={!!couponCode}
                        className="h-11 rounded-2xl border-border text-[14px]"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={
                          !localCouponCode || !!couponCode || isApplyingCoupon
                        }
                        className="h-11 min-w-[104px] rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold text-foreground">
                          {formatPrice(subtotal)}
                        </span>
                      </div>

                      {productDiscount > 0 && (
                        <div className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-2 text-red-500">
                            <BadgePercent className="h-4 w-4" />
                            <span className="font-medium">Product Discount</span>
                          </div>
                          <span className="font-semibold text-red-500">
                            - {formatPrice(productDiscount)}
                          </span>
                        </div>
                      )}

                      {couponDiscount > 0 && (
                        <div className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-2 text-sm font-bold text-red-700">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">
                              Coupon Discount ({couponCode})
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="font-semibold text-red-700">
                            - {formatPrice(couponDiscount)}
                          </span>
                        </div>
                      )}

                      {orderTotalDiscount > 0 && (
                        <div className="flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2 text-[13px]">
                          <div className="flex items-center gap-2 text font-bold text-green-700">
                            <BadgePercent className="h-4 w-4" />
                            <span className="font-semibold">
                              Order Total Discount
                            </span>
                          </div>
                          <span className="font-bold text-green-700">
                            - {formatPrice(orderTotalDiscount)}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-border pt-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[14px] text-muted-foreground">
                              Total
                            </p>
                            <p className="mt-1 text-[18px] font-bold leading-none text-foreground">
                              {formatPrice(total)}
                            </p>
                          </div>

                          {orderTotalDiscount > 0 && (
                            <p className="pt-5 text-right text-[11px] font-medium font-bold text-green-700">
                              Total savings: {formatPrice(orderTotalDiscount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2.5">
                      <Button
                        variant="outline"
                        className="h-11 rounded-2xl border-primary/20 bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                        onClick={closeCart}
                      >
                        Continue
                      </Button>

                      <Button
                        variant="outline"
                        className="h-11 rounded-2xl border-border bg-background text-foreground hover:bg-accent"
                        onClick={() => handleNavigate('cart')}
                      >
                        View Cart
                      </Button>
                    </div>

                    <Button
                      className="mt-3 h-12 w-full rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:bg-primary/90"
                      onClick={() => handleNavigate('checkout')}
                    >
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideCart;