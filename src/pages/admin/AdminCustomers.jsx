
import React, { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProducts } from '@/context/ProductContext';
import { toast } from '@/components/ui/use-toast';
import { XCircle, MapPin, Search, Settings2, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const CustomerDetailsModal = ({ customer, orders, onClose, formatPrice, updateOrderStatus }) => {
  const customerOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => order.shippingAddress?.email === customer.email || order.customer?.email === customer.email);
  }, [orders, customer.email]);

  const latestOrder = customerOrders.length > 0 ? customerOrders.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
  const shippingAddress = latestOrder?.shippingAddress;

  const handleCancelOrder = (orderId) => {
    updateOrderStatus(orderId, 'cancelled');
    toast({ title: 'Order Cancelled', description: `Order #${orderId} has been cancelled.` });
  };

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{customer.name}</DialogTitle>
          <DialogDescription>{customer.email}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold border-b pb-2">Contact & Stats</h4>
              <div><span className="font-medium text-gray-500">Phone:</span> {customer.phone || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Total Spent:</span> {formatPrice(customer.totalSpent || 0)}</div>
              <div><span className="font-medium text-gray-500">Total Orders:</span> {customer.orders || 0}</div>
              <div><span className="font-medium text-gray-500">Last Order:</span> {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold border-b pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Latest Shipping Address
              </h4>
              {shippingAddress ? (
                <div className="text-gray-600">
                  <p>{shippingAddress.first_name} {shippingAddress.last_name}</p>
                  <p>{shippingAddress.address_1}</p>
                  {shippingAddress.address_2 && <p>{shippingAddress.address_2}</p>}
                  <p>{shippingAddress.city}{shippingAddress.postcode ? `, ${shippingAddress.postcode}` : ''}</p>
                  <p>{shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No shipping address found in order history.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold mb-2">Order History</h3>
          <ScrollArea className="h-64 border rounded-md">
            <div className="p-4 space-y-4">
              {customerOrders.length > 0 ? customerOrders.map(order => (
                <div key={order.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Order #{order.wc_id || order.id}</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-800'
                        }`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-sm flex justify-between items-center">
                    <div>
                      <span>{order.items?.length || 0} items</span> - <span className="font-medium">{formatPrice(order.total)}</span>
                    </div>
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <XCircle className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to cancel order #{order.id}? This will update the order status to cancelled.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Order</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelOrder(order.id)} className="bg-red-600 hover:bg-red-700">Cancel Order</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-8">No orders found for this customer.</div>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const defaultVisibleColumns = {
  name: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  country: true,
  totalOrders: true,
  totalSpent: true,
  status: true,
  actions: true,
};

const AdminCustomers = () => {
  const { customers, orders, updateOrderStatus } = useUser();
  const { formatPrice } = useProducts();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // State for Filters, Screen Options & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const processedCustomers = useMemo(() => {
    if (!customers) return [];
    
    // Filter out admin and attach latest address info
    let list = customers
      .filter(c => c.email !== 'admin@example.com')
      .map(customer => {
        const customerOrders = orders?.filter(o => o.shippingAddress?.email === customer.email || o.customer?.email === customer.email) || [];
        const latestOrder = customerOrders.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const addr = latestOrder?.shippingAddress || {};
        return {
          ...customer,
          address: addr.address_1 || '',
          city: addr.city || '',
          country: addr.country || ''
        };
      });

    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      list = list.filter(c => 
        (c.name || '').toLowerCase().includes(lowerQuery) ||
        (c.email || '').toLowerCase().includes(lowerQuery) ||
        (c.phone || '').toLowerCase().includes(lowerQuery)
      );
    }

    // Sort by most recent order
    list.sort((a, b) => new Date(b.lastOrder || 0) - new Date(a.lastOrder || 0));

    return list;
  }, [customers, orders, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(processedCustomers.length / itemsPerPage);
  
  const paginatedCustomers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedCustomers.slice(startIdx, startIdx + itemsPerPage);
  }, [processedCustomers, currentPage, itemsPerPage]);

  const handleColumnToggle = (colKey) => {
    setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setVisibleColumns(defaultVisibleColumns);
    setItemsPerPage(50);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4 justify-between bg-gray-50/40 rounded-lg p-2">
            <div className="flex flex-wrap items-center gap-3 flex-grow">
              <div className="relative flex-grow max-w-md shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by name, email, or phone..." 
                  className="pl-10 h-10 bg-white border-gray-200" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 bg-white border-gray-200">
                    <Settings2 className="mr-2 h-4 w-4" /> Screen Options
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Columns Visibility</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(defaultVisibleColumns).map((col) => (
                          <div key={col} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`col-${col}`} 
                              checked={visibleColumns[col]} 
                              onCheckedChange={() => handleColumnToggle(col)} 
                            />
                            <label htmlFor={`col-${col}`} className="text-sm capitalize leading-none cursor-pointer">
                              {col.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="font-medium text-sm">Pagination</h4>
                      <div className="flex items-center gap-3">
                        <label className="text-sm">Items per page:</label>
                        <Input 
                          type="number" 
                          min="1" max="500" 
                          className="w-20 h-8" 
                          value={itemsPerPage} 
                          onChange={(e) => setItemsPerPage(Number(e.target.value) || 50)} 
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" onClick={resetFilters} className="h-10 text-muted-foreground hover:text-foreground hover:bg-gray-200">
                <FilterX className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 font-medium">
              Total: {processedCustomers.length} customers
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-200">
            <table className="w-full text-left table-fixed min-w-[1000px] text-sm">
              <thead className="border-b bg-gray-50/80 text-xs text-gray-500 uppercase">
                <tr>
                  {visibleColumns.name && <th className="p-4 font-semibold w-48">Customer Name</th>}
                  {visibleColumns.email && <th className="p-4 font-semibold w-56">Email</th>}
                  {visibleColumns.phone && <th className="p-4 font-semibold w-40">Phone</th>}
                  {visibleColumns.address && <th className="p-4 font-semibold w-48">Address</th>}
                  {visibleColumns.city && <th className="p-4 font-semibold w-32">City</th>}
                  {visibleColumns.country && <th className="p-4 font-semibold w-32">Country</th>}
                  {visibleColumns.totalOrders && <th className="p-4 font-semibold w-24 text-center">Orders</th>}
                  {visibleColumns.totalSpent && <th className="p-4 font-semibold w-32 text-right">Spent</th>}
                  {visibleColumns.status && <th className="p-4 font-semibold w-32 text-center">Status</th>}
                  {visibleColumns.actions && <th className="p-4 font-semibold w-32 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCustomers.length > 0 ? paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                    {visibleColumns.name && <td className="p-4 font-medium text-gray-900 truncate">{customer.name}</td>}
                    {visibleColumns.email && <td className="p-4 text-gray-600 truncate">{customer.email}</td>}
                    {visibleColumns.phone && <td className="p-4 text-gray-600 truncate">{customer.phone || '-'}</td>}
                    {visibleColumns.address && <td className="p-4 text-gray-600 truncate">{customer.address || '-'}</td>}
                    {visibleColumns.city && <td className="p-4 text-gray-600 truncate">{customer.city || '-'}</td>}
                    {visibleColumns.country && <td className="p-4 text-gray-600 truncate">{customer.country || '-'}</td>}
                    {visibleColumns.totalOrders && <td className="p-4 text-gray-900 font-medium text-center">{customer.orders || 0}</td>}
                    {visibleColumns.totalSpent && <td className="p-4 text-gray-900 font-medium text-right">{formatPrice(customer.totalSpent || 0)}</td>}
                    {visibleColumns.status && (
                      <td className="p-4 text-center">
                        {customer.phone 
                          ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">Registered</span> 
                          : <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">Guest</span>
                        }
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="p-4 text-center">
                        <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)} className="h-8 text-xs">
                          View Details
                        </Button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-500 bg-gray-50/50">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">No customers found</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your search query to find what you're looking for.</p>
                        {searchQuery && (
                          <Button variant="outline" size="sm" className="mt-4 border-gray-200" onClick={resetFilters}>Clear Search</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white text-sm mt-4">
              <div className="text-gray-500">
                Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, processedCustomers.length)}</span> of <span className="font-semibold text-gray-900">{processedCustomers.length}</span> customers
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 border-gray-200"><ChevronLeft className="h-4 w-4" /></Button>
                <div className="px-3 h-8 flex items-center bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </div>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 border-gray-200"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          orders={orders}
          onClose={() => setSelectedCustomer(null)}
          formatPrice={formatPrice}
          updateOrderStatus={updateOrderStatus}
        />
      )}
    </div>
  );
};

export default AdminCustomers;
