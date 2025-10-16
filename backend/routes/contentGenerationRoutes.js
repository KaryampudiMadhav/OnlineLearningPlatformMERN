const express = require('express');
const router = express.Router();
const {
  bulkImportQuizzes,
  generateCourseTemplate,
  autoGenerateQuiz,
  getAvailableTemplates
} = require('../controllers/contentGenerationController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Template routes
router.get('/templates', authorize('instructor', 'admin'), getAvailableTemplates);
router.post('/course-template', authorize('instructor', 'admin'), generateCourseTemplate);

// Quiz generation routes
router.post('/bulk-import-quizzes', authorize('instructor', 'admin'), bulkImportQuizzes);
router.post('/auto-generate-quiz', authorize('instructor', 'admin'), autoGenerateQuiz);

module.exports = router;