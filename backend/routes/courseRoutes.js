const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getInstructorCourses,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middlewares/auth');
const { validateCourse } = require('../middlewares/validateRequest');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes (Admin/Instructor)
router.post(
  '/',
  protect,
  authorize('admin', 'instructor'),
  validateCourse,
  createCourse
);
router.put(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  updateCourse
);
router.delete(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  deleteCourse
);

// Instructor routes
router.get('/instructor/my-courses', protect, authorize('admin', 'instructor'), getInstructorCourses);

// Admin only routes
router.get('/admin/stats', protect, authorize('admin'), getCourseStats);

module.exports = router;
