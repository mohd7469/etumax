
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Import central route configuration
import { routes as STATIC_ROUTES, defaultSEO } from '../src/config/routes.js';
import { baseURL } from '../src/config/routes.js';

// --- CONFIGURATION ---
const CANONICAL_DOMAIN = defaultSEO.canonicalBase || baseURL;
const DIST_PATH = './dist';
const DEFAULT_IMAGE = defaultSEO.defaultImage || baseURL + '/logo.png';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCkZGZfrdC-at2c3HDVCg_qqMZhtei2oXo",
  authDomain: "test-28-mar.firebaseapp.com",
  projectId: "test-28-mar",
  storageBucket: "test-28-mar.firebasestorage.app",
  messagingSenderId: "956303936022",
  appId: "1:956303936022:web:a0150702f258d9eb58c337"
};
// --- END CONFIGURATION ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeSlug = (slug) => {
  if (!slug) return '';
  const strSlug = String(slug);
  let decoded = strSlug;
  try { decoded = decodeURIComponent(strSlug); } catch (e) { decoded = strSlug; }
  return decoded.trim().toLowerCase().replace(/\|/g, '-').replace(/\s+/g, '-').replace(/[^\p{L}\p{N}\-_]+/gu, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

const generateSlug = (productName) => productName ? normalizeSlug(productName) : '';

const injectMetaTags = (html, metadata) => {
  const { title, description, url, image } = metadata;
  const finalImage = image || DEFAULT_IMAGE;
  
  const tags = `
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${finalImage}">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${finalImage}">
  `;

  let p = html;
  p = p.replace(/<title>[\s\S]*?<\/title>/gi, '');
  p = p.replace(/<meta[^>]+(?:name|property)=["'](?:description|keywords|robots|title)["'][^>]*>/gi, '');
  p = p.replace(/<meta[^>]+(?:name|property)=["'](?:og|twitter):[\s\S]*?["'][^>]*>/gi, '');
  p = p.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, '');
  return p.replace(/<\/head>/i, `${tags}\n</head>`);
};

const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : '';

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

const fixSEO = async () => {
  console.log("🚀 Starting SEO static page generation...");
  if (!fs.existsSync(DIST_PATH)) {
    console.error("❌ Dist folder not found! Build the project first.");
    process.exit(1);
  }
  const baseHtml = fs.readFileSync(path.join(DIST_PATH, 'index.html'), 'utf-8');

  console.log("📄 Processing static routes...");
  for (const [route, meta] of Object.entries(STATIC_ROUTES)) {
    const targetPath = route === '/' ? path.join(DIST_PATH, 'index.html') : path.join(DIST_PATH, route.startsWith('/') ? route.substring(1) : route, 'index.html');
    if (route !== '/') {
        const folder = path.dirname(targetPath);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    }
    const updatedHtml = injectMetaTags(baseHtml, { ...meta, url: route === '/' ? CANONICAL_DOMAIN : `${CANONICAL_DOMAIN}${route}/`, image: meta.image });
    fs.writeFileSync(targetPath, updatedHtml);
    console.log(` ✅ Generated: ${route}`);
  }

  console.log("📦 Fetching products from Firestore...");
  const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
    console.log(`✨ Found ${snapshot.size} products. Injecting tags...`);
    snapshot.forEach((doc) => {
      const p = doc.data();
      const slug = p.slug || generateSlug(p.name) || p.id;
      const folderPath = path.join(DIST_PATH, 'product', slug);
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
      const price = p.price ? ` - Only AED ${p.price}` : '';
      const productTitle = `${p.name}${price} | Etumax Official Store`;
      const productDesc = stripHtml(p.description || p.metaDescription || p.shortDescription || "").substring(0, 350);
      const productImage = (Array.isArray(p.images) && p.images[0]) || p.image;
      const updatedHtml = injectMetaTags(baseHtml, { title: productTitle, description: productDesc, url: `${CANONICAL_DOMAIN}/product/${slug}/`, image: productImage });
      fs.writeFileSync(path.join(folderPath, 'index.html'), updatedHtml);
    });
    console.log("✅ All static product pages generated!");
    unsub();
    process.exit(0);
  }, (error) => {
    console.error("❌ Firebase error:", error);
    process.exit(1);
  });
  setTimeout(() => {
    console.warn("⚠️ Snapshot timeout. Closing script.");
    process.exit(0);
  }, 30000);
};
fixSEO();
