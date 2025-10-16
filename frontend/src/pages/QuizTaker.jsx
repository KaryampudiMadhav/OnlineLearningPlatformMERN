import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../config/api';
import {
  Clock, CheckCircle, XCircle, AlertCircle, Award,
  ChevronLeft, ChevronRight, Flag, Loader2
} from 'lucide-react';

const QuizTaker = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [startTime] = useState(Date.now());

  // Fetch quiz details
  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      setQuiz(response.data.quiz);
      setAttemptInfo(response.data.attempts);
      setTimeRemaining(response.data.quiz.duration * 60); // Convert to seconds
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
      navigate(-1);
    }
  };

  // Start quiz attempt
  const startQuiz = async () => {
    try {
      const response = await api.post(`/quizzes/${quizId}/start`);
      setAttempt(response.data.attempt);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to start quiz');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!attempt || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, timeRemaining]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, optionIndex) => {
    const question = quiz.questions[currentQuestion];
    
    if (question.type === 'multiple-select') {
      // Toggle option for multiple select
      setAnswers(prev => {
        const current = prev[questionId] || [];
        const newAnswers = current.includes(optionIndex)
          ? current.filter(idx => idx !== optionIndex)
          : [...current, optionIndex];
        return { ...prev, [questionId]: newAnswers };
      });
    } else {
      // Single selection
      setAnswers(prev => ({ ...prev, [questionId]: [optionIndex] }));
    }
  };

  // Navigate questions
  const goToQuestion = (index) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentQuestion(index);
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptions]) => ({
        questionId,
        selectedOptions
      }));

      const response = await api.post(`/quizzes/${quizId}/submit`, {
        attemptId: attempt._id,
        answers: formattedAnswers,
        timeSpent
      });

      // Navigate to results page
      navigate(`/quiz-results/${response.data.attempt._id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
      setSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz?.questions.length) * 100 || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Quiz introduction screen
  if (!attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8"
          >
            {/* Quiz Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-300 text-lg">{quiz.description}</p>
              )}
            </div>

            {/* Quiz Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Duration</h3>
                </div>
                <p className="text-3xl font-bold text-purple-400">{quiz.duration} minutes</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Passing Score</h3>
                </div>
                <p className="text-3xl font-bold text-green-400">{quiz.passingScore}%</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Flag className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Questions</h3>
                </div>
                <p className="text-3xl font-bold text-blue-400">{quiz.questionCount}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Attempts</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-400">
                  {attemptInfo.remaining} / {quiz.maxAttempts}
                </p>
              </div>
            </div>

            {/* Instructions */}
            {quiz.instructions && (
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">Instructions</h3>
                <p className="text-gray-300 whitespace-pre-line">{quiz.instructions}</p>
              </div>
            )}

            {/* Previous Attempts */}
            {attemptInfo.count > 0 && (
              <div className="bg-white/5 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Your Previous Attempts</h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    Attempts: <span className="font-semibold text-white">{attemptInfo.count}</span>
                  </p>
                  <p className="text-gray-300">
                    Best Score: <span className="font-semibold text-green-400">{attemptInfo.bestScore}%</span>
                  </p>
                  {attemptInfo.lastAttempt && (
                    <p className="text-gray-300">
                      Last Status:{' '}
                      <span className={`font-semibold ${attemptInfo.lastAttempt.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {attemptInfo.lastAttempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Start Button */}
            {attemptInfo.canRetake ? (
              <button
                onClick={startQuiz}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                {attemptInfo.count > 0 ? 'Retake Quiz' : 'Start Quiz'}
              </button>
            ) : (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-300 font-semibold">
                  You have reached the maximum number of attempts for this quiz
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const currentAnswer = answers[question._id] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Progress</span>
              <span>{answeredCount} / {quiz.questions.length} answered</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8"
              >
                {/* Question Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">
                      Question {currentQuestion + 1}
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg text-sm">
                      {question.points} {question.points === 1 ? 'point' : 'points'}
                    </span>
                    {question.type === 'multiple-select' && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                        Multiple Select
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold text-white leading-relaxed">
                    {question.question}
                  </h2>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = currentAnswer.includes(index);
                    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(question._id, index)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-purple-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            isSelected ? 'bg-white/20' : 'bg-white/10'
                          }`}>
                            {optionLabels[index]}
                          </div>
                          <span className="flex-1">{option.text}</span>
                          {isSelected && (
                            <CheckCircle className="w-6 h-6" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/20">
                  <button
                    onClick={() => goToQuestion(currentQuestion - 1)}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  {currentQuestion === quiz.questions.length - 1 ? (
                    <button
                      onClick={() => setShowSubmitConfirm(true)}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                    >
                      <Flag className="w-5 h-5" />
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => goToQuestion(currentQuestion + 1)}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-white mb-4">Questions</h3>
              <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                {quiz.questions.map((q, index) => {
                  const isAnswered = answers[q._id] !== undefined;
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={q._id}
                      onClick={() => goToQuestion(index)}
                      className={`aspect-square rounded-lg font-semibold transition-all ${
                        isCurrent
                          ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                          : isAnswered
                          ? 'bg-green-600 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <Flag className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Submit Quiz?</h2>
                <p className="text-gray-300">
                  You have answered {answeredCount} out of {quiz.questions.length} questions.
                </p>
                {answeredCount < quiz.questions.length && (
                  <p className="text-yellow-400 mt-2 font-semibold">
                    ⚠️ {quiz.questions.length - answeredCount} question(s) unanswered
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                  disabled={submitting}
                >
                  Review
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;
