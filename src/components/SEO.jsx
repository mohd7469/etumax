
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { routes, defaultSEO } from '@/config/routes';

const SEO = ({ 
  title, 
  description, 
  image, 
  type = 'website', 
  canonical, 
  schema 
}) => {
  const { pathname } = useLocation();
  
  // Find route metadata if not provided via props
  const routeMeta = routes[pathname] || routes[Object.keys(routes).find(key => pathname.startsWith(key) && key !== '/')];
  
  const finalTitle = title || (routeMeta?.title) || defaultSEO.title;
  const finalDescription = description || (routeMeta?.description) || defaultSEO.description;
  const finalCanonical = canonical || `${defaultSEO.canonicalBase}${pathname.endsWith('/') ? pathname : pathname + '/'}`;
  const finalImage = image || (routeMeta?.image) || defaultSEO.defaultImage || `${defaultSEO.canonicalBase}/logo.png`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={finalCanonical} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalImage} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
