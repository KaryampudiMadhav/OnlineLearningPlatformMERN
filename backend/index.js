// Load environment variables FIRST (before any other imports)
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Fix AJV format validation issue for Inngest
// This must be done BEFORE any Inngest imports
process.env.AJV_STRICT = 'false';

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Store original Ajv
const OriginalAjv = Ajv.default || Ajv;

// Create a patched version
class PatchedAjv extends OriginalAjv {
  constructor(opts = {}) {
    // Override options to disable strict validation
    super({
      ...opts,
      strict: false,
      strictSchema: false,
      validateFormats: false,
      allErrors: true,
    });
    // Add formats support (includes 'uri')
    try {
      addFormats(this);
    } catch (err) {
      console.warn('⚠️ Could not add formats:', err.message);
    }
  }
}

// Replace Ajv in require cache
require.cache[require.resolve('ajv')].exports = PatchedAjv;
require.cache[require.resolve('ajv')].exports.default = PatchedAjv;

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { initializeAI } = require('./utils/aiService');

// Debug: Check if GEMINI_API_KEY is loaded
console.log('🔑 GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? '✅ Yes' : '❌ No');

// Initialize AI service
initializeAI();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StudySphere API is running! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      skillsCourses: '/api/skills-courses',
      enrollments: '/api/enrollments',
      certificates: '/api/certificates',
      quizzes: '/api/quizzes',
      reviews: '/api/reviews',
      gamification: '/api/gamification',
      challenges: '/api/challenges',
      contentGeneration: '/api/content-generation',
      aiGeneration: '/api/ai-generation',
    },
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/skills-courses', require('./routes/skillsCourseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/quiz-attempts', require('./routes/quizAttemptRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/content-generation', require('./routes/contentGenerationRoutes'));
app.use('/api/ai-generation', require('./routes/aiGenerationRoutes'));
app.use('/api/ai-courses', require('./routes/aiCourseRoutes'));
app.use('/api/ai-support', require('./routes/aiSupportRoutes'));
app.use('/api/courses/dynamic', require('./routes/dynamicCourseRoutes'));

// Inngest routes for AI processing
app.use('/api', require('./routes/inngestRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}\n`);
});


