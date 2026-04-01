
export const validateSitemapFiles = (files) => {
  const errors = [];
  const results = {};

  Object.entries(files).forEach(([filename, content]) => {
    results[filename] = { valid: true, errors: [] };

    // Common validations
    if (!content || typeof content !== 'string') {
      results[filename].valid = false;
      results[filename].errors.push('File is empty or not a string.');
      errors.push(`${filename}: File is empty.`);
      return;
    }

    if (filename.endsWith('.xml')) {
      // 1. Check XML declaration on line 1 with no leading spaces
      if (!content.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
        results[filename].valid = false;
        results[filename].errors.push('Missing or invalid XML declaration at start of file. Ensure no blank lines exist before it.');
      }

      // 2. Validate basic structure
      if (filename === 'sitemap_index.xml') {
        if (!content.includes('<sitemapindex') || !content.includes('</sitemapindex>')) {
          results[filename].valid = false;
          results[filename].errors.push('Missing <sitemapindex> wrapper.');
        }
      } else {
        if (!content.includes('<urlset') || !content.includes('</urlset>')) {
          results[filename].valid = false;
          results[filename].errors.push('Missing <urlset> wrapper.');
        }
      }

      // 3. Check for absolute URLs
      const locRegex = /<loc>(.*?)<\/loc>/g;
      let match;
      while ((match = locRegex.exec(content)) !== null) {
        const url = match[1];
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          results[filename].valid = false;
          results[filename].errors.push(`Found relative URL: ${url}. All URLs must be absolute.`);
        }
      }

      // 4. Validate Date formats (YYYY-MM-DD)
      const dateRegex = /<lastmod>(.*?)<\/lastmod>/g;
      while ((match = dateRegex.exec(content)) !== null) {
        const date = match[1];
        // Allow full ISO strings or YYYY-MM-DD
        const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date) || !isNaN(Date.parse(date));
        if (!isValidDate) {
          results[filename].valid = false;
          results[filename].errors.push(`Invalid date format found: ${date}. Expected YYYY-MM-DD.`);
        }
      }
    } else if (filename === 'robots.txt') {
      if (!content.includes('User-agent:') || !content.includes('Sitemap:')) {
        results[filename].valid = false;
        results[filename].errors.push('robots.txt missing required User-agent or Sitemap directives.');
      }
    }

    if (!results[filename].valid) {
      errors.push(`${filename} has ${results[filename].errors.length} validation errors.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    details: results
  };
};
