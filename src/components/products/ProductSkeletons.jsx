import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

// Task 2: Reusable skeleton loader components
export const RatingSkeleton = () => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="w-5 h-5 rounded-full" />
      ))}
    </div>
    <Skeleton className="w-24 h-4" />
  </div>
);

export const ReviewsSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="space-y-6"
  >
    {[1, 2].map(i => (
      <div key={i} className="border-b pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => <Skeleton key={star} className="w-4 h-4 rounded-full" />)}
          </div>
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4" />
      </div>
    ))}
    <div className="mt-8 p-6 rounded-lg border bg-gray-50/50">
       <Skeleton className="w-48 h-6 mb-4" />
       <Skeleton className="w-32 h-4 mb-2" />
       <div className="flex gap-1 mb-4">
         {[1, 2, 3, 4, 5].map(star => <Skeleton key={star} className="w-6 h-6 rounded-full" />)}
       </div>
       <Skeleton className="w-full h-24 mb-4" />
       <div className="grid grid-cols-2 gap-4 mb-4">
         <Skeleton className="w-full h-10" />
         <Skeleton className="w-full h-10" />
       </div>
       <Skeleton className="w-32 h-10" />
    </div>
  </motion.div>
);

export const RelatedProductsSkeleton = ({ columns = "grid-cols-2 md:grid-cols-4 lg:grid-cols-5", limit = 5 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className={`grid gap-4 md:gap-6 ${columns}`}
    >
      {Array.from({ length: limit }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full border border-gray-100">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="p-4 flex flex-col flex-grow gap-3">
            <div className="flex justify-between items-center">
              <Skeleton className="w-1/3 h-3" />
              <Skeleton className="w-8 h-3" />
            </div>
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4 mb-2 flex-grow" />
            <Skeleton className="w-1/2 h-6 mt-auto" />
            <Skeleton className="w-full h-9 mt-2" />
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export const ProductDetailSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="container mx-auto px-4 py-8"
  >
    <Skeleton className="w-32 h-8 mb-6" />
    <div className="flex flex-col lg:flex-row gap-8 mb-12">
      <div className="lg:w-1/2 space-y-4">
        <Skeleton className="w-full aspect-square rounded-2xl" />
        <div className="grid grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="w-full aspect-square rounded-lg" />)}
        </div>
      </div>
      <div className="lg:w-1/2 space-y-6 pt-4">
        <Skeleton className="w-3/4 h-10" />
        <RatingSkeleton />
        <Skeleton className="w-1/4 h-10" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-1/3 h-12" />
        <div className="flex gap-4">
           <Skeleton className="w-full h-12 rounded-md" />
           <Skeleton className="w-16 h-12 rounded-md" />
           <Skeleton className="w-16 h-12 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-6 border-t mt-6">
           {[1,2,3].map(i => (
             <div key={i} className="flex flex-col items-center">
               <Skeleton className="w-8 h-8 rounded-full mb-2" />
               <Skeleton className="w-24 h-3 mb-1" />
               <Skeleton className="w-16 h-2" />
             </div>
           ))}
        </div>
      </div>
    </div>
  </motion.div>
);