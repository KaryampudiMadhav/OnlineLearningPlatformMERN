const express = require('express');
const router = express.Router();
const {
  register,
  registerPrivileged,
  login,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validateRegister, validateLogin } = require('../middlewares/validateRequest');

// Public routes
router.post('/register', validateRegister, register);
router.post('/register-privileged', registerPrivileged); // Secret route for admin/instructor
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
