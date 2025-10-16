const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middlewares/auth');
const {
  getUserProgress,
  getLeaderboard,
  getAllBadges,
  getAllAchievements,
  awardXP,
  checkAndAwardBadges,
  checkAndUpdateAchievements,
  getUserStats,
  seedBadges
} = require('../controllers/gamificationController');

// Public routes (with optional auth for user position)
router.get('/leaderboard', optionalAuth, getLeaderboard);
router.get('/badges', getAllBadges);
router.get('/achievements', getAllAchievements);

// Protected routes (authenticated users)
router.use(protect);

router.get('/progress', getUserProgress);
router.get('/stats', getUserStats);
router.post('/award-xp', awardXP);
router.post('/check-badges', checkAndAwardBadges);
router.post('/check-achievements', checkAndUpdateAchievements);

// Admin routes
router.post('/admin/seed-badges', authorize('admin'), seedBadges);

module.exports = router;
