
export const saveSitemapMetadata = (timestamp, stats) => {
  try {
    const data = {
      lastGenerated: timestamp,
      ...stats
    };
    localStorage.setItem('sitemapMetadata', JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Error saving sitemap metadata', error);
    return null;
  }
};

export const getSitemapMetadata = () => {
  try {
    const data = localStorage.getItem('sitemapMetadata');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting sitemap metadata', error);
    return null;
  }
};

export const clearSitemapMetadata = () => {
  try {
    localStorage.removeItem('sitemapMetadata');
  } catch (error) {
    console.error('Error clearing sitemap metadata', error);
  }
};

export const formatSitemapDate = (isoString) => {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
