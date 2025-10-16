const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // XP and Level System
  totalXP: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  currentLevelXP: {
    type: Number,
    default: 0
  },
  nextLevelXP: {
    type: Number,
    default: 100
  },
  // Streaks
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLoginDate: {
    type: Date
  },
  // Activity Tracking
  coursesCompleted: {
    type: Number,
    default: 0
  },
  quizzesCompleted: {
    type: Number,
    default: 0
  },
  quizzesPassed: {
    type: Number,
    default: 0
  },
  reviewsWritten: {
    type: Number,
    default: 0
  },
  certificatesEarned: {
    type: Number,
    default: 0
  },
  lessonsCompleted: {
    type: Number,
    default: 0
  },
  // Badges Earned
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  // Points breakdown
  pointsBreakdown: {
    courseCompletion: { type: Number, default: 0 },
    quizCompletion: { type: Number, default: 0 },
    reviewWriting: { type: Number, default: 0 },
    dailyLogin: { type: Number, default: 0 },
    achievements: { type: Number, default: 0 }
  },
  // Achievements unlocked
  achievements: [{
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  // Leaderboard rank (cached)
  rank: {
    type: Number,
    default: null
  },
  // Statistics
  stats: {
    totalStudyTime: { type: Number, default: 0 }, // in minutes
    averageQuizScore: { type: Number, default: 0 },
    totalHelpfulVotes: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userProgressSchema.index({ totalXP: -1 }); // For leaderboard
userProgressSchema.index({ level: -1 });
userProgressSchema.index({ currentStreak: -1 });

// Virtual: Progress to next level (percentage)
userProgressSchema.virtual('levelProgress').get(function() {
  if (this.nextLevelXP === 0) return 100;
  return Math.round((this.currentLevelXP / this.nextLevelXP) * 100);
});

// Virtual: Badge count
userProgressSchema.virtual('badgeCount').get(function() {
  return this.badges.length;
});

// Static method: Calculate XP required for level
userProgressSchema.statics.getXPForLevel = function(level) {
  // Formula: XP = 100 * level * 1.5
  // Level 1: 100 XP
  // Level 2: 300 XP
  // Level 3: 450 XP
  // Level 4: 600 XP
  // etc.
  return Math.floor(100 * level * 1.5);
};

// Static method: Calculate level from total XP
userProgressSchema.statics.getLevelFromXP = function(totalXP) {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXP) {
    level++;
    xpNeeded += this.getXPForLevel(level);
  }
  
  return level - 1;
};

// Instance method: Add XP
userProgressSchema.methods.addXP = async function(xp, source = 'general') {
  this.totalXP += xp;
  this.currentLevelXP += xp;
  
  // Add to breakdown
  if (this.pointsBreakdown[source] !== undefined) {
    this.pointsBreakdown[source] += xp;
  }
  
  // Check for level up
  while (this.currentLevelXP >= this.nextLevelXP) {
    this.currentLevelXP -= this.nextLevelXP;
    this.level += 1;
    this.nextLevelXP = this.constructor.getXPForLevel(this.level + 1);
    
    // Award level up bonus
    console.log(`User leveled up to level ${this.level}!`);
  }
  
  await this.save();
  return this;
};

// Instance method: Update streak
userProgressSchema.methods.updateStreak = async function() {
  const now = new Date();
  const lastLogin = this.lastLoginDate;
  
  if (!lastLogin) {
    // First login
    this.currentStreak = 1;
    this.longestStreak = 1;
    this.lastLoginDate = now;
    await this.addXP(10, 'dailyLogin');
  } else {
    const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day, no change
      return this;
    } else if (daysDiff === 1) {
      // Consecutive day
      this.currentStreak += 1;
      this.lastLoginDate = now;
      
      // Update longest streak
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
      
      // Award streak bonus XP
      const streakBonus = Math.min(this.currentStreak * 2, 50); // Max 50 XP
      await this.addXP(10 + streakBonus, 'dailyLogin');
    } else {
      // Streak broken
      this.currentStreak = 1;
      this.lastLoginDate = now;
      await this.addXP(10, 'dailyLogin');
    }
  }
  
  await this.save();
  return this;
};

// Instance method: Award badge
userProgressSchema.methods.awardBadge = async function(badgeId) {
  if (!this.badges.includes(badgeId)) {
    this.badges.push(badgeId);
    await this.save();
    return true;
  }
  return false;
};

// Instance method: Check and update achievement progress
userProgressSchema.methods.updateAchievementProgress = async function(achievementId, progress) {
  const existingAchievement = this.achievements.find(
    a => a.achievementId.toString() === achievementId.toString()
  );
  
  if (existingAchievement) {
    existingAchievement.progress = progress;
  } else {
    this.achievements.push({
      achievementId,
      progress,
      unlockedAt: new Date()
    });
  }
  
  await this.save();
  return this;
};

// Instance method: Increment activity counter
userProgressSchema.methods.incrementActivity = async function(activity, xpReward = 0) {
  if (this[activity] !== undefined) {
    this[activity] += 1;
  }
  
  if (xpReward > 0) {
    await this.addXP(xpReward, activity);
  } else {
    await this.save();
  }
  
  return this;
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
