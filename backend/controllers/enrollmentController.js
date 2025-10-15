const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private
exports.enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
    });

    // Update course enrolled students count
    course.enrolledStudents += 1;
    await course.save();

    // Add to user's enrolled courses
    const user = await User.findById(req.user._id);
    user.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
      progress: 0,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user enrollments
// @route   GET /api/enrollments/my-courses
// @access  Private
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({
        path: 'course',
        select: 'title instructor image rating duration price category level',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
exports.getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('user', 'name email avatar');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Check if user owns this enrollment or is admin
    if (
      enrollment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this enrollment',
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private
exports.updateProgress = async (req, res, next) => {
  try {
    const { progress, completedLessons } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Check if user owns this enrollment
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this enrollment',
      });
    }

    if (progress !== undefined) {
      enrollment.progress = progress;
      if (progress >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }
    }

    if (completedLessons) {
      enrollment.completedLessons = completedLessons;
    }

    await enrollment.save();

    // Update progress in user's enrolled courses
    const user = await User.findById(req.user._id);
    const courseIndex = user.enrolledCourses.findIndex(
      (ec) => ec.course.toString() === enrollment.course.toString()
    );
    if (courseIndex !== -1) {
      user.enrolledCourses[courseIndex].progress = enrollment.progress;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to enrollment
// @route   PUT /api/enrollments/:id/review
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Check if user owns this enrollment
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this enrollment',
      });
    }

    enrollment.rating = rating;
    enrollment.review = review;
    await enrollment.save();

    // Update course rating
    const allEnrollments = await Enrollment.find({
      course: enrollment.course,
      rating: { $exists: true },
    });

    if (allEnrollments.length > 0) {
      const avgRating =
        allEnrollments.reduce((sum, e) => sum + e.rating, 0) / allEnrollments.length;
      
      const course = await Course.findById(enrollment.course);
      course.rating = Math.round(avgRating * 10) / 10;
      course.totalRatings = allEnrollments.length;
      await course.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unenroll from course
// @route   DELETE /api/enrollments/:id
// @access  Private
exports.unenrollCourse = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Check if user owns this enrollment
    if (enrollment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unenroll from this course',
      });
    }

    // Update course enrolled students count
    const course = await Course.findById(enrollment.course);
    if (course) {
      course.enrolledStudents = Math.max(0, course.enrolledStudents - 1);
      await course.save();
    }

    // Remove from user's enrolled courses
    const user = await User.findById(req.user._id);
    user.enrolledCourses = user.enrolledCourses.filter(
      (ec) => ec.course.toString() !== enrollment.course.toString()
    );
    await user.save();

    await enrollment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course',
    });
  } catch (error) {
    next(error);
  }
};
