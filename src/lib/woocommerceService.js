export const createWooCommerceAuthHeader = (consumerKey, consumerSecret) => {
  return 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`);
};

const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WooCommerce API Error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('WooCommerce request failed:', error);
    throw error;
  }
};

export const validateWooCommerceCredentials = async (storeUrl, consumerKey, consumerSecret) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/system_status`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'GET', headers });
};

export const fetchWooCommerceProducts = async (storeUrl, consumerKey, consumerSecret, page = 1, perPage = 100) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'GET', headers });
};

export const fetchWooCommerceOrders = async (storeUrl, consumerKey, consumerSecret, page = 1, perPage = 100) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders?page=${page}&per_page=${perPage}`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'GET', headers });
};

export const fetchWooCommerceCustomers = async (storeUrl, consumerKey, consumerSecret, page = 1, perPage = 100) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/customers?page=${page}&per_page=${perPage}`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'GET', headers });
};

export const fetchWooCommerceCategories = async (storeUrl, consumerKey, consumerSecret, page = 1, perPage = 100) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/categories?page=${page}&per_page=${perPage}`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'GET', headers });
};

export const createWooCommerceProduct = async (storeUrl, consumerKey, consumerSecret, productData) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'POST', headers, body: JSON.stringify(productData) });
};

export const updateWooCommerceProduct = async (storeUrl, consumerKey, consumerSecret, productId, productData) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/${productId}`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'PUT', headers, body: JSON.stringify(productData) });
};

export const deleteWooCommerceProduct = async (storeUrl, consumerKey, consumerSecret, productId) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/${productId}?force=true`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'DELETE', headers });
};

export const createWooCommerceOrder = async (storeUrl, consumerKey, consumerSecret, orderData) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'POST', headers, body: JSON.stringify(orderData) });
};

export const updateWooCommerceOrder = async (storeUrl, consumerKey, consumerSecret, orderId, orderData) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders/${orderId}`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'PUT', headers, body: JSON.stringify(orderData) });
};

export const createWooCommerceCustomer = async (storeUrl, consumerKey, consumerSecret, customerData) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/customers`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'POST', headers, body: JSON.stringify(customerData) });
};

export const updateWooCommerceCustomer = async (storeUrl, consumerKey, consumerSecret, customerId, customerData) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/customers/${customerId}`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'PUT', headers, body: JSON.stringify(customerData) });
};

export const createWooCommerceCategory = async (storeUrl, consumerKey, consumerSecret, categoryData) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/categories`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'POST', headers, body: JSON.stringify(categoryData) });
};

export const updateWooCommerceCategory = async (storeUrl, consumerKey, consumerSecret, categoryId, categoryData) => {
  const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/categories/${categoryId}`;
  const headers = { Authorization: createWooCommerceAuthHeader(consumerKey, consumerSecret) };
  return makeRequest(url, { method: 'PUT', headers, body: JSON.stringify(categoryData) });
};

export const extractWooCommerceMetaField = (metaData, keyName) => {
  if (!metaData || !Array.isArray(metaData)) return null;
  const field = metaData.find(meta => meta.key === keyName);
  if (!field) return null;
  
  try {
    return typeof field.value === 'string' && (field.value.startsWith('[') || field.value.startsWith('{')) 
      ? JSON.parse(field.value) 
      : field.value;
  } catch (e) {
    return field.value;
  }
};

export const transformWooCommerceProduct = (wcProduct, storeId = null, storeName = null) => {
  let features = [];
  const featuresMeta = extractWooCommerceMetaField(wcProduct.meta_data, '_product_features') || 
                       extractWooCommerceMetaField(wcProduct.meta_data, 'features') || 
                       extractWooCommerceMetaField(wcProduct.meta_data, '_product_details');
  
  if (featuresMeta) {
    if (Array.isArray(featuresMeta)) {
      features = featuresMeta;
    } else if (typeof featuresMeta === 'string') {
      features = featuresMeta.split('|').map(f => f.trim()).filter(Boolean);
    }
  }

  // Ensure prices are parsed as correct numbers
  const regularPrice = parseFloat(wcProduct.regular_price || wcProduct.price || 0);
  const salePrice = wcProduct.sale_price ? parseFloat(wcProduct.sale_price) : null;
  const effectivePrice = salePrice !== null ? salePrice : regularPrice;

  return {
    id: `wc_prod_${wcProduct.id}`,
    wc_id: String(wcProduct.id),
    name: wcProduct.name,
    description: wcProduct.description || '',
    shortDescription: wcProduct.short_description || '',
    price: effectivePrice,
    regularPrice: regularPrice,
    salePrice: salePrice,
    originalPrice: regularPrice, // Backwards compatibility
    categories: (wcProduct.categories || []).map(c => c.name),
    images: (wcProduct.images || []).map(img => img.src),
    inStock: wcProduct.stock_status === 'instock',
    stockStatus: wcProduct.stock_status,
    slug: wcProduct.slug,
    features: features,
    sourceStoreId: storeId,
    sourceStoreName: storeName || 'WooCommerce',
    sourceStoreUrl: storeName || storeId,
    lastSynced: new Date().toISOString()
  };
};