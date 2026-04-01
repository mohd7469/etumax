
# SEO Pre-rendering & Static Generation

This project uses a custom Node.js script approach to pre-render dynamic content (like products) into static HTML files for better SEO, Open Graph visibility, and Social Media sharing.

## How It Works

1. **`npm run build:seo`**: This command executes our custom scripts.
2. **`generate-product-pages.js`**: Connects to Firebase, fetches all products, and generates a `.html` file inside `public/product/` for each one. These files contain essential SEO meta tags and JSON-LD schema, wrapping a hydration root (`<div id="root">`) that allows React to take over seamlessly.
3. **`generate-sitemap.js`**: Connects to Firebase and creates a standard `sitemap.xml` file in `public/` mapping all active products, categories, and custom pages.
4. **Vite Build Process**: Since these files are generated inside `public/`, Vite automatically copies them to the final `dist/` folder during the standard build step.

## Running the Build

To generate the site including the SEO assets:

