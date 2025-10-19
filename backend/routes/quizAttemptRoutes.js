const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const QuizAttempt = require('../models/QuizAttempt');
const { protect } = require('../middlewares/auth');

// Protected routes - require authentication
router.use(protect);

// Submit quiz attempt for embedded quizzes
router.post('/', async (req, res) => {
  try {
    const { courseId, moduleIndex, answers, score, timeSpent, difficulty = 'intermediate' } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!courseId || moduleIndex === undefined || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseId, moduleIndex, or answers'
      });
    }

    // Get course and verify embedded quiz exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const module = course.curriculum[moduleIndex];
    if (!module || !module.quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found for this module'
      });
    }

    const embeddedQuiz = module.quiz;

    // Grade the quiz attempt
    let correctAnswers = 0;
    const totalQuestions = embeddedQuiz.questions.length;
    const gradedAnswers = {};

    embeddedQuiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      const isCorrect = userAnswer === correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      gradedAnswers[index] = {
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    const finalScore = score !== undefined ? score : calculatedScore;
    const passed = finalScore >= (embeddedQuiz.passingScore || 70);

    // Create quiz attempt record
    const quizAttempt = await QuizAttempt.create({
      student: userId,
      course: courseId,
      quiz: null, // No separate quiz document for embedded quizzes
      moduleIndex,
      moduleName: module.title,
      quizTitle: embeddedQuiz.title,
      difficulty,
      answers: gradedAnswers,
      score: finalScore,
      maxScore: 100,
      passed,
      timeSpent,
      totalQuestions,
      correctAnswers,
      submittedAt: new Date(),
      status: 'completed'
    });
    
    console.log(`Quiz attempt submitted:`, {
      userId,
      courseId,
      moduleIndex,
      score: finalScore,
      timeSpent,
      answersCount: Object.keys(answers).length,
      passed
    });

    res.status(200).json({
      success: true,
      message: 'Quiz attempt recorded successfully',
      data: {
        attemptId: quizAttempt._id,
        score: finalScore,
        maxScore: 100,
        correctAnswers,
        totalQuestions,
        passed,
        timeSpent,
        gradedAnswers
      }
    });
  } catch (error) {
    console.error('Quiz attempt submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record quiz attempt',
      error: error.message
    });
  }
});

// Get user's quiz attempts
router.get('/my-attempts', async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, moduleIndex } = req.query;

    let query = { student: userId };
    if (courseId) query.course = courseId;
    if (moduleIndex !== undefined) query.moduleIndex = parseInt(moduleIndex);

    const attempts = await QuizAttempt.find(query)
      .populate('course', 'title')
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempts',
      error: error.message
    });
  }
});

// Get specific quiz attempt
router.get('/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      student: userId
    }).populate('course', 'title').lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempt',
      error: error.message
    });
  }
});

module.exports = router;