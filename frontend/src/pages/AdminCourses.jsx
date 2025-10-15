/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Plus, Edit, Trash2, Search, Eye, 
  Loader2, AlertCircle, CheckCircle 
} from 'lucide-react';
import api from '../config/api';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses');
      setCourses(response.data.courses || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(courseId);
      await api.delete(`/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
      alert('Course deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await api.put(`/courses/${courseId}`, {
        isPublished: !currentStatus
      });
      setCourses(courses.map(c => 
        c._id === courseId ? { ...c, isPublished: !currentStatus } : c
      ));
      alert(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update course status');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Manage <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Courses</span>
              </h1>
              <p className="text-xl text-gray-300">
                Create, edit, and manage all courses
              </p>
            </div>
            <Link
              to="/instructor/create-course"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Course
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </motion.div>

        {/* Courses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden"
        >
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-20 h-20 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {searchTerm ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search term' : 'Create your first course to get started'}
              </p>
              {!searchTerm && (
                <Link
                  to="/instructor/create-course"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Course
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Course</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Category</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Level</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Price</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Students</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Status</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold line-clamp-1">{course.title}</p>
                            <p className="text-gray-400 text-sm">by {course.instructor || 'Unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          course.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                          course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {course.level}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white font-semibold">
                        ${course.price}
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {course.enrolledStudents || 0}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleTogglePublish(course._id, course.isPublished)}
                          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                            course.isPublished 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {course.isPublished ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Published
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/courses/${course._id}`}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/instructor/edit-course/${course._id}`}
                            className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            disabled={deleteLoading === course._id}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoading === course._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCourses;
