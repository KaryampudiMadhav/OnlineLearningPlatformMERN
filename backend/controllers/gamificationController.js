const UserProgress = require('../models/UserProgress');
const Badge = require('../models/Badge');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

// @desc    Get or create user progress
// @route   GET /api/gamification/progress
// @access  Private
exports.getUserProgress = async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ user: req.user._id })
      .populate('badges')
      .populate('achievements.achievementId');
    
    if (!progress) {
      // Create initial progress
      progress = await UserProgress.create({
        user: req.user._id,
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: UserProgress.getXPForLevel(2)
      });
      
      progress = await progress.populate('badges');
    }
    
    // Update streak on each fetch (daily login tracking)
    await progress.updateStreak();
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user progress',
      error: error.message
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'xp', limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    let sortField = 'totalXP';
    if (type === 'level') sortField = 'level';
    if (type === 'streak') sortField = 'currentStreak';
    if (type === 'courses') sortField = 'coursesCompleted';
    
    const leaderboard = await UserProgress.find()
      .populate('user', 'name email')
      .sort({ [sortField]: -1, totalXP: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry.toObject(),
      rank: skip + index + 1
    }));
    
    // Get current user's position if authenticated
    let userPosition = null;
    if (req.user) {
      const userProgress = await UserProgress.findOne({ user: req.user._id });
      if (userProgress) {
        const rank = await UserProgress.countDocuments({
          [sortField]: { $gt: userProgress[sortField] }
        }) + 1;
        
        userPosition = {
          rank,
          ...userProgress.toObject()
        };
      }
    }
    
    const total = await UserProgress.countDocuments();
    
    res.json({
      success: true,
      leaderboard: rankedLeaderboard,
      userPosition,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

// @desc    Get all badges
// @route   GET /api/gamification/badges
// @access  Public
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort('order');
    
    // Get user's badges if authenticated
    let userBadges = [];
    if (req.user) {
      const progress = await UserProgress.findOne({ user: req.user._id });
      if (progress) {
        userBadges = progress.badges.map(b => b.toString());
      }
    }
    
    // Mark which badges user has earned
    const badgesWithStatus = badges.map(badge => ({
      ...badge.toObject(),
      earned: userBadges.includes(badge._id.toString())
    }));
    
    res.json({
      success: true,
      badges: badgesWithStatus
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: error.message
    });
  }
};

// @desc    Get all achievements
// @route   GET /api/gamification/achievements
// @access  Public
exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ 
      isActive: true,
      isHidden: false 
    })
      .populate('rewards.badge')
      .sort('order');
    
    // Get user's achievements if authenticated
    let userAchievements = [];
    if (req.user) {
      const progress = await UserProgress.findOne({ user: req.user._id });
      if (progress) {
        userAchievements = progress.achievements;
      }
    }
    
    // Add progress and unlocked status
    const achievementsWithProgress = achievements.map(achievement => {
      const userAch = userAchievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
      );
      
      return {
        ...achievement.toObject(),
        unlocked: !!userAch,
        progress: userAch ? userAch.progress : 0,
        unlockedAt: userAch ? userAch.unlockedAt : null
      };
    });
    
    res.json({
      success: true,
      achievements: achievementsWithProgress
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    });
  }
};

// @desc    Award XP to user (internal use or admin)
// @route   POST /api/gamification/award-xp
// @access  Private
exports.awardXP = async (req, res) => {
  try {
    const { xp, source = 'manual', userId } = req.body;
    
    const targetUserId = userId || req.user._id;
    
    let progress = await UserProgress.findOne({ user: targetUserId });
    if (!progress) {
      progress = await UserProgress.create({
        user: targetUserId,
        totalXP: 0,
        level: 1,
        nextLevelXP: UserProgress.getXPForLevel(2)
      });
    }
    
    const oldLevel = progress.level;
    await progress.addXP(parseInt(xp), source);
    const newLevel = progress.level;
    
    const leveledUp = newLevel > oldLevel;
    
    res.json({
      success: true,
      message: `Awarded ${xp} XP`,
      progress,
      leveledUp,
      newLevel: leveledUp ? newLevel : null
    });
  } catch (error) {
    console.error('Award XP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error awarding XP',
      error: error.message
    });
  }
};

// @desc    Check and award badges (called internally)
// @route   POST /api/gamification/check-badges
// @access  Private
exports.checkAndAwardBadges = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ user: req.user._id });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }
    
    const allBadges = await Badge.find({ isActive: true });
    const newBadges = [];
    
    for (const badge of allBadges) {
      // Check if user already has this badge
      if (progress.badges.includes(badge._id)) {
        continue;
      }
      
      // Check if user earned this badge
      const earned = await Badge.checkBadgeEarned(progress, badge._id);
      
      if (earned) {
        await progress.awardBadge(badge._id);
        await badge.incrementEarnedCount();
        
        // Award XP for earning badge
        if (badge.xpReward > 0) {
          await progress.addXP(badge.xpReward, 'achievements');
        }
        
        newBadges.push(badge);
      }
    }
    
    if (newBadges.length > 0) {
      await progress.populate('badges');
    }
    
    res.json({
      success: true,
      newBadges,
      message: newBadges.length > 0 
        ? `Congratulations! You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`
        : 'No new badges earned'
    });
  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking badges',
      error: error.message
    });
  }
};

// @desc    Check and update achievements
// @route   POST /api/gamification/check-achievements
// @access  Private
exports.checkAndUpdateAchievements = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ user: req.user._id });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }
    
    const allAchievements = await Achievement.find({ isActive: true })
      .populate('rewards.badge');
    
    const newAchievements = [];
    
    for (const achievement of allAchievements) {
      // Check if already unlocked
      const userAch = progress.achievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
      );
      
      if (userAch && userAch.progress === 100) {
        continue; // Already completed
      }
      
      // Check completion status
      const { unlocked, progress: achProgress } = Achievement.checkAchievementUnlocked(
        achievement,
        progress
      );
      
      if (unlocked && (!userAch || userAch.progress < 100)) {
        // Award achievement
        await progress.updateAchievementProgress(achievement._id, 100);
        await achievement.incrementUnlockedCount();
        
        // Award rewards
        if (achievement.rewards.xp > 0) {
          await progress.addXP(achievement.rewards.xp, 'achievements');
        }
        
        if (achievement.rewards.badge) {
          await progress.awardBadge(achievement.rewards.badge._id);
        }
        
        newAchievements.push(achievement);
      } else if (!unlocked && achProgress > 0) {
        // Update progress
        await progress.updateAchievementProgress(achievement._id, achProgress);
      }
    }
    
    res.json({
      success: true,
      newAchievements,
      message: newAchievements.length > 0
        ? `Congratulations! You unlocked ${newAchievements.length} achievement${newAchievements.length > 1 ? 's' : ''}!`
        : 'Keep going! Check your achievement progress.'
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking achievements',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/gamification/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ user: req.user._id })
      .populate('badges')
      .populate('achievements.achievementId');
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }
    
    // Calculate additional stats
    const totalUsers = await UserProgress.countDocuments();
    const userRank = await UserProgress.countDocuments({
      totalXP: { $gt: progress.totalXP }
    }) + 1;
    
    const rankPercentile = totalUsers > 0 
      ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100)
      : 0;
    
    const stats = {
      level: progress.level,
      totalXP: progress.totalXP,
      currentLevelXP: progress.currentLevelXP,
      nextLevelXP: progress.nextLevelXP,
      levelProgress: progress.levelProgress,
      rank: userRank,
      rankPercentile,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      badges: progress.badges.length,
      achievements: progress.achievements.filter(a => a.progress === 100).length,
      coursesCompleted: progress.coursesCompleted,
      quizzesCompleted: progress.quizzesCompleted,
      quizzesPassed: progress.quizzesPassed,
      reviewsWritten: progress.reviewsWritten,
      certificatesEarned: progress.certificatesEarned,
      pointsBreakdown: progress.pointsBreakdown
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
};

// @desc    Create default badges (seed data - admin only)
// @route   POST /api/gamification/admin/seed-badges
// @access  Private (Admin)
exports.seedBadges = async (req, res) => {
  try {
    const defaultBadges = [
      // Course badges
      { name: 'First Steps', description: 'Complete your first course', icon: '🎓', color: '#3B82F6', category: 'course', rarity: 'common', requirements: { type: 'coursesCompleted', value: 1 }, xpReward: 50, order: 1 },
      { name: 'Knowledge Seeker', description: 'Complete 5 courses', icon: '📚', color: '#8B5CF6', category: 'course', rarity: 'rare', requirements: { type: 'coursesCompleted', value: 5 }, xpReward: 150, order: 2 },
      { name: 'Learning Master', description: 'Complete 10 courses', icon: '🏆', color: '#F59E0B', category: 'course', rarity: 'epic', requirements: { type: 'coursesCompleted', value: 10 }, xpReward: 300, order: 3 },
      
      // Quiz badges
      { name: 'Quiz Novice', description: 'Complete your first quiz', icon: '📝', color: '#10B981', category: 'quiz', rarity: 'common', requirements: { type: 'quizzesCompleted', value: 1 }, xpReward: 25, order: 4 },
      { name: 'Quiz Expert', description: 'Pass 10 quizzes', icon: '✅', color: '#8B5CF6', category: 'quiz', rarity: 'rare', requirements: { type: 'quizzesPassed', value: 10 }, xpReward: 100, order: 5 },
      { name: 'Perfect Score', description: 'Get 100% on any quiz', icon: '💯', color: '#F59E0B', category: 'quiz', rarity: 'epic', requirements: { type: 'perfectQuiz', value: 1 }, xpReward: 200, order: 6 },
      
      // Review badges
      { name: 'Reviewer', description: 'Write your first review', icon: '⭐', color: '#F59E0B', category: 'review', rarity: 'common', requirements: { type: 'reviewsWritten', value: 1 }, xpReward: 30, order: 7 },
      { name: 'Critic', description: 'Write 5 reviews', icon: '📢', color: '#8B5CF6', category: 'review', rarity: 'rare', requirements: { type: 'reviewsWritten', value: 5 }, xpReward: 100, order: 8 },
      
      // Streak badges
      { name: 'Consistent Learner', description: '7-day login streak', icon: '🔥', color: '#EF4444', category: 'streak', rarity: 'rare', requirements: { type: 'streak', value: 7 }, xpReward: 100, order: 9 },
      { name: 'Dedication', description: '30-day login streak', icon: '💪', color: '#F59E0B', category: 'streak', rarity: 'epic', requirements: { type: 'streak', value: 30 }, xpReward: 500, order: 10 },
      { name: 'Unstoppable', description: '100-day login streak', icon: '⚡', color: '#8B5CF6', category: 'streak', rarity: 'legendary', requirements: { type: 'streak', value: 100 }, xpReward: 1000, order: 11 },
      
      // Achievement badges
      { name: 'Level 5', description: 'Reach level 5', icon: '🌟', color: '#3B82F6', category: 'achievement', rarity: 'rare', requirements: { type: 'level', value: 5 }, xpReward: 0, order: 12 },
      { name: 'Level 10', description: 'Reach level 10', icon: '💫', color: '#8B5CF6', category: 'achievement', rarity: 'epic', requirements: { type: 'level', value: 10 }, xpReward: 0, order: 13 },
      { name: 'XP Collector', description: 'Earn 1000 total XP', icon: '💰', color: '#F59E0B', category: 'achievement', rarity: 'epic', requirements: { type: 'totalXP', value: 1000 }, xpReward: 0, order: 14 },
      
      // Special badges
      { name: 'Early Adopter', description: 'Join in the first month', icon: '🚀', color: '#8B5CF6', category: 'special', rarity: 'legendary', requirements: { type: 'coursesCompleted', value: 0 }, xpReward: 0, order: 15 }
    ];
    
    // Clear existing badges
    await Badge.deleteMany({});
    
    // Insert new badges
    const badges = await Badge.insertMany(defaultBadges);
    
    res.json({
      success: true,
      message: `Created ${badges.length} badges`,
      badges
    });
  } catch (error) {
    console.error('Seed badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding badges',
      error: error.message
    });
  }
};

module.exports = exports;
