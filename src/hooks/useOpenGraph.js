
import { useMemo } from 'react';

const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1200&h=630&auto=format&fit=crop';

export const useOpenGraph = ({
  title,
  description,
  image,
  url,
  type = 'website',
  price,
  currency = 'AED',
  siteName = '',
}) => {
  return useMemo(() => {
    const fallbackUrl = typeof window !== 'undefined' ? window.location.href : '';
    const currentUrl = url || fallbackUrl;
    const validImage = image || DEFAULT_OG_IMAGE;

    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanDescription = typeof description === 'string' ? description.trim() : '';
    const cleanSiteName = typeof siteName === 'string' ? siteName.trim() : '';

    if (!cleanTitle && !cleanDescription && !currentUrl && !validImage) {
      return [];
    }

    const newTags = [
      ...(cleanSiteName ? [{ property: 'og:site_name', content: cleanSiteName }] : []),
      ...(cleanTitle ? [{ property: 'og:title', content: cleanTitle }] : []),
      ...(cleanDescription ? [{ property: 'og:description', content: cleanDescription }] : []),
      { property: 'og:type', content: type },
      ...(currentUrl ? [{ property: 'og:url', content: currentUrl }] : []),
      ...(validImage
        ? [
            { property: 'og:image', content: validImage },
            { property: 'og:image:secure_url', content: validImage },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            {
              property: 'og:image:alt',
              content: cleanTitle || cleanDescription || 'Product Image',
            },
          ]
        : []),
      { name: 'twitter:card', content: 'summary_large_image' },
      ...(cleanTitle ? [{ name: 'twitter:title', content: cleanTitle }] : []),
      ...(cleanDescription ? [{ name: 'twitter:description', content: cleanDescription }] : []),
      ...(validImage
        ? [
            { name: 'twitter:image', content: validImage },
            {
              name: 'twitter:image:alt',
              content: cleanTitle || cleanDescription || 'Product Image',
            },
          ]
        : []),
    ];

    if (type === 'product' && price !== undefined && price !== null) {
      newTags.push({ property: 'product:price:amount', content: String(price) });
      newTags.push({ property: 'product:price:currency', content: currency });
    }

    return newTags.filter((tag) => tag.content);
  }, [title, description, image, url, type, price, currency, siteName]);
};
