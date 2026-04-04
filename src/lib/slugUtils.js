
/**
 * Safely decodes and normalizes a slug, preserving Unicode/Arabic characters.
 */
export const normalizeSlug = (slug) => {
  if (!slug) return '';
  const strSlug = String(slug);

  let decoded = strSlug;
  try {
    decoded = decodeURIComponent(strSlug);
  } catch (e) {
    // If decodeURIComponent fails (e.g., malformed URI), fallback to the original string
    decoded = strSlug;
  }

  return decoded
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\|/g, '-') // Replace pipes with hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    // Remove characters that are NOT Unicode letters, numbers, marks, hyphens, or underscores
    .replace(/[^\p{L}\p{N}\p{M}\-_]+/gu, '-')
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generates a clean, normalized slug from a product name.
 */
export const generateSlug = (productName) => {
  if (!productName) return '';
  return normalizeSlug(productName);
};
