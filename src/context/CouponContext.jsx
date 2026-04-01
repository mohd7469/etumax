import React, { createContext, useState, useEffect, useContext } from 'react';
import { useProducts } from '@/context/ProductContext';
import { listenToCollection, setDocument, deleteDocument, listenToDocument } from '@/lib/firestoreService';

const CouponContext = createContext();

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) throw new Error('useCoupon must be used within a CouponProvider');
  return context;
};

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);
  const [bundleDiscounts, setBundleDiscounts] = useState([]);
  const [bundleCoupon, setBundleCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getProductById } = useProducts();

  useEffect(() => {
    const unsubCoupons = listenToCollection('coupons', (data) => {
        setCoupons(data);
        setIsLoading(false);
    });
    const unsubBundles = listenToCollection('bundle_discounts', (data) => {
        setBundleDiscounts(data);
    });
    const unsubBundleCoupon = listenToDocument('settings', 'bundleCoupon', (data) => {
        setBundleCoupon(data);
    });

    return () => {
        unsubCoupons();
        unsubBundles();
        unsubBundleCoupon();
    };
  }, []);

  const addCoupon = async (couponData) => {
    const id = `coupon_${Date.now()}`;
    const newCoupon = { ...couponData, id };
    await setDocument('coupons', id, newCoupon);
    return newCoupon;
  };

  const updateCoupon = async (id, couponData) => {
    await setDocument('coupons', id, { ...couponData, id });
  };

  const deleteCoupons = async (ids) => {
    for (const id of ids) await deleteDocument('coupons', id);
  };

  const incrementCouponUsage = async (couponId) => {
    const coupon = coupons.find(c => c.id === couponId);
    if(coupon) {
      await updateCoupon(couponId, { usage_count: (coupon.usage_count || 0) + 1 });
    }
  };

  const getCouponByCode = (code) => coupons.find(c => c.code.toLowerCase() === code.toLowerCase());

  const validateAndGetDiscount = (code, cartItems, subtotal) => {
    const coupon = getCouponByCode(code);
    if (!coupon) throw new Error('Coupon not found.');
    if (!coupon.is_active) throw new Error('This coupon is no longer active.');
    if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) throw new Error('This coupon is not yet valid.');
    if (coupon.valid_to && new Date(coupon.valid_to) < new Date()) throw new Error('This coupon has expired.');
    if (coupon.usage_limit != null && (coupon.usage_count || 0) >= coupon.usage_limit) throw new Error('This coupon has reached its usage limit.');
    if (coupon.min_spend && subtotal < coupon.min_spend) throw new Error(`You must spend at least ${coupon.min_spend} to use this coupon.`);

    const eligibleItems = cartItems.filter(item => {
      if (coupon.product_ids && coupon.product_ids.length > 0) return coupon.product_ids.includes(item.id);
      if (coupon.category_ids && coupon.category_ids.length > 0) {
        const product = getProductById(item.id);
        return product?.categories?.some(catId => coupon.category_ids.includes(catId));
      }
      return true;
    });

    if (eligibleItems.length === 0) throw new Error('This coupon is not valid for the items in your cart.');

    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = coupon.discount_type === 'fixed' ? coupon.discount_value : eligibleSubtotal * (coupon.discount_value / 100);
    discount = Math.min(discount, eligibleSubtotal);

    return { code: coupon.code, discountValue: discount };
  };

  const saveBundleDiscounts = async (updatedDiscounts) => {
    for (const discount of updatedDiscounts) {
      await setDocument('bundle_discounts', discount.id, discount);
    }
  };

  return (
    <CouponContext.Provider value={{ coupons, bundleDiscounts, bundleCoupon, isLoading, addCoupon, updateCoupon, deleteCoupons, validateAndGetDiscount, incrementCouponUsage, getCouponByCode, saveBundleDiscounts }}>
      {children}
    </CouponContext.Provider>
  );
};