import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useOpenGraph } from '@/hooks/useOpenGraph';
import { validateAndNormalizeImageUrl } from '@/lib/metaTags';

const OpenGraphMeta = ({
  title,
  description,
  image,
  url,
  type,
  price,
  currency,
  siteName,
}) => {
  const normalizedImage = image ? validateAndNormalizeImageUrl(image) : null;

  useEffect(() => {
    console.log('[OpenGraphMeta] Component mounted or props updated.', {
      title,
      originalImage: image,
      normalizedImage,
      url,
    });
  }, [title, image, normalizedImage, url]);

  const metaTags = useOpenGraph({
    title,
    description,
    image: normalizedImage,
    url,
    type,
    price,
    currency,
    siteName,
  });

  useEffect(() => {
    if (metaTags && metaTags.length > 0) {
      console.log('[OpenGraphMeta] Final meta tags being injected into Helmet:', metaTags);
    }
  }, [metaTags]);

  if (!metaTags || metaTags.length === 0) {
    return null;
  }

  return (
    <Helmet prioritizeSeoTags>
      {metaTags.map((tag, index) => (
        <meta
          key={`og-meta-${index}`}
          {...(tag.property ? { property: tag.property } : { name: tag.name })}
          content={tag.content}
        />
      ))}
    </Helmet>
  );
};

export default OpenGraphMeta;