
import { getOptimizedOGImageUrl } from './utils';

export const generateOpenGraphTags = (product) => {
  if (!product) return [];

  const url = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug || product.id}` : '';
  const title = product.seoTitle || product.metaTitle || product.name || 'Product';
  const description = (product.metaDescription || product.shortDescription || product.description || '').replace(/<[^>]*>/g, ' ').substring(0, 160);
  
  let image = product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : '');
  image = getOptimizedOGImageUrl(image) || image;

  return [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'product' },
  ];
};

export const generateTwitterCardTags = (product) => {
  if (!product) return [];

  const title = product.seoTitle || product.metaTitle || product.name || 'Product';
  const description = (product.metaDescription || product.shortDescription || product.description || '').replace(/<[^>]*>/g, ' ').substring(0, 160);
  
  let image = product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : '');
  image = getOptimizedOGImageUrl(image) || image;

  return [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];
};

export const generateProductSchema = (product) => {
  if (!product) return null;

  const url = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug || product.id}` : '';
  const description = (product.metaDescription || product.shortDescription || product.description || '').replace(/<[^>]*>/g, ' ');

  let images = product.images || [];
  if (images.length === 0 && product.mainImage) images = [product.mainImage];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name || '',
    image: images.filter(Boolean),
    description: description,
    sku: product.sku || product.id || '',
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'AED',
      price: Number(product.price || 0).toFixed(2),
      availability: (product.inStock || product.stockStatus === 'instock')
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  if (product.brand) {
    schema.brand = { '@type': 'Brand', name: product.brand };
  }

  if (product.reviewCount && product.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating).toFixed(1),
      reviewCount: Number(product.reviewCount),
    };
  }

  return schema;
};

export const injectMetaTags = (tags) => {
  if (!tags || !Array.isArray(tags) || typeof document === 'undefined') return;

  tags.forEach((tag) => {
    const selector = tag.property 
      ? `meta[property="${tag.property}"]` 
      : `meta[name="${tag.name}"]`;
    
    let element = document.querySelector(selector);
    
    if (!element) {
      element = document.createElement('meta');
      if (tag.property) element.setAttribute('property', tag.property);
      if (tag.name) element.setAttribute('name', tag.name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', tag.content || '');
  });
};

export const updateDocumentHead = (product) => {
  if (!product || typeof document === 'undefined') return;

  // Update Title
  const title = product.seoTitle || product.metaTitle || product.name || 'Product Detail';
  document.title = `${title} | Store`;

  // Update Description
  const description = (product.metaDescription || product.shortDescription || product.description || '').replace(/<[^>]*>/g, ' ').substring(0, 160);
  injectMetaTags([{ name: 'description', content: description }]);

  // Inject OG & Twitter
  injectMetaTags(generateOpenGraphTags(product));
  injectMetaTags(generateTwitterCardTags(product));

  // Inject JSON-LD
  const schema = generateProductSchema(product);
  if (schema) {
    let scriptEl = document.getElementById('seo-product-schema');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'seo-product-schema';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schema);
  }
};
