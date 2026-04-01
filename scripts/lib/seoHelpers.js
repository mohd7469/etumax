
export const stripHtmlTags = (html) => {
  if (!html) return '';
  return String(html).replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
};

export const truncateDescription = (text, maxLength = 160) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const sanitizeUrl = (urlStr) => {
  try {
    return new URL(urlStr).toString();
  } catch (e) {
    return '';
  }
};

export const formatDateForSitemap = (dateInput) => {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    return date.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

export const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const escapeHtml = escapeXml;

export const getProductSlug = (product) => {
  if (!product) return '';
  if (product.slug) return product.slug;
  if (product.name) {
    return product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  return product.id || 'unknown-product';
};
