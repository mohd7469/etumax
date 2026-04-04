import React, { createContext, useContext, useState, useEffect } from 'react';
import { listenToDocument, setDocument, getDocument } from '@/lib/firestoreService';
import { logOrderCreation } from '@/lib/orderLogger';
import { syncNewOrderToWooCommerce } from '@/lib/orderSyncService';
import { queueOrderForRetry } from '@/lib/orderSyncRetryService';
import { useWooCommerce } from './WooCommerceContext';

const CheckoutContext = createContext();

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

const initialCheckoutSettings = {
  enableCreditCard: false,
  enableCashOnDelivery: true,
  deliveryCharge: 0,
  freeShippingThreshold: 500,
  enableGoogleMaps: true,
  googleMapsApiKey: '',
checkoutFields: [
  { id: 'first_name', type: 'text', name: 'first_name', label: 'Full Name', placeholder: 'John Deo', defaultValue: '', class: 'form-row-first', validation: [], required: true, enabled: true, displayInEmails: true, displayInOrderDetails: true, options: [] },
  { id: 'email', type: 'email', name: 'email', label: 'Email Address', placeholder: 'your.email@example.com', defaultValue: '', class: 'form-row-last', validation: ['email'], required: true, enabled: true, displayInEmails: true, displayInOrderDetails: true, options: [] },
  { id: 'phone', type: 'tel', name: 'phone', label: 'Phone', placeholder: 'Your phone number', defaultValue: '', class: 'form-row-first', validation: ['phone'], required: true, enabled: true, displayInEmails: true, displayInOrderDetails: true, options: [] },
  { id: 'city', type: 'dropdown', name: 'city', label: 'City', placeholder: 'Select a city', defaultValue: '', class: 'form-row-last', validation: [], required: true, enabled: true, displayInEmails: true, displayInOrderDetails: true, options: [] },
  { id: 'address_1', type: 'text', name: 'address_1', label: 'Address', placeholder: 'Address, street, hotel, building', defaultValue: '', class: 'form-row-wide', validation: [], required: true, enabled: true, displayInEmails: true, displayInOrderDetails: true, options: [] },
  { id: 'address_2', type: 'text', name: 'address_2', label: 'Apartment, Suite, etc (optional)', placeholder: 'Apartment, suite, floor, landmark', defaultValue: '', class: 'form-row-wide', validation: [], required: false, enabled: true, displayInEmails: true, displayInOrderDetails: true, options: [] },
  { id: 'order_notes', type: 'textarea', name: 'order_notes', label: 'Order Notes (optional)', placeholder: 'Notes about your order.', defaultValue: '', class: 'form-row-wide', validation: [], required: false, enabled: true, displayInEmails: true, displayInOrderDetails: true, options: [] }
]
};

export const CheckoutProvider = ({ children }) => {
  const [settings, setSettings] = useState(initialCheckoutSettings);
  const { isConnected, credentials } = useWooCommerce();

  useEffect(() => {
    const unsub = listenToDocument('settings', 'checkout', (data) => {
      if (data && data.default) {
        setSettings(prev => ({
          ...prev,
          ...data.default,
          // Ensure we parse numbers correctly, fallback if empty
          deliveryCharge: data.default.deliveryCharge !== undefined && data.default.deliveryCharge !== '' ? parseFloat(data.default.deliveryCharge) : 0,
          freeShippingThreshold: data.default.freeShippingThreshold !== undefined && data.default.freeShippingThreshold !== '' ? parseFloat(data.default.freeShippingThreshold) : Infinity
        }));
      }
    });

    return () => { unsub(); };
  }, []);

  const saveSettings = async (newSettings) => {
    // Save all checkout settings including shipping under settings/checkout
    await setDocument('settings', 'checkout', { default: newSettings });
  };

  const resetSettings = async () => {
    await setDocument('settings', 'checkout', { default: initialCheckoutSettings });
  };

  const validateCheckoutFields = formData => {
    const errors = {};
    settings.checkoutFields.forEach(field => {
      if (field.required && field.enabled) {
        const value = formData[field.name];
        if (!value || value.trim?.() === '') {
          errors[field.name] = `${field.label} is required`;
        }
      }
    });
    return errors;
  };

  const processOrder = async (orderData) => {
    try {
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Cannot process order with empty items');
      }

      const newOrder = {
        ...orderData,
        syncStatus: isConnected ? 'syncing' : 'pending',
        syncAttempt: 0,
        createdAt: new Date().toISOString()
      };
      
      const createdOrder = await setDocument('orders', newOrder.id, newOrder);
      await logOrderCreation(newOrder.id, newOrder);

      if (isConnected) {
        syncNewOrderToWooCommerce(newOrder, { isConnected, credentials })
          .then(async (result) => {
            if (!result.success) {
              await queueOrderForRetry(newOrder.id, new Error(result.error), 0);
            }
          })
          .catch(async (err) => {
            console.error("Async sync wrapper error:", err);
            await queueOrderForRetry(newOrder.id, err, 0);
          });
      }

      return createdOrder;
    } catch (error) {
      console.error("Checkout processing error:", error);
      throw error;
    }
  };

  return (
    <CheckoutContext.Provider value={{ 
      settings, 
      saveSettings, 
      resetSettings, 
      validateCheckoutFields, 
      processOrder,
      initialSettings: initialCheckoutSettings 
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};