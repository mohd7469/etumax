
let translatingState = false;

export const initializeGoogleTranslate = () => {
  if (!window.google || !window.google.translate) {
    console.warn("Google Translate script not fully loaded yet or initialization pending.");
  }
};

export const translateToLanguage = (langCode) => {
  return new Promise((resolve) => {
    translatingState = true;

    try {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        // Map common codes to Google's expected formats
        let googleCode = langCode;
        if (langCode === 'fil') googleCode = 'tl';
        if (langCode === 'zh') googleCode = 'zh-CN';

        select.value = googleCode;
        select.dispatchEvent(new Event('change'));
      } else {
        console.warn('Google Translate selector (.goog-te-combo) not found in DOM.');
      }
    } catch (err) {
      console.error('Error triggering Google Translate:', err);
    }

    // Google Translate doesn't emit a completion event for translations.
    // We use a timeout to simulate the loading state gracefully.
    setTimeout(() => {
      translatingState = false;
      resolve();
    }, 1000);
  });
};

export const isTranslating = () => {
  return translatingState;
};

export const getCurrentLanguage = () => {
  try {
    const select = document.querySelector('.goog-te-combo');
    if (select && select.value) {
      return select.value;
    }
    
    // Fallback: Check cookies for googtrans
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match) {
      const parts = match[2].split('/');
      return parts[parts.length - 1];
    }
  } catch (err) {
    console.error('Error getting current language:', err);
  }
  return 'en'; // Default
};
