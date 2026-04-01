import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import CartNotificationCarousel from './CartNotificationCarousel';

const CartNotificationPopup = ({ isVisible, onClose, cartItems, onNavigateToCart }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed bottom-24 lg:bottom-12 left-0 right-0 z-[60] flex justify-center pointer-events-none px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="w-full max-w-[350px]"
                    >
                        <div 
                            onClick={onNavigateToCart}
                            className="pointer-events-auto bg-red-500 hover:bg-red-600 transition-all transform hover:scale-105 duration-200 text-white rounded-full shadow-2xl px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer border border-red-400/30"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {totalItems > 0 ? (
                                    <CartNotificationCarousel cartItems={cartItems} />
                                ) : (
                                    <ShoppingBag className="w-5 h-5 ml-2 flex-shrink-0" />
                                )}
                                <span className="font-medium text-sm whitespace-nowrap truncate">
                                    View cart ({totalItems} item{totalItems !== 1 ? 's' : ''})
                                </span>
                            </div>
                            <button
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onClose(); 
                                }}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 mr-1"
                                aria-label="Close notification"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CartNotificationPopup;