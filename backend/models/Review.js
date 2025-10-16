const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Review must belong to a course'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have an author'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  // Helpful votes system
  helpfulVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  // Instructor response
  instructorResponse: {
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved' // Auto-approve by default
  },
  // Flag system for moderation
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'offensive', 'fake', 'other'],
      required: true
    },
    comment: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  flagCount: {
    type: Number,
    default: 0
  },
  // Verification
  isVerifiedPurchase: {
    type: Boolean,
    default: false // Set true if user has enrolled
  },
  // Metadata
  editedAt: Date,
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reviewSchema.index({ course: 1, user: 1 }, { unique: true }); // One review per user per course
reviewSchema.index({ course: 1, status: 1, rating: -1 }); // Filter by status and sort by rating
reviewSchema.index({ course: 1, helpfulCount: -1 }); // Sort by helpful votes
reviewSchema.index({ status: 1, flagCount: -1 }); // Moderation queries

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.helpfulCount === 0) return 0;
  // Assuming total votes = helpfulCount (simplified)
  return 100;
});

// Pre-save middleware to update helpful count
reviewSchema.pre('save', function(next) {
  if (this.isModified('helpfulVotes')) {
    this.helpfulCount = this.helpfulVotes.length;
  }
  next();
});

// Static method to calculate course rating statistics
reviewSchema.statics.calculateCourseRating = async function(courseId) {
  const stats = await this.aggregate([
    {
      $match: {
        course: mongoose.Types.ObjectId(courseId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$course',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
      }
    }
  ]);

  if (stats.length > 0) {
    const { avgRating, totalReviews } = stats[0];
    
    // Update course with new rating
    await mongoose.model('Course').findByIdAndUpdate(courseId, {
      averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      reviewCount: totalReviews
    });

    return stats[0];
  }

  // If no reviews, reset course rating
  await mongoose.model('Course').findByIdAndUpdate(courseId, {
    averageRating: 0,
    reviewCount: 0
  });

  return null;
};

// Instance method to check if user found review helpful
reviewSchema.methods.isHelpfulTo = function(userId) {
  return this.helpfulVotes.some(vote => vote.toString() === userId.toString());
};

// Instance method to toggle helpful vote
reviewSchema.methods.toggleHelpful = async function(userId) {
  const index = this.helpfulVotes.findIndex(
    vote => vote.toString() === userId.toString()
  );

  if (index > -1) {
    // Remove vote
    this.helpfulVotes.splice(index, 1);
    return false; // Not helpful anymore
  } else {
    // Add vote
    this.helpfulVotes.push(userId);
    return true; // Marked as helpful
  }
};

// Instance method to add instructor response
reviewSchema.methods.addResponse = function(instructorId, responseComment) {
  this.instructorResponse = {
    comment: responseComment,
    respondedAt: new Date(),
    respondedBy: instructorId
  };
};

// Instance method to flag review
reviewSchema.methods.addFlag = function(userId, reason, comment) {
  this.flags.push({
    user: userId,
    reason,
    comment,
    flaggedAt: new Date()
  });
  this.flagCount = this.flags.length;
  
  // Auto-flag if multiple reports
  if (this.flagCount >= 3 && this.status !== 'flagged') {
    this.status = 'flagged';
  }
};

module.exports = mongoose.model('Review', reviewSchema);
