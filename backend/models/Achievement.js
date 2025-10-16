const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  icon: {
    type: String,
    required: true,
    default: '🎯'
  },
  color: {
    type: String,
    default: '#10B981', // Green
    match: [/^#[0-9A-F]{6}$/i, 'Invalid color format']
  },
  category: {
    type: String,
    enum: ['learning', 'social', 'mastery', 'dedication', 'exploration'],
    required: true
  },
  // Achievement type
  type: {
    type: String,
    enum: ['milestone', 'challenge', 'hidden', 'special'],
    default: 'milestone'
  },
  // Requirements
  requirements: [{
    metric: {
      type: String,
      required: true,
      // Examples: coursesCompleted, perfectQuizStreak, etc.
    },
    operator: {
      type: String,
      enum: ['>=', '>', '==', '<=', '<'],
      default: '>='
    },
    value: {
      type: Number,
      required: true
    }
  }],
  // Rewards
  rewards: {
    xp: {
      type: Number,
      default: 0
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    title: String // Special title to display
  },
  // Progress tracking
  isProgressBased: {
    type: Boolean,
    default: true
  },
  maxProgress: {
    type: Number,
    default: 100
  },
  // Visibility
  isHidden: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Statistics
  unlockedCount: {
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
achievementSchema.index({ category: 1, order: 1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ isActive: 1, isHidden: 1 });

// Virtual: Completion rate
achievementSchema.virtual('completionRate').get(function() {
  if (this.unlockedCount === 0) return 0;
  // This would need total user count for accurate calculation
  return this.unlockedCount;
});

// Static method: Get all achievements grouped by category
achievementSchema.statics.getAchievementsByCategory = async function() {
  const achievements = await this.find({ 
    isActive: true,
    isHidden: false 
  })
    .populate('rewards.badge')
    .sort('order');
  
  const grouped = {
    learning: [],
    social: [],
    mastery: [],
    dedication: [],
    exploration: []
  };
  
  achievements.forEach(achievement => {
    if (grouped[achievement.category]) {
      grouped[achievement.category].push(achievement);
    }
  });
  
  return grouped;
};

// Static method: Check achievement completion
achievementSchema.statics.checkAchievementUnlocked = function(achievement, userProgress) {
  if (!achievement.requirements || achievement.requirements.length === 0) {
    return { unlocked: false, progress: 0 };
  }
  
  let totalRequirements = achievement.requirements.length;
  let metRequirements = 0;
  
  achievement.requirements.forEach(req => {
    const userValue = this.getUserMetricValue(userProgress, req.metric);
    const isMetreMet = this.compareValues(userValue, req.operator, req.value);
    
    if (isMetreMet) {
      metRequirements++;
    }
  });
  
  const progress = Math.round((metRequirements / totalRequirements) * 100);
  const unlocked = metRequirements === totalRequirements;
  
  return { unlocked, progress };
};

// Helper method: Get user metric value
achievementSchema.statics.getUserMetricValue = function(userProgress, metric) {
  // Handle nested properties
  if (metric.includes('.')) {
    const parts = metric.split('.');
    let value = userProgress;
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return 0;
    }
    return value;
  }
  
  return userProgress[metric] || 0;
};

// Helper method: Compare values based on operator
achievementSchema.statics.compareValues = function(userValue, operator, requiredValue) {
  switch (operator) {
    case '>=':
      return userValue >= requiredValue;
    case '>':
      return userValue > requiredValue;
    case '==':
      return userValue === requiredValue;
    case '<=':
      return userValue <= requiredValue;
    case '<':
      return userValue < requiredValue;
    default:
      return false;
  }
};

// Instance method: Calculate progress for user
achievementSchema.methods.calculateProgress = function(userProgress) {
  if (!this.isProgressBased || this.requirements.length === 0) {
    return 0;
  }
  
  const firstRequirement = this.requirements[0];
  const userValue = this.constructor.getUserMetricValue(userProgress, firstRequirement.metric);
  const progress = Math.min((userValue / firstRequirement.value) * 100, 100);
  
  return Math.round(progress);
};

// Instance method: Increment unlocked count
achievementSchema.methods.incrementUnlockedCount = async function() {
  this.unlockedCount += 1;
  await this.save();
};

module.exports = mongoose.model('Achievement', achievementSchema);
