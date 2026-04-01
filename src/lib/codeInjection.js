
import DOMPurify from 'dompurify';

/**
 * Sanitizes input HTML/JS/CSS to prevent malicious XSS while allowing safe script/style tags.
 * Designed for trusted Admin inputs like Google Analytics, Meta Pixels, custom styles.
 */
export const sanitizeCode = (code) => {
  if (!code) return '';
  return DOMPurify.sanitize(code, {
    ADD_TAGS: ['script', 'style', 'iframe', 'noscript', 'meta', 'link'],
    ADD_ATTR: [
      'async', 'defer', 'src', 'type', 'charset', 'content',
      'name', 'rel', 'href', 'property', 'crossorigin', 'integrity', 'id'
    ],
    FORCE_BODY: true,
  });
};

/**
 * Injects HTML/JS/CSS string into the specified location of the document safely.
 */
const injectCode = (id, code, location) => {
  let container = document.getElementById(id);

  if (!container) {
    container = document.createElement('div');
    container.id = id;
    container.style.display = 'none';

    if (location === 'head') {
      // Best effort for head injection without breaking other tags
      document.head.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
  }

  // Clean the injection container first
  container.innerHTML = '';

  const cleanCode = sanitizeCode(code);
  if (!cleanCode.trim()) return;

  try {
    // We use createContextualFragment so that <script> tags injected via innerHTML actually execute.
    const range = document.createRange();
    range.selectNode(document.body);
    const fragment = range.createContextualFragment(cleanCode);
    container.appendChild(fragment);
  } catch (error) {
    console.error(`Code injection failed for container ${id}:`, error);
  }
};

/**
 * Injects code into the document <head>.
 */
export const injectHeaderCode = (code) => {
  injectCode('shophub-custom-header-injection', code, 'head');
};

/**
 * Injects code before the closing </body> tag.
 */
export const injectFooterCode = (code) => {
  injectCode('shophub-custom-footer-injection', code, 'body');
};

/**
 * Injects custom CSS into the document head.
 * Creates or updates a <style> tag with the given CSS.
 * @param {string} css - The CSS code to inject
 * @returns {Function} Cleanup function to remove the injected CSS
 */
export const injectCustomCSS = (css) => {
  const styleId = 'custom-css-style';
  let styleElement = document.getElementById(styleId);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.setAttribute('data-description', 'Custom CSS injected from Admin Panel');
    document.head.appendChild(styleElement);
    console.log('[CSS Injection] Created new style element');
  }

  // Update the CSS content
  styleElement.textContent = css || '';
  
  if (css && css.trim()) {
    console.log('[CSS Injection] Updated custom CSS:', css.substring(0, 100) + (css.length > 100 ? '...' : ''));
  } else {
    console.log('[CSS Injection] Cleared custom CSS');
  }

  // Return cleanup function
  return () => {
    const el = document.getElementById(styleId);
    if (el) {
      el.remove();
      console.log('[CSS Injection] Cleaned up style element');
    }
  };
};

/**
 * Removes previously injected scripts/styles (Useful during resets or unmounting).
 */
export const cleanupInjectedCode = () => {
  const header = document.getElementById('shophub-custom-header-injection');
  if (header) header.remove();

  const footer = document.getElementById('shophub-custom-footer-injection');
  if (footer) footer.remove();
  
  const customCss = document.getElementById('custom-css-style');
  if (customCss) customCss.remove();
};
