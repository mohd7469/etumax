import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeo } from '@/context/SeoContext';

const SeoHead = ({ 
  title, 
  description, 
  image, 
  type = 'website', 
  path = '',
  publishedTime,
  modifiedTime,
  schema,
  product,
  children
}) => {
  const { generalSettings } = useSeo();
  
  // Task 2: Log received product prop to confirm data is available
  useEffect(() => {
    if (product) {
      console.log('[SEO Flow - Task 2] SeoHead received product prop:', {
        id: product.id,
        name: product.name || product.title,
        hasDescription: !!(product.description || product.short_description),
        mainImage: product.mainImage,
        rawProduct: product
      });
    }
  }, [product]);
  
  // Establish Production Base URL
  const PRODUCTION_DOMAIN = 'https://test.pharmilow.com';
  
  // Priority 1: Use window.location.href if available for exact absolute URL, else fallback to constructed path
  let currentUrl = typeof window !== 'undefined' ? window.location.href : PRODUCTION_DOMAIN;
  if (typeof window === 'undefined' && path) {
    const cleanPath = path.replace(/^\/+/, '');
    currentUrl = cleanPath ? `${PRODUCTION_DOMAIN}/${cleanPath}` : PRODUCTION_DOMAIN;
  }

  // Extract dynamic values either from standard props or the provided product object
  let finalTitle = title;
  let finalDesc = description;
  let finalImage = image;
  let finalType = type;

  // Task 2: Update meta tag generation to use product data when available
  if (product) {
    finalTitle = product.name || product.title || finalTitle;
    finalDesc = (product.short_description || product.description || '').replace(/<[^>]*>?/gm, '').substring(0, 160) || finalDesc;
    finalImage = product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : null) || finalImage;
    finalType = 'product';
  }

  // Title Logic
  const siteTitle = generalSettings?.title || 'Pharmilow';
  const metaTitle = finalTitle && finalTitle !== siteTitle 
    ? `${finalTitle} | ${siteTitle}` 
    : siteTitle;

  // Description Logic
  let rawDescription = finalDesc || generalSettings?.metaDescription || '';
  // Strip HTML tags if any to ensure clean text
  rawDescription = rawDescription.replace(/<[^>]*>?/gm, '');
  
  let metaDescription = rawDescription;
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + '...';
  }

  // Image Logic - Ensure Absolute URLs & Fallback
  const FALLBACK_IMAGE = `${PRODUCTION_DOMAIN}/og/default.jpg`;
  let metaImage = finalImage || generalSettings?.ogImage || FALLBACK_IMAGE;

  if (metaImage && !metaImage.startsWith('http')) {
    metaImage = `${PRODUCTION_DOMAIN}${metaImage.startsWith('/') ? '' : '/'}${metaImage}`;
  }

  // Log final computed tags for debugging
  useEffect(() => {
    if (product) {
       console.log('[SEO Flow - Task 4] Final Meta Tags Generated for Product:', {
         'og:title': metaTitle,
         'og:description': metaDescription,
         'og:image': metaImage,
         'og:url': currentUrl
       });
    }
  }, [metaTitle, metaDescription, metaImage, currentUrl, product]);

  return (
    <Helmet>
      {/* Standard Meta */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Canonical URLs */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={finalType} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:secure_url" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Article / Product specific tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:domain" content={PRODUCTION_DOMAIN.replace('https://', '')} />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      {generalSettings?.twitterHandle && (
        <meta name="twitter:site" content={generalSettings.twitterHandle} />
      )}

      {/* JSON-LD Schema generated dynamically */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Additional nested tags if provided */}
      {children}
    </Helmet>
  );
};

export default SeoHead;