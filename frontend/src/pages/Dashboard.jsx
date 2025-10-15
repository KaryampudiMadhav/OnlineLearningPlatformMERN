import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiBookOpen, FiAward, FiClock, FiTrendingUp, FiEdit } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import api from '../config/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my-enrollments');
      if (response.data.success) {
        setEnrollments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: FiBookOpen,
      label: 'Enrolled Courses',
      value: enrollments?.length || 0,
      color: 'from-blue-600 to-purple-600',
    },
    {
      icon: FiClock,
      label: 'Hours Learned',
      value: Math.floor(Math.random() * 50 + 10),
      color: 'from-green-600 to-teal-600',
    },
    {
      icon: FiAward,
      label: 'Completed',
      value: enrollments?.filter((e) => e.status === 'completed').length || 0,
      color: 'from-orange-600 to-red-600',
    },
    {
      icon: FiTrendingUp,
      label: 'Avg Progress',
      value: (enrollments && enrollments.length > 0)
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length) + '%'
        : '0%',
      color: 'from-pink-600 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{user?.name}!</span>
          </h1>
          <p className="text-gray-400 text-lg">Continue your learning journey</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-3xl p-6 border-2 border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className="text-white text-2xl" />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-white text-3xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-3xl p-8 border-2 border-gray-700 mb-12"
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors">
              <FiEdit /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Full Name</p>
              <p className="text-white text-lg font-semibold">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Email Address</p>
              <p className="text-white text-lg font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Role</p>
              <p className="text-white text-lg font-semibold capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Member Since</p>
              <p className="text-white text-lg font-semibold">
                {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Enrolled Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (enrollments && enrollments.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <motion.div
                  key={enrollment._id}
                  whileHover={{ y: -10 }}
                  className="bg-gray-800 rounded-3xl overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-all"
                >
                  <img
                    src={enrollment.course?.image || 'https://via.placeholder.com/400x200'}
                    alt={enrollment.course?.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {enrollment.course?.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {enrollment.course?.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Progress</span>
                        <span className="text-blue-400 font-semibold">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                      Continue Learning
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-800 rounded-3xl border-2 border-gray-700">
              <FiBookOpen className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-6">You haven't enrolled in any courses yet</p>
              <a
                href="/#courses"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Browse Courses
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
