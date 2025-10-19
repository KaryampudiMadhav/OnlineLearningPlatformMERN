const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Not required for embedded quizzes
  },
  questionIndex: {
    type: Number,
    required: false // For embedded quizzes, use index instead of ID
  },
  selectedOptions: [{
    type: Number // Index of selected option(s)
  }],
  userAnswer: {
    type: Number // For embedded quizzes - selected option index
  },
  correctAnswer: {
    type: Number // For embedded quizzes - correct option index
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  explanation: String // Store explanation for review
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: false // Not required for embedded quizzes
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
  
  // Fields for embedded quizzes
  moduleIndex: {
    type: Number,
    required: false // For embedded quizzes
  },
  moduleName: String,
  quizTitle: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maxScore: {
    type: Number,
    default: 100
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    required: false // Calculated automatically
  },
  totalQuestions: {
    type: Number,
    required: false
  },
  correctAnswers: {
    type: Number,
    default: 0
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
  submittedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number // in seconds
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for faster lookups
quizAttemptSchema.index({ quiz: 1, student: 1 });
quizAttemptSchema.index({ student: 1, course: 1 });
quizAttemptSchema.index({ student: 1, course: 1, moduleIndex: 1 });

// Calculate score before saving for traditional quizzes
quizAttemptSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.totalPoints > 0) {
    this.score = Math.round((this.pointsEarned / this.totalPoints) * 100);
  }
  next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
