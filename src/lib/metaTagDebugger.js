
/**
 * Utility to debug Open Graph and Twitter meta tags in the browser console.
 * Specifically useful for verifying WhatsApp, Facebook, and Twitter link previews.
 */
export const debugMetaTags = () => {
  // Safely check for development environment to prevent running in production
  let isDev = false;
  try {
    isDev = import.meta && import.meta.env && import.meta.env.DEV;
  } catch (e) {
    isDev = false;
  }

  if (!isDev) return;

  console.group('🔍 Meta Tag Debugger (SEO & Social Sharing)');

  console.info(
    '%cWhatsApp & Social Preview Testing Instructions:',
    'font-weight: bold; color: #25D366;'
  );
  console.log('1. Ensure your site is deployed to a public HTTPS URL (localhost will not work for WhatsApp crawler).');
  console.log('2. Use the Facebook Sharing Debugger to clear cache and test: https://developers.facebook.com/tools/debug/');
  console.log('3. Paste your public URL into a WhatsApp chat to see the live preview.');

  const titleEl = document.querySelector('title');
  console.log('📄 Document Title:', titleEl ? titleEl.innerText : 'Missing (Warning: Title is required)');

  // Gather Open Graph Tags
  const ogTags = document.querySelectorAll('meta[property^="og:"]');
  const ogData = Array.from(ogTags).map(tag => ({
    Property: tag.getAttribute('property'),
    Content: tag.getAttribute('content') || 'EMPTY'
  }));

  if (ogData.length > 0) {
    console.log('🔗 Open Graph Tags:');
    console.table(ogData);
  } else {
    console.warn('❌ No Open Graph (og:*) tags found in the document head!');
  }

  // Gather Twitter Tags
  const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
  const twitterData = Array.from(twitterTags).map(tag => ({
    Name: tag.getAttribute('name'),
    Content: tag.getAttribute('content') || 'EMPTY'
  }));

  if (twitterData.length > 0) {
    console.log('🐦 Twitter Card Tags:');
    console.table(twitterData);
  }

  // Specific validation for og:image (critical for WhatsApp)
  const ogImageTag = document.querySelector('meta[property="og:image"]');
  if (ogImageTag) {
    const imageUrl = ogImageTag.getAttribute('content');
    console.group('🖼️ og:image Validation');
    console.log('URL:', imageUrl);

    if (!imageUrl || imageUrl.trim() === '') {
      console.error('❌ og:image content is empty!');
    } else if (imageUrl.startsWith('/')) {
      console.error('❌ og:image is a relative URL! Social crawlers require absolute URLs (https://...).');
    } else if (!imageUrl.startsWith('https://') && !imageUrl.startsWith('http://localhost')) {
      console.warn('⚠️ og:image should typically be HTTPS.');
    } else {
      console.log('✅ og:image format looks valid.');

      // Test image loading
      const img = new Image();
      img.onload = () => console.log(`✅ Image loaded successfully (Dimensions: ${img.width}x${img.height})`);
      img.onerror = () => console.error('❌ Failed to load image. Make sure the URL is publicly accessible without authentication.');
      img.src = imageUrl;
    }
    console.groupEnd();
  } else {
    console.error('❌ Critical Error: og:image tag is missing! A preview image will not appear on WhatsApp.');
  }

  // Validate title and description
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle || !ogTitle.getAttribute('content') || ogTitle.getAttribute('content').trim() === '') {
    console.error('❌ Missing or empty og:title!');
  }

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc || !ogDesc.getAttribute('content') || ogDesc.getAttribute('content').trim() === '') {
    console.warn('⚠️ Missing or empty og:description.');
  }

  console.groupEnd();
};
