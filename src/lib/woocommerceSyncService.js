import {
  fetchWooCommerceProducts,
  fetchWooCommerceOrders,
  fetchWooCommerceCustomers,
  fetchWooCommerceCategories,
  createWooCommerceProduct,
  updateWooCommerceProduct,
  createWooCommerceOrder,
  updateWooCommerceOrder,
  createWooCommerceCustomer,
  updateWooCommerceCustomer,
  createWooCommerceCategory,
  updateWooCommerceCategory,
  transformWooCommerceProduct
} from './woocommerceService';
import { batchWrite, getAllDocuments } from './firestoreService';

const MAX_PER_PAGE = 100;
const DEFAULT_SYNC_LIMIT = 1000;
const FIRESTORE_BATCH_SIZE = 400;

const getEmptyAdminSyncState = () => ({
  active: false,
  background: false,
  label: '',
  progress: 0,
  current: 0,
  total: 0,
  status: 'idle',
  message: ''
});

const updateAdminSyncState = (patch = {}) => {
  if (typeof window === 'undefined') return;
  const prev = window.__ADMIN_SYNC_STATE__ || getEmptyAdminSyncState();
  window.__ADMIN_SYNC_STATE__ = {
    ...prev,
    ...patch
  };
};

const resetAdminSyncStateLater = (delay = 3000) => {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    window.__ADMIN_SYNC_STATE__ = getEmptyAdminSyncState();
  }, delay);
};

export const logSyncOperation = async (operation, status, message) => {
  console.log(`[WC Sync][${operation}] ${status}: ${message}`);
  return {
    operation,
    status,
    message,
    timestamp: new Date().toISOString()
  };
};

const normalizeStoreUrl = (url) => String(url || '').replace(/\/$/, '');

const toSafeLimit = (limit, fallback = DEFAULT_SYNC_LIMIT) => {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const chunkArray = (array, size = FIRESTORE_BATCH_SIZE) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const writeInChunks = async (
  ops,
  {
    label = 'Sync',
    initialProgress = 15,
    startInBackground = true
  } = {}
) => {
  if (!Array.isArray(ops) || ops.length === 0) return;

  const chunks = chunkArray(ops, FIRESTORE_BATCH_SIZE);

  if (startInBackground) {
    updateAdminSyncState({
      active: true,
      background: true,
      label,
      progress: initialProgress,
      current: 0,
      total: ops.length,
      status: 'running',
      message: 'Saving data to database in background'
    });
  }

  for (let i = 0; i < chunks.length; i++) {
    await batchWrite(chunks[i]);

    const processed = Math.min((i + 1) * FIRESTORE_BATCH_SIZE, ops.length);
    const progress = Math.max(initialProgress, Math.round((processed / ops.length) * 100));

    updateAdminSyncState({
      active: true,
      background: true,
      label,
      progress,
      current: processed,
      total: ops.length,
      status: 'running',
      message: `Saved ${processed} of ${ops.length} items`
    });
  }
};

// Generic paginated fetcher for WC / WP endpoints
const fetchWCData = async (credentials, endpoint, limit = DEFAULT_SYNC_LIMIT) => {
  const { storeUrl, consumerKey, consumerSecret } = credentials;
  const normalizedStoreUrl = normalizeStoreUrl(storeUrl);
  const auth = btoa(`${consumerKey}:${consumerSecret}`);

  const basePath =
    endpoint === 'pages' || endpoint === 'media'
      ? '/wp-json/wp/v2'
      : '/wp-json/wc/v3';

  const actualEndpoint = endpoint === 'reviews' ? 'products/reviews' : endpoint;
  const safeLimit = toSafeLimit(limit);

  console.log(`[WC Sync] Requested ${safeLimit} items for endpoint: ${endpoint}`);

  let allItems = [];
  let page = 1;
  let fetchedCount = 0;

  while (fetchedCount < safeLimit) {
    const remaining = safeLimit - fetchedCount;
    const perPage = Math.min(MAX_PER_PAGE, remaining);

    console.log(`[WC Sync] Fetching endpoint=${endpoint}, page=${page}, per_page=${perPage}`);

    const response = await fetch(
      `${normalizedStoreUrl}${basePath}/${actualEndpoint}?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.log(`[WC Sync] No more data found for ${endpoint} at page ${page}.`);
      break;
    }

    allItems = allItems.concat(data);
    fetchedCount += data.length;

    if (data.length < perPage) {
      console.log(`[WC Sync] ${endpoint}: reached end of available data`);
      break;
    }

    page += 1;
  }

  return allItems.slice(0, safeLimit);
};

// Paginated fetcher using existing woocommerceService.js helpers
const fetchAllWithPagedFunction = async (fetchFn, credentials, limit = DEFAULT_SYNC_LIMIT) => {
  const { storeUrl, consumerKey, consumerSecret } = credentials;
  const safeLimit = toSafeLimit(limit);

  let allItems = [];
  let page = 1;

  while (allItems.length < safeLimit) {
    const remaining = safeLimit - allItems.length;
    const perPage = Math.min(MAX_PER_PAGE, remaining);

    const items = await fetchFn(storeUrl, consumerKey, consumerSecret, page, perPage);

    if (!Array.isArray(items) || items.length === 0) {
      break;
    }

    allItems = allItems.concat(items);

    if (items.length < perPage) {
      break;
    }

    page += 1;
  }

  return allItems.slice(0, safeLimit);
};

export const syncProductsFromWooCommerce = async (credentials, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    const { storeUrl } = credentials;
    const safeLimit = toSafeLimit(limit);

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Product sync',
      progress: 0,
      current: 0,
      total: safeLimit,
      status: 'running',
      message: 'Preparing WooCommerce fetch'
    });

    const wcProducts = await fetchAllWithPagedFunction(
      fetchWooCommerceProducts,
      credentials,
      safeLimit
    );

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Product sync',
      progress: 10,
      current: 0,
      total: wcProducts.length,
      status: 'running',
      message: `Fetched ${wcProducts.length} products from WooCommerce`
    });

    const newProducts = wcProducts.map((wc) =>
      transformWooCommerceProduct(wc, null, normalizeStoreUrl(storeUrl))
    );

    const ops = newProducts.map((p) => ({
      type: 'set',
      collection: 'products',
      id: p.id,
      data: p
    }));

    if (ops.length > 0) {
      await writeInChunks(ops, {
        label: 'Product sync',
        initialProgress: 15,
        startInBackground: true
      });

      await logSyncOperation(
        'Products From WC',
        'info',
        `Processed pricing data mapping for ${ops.length} products`
      );
    }

    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Product sync',
      progress: 100,
      current: ops.length,
      total: ops.length,
      status: 'success',
      message: `${ops.length} products synced successfully`
    });

    resetAdminSyncStateLater(3000);

    return logSyncOperation('Products From WC', 'success', `Synced ${ops.length} products`);
  } catch (error) {
    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Product sync',
      progress: 0,
      current: 0,
      total: 0,
      status: 'error',
      message: error.message || 'Product sync failed'
    });

    resetAdminSyncStateLater(4500);

    return logSyncOperation('Products From WC', 'error', error.message);
  }
};

export const syncProductsToWooCommerce = async () => {
  console.warn('🚫 Push Products is DISABLED (Import-only mode active)');

  return {
    operation: 'Products To WC',
    status: 'success',
    message: 'Push products disabled. Import-only mode is active.',
    timestamp: new Date().toISOString()
  };
};

export const syncOrdersFromWooCommerce = async (credentials, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    const safeLimit = toSafeLimit(limit);

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Order sync',
      progress: 0,
      current: 0,
      total: safeLimit,
      status: 'running',
      message: 'Fetching orders from WooCommerce'
    });

    const wcOrders = await fetchAllWithPagedFunction(
      fetchWooCommerceOrders,
      credentials,
      safeLimit
    );

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Order sync',
      progress: 10,
      current: 0,
      total: wcOrders.length,
      status: 'running',
      message: `Fetched ${wcOrders.length} orders`
    });

    const ops = wcOrders.map((wc) => {
      const orderData = {
        id: `wc_ord_${wc.id}`,
        wc_id: String(wc.id),
        status: wc.status,
        total: parseFloat(wc.total),
        currency: wc.currency,
        date: wc.date_created,
        items: (wc.line_items || []).map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price)
        })),
        shippingAddress: wc.shipping,
        billingAddress: wc.billing,
        sourceStoreUrl: credentials.storeUrl,
        lastSynced: new Date().toISOString()
      };

      return {
        type: 'set',
        collection: 'orders',
        id: orderData.id,
        data: orderData
      };
    });

    if (ops.length > 0) {
      await writeInChunks(ops, {
        label: 'Order sync',
        initialProgress: 15,
        startInBackground: true
      });
    }

    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Order sync',
      progress: 100,
      current: ops.length,
      total: ops.length,
      status: 'success',
      message: `${ops.length} orders synced successfully`
    });

    resetAdminSyncStateLater(3000);

    return logSyncOperation('Orders From WC', 'success', `Synced ${ops.length} orders`);
  } catch (error) {
    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Order sync',
      progress: 0,
      current: 0,
      total: 0,
      status: 'error',
      message: error.message || 'Order sync failed'
    });

    resetAdminSyncStateLater(4500);

    return logSyncOperation('Orders From WC', 'error', error.message);
  }
};

export const syncOrdersToWooCommerce = async (credentials) => {
  try {
    const { storeUrl, consumerKey, consumerSecret } = credentials;
    const orders = await getAllDocuments('orders');
    const ordersToSync = orders.filter((o) => !o.wc_id && o.wooCommerceSync !== false);

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Push orders',
      progress: 0,
      current: 0,
      total: ordersToSync.length,
      status: 'running',
      message: 'Sending local orders to WooCommerce'
    });

    let count = 0;

    for (const order of ordersToSync) {
      const wcData = {
        status: order.status || 'processing',
        billing: order.billingAddress || {},
        shipping: order.shippingAddress || {},
        line_items: (order.items || []).map((i) => ({
          product_id: i.wc_id || 0,
          quantity: i.quantity
        }))
      };

      const res = await createWooCommerceOrder(storeUrl, consumerKey, consumerSecret, wcData);

      await batchWrite([
        {
          type: 'update',
          collection: 'orders',
          id: order.id,
          data: { wc_id: String(res.id), lastSynced: new Date().toISOString() }
        }
      ]);

      count++;

      updateAdminSyncState({
        active: true,
        background: count > 5,
        label: 'Push orders',
        progress: Math.round((count / ordersToSync.length) * 100) || 0,
        current: count,
        total: ordersToSync.length,
        status: 'running',
        message: `Pushed ${count} of ${ordersToSync.length} orders`
      });
    }

    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Push orders',
      progress: 100,
      current: count,
      total: ordersToSync.length,
      status: 'success',
      message: `${count} orders pushed successfully`
    });

    resetAdminSyncStateLater(3000);

    return logSyncOperation('Orders To WC', 'success', `Pushed ${count} orders`);
  } catch (error) {
    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Push orders',
      progress: 0,
      current: 0,
      total: 0,
      status: 'error',
      message: error.message || 'Orders push failed'
    });

    resetAdminSyncStateLater(4500);

    return logSyncOperation('Orders To WC', 'error', error.message);
  }
};

export const syncCustomersFromWooCommerce = async (credentials, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    const safeLimit = toSafeLimit(limit);

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Customer sync',
      progress: 0,
      current: 0,
      total: safeLimit,
      status: 'running',
      message: 'Fetching customers from WooCommerce'
    });

    const wcCustomers = await fetchAllWithPagedFunction(
      fetchWooCommerceCustomers,
      credentials,
      safeLimit
    );

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Customer sync',
      progress: 10,
      current: 0,
      total: wcCustomers.length,
      status: 'running',
      message: `Fetched ${wcCustomers.length} customers`
    });

    const ops = wcCustomers.map((wc) => {
      const custData = {
        id: `wc_cust_${wc.id}`,
        wc_id: String(wc.id),
        email: wc.email,
        name: `${wc.first_name || ''} ${wc.last_name || ''}`.trim(),
        role: 'customer',
        lastSynced: new Date().toISOString()
      };

      return {
        type: 'set',
        collection: 'customers',
        id: custData.id,
        data: custData
      };
    });

    if (ops.length > 0) {
      await writeInChunks(ops, {
        label: 'Customer sync',
        initialProgress: 15,
        startInBackground: true
      });
    }

    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Customer sync',
      progress: 100,
      current: ops.length,
      total: ops.length,
      status: 'success',
      message: `${ops.length} customers synced successfully`
    });

    resetAdminSyncStateLater(3000);

    return logSyncOperation('Customers From WC', 'success', `Synced ${ops.length} customers`);
  } catch (error) {
    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Customer sync',
      progress: 0,
      current: 0,
      total: 0,
      status: 'error',
      message: error.message || 'Customer sync failed'
    });

    resetAdminSyncStateLater(4500);

    return logSyncOperation('Customers From WC', 'error', error.message);
  }
};

export const syncCustomersToWooCommerce = async () => {
  return logSyncOperation('Customers To WC', 'success', 'Skipped. Managed by store natively.');
};

export const syncCategoriesFromWooCommerce = async (credentials, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    const safeLimit = toSafeLimit(limit);

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Category sync',
      progress: 0,
      current: 0,
      total: safeLimit,
      status: 'running',
      message: 'Fetching categories from WooCommerce'
    });

    const wcCategories = await fetchAllWithPagedFunction(
      fetchWooCommerceCategories,
      credentials,
      safeLimit
    );

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Category sync',
      progress: 10,
      current: 0,
      total: wcCategories.length,
      status: 'running',
      message: `Fetched ${wcCategories.length} categories`
    });

    const ops = wcCategories.map((wc) => {
      const catData = {
        id: `wc_cat_${wc.id}`,
        wc_id: String(wc.id),
        name: wc.name,
        slug: wc.slug,
        description: wc.description,
        count: wc.count,
        lastSynced: new Date().toISOString()
      };

      return {
        type: 'set',
        collection: 'categories',
        id: catData.id,
        data: catData
      };
    });

    if (ops.length > 0) {
      await writeInChunks(ops, {
        label: 'Category sync',
        initialProgress: 15,
        startInBackground: true
      });
    }

    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Category sync',
      progress: 100,
      current: ops.length,
      total: ops.length,
      status: 'success',
      message: `${ops.length} categories synced successfully`
    });

    resetAdminSyncStateLater(3000);

    return logSyncOperation('Categories From WC', 'success', `Synced ${ops.length} categories`);
  } catch (error) {
    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Category sync',
      progress: 0,
      current: 0,
      total: 0,
      status: 'error',
      message: error.message || 'Category sync failed'
    });

    resetAdminSyncStateLater(4500);

    return logSyncOperation('Categories From WC', 'error', error.message);
  }
};

export const syncCategoriesToWooCommerce = async () => {
  return logSyncOperation('Categories To WC', 'success', 'Skipped.');
};

export const syncPagesToFirestore = async (pages, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    const safeLimit = toSafeLimit(limit);

    const ops = pages.slice(0, safeLimit).map((p) => ({
      type: 'set',
      collection: 'pages',
      id: `wc_page_${p.id}`,
      data: {
        id: `wc_page_${p.id}`,
        wc_id: String(p.id),
        title: p.title?.rendered || 'Untitled',
        content: p.content?.rendered || '',
        slug: p.slug,
        status: p.status || 'publish',
        lastSynced: new Date().toISOString()
      }
    }));

    if (ops.length > 0) {
      await writeInChunks(ops, {
        label: 'Page sync',
        initialProgress: 15,
        startInBackground: true
      });
    }

    return logSyncOperation('Pages To FS', 'success', `Synced ${ops.length} pages to database.`);
  } catch (error) {
    return logSyncOperation('Pages To FS', 'error', `Database write failed: ${error.message}`);
  }
};

export const syncMediaToFirestore = async (media, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    const safeLimit = toSafeLimit(limit);

    const ops = media.slice(0, safeLimit).map((m) => ({
      type: 'set',
      collection: 'media',
      id: `wc_media_${m.id}`,
      data: {
        id: `wc_media_${m.id}`,
        wc_id: String(m.id),
        url: m.source_url,
        alt: m.alt_text || '',
        type: m.media_type,
        lastSynced: new Date().toISOString()
      }
    }));

    if (ops.length > 0) {
      await writeInChunks(ops, {
        label: 'Media sync',
        initialProgress: 15,
        startInBackground: true
      });
    }

    return logSyncOperation('Media To FS', 'success', `Synced ${ops.length} media items`);
  } catch (error) {
    return logSyncOperation('Media To FS', 'error', `Database write failed: ${error.message}`);
  }
};

export const syncReviewsToFirestore = async (reviews, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    const safeLimit = toSafeLimit(limit);

    const ops = reviews.slice(0, safeLimit).map((r) => ({
      type: 'set',
      collection: 'reviews',
      id: `wc_rev_${r.id}`,
      data: {
        id: `wc_rev_${r.id}`,
        wc_id: String(r.id),
        product_id: String(r.product_id),
        reviewer: r.reviewer,
        reviewer_email: r.reviewer_email,
        review: r.review,
        rating: r.rating,
        date_created: r.date_created,
        lastSynced: new Date().toISOString()
      }
    }));

    if (ops.length > 0) {
      await writeInChunks(ops, {
        label: 'Review sync',
        initialProgress: 15,
        startInBackground: true
      });
    }

    return logSyncOperation('Reviews To FS', 'success', `Synced ${ops.length} reviews`);
  } catch (error) {
    return logSyncOperation('Reviews To FS', 'error', `Database write failed: ${error.message}`);
  }
};

export const syncPagesFromWooCommerce = async (credentials, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Page sync',
      progress: 0,
      current: 0,
      total: toSafeLimit(limit),
      status: 'running',
      message: 'Fetching pages from WordPress'
    });

    const pages = await fetchWCData(credentials, 'pages', limit);

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Page sync',
      progress: 10,
      current: 0,
      total: pages.length,
      status: 'running',
      message: `Fetched ${pages.length} pages`
    });

    const result = await syncPagesToFirestore(pages, limit);

    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Page sync',
      progress: 100,
      current: pages.length,
      total: pages.length,
      status: 'success',
      message: `${pages.length} pages synced successfully`
    });

    resetAdminSyncStateLater(3000);

    return result;
  } catch (error) {
    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Page sync',
      progress: 0,
      current: 0,
      total: 0,
      status: 'error',
      message: error.message || 'Page sync failed'
    });

    resetAdminSyncStateLater(4500);

    return logSyncOperation('Pages From WC', 'error', error.message);
  }
};

export const syncMediaFromWooCommerce = async (credentials, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Media sync',
      progress: 0,
      current: 0,
      total: toSafeLimit(limit),
      status: 'running',
      message: 'Fetching media from WordPress'
    });

    const media = await fetchWCData(credentials, 'media', limit);

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Media sync',
      progress: 10,
      current: 0,
      total: media.length,
      status: 'running',
      message: `Fetched ${media.length} media items`
    });

    const result = await syncMediaToFirestore(media, limit);

    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Media sync',
      progress: 100,
      current: media.length,
      total: media.length,
      status: 'success',
      message: `${media.length} media items synced successfully`
    });

    resetAdminSyncStateLater(3000);

    return result;
  } catch (error) {
    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Media sync',
      progress: 0,
      current: 0,
      total: 0,
      status: 'error',
      message: error.message || 'Media sync failed'
    });

    resetAdminSyncStateLater(4500);

    return logSyncOperation('Media From WC', 'error', error.message);
  }
};

export const syncReviewsFromWooCommerce = async (credentials, limit = DEFAULT_SYNC_LIMIT) => {
  try {
    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Review sync',
      progress: 0,
      current: 0,
      total: toSafeLimit(limit),
      status: 'running',
      message: 'Fetching reviews from WooCommerce'
    });

    const reviews = await fetchWCData(credentials, 'reviews', limit);

    updateAdminSyncState({
      active: true,
      background: false,
      label: 'Review sync',
      progress: 10,
      current: 0,
      total: reviews.length,
      status: 'running',
      message: `Fetched ${reviews.length} reviews`
    });

    const result = await syncReviewsToFirestore(reviews, limit);

    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Review sync',
      progress: 100,
      current: reviews.length,
      total: reviews.length,
      status: 'success',
      message: `${reviews.length} reviews synced successfully`
    });

    resetAdminSyncStateLater(3000);

    return result;
  } catch (error) {
    updateAdminSyncState({
      active: false,
      background: false,
      label: 'Review sync',
      progress: 0,
      current: 0,
      total: 0,
      status: 'error',
      message: error.message || 'Review sync failed'
    });

    resetAdminSyncStateLater(4500);

    return logSyncOperation('Reviews From WC', 'error', error.message);
  }
};

export const handleSyncConflicts = (firestoreData, wooCommerceData) => {
  return wooCommerceData;
};