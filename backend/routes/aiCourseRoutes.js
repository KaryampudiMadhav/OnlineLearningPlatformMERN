const express = require('express');
const router = express.Router();
const aiCourseController = require('../controllers/aiCourseController');
const { protect } = require('../middlewares/auth');

// @desc    Generate complete skills-based course using Intelligent AI Service
// @route   POST /api/ai-courses/generate-skills
// @access  Private (Instructor/Admin)
router.post('/generate-skills', protect, (req, res, next) => aiCourseController.generateSkillsBasedCourse(req, res, next));

// @desc    Analyze skills without creating a course
// @route   POST /api/ai-courses/analyze-skills
// @access  Private (Instructor/Admin)
router.post('/analyze-skills', protect, (req, res, next) => aiCourseController.analyzeSkills(req, res, next));

// @desc    Generate course content with AI (general)
// @route   POST /api/ai-courses/generate
// @access  Private (Instructor/Admin)
router.post('/generate', protect, (req, res, next) => aiCourseController.generateWithAI(req, res, next));

// @desc    Check AI job status
// @route   GET /api/ai-courses/job/:jobId/status
// @access  Private
router.get('/job/:jobId/status', protect, (req, res, next) => aiCourseController.checkJobStatus(req, res, next));

// @desc    Batch generate multiple courses
// @route   POST /api/ai-courses/batch-generate
// @access  Private (Instructor/Admin)
router.post('/batch-generate', protect, (req, res, next) => aiCourseController.batchGenerateCourses(req, res, next));

// @desc    Improve existing course content with AI
// @route   PUT /api/ai-courses/improve-course/:courseId
// @access  Private (Instructor/Admin)
router.put('/improve-course/:courseId', protect, (req, res, next) => aiCourseController.improveCourseContent(req, res, next));

// @desc    Get AI service health status
// @route   GET /api/ai-courses/health
// @access  Public
router.get('/health', (req, res, next) => aiCourseController.getAIHealthStatus(req, res, next));

module.exports = router;
