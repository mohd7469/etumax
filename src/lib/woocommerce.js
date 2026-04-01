export const fetchWooCommerceProducts = async (storeUrl, consumerKey, consumerSecret) => {
  try {
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    let allProducts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${storeUrl}/wp-json/wc/v3/products?per_page=100&page=${page}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const products = await response.json();

      if (products.length === 0) {
        hasMore = false;
      } else {
        allProducts = [...allProducts, ...products];
        page++;
      }
    }

    return allProducts;
  } catch (error) {
    console.error('Error fetching WooCommerce products:', error);
    throw error;
  }
};

export const fetchWooCommercePages = async (storeUrl, consumerKey, consumerSecret) => {
  try {
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    let allPages = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${storeUrl}/wp-json/wp/v2/pages?per_page=100&page=${page}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch pages: ${response.statusText}`);
      }

      const pages = await response.json();

      if (pages.length === 0) {
        hasMore = false;
      } else {
        allPages = [...allPages, ...pages];
        page++;
      }
    }

    return allPages;
  } catch (error) {
    console.error('Error fetching WooCommerce pages:', error);
    throw error;
  }
};

export const transformWooCommerceProduct = (wcProduct, sourceStoreId, sourceStoreName) => {
  const slug = wcProduct.slug || wcProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  return {
    id: String(wcProduct.id),
    wc_id: wcProduct.id,
    sourceStoreId,
    sourceStoreName,
    name: wcProduct.name,
    slug,
    description: wcProduct.description,
    short_description: wcProduct.short_description,
    price: parseFloat(wcProduct.price) || 0,
    originalPrice: parseFloat(wcProduct.regular_price) || 0,
    images: wcProduct.images ? wcProduct.images.map(img => img.src) : [],
    categories: wcProduct.categories ? wcProduct.categories.map(cat => cat.name) : [],
    tags: wcProduct.tags ? wcProduct.tags.map(tag => tag.name) : [],
    sku: wcProduct.sku,
    inStock: wcProduct.stock_status === 'instock',
    stockStatus: wcProduct.stock_status,
    status: wcProduct.status === 'publish' ? 'published' : 'draft',
    dateAdded: wcProduct.date_created || new Date().toISOString(),
    brand: wcProduct.brands && wcProduct.brands.length > 0 ? wcProduct.brands[0].name : '',
    features: [],
  };
};

export const transformWooCommercePage = (wcPage, sourceStoreId, sourceStoreName) => {
  const slug = wcPage.slug || wcPage.title.rendered.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  return {
    id: `wc_page_${sourceStoreId}_${wcPage.id}`,
    wc_id: wcPage.id,
    sourceStoreId,
    sourceStoreName,
    title: wcPage.title.rendered,
    slug,
    content: wcPage.content.rendered,
    path: `/page/${slug}`,
    showOnStore: wcPage.status === 'publish',
    dateCreated: wcPage.date || new Date().toISOString(),
  };
};