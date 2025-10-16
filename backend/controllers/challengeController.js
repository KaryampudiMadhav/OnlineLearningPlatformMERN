const DailyChallenge = require('../models/DailyChallenge');
const UserProgress = require('../models/UserProgress');

// @desc    Get today's challenges
// @route   GET /api/challenges/today
// @access  Public
exports.getTodaysChallenges = async (req, res) => {
  try {
    const challenges = await DailyChallenge.getTodaysChallenges();
    
    // If user is authenticated, include their progress
    let userChallenges = challenges;
    if (req.user) {
      userChallenges = challenges.map(challenge => {
        const completion = challenge.completedBy.find(
          c => c.user.toString() === req.user._id.toString()
        );
        
        return {
          ...challenge.toObject(),
          userProgress: completion ? completion.progress : 0,
          isCompleted: completion && completion.progress >= challenge.targetValue,
        };
      });
    }
    
    res.json({
      success: true,
      challenges: userChallenges,
      totalChallenges: challenges.length,
    });
  } catch (error) {
    console.error('Get today challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s challenges',
      error: error.message,
    });
  }
};

// @desc    Complete a challenge
// @route   POST /api/challenges/:id/complete
// @access  Private
exports.completeChallenge = async (req, res) => {
  try {
    const challenge = await DailyChallenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }
    
    // Check if already completed
    if (challenge.isCompletedBy(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Challenge already completed',
      });
    }
    
    // Mark as completed
    const completed = await challenge.markCompleted(req.user._id);
    
    if (!completed) {
      return res.status(400).json({
        success: false,
        message: 'Failed to complete challenge',
      });
    }
    
    // Award XP
    const userProgress = await UserProgress.findOne({ user: req.user._id });
    if (userProgress) {
      await userProgress.addXP(challenge.xpReward, `Completed daily challenge: ${challenge.title}`);
    }
    
    res.json({
      success: true,
      message: 'Challenge completed!',
      xpEarned: challenge.xpReward,
      challenge,
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing challenge',
      error: error.message,
    });
  }
};

// @desc    Update challenge progress
// @route   PUT /api/challenges/:id/progress
// @access  Private
exports.updateChallengeProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const challenge = await DailyChallenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }
    
    const completed = await challenge.updateProgress(req.user._id, progress);
    
    // If just completed, award XP
    if (completed) {
      const userProgress = await UserProgress.findOne({ user: req.user._id });
      if (userProgress) {
        await userProgress.addXP(challenge.xpReward, `Completed daily challenge: ${challenge.title}`);
      }
    }
    
    res.json({
      success: true,
      message: completed ? 'Challenge completed!' : 'Progress updated',
      xpEarned: completed ? challenge.xpReward : 0,
      progress,
      challenge,
    });
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating challenge progress',
      error: error.message,
    });
  }
};

// @desc    Get user's challenge history
// @route   GET /api/challenges/my-history
// @access  Private
exports.getUserChallengeHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const challenges = await DailyChallenge.find({
      'completedBy.user': req.user._id,
    })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await DailyChallenge.countDocuments({
      'completedBy.user': req.user._id,
    });
    
    // Calculate stats
    const totalXPEarned = challenges.reduce((sum, challenge) => {
      const completion = challenge.completedBy.find(
        c => c.user.toString() === req.user._id.toString()
      );
      return sum + (completion && completion.progress >= challenge.targetValue ? challenge.xpReward : 0);
    }, 0);
    
    res.json({
      success: true,
      challenges,
      stats: {
        totalCompleted: total,
        totalXPEarned,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user challenge history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching challenge history',
      error: error.message,
    });
  }
};

// @desc    Create daily challenge (Admin only)
// @route   POST /api/challenges
// @access  Private/Admin
exports.createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      targetValue,
      xpReward,
      bonusReward,
      difficulty,
      date,
    } = req.body;
    
    const challenge = await DailyChallenge.create({
      title,
      description,
      type,
      targetValue,
      xpReward,
      bonusReward,
      difficulty,
      date: date || new Date(),
    });
    
    res.status(201).json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating challenge',
      error: error.message,
    });
  }
};

// @desc    Seed daily challenges for the next 7 days
// @route   POST /api/challenges/seed
// @access  Private/Admin
exports.seedChallenges = async (req, res) => {
  try {
    const challenges = [];
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const challengeTemplates = [
      {
        title: 'Quiz Master',
        description: 'Complete 3 quizzes with a score of 80% or higher',
        type: 'quiz',
        targetValue: 3,
        xpReward: 150,
        difficulty: 'medium',
      },
      {
        title: 'Knowledge Seeker',
        description: 'Study for at least 60 minutes today',
        type: 'study_time',
        targetValue: 60,
        xpReward: 100,
        difficulty: 'easy',
      },
      {
        title: 'Perfect Score',
        description: 'Get 100% on any quiz',
        type: 'quiz',
        targetValue: 1,
        xpReward: 200,
        difficulty: 'hard',
      },
      {
        title: 'Consistency King',
        description: 'Maintain your learning streak',
        type: 'streak',
        targetValue: 1,
        xpReward: 50,
        difficulty: 'easy',
      },
      {
        title: 'Review Guru',
        description: 'Leave 2 helpful course reviews',
        type: 'review',
        targetValue: 2,
        xpReward: 120,
        difficulty: 'medium',
      },
      {
        title: 'Course Completion',
        description: 'Complete one full course today',
        type: 'course_completion',
        targetValue: 1,
        xpReward: 250,
        difficulty: 'hard',
      },
      {
        title: 'Community Helper',
        description: 'Participate in 5 discussion threads',
        type: 'discussion',
        targetValue: 5,
        xpReward: 100,
        difficulty: 'medium',
      },
    ];
    
    // Create challenges for next 7 days
    for (let day = 0; day < 7; day++) {
      const challengeDate = new Date(startDate);
      challengeDate.setDate(challengeDate.getDate() + day);
      
      // Select 3 random challenges for each day
      const dailyChallenges = [];
      const selectedIndices = new Set();
      
      while (dailyChallenges.length < 3) {
        const randomIndex = Math.floor(Math.random() * challengeTemplates.length);
        if (!selectedIndices.has(randomIndex)) {
          selectedIndices.add(randomIndex);
          dailyChallenges.push({
            ...challengeTemplates[randomIndex],
            date: challengeDate,
          });
        }
      }
      
      challenges.push(...dailyChallenges);
    }
    
    await DailyChallenge.insertMany(challenges);
    
    res.json({
      success: true,
      message: `Created ${challenges.length} challenges for the next 7 days`,
      challenges,
    });
  } catch (error) {
    console.error('Seed challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding challenges',
      error: error.message,
    });
  }
};

module.exports = exports;
