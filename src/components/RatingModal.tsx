import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, CheckCircle2, User, MessageSquare, AlertCircle } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { ProductService } from '../types';

interface RatingModalProps {
  service: ProductService | null;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1.0 — Poor service',
  2: '2.0 — Needs improvement',
  3: '3.0 — Satisfactory / Average',
  4: '4.0 — Good & Recommended',
  5: '5.0 — Outstanding / Highly Recommended',
};

export const RatingModal: React.FC<RatingModalProps> = ({
  service,
  isOpen,
  onClose,
  onRatingSubmitted,
}) => {
  const { user, profile } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const isOwner = !!(user && service && user.uid === service.providerId);

  // Pre-fill reviewer name if logged in
  useEffect(() => {
    if (user) {
      const name = profile?.fullName || user.displayName || user.email?.split('@')[0] || '';
      setReviewerName(name);
    } else {
      // Check cached guest name
      try {
        const cached = localStorage.getItem('comfort_handyman_customer');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.name) setReviewerName(parsed.name);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [user, profile, isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setHoverRating(null);
      setComment('');
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isOwner) {
      setError('You are the owner of this service. Service providers cannot rate their own services.');
      return;
    }

    if (!reviewerName.trim()) {
      setError('Please provide your name to submit a rating.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please choose a rating between 1 and 5 stars.');
      return;
    }

    setLoading(true);

    try {
      // 1. Record rating in service_ratings collection
      const ratingData = {
        serviceId: service.id,
        providerId: service.providerId,
        rating: Number(rating),
        reviewerName: reviewerName.trim(),
        reviewerId: user ? user.uid : 'guest',
        reviewerIsGuest: !user,
        comment: comment.trim(),
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'service_ratings'), ratingData);

      // Cache guest name in localStorage for convenient future actions
      if (!user && reviewerName.trim()) {
        try {
          const cached = localStorage.getItem('comfort_handyman_customer');
          const current = cached ? JSON.parse(cached) : {};
          current.name = reviewerName.trim();
          localStorage.setItem('comfort_handyman_customer', JSON.stringify(current));
        } catch (e) {
          // ignore
        }
      }

      // 2. Update aggregates on the service document
      const currentCount = service.ratingCount || 0;
      const currentAvg = service.ratingAvg || 0;
      const newCount = currentCount + 1;
      const newAvg = Math.round(((currentAvg * currentCount + rating) / newCount) * 10) / 10;

      await updateDoc(doc(db, 'products_services', service.id), {
        ratingAvg: newAvg,
        ratingCount: newCount,
        updatedAt: Date.now(),
      });

      setSuccess(true);
      if (onRatingSubmitted) onRatingSubmitted();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setError(err?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-gray-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Rating Recorded</h3>
              <p className="text-sm text-gray-600">
                Thank you, <strong>{reviewerName}</strong>! Your review helps the community find reliable providers.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600">
                  Rate Service
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-0.5 line-clamp-1">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Provided by <strong>{service.providerName || 'Local Handyman'}</strong>
                </p>
              </div>

              {/* Owner self-rating check banner */}
              {isOwner ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-bold">You own this service listing</p>
                    <p>
                      In accordance with verified community trust rules, service providers cannot rate their own services.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Star Selector */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const activeStar = (hoverRating !== null ? hoverRating : rating) >= starValue;
                        return (
                          <button
                            key={starValue}
                            type="button"
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 focus:outline-none transition-transform hover:scale-125"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                activeStar
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs font-bold text-gray-700">
                      {RATING_LABELS[hoverRating || rating]}
                    </p>
                  </div>

                  {/* Reviewer Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Your Name <span className="text-red-500">*</span>
                      {!user && (
                        <span className="font-normal text-gray-400 ml-1">
                          (No account needed)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. John Moyo"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Optional Review Comment */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Feedback / Review Notes <span className="font-normal text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Was the provider punctual, skilled, and clean? Share your experience..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-xs text-gray-700 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || isOwner}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Rating'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
