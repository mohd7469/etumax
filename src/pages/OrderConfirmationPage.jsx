import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle,
  Tag,
  Truck,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  MapPin,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/context/UserContext';
import { useProducts } from '@/context/ProductContext';
import { listenToDocument } from '@/lib/firestoreService';
import { retryOrderSync } from '@/lib/orderSyncRetryService';

const OrderConfirmationPage = ({ navigateTo }) => {
  const { orderId } = useParams();
  const { user } = useUser();
  const { formatPrice } = useProducts();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenToDocument('orders', orderId, (data) => {
      setOrder(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  const handleRetrySync = async () => {
    if (!order || isRetrying) return;

    setIsRetrying(true);
    toast({
      title: 'Retrying Sync',
      description: 'Attempting to push your order to WooCommerce...',
    });

    try {
      const result = await retryOrderSync(order.id);

      if (result.success) {
        toast({
          title: 'Sync Successful',
          description: 'Order has been successfully synced.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sync Failed',
          description: result.error || 'Failed to sync order.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: error.message,
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleTrackOrder = () => {
    if (!order) return;
    const trackingId = order.trackingId || `TRK${order.id}`;
    navigate(`/track-order?trackingId=${trackingId}`);
  };

  const handleContinueShopping = () => {
    if (navigateTo) {
      navigateTo('/products');
      return;
    }
    navigate('/products');
  };

  const productDiscount = Number(order?.productDiscount || 0);
  const couponDiscount = Number(order?.discount || 0);
  const orderTotalDiscount = Number(
    order?.orderTotalDiscount || productDiscount + couponDiscount
  );
  const shippingCost = Number(order?.shippingCost || 0);
  const subtotal = Number(order?.subtotal || 0);
  const totalPaid = Number(order?.total || 0);

  useEffect(() => {
    if (!order || !order.id) return;

    const items = (order.items || []).map((item) => ({
      item_id: String(item.id || item.sku || item.slug || item.name || 'unknown-item'),
      item_name: item.name || 'Unnamed Product',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      item_category: item.category || item.categoryName || '',
      item_brand: item.brand || '',
    }));

    if (!items.length) return;

    const purchaseKey = `purchase_sent_${order.id}`;

    if (sessionStorage.getItem(purchaseKey)) return;

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({ ecommerce: null });

    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: String(order.id),
        affiliation: 'E-SHOP',
        value: Number(order.total || 0),
        currency: order.currency || 'AED',
        tax: Number(order.tax || 0),
        shipping: Number(order.shippingCost || 0),
        coupon: order.couponCode || '',
        discount: Number(order.orderTotalDiscount || order.productDiscount || order.discount || 0),
        items,
      },
    });

    console.log('GA4 purchase event fired:', {
      transaction_id: String(order.id),
      value: Number(order.total || 0),
      currency: order.currency || 'AED',
      items,
    });

    sessionStorage.setItem(purchaseKey, 'true');
  }, [order]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <>
        <Helmet>
          <title>No Order Found</title>
        </Helmet>

        <div className="container mx-auto flex justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl"
          >
            <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <CardContent className="p-10 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <ShoppingBag className="mx-auto mb-6 h-20 w-20 text-primary" />
                </motion.div>

                <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                  Order Not Found
                </h1>

                <p className="mb-8 text-muted-foreground">
                  We couldn&apos;t find the order details you are looking for.
                </p>

                <Button
                  size="lg"
                  onClick={handleContinueShopping}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Go to Shop
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Thank You For Your Order</title>
        <meta
          name="description"
          content="Your order has been successfully placed."
        />
      </Helmet>

      <div className="container mx-auto flex justify-center px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl"
        >
          <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <CardContent className="p-8 text-center md:p-12">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
              >
                <CheckCircle className="mx-auto mb-6 h-20 w-20 text-primary" />
              </motion.div>

              <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                Thank You For Your Order!
              </h1>

              <div className="mb-2 flex flex-col items-center justify-center gap-3">
                <p className="text-muted-foreground">
                  Your order{' '}
                  <span className="font-bold text-primary">#{order.id}</span>{' '}
                  has been confirmed.
                </p>

                {order.syncStatus === 'synced' && (
                  <Badge className="border-primary/20 bg-primary/10 text-primary">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Order Place Successfully ✓ (ID: {order.wooCommerceOrderId})
                  </Badge>
                )}

                {order.syncStatus === 'syncing' && (
                  <Badge
                    variant="secondary"
                    className="border-border bg-accent text-accent-foreground"
                  >
                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    Order is being processed...
                  </Badge>
                )}

                {(order.syncStatus === 'failed' ||
                  order.syncStatus === 'failed_permanent') && (
                  <div className="flex flex-col items-center gap-2">
                    <Badge
                      variant="destructive"
                      className="border-destructive/20 bg-destructive/10 text-destructive"
                    >
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Order in Proccess - Will inform You Shortly
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetrySync}
                      disabled={isRetrying}
                      className="border-border bg-background text-foreground hover:bg-accent"
                    >
                      {isRetrying ? (
                        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-1 h-3 w-3" />
                      )}
                      Retry Sync
                    </Button>
                  </div>
                )}
              </div>

              <p className="mb-10 mt-4 text-muted-foreground">
                A confirmation email has been sent to{' '}
                <span className="font-bold text-foreground">
                  {order.shippingAddress?.email || user?.email || 'your email'}
                </span>
                .
              </p>

              <div className="text-left">
                <h2 className="mb-6 border-b border-border pb-4 text-center text-xl font-bold text-foreground">
                  Order Details
                </h2>

                <div className="mb-8 space-y-4">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-xl border border-border bg-muted/40 p-3"
                    >
                      <img
                        src={
                          item.images?.[0] ||
                          'https://images.unsplash.com/photo-1572635196237-14b3f281503f'
                        }
                        alt={item.name}
                        className="h-16 w-16 rounded-lg bg-background object-cover"
                      />

                      <div className="min-w-0 flex-grow">
                        <p className="truncate font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-b border-t border-border py-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {productDiscount > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span className="text-right text-sm text-red-600">
                        <BadgePercent className="h-4 w-4" />
                        Product Discount
                      </span>
                      <span className="font-semibold">
                        - {formatPrice(productDiscount)}
                      </span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-red-700">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-4 w-4" />
                        Coupon Discount
                        {order.couponCode ? ` (${order.couponCode})` : ''}
                      </span>
                      <span className="font-semibold">
                        - {formatPrice(couponDiscount)}
                      </span>
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

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      Shipping
                    </span>
                    <span className="font-semibold text-foreground">
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                </div>

                <div className="-mx-8 flex items-center justify-between bg-muted/40 px-8 py-4 md:-mx-12 md:px-12">
                  <div className="flex flex-col">
                    <p className="text-lg font-bold text-foreground">Total Paid:</p>
                    {orderTotalDiscount > 0 && (
                      <p className="mt-1 text-right text-xs font-medium text-green-600">
                        Total savings: {formatPrice(orderTotalDiscount)}
                      </p>
                    )}
                  </div>

                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(totalPaid)}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-8 py-6 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/40 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      Shipping Address
                    </h3>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">
                        {order.shippingAddress?.first_name}{' '}
                        {order.shippingAddress?.last_name}
                      </p>
                      <p>{order.shippingAddress?.address_1}</p>
                      {order.shippingAddress?.address_2 && (
                        <p>{order.shippingAddress?.address_2}</p>
                      )}
                      <p>
                        {order.shippingAddress?.city}
                        {order.shippingAddress?.country
                          ? `, ${order.shippingAddress.country}`
                          : ''}
                      </p>
                      <p className="mt-2 border-t border-border pt-2 text-muted-foreground">
                        {order.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/40 p-4">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                        <Truck className="h-4 w-4 text-primary" />
                        Tracking Information
                      </h3>

                      <p className="mb-2 text-sm text-muted-foreground">
                        Order Status:{' '}
                        <span className="font-semibold capitalize text-foreground">
                          {order.status}
                        </span>
                      </p>

                      <p className="mb-4 text-sm text-muted-foreground">
                        Tracking Number:{' '}
                        <span className="font-semibold text-primary">
                          {order.trackingId || 'Pending'}
                        </span>
                      </p>
                    </div>

                    <Button
                      onClick={handleTrackOrder}
                      variant="outline"
                      className="w-full border-border bg-background text-foreground hover:bg-accent"
                    >
                      Track Your Order
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleContinueShopping}
                  size="lg"
                  className="w-full bg-primary px-8 text-primary-foreground hover:bg-primary/90 sm:w-auto"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;