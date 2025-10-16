/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, TrendingUp, Award, Clock, 
  Star, BarChart, Target, Zap, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my-courses');
      setEnrollments(response.data.enrollments || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: BookOpen,
      label: 'Enrolled Courses',
      value: enrollments?.length || 0,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Clock,
      label: 'Hours Learned',
      value: enrollments?.reduce((acc, e) => acc + (e.course?.duration || 0), 0) || 0,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Target,
      label: 'Completed',
      value: enrollments?.filter(e => e.progress === 100).length || 0,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: TrendingUp,
      label: 'In Progress',
      value: enrollments?.filter(e => e.progress > 0 && e.progress < 100).length || 0,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/20 to-red-500/20'
    }
  ];

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
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.name}</span>! 👋
          </h1>
          <p className="text-xl text-gray-300">
            Continue your learning journey and achieve your goals
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
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
            <Link 
              to="/courses"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Browse More
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <CourseCard key={enrollment._id} enrollment={enrollment} index={index} />
              ))}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
              <BookOpen className="w-20 h-20 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No courses yet</h3>
              <p className="text-gray-400 mb-6">Start your learning journey by enrolling in a course</p>
              <Link 
                to="/courses"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Explore Courses
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const CourseCard = ({ enrollment, index }) => {
  const course = enrollment.course;
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  
  if (!course) return null;

  const handleGenerateCertificate = async () => {
    try {
      setGeneratingCert(true);
      await api.post(`/certificates/generate/${enrollment._id}`);
      setCertificateGenerated(true);
      // Redirect to certificates page after a brief delay
      setTimeout(() => {
        window.location.href = '/my-certificates';
      }, 1500);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      alert(error.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGeneratingCert(false);
    }
  };

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
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-white/30" />
            </div>
          )}
          
          {/* Progress Badge */}
          {enrollment.progress === 100 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Award className="w-3 h-3" />
              Completed
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-6">
          <div className="text-purple-400 text-sm font-semibold mb-2">
            {course.category}
          </div>
          
          <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
            {course.title}
          </h3>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-semibold">{enrollment.progress || 0}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${enrollment.progress || 0}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration || 0}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{course.rating || 'N/A'}</span>
            </div>
            {enrollment.completedLessons && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{enrollment.completedLessons.length || 0} lessons</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Link
              to={`/learn/${course._id}`}
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              {enrollment.progress === 0 ? 'Start Learning' : enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'}
            </Link>
            
            {/* Certificate Button for Completed Courses */}
            {enrollment.progress === 100 && (
              <button
                onClick={handleGenerateCertificate}
                disabled={generatingCert || certificateGenerated}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                {generatingCert ? 'Generating...' : certificateGenerated ? 'Certificate Ready!' : 'Get Certificate'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
