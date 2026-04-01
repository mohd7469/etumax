
# Client-Side SEO Architecture

This project has migrated from a build-time Static Site Generation (SSG) SEO strategy to a dynamic Client-Side rendering and Service Worker interception approach. This ensures faster build times while maintaining robust SEO performance for modern crawlers.

## How it works

1. **Client-Side Injection**:
   When a user navigates to a product page (`/product/:slug`), React hooks in `ProductDetailPage.jsx` fire off utilities from `src/lib/seoPrerender.js`. These utilities instantly append or update the `<title>`, `<meta>` (OpenGraph, Twitter Cards), and JSON-LD schema within `<head>`. 

2. **React Helmet Fallbacks**:
   `react-helmet-async` ensures that default, site-wide SEO fallbacks are rendered smoothly alongside our imperative `updateDocumentHead()` updates. 

3. **Service Worker Interception**:
   `src/service-worker.js` intercepts all navigational requests. For pages matching `/product/`, the Service Worker caches network responses. If a network request fails (e.g. offline mode), it falls back seamlessly, keeping performance high and search bot indexability robust via Cache APIs.

4. **Dynamic Sitemap XML**:
   `sitemap.xml` is now served through a React component (`src/pages/SitemapPage.jsx`). When a user or crawler accesses `/sitemap.xml`, the component dynamically calculates the active product catalogs, categories, and dynamic pages, and overrides the document with pure XML structure inside a pre-formatted block, which search engines parse directly.

5. **Caching SEO Data**:
   `src/lib/seoCache.js` saves recent product meta layouts to `localStorage` so that if users return to the same product, metadata restores instantly, preventing layout jumping or empty tags while Firestore data is fetching. Cache invalidates automatically after 24 hours.

## Troubleshooting

- **Meta tags not updating on navigation:** Ensure that the `updateDocumentHead(product)` call fires inside the `useEffect` within `ProductDetailPage.jsx` when the `product` object changes.
- **Service Worker errors in dev mode:** The Service Worker is currently registered as `/src/service-worker.js` inside `index.html`. For production builds without specific PWA plugins, you may need to explicitly configure your bundler to copy it, or move it to `public/service-worker.js`.
- **Sitemap XML renders as HTML:** Because this is an SPA environment, the `sitemap.xml` route uses `document.documentElement.innerHTML` replacement to render valid XML string structures on screen. Crawlers usually evaluate text structures reliably, but for strict MIME-type (`application/xml`) validation, SSR or Cloudflare/Vercel edge workers must append header overwrites.

## Cache Invalidation
Use the exported function `invalidateAllSEOCache()` or `invalidateProductSEOCache(id)` from `seoCache.js` anywhere in your code to force a refresh on the SEO meta tags for targeted products.
