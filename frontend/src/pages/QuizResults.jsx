import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../config/api';
import {
  Award, CheckCircle, XCircle, Clock, TrendingUp,
  BarChart, RefreshCw, Home, Loader2, BookOpen
} from 'lucide-react';

const QuizResults = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      const response = await api.get(`/quizzes/attempt/${attemptId}`);
      setAttempt(response.data.attempt);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load quiz results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
  const totalQuestions = attempt.answers.length;
  const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${
            attempt.passed
              ? 'from-green-600 to-emerald-600'
              : 'from-red-600 to-rose-600'
          } rounded-2xl p-8 mb-8 text-white`}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              {attempt.passed ? (
                <Award className="w-24 h-24 mx-auto" />
              ) : (
                <XCircle className="w-24 h-24 mx-auto" />
              )}
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4">
              {attempt.passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
            </h1>
            
            <p className="text-xl opacity-90 mb-6">
              {attempt.passed
                ? 'You passed the quiz!'
                : 'You didn\'t pass this time, but don\'t give up!'}
            </p>

            {/* Score Display */}
            <div className="inline-block bg-white/20 backdrop-blur-lg rounded-2xl px-12 py-6">
              <p className="text-lg opacity-80 mb-2">Your Score</p>
              <p className="text-7xl font-bold">{attempt.score}%</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <BarChart className="w-6 h-6 text-blue-400" />
              <h3 className="text-white font-semibold">Points</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {attempt.pointsEarned} / {attempt.totalPoints}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-semibold">Correct</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {correctAnswers} / {totalQuestions}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-semibold">Accuracy</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">{accuracy}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-semibold">Time</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {formatTime(attempt.timeSpent)}
            </p>
          </motion.div>
        </div>

        {/* Detailed Results */}
        {attempt.quiz.showCorrectAnswers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Question Review</h2>
            
            <div className="space-y-6">
              {attempt.quiz.questions.map((question, qIndex) => {
                const answer = attempt.answers.find(a => a.questionId.toString() === question._id.toString());
                const isCorrect = answer?.isCorrect;

                return (
                  <div
                    key={question._id}
                    className={`border-2 rounded-xl p-6 ${
                      isCorrect
                        ? 'bg-green-500/10 border-green-400/50'
                        : 'bg-red-500/10 border-red-400/50'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {qIndex + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <span className={`font-semibold ${
                            isCorrect ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                          <span className="text-gray-400 ml-auto">
                            {question.points} {question.points === 1 ? 'point' : 'points'}
                          </span>
                        </div>
                        <p className="text-white text-lg">{question.question}</p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 ml-14">
                      {question.options.map((option, oIndex) => {
                        const isUserAnswer = answer?.selectedOptions.includes(oIndex);
                        const isCorrectOption = option.isCorrect;

                        let optionClass = 'bg-white/5 border-white/20 text-gray-300';
                        if (isCorrectOption) {
                          optionClass = 'bg-green-600/20 border-green-400/50 text-green-300';
                        } else if (isUserAnswer && !isCorrectOption) {
                          optionClass = 'bg-red-600/20 border-red-400/50 text-red-300';
                        }

                        return (
                          <div
                            key={oIndex}
                            className={`border-2 rounded-lg p-3 flex items-center gap-3 ${optionClass}`}
                          >
                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-semibold">
                              {['A', 'B', 'C', 'D', 'E', 'F'][oIndex]}
                            </div>
                            <span className="flex-1">{option.text}</span>
                            {isCorrectOption && (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                            {isUserAnswer && !isCorrectOption && (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {attempt.quiz.showExplanations && question.explanation && (
                      <div className="ml-14 mt-4 p-4 bg-blue-500/20 border border-blue-400/50 rounded-lg">
                        <p className="text-blue-300 text-sm font-semibold mb-1">Explanation:</p>
                        <p className="text-gray-300">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            to={`/learn/${attempt.course}`}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
          >
            <BookOpen className="w-5 h-5" />
            Back to Course
          </Link>

          {!attempt.passed && (
            <Link
              to={`/quiz/${attempt.quiz._id}`}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Retake Quiz
            </Link>
          )}

          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizResults;
