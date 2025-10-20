const express = require('express');
const router = express.Router();
const dynamicCourseController = require('../controllers/dynamicCourseController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * Dynamic Course Generation Routes
 * All routes require authentication and instructor/admin role
 */

// Generate complete course dynamically
router.post(
  '/generate',
  protect,
  authorize('admin', 'instructor'),
  dynamicCourseController.generateDynamicCourse
);

// Check generation status
router.get(
  '/status/:courseId',
  protect,
  dynamicCourseController.getCourseGenerationStatus
);

// Test Inngest connection
router.get(
  '/test-inngest',
  protect,
  authorize('admin', 'instructor'),
  dynamicCourseController.testInngestConnection
);

// Generate single module
router.post(
  '/:courseId/module',
  protect,
  authorize('admin', 'instructor'),
  dynamicCourseController.generateModule
);

// Generate quiz for specific lesson
router.post(
  '/:courseId/module/:moduleIndex/quiz',
  protect,
  authorize('admin', 'instructor'),
  dynamicCourseController.generateLessonQuiz
);

// Regenerate module content
router.post(
  '/:courseId/module/:moduleIndex/regenerate',
  protect,
  authorize('admin', 'instructor'),
  dynamicCourseController.regenerateModule
);

// Enhance module content with AI
router.post(
  '/:courseId/module/:moduleIndex/enhance',
  protect,
  authorize('admin', 'instructor'),
  dynamicCourseController.enhanceModuleContent
);

module.exports = router;
