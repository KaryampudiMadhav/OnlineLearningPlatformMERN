import { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../config/api';

const ReviewForm = ({ courseId, existingReview, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    comment: existingReview?.comment || ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingReview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (formData.title.trim().length === 0) {
      setError('Please provide a review title');
      return;
    }
    if (formData.comment.trim().length < 10) {
      setError('Review comment must be at least 10 characters');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        // Update existing review
        await api.put(`/reviews/${existingReview._id}`, formData);
      } else {
        // Create new review
        await api.post('/reviews', {
          courseId,
          ...formData
        });
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all duration-200 transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoveredRating || formData.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-600'
                  } transition-colors`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-2 text-sm text-gray-400">
                {formData.rating} star{formData.rating !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Summarize your experience"
            maxLength={100}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Review Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Share your thoughts about this course..."
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.comment.length}/1000 characters (minimum 10)
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
