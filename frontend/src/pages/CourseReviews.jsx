import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import api from '../config/api';

const CourseReviews = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await api.get(`/courses/${courseId}`);
      setCourse(courseResponse.data.course);

      if (user) {
        // Check enrollment
        try {
          const enrollmentResponse = await api.get(`/enrollments/my-enrollments`);
          const enrolled = enrollmentResponse.data.enrollments.some(
            e => e.course._id === courseId && e.status === 'active'
          );
          setIsEnrolled(enrolled);
        } catch (error) {
          console.error('Error checking enrollment:', error);
        }

        // Fetch user's review if exists
        try {
          const reviewResponse = await api.get(`/reviews/my-review/${courseId}`);
          if (reviewResponse.data.review) {
            setMyReview(reviewResponse.data.review);
          }
        } catch (error) {
          console.error('Error fetching my review:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    setMyReview(null);
    fetchData();
  };

  const handleEditReview = (review) => {
    setMyReview(review);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Course Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2"
          >
            ← Back to Course
          </button>
          
          <div className="flex items-start gap-6">
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="font-semibold">
                    {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'No ratings yet'}
                  </span>
                  {course.reviewCount > 0 && (
                    <span className="text-sm">
                      ({course.reviewCount} {course.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>
                <span>•</span>
                <span>{course.enrolledStudents} students enrolled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Write Review Section */}
        {user && isEnrolled && (
          <div className="mb-6">
            {!showForm && !myReview && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Write a Review
              </button>
            )}

            {!showForm && myReview && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Your Review</h3>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Review
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={star <= myReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                </div>
                <h4 className="font-semibold mb-2">{myReview.title}</h4>
                <p className="text-gray-300">{myReview.comment}</p>
                {myReview.instructorResponse && (
                  <div className="mt-4 p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded">
                    <p className="text-xs font-semibold text-blue-400 mb-2">INSTRUCTOR RESPONSE</p>
                    <p className="text-gray-300 text-sm">{myReview.instructorResponse.comment}</p>
                  </div>
                )}
              </div>
            )}

            {showForm && (
              <ReviewForm
                courseId={courseId}
                existingReview={myReview}
                onSuccess={handleReviewSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setMyReview(null);
                }}
              />
            )}
          </div>
        )}

        {/* Login Prompt for Non-logged Users */}
        {!user && (
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-6 text-center">
            <p className="mb-4">Please log in to write a review for this course.</p>
            <button
              onClick={() => navigate('/login', { state: { from: `/courses/${courseId}/reviews` } })}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Log In
            </button>
          </div>
        )}

        {/* Enrollment Required Message */}
        {user && !isEnrolled && (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 mb-6 text-center">
            <p className="mb-4">You must be enrolled in this course to leave a review.</p>
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Course Details
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Course Reviews</h2>
          <ReviewList 
            courseId={courseId} 
            onReviewUpdate={handleEditReview}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseReviews;
