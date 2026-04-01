import { createWooCommerceOrder, updateWooCommerceOrder, fetchWooCommerceOrders } from './woocommerceService';
import { logOrderSync, logOrderSyncError } from './orderLogger';
import { updateDocument } from './firestoreService';

export const syncNewOrderToWooCommerce = async (firestoreOrder, wooCommerceConfig) => {
  try {
    if (!wooCommerceConfig?.isConnected) {
      throw new Error('WooCommerce is not connected');
    }

    const { storeUrl, consumerKey, consumerSecret } = wooCommerceConfig.credentials;

    const billing = {
      first_name: firestoreOrder.shippingAddress?.first_name || '',
      last_name: firestoreOrder.shippingAddress?.last_name || '',
      address_1: firestoreOrder.shippingAddress?.address_1 || '',
      city: firestoreOrder.shippingAddress?.city || '',
      email: firestoreOrder.shippingAddress?.email || '',
      phone: firestoreOrder.shippingAddress?.phone || '',
      country: firestoreOrder.shippingAddress?.country || 'AE'
    };

    const line_items = (firestoreOrder.items || []).map(item => {
      const isCustomWcId = typeof item.wc_id === 'string' && item.wc_id.startsWith('wc_prod_');
      const productId = isCustomWcId ? parseInt(item.wc_id.replace('wc_prod_', '')) : parseInt(item.wc_id) || 0;
      
      return {
        product_id: productId,
        quantity: item.quantity,
        total: String(item.price * item.quantity),
        name: productId === 0 ? item.name : undefined
      };
    });

    let payment_method = 'cod';
    let payment_method_title = 'Cash on Delivery';
    
    if (firestoreOrder.paymentMethod === 'card') {
      payment_method = 'stripe';
      payment_method_title = 'Credit Card';
    }

    const wcStatusMap = {
      'pending': 'pending',
      'processing': 'processing',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };

    const wcData = {
      payment_method,
      payment_method_title,
      set_paid: firestoreOrder.paymentMethod === 'card',
      billing,
      shipping: billing,
      line_items,
      status: wcStatusMap[firestoreOrder.status] || 'pending',
      customer_note: firestoreOrder.shippingAddress?.order_notes || '',
      meta_data: [
        { key: '_firestore_order_id', value: firestoreOrder.id },
        { key: '_sync_source', value: 'shophub_app' }
      ]
    };

    if (firestoreOrder.shippingCost > 0) {
      wcData.shipping_lines = [
        {
          method_id: 'flat_rate',
          method_title: 'Standard Shipping',
          total: String(firestoreOrder.shippingCost)
        }
      ];
    }
    
    if (firestoreOrder.discount > 0 && firestoreOrder.couponCode) {
       wcData.coupon_lines = [
           { code: firestoreOrder.couponCode, discount: String(firestoreOrder.discount) }
       ];
    }

    const response = await createWooCommerceOrder(storeUrl, consumerKey, consumerSecret, wcData);
    
    if (!response || !response.id) {
      throw new Error('Invalid response from WooCommerce API');
    }

    await logOrderSync(firestoreOrder.id, response.id, 'success', 'Order synced successfully');
    
    // Update local order document with WC ID
    await updateDocument('orders', firestoreOrder.id, {
      wooCommerceOrderId: String(response.id),
      syncStatus: 'synced',
      syncError: null
    });

    return {
      success: true,
      wooCommerceOrderId: String(response.id)
    };

  } catch (error) {
    await logOrderSyncError(firestoreOrder.id, error, firestoreOrder.syncAttempt || 1);
    await updateDocument('orders', firestoreOrder.id, {
      syncStatus: 'failed',
      syncError: error.message
    });
    return {
      success: false,
      error: error.message
    };
  }
};

export const syncOrderStatusUpdate = async (firestoreOrderId, newStatus, wooCommerceConfig) => {
  try {
    if (!wooCommerceConfig?.isConnected) return false;
    const { storeUrl, consumerKey, consumerSecret } = wooCommerceConfig.credentials;

    // First update local firestore order status
    const orderDoc = await updateDocument('orders', firestoreOrderId, { status: newStatus });
    const wooCommerceOrderId = orderDoc?.wooCommerceOrderId;

    if (!wooCommerceOrderId) {
      throw new Error('No WooCommerce Order ID associated with this order');
    }

    let wcStatus = 'pending';
    switch (newStatus) {
      case 'processing': wcStatus = 'processing'; break;
      case 'completed': wcStatus = 'completed'; break;
      case 'cancelled': wcStatus = 'cancelled'; break;
      case 'refunded': wcStatus = 'refunded'; break;
      default: wcStatus = 'pending';
    }

    await updateWooCommerceOrder(storeUrl, consumerKey, consumerSecret, wooCommerceOrderId, { status: wcStatus });
    await logOrderSync(firestoreOrderId, wooCommerceOrderId, 'success', `Status synced: updated to ${wcStatus}`);
    return true;
  } catch (error) {
    await logOrderSyncError(firestoreOrderId, error, 1);
    return false;
  }
};

export const syncWooCommerceOrderStatusToFirestore = async (wooCommerceOrderId, firestoreOrderId, wooCommerceConfig) => {
   try {
     if (!wooCommerceConfig?.isConnected || !wooCommerceOrderId) return false;
     const { storeUrl, consumerKey, consumerSecret } = wooCommerceConfig.credentials;
     
     // Fetch specific order using fetchWooCommerceOrders (assuming it allows ID fetch if we modify it or we fetch list)
     // Actually WooCommerce API gets specific order via /wp-json/wc/v3/orders/<id>
     // Since fetchWooCommerceOrders gets list, we can just do a direct fetch:
     const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders/${wooCommerceOrderId}`;
     const authHeader = 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`);
     const res = await fetch(url, { headers: { Authorization: authHeader } });
     if (!res.ok) throw new Error('Failed to fetch WC order');
     
     const wcOrder = await res.json();
     
     let fsStatus = 'pending';
     switch(wcOrder.status) {
       case 'processing': fsStatus = 'processing'; break;
       case 'completed': fsStatus = 'completed'; break;
       case 'cancelled': fsStatus = 'cancelled'; break;
       case 'refunded': fsStatus = 'refunded'; break;
     }

     await updateDocument('orders', firestoreOrderId, { status: fsStatus });
     await logOrderSync(firestoreOrderId, wooCommerceOrderId, 'success', `Local status synced from WC: ${fsStatus}`);
     return true;
   } catch(e) {
     await logOrderSyncError(firestoreOrderId, e, 1);
     return false;
   }
};

export const syncOrderMetadata = async (firestoreOrderId, wooCommerceOrderId, metadata, wooCommerceConfig) => {
   try {
     if (!wooCommerceConfig?.isConnected || !wooCommerceOrderId) return false;
     const { storeUrl, consumerKey, consumerSecret } = wooCommerceConfig.credentials;
     const meta_data = Object.keys(metadata).map(key => ({ key, value: String(metadata[key]) }));
     await updateWooCommerceOrder(storeUrl, consumerKey, consumerSecret, wooCommerceOrderId, { meta_data });
     return true;
   } catch(e) {
     return false;
   }
};

// Also export syncNewOrderToWooCommerce as syncOrderToWooCommerce to prevent breaking existing retry services
export const syncOrderToWooCommerce = syncNewOrderToWooCommerce;