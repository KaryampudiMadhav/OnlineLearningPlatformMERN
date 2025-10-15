/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlayCircle, CheckCircle, Lock, BookOpen, Clock, 
  Award, ChevronDown, ChevronRight, ArrowLeft, Loader2,
  FileText, Download, Star
} from 'lucide-react';
import api from '../config/api';
import useAuthStore from '../store/authStore';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [completingLesson, setCompletingLesson] = useState(false);

  useEffect(() => {
    fetchCourseAndEnrollment();
  }, [id]);

  const fetchCourseAndEnrollment = async () => {
    try {
      setLoading(true);
      const [courseRes, enrollmentRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get('/enrollments/my-courses')
      ]);

      const courseData = courseRes.data.data || courseRes.data.course;
      setCourse(courseData);

      const enrollments = enrollmentRes.data.enrollments || enrollmentRes.data.data || [];
      const userEnrollment = enrollments.find(e => e.course._id === id || e.course === id);
      
      if (!userEnrollment) {
        alert('You are not enrolled in this course');
        navigate(`/courses/${id}`);
        return;
      }

      setEnrollment(userEnrollment);

      // Set first lesson as current if none selected
      if (courseData.curriculum && courseData.curriculum.length > 0) {
        const firstSection = courseData.curriculum[0];
        if (firstSection.lessons && firstSection.lessons.length > 0) {
          setCurrentLesson({
            sectionIndex: 0,
            lessonIndex: 0,
            lesson: firstSection.lessons[0],
            section: firstSection
          });
          setExpandedSections({ 0: true });
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      alert('Failed to load course. Please try again.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (sectionIndex, lessonIndex) => {
    if (!enrollment || !enrollment.completedLessons) return false;
    const lessonId = `${sectionIndex}-${lessonIndex}`;
    return enrollment.completedLessons.includes(lessonId);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || completingLesson) return;

    try {
      setCompletingLesson(true);
      const lessonId = `${currentLesson.sectionIndex}-${currentLesson.lessonIndex}`;
      
      const completedLessons = enrollment.completedLessons || [];
      const newCompletedLessons = completedLessons.includes(lessonId)
        ? completedLessons.filter(id => id !== lessonId)
        : [...completedLessons, lessonId];

      await api.put(`/enrollments/${enrollment._id}/progress`, {
        completedLessons: newCompletedLessons,
        progress: calculateProgress(newCompletedLessons)
      });

      setEnrollment({
        ...enrollment,
        completedLessons: newCompletedLessons,
        progress: calculateProgress(newCompletedLessons)
      });

      // Auto-advance to next lesson if marking as complete
      if (!completedLessons.includes(lessonId)) {
        setTimeout(() => goToNextLesson(), 500);
      }
    } catch (error) {
      alert('Failed to update progress');
    } finally {
      setCompletingLesson(false);
    }
  };

  const calculateProgress = (completedLessons) => {
    if (!course || !course.curriculum) return 0;
    let totalLessons = 0;
    course.curriculum.forEach(section => {
      totalLessons += section.lessons?.length || 0;
    });
    return totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  };

  const goToNextLesson = () => {
    if (!course || !currentLesson) return;

    const currentSection = course.curriculum[currentLesson.sectionIndex];
    
    // Check if there's a next lesson in current section
    if (currentLesson.lessonIndex < currentSection.lessons.length - 1) {
      const nextLesson = currentSection.lessons[currentLesson.lessonIndex + 1];
      setCurrentLesson({
        sectionIndex: currentLesson.sectionIndex,
        lessonIndex: currentLesson.lessonIndex + 1,
        lesson: nextLesson,
        section: currentSection
      });
    } 
    // Check if there's a next section
    else if (currentLesson.sectionIndex < course.curriculum.length - 1) {
      const nextSection = course.curriculum[currentLesson.sectionIndex + 1];
      if (nextSection.lessons && nextSection.lessons.length > 0) {
        setCurrentLesson({
          sectionIndex: currentLesson.sectionIndex + 1,
          lessonIndex: 0,
          lesson: nextSection.lessons[0],
          section: nextSection
        });
        setExpandedSections({ ...expandedSections, [currentLesson.sectionIndex + 1]: true });
      }
    }
  };

  const goToPreviousLesson = () => {
    if (!course || !currentLesson) return;

    // Check if there's a previous lesson in current section
    if (currentLesson.lessonIndex > 0) {
      const currentSection = course.curriculum[currentLesson.sectionIndex];
      const prevLesson = currentSection.lessons[currentLesson.lessonIndex - 1];
      setCurrentLesson({
        sectionIndex: currentLesson.sectionIndex,
        lessonIndex: currentLesson.lessonIndex - 1,
        lesson: prevLesson,
        section: currentSection
      });
    }
    // Check if there's a previous section
    else if (currentLesson.sectionIndex > 0) {
      const prevSection = course.curriculum[currentLesson.sectionIndex - 1];
      if (prevSection.lessons && prevSection.lessons.length > 0) {
        const lastLessonIndex = prevSection.lessons.length - 1;
        setCurrentLesson({
          sectionIndex: currentLesson.sectionIndex - 1,
          lessonIndex: lastLessonIndex,
          lesson: prevSection.lessons[lastLessonIndex],
          section: prevSection
        });
        setExpandedSections({ ...expandedSections, [currentLesson.sectionIndex - 1]: true });
      }
    }
  };

  const selectLesson = (sectionIndex, lessonIndex) => {
    const section = course.curriculum[sectionIndex];
    const lesson = section.lessons[lessonIndex];
    setCurrentLesson({
      sectionIndex,
      lessonIndex,
      lesson,
      section
    });
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections({
      ...expandedSections,
      [sectionIndex]: !expandedSections[sectionIndex]
    });
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
          <Link to="/dashboard" className="text-purple-400 hover:text-purple-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentProgress = enrollment?.progress || 0;
  const totalLessons = course.curriculum?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;
  const completedCount = enrollment?.completedLessons?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-[1800px] px-4 py-20">
        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          {/* Progress Bar */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-gray-300">
                  {completedCount} of {totalLessons} lessons completed
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{currentProgress}%</div>
                  <p className="text-gray-400 text-sm">Complete</p>
                </div>
                {currentProgress === 100 && (
                  <Award className="w-12 h-12 text-yellow-500" />
                )}
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentProgress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Content Player */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
              {currentLesson?.lesson.videoUrl ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={currentLesson.lesson.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={currentLesson.lesson.title}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <PlayCircle className="w-32 h-32 text-white/30" />
                </div>
              )}
            </div>

            {/* Lesson Info */}
            {currentLesson && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {currentLesson.lesson.title}
                    </h2>
                    <div className="flex items-center gap-4 text-gray-300 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentLesson.lesson.duration || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {currentLesson.section.title}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleMarkComplete}
                    disabled={completingLesson}
                    className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                      isLessonCompleted(currentLesson.sectionIndex, currentLesson.lessonIndex)
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isLessonCompleted(currentLesson.sectionIndex, currentLesson.lessonIndex)
                      ? 'Completed'
                      : 'Mark Complete'}
                  </button>
                </div>

                {/* Lesson Content */}
                {currentLesson.lesson.content && (
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        Lesson Notes
                      </h3>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {currentLesson.lesson.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
                  <button
                    onClick={goToPreviousLesson}
                    disabled={currentLesson.sectionIndex === 0 && currentLesson.lessonIndex === 0}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous Lesson
                  </button>
                  <button
                    onClick={goToNextLesson}
                    disabled={
                      currentLesson.sectionIndex === course.curriculum.length - 1 &&
                      currentLesson.lessonIndex === course.curriculum[course.curriculum.length - 1].lessons.length - 1
                    }
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Lesson →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Course Curriculum */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Course Content
              </h3>

              <div className="space-y-3">
                {course.curriculum?.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full bg-white/5 p-4 text-left hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">
                            Section {sectionIndex + 1}: {section.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {section.lessons?.filter((_, lIdx) => isLessonCompleted(sectionIndex, lIdx)).length || 0} / {section.lessons?.length || 0} completed
                          </p>
                        </div>
                        {expandedSections[sectionIndex] ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedSections[sectionIndex] && section.lessons && (
                      <div className="divide-y divide-white/10">
                        {section.lessons.map((lesson, lessonIndex) => {
                          const isCompleted = isLessonCompleted(sectionIndex, lessonIndex);
                          const isCurrent = currentLesson?.sectionIndex === sectionIndex && currentLesson?.lessonIndex === lessonIndex;
                          
                          return (
                            <button
                              key={lessonIndex}
                              onClick={() => selectLesson(sectionIndex, lessonIndex)}
                              className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                                isCurrent ? 'bg-purple-500/20' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                ) : (
                                  <PlayCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium ${isCurrent ? 'text-purple-300' : 'text-white'} truncate`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {lesson.duration || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;
