import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Flag, Edit, Trash2, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../config/api';

const ReviewList = ({ courseId, onReviewUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1
  const [sort, setSort] = useState('-helpfulCount'); // -helpfulCount, -createdAt, rating
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, filter, sort, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        sort,
        page,
        limit: 10
      };
      
      if (filter !== 'all') {
        params.rating = filter;
      }

      const { data } = await api.get(`/reviews/course/${courseId}`, { params });
      setReviews(data.reviews);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      const { data } = await api.post(`/reviews/${reviewId}/helpful`);
      
      // Update the review in the list
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { 
              ...review, 
              helpfulCount: data.helpfulCount,
              isHelpful: data.isHelpful
            }
          : review
      ));
    } catch (error) {
      console.error('Error voting:', error);
      alert(error.response?.data?.message || 'Failed to update vote');
    }
  };

  const handleFlag = async (reviewId) => {
    const reason = prompt('Why are you flagging this review?\n\nOptions:\n- spam\n- inappropriate\n- offensive\n- fake\n- other');
    
    if (!reason) return;

    const validReasons = ['spam', 'inappropriate', 'offensive', 'fake', 'other'];
    if (!validReasons.includes(reason.toLowerCase())) {
      alert('Invalid reason. Please use: spam, inappropriate, offensive, fake, or other');
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/flag`, { reason: reason.toLowerCase() });
      alert('Review flagged successfully. Our team will review it.');
    } catch (error) {
      console.error('Error flagging review:', error);
      alert(error.response?.data?.message || 'Failed to flag review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
      if (onReviewUpdate) onReviewUpdate();
      alert('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleRespondSubmit = async (reviewId) => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      const { data } = await api.post(`/reviews/${reviewId}/respond`, {
        comment: responseText
      });

      // Update the review with the response
      setReviews(reviews.map(review =>
        review._id === reviewId ? data.review : review
      ));

      setRespondingTo(null);
      setResponseText('');
      alert('Response added successfully');
    } catch (error) {
      console.error('Error adding response:', error);
      alert(error.response?.data?.message || 'Failed to add response');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</h3>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(Math.round(stats.averageRating))}
              <span className="text-sm text-gray-400">
                ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          <div className="flex-1 ml-8 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0;
              const percentage = stats.totalReviews > 0 
                ? (count / stats.totalReviews) * 100 
                : 0;

              return (
                <button
                  key={rating}
                  onClick={() => setFilter(rating.toString())}
                  className={`w-full flex items-center gap-3 text-sm hover:bg-gray-700/50 p-2 rounded transition-colors ${
                    filter === rating.toString() ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="w-12 text-right">{rating} star</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Statistics */}
      {renderRatingDistribution()}

      {/* Filters and Sorting */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilter(rating.toString())}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === rating.toString()
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {rating} ⭐
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="-helpfulCount">Most Helpful</option>
          <option value="-createdAt">Most Recent</option>
          <option value="-rating">Highest Rating</option>
          <option value="rating">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">
            {filter === 'all' 
              ? 'No reviews yet. Be the first to review this course!' 
              : `No ${filter}-star reviews yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{review.user?.name}</h4>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs text-green-500">
                          <CheckCircle size={14} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {review.isEdited && (
                        <span className="text-xs text-gray-500">(Edited)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {user && (
                  <div className="flex items-center gap-2">
                    {review.user?._id === user._id && (
                      <>
                        <button
                          onClick={() => {
                            if (onReviewUpdate) onReviewUpdate(review);
                          }}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Edit review"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                    {review.user?._id !== user._id && (
                      <button
                        onClick={() => handleFlag(review._id)}
                        className="text-gray-400 hover:text-orange-500 transition-colors"
                        title="Flag review"
                      >
                        <Flag size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Review Content */}
              <h5 className="font-semibold text-lg mb-2">{review.title}</h5>
              <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>

              {/* Helpful Button */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-700">
                <button
                  onClick={() => handleHelpfulVote(review._id)}
                  disabled={!user || review.user?._id === user._id}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                    review.isHelpful
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ThumbsUp size={16} />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>

                {/* Instructor Response Button */}
                {user && (user.role === 'instructor' || user.role === 'admin') && !review.instructorResponse && (
                  <button
                    onClick={() => setRespondingTo(review._id)}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>Respond</span>
                  </button>
                )}
              </div>

              {/* Instructor Response */}
              {review.instructorResponse && (
                <div className="mt-4 ml-8 p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-blue-400">
                      INSTRUCTOR RESPONSE
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.instructorResponse.respondedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{review.instructorResponse.comment}</p>
                </div>
              )}

              {/* Response Form */}
              {respondingTo === review._id && (
                <div className="mt-4 ml-8 p-4 bg-gray-700 rounded-lg">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondSubmit(review._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Submit Response
                    </button>
                    <button
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText('');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
