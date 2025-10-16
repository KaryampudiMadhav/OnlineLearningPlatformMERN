import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, TrendingUp, Flame, Award, Trophy, Target, 
  BookOpen, CheckCircle, MessageSquare, Medal, Zap
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../config/api';

const GamificationDashboard = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuthStore();
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progressRes, badgesRes, achievementsRes, statsRes] = await Promise.all([
        api.get('/gamification/progress'),
        api.get('/gamification/badges'),
        api.get('/gamification/achievements'),
        api.get('/gamification/stats')
      ]);

      setProgress(progressRes.data.progress);
      setBadges(badgesRes.data.badges);
      setAchievements(achievementsRes.data.achievements);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Target size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">Start learning to unlock gamification features!</p>
        </div>
      </div>
    );
  }

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const inProgressAchievements = achievements.filter(a => !a.unlocked && a.progress > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
          <p className="text-gray-400">Track your learning journey and achievements</p>
        </div>

        {/* Level and XP Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-purple-200 mb-1">Current Level</p>
              <h2 className="text-5xl font-bold text-white">{progress.level}</h2>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <TrendingUp size={40} className="text-white" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-purple-200 mb-2">
              <span>{progress.currentLevelXP} XP</span>
              <span>{progress.nextLevelXP} XP</span>
            </div>
            <div className="h-4 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                style={{ width: `${progress.levelProgress}%` }}
              />
            </div>
            <p className="text-center text-purple-200 mt-2">
              {progress.nextLevelXP - progress.currentLevelXP} XP to Level {progress.level + 1}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <Star size={24} className="mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold text-white">{progress.totalXP}</p>
              <p className="text-sm text-purple-200">Total XP</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <Flame size={24} className="mx-auto mb-2 text-orange-400" />
              <p className="text-2xl font-bold text-white">{progress.currentStreak}</p>
              <p className="text-sm text-purple-200">Day Streak</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <Award size={24} className="mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold text-white">{earnedBadges.length}</p>
              <p className="text-sm text-purple-200">Badges</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <Trophy size={24} className="mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold text-white">{stats?.rank || 'N/A'}</p>
              <p className="text-sm text-purple-200">Rank</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Streak Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">🔥 Streak</h3>
                <Flame className="text-orange-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-400">{progress.currentStreak} days</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Longest Streak</p>
                  <p className="text-2xl font-bold text-gray-300">{progress.longestStreak} days</p>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Keep logging in daily to maintain your streak! 🎯
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">📊 Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-400" />
                    <span className="text-gray-300">Courses</span>
                  </div>
                  <span className="font-bold text-blue-400">{progress.coursesCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-400" />
                    <span className="text-gray-300">Quizzes Passed</span>
                  </div>
                  <span className="font-bold text-green-400">{progress.quizzesPassed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-yellow-400" />
                    <span className="text-gray-300">Reviews</span>
                  </div>
                  <span className="font-bold text-yellow-400">{progress.reviewsWritten}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={20} className="text-purple-400" />
                    <span className="text-gray-300">Certificates</span>
                  </div>
                  <span className="font-bold text-purple-400">{progress.certificatesEarned}</span>
                </div>
              </div>
            </div>

            {/* Leaderboard CTA */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Trophy size={20} />
              View Leaderboard
            </button>
          </div>

          {/* Right Column - Badges & Achievements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Badges Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  Badges ({earnedBadges.length}/{badges.length})
                </h3>
              </div>

              {/* Earned Badges */}
              {earnedBadges.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-green-400">Earned</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {earnedBadges.map((badge) => (
                      <div
                        key={badge._id}
                        className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border-2 border-green-500 hover:scale-105 transition-transform"
                        title={badge.description}
                      >
                        <div className="text-4xl text-center mb-2">{badge.icon}</div>
                        <p className="text-center text-sm font-semibold truncate">{badge.name}</p>
                        <p className="text-center text-xs text-gray-400 capitalize">{badge.rarity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Badges */}
              {lockedBadges.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-400">Locked</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {lockedBadges.slice(0, 8).map((badge) => (
                      <div
                        key={badge._id}
                        className="bg-gray-900 rounded-lg p-4 border border-gray-700 opacity-50 hover:opacity-75 transition-opacity"
                        title={badge.description}
                      >
                        <div className="text-4xl text-center mb-2 grayscale">{badge.icon}</div>
                        <p className="text-center text-sm font-semibold truncate">{badge.name}</p>
                        <p className="text-center text-xs text-gray-500 capitalize">{badge.rarity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Achievements Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="text-purple-400" />
                  Achievements ({unlockedAchievements.length}/{achievements.length})
                </h3>
              </div>

              <div className="space-y-4">
                {/* Unlocked Achievements */}
                {unlockedAchievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement._id}
                    className="bg-gradient-to-r from-green-900/30 to-gray-700 border-l-4 border-green-500 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{achievement.name}</h4>
                        <p className="text-sm text-gray-300 mb-2">{achievement.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs bg-green-600 px-3 py-1 rounded-full">✓ Unlocked</span>
                          {achievement.rewards.xp > 0 && (
                            <span className="text-xs text-yellow-400">+{achievement.rewards.xp} XP</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* In Progress Achievements */}
                {inProgressAchievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement._id}
                    className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl opacity-50">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{achievement.name}</h4>
                        <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {achievements.length === 0 && (
                  <div className="text-center py-8">
                    <Target size={48} className="mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">No achievements available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
