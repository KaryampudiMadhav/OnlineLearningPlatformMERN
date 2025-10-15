/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, TrendingUp, DollarSign, 
  UserCheck, UserX, Edit, Trash2, Loader2,
  Search, Filter, BarChart3, PieChart
} from 'lucide-react';
import api from '../config/api';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [courseStatsRes, userStatsRes, usersRes, coursesRes] = await Promise.all([
        api.get('/courses/admin/stats'),
        api.get('/users/admin/stats'),
        api.get('/users'),
        api.get('/courses')
      ]);

      const courseStats = courseStatsRes.data.data || {};
      const userStats = userStatsRes.data.data || {};
      
      setStats({
        totalUsers: userStats.totalUsers || 0,
        totalCourses: courseStats.totalCourses || 0,
        totalEnrollments: courseStats.totalEnrollments || 0,
        totalRevenue: 0 // Calculate from enrollments if needed
      });
      
      setUsers(usersRes.data.users || usersRes.data.data || []);
      setCourses(coursesRes.data.courses || coursesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully');
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      alert('User role updated successfully');
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  const statsData = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: stats?.totalCourses || 0,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: UserCheck,
      label: 'Total Enrollments',
      value: stats?.totalEnrollments || 0,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `$${stats?.totalRevenue || 0}`,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/20 to-red-500/20'
    }
  ];

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Admin <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</span> 🛡️
              </h1>
              <p className="text-xl text-gray-300">
                Welcome back, {user?.name}! Manage your platform efficiently
              </p>
            </div>
            <Link
              to="/admin/courses"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Manage Courses
            </Link>
          </div>
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

        {/* Users Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              User Management
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Joined</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers && filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-4 text-white">{user.name}</td>
                    <td className="py-4 px-4 text-gray-300">{user.email}</td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="student" className="bg-slate-900">Student</option>
                        <option value="instructor" className="bg-slate-900">Instructor</option>
                        <option value="admin" className="bg-slate-900">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Courses Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Recent Courses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="text-purple-400 text-sm font-semibold mb-2">
                  {course.category}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {course.enrolledStudents || 0} students
                  </span>
                  <span className="text-white font-semibold">
                    ${course.price}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
