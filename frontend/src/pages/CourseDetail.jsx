import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import useAuthStore from '../store/useAuthStore';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data.course);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/enrollments/${id}`);
      alert('Successfully enrolled in course!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {course.level}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg mb-6 text-white/90">{course.description}</p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300">⭐</span>
                  <span className="font-semibold">{course.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-white/80">({course.enrolledStudents || 0} students)</span>
                </div>
                <div className="text-white/80">
                  Duration: {course.duration} hours
                </div>
              </div>

              <div className="text-white/80">
                Created by <span className="font-semibold text-white">{course.instructor?.name}</span>
              </div>
            </div>

            {/* Course Card */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900 h-fit">
              <img 
                src={course.thumbnail || 'https://via.placeholder.com/600x400'} 
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              
              <div className="text-3xl font-bold text-blue-600 mb-4">
                ${course.price}
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 mb-4"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* What you'll learn */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Master the fundamentals', 'Build real-world projects', 'Get certified', 'Learn from experts'].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Course Description</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{course.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Basic computer skills</li>
                <li>Willingness to learn</li>
                <li>No prior experience required</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Instructor */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Instructor</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {course.instructor?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-lg">{course.instructor?.name}</div>
                  <div className="text-sm text-gray-600">{course.instructor?.email}</div>
                </div>
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Course Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrolled Students</span>
                  <span className="font-semibold">{course.enrolledStudents || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{course.duration} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-semibold">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
