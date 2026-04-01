import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Heart, MapPin, LogOut, LogIn, Truck, Edit, Trash, Plus, X, XCircle, RotateCcw, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/products/ProductCard';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import ImageOptimizer from '@/components/ui/ImageOptimizer';

const AddressForm = ({ address, onSave, closeDialog }) => {
  const [formData, setFormData] = useState(address || {
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    type: 'Home',
    isDefault: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, isDefault: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    closeDialog();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="type">Address Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type || 'Home'}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div className="col-span-2">
          <Label htmlFor="addressLine1">Address Line 1</Label>
          <Input id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
        </div>
        <div className="col-span-2">
          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
          <Input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP / Postal Code</Label>
          <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" value={formData.country} onChange={handleChange} required />
        </div>
        <div className="col-span-2 flex items-center space-x-2 mt-2">
          <Checkbox
            id="isDefault"
            checked={formData.isDefault}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="isDefault" className="font-normal cursor-pointer">
            Set as default shipping address
          </Label>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Address</Button>
      </DialogFooter>
    </form>
  );
};

const AccountPage = ({ navigateTo }) => {
  const { user, wishlist, addresses, login, logout, signup, getOrdersByUserId, updateUser, addOrUpdateAddress, deleteAddress, updateOrderStatus } = useUser();
  const { formatPrice } = useProducts();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '' });
  const [userOrders, setUserOrders] = useState([]);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [isAddressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Debug Address Data Flow
  useEffect(() => {
    console.log("AccountPage - Current Addresses State:", addresses);
  }, [addresses]);

  const handleLogin = (e) => {
    e.preventDefault();
    login(loginData.email, loginData.password);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    signup(registerData.name, registerData.email, registerData.password);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateUser(profileData);
    toast({ title: 'Profile Updated', description: 'Your information has been successfully updated.' });
  };

  const handleCancelOrder = (orderId) => {
    updateOrderStatus(orderId, 'cancelled');
    setUserOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    toast({ title: 'Order Cancelled', description: 'Your order has been cancelled successfully.' });
  };

  const handleReorder = (order) => {
    try {
      if (!order.items || order.items.length === 0) {
        toast({ variant: 'destructive', title: "Failed to reorder", description: "No items found in this order." });
        return;
      }

      order.items.forEach(item => {
        addToCart({
          id: item.productId || item.id,
          name: item.name,
          price: item.price,
          images: item.image ? [item.image] : (item.images || []),
          quantity: item.quantity
        }, item.quantity);
      });

      toast({ title: "Order items added to cart successfully" });
      setIsCartOpen(true);
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to reorder", description: error.message });
    }
  };

  useEffect(() => {
    if (user) {
      setUserOrders(getOrdersByUserId(user.id));
      setProfileData({ name: user.name, email: user.email });
    } else {
      setUserOrders([]);
    }
  }, [user, getOrdersByUserId, user?.id]);

  // Redirect admin users
  useEffect(() => {
    if (user && user.isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleAddressSave = (address) => {
    addOrUpdateAddress(address);
    if (editingAddress) {
      toast({ title: "Address Updated", description: "Your address has been saved." });
    } else {
      toast({ title: "Address Added", description: "New address added to your account." });
    }
  };

  const handleSetDefaultAddress = (address) => {
    addOrUpdateAddress({ ...address, isDefault: true });
    toast({ title: "Default Set", description: "Address has been set as your default." });
  };

  if (user && user.isAdmin) return null;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/50 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20"
          >
            <h1 className="text-3xl font-bold mb-6 text-center">
              {showLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-center text-muted-foreground mb-4 text-sm">Guest customer? Use your email and phone number as password to login.</p>

            {showLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <Input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Password / Phone</label>
                  <Input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <Input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone (will be your password)</label>
                  <Input
                    type="tel"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Create Account
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowLogin(!showLogin)}
                className="text-primary hover:underline font-semibold"
              >
                {showLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Account</h1>
          <Button onClick={logout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 sticky top-24 shadow-sm border">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'orders', icon: Package, label: 'Orders' },
                  { id: 'wishlist', icon: Heart, label: 'Wishlist' },
                  { id: 'addresses', icon: MapPin, label: 'Addresses' },
                  { id: 'profile', icon: User, label: 'Profile' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={activeTab}>
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Order History</h2>
                  {userOrders.length === 0 ? (
                    <div className="bg-card rounded-2xl p-12 text-center shadow-sm border">
                      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                      <Button onClick={() => navigateTo('home')}>Start Shopping</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map(order => {
                        const customerName = order.customer || order.user?.name || (order.shippingAddress ? `${order.shippingAddress.first_name || ''} ${order.shippingAddress.last_name || ''}`.trim() : 'Guest Customer');
                        const mobileNumber = order.phone || order.customerPhone || order.shippingAddress?.phone;
                        const notes = order.notes || order.specialInstructions;

                        return (
                          <div key={order.id} className="bg-card rounded-2xl p-6 shadow-sm border">
                            <div className="flex justify-between items-start mb-4 pb-4 border-b">
                              <div>
                                <p className="font-semibold">Order #{order.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.date).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-accent text-accent-foreground'
                                }`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b text-sm">
                              <div>
                                <h4 className="font-semibold mb-1 flex items-center gap-1.5 text-foreground">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  Customer Information
                                </h4>
                                <p className="text-muted-foreground">{customerName}</p>
                                {mobileNumber && (
                                  <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                                    <Phone className="w-3.5 h-3.5" /> {mobileNumber}
                                  </p>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1 flex items-center gap-1.5 text-foreground">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  Delivery Address
                                </h4>
                                {order.shippingAddress ? (
                                  <div className="text-muted-foreground">
                                    <p>{order.shippingAddress.address_1 || order.shippingAddress.street || order.shippingAddress.addressLine1}</p>
                                    <p>
                                      {[
                                        order.shippingAddress.city,
                                        order.shippingAddress.postcode || order.shippingAddress.postalCode || order.shippingAddress.zipCode
                                      ].filter(Boolean).join(', ')}
                                    </p>
                                    <p>{order.shippingAddress.country}</p>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground italic">No address provided</p>
                                )}
                              </div>
                            </div>

                            {notes && (
                              <div className="mb-4 pb-4 border-b">
                                <h4 className="font-semibold mb-2 flex items-center gap-1.5 text-sm text-foreground">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  Order Notes
                                </h4>
                                <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-md italic">
                                  {notes}
                                </p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold text-sm mb-3">Items</h4>
                              <div className="space-y-1">
                                {order.items.map(item => {
                                  const itemLink = `/product/${item.slug || item.productId || item.id}`;
                                  return (
                                    <div key={item.productId || item.id} className="flex items-center gap-3 sm:gap-4 py-3 border-b last:border-b-0 border-border/50">
                                      <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                        <ImageOptimizer
                                          src={item.image?.src || item.image || item.images?.[0]}
                                          alt={`Image of ${item.name || 'product'}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <Link
                                          to={itemLink}
                                          className="text-sm font-medium text-foreground hover:text-blue-600 hover:underline transition-colors truncate"
                                          title={item.name}
                                        >
                                          {item.name}
                                        </Link>
                                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                          x{item.quantity}
                                        </span>
                                      </div>
                                      <div className="text-right text-sm font-semibold whitespace-nowrap ml-2">
                                        {formatPrice(item.price * item.quantity)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                              <div>
                                <span className="font-semibold">Total: </span>
                                <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(order.status === 'pending' || order.status === 'processing') && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to cancel this order? This action cannot be undone.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCancelOrder(order.id)} className="bg-red-600 hover:bg-red-700">Cancel Order</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReorder(order)}
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Reorder
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => navigate(`/track-order?trackingId=${order.trackingId || `TRK${order.id}`}`)}
                                >
                                  <Truck className="w-4 h-4 mr-2" />
                                  Track Order
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">My Wishlist ({wishlist.length})</h2>
                  {wishlist.length === 0 ? (
                    <div className="bg-card rounded-2xl p-12 text-center shadow-sm border">
                      <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground mb-4">Your wishlist is empty. Add some products!</p>
                      <Button onClick={() => navigateTo('home')}>Discover Products</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {wishlist.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          navigateTo={navigateTo}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold">Saved Addresses</h2>
                    <Button onClick={() => { setEditingAddress(null); setAddressDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                  {(!addresses || addresses.length === 0) ? (
                    <div className="bg-card rounded-2xl p-12 text-center shadow-sm border">
                      <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground mb-4">You have no saved addresses.</p>
                      <Button variant="outline" onClick={() => { setEditingAddress(null); setAddressDialogOpen(true); }}>
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div key={address.id} className={`bg-card p-6 rounded-lg shadow-sm border flex flex-col relative ${address.isDefault ? 'border-primary ring-1 ring-primary' : ''}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 pr-16">
                              <p className="font-semibold text-lg">{address.fullName}</p>
                              {address.type && <Badge variant="secondary" className="text-xs">{address.type}</Badge>}
                            </div>
                            {address.isDefault && (
                              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground pointer-events-none">Default</Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground text-sm flex-grow mt-2 space-y-1">
                            {address.phone && <p className="font-medium text-foreground mb-2 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {address.phone}</p>}
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t flex flex-wrap justify-end items-center gap-2">
                            {!address.isDefault && (
                              <Button variant="outline" size="sm" className="mr-auto" onClick={() => handleSetDefaultAddress(address)}>
                                Set Default
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => { setEditingAddress(address); setAddressDialogOpen(true); }}>
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Trash className="w-4 h-4 mr-1" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to delete this address? This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteAddress(address.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="bg-card rounded-2xl p-8 space-y-6 shadow-sm border">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Name</label>
                        <Input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </div>

                  {addresses && addresses.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Primary Shipping Address</h2>
                      <div className="bg-card rounded-2xl p-6 shadow-sm border">
                        <div className="flex items-start gap-4">
                          <MapPin className="w-5 h-5 mt-1 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{addresses[0].fullName}</p>
                              {addresses[0].type && <Badge variant="secondary" className="text-xs">{addresses[0].type}</Badge>}
                              <Badge variant="outline" className="text-xs border-primary text-primary">Default</Badge>
                            </div>
                            {addresses[0].phone && <p className="text-sm font-medium mt-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {addresses[0].phone}</p>}
                            <p className="text-muted-foreground mt-2 text-sm">{addresses[0].addressLine1}</p>
                            {addresses[0].addressLine2 && <p className="text-muted-foreground text-sm">{addresses[0].addressLine2}</p>}
                            <p className="text-muted-foreground text-sm">{addresses[0].city}, {addresses[0].state} {addresses[0].zipCode}</p>
                            <p className="text-muted-foreground text-sm">{addresses[0].country}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <Button variant="outline" size="sm" onClick={() => setActiveTab('addresses')}>
                            Manage Addresses
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Dialog open={isAddressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <AddressForm address={editingAddress} onSave={handleAddressSave} closeDialog={() => setAddressDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountPage;