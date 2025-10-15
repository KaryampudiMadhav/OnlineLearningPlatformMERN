import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/enrollments/my-courses');
      setEnrollments(response.data.enrollments || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enrollments');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      setEnrollments(enrollments.filter(e => e._id !== enrollmentId));
      alert('Successfully unenrolled from course');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unenroll');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>
          <Link
            to="/courses"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse More Courses
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {(!enrollments || enrollments.length === 0) ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Courses Yet</h2>
            <p className="text-gray-600 mb-6">Start learning by enrolling in a course</p>
            <Link
              to="/courses"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {enrollments && enrollments.map(enrollment => (
              <CourseCard 
                key={enrollment._id} 
                enrollment={enrollment}
                onUnenroll={handleUnenroll}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ enrollment, onUnenroll }) => {
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put(`/enrollments/${enrollment._id}/review`, { rating, comment });
      alert('Review submitted successfully!');
      setShowReview(false);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (newProgress) => {
    try {
      await api.put(`/enrollments/${enrollment._id}/progress`, { progress: newProgress });
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        {/* Course Image */}
        <div className="md:col-span-1">
          <img 
            src={enrollment.course?.thumbnail || 'https://via.placeholder.com/300x200'} 
            alt={enrollment.course?.title}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>

        {/* Course Info */}
        <div className="md:col-span-2">
          <Link 
            to={`/courses/${enrollment.course?._id}`}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 mb-2 block"
          >
            {enrollment.course?.title}
          </Link>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {enrollment.course?.description}
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {enrollment.course?.category}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              {enrollment.course?.level}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">{enrollment.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${enrollment.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button
            onClick={() => handleUpdateProgress(Math.min(100, enrollment.progress + 10))}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Continue Learning
          </button>
          
          {!enrollment.review && (
            <button
              onClick={() => setShowReview(!showReview)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Write Review
            </button>
          )}

          {enrollment.review && (
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{enrollment.review.rating}/5</span>
              </div>
              <p className="text-xs italic">{enrollment.review.comment}</p>
            </div>
          )}
          
          <button
            onClick={() => onUnenroll(enrollment._id)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Unenroll
          </button>

          <div className="text-xs text-gray-500 mt-2">
            Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReview && !enrollment.review && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience with this course..."
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
