
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Users, ShoppingBag, Activity, Calendar as CalendarIcon, Download, Plug, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useUser } from '@/context/UserContext';
import { useWooCommerce } from '@/context/WooCommerceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, subDays } from "date-fns"
import { useNavigate } from 'react-router-dom';
import OrderSyncMonitor from '@/components/admin/OrderSyncMonitor';

const StatCard = ({ icon, title, value, change, color, index, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="glass-effect overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 my-1" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className={`text-xs ${color}`}>{change}</p>
          </>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const AdminDashboard = () => {
  const { products, formatPrice } = useProducts();
  const { orders: localOrders } = useUser();
  const { isConnected, isSyncing, syncLogs, autoSyncConfig, lastSyncTime } = useWooCommerce();
  const [date, setDate] = useState({ from: subDays(new Date(), 29), to: new Date() });
  const navigate = useNavigate();

  const allOrders = useMemo(() => localOrders || [], [localOrders]);

  const filteredOrders = useMemo(() => {
    if (!date?.from || !date?.to) return allOrders;
    return allOrders.filter(order => {
      const orderDate = new Date(order.date || order.createdAt);
      return orderDate >= date.from && orderDate <= date.to;
    });
  }, [allOrders, date]);

  const totalRevenue = useMemo(() => filteredOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0), [filteredOrders]);
  const totalCustomers = useMemo(() => new Set(filteredOrders.map(o => o.shippingAddress?.email || o.customer?.email).filter(Boolean)).size, [filteredOrders]);
  
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleTimeString() : 'Never';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Admin! Here's your store's overview.</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<DollarSign className="h-4 w-4 text-gray-500" />} title="Total Revenue" value={formatPrice(totalRevenue)} change="+20.1% from last month" color="text-green-500" index={0} isLoading={false} />
        <StatCard icon={<Users className="h-4 w-4 text-gray-500" />} title="Customers" value={totalCustomers.toString()} change="+180.1% from last month" color="text-green-500" index={1} isLoading={false} />
        <StatCard icon={<ShoppingBag className="h-4 w-4 text-gray-500" />} title="Total Products" value={products.length.toString()} change="+19 from last month" color="text-green-500" index={2} isLoading={false} />
        <StatCard icon={<Activity className="h-4 w-4 text-gray-500" />} title="Total Orders" value={filteredOrders.length} change="+201 since last hour" color="text-green-500" index={3} isLoading={false} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* WooCommerce Sync Health Card */}
        <motion.div className="lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center text-lg">
                <span className="flex items-center gap-2"><Plug className="w-5 h-5"/> WooCommerce Sync</span>
                {isConnected ? <CheckCircle className="w-5 h-5 text-green-500"/> : <XCircle className="w-5 h-5 text-red-500"/>}
              </CardTitle>
              <CardDescription>System integration status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <span className="text-sm font-medium">Status</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin"/> : null}
                  {isConnected ? (isSyncing ? 'Syncing...' : 'Connected') : 'Disconnected'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted p-2 rounded flex flex-col">
                  <span className="text-muted-foreground text-xs">Products</span>
                  <span>{formatDate(lastSyncTime.products)}</span>
                </div>
                <div className="bg-muted p-2 rounded flex flex-col">
                  <span className="text-muted-foreground text-xs">Orders</span>
                  <span>{formatDate(lastSyncTime.orders)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Auto-Sync</span>
                <span>{autoSyncConfig.enabled ? `Every ${autoSyncConfig.interval}m` : 'Disabled'}</span>
              </div>
              <Button className="w-full" variant="outline" onClick={() => navigate('/admin/integrations')}>Manage Integration</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Sync Monitor */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
           <OrderSyncMonitor />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
