/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Star, Clock, Users, BookOpen, 
  TrendingUp, Award, ChevronDown, X, Loader2 
} from 'lucide-react';
import api from '../config/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'Web Development', 'Mobile Development', 'Data Science', 'Design', 'Business', 'Marketing'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel, sortBy, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let query = `/courses?`;
      
      if (selectedCategory !== 'all') query += `category=${selectedCategory}&`;
      if (selectedLevel !== 'all') query += `level=${selectedLevel}&`;
      if (searchTerm) query += `search=${searchTerm}&`;
      if (sortBy) query += `sort=${sortBy}`;

      const response = await api.get(query);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Explore Our
              <span className="block mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Courses
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover world-class courses taught by industry experts
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center items-center"
          >
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                {levels.map(level => (
                  <option key={level} value={level} className="bg-slate-900">
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                <option value="-createdAt" className="bg-slate-900">Newest First</option>
                <option value="createdAt" className="bg-slate-900">Oldest First</option>
                <option value="-rating" className="bg-slate-900">Highest Rated</option>
                <option value="price" className="bg-slate-900">Price: Low to High</option>
                <option value="-price" className="bg-slate-900">Price: High to Low</option>
              </select>
            </div>
          </motion.div>

          {/* Mobile Filters Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl"
              >
                <div className="flex flex-col gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {levels.map(level => (
                      <option key={level} value={level} className="bg-slate-900">
                        {level === 'all' ? 'All Levels' : level}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="-createdAt" className="bg-slate-900">Newest First</option>
                    <option value="createdAt" className="bg-slate-900">Oldest First</option>
                    <option value="-rating" className="bg-slate-900">Highest Rated</option>
                    <option value="price" className="bg-slate-900">Price: Low to High</option>
                    <option value="-price" className="bg-slate-900">Price: High to Low</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
          ) : filteredCourses && filteredCourses.length > 0 ? (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-300 mb-8"
              >
                Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </motion.p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, index) => (
                  <CourseCard key={course._id} course={course} index={index} />
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <BookOpen className="w-20 h-20 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search term</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

const CourseCard = ({ course, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={`/courses/${course._id}`}>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300">
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
            
            {/* Level Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-lg ${
                course.level === 'Beginner' ? 'bg-green-500/80 text-white' :
                course.level === 'Intermediate' ? 'bg-yellow-500/80 text-white' :
                'bg-red-500/80 text-white'
              }`}>
                {course.level}
              </span>
            </div>
          </div>

          {/* Course Info */}
          <div className="p-6">
            {/* Category */}
            <div className="text-purple-400 text-sm font-semibold mb-2">
              {course.category}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{course.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrolledStudents || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration || 0}h</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="text-sm text-gray-400 mb-4">
              by <span className="text-white">{course.instructor?.name || 'Unknown'}</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">
                ${course.price}
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                View Details
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Courses;
