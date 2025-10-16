import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, Target, TrendingUp, Star, 
  ArrowRight, Brain, CheckCircle, Play
} from 'lucide-react';
import api from '../config/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const ModuleQuizSelection = () => {
  const { courseId, moduleIndex } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    fetchCourseAndQuizzes();
  }, [courseId, moduleIndex]);

  const fetchCourseAndQuizzes = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseResponse = await api.get(`/courses/${courseId}`);
      const courseData = courseResponse.data.data || courseResponse.data;
      setCourse(courseData);

      // Fetch all quizzes for this module
      const quizzesResponse = await api.get(`/quizzes/course/${courseId}/module/${moduleIndex}/all`);
      
      if (quizzesResponse.data.success) {
        setQuizzes(quizzesResponse.data.quizzes || []);
        console.log(`Found ${quizzesResponse.data.quizzes?.length || 0} quizzes for module`);
      }
    } catch (error) {
      console.error('Failed to fetch course and quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'advanced': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return <CheckCircle className="w-5 h-5" />;
      case 'intermediate': return <Target className="w-5 h-5" />;
      case 'advanced': return <Brain className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const filteredQuizzes = selectedDifficulty === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.difficulty?.toLowerCase() === selectedDifficulty);

  const handleStartQuiz = (quizId) => {
    navigate(`/courses/${courseId}/module/${moduleIndex}/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  const module = course?.curriculum?.[parseInt(moduleIndex)];

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Module Quizzes</h1>
              <p className="text-gray-300">{module?.title}</p>
              {course && (
                <p className="text-gray-400 text-sm">Course: {course.title}</p>
              )}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDifficulty('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDifficulty === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              All Levels ({quizzes.length})
            </button>
            {['beginner', 'intermediate', 'advanced'].map(difficulty => {
              const count = quizzes.filter(q => q.difficulty?.toLowerCase() === difficulty).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    selectedDifficulty === difficulty
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {difficulty} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Quizzes Found</h3>
            <p className="text-gray-400">
              {selectedDifficulty === 'all' 
                ? 'No quizzes are available for this module yet.'
                : `No ${selectedDifficulty} quizzes are available for this module.`
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => (
              <div key={quiz._id} className="bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Quiz Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${getDifficultyColor(quiz.difficulty)}`}>
                      {getDifficultyIcon(quiz.difficulty)}
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty || 'Standard'}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">Quiz {index + 1}</span>
                </div>

                {/* Quiz Title & Description */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {quiz.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {quiz.description}
                </p>

                {/* Quiz Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.duration || 15} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{quiz.questions?.length || 0} questions</span>
                  </div>
                </div>

                {/* Start Quiz Button */}
                <button
                  onClick={() => handleStartQuiz(quiz._id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Start Quiz
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(`/courses/${courseId}/learn`)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleQuizSelection;