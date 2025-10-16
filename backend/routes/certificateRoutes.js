const express = require('express');
const {
  generateCertificate,
  getMyCertificates,
  getCertificate,
  verifyCertificate,
  deleteCertificate,
  getCertificateStats,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public route - verify certificate
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes - require authentication
router.use(protect);

// Student routes
router.post('/generate/:courseId', generateCertificate);
router.get('/my-certificates', getMyCertificates);
router.get('/:id', getCertificate);

// Admin routes
router.delete('/:id', authorize('admin'), deleteCertificate);
router.get('/admin/stats', authorize('admin'), getCertificateStats);

module.exports = router;
