const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// Protected routes - require authentication
router.use(protect);

// Submit quiz attempt
router.post('/', async (req, res) => {
  try {
    const { courseId, moduleIndex, answers, score, timeSpent } = req.body;
    
    // For now, just log the attempt (later we can save to database)
    console.log(`Quiz attempt submitted:`, {
      userId: req.user._id,
      courseId,
      moduleIndex,
      score,
      timeSpent,
      answersCount: Object.keys(answers).length
    });

    res.status(200).json({
      success: true,
      message: 'Quiz attempt recorded successfully',
      data: {
        score,
        passed: score >= 70
      }
    });
  } catch (error) {
    console.error('Quiz attempt submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record quiz attempt'
    });
  }
});

module.exports = router;