const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/supportAiController');

// Public proxy endpoint for frontend chatbot to call
router.post('/chat', chat);

module.exports = router;
