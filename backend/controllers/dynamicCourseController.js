const Course = require('../models/Course');
const { inngest } = require('../config/inngest');
const intelligentAIService = require('../utils/intelligentAIService');
const { validateCourseSkills, sanitizeSkillsData } = require('../utils/validators/courseSchemaValidator');

/**
 * @desc    Initiate dynamic course generation with Inngest
 * @route   POST /api/courses/dynamic/generate
 * @access  Private (Instructor)
 */
exports.generateDynamicCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      level,
      price,
      moduleCount = 5,
      lessonsPerModule = 4,
      includeQuizzes = true,
      skills = []
    } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    if (moduleCount < 3 || moduleCount > 10) {
      return res.status(400).json({
        success: false,
        message: 'Module count must be between 3 and 10'
      });
    }

    // Normalize level to match Course model enum (capitalize first letter)
    const normalizedLevel = level 
      ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
      : 'Intermediate';

    // Create initial course record
    const initialCourse = await Course.create({
      title,
      description,
      instructor: req.user.name,
      instructorId: req.user._id,
      category: category || 'General',
      level: normalizedLevel,
      price: price || 0,
      duration: `${moduleCount * lessonsPerModule * 0.5} hours`,
      curriculum: [],
      isPublished: false,
      metadata: {
        aiGenerated: true,
        generationStatus: 'pending',
        generationStarted: new Date(),
        requestedModules: moduleCount,
        requestedLessons: lessonsPerModule,
        skills: skills
      }
    });

    // Trigger Inngest workflow
    console.log('📤 Sending event to Inngest:', {
      eventName: 'course/generate-dynamic',
      courseId: initialCourse._id.toString(),
      userId: req.user._id.toString(),
      config: {
        title,
        moduleCount,
        lessonsPerModule,
        includeQuizzes
      }
    });

    try {
      const inngestResponse = await inngest.send({
        name: 'course/generate-dynamic',
        data: {
          courseId: initialCourse._id.toString(),
          userId: req.user._id.toString(),
          config: {
            title,
            description,
            category,
            level: normalizedLevel,
            moduleCount,
            lessonsPerModule,
            includeQuizzes,
            skills
          }
        }
      });

      console.log('✅ Event sent to Inngest successfully:', inngestResponse);
    } catch (inngestError) {
      console.error('❌ Failed to send event to Inngest:', inngestError);
      
      // Update course status to failed
      await Course.findByIdAndUpdate(initialCourse._id, {
        'metadata.generationStatus': 'failed',
        'metadata.failureReason': 'Failed to start generation workflow'
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to start course generation',
        error: inngestError.message
      });
    }

    res.status(202).json({
      success: true,
      message: 'Course generation started! This may take 2-5 minutes.',
      course: {
        _id: initialCourse._id,
        title: initialCourse.title,
        status: 'generating',
        estimatedTime: `${Math.ceil((moduleCount * lessonsPerModule) / 2)} minutes`
      }
    });

  } catch (error) {
    console.error('Dynamic course generation error:', error);
    next(error);
  }
};

/**
 * @desc    Get course generation status
 * @route   GET /api/courses/dynamic/status/:courseId
 * @access  Private
 */
exports.getCourseGenerationStatus = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .select('title metadata curriculum');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Calculate progress
    const requestedModules = course.metadata?.requestedModules || 0;
    const currentModules = course.curriculum?.length || 0;
    const progress = requestedModules > 0 
      ? Math.round((currentModules / requestedModules) * 100) 
      : 0;

    res.json({
      success: true,
      status: course.metadata?.generationStatus || 'unknown',
      progress,
      currentModules,
      totalModules: requestedModules,
      course: {
        _id: course._id,
        title: course.title,
        modulesGenerated: currentModules,
        isComplete: course.metadata?.generationStatus === 'completed'
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    next(error);
  }
};

/**
 * @desc    Generate single module dynamically
 * @route   POST /api/courses/dynamic/:courseId/module
 * @access  Private (Instructor)
 */
exports.generateModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { moduleTitle, description, lessonCount = 4 } = req.body;

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this course'
      });
    }

    // Trigger module generation
    await inngest.send({
      name: 'module/generate',
      data: {
        courseId: course._id.toString(),
        userId: req.user._id.toString(),
        moduleConfig: {
          title: moduleTitle,
          description,
          lessonCount,
          courseContext: {
            title: course.title,
            category: course.category,
            level: course.level
          }
        }
      }
    });

    res.status(202).json({
      success: true,
      message: 'Module generation started',
      estimatedTime: `${Math.ceil(lessonCount / 2)} minutes`
    });

  } catch (error) {
    console.error('Module generation error:', error);
    next(error);
  }
};

/**
 * @desc    Generate quiz for specific lesson
 * @route   POST /api/courses/dynamic/:courseId/module/:moduleIndex/quiz
 * @access  Private (Instructor)
 */
exports.generateLessonQuiz = async (req, res, next) => {
  try {
    const { courseId, moduleIndex } = req.params;
    const { lessonIndex, difficulty, questionCount = 5 } = req.body;

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const module = course.curriculum[parseInt(moduleIndex)];
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const lesson = module.lessons?.[parseInt(lessonIndex)];
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Trigger quiz generation
    await inngest.send({
      name: 'quiz/generate-lesson',
      data: {
        courseId: course._id.toString(),
        moduleIndex: parseInt(moduleIndex),
        lessonIndex: parseInt(lessonIndex),
        userId: req.user._id.toString(),
        config: {
          lessonTitle: lesson.title,
          lessonContent: lesson.content,
          difficulty: difficulty || course.level,
          questionCount
        }
      }
    });

    res.status(202).json({
      success: true,
      message: 'Quiz generation started',
      estimatedTime: '30 seconds'
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    next(error);
  }
};

/**
 * @desc    Regenerate specific module content
 * @route   POST /api/courses/dynamic/:courseId/module/:moduleIndex/regenerate
 * @access  Private (Instructor)
 */
exports.regenerateModule = async (req, res, next) => {
  try {
    const { courseId, moduleIndex } = req.params;
    const { keepQuiz = true } = req.body;

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const module = course.curriculum[parseInt(moduleIndex)];
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Trigger regeneration
    await inngest.send({
      name: 'module/regenerate',
      data: {
        courseId: course._id.toString(),
        moduleIndex: parseInt(moduleIndex),
        userId: req.user._id.toString(),
        config: {
          moduleTitle: module.title,
          keepQuiz,
          courseContext: {
            title: course.title,
            category: course.category,
            level: course.level
          }
        }
      }
    });

    res.status(202).json({
      success: true,
      message: 'Module regeneration started'
    });

  } catch (error) {
    console.error('Module regeneration error:', error);
    next(error);
  }
};

/**
 * @desc    Enhance module content with AI
 * @route   POST /api/courses/dynamic/:courseId/module/:moduleIndex/enhance
 * @access  Private (Instructor)
 */
exports.enhanceModuleContent = async (req, res, next) => {
  try {
    const { courseId, moduleIndex } = req.params;
    const { enhancementType = 'expand' } = req.body; // expand, simplify, add-examples

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const module = course.curriculum[parseInt(moduleIndex)];
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Trigger content enhancement
    await inngest.send({
      name: 'content/enhance',
      data: {
        courseId: course._id.toString(),
        moduleIndex: parseInt(moduleIndex),
        userId: req.user._id.toString(),
        config: {
          enhancementType,
          currentContent: module
        }
      }
    });

    res.status(202).json({
      success: true,
      message: 'Content enhancement started'
    });

  } catch (error) {
    console.error('Content enhancement error:', error);
    next(error);
  }
};

/**
 * @desc    Test Inngest connection
 * @route   GET /api/courses/dynamic/test-inngest
 * @access  Private (Instructor)
 */
exports.testInngestConnection = async (req, res, next) => {
  try {
    console.log('🧪 Testing Inngest connection...');
    
    const testEvent = await inngest.send({
      name: 'test/connection',
      data: {
        timestamp: new Date().toISOString(),
        userId: req.user._id.toString()
      }
    });

    console.log('✅ Test event sent successfully:', testEvent);

    res.json({
      success: true,
      message: 'Inngest connection test successful',
      eventId: testEvent.ids?.[0] || 'unknown'
    });

  } catch (error) {
    console.error('❌ Inngest connection test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Inngest connection test failed',
      error: error.message
    });
  }
};
