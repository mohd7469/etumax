import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useCoupon } from '@/context/CouponContext';
import { toast } from '@/components/ui/use-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('shophub_cart');
      const parsedData = localData ? JSON.parse(localData) : [];
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState(null);
  const [appliedBundleCoupon, setAppliedBundleCoupon] = useState(null);
  const [notificationTrigger, setNotificationTrigger] = useState(0);
  const { bundleDiscounts, validateAndGetDiscount } = useCoupon();

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setDiscount(0);
    setAppliedBundleCoupon(null);
  }, []);

  const recalculateDiscount = useCallback(() => {
    if (!couponCode) {
      setDiscount(0);
      return;
    }

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (subtotal === 0) {
      removeCoupon();
      return;
    }

    // Handle bundle coupon recalculation
    if (appliedBundleCoupon && appliedBundleCoupon.couponCode === couponCode) {
      const bundleRule = bundleDiscounts.find(b => b.coupon === couponCode);
      const itemInCart = cartItems.find(item => item.id === appliedBundleCoupon.productId);

      if (bundleRule && itemInCart && itemInCart.quantity >= bundleRule.quantity) {
        const newDiscountValue = subtotal * (bundleRule.discount / 100);
        setDiscount(newDiscountValue);
      } else {
        removeCoupon();
        toast({
          variant: 'destructive',
          title: "Bundle Discount Removed",
          description: "Item quantity no longer qualifies for the special offer."
        });
      }
      return;
    }

    // Handle manual coupon recalculation
    try {
      const { discountValue } = validateAndGetDiscount(couponCode, cartItems, subtotal);
      setDiscount(discountValue);
    } catch (error) {
      removeCoupon();
      toast({
        variant: 'destructive',
        title: 'Coupon Removed',
        description: `Your coupon was removed: ${error.message}`
      });
    }
  }, [cartItems, couponCode, appliedBundleCoupon, bundleDiscounts, validateAndGetDiscount, removeCoupon]);


  useEffect(() => {
    localStorage.setItem('shophub_cart', JSON.stringify(cartItems));
    recalculateDiscount();
  }, [cartItems, recalculateDiscount]);

  const addToCart = (product, quantity = 1, selectedOptions = {}, bundleCouponCode = null) => {
    setCartItems(prevItems => {
      const optionsIdentifier = JSON.stringify(selectedOptions);
      const existingItem = prevItems.find(item => item.id === product.id && JSON.stringify(item.selectedOptions) === optionsIdentifier);

      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === product.id && JSON.stringify(item.selectedOptions) === optionsIdentifier
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity, selectedOptions, optionsIdentifier }];
      }

      if (bundleCouponCode) {
        const bundleRule = bundleDiscounts.find(b => b.coupon === bundleCouponCode);
        if (bundleRule) {
          const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const discountValue = subtotal * (bundleRule.discount / 100);

          setAppliedBundleCoupon({ productId: product.id, couponCode: bundleCouponCode });
          setDiscount(discountValue);
          setCouponCode(bundleCouponCode);
        }
      }

      return newItems;
    });

    toast({
      title: "Added to cart!",
      description: `${product.name} is now in your cart.`,
    });

    // Only trigger notification popup, do NOT open side cart
    setNotificationTrigger(Date.now());
  };

  const removeFromCart = (productId, selectedOptions) => {
    const optionsIdentifier = JSON.stringify(selectedOptions);
    setCartItems(prevItems => prevItems.filter(item => !(item.id === productId && JSON.stringify(item.selectedOptions) === optionsIdentifier)));
  };

  const updateQuantity = (productId, newQuantity, selectedOptions) => {
    const optionsIdentifier = JSON.stringify(selectedOptions);

    if (newQuantity < 1) {
      removeFromCart(productId, selectedOptions);
      return;
    }

    setCartItems(prevItems => {
      return prevItems.map(item =>
        item.id === productId && JSON.stringify(item.selectedOptions) === optionsIdentifier
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const applyCoupon = (code, discountValue) => {
    setCouponCode(code);
    if (discountValue !== undefined) {
      setDiscount(discountValue);
    }
    setAppliedBundleCoupon(null);
  };

  const clearCart = () => {
    setCartItems([]);
    removeCoupon();
  };

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSubtotal,
    getCartCount,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
    appliedBundleCoupon,
    notificationTrigger,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};