
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useProducts } from '@/context/ProductContext';
import { useIntegrations } from '@/context/IntegrationContext';
import { useCheckout } from '@/context/CheckoutContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, ShoppingCart, User, MapPin, Hash, DollarSign, Search, FileUp, FileDown, ChevronsUpDown, Trash, MoreVertical, AlertTriangle, CheckSquare, Calendar as CalendarIcon, Settings2, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv, cn } from '@/lib/utils';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const useGoogleMapsScript = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiKey) {
      setIsLoaded(false);
      return;
    }
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }
    const scriptId = 'google-maps-script-admin';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError(new Error('Failed to load Google Maps script.'));
    document.head.appendChild(script);
  }, [apiKey]);

  return { isLoaded, error };
};

const StaticLocationMap = ({ address, coordinates, isScriptLoaded, scriptError }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (isScriptLoaded && !scriptError && window.google && !map) {
      const geocoder = new window.google.maps.Geocoder();
      const mapOptions = {
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
      };

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      const handleGeocodeResult = (results, status) => {
        if (status === 'OK' && results[0]) {
          newMap.setCenter(results[0].geometry.location);
          new window.google.maps.Marker({
            map: newMap,
            position: results[0].geometry.location,
          });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      };

      if (coordinates && coordinates.lat && coordinates.lng) {
        const latLng = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
        newMap.setCenter(latLng);
        new window.google.maps.Marker({ map: newMap, position: latLng });
      } else if (address) {
        geocoder.geocode({ address: address }, handleGeocodeResult);
      }
    }
  }, [isScriptLoaded, scriptError, map, address, coordinates]);

  if (!isScriptLoaded || scriptError) {
    return (
      <div className="flex items-center justify-center p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 mt-4">
        <AlertTriangle className="w-5 h-5 mr-3" />
        <span className="text-sm">Google Maps could not be loaded.</span>
      </div>
    );
  }

  return <div ref={mapRef} style={{ height: '200px', width: '100%', borderRadius: '0.5rem' }} className="mt-4"></div>;
};

const CustomerInfo = ({ order }) => {
  const { first_name, last_name, email, phone, address_1, city, country } = order.shippingAddress || {};
  const fullName = `${first_name || ''} ${last_name || ''}`.trim();
  const fullAddress = [address_1, city, country].filter(Boolean).join(', ');

  return (
    <div className="text-sm">
      <p className="font-semibold text-gray-900">{fullName || order.customer || 'Guest'}</p>
      {email && <p className="text-gray-600">{email}</p>}
      {phone && <p className="text-gray-600">{phone}</p>}
      {fullAddress && <p className="text-gray-600">{fullAddress}</p>}
    </div>
  );
};

const OrderProducts = ({ items, formatPrice }) => {
  const { getProductByWcId, getProductById } = useProducts();

  return (
    <div className="space-y-2">
      {(items || []).map((item, index) => {
        const product = getProductByWcId(item.product_id) || getProductById(item.product_id) || getProductById(item.id);
        const imageUrl = item.image?.src || item.image || product?.images?.[0] || 'https://images.unsplash.com/photo-1571302171879-0965db383dc4';

        return (
          <div key={index} className="flex items-start gap-3 text-sm">
            <div className="w-8 h-8 rounded-md bg-gray-100 flex-shrink-0 mt-0.5 border border-gray-100">
              <img className="w-full h-full object-cover rounded-md" alt={item.name} src={imageUrl} />
            </div>
            <div>
              <p className="font-medium leading-tight text-gray-900">{item.name} <span className="text-gray-500 font-normal">x{item.quantity}</span></p>
              <p className="text-xs text-gray-500">{formatPrice(item.price)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OrderModal = ({ isOpen, onClose, order, formatPrice, checkoutSettings }) => {
  const { isLoaded: isMapScriptLoaded, error: mapScriptError } = useGoogleMapsScript(
    checkoutSettings.enableGoogleMaps ? checkoutSettings.googleMapsApiKey : null
  );

  if (!isOpen || !order) return null;

  const getOrderStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'out for delivery': return 'bg-orange-100 text-orange-700';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': case 'failed': case 'refunded': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  const fullAddress = [order.shippingAddress?.address_1, order.shippingAddress?.city, order.shippingAddress?.country].filter(Boolean).join(', ');
  const showMap = checkoutSettings.enableGoogleMaps && checkoutSettings.googleMapsApiKey && (fullAddress || order.shippingAddress?.mapCoordinates);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-purple-600" />Order Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-6 w-6" /></Button>
          </div>
          <div className="overflow-y-auto p-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2"><Hash className="h-5 w-5" />Order #{order.wc_id || order.id}</h3>
                  <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getOrderStatusColor(order.status)}`}>{order.status}</span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-gray-500" /><div><span className="font-semibold">Total:</span> {formatPrice(order.total)}</div></div>
                  <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-gray-500" /><div><span className="font-semibold">Source:</span> {order.sourceStoreName || 'Local Store'}</div></div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><h3 className="text-lg font-bold">Customer & Shipping Details</h3></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {checkoutSettings.checkoutFields.map(field => {
                    if (field.enabled && field.displayInOrderDetails && order.shippingAddress?.[field.name]) {
                      return (
                        <div key={field.id}>
                          <p className="font-semibold text-gray-500">{field.label}</p>
                          <p className="text-gray-900">{String(order.shippingAddress[field.name])}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                  {showMap && (
                    <div>
                      <p className="font-semibold text-gray-500 mt-4">Delivery Location</p>
                      <StaticLocationMap
                        address={fullAddress}
                        coordinates={order.shippingAddress?.mapCoordinates}
                        isScriptLoaded={isMapScriptLoaded}
                        scriptError={mapScriptError}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><h3 className="text-lg font-bold">Items</h3></CardHeader>
                <CardContent>
                  <ul className="divide-y">
                    {(order.items || []).map((item, index) => (
                      <li key={index} className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        {item.price && <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="p-6 border-t bg-gray-50 text-right">
            <Button onClick={onClose}>Close</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const defaultVisibleColumns = {
  order: true,
  reference: false,
  status: true,
  shipTo: true,
  payment: false,
  actions: true,
  date: true,
  deliveryStatus: false,
  billing: false,
  itemsAndNotes: true,
  total: true,
};

const datePresets = [
  { label: 'Today', getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: 'Yesterday', getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: 'This Week', getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
  { label: 'Last 7 Days', getValue: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: 'Last 14 Days', getValue: () => ({ from: startOfDay(subDays(new Date(), 13)), to: endOfDay(new Date()) }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Last Month', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'Last 30 Days', getValue: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
];

const AdminOrders = () => {
  const { orders: localOrders, updateOrderStatus: updateLocalOrderStatus, deleteMultipleOrders, addImportedOrders } = useUser();
  const { formatPrice } = useProducts();
  const { syncedOrders, updateWcOrderStatus } = useIntegrations();
  const { settings: checkoutSettings } = useCheckout();
  const { toast } = useToast();
  
  // State for Table and Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const fileInputRef = useRef(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  
  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, statusFilter, itemsPerPage]);

  const allOrders = useMemo(() => {
    const ordersMap = new Map();
    localOrders.forEach(order => ordersMap.set(order.id, order));
    syncedOrders.forEach(order => ordersMap.set(order.id, order));
    return Array.from(ordersMap.values());
  }, [localOrders, syncedOrders]);

  const updateOrderStatus = (order, newStatus) => {
    if (!order) return;

    if (order.sourceStoreName && order.sourceStoreName !== 'Local Store') {
      updateWcOrderStatus(order, newStatus);
    } else {
      updateLocalOrderStatus(order.id, newStatus);
    }
  };

  const getCustomerName = (order) => {
    if (order.customer) return order.customer;
    if (order.shippingAddress) return `${order.shippingAddress.first_name || ''} ${order.shippingAddress.last_name || ''}`.trim() || 'Guest';
    return "Guest";
  };

  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    return allOrders.filter(order => {
      if (!order) return false;
      
      let matchesSearch = true;
      if (lowerQuery) {
        matchesSearch = (() => {
          if ((order.wc_id || '').toString().toLowerCase().includes(lowerQuery)) return true;
          if ((order.id || '').toString().toLowerCase().includes(lowerQuery)) return true;
          if ((order.transactionId || '').toLowerCase().includes(lowerQuery)) return true;
          if (getCustomerName(order).toLowerCase().includes(lowerQuery)) return true;
          if ((order.billingAddress?.first_name || '').toLowerCase().includes(lowerQuery)) return true;
          if ((order.billingAddress?.last_name || '').toLowerCase().includes(lowerQuery)) return true;
          if ((order.shippingAddress?.email || '').toLowerCase().includes(lowerQuery)) return true;
          if ((order.billingAddress?.email || '').toLowerCase().includes(lowerQuery)) return true;
          const phones = [order.phone, order.customerPhone, order.shippingAddress?.phone, order.billingAddress?.phone].filter(Boolean).join(' ').toLowerCase();
          if (phones.includes(lowerQuery)) return true;
          const addressParts = [
            order.shippingAddress?.address_1, order.shippingAddress?.address_2,
            order.shippingAddress?.city, order.shippingAddress?.state,
            order.shippingAddress?.country, order.shippingAddress?.postcode,
            order.billingAddress?.address_1, order.billingAddress?.address_2,
            order.billingAddress?.city, order.billingAddress?.state,
            order.billingAddress?.country, order.billingAddress?.postcode,
          ].filter(Boolean).join(' ').toLowerCase();
          if (addressParts.includes(lowerQuery)) return true;
          if (order.items && order.items.length > 0) {
            if (order.items.some(item => (item.name || '').toLowerCase().includes(lowerQuery))) return true;
          }
          if ((order.notes || order.customerNote || '').toLowerCase().includes(lowerQuery)) return true;
          return false;
        })();
      }

      if (!matchesSearch) return false;

      if (statusFilter !== 'all' && (order.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (dateRange?.from) {
        const orderDate = new Date(order.date);
        const start = startOfDay(dateRange.from);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(orderDate, { start, end })) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allOrders, searchQuery, statusFilter, dateRange]);

  const paginatedOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const resetFilters = () => {
    setSearchQuery('');
    setDateRange({ from: undefined, to: undefined });
    setStatusFilter('all');
    setVisibleColumns(defaultVisibleColumns);
    setItemsPerPage(50);
    setCurrentPage(1);
    setSelectedOrders([]);
  };

  const prepareExportData = (ordersList) => {
    const data = [];
    ordersList.forEach(order => {
      const customerName = getCustomerName(order);
      const addressParts = [
        order.shippingAddress?.address_1 || order.shippingAddress?.street || order.shippingAddress?.addressLine1,
        order.shippingAddress?.address_2,
        order.shippingAddress?.postcode || order.shippingAddress?.postalCode || order.shippingAddress?.zipCode
      ].filter(Boolean);
      const fullAddress = addressParts.join(', ') || '';
      const baseData = {
        'Order ID': order.wc_id || order.id,
        'Order Date': new Date(order.date).toLocaleString(),
        'Order Status': order.status,
        'Order Total Amount': order.total,
        'Customer Full Name': customerName,
        'Customer Email': order.shippingAddress?.email || '',
        'Customer Phone Number': order.phone || order.customerPhone || order.shippingAddress?.phone || '',
        'Customer City': order.shippingAddress?.city || '',
        'Full Address': fullAddress,
        'Landmark/Nearest Address': order.shippingAddress?.landmark || order.shippingAddress?.nearestAddress || order.shippingAddress?.nearest_landmark || '',
        'Order Notes': order.notes || order.customerNote || order.specialInstructions || '',
      };
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          data.push({
            ...baseData,
            'Products': `${item.name || 'Unknown Product'} x ${item.quantity || 1}`,
            'Product Price': item.price || 0,
            'Product Total Price': (item.price || 0) * (item.quantity || 1),
          });
        });
      } else {
        data.push({ ...baseData, 'Products': '', 'Product Price': '', 'Product Total Price': '' });
      }
    });
    return data;
  };

  const handleExport = () => {
    if (!allOrders || allOrders.length === 0) {
      toast({ variant: 'destructive', title: 'No orders to export', description: 'There are currently no orders in the system.' });
      return;
    }
    try {
      const exportData = prepareExportData(allOrders);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `orders_${timestamp}`;
      if (exportFormat === 'csv') downloadCsv(exportData, `${filename}.csv`);
      else if (exportFormat === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${filename}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } else if (exportFormat === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      }
      toast({ title: `Orders exported successfully! ✨`, description: `Exported as ${exportFormat.toUpperCase()} format.` });
    } catch (error) {
      console.error("Export error:", error);
      toast({ variant: "destructive", title: "Export Failed", description: error.message });
    }
  };

  const handleExportSelected = () => {
    if (selectedOrders.length === 0) return;
    try {
      const ordersToExport = allOrders.filter(o => selectedOrders.includes(o.id));
      const data = prepareExportData(ordersToExport);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `orders_${timestamp}`;
      if (exportFormat === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else downloadCsv(data, `${filename}.csv`);
      toast({ title: "Selected orders exported successfully! ✨" });
      setSelectedOrders([]); 
    } catch (error) {
      console.error("Export error:", error);
      toast({ variant: "destructive", title: "Export Failed", description: error.message });
    }
  };

  const handleExportSingleOrder = (order) => {
    try {
      const data = prepareExportData([order]);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `orders_${timestamp}`;
      if (exportFormat === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else downloadCsv(data, `${filename}.csv`);
      toast({ title: "Order exported successfully! ✨" });
    } catch (error) {
      console.error("Export error:", error);
      toast({ variant: "destructive", title: "Export Failed", description: error.message });
    }
  };

  const handleImportClick = () => fileInputRef.current.click();

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast({ variant: "destructive", title: "No file selected", description: "Please choose a CSV file to import." });
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        addImportedOrders(results.data);
        toast({ title: "Orders imported successfully! ✨", description: `${results.data.length} orders added.` });
      },
      error: (error) => {
        toast({ variant: "destructive", title: "Import Failed", description: `Error parsing CSV: ${error.message}` });
      }
    });
    event.target.value = null;
  };

  const getOrderStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'out for delivery': return 'bg-orange-100 text-orange-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': case 'failed': case 'refunded': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const handleSelectAll = (checked) => setSelectedOrders(checked ? paginatedOrders.map(o => o.id) : []);
  const handleSelectOrder = (id, checked) => setSelectedOrders(prev => checked ? [...prev, id] : prev.filter(oId => oId !== id));

  const handleBulkStatusUpdate = (status) => {
    if (selectedOrders.length === 0) return;
    selectedOrders.forEach(id => {
      const order = allOrders.find(o => o.id === id);
      updateOrderStatus(order, status);
    });
    toast({ title: `Updated ${selectedOrders.length} orders to "${status}".` });
    setSelectedOrders([]);
  };

  const handleBulkDelete = () => {
    deleteMultipleOrders(selectedOrders);
    toast({ title: `${selectedOrders.length} orders deleted.` });
    setSelectedOrders([]);
  };

  const isAllSelected = paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length;
  const orderStatuses = ['pending', 'processing', 'out for delivery', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];

  const handleColumnToggle = (colKey) => setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }));

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
      </div>

      <Card className="mb-6 shadow-sm border-gray-200">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/40">
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search orders, customers, items..." className="pl-10 h-10 bg-white border-gray-200" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-10 justify-start text-left font-normal bg-white border-gray-200", !dateRange.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 flex" align="start">
                <div className="border-r p-3 w-40 flex flex-col gap-1 bg-gray-50">
                  {datePresets.map((preset) => (
                    <Button key={preset.label} variant="ghost" className="justify-start font-normal text-sm h-8" onClick={() => setDateRange(preset.getValue())}>{preset.label}</Button>
                  ))}
                </div>
                <div className="p-3">
                  <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                </div>
              </PopoverContent>
            </Popover>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-10 bg-white border-gray-200 capitalize">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                          <Checkbox id={`col-${col}`} checked={visibleColumns[col]} onCheckedChange={() => handleColumnToggle(col)} />
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
                      <Input type="number" min="1" max="500" className="w-20 h-8" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value) || 50)} />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" onClick={resetFilters} className="h-10 text-muted-foreground hover:text-foreground hover:bg-gray-200">
              <FilterX className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 space-y-0 py-4 border-b">
          <div className="flex flex-wrap items-center gap-4 justify-between w-full">
            <div className="text-sm text-muted-foreground font-medium">
              Showing {filteredOrders.length} order(s)
            </div>

            <div className="flex items-center gap-3">
              <AnimatePresence>
                {selectedOrders.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-primary flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                      <CheckSquare className="w-4 h-4" /> {selectedOrders.length} selected
                    </span>
                    <Button variant="default" onClick={handleExportSelected} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                      <FileDown className="mr-2 h-4 w-4" /> Export Selected
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" disabled={selectedOrders.length === 0}>Bulk Actions <ChevronsUpDown className="ml-2 h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        {orderStatuses.map(status => (
                          <DropdownMenuItem key={status} onClick={() => handleBulkStatusUpdate(status)} className="capitalize">Set to {status}</DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild><DropdownMenuItem onSelect={e => e.preventDefault()} className="text-red-600">Delete Selected</DropdownMenuItem></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedOrders.length} orders.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                )}
              </AnimatePresence>

              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
              <Button variant="outline" onClick={handleImportClick} className="border-gray-200"><FileUp className="mr-2 h-4 w-4" /> Import</Button>

              <div className="flex items-center gap-2 border-l pl-3 ml-1">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-[90px] h-10 border-gray-200">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExport} className="hover:bg-accent h-10 border-gray-200">
                  <FileDown className="mr-2 h-4 w-4" /> Export All
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white rounded-b-lg overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm text-left table-fixed min-w-[1200px]">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b">
                <tr>
                  <th className="px-4 py-3 w-12 text-center align-middle">
                    <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} id="select-all-header" className="border-gray-400" />
                  </th>
                  {visibleColumns.order && <th className="px-4 py-3 font-semibold text-gray-600 w-24">Order</th>}
                  {visibleColumns.reference && <th className="px-4 py-3 font-semibold text-gray-600 w-32">Reference</th>}
                  {visibleColumns.date && <th className="px-4 py-3 font-semibold text-gray-600 w-44">Date</th>}
                  {visibleColumns.shipTo && <th className="px-4 py-3 font-semibold text-gray-600 w-56">Ship To</th>}
                  {visibleColumns.billing && <th className="px-4 py-3 font-semibold text-gray-600 w-56">Billing</th>}
                  {visibleColumns.itemsAndNotes && <th className="px-4 py-3 font-semibold text-gray-600 w-72">Items & Notes</th>}
                  {visibleColumns.payment && <th className="px-4 py-3 font-semibold text-gray-600 w-32">Payment</th>}
                  {visibleColumns.total && <th className="px-4 py-3 font-semibold text-gray-600 text-right w-28">Total</th>}
                  {visibleColumns.status && <th className="px-4 py-3 font-semibold text-gray-600 text-center w-32">Status</th>}
                  {visibleColumns.deliveryStatus && <th className="px-4 py-3 font-semibold text-gray-600 text-center w-32">Delivery</th>}
                  {visibleColumns.actions && <th className="px-4 py-3 font-semibold text-gray-600 text-center w-48">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
                  <tr key={order.id} className={cn("hover:bg-gray-50 transition-colors group relative", selectedOrders.includes(order.id) && "bg-primary/5")}>
                    <td className="px-4 py-4 text-center align-top">
                      <Checkbox onCheckedChange={(checked) => handleSelectOrder(order.id, checked)} checked={selectedOrders.includes(order.id)} id={`select-order-${order.id}`} className="border-gray-300" />
                    </td>
                    
                    {visibleColumns.order && <td className="px-4 py-4 align-top font-medium text-gray-900 whitespace-nowrap">#{order.wc_id || order.id}</td>}
                    {visibleColumns.reference && <td className="px-4 py-4 align-top text-gray-500 overflow-hidden text-ellipsis">{order.transactionId || '-'}</td>}
                    {visibleColumns.date && <td className="px-4 py-4 align-top text-gray-600 whitespace-nowrap">{format(new Date(order.date), "MMM d, yyyy h:mm a")}</td>}
                    {visibleColumns.shipTo && <td className="px-4 py-4 align-top"><CustomerInfo order={order} /></td>}
                    {visibleColumns.billing && <td className="px-4 py-4 align-top text-gray-600">{order.billingAddress ? <><p>{order.billingAddress.first_name} {order.billingAddress.last_name}</p><p className="text-xs">{order.billingAddress.city}, {order.billingAddress.country}</p></> : 'Same as shipping'}</td>}
                    {visibleColumns.itemsAndNotes && <td className="px-4 py-4 align-top"><OrderProducts items={order.items} formatPrice={formatPrice} />{(order.notes || order.customerNote) && <div className="mt-2 text-xs bg-yellow-50 p-2 rounded border border-yellow-100 text-yellow-800 break-words"><strong>Note:</strong> {order.notes || order.customerNote}</div>}</td>}
                    {visibleColumns.payment && <td className="px-4 py-4 align-top text-gray-600 capitalize">{order.paymentMethod || '-'}</td>}
                    {visibleColumns.total && <td className="px-4 py-4 align-top font-medium text-right text-gray-900 whitespace-nowrap">{formatPrice(order.total)}</td>}
                    {visibleColumns.status && <td className="px-4 py-4 align-top text-center"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap ${getOrderStatusColor(order.status)}`}>{order.status}</span></td>}
                    {visibleColumns.deliveryStatus && <td className="px-4 py-4 align-top text-center"><span className="px-2 py-1 text-xs rounded border bg-white text-gray-700 whitespace-nowrap">{order.deliveryStatus || 'Pending'}</span></td>}

                    {visibleColumns.actions && (
                      <td className="px-4 py-4 align-top text-center">
                        <div className="flex justify-center items-center gap-1.5 min-h-[32px] transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-xs font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-1"
                              >
                                {order.status} <ChevronsUpDown className="h-3 w-3 opacity-60" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 z-[110]">
                              {orderStatuses.map(status => (
                                <DropdownMenuItem key={status} onSelect={() => updateOrderStatus(order, status)} className="capitalize cursor-pointer">
                                  {status}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-xs font-medium border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 z-[110]">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => handleExportSingleOrder(order)}>
                                <FileDown className="mr-2 h-4 w-4 opacity-70" /> Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 cursor-pointer focus:text-red-500" disabled={!!order.sourceStoreName && order.sourceStoreName !== 'Local Store'}>
                                    <Trash className="mr-2 h-4 w-4 opacity-70" /> Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete this order. This action cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteMultipleOrders([order.id])} className="bg-red-600 hover:bg-red-700 text-white border-none">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-gray-500 bg-gray-50/50">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">No orders found</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your search query, status, or date range filters to find what you're looking for.</p>
                        {(searchQuery || statusFilter !== 'all' || dateRange.from) && (
                          <Button variant="outline" size="sm" className="mt-4 border-gray-200" onClick={resetFilters}>Clear All Filters</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-white text-sm">
              <div className="text-gray-500">
                Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-semibold text-gray-900">{filteredOrders.length}</span> orders
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
      <OrderModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} order={selectedOrder} formatPrice={formatPrice} checkoutSettings={checkoutSettings} />
    </div>
  );
};

export default AdminOrders;
