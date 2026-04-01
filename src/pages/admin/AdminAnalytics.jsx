
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Globe, Calendar as CalendarIcon, DollarSign, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { listenToCollection, setDocument } from '@/lib/firestoreService';

const AnalyticsChart = ({ title, data, color, isLoading, formatPrice }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-around items-end h-56">
            {Array(7).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                <Skeleton className="w-3/4 rounded-t-md" style={{ height: `${Math.random() * 80 + 10}%` }} />
                <Skeleton className="h-4 w-8 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-around items-end h-56">
            {data.map((item, index) => (
              <div key={item.name} className="flex flex-col items-center w-full" title={`${item.name}: ${formatPrice ? formatPrice(item.value) : item.value}`}>
                <motion.div
                  className={`w-3/4 ${color} rounded-t-md`}
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.7, delay: index * 0.1, type: 'spring' }}
                />
                <span className="mt-2 text-xs text-gray-500">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TopProductsList = ({ orders, products, isLoading, formatPrice }) => {
  const topProducts = useMemo(() => {
    if (!orders || !products) return [];
    const productSales = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const productName = item.name;
        const price = parseFloat(item.price || products.find(p => p.name === productName)?.price || 0);
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, total: 0 };
        }
        productSales[productName].total += price * item.quantity;
      });
    });
    return Object.values(productSales).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [orders, products]);

  return (
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="space-y-4">
            {Array(5).fill(0).map((_, index) => <Skeleton key={index} className="h-6 w-full" />)}
          </ul>
        ) : (
          <ul className="space-y-4">
            {topProducts.map((product, index) => (
              <motion.li
                key={product.name}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <span className="text-sm font-medium truncate w-3/4">{product.name}</span>
                <span className="text-sm font-bold text-purple-600">{formatPrice(product.total)}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

const TrafficSourceList = ({ isLoading }) => {
  const [gaTrackingId, setGaTrackingId] = useState('');

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('shophub_settings') || '{}');
    setGaTrackingId(settings.gaTrackingId || '');
  }, []);

  const handleConnectGoogle = () => {
    const settings = JSON.parse(localStorage.getItem('shophub_settings') || '{}');
    settings.gaTrackingId = gaTrackingId;
    localStorage.setItem('shophub_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('settings_updated'));
    toast({
      title: 'Google Analytics Connected! 🚀',
      description: 'Your tracking ID has been saved.',
    });
  };

  return (
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Traffic Sources
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">Connect your Google Analytics account to see traffic data here. Enter your GA4 Measurement ID.</p>
        <div className="flex items-center gap-2">
          <input
            value={gaTrackingId}
            onChange={e => setGaTrackingId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          />
          <Button onClick={handleConnectGoogle}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}

const StatCard = ({ title, value, icon, isLoading, formatPrice }) => (
  <Card className="glass-effect">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-3/4" />
      ) : (
        <div className="text-2xl font-bold">{formatPrice ? formatPrice(value) : value}</div>
      )}
    </CardContent>
  </Card>
);

const AdminAnalytics = () => {
  const { products, formatPrice } = useProducts();
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState({ from: subDays(new Date(), 29), to: new Date() });

  useEffect(() => {
    setIsLoading(true);
    const unsub = listenToCollection('orders', (data) => {
      setAllOrders(data || []);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!date?.from) return allOrders;
    const from = startOfDay(date.from);
    const to = date.to ? endOfDay(date.to) : endOfDay(new Date());

    return allOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= from && orderDate <= to;
    });
  }, [allOrders, date]);


  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, value: 0 }));
    if (filteredOrders) {
      filteredOrders.forEach(order => {
        const dayIndex = new Date(order.date).getDay();
        if (dayIndex >= 0 && dayIndex < 7) {
          data[dayIndex].value += 1;
        }
      });
    }
    return data;
  }, [filteredOrders]);

  const salesByDayData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, value: 0 }));
    if (filteredOrders) {
      filteredOrders.forEach(order => {
        const dayIndex = new Date(order.date).getDay();
        if (dayIndex >= 0 && dayIndex < 7) {
          data[dayIndex].value += parseFloat(order.total || 0);
        }
      });
    }
    return data;
  }, [filteredOrders]);

  const totalRevenue = useMemo(() => filteredOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0), [filteredOrders]);
  const totalOrders = useMemo(() => filteredOrders.length, [filteredOrders]);

  useEffect(() => {
    const dataToSave = {
      totalRevenue,
      totalOrders,
      salesByDay: salesByDayData,
      ordersByDay: weeklyData,
      lastUpdated: new Date().toISOString()
    };
    setDocument('settings', 'analytics', dataToSave);
  }, [totalRevenue, totalOrders, salesByDayData, weeklyData]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600">Deep dive into your store's performance metrics.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={totalRevenue} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} formatPrice={formatPrice} />
        <StatCard title="Total Orders" value={totalOrders} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AnalyticsChart title="Sales" data={salesByDayData} color="bg-gradient-to-t from-pink-500 to-orange-400" isLoading={isLoading} formatPrice={formatPrice} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <AnalyticsChart title="Orders" data={weeklyData} color="bg-gradient-to-t from-blue-500 to-cyan-400" isLoading={isLoading} />
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <TopProductsList orders={filteredOrders} products={products} isLoading={isLoading} formatPrice={formatPrice} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <TrafficSourceList isLoading={isLoading} />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
