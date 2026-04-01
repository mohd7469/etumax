
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Papa from 'papaparse';

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function compressImage(imageUrl, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (error) => {
      console.debug("Failed to load image:", imageUrl, error);
      resolve(imageUrl);
    };
  });
}

export function downloadCsv(data, filename = 'export.csv') {
  if (!data || data.length === 0) return;
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const requestIdle = (cb) => {
  if ('requestIdleCallback' in window) return window.requestIdleCallback(cb);
  return setTimeout(cb, 1);
};

export const imageCache = {
  set: (key, value) => {
    try {
      localStorage.setItem(`img_cache_${key}`, JSON.stringify({ url: value, timestamp: Date.now() }));
    } catch (e) {}
  },
  get: (key) => {
    try {
      const cached = localStorage.getItem(`img_cache_${key}`);
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) return url;
        localStorage.removeItem(`img_cache_${key}`);
      }
    } catch (e) {}
    return null;
  }
};

export const IMAGE_CONFIG = { timeout: 5000, maxRetries: 2, initialDelay: 500 };

export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  if (url.startsWith('/')) return true;
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image')) return false;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('firebasestorage.googleapis.com') && !parsed.pathname.includes('/o/')) return false;
    return true;
  } catch (e) { return false; }
};

export const validateImageUrl = async (url, fallbackUrl = 'https://ae.pharmacydxb.ae/wp-content/uploads/2026/03/Untitled-1.png') => {
  if (!isValidImageUrl(url)) return fallbackUrl;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok && response.headers.get('content-type')?.startsWith('image/')) return url;
    return fallbackUrl;
  } catch (error) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(fallbackUrl);
      img.src = url;
    });
  }
};

export const getOptimizedOGImageUrl = (url) => {
  if (!isValidImageUrl(url)) return null;
  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    if (urlObj.hostname.includes('firebasestorage.googleapis.com') && !urlObj.searchParams.has('alt')) {
      urlObj.searchParams.set('alt', 'media');
    }
    urlObj.searchParams.set('w', '1200');
    urlObj.searchParams.set('h', '630');
    urlObj.searchParams.set('fit', 'crop');
    urlObj.searchParams.set('q', '90');
    return urlObj.toString();
  } catch (e) { return url; }
};

export const getProductSlug = (product) => {
  if (!product) return '';
  if (product.slug) return product.slug;
  if (product.name) {
    return product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  return product.id || Math.random().toString(36).substr(2, 9);
};
