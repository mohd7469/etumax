
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export default function CartButton({ className }) {
  const { cartItems } = useCart();
  const itemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <Button variant="outline" size="icon" className={cn("relative", className)}>
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </Button>
  );
}
