import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Star, Clock, CheckCircle, Lock, Flame, 
  BookOpen, MessageSquare, Award, Target, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../config/api';

const DailyChallenges = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingChallenge, setCompletingChallenge] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/challenges/today');
      setChallenges(data.challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (challengeId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setCompletingChallenge(challengeId);
      const { data } = await api.post(`/challenges/${challengeId}/complete`);
      
      if (data.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        fetchChallenges();
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      alert(error.response?.data?.message || 'Failed to complete challenge');
    } finally {
      setCompletingChallenge(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getChallengeIcon = (type) => {
    switch (type) {
      case 'quiz': return Star;
      case 'study_time': return Clock;
      case 'course_completion': return BookOpen;
      case 'streak': return Flame;
      case 'review': return MessageSquare;
      case 'discussion': return MessageSquare;
      default: return Target;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const completedCount = challenges.filter(c => c.isCompleted).length;
  const totalXP = challenges.reduce((sum, c) => sum + (c.isCompleted ? c.xpReward : 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-9xl"
          >
            🎉
          </motion.div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4"
          >
            <Trophy size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Daily Challenges</h1>
          <p className="text-gray-400">Complete challenges to earn bonus XP!</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Challenges Today</p>
                <p className="text-3xl font-bold">{challenges.length}</p>
              </div>
              <Target size={40} className="text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-400">
                  {completedCount}/{challenges.length}
                </p>
              </div>
              <CheckCircle size={40} className="text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">XP Earned Today</p>
                <p className="text-3xl font-bold text-yellow-400">{totalXP}</p>
              </div>
              <Zap size={40} className="text-yellow-400" />
            </div>
          </motion.div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {challenges.map((challenge, index) => {
              const Icon = getChallengeIcon(challenge.type);
              const isCompleted = challenge.isCompleted;
              const progress = challenge.userProgress || 0;
              const progressPercent = (progress / challenge.targetValue) * 100;

              return (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-purple-500'
                  }`}
                >
                  {/* Challenge Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-purple-500/20'}`}>
                        <Icon size={24} className={isCompleted ? 'text-green-400' : 'text-purple-400'} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>

                    {/* Progress Bar */}
                    {!isCompleted && progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{progress} / {challenge.targetValue}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Reward Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={20} className="text-yellow-400" />
                        <span className="font-bold text-yellow-400">+{challenge.xpReward} XP</span>
                      </div>
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle size={20} />
                          <span className="font-semibold">Completed!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => completeChallenge(challenge._id)}
                          disabled={completingChallenge === challenge._id || !isAuthenticated}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            completingChallenge === challenge._id
                              ? 'bg-gray-600 cursor-not-allowed'
                              : !isAuthenticated
                              ? 'bg-gray-600 cursor-pointer hover:bg-gray-500'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          }`}
                        >
                          {completingChallenge === challenge._id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              <span>Checking...</span>
                            </div>
                          ) : !isAuthenticated ? (
                            'Login to Complete'
                          ) : (
                            'Mark Complete'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {challenges.length === 0 && (
          <div className="text-center py-12">
            <Lock size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-2">No challenges available today</p>
            <p className="text-gray-500">Check back tomorrow for new challenges!</p>
          </div>
        )}

        {/* All Completed State */}
        {challenges.length > 0 && completedCount === challenges.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-r from-green-600/20 to-blue-600/20 border-2 border-green-500 rounded-lg p-8 text-center"
          >
            <Trophy size={64} className="mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">All Challenges Completed! 🎉</h3>
            <p className="text-gray-300 mb-4">
              You've earned <span className="font-bold text-yellow-400">{totalXP} XP</span> today!
            </p>
            <p className="text-gray-400">Come back tomorrow for new challenges!</p>
          </motion.div>
        )}

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="mt-8 bg-purple-600/20 border border-purple-500 rounded-lg p-6 text-center">
            <p className="text-lg mb-4">
              <Lock className="inline mr-2" size={20} />
              Login to track your progress and earn rewards!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Login Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenges;
