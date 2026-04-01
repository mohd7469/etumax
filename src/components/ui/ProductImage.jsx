import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import MiniLoader from './MiniLoader';

const ProductImage = ({
  src,
  alt = 'Product Image',
  className,
  aspectRatio = 'square',
  lazy = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const imgRef = useRef(null);

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'video' ? 'aspect-video' :
      aspectRatio === 'auto' ? 'aspect-auto' : '';

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const finalSrc = hasError || !src ? 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop' : src;

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-gray-100 flex items-center justify-center", aspectClass, className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <MiniLoader size={24} color="text-gray-400" />
        </div>
      )}

      {isVisible && (
        <img
          src={finalSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? "lazy" : "eager"}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          {...props}
        />
      )}

      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center p-2 z-10">
          Failed to load image
        </div>
      )}
    </div>
  );
};

export default ProductImage;