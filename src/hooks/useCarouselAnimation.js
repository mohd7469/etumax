import { useState, useRef } from 'react';
import { useAnimationFrame, useMotionValue } from 'framer-motion';

export const useCarouselAnimation = ({
  containerRef,
  autoPlay = true,
  speed = 30
}) => {
  const x = useMotionValue(0);

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startTranslateX: 0
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useAnimationFrame((t, delta) => {
    const container = containerRef.current;
    if (!container) return;

    const fullWidth = container.scrollWidth;
    const loopWidth = fullWidth / 2;

    if (!loopWidth) return;

    let currentX = x.get();

    // Auto move only when not dragging and not hovered
    if (autoPlay && !dragRef.current.isDragging && !isHovered) {
      const moveBy = (speed / 28) * (delta / 16);
      currentX -= moveBy;
    }

    // Seamless infinite wrap
    if (currentX <= -loopWidth) {
      currentX += loopWidth;
      if (dragRef.current.isDragging) {
        dragRef.current.startTranslateX += loopWidth;
      }
    } else if (currentX > 0) {
      currentX -= loopWidth;
      if (dragRef.current.isDragging) {
        dragRef.current.startTranslateX -= loopWidth;
      }
    }

    x.set(currentX);
  });

  const getClientX = (e) => {
    if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
    if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientX;
    return e.clientX;
  };

  const handlePointerDown = (e) => {
    if (e.type === 'mousedown' && e.button !== 0) return;

    dragRef.current.isDragging = true;
    dragRef.current.startX = getClientX(e);
    dragRef.current.startTranslateX = x.get();
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;

    const currentClientX = getClientX(e);
    const diff = currentClientX - dragRef.current.startX;

    x.set(dragRef.current.startTranslateX + diff);
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
    setIsDragging(false);
  };

  return {
    x,
    isDragging,
    handlers: {
      onMouseDown: handlePointerDown,
      onMouseMove: handlePointerMove,
      onMouseUp: handlePointerUp,
      onMouseLeave: () => {
        handlePointerUp();
        setIsHovered(false);
      },
      onMouseEnter: () => setIsHovered(true),
      onTouchStart: handlePointerDown,
      onTouchMove: handlePointerMove,
      onTouchEnd: handlePointerUp,
      onTouchCancel: handlePointerUp,
      onDragStart: (e) => e.preventDefault()
    }
  };
};