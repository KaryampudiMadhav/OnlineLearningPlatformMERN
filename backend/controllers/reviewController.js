const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const mongoose = require('mongoose');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Student must be enrolled)
exports.createReview = async (req, res) => {
  try {
    const { courseId, rating, title, comment } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to leave a review'
      });
    }

    // Check if user has already reviewed this course
    const existingReview = await Review.findOne({
      course: courseId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course. You can edit your existing review.'
      });
    }

    // Create review
    const review = await Review.create({
      course: courseId,
      user: req.user._id,
      rating,
      title,
      comment,
      isVerifiedPurchase: true,
      status: 'approved'
    });

    // Populate user info
    await review.populate('user', 'name email');

    // Recalculate course rating
    await Review.calculateCourseRating(courseId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Get all reviews for a course
// @route   GET /api/reviews/course/:courseId
// @access  Public
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { 
      sort = '-helpfulCount', // Default sort by helpful votes
      rating,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {
      course: courseId,
      status: 'approved'
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    // Get reviews with pagination
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('instructorResponse.respondedBy', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await Review.countDocuments(query);

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      {
        $match: {
          course: mongoose.Types.ObjectId(courseId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    // Format rating distribution
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    ratingStats.forEach(stat => {
      distribution[stat._id] = stat.count;
    });

    // Calculate average rating
    const avgRating = await Review.aggregate([
      {
        $match: {
          course: mongoose.Types.ObjectId(courseId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = avgRating.length > 0 ? {
      averageRating: Math.round(avgRating[0].avgRating * 10) / 10,
      totalReviews: avgRating[0].totalReviews,
      distribution
    } : {
      averageRating: 0,
      totalReviews: 0,
      distribution
    };

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      stats
    });
  } catch (error) {
    console.error('Get course reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get user's review for a course
// @route   GET /api/reviews/my-review/:courseId
// @access  Private
exports.getMyReview = async (req, res) => {
  try {
    const { courseId } = req.params;

    const review = await Review.findOne({
      course: courseId,
      user: req.user._id
    })
      .populate('user', 'name email')
      .populate('instructorResponse.respondedBy', 'name');

    if (!review) {
      return res.json({
        success: true,
        review: null,
        message: 'No review found'
      });
    }

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get my review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review author only)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the review author
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    
    review.editedAt = new Date();
    review.isEdited = true;

    await review.save();

    // Recalculate course rating
    await Review.calculateCourseRating(review.course);

    await review.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review author or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the review author or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const courseId = review.course;
    await review.deleteOne();

    // Recalculate course rating
    await Review.calculateCourseRating(courseId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// @desc    Toggle helpful vote on a review
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.toggleHelpfulVote = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // User cannot vote on their own review
    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own review'
      });
    }

    // Toggle helpful vote
    const isHelpful = await review.toggleHelpful(req.user._id);
    await review.save();

    res.json({
      success: true,
      message: isHelpful ? 'Marked as helpful' : 'Removed helpful vote',
      isHelpful,
      helpfulCount: review.helpfulCount
    });
  } catch (error) {
    console.error('Toggle helpful vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating helpful vote',
      error: error.message
    });
  }
};

// @desc    Add instructor response to a review
// @route   POST /api/reviews/:id/respond
// @access  Private (Instructor/Admin only)
exports.addInstructorResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response comment is required'
      });
    }

    const review = await Review.findById(id).populate('course', 'instructor');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the course instructor or admin
    const isInstructor = review.course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor or admin can respond to reviews'
      });
    }

    // Add response
    review.addResponse(req.user._id, comment);
    await review.save();

    await review.populate([
      { path: 'user', select: 'name email' },
      { path: 'instructorResponse.respondedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    console.error('Add instructor response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response',
      error: error.message
    });
  }
};

// @desc    Flag a review for moderation
// @route   POST /api/reviews/:id/flag
// @access  Private
exports.flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comment } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Flag reason is required'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already flagged this review
    const alreadyFlagged = review.flags.some(
      flag => flag.user.toString() === req.user._id.toString()
    );

    if (alreadyFlagged) {
      return res.status(400).json({
        success: false,
        message: 'You have already flagged this review'
      });
    }

    // Add flag
    review.addFlag(req.user._id, reason, comment);
    await review.save();

    res.json({
      success: true,
      message: 'Review flagged successfully. Our team will review it.',
      flagCount: review.flagCount
    });
  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error flagging review',
      error: error.message
    });
  }
};

// @desc    Get flagged reviews (Admin only)
// @route   GET /api/reviews/admin/flagged
// @access  Private (Admin only)
exports.getFlaggedReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      $or: [
        { status: 'flagged' },
        { flagCount: { $gte: 1 } }
      ]
    })
      .populate('user', 'name email')
      .populate('course', 'title')
      .populate('flags.user', 'name email')
      .sort('-flagCount -createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({
      $or: [
        { status: 'flagged' },
        { flagCount: { $gte: 1 } }
      ]
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get flagged reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flagged reviews',
      error: error.message
    });
  }
};

// @desc    Moderate review (Approve/Reject)
// @route   PUT /api/reviews/admin/:id/moderate
// @access  Private (Admin only)
exports.moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve', 'reject', 'flag'

    if (!['approve', 'reject', 'flag'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use: approve, reject, or flag'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged'
    };

    review.status = statusMap[action];
    await review.save();

    // Recalculate course rating
    await Review.calculateCourseRating(review.course);

    res.json({
      success: true,
      message: `Review ${action}d successfully`,
      review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating review',
      error: error.message
    });
  }
};

// @desc    Get all reviews by a user
// @route   GET /api/reviews/user/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('course', 'title thumbnail')
      .populate('instructorResponse.respondedBy', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

module.exports = exports;
