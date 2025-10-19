const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  generateSkillsCurriculum,
  createSkillsCourse,
  getSkillsCourses,
} = require('../controllers/skillsCourseController');

// Public routes
router.get('/', getSkillsCourses);

// Protected routes (require authentication)
router.post('/generate-curriculum', protect, generateSkillsCurriculum);
router.post('/create', protect, createSkillsCourse);

module.exports = router;
