const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    required: true,
    default: '🏆' // Emoji or icon name
  },
  color: {
    type: String,
    default: '#8B5CF6', // Purple
    match: [/^#[0-9A-F]{6}$/i, 'Invalid color format']
  },
  category: {
    type: String,
    enum: ['course', 'quiz', 'review', 'streak', 'achievement', 'special'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  // Requirements to earn badge
  requirements: {
    type: {
      type: String,
      enum: [
        'coursesCompleted',
        'quizzesCompleted',
        'quizzesPassed',
        'reviewsWritten',
        'certificatesEarned',
        'streak',
        'level',
        'totalXP',
        'helpfulVotes',
        'perfectQuiz'
      ]
    },
    value: {
      type: Number,
      required: true
    }
  },
  xpReward: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // How many users earned this badge
  earnedCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
badgeSchema.index({ category: 1, order: 1 });
badgeSchema.index({ rarity: 1 });

// Virtual: Rarity level (for sorting)
badgeSchema.virtual('rarityLevel').get(function() {
  const levels = { common: 1, rare: 2, epic: 3, legendary: 4 };
  return levels[this.rarity] || 1;
});

// Static method: Get all badges grouped by category
badgeSchema.statics.getBadgesByCategory = async function() {
  const badges = await this.find({ isActive: true }).sort('order');
  
  const grouped = {
    course: [],
    quiz: [],
    review: [],
    streak: [],
    achievement: [],
    special: []
  };
  
  badges.forEach(badge => {
    if (grouped[badge.category]) {
      grouped[badge.category].push(badge);
    }
  });
  
  return grouped;
};

// Static method: Check if user earned badge
badgeSchema.statics.checkBadgeEarned = async function(userProgress, badgeId) {
  const badge = await this.findById(badgeId);
  if (!badge) return false;
  
  const { type, value } = badge.requirements;
  
  switch (type) {
    case 'coursesCompleted':
      return userProgress.coursesCompleted >= value;
    case 'quizzesCompleted':
      return userProgress.quizzesCompleted >= value;
    case 'quizzesPassed':
      return userProgress.quizzesPassed >= value;
    case 'reviewsWritten':
      return userProgress.reviewsWritten >= value;
    case 'certificatesEarned':
      return userProgress.certificatesEarned >= value;
    case 'streak':
      return userProgress.currentStreak >= value || userProgress.longestStreak >= value;
    case 'level':
      return userProgress.level >= value;
    case 'totalXP':
      return userProgress.totalXP >= value;
    case 'helpfulVotes':
      return userProgress.stats.totalHelpfulVotes >= value;
    default:
      return false;
  }
};

// Instance method: Increment earned count
badgeSchema.methods.incrementEarnedCount = async function() {
  this.earnedCount += 1;
  await this.save();
};

module.exports = mongoose.model('Badge', badgeSchema);
