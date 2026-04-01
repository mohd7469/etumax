import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { listenToCollection, setDocument, deleteDocument, batchWrite } from '@/lib/firestoreService';

const ReviewContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const unsubscribe = listenToCollection('reviews', (data) => {
      setReviews(data);
    });
    return () => unsubscribe();
  }, []);

  const addReview = async (review) => {
    const newId = `rev_${Date.now()}`;
    const newReview = { ...review, id: newId, submittedOn: new Date().toISOString(), status: 'pending' };
    await setDocument('reviews', newId, newReview);
  };

  const addMultipleReviews = async (importedReviews) => {
    const ops = importedReviews.map((review, index) => {
        const id = `imported-${Date.now()}-${index}`;
        return {
            type: 'set', collection: 'reviews', id,
            data: { ...review, id, submittedOn: review.submittedOn || new Date().toISOString(), status: review.status || 'pending', rating: parseInt(review.rating, 10) || 0 }
        };
    });
    await batchWrite(ops);
  };

  const updateReviewStatus = async (reviewId, status) => {
    await setDocument('reviews', reviewId, { status });
  };

  const updateMultipleReviews = async (reviewIds, status) => {
    const ops = reviewIds.map(id => ({ type: 'update', collection: 'reviews', id, data: { status } }));
    await batchWrite(ops);
  };

  const deleteMultipleReviewsPermanently = async (reviewIds) => {
    const ops = reviewIds.map(id => ({ type: 'delete', collection: 'reviews', id }));
    await batchWrite(ops);
  };

  const getReviewsForProduct = useCallback((productId) => {
    return reviews.filter(review => review.productId.toString() === productId.toString() && review.status === 'approved');
  }, [reviews]);

  const getReviewStatsForProduct = useCallback((productId) => {
    const productReviews = getReviewsForProduct(productId);
    const reviewCount = productReviews.length;
    const averageRating = reviewCount > 0 ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
    return { reviewCount, averageRating };
  }, [getReviewsForProduct]);

  const value = {
    reviews, addReview, addMultipleReviews, updateReviewStatus, updateMultipleReviews,
    deleteMultipleReviewsPermanently, getReviewsForProduct, getReviewStatsForProduct,
  };

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
};