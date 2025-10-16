const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middlewares/auth');
const {
  getTodaysChallenges,
  completeChallenge,
  updateChallengeProgress,
  getUserChallengeHistory,
  createChallenge,
  seedChallenges,
} = require('../controllers/challengeController');

// Public routes (with optional auth)
router.get('/today', optionalAuth, getTodaysChallenges);

// Protected routes
router.use(protect);

router.post('/:id/complete', completeChallenge);
router.put('/:id/progress', updateChallengeProgress);
router.get('/my-history', getUserChallengeHistory);

// Admin routes
router.post('/', authorize('admin', 'instructor'), createChallenge);
router.post('/seed', authorize('admin'), seedChallenges);

module.exports = router;
