const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const dynamicQuizService = require('../utils/dynamicQuizService');

// @desc    Generate complete course with AI
// @route   POST /api/ai-generation/generate-course
// @access  Private (Instructor/Admin)
router.post('/generate-course', protect, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      level,
      moduleCount = 5,
      lessonsPerModule = 4
    } = req.body;

    console.log(`🚀 Generating complete AI course: ${title}`);

    // Validate required fields
    if (!title || !description || !category || !level) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and level are required'
      });
    }

    // Generate complete course curriculum with AI
    const curriculum = await dynamicQuizService.generateCompleteCurriculum(
      title,
      description,
      category,
      level,
      moduleCount,
      lessonsPerModule
    );

    // Generate quizzes for each module
    for (let i = 0; i < curriculum.length; i++) {
      const module = curriculum[i];
      
      try {
        console.log(`🎯 Generating quiz for module: ${module.title}`);
        
        const quizzes = await dynamicQuizService.generateModuleQuizzes(
          title,
          module.title,
          module.description
        );

        if (quizzes && quizzes.length > 0) {
          const primaryQuiz = quizzes.find(q => q.difficulty === 'intermediate') || quizzes[0];
          
          // Convert to embedded quiz format
          curriculum[i].quiz = {
            title: primaryQuiz.title,
            description: primaryQuiz.description,
            questions: primaryQuiz.questions.map(q => ({
              question: q.question,
              type: 'multiple-choice',
              options: q.options.map(opt => opt.text),
              correctAnswer: q.options.findIndex(opt => opt.isCorrect),
              explanation: q.explanation,
              difficulty: primaryQuiz.difficulty
            })),
            duration: 15,
            passingScore: 70,
            totalQuestions: primaryQuiz.questions.length
          };
          
          console.log(`   ✅ Generated quiz for: ${module.title}`);
        }
      } catch (quizError) {
        console.error(`   ❌ Quiz generation failed for ${module.title}:`, quizError);
        
        // Use fallback quiz
        const fallbackQuizzes = dynamicQuizService.generateFallbackQuizzes(module.title);
        const fallbackQuiz = fallbackQuizzes[0];
        
        curriculum[i].quiz = {
          title: fallbackQuiz.title,
          description: fallbackQuiz.description,
          questions: fallbackQuiz.questions.map(q => ({
            question: q.question,
            type: 'multiple-choice',
            options: q.options.map(opt => opt.text),
            correctAnswer: q.options.findIndex(opt => opt.isCorrect),
            explanation: q.explanation,
            difficulty: fallbackQuiz.difficulty
          })),
          duration: 15,
          passingScore: 70,
          totalQuestions: fallbackQuiz.questions.length
        };
      }
    }

    console.log(`🎉 Successfully generated complete course with ${curriculum.length} modules`);

    res.status(200).json({
      success: true,
      message: 'Course generated successfully with AI',
      data: {
        curriculum,
        generatedModules: curriculum.length,
        totalLessons: curriculum.reduce((acc, module) => acc + module.lessons.length, 0),
        hasQuizzes: curriculum.every(module => module.quiz),
        recommendedDuration: `${curriculum.length * 2}-${curriculum.length * 3} hours`
      }
    });

  } catch (error) {
    console.error('❌ AI course generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate course with AI',
      error: error.message
    });
  }
});

// @desc    Generate modules only
// @route   POST /api/ai-generation/generate-modules
// @access  Private (Instructor/Admin)
router.post('/generate-modules', protect, async (req, res) => {
  try {
    const { 
      courseTitle,
      courseDescription,
      courseCategory,
      courseLevel,
      topic,
      moduleCount = 3,
      lessonsPerModule = 4
    } = req.body;

    console.log(`🎯 Generating ${moduleCount} modules for topic: ${topic}`);

    const curriculum = await dynamicQuizService.generateCompleteCurriculum(
      courseTitle || topic,
      courseDescription || `Comprehensive course on ${topic}`,
      courseCategory || 'Other',
      courseLevel || 'Intermediate',
      moduleCount,
      lessonsPerModule
    );

    res.status(200).json({
      success: true,
      message: 'Modules generated successfully',
      data: {
        modules: curriculum,
        count: curriculum.length
      }
    });

  } catch (error) {
    console.error('❌ Module generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate modules',
      error: error.message
    });
  }
});

module.exports = router;