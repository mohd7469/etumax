import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '@/context/ProductContext';
import {
  ChevronRight,
  LayoutGrid,
  Sparkles,
  Shapes,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageOptimizer from '@/components/ui/ImageOptimizer';
import { Helmet } from 'react-helmet-async';

const CategoriesPage = ({ navigateTo }) => {
  const { categories, getProductsByCategory } = useProducts();

  const publishedCategories = useMemo(() => {
    return categories.filter(
      (c) => !c.status || c.status === 'published' || c.status === 'active'
    );
  }, [categories]);

  const totalProducts = useMemo(() => {
    return publishedCategories.reduce((sum, category) => {
      return sum + getProductsByCategory(category.slug || category.id).length;
    }, 0);
  }, [publishedCategories, getProductsByCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.985 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

  const CategoryImageFallback = ({ name }) => (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 text-center">
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/15 bg-white/70 text-3xl shadow-sm backdrop-blur-sm md:h-20 md:w-20 md:text-4xl">
        🛍️
      </div>
      <p className="max-w-[80%] truncate text-xs font-medium text-muted-foreground md:text-sm">
        {name}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-3 py-7 md:px-4 md:py-12">
      <Helmet>
        <title>All Categories | Shop by Category</title>
        <meta
          name="description"
          content="Browse all our product categories and find exactly what you're looking for."
        />
      </Helmet>

      <div className="mb-8 md:mb-12">
        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative px-5 py-7 md:px-8 md:py-10">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary md:text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Explore Collections
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex flex-wrap items-center justify-center gap-2 text-center text-2xl font-bold text-foreground md:justify-start md:text-left md:text-4xl"
            >
              <LayoutGrid className="h-6 w-6 text-primary md:h-8 md:w-8" />
              Shop by Category
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="max-w-2xl text-center text-sm leading-6 text-muted-foreground md:text-left md:text-base"
            >
              Discover curated collections, trending essentials, and premium picks
              tailored to your shopping needs.
            </motion.p>

<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.22 }}
  className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start"
>
  {/* Rating */}
  <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-2 shadow-sm backdrop-blur-sm">
    <div className="flex text-yellow-400 text-sm">
      ⭐⭐⭐⭐⭐
    </div>
    <p className="text-sm font-semibold text-foreground">
      4.9 Rating
    </p>
  </div>

  {/* Reviews */}
  <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-2 shadow-sm backdrop-blur-sm">
    <p className="text-sm font-semibold text-foreground">
      4000+ Positive Reviews
    </p>
  </div>

  {/* Extra trust badge (optional but powerful) */}
  <div className="rounded-2xl border border-border/60 bg-primary/10 px-4 py-2 shadow-sm">
    <p className="text-sm font-semibold text-primary">
      Trusted by Thousands of Customers
    </p>
  </div>
</motion.div>
          </div>
        </div>
      </div>

      {publishedCategories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shapes className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">No Categories Found</h2>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
            We are currently updating our collections. Please check back shortly for
            fresh categories and new arrivals.
          </p>
          <button
            onClick={() => navigateTo('home')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:translate-y-[-1px] hover:bg-primary/90"
          >
            Return Home
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5"
        >
          {publishedCategories.map((category) => {
            const productCount = getProductsByCategory(category.slug || category.id).length;
            const categoryUrl = `/products/${encodeURIComponent(
              category.slug || category.id
            )}`;

            const hasImage = Boolean(category.image || category.thumbnail);

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Link
                  to={categoryUrl}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('products', { category: category.slug || category.id });
                  }}
                  className="group block h-full"
                >
                  <div className="overflow-hidden rounded-[22px] border border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
                    <div className="relative aspect-[4/4.8] overflow-hidden bg-muted">
                      {hasImage ? (
                        <>
                          <ImageOptimizer
                            src={category.image || category.thumbnail}
                            alt={category.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />
                        </>
                      ) : (
                        <CategoryImageFallback name={category.name} />
                      )}

                      <div className="absolute right-3 top-3 inline-flex items-center rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md md:text-[11px]">
                        {productCount} {productCount === 1 ? 'Item' : 'Items'}
                      </div>
                    </div>

                    <div className="border-t border-border/50 bg-background px-3.5 py-3.5 md:px-4 md:py-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-foreground md:text-base">
                            {category.name}
                          </h3>
                          <p className="mt-1 text-[11px] leading-4 text-muted-foreground md:text-xs">
                            Browse this curated collection
                          </p>
                        </div>

                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/70 text-muted-foreground transition-all duration-300 group-hover:border-primary/25 group-hover:bg-primary group-hover:text-primary-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/35 px-3 py-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          View Collection
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default CategoriesPage;