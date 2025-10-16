const mongoose = require('mongoose');

const DailyChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['quiz', 'study_time', 'course_completion', 'streak', 'review', 'discussion'],
    required: true,
  },
  targetValue: {
    type: Number,
    required: true,
  },
  xpReward: {
    type: Number,
    default: 100,
  },
  bonusReward: {
    type: String, // e.g., "2x XP for next quiz", "Extra hint token"
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
    },
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
DailyChallengeSchema.index({ date: 1, isActive: 1 });
DailyChallengeSchema.index({ 'completedBy.user': 1 });

// Get today's active challenges
DailyChallengeSchema.statics.getTodaysChallenges = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    date: { $gte: today, $lt: tomorrow },
    isActive: true,
  });
};

// Check if user completed challenge
DailyChallengeSchema.methods.isCompletedBy = function(userId) {
  return this.completedBy.some(
    completion => completion.user.toString() === userId.toString()
  );
};

// Mark challenge as completed
DailyChallengeSchema.methods.markCompleted = async function(userId, progress = 100) {
  if (this.isCompletedBy(userId)) {
    return false;
  }
  
  this.completedBy.push({
    user: userId,
    progress,
    completedAt: new Date(),
  });
  
  await this.save();
  return true;
};

// Update user progress for challenge
DailyChallengeSchema.methods.updateProgress = async function(userId, progress) {
  const completion = this.completedBy.find(
    c => c.user.toString() === userId.toString()
  );
  
  if (completion) {
    completion.progress = progress;
  } else {
    this.completedBy.push({
      user: userId,
      progress,
      completedAt: progress >= this.targetValue ? new Date() : null,
    });
  }
  
  await this.save();
  return progress >= this.targetValue;
};

module.exports = mongoose.model('DailyChallenge', DailyChallengeSchema);
