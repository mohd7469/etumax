import React from 'react';
import ProductCard from '@/components/products/ProductCard';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const RelatedProductsSection = ({ products, title = "Related Products", colsClass = "grid-cols-2 md:grid-cols-4 lg:grid-cols-5", navigateTo }) => {
  if (!products || products.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{title}</h2>
      <div className={cn('grid gap-4 md:gap-6', colsClass)}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            navigateTo={navigateTo}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default RelatedProductsSection;