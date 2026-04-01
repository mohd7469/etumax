import { addDocument, queryDocuments } from './firestoreService';

export const logOrderCreation = async (orderId, details) => {
  try {
    await addDocument('orderLogs', {
      orderId,
      action: 'creation',
      status: 'success',
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log order creation:', error);
  }
};

export const logOrderSync = async (firestoreOrderId, wooCommerceOrderId, status, details) => {
  try {
    await addDocument('orderSyncLogs', {
      orderId: firestoreOrderId,
      wooCommerceOrderId: wooCommerceOrderId || null,
      action: 'sync',
      status,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log order sync:', error);
  }
};

export const logOrderSyncError = async (firestoreOrderId, error, attemptNumber = 1) => {
  try {
    await addDocument('orderSyncLogs', {
      orderId: firestoreOrderId,
      action: 'sync_error',
      status: 'failed',
      attemptNumber,
      details: {
        error: error.message || String(error),
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log order error:', err);
  }
};

export const logOrderError = async (orderId, error, context) => {
  try {
    await addDocument('orderLogs', {
      orderId,
      action: 'error',
      status: 'failed',
      details: {
        error: error.message || String(error),
        context
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log order error:', err);
  }
};

export const getOrderLogs = async (orderId) => {
  try {
    const logs = await queryDocuments('orderLogs', [
      { type: 'where', field: 'orderId', operator: '==', value: orderId }
    ]);
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Failed to fetch order logs:', error);
    return [];
  }
};

export const getOrderSyncLogs = async (firestoreOrderId) => {
  try {
    const logs = await queryDocuments('orderSyncLogs', [
      { type: 'where', field: 'orderId', operator: '==', value: firestoreOrderId }
    ]);
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Failed to fetch order sync logs:', error);
    return [];
  }
};