export const routes = {
  '/': {
    title: 'Pharmacy DXB',
    description: 'Pharmacy DXB Official Store - Premium health and wellness products for a better life.',
    image: null
  },
  '/shop': {
    title: 'Shop All Products - Pharmacy DXB',
    description: 'Browse our full collection of premium health supplements and wellness products.',
    image: null
  },
  '/about': {
    title: 'About Us - Pharmacy DXB',
    description: 'Learn more about Pharmacy DXB and our mission to provide the highest quality health supplements.',
    image: null
  },
  '/contact': {
    title: 'Contact Us - Pharmacy DXB',
    description: 'Have questions? Get in touch with our team for support or inquiries.',
    image: null
  },
  '/cart': {
    title: 'Your Shopping Cart - Pharmacy DXB',
    description: 'Review your selected items and proceed to checkout.',
    image: null
  },
  '/checkout': {
    title: 'Secure Checkout - Pharmacy DXB',
    description: 'Finalize your order and get your Pharmacy DXB products delivered to your door.',
    image: "https://png.pngtree.com/thumb_back/fh260/background/20230706/pngtree-d-render-of-shopping-concept-smartphone-checkout-and-cardboard-box-delivery-image_3818349.jpg"
  }
};

export const baseURL = (typeof window !== 'undefined' ? window.location.origin : '') || "https://PharmacyDXB.ae";

/**
 * Default SEO configuration used as a fallback.
 * NOTE: The 'title' and 'description' below are automatically overridden by 
 * your Admin Settings (Store Name/Tagline) during the static SEO build process.
 */
export const defaultSEO = {
  store: 'Pharmacy DXB',
  title: 'Your HealthCare Destination', // This will be the Store Name
  description: 'Premium health and wellness products.', // This will be the Tagline
  canonicalBase: baseURL,
  defaultImage: baseURL + '/logo.png'
};