import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductImage from '@/components/ui/ProductImage';

const WishlistPage = ({ navigateTo }) => {
  const { user, wishlist, removeFromWishlist } = useUser();
  const { addToCart } = useCart();
  const { formatPrice } = useProducts();

  const handleOpenProduct = (product) => {
    if (!product) return;

    if (product.slug) {
      navigateTo(`/product/${product.slug}`);
      return;
    }

    if (product.id) {
      navigateTo(`/product/${product.id}`);
      return;
    }

    navigateTo('product-detail', { product });
  };

  if (!user && wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card py-20 shadow-sm"
        >
          <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-muted-foreground/40" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Your wishlist is empty
          </h2>
          <p className="mb-6 text-muted-foreground">
            Explore products and add your favorites to your wishlist!
          </p>
          <Button
            onClick={() => navigateTo('products')}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Discover Products
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto bg-background px-4 py-8 text-foreground">
      <div className="mb-8 flex items-center gap-4">
        <Heart className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-foreground">My Wishlist</h1>
      </div>

      {!user && wishlist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-primary/20 bg-primary/10 p-4 text-primary"
          role="alert"
        >
          <p className="font-bold">You have items in your guest wishlist!</p>
          <p className="text-sm">
            <Button
              variant="link"
              className="h-auto p-0 font-bold text-primary"
              onClick={() => navigateTo('account')}
            >
              Login or create an account
            </Button>
            &nbsp;to save them permanently.
          </p>
        </motion.div>
      )}

      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card py-20 text-center shadow-sm"
        >
          <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-muted-foreground/40" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Your wishlist is empty
          </h2>
          <p className="mb-6 text-muted-foreground">
            Explore products and add your favorites to your wishlist!
          </p>
          <Button
            onClick={() => navigateTo('products')}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Discover Products
          </Button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"
        >
          {wishlist.map((product) => (
            <motion.div layout key={product.id}>
              <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                <div
                  className="cursor-pointer p-2"
                  onClick={() => handleOpenProduct(product)}
                >
                  <ProductImage
                    src={product.images?.[0]}
                    alt={product.name}
                    className="h-full w-full rounded-xl object-cover"
                    aspectRatio="square"
                    lazy={true}
                  />
                </div>

                <CardContent className="flex flex-grow flex-col p-4 pt-0">
                  <h3
                    className="mb-2 line-clamp-2 h-10 cursor-pointer text-sm font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => handleOpenProduct(product)}
                  >
                    {product.name}
                  </h3>

                  <div className="mt-auto">
                    <p className="mb-3 text-lg font-bold text-foreground">
                      {formatPrice(product.price)}
                    </p>

                    <div className="space-y-2">
                      <Button
                        onClick={() => addToCart(product)}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        size="sm"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>

                      <Button
                        onClick={() => removeFromWishlist(product.id)}
                        className="w-full border-border bg-background text-foreground hover:bg-accent"
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default WishlistPage;