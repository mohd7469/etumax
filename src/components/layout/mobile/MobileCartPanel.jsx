
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/ui/ProductImage';
import { useGlobalMobileSpacing } from '@/hooks/useGlobalMobileSpacing';

const MobileCartPanel = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartSubtotal } = useCart();
  const { formatPrice } = useProducts();
  const navigate = useNavigate();
  const { paddingX } = useGlobalMobileSpacing();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleNavigateToProducts = () => {
    onClose();
    navigate('/products');
  };

  const getImageUrl = (item) => {
    return item.images && item.images.length > 0
      ? item.images[0]
      : 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[1000] w-[85vw] max-w-[340px] bg-background shadow-2xl flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card" style={{ paddingLeft: `${paddingX}px`, paddingRight: `${paddingX}px` }}>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground tracking-tight">Your Cart</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-muted/20" style={{ paddingLeft: `${paddingX}px`, paddingRight: `${paddingX}px` }}>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Your cart is empty</h3>
                    <p className="text-sm text-muted-foreground mt-1">Looks like you haven't added anything yet.</p>
                  </div>
                  <Button onClick={handleNavigateToProducts} className="mt-4 rounded-xl px-6">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  {cartItems.map((item) => {
                    const price = item.salePrice || item.price || 0;
                    
                    return (
                      <div 
                        key={`${item.id}-${JSON.stringify(item.selectedOptions)}`} 
                        className="flex gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm"
                      >
                        <div className="w-20 h-20 shrink-0 bg-background rounded-xl border border-border overflow-hidden relative">
                           <ProductImage 
                             src={getImageUrl(item)} 
                             alt={item.name} 
                             className="w-full h-full object-contain p-1" 
                           />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                              {item.name}
                            </h3>
                            <button 
                              onClick={() => removeFromCart(item.id, item.selectedOptions)} 
                              className="text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="text-sm font-bold text-foreground mt-1">
                            {formatPrice(price)}
                          </div>
                          
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center bg-background border border-border rounded-lg h-8 px-1 shadow-sm">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOptions)} 
                                className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold text-foreground">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOptions)} 
                                className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="py-4 border-t border-border bg-card shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]" style={{ paddingLeft: `${paddingX}px`, paddingRight: `${paddingX}px` }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    {formatPrice(getCartSubtotal())}
                  </span>
                </div>
                <Button 
                  onClick={handleCheckout} 
                  className="w-full h-12 rounded-xl text-[15px] font-semibold shadow-md"
                >
                  Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileCartPanel;
