/**
 * A wrapper around the native fetch API to handle CORS issues via your own proxy.
 * Automatically prepends the proxy URL to external requests.
 */
export const apiFetch = async (url, options = {}) => {
  const PROXY_URL = 'https://proxy.pharmacydxb.ae/proxy.php?url=';

  if (!url || typeof url !== 'string') {
    const errorMsg = `Invalid URL passed to apiFetch: ${url}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (window.location.protocol === 'https:' && url.startsWith('http:')) {
    const errorMsg = `Mixed Content Error: Cannot fetch insecure resource '${url}' from a secure page.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const isExternal = /^https?:\/\//i.test(url);
  const finalUrl = isExternal ? `${PROXY_URL}${encodeURIComponent(url)}` : url;

  const headers = {
    ...options.headers,
  };

  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {
        errorBody = '[Could not read response body]';
      }

      console.error('API Fetch Error:', {
        url: finalUrl,
        originalUrl: url,
        status: response.status,
        statusText: response.statusText,
        bodySnippet: errorBody.substring(0, 300),
      });

      throw new Error(`API Request Failed (${response.status}): ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Network Error during apiFetch:', {
      url: finalUrl,
      originalUrl: url,
      error: error?.message || 'Unknown error',
    });
    throw error;
  }
};