import React from 'react';
import { motion } from 'framer-motion';
import ImageOptimizer from '@/components/ui/ImageOptimizer';

const CartNotificationCarousel = ({ cartItems }) => {
    // Show last 3 items
    const displayItems = cartItems.slice(-3);

    if (displayItems.length === 0) return null;

    return (
        <div className="flex -space-x-3 overflow-hidden py-1 pl-1">
            {displayItems.map((item, idx) => (
                <motion.div
                    key={`${item.id}-${item.optionsIdentifier || idx}`}
                    initial={{ opacity: 0, scale: 0.5, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                    className="inline-block h-10 w-10 sm:h-12 sm:w-12 rounded-full ring-2 ring-red-500 bg-white overflow-hidden flex-shrink-0 z-10 shadow-sm"
                    style={{ zIndex: displayItems.length - idx }}
                >
                    <ImageOptimizer 
                        src={item.images?.[0] || item.image || item.mainImage} 
                        alt={item.name} 
                        className="h-full w-full object-cover" 
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default CartNotificationCarousel;