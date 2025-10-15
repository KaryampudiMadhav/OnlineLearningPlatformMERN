const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyEnrollments,
  getEnrollment,
  updateProgress,
  addReview,
  unenrollCourse,
} = require('../controllers/enrollmentController');
const { protect } = require('../middlewares/auth');

// All routes are protected
router.post('/:courseId', protect, enrollCourse);
router.get('/my-courses', protect, getMyEnrollments);
router.get('/:id', protect, getEnrollment);
router.put('/:id/progress', protect, updateProgress);
router.put('/:id/review', protect, addReview);
router.delete('/:id', protect, unenrollCourse);

module.exports = router;
