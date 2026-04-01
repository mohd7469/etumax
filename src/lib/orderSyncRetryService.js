
import { addDocument, queryDocuments, updateDocument, getDocument } from './firestoreService';
import { syncNewOrderToWooCommerce } from './orderSyncService';

let retryIntervalId = null;

export const queueOrderForRetry = async (orderId, error, attemptCount = 0) => {
  try {
    await addDocument('failedOrderSyncs', {
      orderId,
      error: error.message || String(error),
      attemptCount: attemptCount + 1,
      nextRetry: new Date(Date.now() + Math.pow(2, attemptCount) * 1000 * 60).toISOString(),
      status: 'queued'
    });
  } catch (err) {
    console.error('Failed to queue order for retry:', err);
  }
};

export const retryOrderSync = async (firestoreOrderId) => {
  try {
    const wcSettings = await getDocument('settings', 'woocommerce');
    if (!wcSettings?.isConnected) return { success: false, error: 'WooCommerce not connected' };

    const order = await getDocument('orders', firestoreOrderId);
    if (!order) return { success: false, error: 'Order not found' };

    const currentAttempt = (order.syncAttempt || 0) + 1;
    await updateDocument('orders', firestoreOrderId, { syncStatus: 'syncing', syncAttempt: currentAttempt });

    const result = await syncNewOrderToWooCommerce(order, wcSettings);

    if (result.success) {
      return { success: true };
    } else {
      if (currentAttempt < 3) {
        await queueOrderForRetry(firestoreOrderId, new Error(result.error), currentAttempt);
      } else {
        await updateDocument('orders', firestoreOrderId, { syncStatus: 'failed_permanent' });
      }
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const retryFailedOrders = async () => {
  try {
    const wcSettings = await getDocument('settings', 'woocommerce');
    if (!wcSettings?.isConnected) return;

    const now = new Date().toISOString();
    const failedSyncs = await queryDocuments('failedOrderSyncs', [
      { type: 'where', field: 'status', operator: '==', value: 'queued' }
    ]);
    
    const toRetry = failedSyncs.filter(fs => fs.nextRetry <= now);

    for (const syncJob of toRetry) {
      if (syncJob.attemptCount >= 3) {
        await updateDocument('failedOrderSyncs', syncJob.id, { status: 'abandoned' });
        await updateDocument('orders', syncJob.orderId, { syncStatus: 'failed_permanent' });
        continue;
      }

      const order = await getDocument('orders', syncJob.orderId);
      if (!order || order.syncStatus === 'synced') {
        await updateDocument('failedOrderSyncs', syncJob.id, { status: 'resolved' });
        continue;
      }

      const result = await syncNewOrderToWooCommerce(order, wcSettings);

      if (result.success) {
        await updateDocument('failedOrderSyncs', syncJob.id, { status: 'success' });
      } else {
        await updateDocument('failedOrderSyncs', syncJob.id, { status: 'failed_retry' });
        await queueOrderForRetry(syncJob.orderId, new Error(result.error), syncJob.attemptCount);
      }
    }
  } catch (error) {
    console.error('Error in retryFailedOrders:', error);
  }
};

export const initializeOrderSyncRetry = () => {
  if (retryIntervalId) clearInterval(retryIntervalId);
  retryIntervalId = setInterval(retryFailedOrders, 5 * 60 * 1000);
  setTimeout(retryFailedOrders, 10000);
};
