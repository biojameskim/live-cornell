'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface Vote {
    user_id: string;
    vote_type: number;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string; // Needed for ownership check
    user: {
        first_name: string;
        last_name: string;
        avatar_url: string;
    };
    votes: Vote[];
}

interface ReviewSectionProps {
    listingId: string;
}

export default function ReviewSection({ listingId }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
        fetchReviews();
    }, [listingId]);

    const fetchReviews = async () => {
        console.log('Fetching reviews for listing:', listingId);
        try {
            const res = await fetch(`/api/reviews?listing_id=${listingId}`, { cache: 'no-store' });
            console.log('Fetch response status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched reviews data:', data);
                setReviews(data);
            } else {
                const err = await res.text();
                console.error('Failed to fetch reviews:', err);
            }
        } catch (error) {
            console.error('Failed to fetch reviews (exception):', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: listingId, rating, comment }),
            });

            if (res.ok) {
                setComment('');
                setRating(0);
                fetchReviews(); // Refresh reviews
            } else {
                const errorData = await res.json();
                console.error('Failed to submit review:', errorData);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchReviews();
            } else {
                console.error('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const handleVote = async (reviewId: string, currentVote: number, newVote: number) => {
        if (!user) return alert('Please log in to vote.');

        // Optimistic update
        const updatedReviews = reviews.map(r => {
            if (r.id === reviewId) {
                // Remove old vote if exists
                const votes = r.votes.filter(v => v.user_id !== user.id);
                // Add new vote if not removing (0)
                if (newVote !== 0) {
                    votes.push({ user_id: user.id, vote_type: newVote });
                }
                return { ...r, votes };
            }
            return r;
        });
        setReviews(updatedReviews);

        try {
            await fetch('/api/reviews/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review_id: reviewId, vote_type: newVote }),
            });
            // Ideally re-fetch to confirm, but optimistic is fine for now
        } catch (error) {
            console.error('Error voting:', error);
            fetchReviews(); // Revert on error
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Reviews</h2>
                {averageRating && (
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-slate-900">{averageRating}</span>
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-slate-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-slate-500 text-sm">({reviews.length} reviews)</span>
                    </div>
                )}
            </div>

            {/* Review Form */}
            {user ? (
                <div className="bg-slate-50 p-6 rounded-lg border">
                    <h3 className="font-semibold mb-4">Leave a Review</h3>
                    <div className="flex items-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`focus:outline-none transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}
                            >
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                        ))}
                        <span className="ml-2 text-sm text-slate-500">{rating > 0 ? `${rating} Stars` : 'Select Rating'}</span>
                    </div>
                    <Textarea
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mb-4 bg-white"
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || submitting}
                        className="bg-red-700 hover:bg-red-800"
                    >
                        {submitting ? 'Posting...' : 'Post Review'}
                    </Button>
                </div>
            ) : (
                <div className="bg-slate-50 p-6 rounded-lg border text-center">
                    <p className="text-slate-600 mb-2">Please log in to leave a review.</p>
                </div>
            )}

            {/* Review List */}
            <div className="space-y-6">
                {reviews.map((review) => {
                    const score = review.votes ? review.votes.reduce((acc, v) => acc + v.vote_type, 0) : 0;
                    const userVote = user && review.votes ? review.votes.find(v => v.user_id === user.id)?.vote_type || 0 : 0;

                    return (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-1 min-w-[32px]">
                                    <button
                                        onClick={() => handleVote(review.id, userVote, userVote === 1 ? 0 : 1)}
                                        className={`p-1 rounded hover:bg-slate-100 ${userVote === 1 ? 'text-orange-600' : 'text-slate-400'}`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                    </button>
                                    <span className={`font-bold text-sm ${score > 0 ? 'text-orange-600' : score < 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                                        {score}
                                    </span>
                                    <button
                                        onClick={() => handleVote(review.id, userVote, userVote === -1 ? 0 : -1)}
                                        className={`p-1 rounded hover:bg-slate-100 ${userVote === -1 ? 'text-blue-600' : 'text-slate-400'}`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                </div>

                                <Avatar>
                                    <AvatarImage src={review.user?.avatar_url} />
                                    <AvatarFallback>{review.user?.first_name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold">
                                            {review.user?.first_name ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous User'}
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-slate-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                            {user && user.id === review.user_id && (
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="text-xs text-red-500 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-slate-700">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {reviews.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No reviews yet. Be the first to share your experience!</p>
                )}
            </div>
        </div>
    );
}
