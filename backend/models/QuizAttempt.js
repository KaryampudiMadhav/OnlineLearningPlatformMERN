const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOptions: [{
    type: Number // Index of selected option(s)
  }],
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number // in seconds
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  }
}, {
  timestamps: true
});

// Index for faster lookups
quizAttemptSchema.index({ quiz: 1, student: 1 });
quizAttemptSchema.index({ student: 1, course: 1 });

// Calculate score before saving
quizAttemptSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.totalPoints > 0) {
    this.score = Math.round((this.pointsEarned / this.totalPoints) * 100);
  }
  next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
