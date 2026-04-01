import React, { useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import ProductCarouselCard from './ProductCarouselCard';
import { useDesign } from '@/context/DesignContext';
import { cn } from '@/lib/utils';

const CategoryProductCarousel = ({
  categoryId,
  title,
  autoPlay = true,
  speed = 30,
}) => {
  const { categories, products } = useProducts();
  const { getPageLayoutSettings } = useDesign();
  const layout = getPageLayoutSettings('home');
  const isFullWidth = layout?.widthType === 'full';

  const scrollRef = useRef(null);
  const autoPlayRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const isDownRef = useRef(false);
  const isHoverRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const movedRef = useRef(false);

  const category = useMemo(() => {
    return (categories || []).find(
      (c) =>
        String(c?.id) === String(categoryId) ||
        String(c?.slug) === String(categoryId)
    );
  }, [categories, categoryId]);

  const categoryProducts = useMemo(() => {
    if (!categoryId) return [];

    const categoryName = category?.name;

    return (products || []).filter((product) => {
      if (!product?.categories) return false;

      const productCategories = Array.isArray(product.categories)
        ? product.categories
        : [product.categories];

      return productCategories.some((c) => {
        if (!c) return false;

        if (typeof c === 'string') {
          return (
            String(c) === String(categoryId) ||
            String(c).toLowerCase() === String(categoryId).toLowerCase() ||
            (categoryName &&
              String(c).toLowerCase() === categoryName.toLowerCase())
          );
        }

        if (typeof c === 'object') {
          return (
            String(c.id) === String(categoryId) ||
            String(c.slug) === String(categoryId) ||
            (categoryName &&
              String(c.name || '').toLowerCase() ===
                categoryName.toLowerCase())
          );
        }

        return false;
      });
    });
  }, [category, products, categoryId]);

  const duplicatedProducts = useMemo(() => {
    if (!categoryProducts.length) return [];

    let base = [...categoryProducts];
    while (base.length < 10) {
      base = [...base, ...categoryProducts];
      if (base.length > 40) break;
    }

    return [...base, ...base];
  }, [categoryProducts]);

  const clearResumeTimeout = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      cancelAnimationFrame(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const startAutoPlay = () => {
    const slider = scrollRef.current;
    if (!slider || !autoPlay || duplicatedProducts.length <= 1) return;

    stopAutoPlay();

    let lastTime = 0;

    const step = (time) => {
      const currentSlider = scrollRef.current;
      if (!currentSlider) return;

      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      if (!isDownRef.current && !isHoverRef.current) {
        const moveBy = (speed / 20) * (delta / 16);
        currentSlider.scrollLeft += moveBy;

        const halfWidth = currentSlider.scrollWidth / 2;
        if (currentSlider.scrollLeft >= halfWidth) {
          currentSlider.scrollLeft -= halfWidth;
        }
      }

      autoPlayRef.current = requestAnimationFrame(step);
    };

    autoPlayRef.current = requestAnimationFrame(step);
  };

  const pauseAndResumeAutoPlay = (delay = 1200) => {
    stopAutoPlay();
    clearResumeTimeout();

    resumeTimeoutRef.current = setTimeout(() => {
      if (!isDownRef.current && !isHoverRef.current) {
        startAutoPlay();
      }
    }, delay);
  };

  useEffect(() => {
    startAutoPlay();

    return () => {
      stopAutoPlay();
      clearResumeTimeout();
    };
  }, [autoPlay, speed, duplicatedProducts.length]);

  const scroll = (direction) => {
    const slider = scrollRef.current;
    if (!slider) return;

    const scrollAmount = 260;

    pauseAndResumeAutoPlay();

    slider.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e) => {
    const slider = scrollRef.current;
    if (!slider) return;

    stopAutoPlay();
    clearResumeTimeout();

    isDownRef.current = true;
    movedRef.current = false;
    startXRef.current = e.pageX - slider.offsetLeft;
    scrollLeftRef.current = slider.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
    isHoverRef.current = false;
    pauseAndResumeAutoPlay(800);
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
    pauseAndResumeAutoPlay(800);
  };

  const handleMouseMove = (e) => {
    const slider = scrollRef.current;
    if (!isDownRef.current || !slider) return;

    e.preventDefault();

    const x = e.pageX - slider.offsetLeft;
    const walk = x - startXRef.current;

    if (Math.abs(walk) > 5) {
      movedRef.current = true;
    }

    slider.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTouchStart = (e) => {
    const slider = scrollRef.current;
    if (!slider) return;

    stopAutoPlay();
    clearResumeTimeout();

    isDownRef.current = true;
    movedRef.current = false;
    startXRef.current = e.touches[0].pageX - slider.offsetLeft;
    scrollLeftRef.current = slider.scrollLeft;
  };

  const handleTouchMove = (e) => {
    const slider = scrollRef.current;
    if (!isDownRef.current || !slider) return;

    const x = e.touches[0].pageX - slider.offsetLeft;
    const walk = x - startXRef.current;

    if (Math.abs(walk) > 5) {
      movedRef.current = true;
    }

    slider.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTouchEnd = () => {
    isDownRef.current = false;
    pauseAndResumeAutoPlay(800);
  };

  if (!categoryProducts.length) {
    return (
      <div className=" container mx-auto px-4 mb-1">
        <Layers className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No products found in the selected category.</p>
      </div>
    );
  }

  const wrapperClass = isFullWidth
    ? 'w-full'
    : 'container mx-auto px-4 mb-1';

  const paddingClass = isFullWidth
    ? 'px-0 sm:px-0'
    : 'px-0';

  return (
    <div className={cn(wrapperClass, paddingClass, 'relative py-1')}>
      <button
        type="button"
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-30 bg-white border shadow-sm rounded-full w-8 h-8 items-center justify-center hover:bg-gray-100"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-30 bg-white border shadow-sm rounded-full w-8 h-8 items-center justify-center hover:bg-gray-100"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div
        ref={scrollRef}
        onMouseEnter={() => {
          isHoverRef.current = true;
        }}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-full flex items-stretch gap-2 overflow-x-auto scrollbar-hide pb-1 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `.scrollbar-hide::-webkit-scrollbar { display: none; }`,
          }}
        />

        {duplicatedProducts.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="shrink-0 pointer-events-auto"
            onClick={(e) => {
              if (movedRef.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <ProductCarouselCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProductCarousel;