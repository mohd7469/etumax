import React, { useState, useEffect, useRef } from 'react';
import ImageSkeleton from './ImageSkeleton';
import { cn, imageCache, requestIdle, isValidImageUrl, IMAGE_CONFIG } from '@/lib/utils';
import { getOptimizedImageUrl } from '@/lib/firebaseStorage';

// Global cache for failed image URLs to prevent infinite retries
const failedUrlCache = new Set();

export default function ImageOptimizer({
  src,
  alt,
  className,
  fallback = 'https://ae.pharmacydxb.ae/wp-content/uploads/2026/03/Untitled-1.png',
  quality = 0.8,
  width = 300,
  height = 300,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(null);
  const imgRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const loadImageWithRetry = (url, retries = IMAGE_CONFIG.maxRetries, delay = IMAGE_CONFIG.initialDelay) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let timer;

      const cleanup = () => {
        clearTimeout(timer);
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        resolve(url);
      };

      img.onerror = () => {
        cleanup();
        if (retries > 0) {
          console.debug(`Image failed, retrying. Retries left: ${retries} for ${url}`);
          setTimeout(() => {
            if (!isMounted.current) return;
            loadImageWithRetry(url, retries - 1, delay * 2)
              .then(resolve)
              .catch(reject);
          }, delay);
        } else {
          reject(new Error('Image failed to load after retries'));
        }
      };

      timer = setTimeout(() => {
        cleanup();
        img.src = ''; // Cancel loading
        if (retries > 0) {
          console.debug(`Image timeout, retrying. Retries left: ${retries} for ${url}`);
          setTimeout(() => {
            if (!isMounted.current) return;
            loadImageWithRetry(url, retries - 1, delay * 2)
              .then(resolve)
              .catch(reject);
          }, delay);
        } else {
          reject(new Error('Image loading timed out'));
        }
      }, IMAGE_CONFIG.timeout);

      img.src = url;
    });
  };

  useEffect(() => {
    if (!isVisible) return;

    const validatedSrc = isValidImageUrl(src) ? src : null;

    if (!validatedSrc || failedUrlCache.has(validatedSrc)) {
      setHasError(true);
      setIsLoaded(true);
      setOptimizedSrc(fallback);
      return;
    }

    requestIdle(async () => {
      let finalUrl = validatedSrc;

      const cached = imageCache.get(validatedSrc);
      if (cached) {
        finalUrl = cached;
      } else {
        const optimized = getOptimizedImageUrl(validatedSrc, width, height, quality);
        if (optimized) {
          finalUrl = optimized;
          imageCache.set(validatedSrc, optimized);
        }
      }

      try {
        await loadImageWithRetry(finalUrl);
        if (isMounted.current) {
          setOptimizedSrc(finalUrl);
          setIsLoaded(true);
        }
      } catch (err) {
        if (isMounted.current) {
          console.debug('ImageOptimizer fell back to placeholder due to:', err.message, src);
          failedUrlCache.add(validatedSrc);
          setOptimizedSrc(fallback);
          setHasError(true);
          setIsLoaded(true);
        }
      }
    });
  }, [isVisible, src, width, height, quality, fallback]);

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden w-full h-full", className)}>
      {!isLoaded && <ImageSkeleton className="absolute inset-0 w-full h-full" />}
      {isVisible && optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt || "Image"}
          className={cn(
            "w-full h-full object-cover fade-in-image transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}