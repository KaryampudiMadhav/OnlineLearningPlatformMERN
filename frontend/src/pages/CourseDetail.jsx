/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, Clock, Users, BookOpen, Award, TrendingUp, 
  CheckCircle, PlayCircle, Loader2, ArrowLeft, Heart
} from 'lucide-react';
import api from '../config/api';
import useAuthStore from '../store/authStore';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data || response.data.course);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/enrollments/${id}`);
      setEnrolled(true);
      alert('Successfully enrolled! Check your dashboard.');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <Link to="/courses" className="text-purple-400 hover:text-purple-300">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Back Button */}
      <div className="container mx-auto max-w-7xl px-4 pt-24">
        <Link to="/courses" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
      </div>

      {/* Hero Section */}
      <section className="px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Category & Level */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">
                    {course.category}
                  </span>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    course.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                    course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {course.level}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {course.title}
                </h1>

                {/* Description */}
                <p className="text-xl text-gray-300 mb-6">
                  {course.description}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-8 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">
                      {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'No ratings'}
                    </span>
                    {course.reviewCount > 0 && (
                      <Link 
                        to={`/courses/${id}/reviews`}
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        ({course.reviewCount} {course.reviewCount === 1 ? 'review' : 'reviews'})
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <span>{course.enrolledStudents || 0} students enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span>{course.duration || 0} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-pink-400" />
                    <span>By {course.instructor?.name || course.instructor || 'Unknown'}</span>
                  </div>
                </div>

                {/* Course Image */}
                <div className="relative h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle className="w-32 h-32 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                </div>

                {/* What You'll Learn */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                      course.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{item}</span>
                        </div>
                      ))
                    ) : (
                      [
                        'Master core concepts and fundamentals',
                        'Build real-world projects',
                        'Learn industry best practices',
                        'Get hands-on experience',
                        'Understand advanced techniques',
                        'Develop problem-solving skills'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{item}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Course Curriculum */}
                {course.curriculum && course.curriculum.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
                    <div className="space-y-4">
                      {course.curriculum.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border border-white/10 rounded-xl overflow-hidden">
                          <div className="bg-white/5 p-4">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              Section {sectionIndex + 1}: {section.title}
                            </h3>
                            {section.description && (
                              <p className="text-gray-400 text-sm mb-2">{section.description}</p>
                            )}
                            <p className="text-purple-400 text-sm">
                              {section.lessons?.length || 0} lessons • {section.duration || 'N/A'}
                            </p>
                          </div>
                          {section.lessons && section.lessons.length > 0 && (
                            <div className="divide-y divide-white/10">
                              {section.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="p-4 hover:bg-white/5 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <PlayCircle className={`w-5 h-5 ${lesson.isPreview ? 'text-green-400' : 'text-gray-400'}`} />
                                      <div>
                                        <p className="text-white font-medium">{lesson.title}</p>
                                        {lesson.isPreview && (
                                          <span className="text-xs text-green-400">Free Preview</span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-gray-400 text-sm">{lesson.duration || 'N/A'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {course.requirements && course.requirements.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Requirements</h2>
                    <ul className="space-y-3">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-300">
                          <span className="text-purple-400">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* About Instructor */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">About the Instructor</h2>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                      {course.instructor?.name?.charAt(0) || 'I'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {course.instructor?.name || 'Instructor'}
                      </h3>
                      <p className="text-gray-400 mb-3">{course.instructor?.email}</p>
                      <p className="text-gray-300">
                        Experienced instructor passionate about sharing knowledge and helping students succeed.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Enrollment Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-white mb-2">
                      ${course.price}
                    </div>
                    <p className="text-gray-400">One-time payment</p>
                  </div>

                  {/* Enroll Button */}
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || enrolled}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {enrolling ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enrolling...
                      </span>
                    ) : enrolled ? (
                      'Enrolled!'
                    ) : (
                      'Enroll Now'
                    )}
                  </button>

                  {/* View Reviews Button */}
                  <Link
                    to={`/courses/${id}/reviews`}
                    className="w-full py-3 bg-gray-800 border border-gray-700 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Star className="w-5 h-5 text-yellow-400" />
                    View Reviews {course.reviewCount > 0 && `(${course.reviewCount})`}
                  </Link>

                  {/* Course Includes */}
                  <div className="space-y-4 pt-6 border-t border-white/20">
                    <h3 className="font-semibold text-white mb-4">This course includes:</h3>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span>{course.duration || 0} hours of content</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <span>Comprehensive materials</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Award className="w-5 h-5 text-purple-400" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span>Community support</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
