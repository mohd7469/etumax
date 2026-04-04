import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Mail,
  Phone,
  Hash,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/context/UserContext';
import { useIntegrations } from '@/context/IntegrationContext';

const statusIcons = {
  'Order Confirmed': <CheckCircle className="h-3.5 w-3.5" />,
  Processing: <Package className="h-3.5 w-3.5" />,
  Shipped: <Truck className="h-3.5 w-3.5" />,
  'Out for Delivery': <Truck className="h-3.5 w-3.5" />,
  Delivered: <MapPin className="h-3.5 w-3.5" />,
};

const normalizePhone = (value = '') => value.toString().replace(/\D/g, '');

const formatMoney = (amount) => {
  const num = Number(amount || 0);
  return `AED ${num.toFixed(2)}`;
};

const safeDateValue = (value) => {
  if (!value) return 0;
  const d = new Date(value).getTime();
  return Number.isNaN(d) ? 0 : d;
};

const getOrderItems = (order) => {
  if (!order) return [];

  if (Array.isArray(order.items) && order.items.length) return order.items;
  if (Array.isArray(order.lineItems) && order.lineItems.length) return order.lineItems;
  if (Array.isArray(order.line_items) && order.line_items.length) return order.line_items;
  if (Array.isArray(order.products) && order.products.length) return order.products;

  return [];
};

const getMappedStatus = (rawStatus) => {
  const s = String(rawStatus || '').trim().toLowerCase();

  if (s === 'on hold' || s === 'shipped') return 'Shipped';
  if (s === 'processing') return 'Processing';
  if (s === 'complete' || s === 'completed' || s === 'delivered') return 'Delivered';

  return 'Order Confirmed';
};

const buildOrderHistory = (foundOrder) => {
  const mappedStatus = getMappedStatus(foundOrder.status);

  const isConfirmedDone = true;
  const isProcessingDone = ['Processing', 'Shipped', 'Delivered'].includes(mappedStatus);
  const isShippedDone = ['Processing', 'Shipped', 'Delivered'].includes(mappedStatus);
  const isDeliveredDone = ['Delivered'].includes(mappedStatus);

  return [
    {
      status: 'Order Confirmed',
      description: 'Your order has been confirmed',
      date: foundOrder.date,
      completed: isConfirmedDone,
    },
    {
      status: 'Processing',
      description: "We're preparing your order",
      date: isProcessingDone ? foundOrder.date : null,
      completed: isProcessingDone,
    },
    {
      status: 'Shipped',
      description: 'Your order is on the way',
      date: isShippedDone ? foundOrder.date : null,
      completed: isShippedDone,
    },
    {
      status: 'Delivered',
      description: 'Order delivered successfully',
      date: isDeliveredDone ? foundOrder.date : null,
      completed: isDeliveredDone,
    },
  ];
};

const DeliveryMiniMap = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/70">
      <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Find A Best Route</h3>
          <p className="text-[10px] text-muted-foreground">
            Estimated delivery path
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[9px] font-medium text-primary">
          In Transit
        </div>
      </div>

      <div className="p-2.5">
        <div className="relative h-[170px] overflow-hidden rounded-lg border border-border/60 bg-[#f3f4f6]">
          <div className="absolute inset-0">
            <div className="absolute left-[-8%] top-[18%] h-[3px] w-[48%] rotate-[28deg] rounded-full bg-[#ead874]" />
            <div className="absolute left-[6%] top-[68%] h-[3px] w-[35%] rotate-[63deg] rounded-full bg-[#ead874]" />
            <div className="absolute left-[46%] top-[15%] h-[3px] w-[22%] rotate-[10deg] rounded-full bg-[#ead874]" />
            <div className="absolute left-[56%] top-[22%] h-[3px] w-[18%] rotate-[-12deg] rounded-full bg-[#ead874]" />

            <div className="absolute left-[28%] top-[16%] h-[65%] w-px bg-[#dbdde1]" />
            <div className="absolute left-[38%] top-[12%] h-[69%] w-px bg-[#dbdde1]" />
            <div className="absolute left-[48%] top-[15%] h-[67%] w-px bg-[#dbdde1]" />
            <div className="absolute left-[58%] top-[17%] h-[64%] w-px bg-[#dbdde1]" />
            <div className="absolute left-[68%] top-[18%] h-[60%] w-px bg-[#dbdde1]" />

            <div className="absolute left-[22%] top-[24%] h-px w-[58%] bg-[#dbdde1]" />
            <div className="absolute left-[22%] top-[36%] h-px w-[58%] bg-[#dbdde1]" />
            <div className="absolute left-[22%] top-[48%] h-px w-[58%] bg-[#dbdde1]" />
            <div className="absolute left-[22%] top-[60%] h-px w-[58%] bg-[#dbdde1]" />
            <div className="absolute left-[22%] top-[72%] h-px w-[58%] bg-[#dbdde1]" />

            <div className="absolute left-[61%] top-[28%] h-2.5 w-2.5 rounded-[2px] bg-[#d8efda]" />
            <div className="absolute left-[41%] top-[68%] h-2.5 w-2.5 rounded-[2px] bg-[#d8efda]" />
            <div className="absolute left-[72%] top-[58%] h-2.5 w-2.5 rounded-[2px] bg-[#d8efda]" />
          </div>

          <div className="absolute left-[23%] top-[24%] z-10 rounded-md bg-[#2563eb] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
            78
          </div>

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M18 82 C21 73, 25 65, 29 56 C35 44, 44 40, 54 36 C62 33, 69 29, 76 22"
              fill="none"
              stroke="#7c6df8"
              strokeWidth="1.6"
              strokeDasharray="3 3"
              strokeLinecap="round"
              opacity="0.95"
            />
          </svg>

          <div className="absolute left-[15%] top-[78%] z-20 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-white/80">
            <MapPin className="h-3.5 w-3.5" />
          </div>

          <motion.div
            className="absolute left-[73%] top-[18%] z-20 h-3.5 w-3.5 rounded-full bg-red-500"
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ boxShadow: '0 0 0 8px rgba(239,68,68,0.12)' }}
          />

          <motion.div
            className="absolute z-30"
            animate={{
              left: ['20%', '26%', '33%', '41%', '49%', '57%', '64%'],
              top: ['73%', '65%', '57%', '49%', '43%', '38%', '33%'],
              opacity: [1, 0.7, 1],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-primary shadow-lg ring-4 ring-white/80">
              <Truck className="h-4 w-4" />
            </div>
          </motion.div>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-lg border border-border/60 bg-muted/25 px-2.5 py-2">
          <div>
            <p className="text-[10px] text-muted-foreground">Very Soon</p>
            <p className="text-[11px] font-semibold text-foreground">Out For Delivery</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">ETA</p>
            <p className="text-[11px] font-semibold text-foreground">Express Delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderItemCard = ({ item }) => {
  const image =
    item?.image ||
    item?.imageUrl ||
    item?.thumbnail ||
    item?.photo ||
    item?.featuredImage ||
    item?.productImage ||
    '';

  const title =
    item?.name ||
    item?.title ||
    item?.productName ||
    item?.product_title ||
    'Order Item';

  const qty = Number(
    item?.quantity || item?.qty || item?.count || item?.productQty || 1
  );

  const total =
    item?.total ||
    item?.lineTotal ||
    item?.subtotal ||
    item?.price * qty ||
    item?.price ||
    0;

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/55 p-2.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/30">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[12px] font-semibold leading-4 text-foreground">
          {title}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">Qty: {qty}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[12px] font-bold text-foreground">
          {formatMoney(total)}
        </p>
      </div>
    </div>
  );
};

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState(null);
  const [matchedField, setMatchedField] = useState('');
  const [matchedOrders, setMatchedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { orders: localOrders } = useUser();
  const { syncedOrders } = useIntegrations();
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    const combinedOrders = [...localOrders, ...syncedOrders].map((o) => ({
      ...o,
      trackingId: o.trackingId || o.tracking_id || `TRK${o.id}`,
      billingAddress: o.billingAddress || o.billing || {},
      shippingAddress: o.shippingAddress || o.shipping || {},
      email:
        o.email ||
        o.billingAddress?.email ||
        o.billing?.email ||
        o.customerEmail ||
        '',
      phone:
        o.phone ||
        o.billingAddress?.phone ||
        o.billing?.phone ||
        o.customerPhone ||
        '',
    }));

    setAllOrders(combinedOrders);
  }, [localOrders, syncedOrders]);

  const hydrateOrder = useCallback((rawOrder, field) => {
    return {
      ...rawOrder,
      history: buildOrderHistory(rawOrder),
      mappedStatus: getMappedStatus(rawOrder.status),
      matchedField: field,
    };
  }, []);

  const findOrdersByAnyField = useCallback(
    (valueToTrack) => {
      if (!valueToTrack) return { orders: [], field: '' };

      const query = String(valueToTrack).trim().toLowerCase();
      const normalizedQueryPhone = normalizePhone(valueToTrack);

      const getOrderEmail = (o) =>
        String(
          o.billingAddress?.email ||
          o.billing?.email ||
          o.shippingAddress?.email ||
          o.shipping?.email ||
          o.email ||
          o.customerEmail ||
          o.customer?.email ||
          o.userEmail ||
          ''
        )
          .trim()
          .toLowerCase();

      const getOrderPhones = (o) => {
        return [
          o.billingAddress?.phone,
          o.billing?.phone,
          o.shippingAddress?.phone,
          o.shipping?.phone,
          o.phone,
          o.customerPhone,
          o.customer?.phone,
          o.userPhone,
          o.mobile,
        ]
          .filter(Boolean)
          .map((v) => normalizePhone(v));
      };

      const trackingMatches = allOrders.filter((o) => {
        const trackingId = String(
          o.trackingId || o.tracking_id || o.awb || ''
        )
          .trim()
          .toLowerCase();
        return trackingId === query;
      });

      if (trackingMatches.length) {
        const sorted = [...trackingMatches].sort(
          (a, b) => safeDateValue(b.date) - safeDateValue(a.date)
        );
        return {
          field: 'Tracking Number',
          orders: sorted.map((o) => hydrateOrder(o, 'Tracking Number')),
        };
      }

      const orderIdMatches = allOrders.filter((o) => {
        const orderId = String(o.id || o.orderId || o.order_id || '')
          .trim()
          .toLowerCase();
        return orderId === query;
      });

      if (orderIdMatches.length) {
        const sorted = [...orderIdMatches].sort(
          (a, b) => safeDateValue(b.date) - safeDateValue(a.date)
        );
        return {
          field: 'Order ID',
          orders: sorted.map((o) => hydrateOrder(o, 'Order ID')),
        };
      }

      const phoneMatches = allOrders.filter((o) => {
        const phones = getOrderPhones(o);

        return phones.some((phone) => {
          if (!phone || !normalizedQueryPhone) return false;

          return (
            phone === normalizedQueryPhone ||
            phone.endsWith(normalizedQueryPhone) ||
            normalizedQueryPhone.endsWith(phone)
          );
        });
      });

      if (phoneMatches.length) {
        const sorted = [...phoneMatches].sort(
          (a, b) => safeDateValue(b.date) - safeDateValue(a.date)
        );
        return {
          field: 'Mobile Number',
          orders: sorted.map((o) => hydrateOrder(o, 'Mobile Number')),
        };
      }

      const emailMatches = allOrders.filter((o) => {
        const email = getOrderEmail(o);
        return email && email === query;
      });

      if (emailMatches.length) {
        const sorted = [...emailMatches].sort(
          (a, b) => safeDateValue(b.date) - safeDateValue(a.date)
        );
        return {
          field: 'Email',
          orders: sorted.map((o) => hydrateOrder(o, 'Email')),
        };
      }

      return { orders: [], field: '' };
    },
    [allOrders, hydrateOrder]
  );

  const findAndSetOrder = useCallback(
    (valueToTrack) => {
      if (!valueToTrack) return;

      setLoading(true);
      setOrder(null);
      setMatchedField('');
      setMatchedOrders([]);

      setTimeout(() => {
        const result = findOrdersByAnyField(valueToTrack);

        if (result.orders.length) {
          setMatchedOrders(result.orders);
          setOrder(result.orders[0]);
          setMatchedField(result.field || result.orders[0]?.matchedField || '');
        } else {
          toast({
            title: 'Not Found',
            description:
              'No order found with that tracking number, order ID, mobile number, or email.',
            variant: 'destructive',
          });
        }

        setLoading(false);
      }, 700);
    },
    [findOrdersByAnyField, toast]
  );

  useEffect(() => {
    const urlTrackingId =
      searchParams.get('trackingId') ||
      searchParams.get('orderId') ||
      searchParams.get('email') ||
      searchParams.get('phone');

    if (urlTrackingId) {
      setSearchValue(urlTrackingId);
      if (allOrders.length > 0) {
        findAndSetOrder(urlTrackingId);
      }
    }
  }, [searchParams, allOrders, findAndSetOrder]);

  const handleTrackOrder = (e) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter tracking number, order ID, mobile number, or email.',
        variant: 'destructive',
      });
      return;
    }

    findAndSetOrder(searchValue);
  };

  const handleSelectMatchedOrder = (selectedOrderId) => {
    const selected = matchedOrders.find(
      (o) => String(o.id) === String(selectedOrderId)
    );
    if (selected) {
      setOrder(selected);
    }
  };

  const orderItems = useMemo(() => getOrderItems(order), [order]);
  const showOrderSwitcher =
    order &&
    matchedOrders.length > 1 &&
    ['Email', 'Mobile Number'].includes(matchedField);

  return (
    <>
      <Helmet>
        <title>Track Your Order - ShopHub</title>
        <meta
          name="description"
          content="Track your order using tracking number, order ID, mobile number, or email."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-4 md:py-8 text-center text-foreground">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto mb-4 max-w-xl"
        >
          <div className="mb-2 inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-medium text-primary">
            Order Tracking
          </div>

          <h1 className="mb-1.5 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Track Your Order
          </h1>

          <p className="text-[12px] text-muted-foreground md:text-[13px]">
            Search using tracking number, order ID, mobile number, or email
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleTrackOrder}
          className="mx-auto mb-6 max-w-xl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-xl border border-border/70 bg-card/95 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur">
            <CardContent className="p-3">
              <div className="flex flex-col gap-2">
                <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background/70 px-3 focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tracking no / Order ID / Mobile / Email"
                    className="h-auto flex-grow border-0 bg-transparent px-0 text-[12px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
                  <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/50 px-2 py-2 text-[10px] text-muted-foreground">
                    <Hash className="h-3 w-3 text-primary" />
                    Order ID
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/50 px-2 py-2 text-[10px] text-muted-foreground">
                    <Search className="h-3 w-3 text-primary" />
                    Tracking
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/50 px-2 py-2 text-[10px] text-muted-foreground">
                    <Phone className="h-3 w-3 text-primary" />
                    Mobile
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/50 px-2 py-2 text-[10px] text-muted-foreground">
                    <Mail className="h-3 w-3 text-primary" />
                    Email
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-9 rounded-lg px-5 text-[12px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Track Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.form>

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="pb-6"
            >
              <Card className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
                <CardHeader className="border-b border-border/70 bg-muted/20 px-4 py-3 md:px-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-semibold text-foreground md:text-lg">
                            Order #{order.id}
                          </CardTitle>
                          <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {order.mappedStatus}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground md:text-[12px]">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="inline-flex w-fit rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary">
                          Tracking ID: {order.trackingId}
                        </div>

                        {matchedField && (
                          <div className="inline-flex w-fit rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                            Matched by: {matchedField}
                          </div>
                        )}
                      </div>
                    </div>

                    {showOrderSwitcher && (
                      <div className="rounded-xl border border-border/60 bg-background/60 p-2.5">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-[11px] font-medium text-foreground">
                            Customer Orders
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Latest selected by default
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {matchedOrders.map((matchedOrder) => {
                            const isActive =
                              String(order.id) === String(matchedOrder.id);

                            return (
                              <button
                                key={matchedOrder.id}
                                type="button"
                                onClick={() => handleSelectMatchedOrder(matchedOrder.id)}
                                className={`rounded-full border px-3 py-1 text-[10px] font-medium transition-colors ${isActive
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-background text-foreground hover:border-primary/40'
                                  }`}
                              >
                                #{matchedOrder.id}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 p-4 md:p-5">
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border/70 bg-background/60 p-3.5">
                        <div className="mb-3">
                          <h3 className="text-xs font-semibold text-foreground">
                            Tracking Progress
                          </h3>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Latest updates for your shipment
                          </p>
                        </div>

                        <div className="relative pl-4">
                          {order.history.map((item, index) => {
                            const currentRawStatus = String(order.status || '').trim().toLowerCase();

                            const shouldBlinkShipped =
                              item.status === 'Shipped' &&
                              (currentRawStatus === 'processing' || currentRawStatus === 'shipped');

                            return (
                              <motion.div
                                key={index}
                                className="relative flex gap-2.5"
                                animate={
                                  shouldBlinkShipped
                                    ? {
                                      opacity: [1, 0.55, 1],
                                    }
                                    : {}
                                }
                                transition={
                                  shouldBlinkShipped
                                    ? {
                                      duration: 1,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                    }
                                    : {}
                                }
                              >
                                <div className="absolute left-0 top-0 -translate-x-1/2">
                                  <motion.div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${item.completed
                                        ? 'border-primary/20 bg-primary/10 text-primary'
                                        : 'border-border bg-muted text-muted-foreground'
                                      }`}
                                    animate={
                                      shouldBlinkShipped
                                        ? {
                                          scale: [1, 1.08, 1],
                                          boxShadow: [
                                            '0 0 0 0 rgba(59,130,246,0)',
                                            '0 0 0 8px rgba(59,130,246,0.12)',
                                            '0 0 0 0 rgba(59,130,246,0)',
                                          ],
                                        }
                                        : {}
                                    }
                                    transition={
                                      shouldBlinkShipped
                                        ? {
                                          duration: 1,
                                          repeat: Infinity,
                                          ease: 'easeInOut',
                                        }
                                        : {}
                                    }
                                  >
                                    {statusIcons[item.status] || (
                                      <Truck className="h-3.5 w-3.5" />
                                    )}
                                  </motion.div>
                                </div>

                                <div
                                  className={`ml-3.5 w-full pb-4 ${index === order.history.length - 1 ? '' : 'border-l'
                                    } ${item.completed
                                      ? 'border-primary/25'
                                      : 'border-border/80'
                                    }`}
                                >
                                  <div className="pl-4">
                                    <p
                                      className={`text-[12px] font-semibold ${item.completed
                                          ? 'text-foreground'
                                          : 'text-muted-foreground'
                                        }`}
                                    >
                                      {item.status}
                                    </p>
                                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                                      {item.description}
                                    </p>
                                    {item.date && (
                                      <p className="mt-1 text-[10px] text-muted-foreground/80">
                                        {new Date(item.date).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      <DeliveryMiniMap />
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-border/70 bg-background/60 p-3.5">
                        <h3 className="mb-2.5 text-xs font-semibold text-foreground">
                          Shipping Address
                        </h3>

                        <div className="space-y-1 text-[11px] leading-5 text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {order.shippingAddress?.first_name}{' '}
                            {order.shippingAddress?.last_name}
                          </p>
                          <p>{order.shippingAddress?.address_1}</p>
                          <p>{order.shippingAddress?.city}</p>
                          <p>{order.shippingAddress?.country}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-background/60 p-3.5">
                        <h3 className="mb-2.5 text-xs font-semibold text-foreground">
                          Contact Info
                        </h3>

                        <div className="space-y-2 text-[11px] text-muted-foreground">
                          {(order.billingAddress?.phone ||
                            order.billing?.phone ||
                            order.phone ||
                            order.customerPhone) && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-primary" />
                                <span>
                                  {order.billingAddress?.phone ||
                                    order.billing?.phone ||
                                    order.phone ||
                                    order.customerPhone}
                                </span>
                              </div>
                            )}

                          {(order.billingAddress?.email ||
                            order.billing?.email ||
                            order.email ||
                            order.customerEmail) && (
                              <div className="flex items-center gap-2 break-all">
                                <Mail className="h-3 w-3 text-primary" />
                                <span>
                                  {order.billingAddress?.email ||
                                    order.billing?.email ||
                                    order.email ||
                                    order.customerEmail}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-background/60 p-3.5">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-foreground">
                            Order Details
                          </h3>
                          <div className="text-[10px] text-muted-foreground">
                            {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {orderItems.length > 0 ? (
                            orderItems.slice(0, 6).map((item, index) => (
                              <OrderItemCard
                                key={item?.id || item?.sku || item?.name || index}
                                item={item}
                              />
                            ))
                          ) : (
                            <div className="rounded-lg border border-dashed border-border/70 bg-background/40 px-3 py-4 text-center">
                              <p className="text-[11px] text-muted-foreground">
                                No order items available.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-background/60 p-3.5">
                        <h3 className="mb-2 text-xs font-semibold text-foreground">
                          Need Help?
                        </h3>
                        <p className="text-[11px] leading-5 text-muted-foreground">
                          Contact support if your order status has not updated for a long time.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default OrderTrackingPage;