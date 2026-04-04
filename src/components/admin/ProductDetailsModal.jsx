
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const ProductDetailsModal = ({ isOpen, onClose, product, onSync }) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>WooCommerce ID: {product.id} | SKU: {product.sku || 'N/A'}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]?.src || product.images[0]} 
                  alt={product.name} 
                  className="w-full h-auto rounded-md object-cover border" 
                />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center rounded-md border text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Status</h4>
                <Badge variant={
                  product.syncStatus === 'Already Synced' ? 'default' : 
                  product.syncStatus === 'Needs Update' ? 'secondary' : 'outline'
                }>
                  {product.syncStatus}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-1">Pricing</h4>
                <div className="text-2xl font-bold text-primary">
                  ${product.price}
                  {product.regular_price && product.regular_price !== product.price && (
                    <span className="text-sm line-through text-muted-foreground ml-2">${product.regular_price}</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Inventory</h4>
                <Badge variant={product.stock_status === 'instock' ? 'default' : 'destructive'}>
                  {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>

              {product.categories && product.categories.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Categories</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.categories.map((c, i) => (
                      <Badge key={i} variant="outline">{c.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-6 border-t pt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => { onSync(product); onClose(); }}>Sync This Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
