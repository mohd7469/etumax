
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { listenToCollection } from '@/lib/firestoreService';
import { retryFailedOrders, retryOrderSync } from '@/lib/orderSyncRetryService';
import { toast } from '@/components/ui/use-toast';

const OrderSyncMonitor = () => {
  const [orders, setOrders] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [syncingOrderId, setSyncingOrderId] = useState(null);

  useEffect(() => {
    const unsubscribe = listenToCollection('orders', (data) => {
      // Sort by date descending, take last 50
      const sorted = data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 50);
      setOrders(sorted);
    });
    return () => unsubscribe();
  }, []);

  const handleRetryFailed = async () => {
    setIsRetrying(true);
    try {
      await retryFailedOrders();
      toast({ title: "Retry Initiated", description: "Background retry process started for failed orders." });
    } catch (error) {
      toast({ variant: "destructive", title: "Retry Failed", description: error.message });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSyncIndividual = async (orderId) => {
    setSyncingOrderId(orderId);
    try {
      const result = await retryOrderSync(orderId);
      if (result && result.success) {
        toast({ title: "Sync Successful", description: `Order ${orderId} synced successfully.` });
      } else {
        toast({ variant: "destructive", title: "Sync Failed", description: result?.error || "Failed to sync order." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message });
    } finally {
      setSyncingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'synced': return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1"/> Synced</Badge>;
      case 'syncing': return <Badge className="bg-yellow-500 text-yellow-950"><RefreshCw className="w-3 h-3 mr-1 animate-spin"/> Syncing</Badge>;
      case 'failed': return <Badge className="bg-red-500"><AlertCircle className="w-3 h-3 mr-1"/> Failed</Badge>;
      case 'abandoned': return <Badge variant="outline" className="text-gray-500">Abandoned</Badge>;
      default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  const getActionButtonText = (status) => {
    if (status === 'synced') return 'Resync';
    if (status === 'failed' || status === 'abandoned') return 'Retry';
    return 'Sync';
  };

  const stats = {
    total: orders.length,
    synced: orders.filter(o => o.syncStatus === 'synced').length,
    failed: orders.filter(o => o.syncStatus === 'failed').length,
    pending: orders.filter(o => !o.syncStatus || o.syncStatus === 'pending' || o.syncStatus === 'syncing').length
  };

  return (
    <Card className="glass-effect">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Order Sync Monitor</CardTitle>
          <CardDescription>Real-time WooCommerce synchronization status</CardDescription>
        </div>
        <Button onClick={handleRetryFailed} disabled={isRetrying || stats.failed === 0} variant="outline" size="sm">
          {isRetrying ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Retry Failed ({stats.failed})
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Orders</div>
          </div>
          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <div className="text-2xl font-bold text-green-600">{stats.synced}</div>
            <div className="text-xs text-green-600/80">Successfully Synced</div>
          </div>
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-red-600/80">Failed Syncs</div>
          </div>
          <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-yellow-600/80">Pending/Syncing</div>
          </div>
        </div>

        <div className="rounded-md border max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>WC ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">No recent orders</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const isSyncingThis = syncingOrderId === order.id || order.syncStatus === 'syncing';
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell>{order.shippingAddress?.first_name || 'Guest'} {order.shippingAddress?.last_name || ''}</TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>{getStatusBadge(order.syncStatus)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{order.wooCommerceOrderId || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSyncIndividual(order.id)}
                          disabled={isSyncingThis}
                        >
                          {isSyncingThis ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                              <span className="hidden sm:inline">Syncing...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 mr-2 hidden sm:inline" />
                              {getActionButtonText(order.syncStatus)}
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSyncMonitor;
