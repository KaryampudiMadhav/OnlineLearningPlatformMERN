import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import useAuthStore from '../store/useAuthStore';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    sort: 'createdAt'
  });
  
  const { isAuthenticated } = useAuthStore();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      params.append('sort', filters.sort);
      
      const response = await api.get(`/courses?${params.toString()}`);
      setCourses(response.data.courses || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const categories = ['Web Development', 'Mobile Development', 'Data Science', 'Design', 'Business', 'Marketing'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Courses</h1>
          <p className="text-gray-600">Explore our comprehensive course catalog</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Newest</option>
                <option value="-rating">Highest Rated</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Course Count */}
            <div className="mb-4">
              <p className="text-gray-600">{courses?.length || 0} courses found</p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses && courses.map(course => (
                <CourseCard key={course._id} course={course} isAuthenticated={isAuthenticated} />
              ))}
            </div>

            {/* Empty State */}
            {(!courses || courses.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No courses found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course, isAuthenticated }) => {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/enrollments/${course._id}`);
      alert('Successfully enrolled in course!');
      window.location.href = '/dashboard';
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Link to={`/courses/${course._id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <img 
        src={course.thumbnail || 'https://via.placeholder.com/400x200'} 
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {course.category}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            {course.level}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm font-semibold">{course.rating?.toFixed(1) || 'N/A'}</span>
            <span className="text-gray-500 text-sm">({course.enrolledStudents || 0})</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            ${course.price}
          </div>
        </div>

        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {enrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </div>
    </Link>
  );
};

export default Courses;
