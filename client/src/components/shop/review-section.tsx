'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  reviewCount: number;
  averageRating: number;
}

export function ReviewSection({ productId, reviews, reviewCount, averageRating }: ReviewSectionProps) {
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, { rating, title, comment });
      setLocalReviews([data.data, ...localReviews]);
      setShowForm(false);
      setTitle('');
      setComment('');
      toast.success('Review submitted!');
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="section-title">Customer Reviews</h2>
          {reviewCount > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300')} />
                ))}
              </div>
              <span className="text-sm text-zinc-600">{averageRating.toFixed(1)} out of 5 ({reviewCount} reviews)</span>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => setShowForm(!showForm)}>Write a Review</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="mt-1 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" onClick={() => setRating(i + 1)}>
                      <Star className={cn('h-6 w-6', i < rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300')} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="reviewTitle">Title</Label>
                <Input id="reviewTitle" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="reviewComment">Review</Label>
                <Textarea id="reviewComment" value={comment} onChange={(e) => setComment(e.target.value)} required className="mt-1.5" rows={4} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {localReviews.length === 0 ? (
          <p className="text-zinc-500">No reviews yet. Be the first to review!</p>
        ) : (
          localReviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900">
                      {review.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{review.user.name}</p>
                      <p className="text-xs text-zinc-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300')} />
                    ))}
                  </div>
                </div>
                {review.title && <p className="mt-2 font-medium">{review.title}</p>}
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
