/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Trophy, Star, Flame, BookOpen, TrendingUp, Medal } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../config/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [type, setType] = useState('xp'); // xp, level, streak, courses
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/gamification/leaderboard?type=${type}&limit=50`);
      setLeaderboard(data.leaderboard);
      setUserPosition(data.userPosition);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = () => {
    const configs = {
      xp: { label: 'Total XP', icon: Star, color: 'text-yellow-400', field: 'totalXP' },
      level: { label: 'Level', icon: TrendingUp, color: 'text-purple-400', field: 'level' },
      streak: { label: 'Streak Days', icon: Flame, color: 'text-orange-400', field: 'currentStreak' },
      courses: { label: 'Courses Completed', icon: BookOpen, color: 'text-green-400', field: 'coursesCompleted' }
    };
    return configs[type] || configs.xp;
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-400', glow: 'shadow-yellow-500/50' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-300', glow: 'shadow-gray-400/50' };
    if (rank === 3) return { icon: '🥉', color: 'text-orange-400', glow: 'shadow-orange-500/50' };
    return { icon: rank, color: 'text-gray-400', glow: '' };
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Trophy size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-gray-400">Compete with learners worldwide!</p>
        </div>

        {/* Type Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setType('xp')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              type === 'xp'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Star size={20} />
            Total XP
          </button>
          <button
            onClick={() => setType('level')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              type === 'level'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <TrendingUp size={20} />
            Level
          </button>
          <button
            onClick={() => setType('streak')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              type === 'streak'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Flame size={20} />
            Streak
          </button>
          <button
            onClick={() => setType('courses')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              type === 'courses'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <BookOpen size={20} />
            Courses
          </button>
        </div>

        {/* User's Position Card (if logged in) */}
        {user && userPosition && (
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Your Position</p>
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Rank</p>
                <p className="text-3xl font-bold text-purple-400">#{userPosition.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">{config.label}</p>
                <div className="flex items-center gap-2 justify-end">
                  <Icon size={24} className={config.color} />
                  <p className="text-2xl font-bold">{userPosition[config.field]}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-700">
            <span className="text-gray-400 font-semibold w-16">Rank</span>
            <span className="text-gray-400 font-semibold flex-1">User</span>
            <span className="text-gray-400 font-semibold w-24 text-center">Level</span>
            <span className="text-gray-400 font-semibold w-32 text-right">{config.label}</span>
          </div>

          {/* Leaderboard Entries */}
          <div className="divide-y divide-gray-700">
            {leaderboard.map((entry, index) => {
              const medal = getRankMedal(entry.rank);
              const isCurrentUser = user && entry.user?._id === user._id;

              return (
                <div
                  key={entry._id}
                  className={`px-6 py-4 flex items-center justify-between transition-colors ${
                    isCurrentUser ? 'bg-purple-900/30' : 'hover:bg-gray-700/50'
                  } ${entry.rank <= 3 ? `${medal.glow} shadow-lg` : ''}`}
                >
                  {/* Rank */}
                  <div className="w-16 flex items-center">
                    {entry.rank <= 3 ? (
                      <span className="text-3xl">{medal.icon}</span>
                    ) : (
                      <span className={`text-xl font-bold ${medal.color}`}>#{entry.rank}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {entry.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {entry.user?.name || 'Unknown User'}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded-full">You</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">{entry.totalXP.toLocaleString()} XP</p>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="w-24 text-center">
                    <div className="inline-flex items-center gap-1 bg-purple-600/20 px-3 py-1 rounded-full">
                      <TrendingUp size={16} className="text-purple-400" />
                      <span className="font-bold text-purple-400">{entry.level}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="w-32 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Icon size={20} className={config.color} />
                      <span className="text-xl font-bold">{entry[config.field]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Medal size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">No leaderboard data yet</p>
            <p className="text-gray-500">Be the first to start earning XP!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
