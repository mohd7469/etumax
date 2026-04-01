import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useReviews } from '@/context/ReviewContext';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const ReviewForm = ({ productId }) => {
  const { addReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !author || !email || !content) {
      toast({
        variant: 'destructive',
        title: 'Please fill all fields',
      });
      return;
    }
    addReview({
      productId,
      rating,
      author,
      email,
      content,
    });
    toast({
      title: 'Review submitted for approval!',
    });
    setRating(0);
    setAuthor('');
    setEmail('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 glass-effect p-6 rounded-lg mt-8">
      <h3 className="text-xl font-bold">Write a review</h3>
      <div>
        <span className="font-semibold">Your rating:</span>
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 cursor-pointer transition-colors ${i < (hoverRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
                }`}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(i + 1)}
            />
          ))}
        </div>
      </div>
      <Textarea
        placeholder="Your review..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Your Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Submit Review</Button>
    </form>
  );
};

const ProductReviewsSection = ({ productId, reviews = [] }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {reviews.length === 0 ? (
        <p className="text-gray-600 p-4 bg-gray-50 rounded-lg border border-dashed">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <h4 className="font-bold ml-2">{review.author}</h4>
                <span className="text-sm text-gray-500">
                  - {new Date(review.submittedOn).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.content}</p>
            </div>
          ))}
        </div>
      )}
      <ReviewForm productId={productId} />
    </motion.div>
  );
};

export default ProductReviewsSection;