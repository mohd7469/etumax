import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  CreditCard,
  Lock,
  ShoppingBag,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Tag,
  X,
  Plus,
  Minus,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import PriceDisplay from '@/components/ui/PriceDisplay';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useProducts } from '@/context/ProductContext';
import { useCheckout } from '@/context/CheckoutContext';
import { useCoupon } from '@/context/CouponContext';


/* ---------------------------------------------
GOOGLE MAPS SCRIPT LOADER
---------------------------------------------- */
const useGoogleMapsScript = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (!apiKey) {
      console.log('Google Maps: No API key provided');
      setIsLoaded(false);
      return;
    }


    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('Google Maps: Window or document not available');
      return;
    }


    if (window.google && window.google.maps) {
      console.log('Google Maps: Already loaded');
      setIsLoaded(true);
      return;
    }


    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);


    if (existingScript) {
      console.log('Google Maps: Script tag exists, waiting for load...');
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          console.log('Google Maps: Loaded successfully');
          setIsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 100);


      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!window.google || !window.google.maps) {
          console.error('Google Maps: Timeout waiting for script to load');
          setError(new Error('Timeout loading Google Maps'));
        }
      }, 10000);
      return;
    }


    try {
      console.log('Google Maps: Creating script tag with API key:', apiKey.substring(0, 10) + '...');


      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;


      script.onload = () => {
        console.log('Google Maps: Script loaded successfully');
        setIsLoaded(true);
        setError(null);
      };


      script.onerror = (err) => {
        console.error('Google Maps Script Error:', err);
        setError(new Error('Failed to load Google Maps script. Please check your API key.'));
      };


      document.head.appendChild(script);
    } catch (err) {
      console.error('Google Maps: Error creating script tag:', err);
      setError(err);
    }
  }, [apiKey]);


  return { isLoaded, error };
};


/* ---------------------------------------------
LOCATION PICKER
---------------------------------------------- */
const LocationPicker = memo(({ onLocationSelect, isScriptLoaded, scriptError }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [localError, setLocalError] = useState(null);


  const defaultCenter = { lat: 25.2048, lng: 55.2708 };


  useEffect(() => {
    if (!isScriptLoaded || scriptError) {
      console.log('LocationPicker: Script not loaded or has error');
      return;
    }


    if (typeof window === 'undefined') {
      console.warn('LocationPicker: Window not available');
      return;
    }


    if (mapRef.current == null) {
      console.warn('LocationPicker: Map container ref is null');
      return;
    }


    if (map) {
      console.log('LocationPicker: Map already initialized');
      return;
    }


    try {
      const g = window.google;
      if (!g || !g.maps) {
        console.error('LocationPicker: Google Maps API not available');
        return;
      }


      console.log('LocationPicker: Initializing map...');


      const newMap = new g.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
      });


      const newMarker = new g.maps.Marker({
        position: defaultCenter,
        map: newMap,
        draggable: true,
        title: 'Drag me to your location!',
      });


      newMarker.addListener('dragend', () => {
        try {
          const position = newMarker.getPosition();
          if (position) {
            console.log('LocationPicker: Marker dragged to:', position.lat(), position.lng());
            onLocationSelect({ lat: position.lat(), lng: position.lng() });
          }
        } catch (err) {
          console.error('LocationPicker: Error handling marker drag:', err);
        }
      });


      setMap(newMap);
      setMarker(newMarker);
      setLocalError(null);
      console.log('LocationPicker: Map initialized successfully');
    } catch (err) {
      console.error('LocationPicker: Error initializing map:', err);
      setLocalError('Failed to initialize map display.');
    }
  }, [isScriptLoaded, scriptError, map, onLocationSelect]);


  const detectLocation = async () => {
    try {
      if (!isScriptLoaded || scriptError) {
        toast({
          variant: 'destructive',
          title: 'Map not available',
          description: 'Google Maps is not loaded. Please check your API key configuration.',
        });
        return;
      }


      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        toast({
          variant: 'destructive',
          title: 'Geolocation not supported',
          description: 'Your browser does not support geolocation.',
        });
        return;
      }


      setIsDetecting(true);
      setLocalError(null);


      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const newPos = { lat: latitude, lng: longitude };


            console.log('LocationPicker: Location detected:', newPos);


            if (map && marker) {
              map.setCenter(newPos);
              map.setZoom(15);
              marker.setPosition(newPos);
              onLocationSelect(newPos);
            }


            setIsDetecting(false);
            toast({
              title: 'Location Detected!',
              description: 'Your location has been updated on the map.',
            });
          } catch (err) {
            console.error('LocationPicker: Error updating map with location:', err);
            setIsDetecting(false);
            setLocalError('Error updating map with your location.');
          }
        },
        (err) => {
          console.error('LocationPicker: Geolocation error:', err);
          setIsDetecting(false);
          setLocalError(
            'Could not detect your location. Please ensure location services are enabled.'
          );
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } catch (err) {
      console.error('LocationPicker: Unexpected error in detectLocation:', err);
      setIsDetecting(false);
      setLocalError('An unexpected error occurred while detecting location.');
    }
  };


  if (scriptError || localError) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        <div className="mb-2 flex items-center">
          <AlertTriangle className="mr-3 h-5 w-5" />
          <span className="font-semibold">Map Error</span>
        </div>
        <span className="text-center text-sm">
          {localError || 'Google Maps could not be loaded. Please enter your address manually.'}
        </span>
      </div>
    );
  }


  if (!isScriptLoaded) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-[200px] w-full rounded-md" />
        <p className="text-center text-xs text-muted-foreground">Loading map...</p>
      </div>
    );
  }


  return (
    <div className="mt-4 space-y-2">
      <div
        ref={mapRef}
        id="google-maps-container"
        style={{
          height: '200px',
          width: '100%',
          borderRadius: '0.75rem',
          border: '1px solid hsl(var(--border))',
        }}
      />
      <p className="text-center text-xs text-muted-foreground">
        Drag the marker to your delivery location or click the button below to auto-detect.
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-full border-border bg-background text-foreground hover:bg-accent"
        onClick={detectLocation}
        disabled={isDetecting}
      >
        {isDetecting ? (
          <span className="flex items-center" key="detecting-state">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            <span>Detecting...</span>
          </span>
        ) : (
          <span className="flex items-center" key="idle-state">
            <MapPin className="mr-2 h-4 w-4" />
            <span>Detect Auto Address/Landmark</span>
          </span>
        )}
      </Button>
    </div>
  );
});


LocationPicker.displayName = 'LocationPicker';


/* ---------------------------------------------
CHECKOUT FIELD
---------------------------------------------- */
const CheckoutField = ({ field, value, onChange }) => {
  if (!field.enabled) return null;


  const commonProps = {
    id: field.id,
    name: field.name,
    placeholder: field.placeholder,
    required: field.required,
  };


  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          value={value || ''}
          onChange={onChange}
          className="text-foreground"
        />
      );


case 'dropdown': {
  const safeOptions = field.options || [];
  const isPlaceholderSelected = !value;

  return (
    <div className="relative">
      <select
        {...commonProps}
        value={value || ''}
        onChange={onChange}
        className={`flex h-11 w-full appearance-none rounded-xl border bg-card px-4 pr-10 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          isPlaceholderSelected
            ? 'text-muted-foreground border-border'
            : 'text-foreground border-border'
        }`}
      >
        <option value="" disabled>
          {field.placeholder || `Select ${field.label}`}
        </option>

        {safeOptions.map((opt) => (
          <option key={opt.value || 'empty'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}


    case 'radio':
      return (
        <RadioGroup
          name={field.name}
          onValueChange={(val) => onChange({ target: { name: field.name, value: val } })}
          value={value}
          className="flex flex-col space-y-2"
        >
          {(field.options || []).map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} />
              <Label htmlFor={`${field.id}-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );


    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.id}
            name={field.name}
            checked={!!value}
            onCheckedChange={(checked) =>
              onChange({
                target: { name: field.name, value: !!checked },
              })
            }
          />
          <Label htmlFor={field.id}>{field.label}</Label>
        </div>
      );


    default:
      return (
        <Input
          type={field.type}
          {...commonProps}
          value={value || ''}
          onChange={onChange}
          className="text-foreground"
        />
      );
  }
};


/* ---------------------------------------------
MAIN CHECKOUT PAGE
---------------------------------------------- */
const CheckoutPage = ({ navigateTo }) => {
  const {
    cartItems,
    getCartSubtotal,
    clearCart,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
  } = useCart();


  const { user, registerFromOrder } = useUser();
  const { formatPrice } = useProducts();
  const {
    settings: checkoutSettings,
    validateCheckoutFields,
    processOrder,
  } = useCheckout();
  const {
    validateAndGetDiscount,
    incrementCouponUsage,
    getCouponByCode,
    bundleCoupon,
  } = useCoupon();


  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [localCouponCode, setLocalCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [formData, setFormData] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');


  const isBundleAutoApplied =
    couponCode && bundleCoupon && couponCode === bundleCoupon.code;


  const { isLoaded: isMapScriptLoaded, error: mapScriptError } = useGoogleMapsScript(
    checkoutSettings?.enableGoogleMaps ? checkoutSettings.googleMapsApiKey : null
  );


  useEffect(() => {
    if (checkoutSettings?.enableGoogleMaps) {
      if (checkoutSettings.googleMapsApiKey) {
        console.log('Checkout: Google Maps enabled with API key');
      } else {
        console.warn('Checkout: Google Maps enabled but no API key configured');
      }
    } else {
      console.log('Checkout: Google Maps is disabled');
    }
  }, [checkoutSettings]);


  useEffect(() => {
    document.body.classList.add('checkout-page-active');
    return () => {
      document.body.classList.remove('checkout-page-active');
    };
  }, []);


  const generateInitialFormState = useCallback((fields, currentUser) => {
    if (!fields || !Array.isArray(fields)) return {};


    return fields.reduce((acc, field) => {
      if (field.enabled) {
        if (field.name === 'email' && currentUser?.email) {
          acc[field.name] = currentUser.email;
        } else if (
          (field.name === 'first_name' || field.name === 'last_name') &&
          currentUser?.name
        ) {
          const parts = currentUser.name.split(' ');
          acc.first_name = parts[0] || '';
          acc.last_name = parts.slice(1).join(' ') || '';
        } else {
          acc[field.name] = field.defaultValue || '';
        }
      }
      return acc;
    }, {});
  }, []);


  useEffect(() => {
    if (checkoutSettings) {
      setFormData(generateInitialFormState(checkoutSettings.checkoutFields, user));
      setPaymentMethod(checkoutSettings.enableCreditCard ? 'card' : 'cod');
      setIsLoading(false);
    }
  }, [checkoutSettings, user, generateInitialFormState]);


  useEffect(() => {
    if (!isLoading && cartItems.length === 0 && !isPlacingOrder) {
      if (navigateTo) navigateTo('cart');
    }
  }, [cartItems.length, isLoading, isPlacingOrder, navigateTo]);


const handleInputChange = (e) => {
  try {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  } catch (error) {
    console.error('Error updating form data:', error);
  }
};


  const handleLocationSelect = useCallback(
    (coords) => {
      try {
        if (!isMapScriptLoaded || !window.google) {
          console.warn('handleLocationSelect: Maps not loaded');
          return;
        }


        console.log('handleLocationSelect: Geocoding coordinates:', coords);


        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            console.log('handleLocationSelect: Address found:', address);


            setFormData((prev) => ({
              ...prev,
              address_1: address,
              mapCoordinates: coords,
            }));


            toast({
              title: 'Address Updated',
              description: 'Your address field has been filled based on the map location.',
            });
          } else {
            console.error('handleLocationSelect: Geocoding failed:', status);
            toast({
              variant: 'destructive',
              title: 'Address Error',
              description: 'Could not get text address from map location.',
            });
          }
        });
      } catch (err) {
        console.error('Error in geocoding handler:', err);
      }
    },
    [isMapScriptLoaded]
  );


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


    if (regular > current) return regular;
    return current;
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


  const subtotal = getCartSubtotal();


  const productDiscount = cartItems.reduce(
    (sum, item) => sum + getItemProductDiscount(item),
    0
  );


  const couponDiscount = discount || 0;
  const orderTotalDiscount = productDiscount + couponDiscount;

  const freeShippingThreshold = checkoutSettings?.freeShippingThreshold ?? Infinity;
  const deliveryCharge = checkoutSettings?.deliveryCharge || 0;

  const shippingCost = subtotal >= freeShippingThreshold ? 0 : deliveryCharge;

  const totalAmount = Math.max(0, subtotal - couponDiscount + shippingCost);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);


  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;


    const items = cartItems.map((item) => ({
      item_id: String(item.id || item.sku || item.slug || 'unknown'),
      item_name: item.name || 'Unnamed Product',
      price: Number(
        item.salePrice || item.sale_price || item.discountedPrice || item.price || 0
      ),
      quantity: Number(item.quantity || 1),
      item_category: Array.isArray(item.categories)
        ? item.categories[0] || ''
        : item.categories || '',
      item_brand: item.brand || item.manufacturer || item.storeBrand || '',
    }));


    const beginCheckoutKey = `checkout_page_view_${cartItems
      .map((item) => `${item.id || item.sku || item.slug}:${item.quantity}`)
      .join('|')}_${totalAmount}`;


    if (sessionStorage.getItem(beginCheckoutKey)) return;


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


    console.log('GA4 begin_checkout (checkout page) fired', {
      value: Number(totalAmount || 0),
      items,
    });


    sessionStorage.setItem(beginCheckoutKey, 'true');
  }, [cartItems, totalAmount, couponCode]);


  const handleApplyCoupon = async () => {
    if (!localCouponCode) return;
    setIsApplyingCoupon(true);


    try {
      const subtotalVal = getCartSubtotal();
      const { code, discountValue } = validateAndGetDiscount(
        localCouponCode,
        cartItems,
        subtotalVal
      );


      applyCoupon(code, discountValue);
      toast({ title: 'Coupon Applied!' });
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
    if (isBundleAutoApplied) return;
    removeCoupon();
    toast({ title: 'Coupon Removed' });
  };


  const handleOpenProduct = (item) => {
    if (!navigateTo || !item) return;


    if (item.slug) {
      navigateTo(`/product/${item.slug}`);
      return;
    }


    if (item.id) {
      navigateTo(`/product/${item.id}`);
      return;
    }


    navigateTo('/products');
  };


  const handlePaymentMethodChange = (val) => {
    setPaymentMethod(val);


    if (!cartItems || cartItems.length === 0) return;


    const items = cartItems.map((item) => ({
      item_id: String(item.id || item.sku || item.slug || 'unknown'),
      item_name: item.name || 'Unnamed Product',
      price: Number(
        item.salePrice || item.sale_price || item.discountedPrice || item.price || 0
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
      event: 'add_payment_info',
      ecommerce: {
        currency: 'AED',
        value: Number(totalAmount || 0),
        payment_type: val,
        coupon: couponCode || '',
        items,
      },
    });


    console.log('GA4 add_payment_info fired:', val);
  };


  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();


    if (cartItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cart is empty',
        description: 'Please add items to your cart before proceeding.',
      });
      return;
    }


    try {
      const validationErrors = validateCheckoutFields(formData);
      if (Object.keys(validationErrors).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Missing Required Fields',
          description: Object.values(validationErrors).join(', '),
        });
        return;
      }


      setIsPlacingOrder(true);


      let customerId = user?.id;


      if (!user) {
        const customer = await registerFromOrder(formData);
        customerId = customer.id;
      }


      const formattedItems = cartItems.map((item) => ({
        id: item.id,
        wc_id: item.wc_id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        images: item.images || [],
        selectedOptions: item.selectedOptions || {},
      }));


      const orderData = {
        id: `ord_${Date.now()}`,
        userId: customerId,
        items: formattedItems,
        total: totalAmount,
        subtotal,
        discount: couponDiscount,
        productDiscount,
        orderTotalDiscount,
        couponCode,
        shippingCost,
        shippingAddress: formData,
        paymentMethod,
        status: 'pending',
        date: new Date().toISOString(),
      };


      const finalOrder = await processOrder(orderData);


      if (couponCode) {
        const couponToIncrement = getCouponByCode(couponCode);
        if (couponToIncrement) incrementCouponUsage(couponToIncrement.id);
      }


      const purchaseItems = cartItems.map((item) => ({
        item_id: String(item.id || item.sku || item.slug || 'unknown'),
        item_name: item.name || 'Unnamed Product',
        price: Number(
          item.salePrice || item.sale_price || item.discountedPrice || item.price || 0
        ),
        quantity: Number(item.quantity || 1),
        item_category: Array.isArray(item.categories)
          ? item.categories[0] || ''
          : item.categories || '',
        item_brand: item.brand || item.manufacturer || item.storeBrand || '',
      }));


      const purchaseKey = `purchase_sent_${finalOrder.id}`;
      if (!sessionStorage.getItem(purchaseKey)) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });


        window.dataLayer.push({
          event: 'purchase',
          ecommerce: {
            transaction_id: String(finalOrder.id),
            value: Number(totalAmount || 0),
            currency: 'AED',
            coupon: couponCode || '',
            shipping: Number(shippingCost || 0),
            payment_type: paymentMethod || '',
            items: purchaseItems,
          },
        });


        console.log('GA4 purchase fired:', finalOrder.id);
        sessionStorage.setItem(purchaseKey, 'true');
      }


      clearCart();


      toast({
        title: 'Order Placed Successfully! 🎉',
        description: "Thank you for your purchase. You'll receive a confirmation email shortly.",
      });


      if (navigateTo) navigateTo('order-confirmation', { orderId: finalOrder.id });
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: error.message || 'There was an issue placing your order. Please try again.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto bg-background px-4 py-8 text-foreground md:py-16">
        <Skeleton className="mb-12 h-12 w-1/3" />
        <div className="grid grid-cols-1 gap-8 xl:gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6 md:p-8">
                <Skeleton className="mb-6 h-8 w-1/2" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>


          <Card className="border-border bg-card">
            <CardContent className="p-6 md:p-8">
              <Skeleton className="mb-6 h-8 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }


  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      body.checkout-page-active footer,
      body.checkout-page-active .footer,
      body.checkout-page-active #footer,
      body.checkout-page-active .site-footer,
      body.checkout-page-active .app-footer,
      body.checkout-page-active [class*="footer"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `,
        }}
      />


      <div className="container mx-auto bg-background px-4 py-8 pb-36 text-foreground md:py-16 md:pb-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center text-3xl font-bold text-foreground md:mb-12 md:text-5xl lg:text-left"
        >
          Checkout
        </motion.h1>


        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 xl:gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-card-foreground">
                  <Truck className="h-6 w-6 text-primary" />
                  Shipping Information
                </h2>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {checkoutSettings?.checkoutFields
                    ?.filter((f) => f.enabled && f.name !== 'order_notes')
                    ?.map((field) => (
                      <div
                        key={field.id}
                        className={field.class?.includes('wide') ? 'md:col-span-2' : ''}
                      >
                        <Label className="text-sm font-medium text-card-foreground">
                          {field.type !== 'checkbox' && field.label}
                        </Label>


                        <div className="mt-1">
                          <CheckoutField
                            field={field}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                          />
                        </div>


                        {checkoutSettings.enableGoogleMaps && field.id === 'address_1' && (
                          <div className="mt-4 md:col-span-2">
                            <LocationPicker
                              onLocationSelect={handleLocationSelect}
                              isScriptLoaded={isMapScriptLoaded}
                              scriptError={mapScriptError}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>


                {checkoutSettings?.checkoutFields?.find(
                  (f) => f.name === 'order_notes' && f.enabled
                ) && (
                    <div className="mt-6">
                      <Label className="text-sm font-medium text-card-foreground">
                        {
                          checkoutSettings.checkoutFields.find((f) => f.name === 'order_notes')
                            ?.label
                        }
                      </Label>


                      <div className="mt-1">
                        <CheckoutField
                          field={checkoutSettings.checkoutFields.find(
                            (f) => f.name === 'order_notes'
                          )}
                          value={formData.order_notes}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>


          <div className="mb-6 space-y-6 md:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <h2 className="mb-6 text-xl font-bold text-card-foreground">Order Summary</h2>


              <div
                className="mb-4 flex snap-x gap-4 overflow-x-auto pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                      div::-webkit-scrollbar {
                        display: none;
                      }
                    `,
                  }}
                />


                {cartItems.map((item) => {
                  const regularLineTotal =
                    getItemRegularPrice(item) * Number(item.quantity || 1);
                  const currentLineTotal =
                    getItemCurrentPrice(item) * Number(item.quantity || 1);
                  const lineDiscount = getItemProductDiscount(item);


                  return (
                    <div
                      key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
                      className="relative flex w-[150px] min-w-[150px] snap-start flex-col rounded-xl border border-border bg-background p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.selectedOptions)}
                        className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-opacity hover:opacity-90"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>


                      <span className="absolute right-2 top-2 z-10 rounded bg-foreground px-2 py-1 text-[10px] font-bold text-background">
                        x{item.quantity}
                      </span>


                      <button
                        type="button"
                        onClick={() => handleOpenProduct(item)}
                        className="relative mb-3 aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <img
                          src={item.images?.[0]}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
                        />
                      </button>


                      <div className="flex flex-grow flex-col justify-between">
                        <button
                          type="button"
                          onClick={() => handleOpenProduct(item)}
                          className="text-left"
                        >
                          <p className="mb-2 line-clamp-2 text-sm font-medium leading-tight text-foreground transition-colors hover:text-primary">
                            {item.name}
                          </p>
                        </button>


                        <div className="mb-2">
                          <PriceDisplay product={item} size="sm" />
                        </div>


                        {lineDiscount > 0 && (
                          <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                            <BadgePercent className="h-3 w-3" />
                            {formatPrice(lineDiscount)} off
                          </div>
                        )}


                        <div className="mb-3 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1, item.selectedOptions)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>


                          <span className="min-w-[24px] text-center text-lg font-semibold text-foreground">
                            {item.quantity}
                          </span>


                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1, item.selectedOptions)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>


                        <div className="text-center md:text-left">
                          {lineDiscount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(regularLineTotal)}
                            </p>
                          )}
                          <p className="font-bold text-foreground">
                            {formatPrice(currentLineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>


              <div className="space-y-2 border-t border-border py-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={localCouponCode}
                    onChange={(e) => setLocalCouponCode(e.target.value)}
                    disabled={!!couponCode || isBundleAutoApplied}
                    className="border-border bg-background text-foreground"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={
                      !localCouponCode ||
                      !!couponCode ||
                      isApplyingCoupon ||
                      isBundleAutoApplied
                    }
                    type="button"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </Button>
                </div>


                <div className="flex justify-between pt-2 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-card-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>


                {productDiscount > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span className="flex items-center gap-1.5">
                      <BadgePercent className="h-4 w-4" />
                      Product Discount
                    </span>
                    <span>- {formatPrice(productDiscount)}</span>
                  </div>
                )}


                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-red-700">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Tag className="h-4 w-4 shrink-0" />
                      <span className="truncate">Coupon Discount: {couponCode}</span>
                      {!isBundleAutoApplied && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-5 w-5 text-destructive shrink-0"
                          onClick={handleRemoveCoupon}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </span>
                    <span className="shrink-0">- {formatPrice(couponDiscount)}</span>
                  </div>
                )}


                {orderTotalDiscount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-700">
                    <span className="flex items-center gap-1.5">
                      <BadgePercent className="h-4 w-4" />
                      Order Total Discount
                    </span>
                    <span>- {formatPrice(orderTotalDiscount)}</span>
                  </div>
                )}


                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Cost</span>
                  <span className="font-semibold text-card-foreground">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
              </div>


              <div className="flex items-end justify-between border-t border-border pt-4 text-lg font-bold">
                <div className="flex flex-col">
                  <span className="text-base text-card-foreground">Total</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {totalItemsCount} items
                  </span>
                  {orderTotalDiscount > 0 && (
                    <span className="text-right text-xs font-bold text-green-700">
                      Total savings: {formatPrice(orderTotalDiscount)}
                    </span>
                  )}
                </div>
                <span className="text-2xl text-card-foreground">{formatPrice(totalAmount)}</span>
              </div>
            </motion.div>


            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-card-foreground">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Payment Method
                </h2>


                <RadioGroup
                  value={paymentMethod}
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-4"
                >
                  {checkoutSettings?.enableCreditCard && (
                    <Label
                      htmlFor="card"
                      className="flex cursor-pointer items-center rounded-lg border border-border p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                    >
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="mx-3 h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-card-foreground">
                        Credit/Debit Card
                      </span>
                    </Label>
                  )}


                  {checkoutSettings?.enableCashOnDelivery && (
                    <Label
                      htmlFor="cod"
                      className="flex cursor-pointer items-center rounded-lg border border-border p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <ShoppingBag className="mx-3 h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-card-foreground">
                        Cash on Delivery
                      </span>
                    </Label>
                  )}
                </RadioGroup>


                <div className="mt-6 flex items-center gap-3 rounded-lg border border-primary/15 bg-primary/10 p-4">
                  <Lock className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Your payment information is secure.
                  </p>
                </div>


                <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/10 p-3">
                  <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />


                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-card-foreground">
                      Shipping & Delivery
                    </p>


                    <p className="text-xs leading-5 text-muted-foreground">
                      Estimated delivery{' '}
                      <span className="font-semibold text-card-foreground">
                        {(() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);


                          const dayAfterTomorrow = new Date();
                          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);


                          const formatDate = (date) =>
                            date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            });


                          return `${formatDate(tomorrow)} to ${formatDate(dayAfterTomorrow)}`;
                        })()}
                      </span>{' '}
                      business days. UAE.
                    </p>


                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                      By placing your order, you agree to our{' '}
                      <Link
                        to="/terms-conditions"
                        className="font-medium text-primary hover:opacity-80 transition-opacity"
                      >
                        Terms & Conditions
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>


            <div className="hidden md:block">
              <Button
                type="submit"
                size="lg"
                className="h-14 w-full text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <span className="flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    <span>Placing Order...</span>
                  </span>
                ) : (
                  <span>{`Place Order - ${formatPrice(totalAmount)}`}</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>


      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">

          <div className="flex items-center gap-2">

            {/* HOME BUTTON */}
            <button
              type="button"
              onClick={() => navigateTo && navigateTo('/')}
              className="h-12 flex items-center justify-center gap-1 rounded-xl bg-muted px-3 min-w-[70px] border border-border hover:bg-accent transition"
            >
              <span className="text-sm">🏠</span>
              <span className="text-[10px] leading-none text-muted-foreground">Store</span>
            </button>


            {/* PLACE ORDER BUTTON */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPlacingOrder}
              className="flex-1 h-12 rounded-xl bg-red-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-red-700 transition"
            >
              {isPlacingOrder ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Placing...
                </>
              ) : (
                <>
                  {`Place Order - ${formatPrice(totalAmount)}`}
                  <span>→</span>
                </>
              )}
            </button>


          </div>
        </div>
      </div>
    </>
  );
};


export default CheckoutPage;