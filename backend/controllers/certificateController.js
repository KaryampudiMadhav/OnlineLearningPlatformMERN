const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// Generate certificate for completed course - Fixed certificateId generation
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if enrollment exists and course is completed
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    if (enrollment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Course must be completed to generate certificate',
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (certificate) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already exists',
        data: certificate,
      });
    }

    // Get course and user details
    const course = await Course.findById(courseId).populate('instructorId', 'name');
    const user = await User.findById(userId);

    // Calculate total lessons
    let totalLessons = 0;
    course.curriculum.forEach(section => {
      totalLessons += section.lessons.length;
    });

    // Calculate grade based on progress percentage
    const progressPercentage = enrollment.progress;
    let grade = 'Pass';
    if (progressPercentage >= 95) grade = 'A+';
    else if (progressPercentage >= 90) grade = 'A';
    else if (progressPercentage >= 85) grade = 'B+';
    else if (progressPercentage >= 80) grade = 'B';
    else if (progressPercentage >= 75) grade = 'C+';
    else if (progressPercentage >= 70) grade = 'C';

    // Create certificate
    certificate = new Certificate({
      user: userId,
      course: courseId,
      completionDate: enrollment.completedAt || new Date(),
      grade,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate`,
      metadata: {
        courseDuration: course.duration,
        totalLessons,
        completedLessons: enrollment.completedLessons?.length || totalLessons,
        instructorName: course.instructorId?.name || course.instructor || 'Unknown Instructor',
      },
    });
    await certificate.save();

    // Populate certificate with user and course details
    certificate = await Certificate.findById(certificate._id)
      .populate('user', 'name email')
      .populate('course', 'title description category level instructor instructorId')
      .populate({
        path: 'course',
        populate: {
          path: 'instructorId',
          select: 'name',
        },
      });

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificate,
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all certificates for a user
exports.getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.find({ user: userId })
      .populate('user', 'name email')
      .populate('course', 'title description category level thumbnail instructor instructorId')
      .populate({
        path: 'course',
        populate: {
          path: 'instructorId',
          select: 'name',
        },
      })
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get single certificate by ID
exports.getCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id)
      .populate('user', 'name email')
      .populate('course', 'title description category level instructor instructorId')
      .populate({
        path: 'course',
        populate: {
          path: 'instructorId',
          select: 'name',
        },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Verify certificate by certificate ID
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'name email')
      .populate('course', 'title category level instructor instructorId')
      .populate({
        path: 'course',
        populate: {
          path: 'instructorId',
          select: 'name',
        },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid',
        valid: false,
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      data: certificate,
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Delete certificate (admin only)
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByIdAndDelete(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
    });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get certificate statistics (admin only)
exports.getCertificateStats = async (req, res) => {
  try {
    const totalCertificates = await Certificate.countDocuments();
    
    const certificatesByGrade = await Certificate.aggregate([
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 },
        },
      },
    ]);

    const recentCertificates = await Certificate.find()
      .populate('user', 'name')
      .populate('course', 'title')
      .sort({ issueDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        total: totalCertificates,
        byGrade: certificatesByGrade,
        recent: recentCertificates,
      },
    });
  } catch (error) {
    console.error('Get certificate stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
