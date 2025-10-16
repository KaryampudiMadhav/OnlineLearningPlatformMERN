const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'multiple-select'],
    default: 'multiple-choice'
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: 1
  }
});

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // Module/Section reference (index in curriculum array)
  moduleIndex: {
    type: Number,
    min: 0
  },
  moduleTitle: {
    type: String,
    trim: true
  },
  // Lesson reference (index in lessons array within the module)
  lessonIndex: {
    type: Number,
    min: 0
  },
  lessonTitle: {
    type: String,
    trim: true
  },
  // Quiz placement type
  quizType: {
    type: String,
    enum: ['course', 'module', 'lesson'],
    default: 'course'
  },
  // Legacy fields for backward compatibility
  section: {
    type: String,
    trim: true
  },
  lesson: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  duration: {
    type: Number, // in minutes
    default: 30
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  shuffleOptions: {
    type: Boolean,
    default: false
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showExplanations: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

// Virtual for number of questions
quizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Index for faster lookups
quizSchema.index({ course: 1 });
quizSchema.index({ createdBy: 1 });

// Ensure virtuals are included in JSON
quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);
