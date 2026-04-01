
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listenToCollection, setDocument, deleteDocument, batchWrite, getDocument } from '@/lib/firestoreService';
import { useWooCommerce } from '@/context/WooCommerceContext';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  
  const { syncOrders, syncCustomers, isConnected } = useWooCommerce();

  useEffect(() => {
    const savedUser = localStorage.getItem('shophub_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      const userWishlist = localStorage.getItem(`shophub_wishlist_${parsedUser.id}`);
      if (userWishlist) setWishlist(JSON.parse(userWishlist));

      getDocument('customers', parsedUser.id).then(doc => {
          if(doc && doc.addresses) {
              const dbAddresses = Object.values(doc.addresses);
              dbAddresses.sort((a, b) => (b.isDefault === true ? 1 : 0) - (a.isDefault === true ? 1 : 0));
              setAddresses(dbAddresses);
          }
      });
    } else {
      const guestWishlist = localStorage.getItem('shophub_wishlist_guest');
      if (guestWishlist) setWishlist(JSON.parse(guestWishlist));
    }

    const unsubscribeOrders = listenToCollection('orders', (data) => setOrders(data));
    const unsubscribeCustomers = listenToCollection('customers', (data) => setCustomers(data));

    return () => {
      unsubscribeOrders();
      unsubscribeCustomers();
    }
  }, []);

  const triggerWCAuthSync = () => {
    if (isConnected) {
      syncCustomers().catch(e => console.error("WC Auth Sync Error:", e));
    }
  };

  const triggerWCOrderSync = () => {
    if (isConnected) {
      syncOrders().catch(e => console.error("WC Order Sync Error:", e));
    }
  };

  const updateUser = useCallback(async (userData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...userData };
      localStorage.setItem('shophub_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
    if(userData.id) {
      await setDocument('customers', userData.id, { ...userData, wooCommerceSync: true });
      triggerWCAuthSync();
    }
  }, [isConnected]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('shophub_user', JSON.stringify(user));
      localStorage.setItem(`shophub_wishlist_${user.id}`, JSON.stringify(wishlist));
      localStorage.setItem(`shophub_addresses_${user.id}`, JSON.stringify(addresses));

      const addressesMap = addresses.reduce((acc, addr) => {
        acc[addr.id] = addr;
        return acc;
      }, {});
      setDocument('customers', user.id, { addresses: addressesMap });
    } else {
      localStorage.removeItem('shophub_user');
      localStorage.setItem('shophub_wishlist_guest', JSON.stringify(wishlist));
    }
  }, [user, wishlist, addresses]);

  const login = (email, password) => {
    listenToCollection('access', (accessDocs) => {
      const accessUsers = accessDocs.find(d => d.id === 'users')?.data || [];
      const roles = accessDocs.find(d => d.id === 'roles')?.data || [];
      
      const systemUsers = [
        { id: 'admin-default', name: 'Admin', email: 'admin@example.com', password: 'admin', role: 'admin' },
        ...accessUsers,
      ];

      let foundUser = systemUsers.find(u => u.email === email && u.password === password);
      let loggedInUser;
      if (foundUser) {
          const roleData = roles.find(r => r.id === foundUser.role);
          const isAdmin = foundUser.role === 'admin' || !!roleData?.permissions?.dashboard?.view;
          loggedInUser = { id: foundUser.id, name: foundUser.name, email: foundUser.email, isAdmin, role: foundUser.role };
      } else {
        foundUser = customers.find(c => c.email === email && c.phone === password);
        if (foundUser) {
          loggedInUser = { id: foundUser.id, name: foundUser.name, email: foundUser.email, isAdmin: false, role: 'customer' };
        }
      }

      if (loggedInUser) {
        setUser(loggedInUser);
        const guestWishlistStr = localStorage.getItem('shophub_wishlist_guest');
        const userWishlistStr = localStorage.getItem(`shophub_wishlist_${loggedInUser.id}`);
        const guestWishlist = guestWishlistStr ? JSON.parse(guestWishlistStr) : [];
        const userWishlist = userWishlistStr ? JSON.parse(userWishlistStr) : [];

        if (guestWishlist.length > 0) {
          const mergedWishlist = [...userWishlist];
          guestWishlist.forEach(guestItem => {
            if (!mergedWishlist.some(userItem => userItem.id === guestItem.id)) mergedWishlist.push(guestItem);
          });
          setWishlist(mergedWishlist);
          localStorage.removeItem('shophub_wishlist_guest');
        } else {
          setWishlist(userWishlist);
        }

        getDocument('customers', loggedInUser.id).then(doc => {
            if(doc && doc.addresses) {
                const dbAddrs = Object.values(doc.addresses);
                dbAddrs.sort((a, b) => (b.isDefault === true ? 1 : 0) - (a.isDefault === true ? 1 : 0));
                setAddresses(dbAddrs);
            }
        });

        toast({ title: 'Login Successful!', description: `Welcome back, ${loggedInUser.name}!` });
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
      }
    });
  };

  const logout = () => {
    setUser(null);
    setWishlist([]);
    setAddresses([]);
    localStorage.removeItem('shophub_wishlist_guest');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };

  const signup = async (name, email, password) => {
    const existingCustomer = customers.find(c => c.email === email);
    if (existingCustomer) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: 'An account with this email already exists.' });
      return;
    }
    const newUserId = Date.now().toString();
    const newUser = { id: newUserId, name, email, isAdmin: false, role: 'customer' };
    const newCustomer = { id: newUser.id, name, email, phone: password, totalSpent: 0, orders: 0, lastOrder: null, wooCommerceSync: true };
    await setDocument('customers', newUserId, newCustomer);
    setUser(newUser);
    triggerWCAuthSync();
    toast({ title: 'Signup Successful!', description: `Welcome, ${name}!` });
  };

  const registerFromOrder = async (orderDetails) => {
    const { first_name, last_name, email, phone } = orderDetails;
    let customer = customers.find(c => c.email === email);
    if (!customer) {
      const newCustomerId = `cust-${Date.now()}`;
      customer = { id: newCustomerId, name: `${first_name} ${last_name}`, email, phone, totalSpent: 0, orders: 0, lastOrder: null, wooCommerceSync: true };
      await setDocument('customers', newCustomerId, customer);
      triggerWCAuthSync();
      toast({ title: "Account Created!", description: "Your account has been created. You can log in with your email and phone number as the password." });
    }
    return customer;
  };

  const addOrUpdateOrder = async (orderData) => {
    const newOrder = { ...orderData, trackingId: orderData.trackingId || `TRK${orderData.id}`, wooCommerceSync: true };
    await setDocument('orders', newOrder.id, newOrder);

    if (newOrder.userId) {
      const customerDoc = await getDocument('customers', newOrder.userId);
      if (customerDoc) {
        await setDocument('customers', newOrder.userId, {
          totalSpent: (customerDoc.totalSpent || 0) + newOrder.total,
          orders: (customerDoc.orders || 0) + 1,
          lastOrder: newOrder.date,
          wooCommerceSync: true
        });
      }
    }
    triggerWCOrderSync();
    return newOrder;
  };

  const addImportedOrders = async (importedOrders) => {
    const ops = importedOrders.map(o => {
      const id = o.id || `imported-${Date.now()}-${Math.random()}`;
      return {
        type: 'set', collection: 'orders', id,
        data: { ...o, id, total: parseFloat(o.total) || 0, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, shippingAddress: typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress, wooCommerceSync: true }
      }
    });
    await batchWrite(ops);
    triggerWCOrderSync();
  };

  const getOrdersByUserId = (userId) => {
    if (!userId) return [];
    return orders.filter(o => o.userId === userId);
  }

  const getOrderById = (orderId) => orders.find(o => o.id === orderId);

  const updateOrderStatus = async (orderId, status) => {
    await setDocument('orders', orderId, { status, wooCommerceSync: true });
    triggerWCOrderSync();
  };

  const deleteMultipleOrders = async (orderIds) => {
    const ops = orderIds.map(id => ({ type: 'delete', collection: 'orders', id }));
    await batchWrite(ops);
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.id === product.id);
      if (isInWishlist) {
        toast({ title: 'Removed from Wishlist' });
        return prev.filter(item => item.id !== product.id);
      } else {
        toast({ title: 'Added to Wishlist!' });
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
    toast({ title: 'Removed from Wishlist' });
  };

  const addOrUpdateAddress = (address) => {
    setAddresses(prev => {
      let updated = [...prev];
      if (address.isDefault || updated.length === 0) {
        address.isDefault = true;
        updated = updated.map(a => ({ ...a, isDefault: false }));
      }
      const existingIndex = updated.findIndex(a => a.id === address.id);
      if (existingIndex > -1) updated[existingIndex] = address;
      else updated.push({ ...address, id: address.id || `addr-${Date.now()}` });
      return updated.sort((a, b) => (b.isDefault === true ? 1 : 0) - (a.isDefault === true ? 1 : 0));
    });
  };

  const deleteAddress = (addressId) => {
    setAddresses(prev => {
      let updated = prev.filter(a => a.id !== addressId);
      if (updated.length > 0 && !updated.some(a => a.isDefault)) updated[0].isDefault = true;
      return updated;
    });
    toast({ title: "Address Removed" });
  };

  const value = {
    user, updateUser, login, logout, signup, registerFromOrder, wishlist, toggleWishlist, removeFromWishlist,
    orders, addOrUpdateOrder, addImportedOrders, getOrderById, getOrdersByUserId, updateOrderStatus,
    deleteMultipleOrders, customers, addresses, addOrUpdateAddress, deleteAddress,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
