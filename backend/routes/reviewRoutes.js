const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  createReview,
  getCourseReviews,
  getMyReview,
  updateReview,
  deleteReview,
  toggleHelpfulVote,
  addInstructorResponse,
  flagReview,
  getFlaggedReviews,
  moderateReview,
  getMyReviews
} = require('../controllers/reviewController');

// Public routes
router.get('/course/:courseId', getCourseReviews);

// Protected routes (authenticated users)
router.use(protect);

// Student routes
router.post('/', createReview);
router.get('/user/my-reviews', getMyReviews);
router.get('/my-review/:courseId', getMyReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', toggleHelpfulVote);
router.post('/:id/flag', flagReview);

// Instructor/Admin routes
router.post('/:id/respond', authorize('instructor', 'admin'), addInstructorResponse);

// Admin only routes
router.get('/admin/flagged', authorize('admin'), getFlaggedReviews);
router.put('/admin/:id/moderate', authorize('admin'), moderateReview);

module.exports = router;
