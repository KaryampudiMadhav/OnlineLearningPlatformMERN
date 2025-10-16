/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PlayCircle, Clock, Target, BookOpen, Trophy, Plus, Edit } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../config/api';

const CourseQuizzes = () => {
  const { id: courseId } = useParams();
  const { user } = useAuthStore();
  const [courseStructure, setCourseStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseStructure();
  }, [courseId]);

  const fetchCourseStructure = async () => {
    try {
      const { data } = await api.get(`/quizzes/course/${courseId}/structure`);
      setCourseStructure(data.course);
    } catch (error) {
      console.error('Error fetching course structure:', error);
    } finally {
      setLoading(false);
    }
  };

  const canManageQuizzes = () => {
    return user && (user.role === 'admin' || user.role === 'instructor');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!courseStructure) {
    return (
      <div className="text-center py-12">
        <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400">Failed to load course structure</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Course Quizzes</h2>
          <p className="text-gray-400">Test your knowledge at different stages</p>
        </div>
        
        {canManageQuizzes() && (
          <Link
            to={`/instructor/create-module-quiz/${courseId}`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Create Quiz
          </Link>
        )}
      </div>

      {/* Course-Level Quizzes */}
      {courseStructure.courseQuizzes && courseStructure.courseQuizzes.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-yellow-400" size={24} />
            <h3 className="text-xl font-semibold text-white">Course Assessment</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {courseStructure.courseQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} type="course" canManage={canManageQuizzes()} />
            ))}
          </div>
        </div>
      )}

      {/* Module-Based Quizzes */}
      {courseStructure.modules && courseStructure.modules.length > 0 && (
        <div className="space-y-6">
          {courseStructure.modules.map((module, moduleIndex) => (
            <ModuleQuizSection 
              key={moduleIndex}
              module={module}
              moduleIndex={moduleIndex}
              canManage={canManageQuizzes()}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {(!courseStructure.courseQuizzes || courseStructure.courseQuizzes.length === 0) &&
       (!courseStructure.modules || courseStructure.modules.every(m => 
         (!m.moduleQuizzes || m.moduleQuizzes.length === 0) && 
         (!m.lessons || m.lessons.every(l => !l.lessonQuizzes || l.lessonQuizzes.length === 0))
       )) && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg mb-2">No quizzes available yet</p>
          {canManageQuizzes() ? (
            <p className="text-gray-500">Create your first quiz to test student knowledge</p>
          ) : (
            <p className="text-gray-500">Check back later for quizzes and assessments</p>
          )}
        </div>
      )}
    </div>
  );
};

const ModuleQuizSection = ({ module, moduleIndex, canManage }) => {
  const hasModuleQuizzes = module.moduleQuizzes && module.moduleQuizzes.length > 0;
  const hasLessonQuizzes = module.lessons && module.lessons.some(l => l.lessonQuizzes && l.lessonQuizzes.length > 0);
  
  if (!hasModuleQuizzes && !hasLessonQuizzes) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="text-green-400" size={24} />
        <div>
          <h3 className="text-xl font-semibold text-white">{module.title}</h3>
          <p className="text-gray-400 text-sm">Module {moduleIndex + 1}</p>
        </div>
      </div>

      {/* Module Quizzes */}
      {hasModuleQuizzes && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-3">Module Assessment</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {module.moduleQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} type="module" canManage={canManage} />
            ))}
          </div>
        </div>
      )}

      {/* Lesson Quizzes */}
      {hasLessonQuizzes && (
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Lesson Quizzes</h4>
          <div className="space-y-4">
            {module.lessons.map((lesson, lessonIndex) => (
              lesson.lessonQuizzes && lesson.lessonQuizzes.length > 0 && (
                <div key={lessonIndex} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <PlayCircle className="text-blue-400" size={20} />
                    <h5 className="font-medium text-white">{lesson.title}</h5>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    {lesson.lessonQuizzes.map((quiz) => (
                      <QuizCard key={quiz._id} quiz={quiz} type="lesson" canManage={canManage} compact />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const QuizCard = ({ quiz, type, canManage, compact = false }) => {
  const getTypeConfig = () => {
    const configs = {
      course: { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', label: 'Course' },
      module: { color: 'text-green-400', bgColor: 'bg-green-400/10', label: 'Module' },
      lesson: { color: 'text-blue-400', bgColor: 'bg-blue-400/10', label: 'Lesson' }
    };
    return configs[type] || configs.course;
  };

  const config = getTypeConfig();

  return (
    <div className={`bg-gray-600 rounded-lg p-4 border border-gray-500 hover:border-purple-500 transition-colors ${compact ? 'text-sm' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 ${config.bgColor} ${config.color} rounded text-xs font-medium`}>
              {config.label}
            </span>
            {quiz.duration && (
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock size={12} />
                {quiz.duration}min
              </span>
            )}
          </div>
          
          <h4 className={`font-medium text-white mb-1 ${compact ? 'text-sm' : 'text-base'}`}>
            {quiz.title}
          </h4>
          
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span>{quiz.questionCount || 0} questions</span>
            {quiz.passingScore && (
              <span className="flex items-center gap-1">
                <Target size={12} />
                {quiz.passingScore}% to pass
              </span>
            )}
          </div>
        </div>

        {canManage && (
          <button className="text-gray-400 hover:text-white p-1">
            <Edit size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          to={`/quiz/${quiz._id}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <PlayCircle size={16} />
          Start Quiz
        </Link>
        
        {canManage && (
          <Link
            to={`/instructor/quiz/${quiz._id}/stats`}
            className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
          >
            Stats
          </Link>
        )}
      </div>
    </div>
  );
};

export default CourseQuizzes;