const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getCourseQuizzes,
  getQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizResults,
  getMyAttempts,
  updateQuiz,
  deleteQuiz,
  getQuizStats,
  getModuleQuizzes,
  getCourseStructureWithQuizzes
} = require('../controllers/quizController');
const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.get('/course/:courseId', getCourseQuizzes);
router.get('/course/:courseId/structure', getCourseStructureWithQuizzes);
router.get('/course/:courseId/module/:moduleIndex', getModuleQuizzes);
router.get('/course/:courseId/module/:moduleIndex/lesson/:lessonIndex', getModuleQuizzes);

// Protected routes - require authentication
router.use(protect);

// Student routes
router.get('/my-attempts', getMyAttempts);
router.get('/:id', getQuiz);
router.post('/:id/start', startQuizAttempt);
router.post('/:id/submit', submitQuizAttempt);
router.get('/attempt/:attemptId', getQuizResults);

// Instructor/Admin routes
router.post('/', authorize('instructor', 'admin'), createQuiz);
router.put('/:id', authorize('instructor', 'admin'), updateQuiz);
router.delete('/:id', authorize('instructor', 'admin'), deleteQuiz);
router.get('/:id/stats', authorize('instructor', 'admin'), getQuizStats);

module.exports = router;
