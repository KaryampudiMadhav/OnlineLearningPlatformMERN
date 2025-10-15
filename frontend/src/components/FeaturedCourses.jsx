import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiStar, FiClock, FiUsers } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import api from '../config/api';

const FeaturedCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await api.get('/courses?limit=6&sort=-rating');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  return (
    <section id="courses" className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Featured <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Courses</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Explore our most popular courses and start learning from the best instructors
          </p>
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {courses && courses.length > 0 ? (
              courses.map((course, index) => (
                <CourseCard key={course._id || course.id} course={course} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400 py-10">
                No courses available yet. Check back soon!
              </div>
            )}
          </div>
        )}

        {/* View All Courses Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewAllCourses}
            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all cursor-pointer"
          >
            View All Courses
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

const CourseCard = ({ course, index }) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      alert('Please login to enroll in courses');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      const response = await api.post(`/enrollments/${course._id || course.id}`);
      if (response.data.success) {
        alert(`Successfully enrolled in "${course.title}"! 🎓`);
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already enrolled')) {
        alert('You are already enrolled in this course!');
      } else {
        alert('Failed to enroll. Please try again.');
      }
      console.error('Enrollment error:', error);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-gray-700"
    >
      {/* Course Image */}
      <div className="relative overflow-hidden h-56">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {course.category}
        </div>
      </div>

      {/* Course Content */}
      <div className="p-8">
        <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>
        <p className="text-gray-400 mb-6 text-base">by {course.instructor}</p>

        {/* Rating & Students */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <FiStar className="text-yellow-400 fill-yellow-400 text-lg" />
            <span className="font-semibold text-white text-lg">{course.rating}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FiUsers className="text-lg" />
            <span className="text-sm">{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FiClock className="text-lg" />
            <span className="text-sm">{course.duration}</span>
          </div>
        </div>

        {/* Price & Enroll Button */}
        <div className="flex items-center justify-between">
          <span className="text-4xl font-bold text-blue-400">
            {course.price}
          </span>
          <motion.button
            whileHover={{ scale: enrolling ? 1 : 1.05 }}
            whileTap={{ scale: enrolling ? 1 : 0.95 }}
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedCourses;
