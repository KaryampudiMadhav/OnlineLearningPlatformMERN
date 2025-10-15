/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, TrendingUp, DollarSign, 
  Plus, Edit, Trash2, Loader2, Star, Clock,
  Eye, BarChart3
} from 'lucide-react';
import api from '../config/api';
import useAuthStore from '../store/authStore';

const InstructorDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchInstructorCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses?instructor=${user?._id}`);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
      alert('Course deleted successfully');
    } catch (error) {
      alert('Failed to delete course');
    }
  };

  const totalStudents = courses.reduce((acc, course) => acc + (course.enrolledStudents || 0), 0);
  const totalRevenue = courses.reduce((acc, course) => acc + (course.price * (course.enrolledStudents || 0)), 0);
  const avgRating = courses.length > 0 
    ? (courses.reduce((acc, course) => acc + (course.rating || 0), 0) / courses.length).toFixed(1)
    : 0;

  const statsData = [
    {
      icon: BookOpen,
      label: 'My Courses',
      value: courses.length,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Users,
      label: 'Total Students',
      value: totalStudents,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: avgRating,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `$${totalRevenue.toFixed(2)}`,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-7xl px-4 py-24">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Instructor <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</span> 👨‍🏫
          </h1>
          <p className="text-xl text-gray-300">
            Welcome back, {user?.name}! Manage your courses and track your impact
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* My Courses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">My Courses</h2>
            <Link to="/instructor/create-course">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Course
              </motion.button>
            </Link>
          </div>

          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  index={index}
                  onDelete={handleDeleteCourse}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
              <BookOpen className="w-20 h-20 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No courses yet</h3>
              <p className="text-gray-400 mb-6">Start creating courses to share your knowledge</p>
              <Link to="/instructor/create-course">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Create Your First Course
                </motion.button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const CourseCard = ({ course, index, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all">
        {/* Course Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-white/30" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/80 text-white backdrop-blur-lg">
              Published
            </span>
          </div>
        </div>

        {/* Course Info */}
        <div className="p-6">
          <div className="text-purple-400 text-sm font-semibold mb-2">
            {course.category}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {course.title}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrolledStudents || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{course.rating || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration || 0}h</span>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-xl font-bold text-white">
              ${course.price}
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/instructor/edit-course/${course._id}`}>
                <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </Link>
              <button 
                onClick={() => onDelete(course._id)}
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorDashboard;
