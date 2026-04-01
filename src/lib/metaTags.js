/**
 * Validates and normalizes an image URL to ensure it is absolute, HTTPS, and properly formatted for social sharing.
 * 
 * @param {string} url - The original image URL
 * @param {string} fallbackUrl - The fallback image URL to use if the original is invalid
 * @returns {string} - The normalized absolute HTTPS URL
 */
export const validateAndNormalizeImageUrl = (url, fallbackUrl = 'https://ae.pharmacydxb.ae/wp-content/uploads/2026/03/Untitled-1.png') => {
  if (!url || typeof url !== 'string') {
    console.warn('[MetaTags] Invalid or missing image URL, using fallback:', fallbackUrl);
    return fallbackUrl;
  }

  let finalUrl = url;

  try {
    // Handle relative URLs
    if (finalUrl.startsWith('/')) {
      finalUrl = `${window.location.origin}${finalUrl}`;
    }

    const parsedUrl = new URL(finalUrl, window.location.origin);

    // Ensure HTTPS (except for local development)
    if (parsedUrl.protocol === 'http:' && !parsedUrl.hostname.includes('localhost')) {
      parsedUrl.protocol = 'https:';
    }

    // Fix Firebase Storage URLs to ensure they display inline for crawlers
    if (parsedUrl.hostname.includes('firebasestorage.googleapis.com')) {
      if (!parsedUrl.searchParams.has('alt')) {
        parsedUrl.searchParams.set('alt', 'media');
      }
    }

    finalUrl = parsedUrl.href;
    console.log('[MetaTags] Successfully normalized image URL:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('[MetaTags] Error normalizing image URL:', url, error);
    return fallbackUrl;
  }
};

export const updateMetaTags = ({ title, description, image, url, author, keywords }) => {
  // Keep track of the original title
  const originalTitle = document.title;

  // Arrays to store elements we modify or add, so we can clean them up later
  const modifiedTags = [];
  const addedTags = [];

  if (title) {
    document.title = title;
  }

  // Helper to ensure URLs are absolute and HTTPS
  const absoluteImage = validateAndNormalizeImageUrl(image);
  const absoluteUrl = url ? new URL(url, window.location.origin).href : window.location.href;

  console.log('[MetaTags] Updating tags with:', { title, description, image: absoluteImage, url: absoluteUrl });

  // Helper function to create or update meta tags
  const setMeta = (attributeName, attributeValue, content) => {
    if (!content && content !== '') return;

    const selector = `meta[${attributeName}="${attributeValue}"]`;
    let el = document.querySelector(selector);

    if (el) {
      // Save original state to restore on cleanup
      modifiedTags.push({
        el,
        originalContent: el.getAttribute('content'),
        isLink: false
      });
      el.setAttribute('content', content);
    } else {
      // Create new meta tag if it doesn't exist
      el = document.createElement('meta');
      el.setAttribute(attributeName, attributeValue);
      el.setAttribute('content', content);
      document.head.appendChild(el);
      addedTags.push(el);
    }
  };

  // Helper function to create or update link tags (e.g., canonical)
  const setLink = (rel, href) => {
    if (!href) return;
    const selector = `link[rel="${rel}"]`;
    let el = document.querySelector(selector);

    if (el) {
      modifiedTags.push({
        el,
        originalContent: el.getAttribute('href'),
        isLink: true
      });
      el.setAttribute('href', href);
    } else {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      el.setAttribute('href', href);
      document.head.appendChild(el);
      addedTags.push(el);
    }
  };

  // Set Standard SEO tags
  if (description) setMeta('name', 'description', description);
  if (keywords) setMeta('name', 'keywords', keywords);
  setMeta('name', 'author', author || 'Shaapar');
  setMeta('name', 'robots', 'index, follow');

  // Set Open Graph tags (Critical for WhatsApp/Facebook)
  if (title) setMeta('property', 'og:title', title);
  if (description) setMeta('property', 'og:description', description);
  if (absoluteImage) setMeta('property', 'og:image', absoluteImage);
  if (absoluteUrl) setMeta('property', 'og:url', absoluteUrl);
  setMeta('property', 'og:type', 'product');
  setMeta('property', 'og:site_name', 'Shaapar');
  setMeta('property', 'og:locale', 'en_US');

  // Set Twitter Card tags
  setMeta('name', 'twitter:card', 'summary_large_image');
  if (title) setMeta('name', 'twitter:title', title);
  if (description) setMeta('name', 'twitter:description', description);
  if (absoluteImage) setMeta('name', 'twitter:image', absoluteImage);
  setMeta('name', 'twitter:site', '@shaapar');

  // Set Canonical URL
  if (absoluteUrl) setLink('canonical', absoluteUrl);

  // Return cleanup function to restore default tags on unmount
  return () => {
    document.title = originalTitle;

    // Restore modified tags to their original content
    modifiedTags.forEach(({ el, originalContent, isLink }) => {
      const attrToUpdate = isLink ? 'href' : 'content';
      if (originalContent === null) {
        el.removeAttribute(attrToUpdate);
      } else {
        el.setAttribute(attrToUpdate, originalContent);
      }
    });

    // Remove newly appended tags
    addedTags.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };
};