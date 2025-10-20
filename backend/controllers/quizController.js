const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Instructor/Admin)
exports.createQuiz = async (req, res) => {
  try {
    const {
      courseId,
      quizType,
      moduleIndex,
      lessonIndex,
      title,
      description,
      instructions,
      questions,
      duration,
      passingScore,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
      showCorrectAnswers,
      showExplanations,
      // Backward compatibility
      section,
      lesson
    } = req.body;

    // Verify course exists and user is instructor/admin
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is course instructor or admin
    if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create quiz for this course'
      });
    }

    // Validate module and lesson indices if provided
    let moduleTitle = null;
    let lessonTitle = null;
    
    if (quizType === 'module' && typeof moduleIndex === 'number') {
      if (!course.curriculum || !course.curriculum[moduleIndex]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid module index'
        });
      }
      moduleTitle = course.curriculum[moduleIndex].title;
    }
    
    if (quizType === 'lesson' && typeof moduleIndex === 'number' && typeof lessonIndex === 'number') {
      if (!course.curriculum || 
          !course.curriculum[moduleIndex] || 
          !course.curriculum[moduleIndex].lessons ||
          !course.curriculum[moduleIndex].lessons[lessonIndex]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid module or lesson index'
        });
      }
      moduleTitle = course.curriculum[moduleIndex].title;
      lessonTitle = course.curriculum[moduleIndex].lessons[lessonIndex].title;
    }

    const quiz = await Quiz.create({
      course: courseId,
      quizType: quizType || 'course',
      moduleIndex: typeof moduleIndex === 'number' ? moduleIndex : undefined,
      moduleTitle,
      lessonIndex: typeof lessonIndex === 'number' ? lessonIndex : undefined,
      lessonTitle,
      section, // Backward compatibility
      lesson, // Backward compatibility
      title,
      description,
      instructions,
      questions,
      duration,
      passingScore,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
      showCorrectAnswers,
      showExplanations,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Public
exports.getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    const quizzes = await Quiz.find({ course: courseId, isActive: true })
      .select('-questions.options.isCorrect') // Hide correct answers for non-instructors
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    console.error('Get course quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// @desc    Get single quiz (for taking)
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    let quiz = await Quiz.findById(id)
      .populate('course', 'title')
      .populate('createdBy', 'name');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check user's previous attempts
    const attempts = await QuizAttempt.find({
      quiz: id,
      student: req.user.id
    }).sort({ attemptNumber: -1 });

    const attemptCount = attempts.length;
    const canRetake = attemptCount < quiz.maxAttempts;
    const bestScore = attempts.length > 0 
      ? Math.max(...attempts.filter(a => a.status === 'completed').map(a => a.score))
      : 0;

    // Hide correct answers when student is taking quiz
    const quizData = quiz.toObject();
    if (req.user.role === 'student') {
      quizData.questions = quizData.questions.map(q => ({
        ...q,
        options: q.options.map(opt => ({
          text: opt.text,
          _id: opt._id
        }))
      }));
    }

    res.status(200).json({
      success: true,
      quiz: quizData,
      attempts: {
        count: attemptCount,
        canRetake,
        remaining: quiz.maxAttempts - attemptCount,
        bestScore,
        lastAttempt: attempts[0] || null
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
};

// @desc    Start quiz attempt
// @route   POST /api/quizzes/:id/start
// @access  Private (Student)
exports.startQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check existing attempts
    const attempts = await QuizAttempt.find({
      quiz: id,
      student: userId
    });

    if (attempts.length >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached for this quiz'
      });
    }

    // Check for in-progress attempt
    const inProgressAttempt = attempts.find(a => a.status === 'in-progress');
    if (inProgressAttempt) {
      return res.status(200).json({
        success: true,
        message: 'Resuming existing attempt',
        attempt: inProgressAttempt
      });
    }

    // Create new attempt
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    const attempt = await QuizAttempt.create({
      quiz: id,
      student: userId,
      course: quiz.course,
      attemptNumber: attempts.length + 1,
      totalPoints,
      startedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      attempt
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz attempt',
      error: error.message
    });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { attemptId, answers, timeSpent } = req.body;
    const userId = req.user.id;

    // Verify attempt belongs to user
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quiz: id,
      student: userId,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found or already completed'
      });
    }

    // Get quiz with correct answers
    const quiz = await Quiz.findById(id);

    // Grade the answers
    let pointsEarned = 0;
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) {
        return {
          ...answer,
          isCorrect: false,
          pointsEarned: 0
        };
      }

      let isCorrect = false;
      const correctIndices = question.options
        .map((opt, idx) => opt.isCorrect ? idx : -1)
        .filter(idx => idx !== -1);

      // Check if answer is correct
      if (question.type === 'multiple-select') {
        // For multiple select, all correct options must be selected
        const selectedSet = new Set(answer.selectedOptions);
        const correctSet = new Set(correctIndices);
        isCorrect = selectedSet.size === correctSet.size &&
                    [...selectedSet].every(idx => correctSet.has(idx));
      } else {
        // For single select and true/false
        isCorrect = answer.selectedOptions.length === 1 &&
                    correctIndices.includes(answer.selectedOptions[0]);
      }

      const earnedPoints = isCorrect ? question.points : 0;
      pointsEarned += earnedPoints;

      return {
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions,
        isCorrect,
        pointsEarned: earnedPoints
      };
    });

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.pointsEarned = pointsEarned;
    attempt.completedAt = new Date();
    attempt.timeSpent = timeSpent;
    attempt.status = 'completed';
    attempt.passed = (pointsEarned / attempt.totalPoints * 100) >= quiz.passingScore;

    await attempt.save();

    // Populate for response
    await attempt.populate('quiz');

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      attempt,
      passed: attempt.passed
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/attempt/:attemptId
// @access  Private
exports.getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findById(attemptId)
      .populate({
        path: 'quiz',
        populate: {
          path: 'course',
          select: 'title'
        }
      })
      .populate('student', 'name email');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check authorization
    if (attempt.student._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attempt'
      });
    }

    res.status(200).json({
      success: true,
      attempt
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz results',
      error: error.message
    });
  }
};

// @desc    Get student's quiz attempts
// @route   GET /api/quizzes/my-attempts
// @access  Private (Student)
exports.getMyAttempts = async (req, res) => {
  try {
    const userId = req.user.id;

    const attempts = await QuizAttempt.find({ student: userId })
      .populate('quiz', 'title duration passingScore')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    console.error('Get my attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempts',
      error: error.message
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor/Admin)
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    let quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check authorization
    const course = await Course.findById(quiz.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quiz'
      });
    }

    quiz = await Quiz.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor/Admin)
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check authorization
    const course = await Course.findById(quiz.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

// @desc    Get quiz statistics (Instructor/Admin)
// @route   GET /api/quizzes/:id/stats
// @access  Private (Instructor/Admin)
exports.getQuizStats = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get all completed attempts
    const attempts = await QuizAttempt.find({
      quiz: id,
      status: 'completed'
    }).populate('student', 'name email');

    const totalAttempts = attempts.length;
    const uniqueStudents = [...new Set(attempts.map(a => a.student._id.toString()))].length;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const averageScore = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
      : 0;

    const averageTime = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / totalAttempts
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalAttempts,
        uniqueStudents,
        passedAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts * 100).toFixed(1) : 0,
        averageScore: averageScore.toFixed(1),
        averageTime: Math.round(averageTime),
        recentAttempts: attempts.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics',
      error: error.message
    });
  }
};

// @desc    Get quizzes by module/lesson
// @route   GET /api/quizzes/course/:courseId/module/:moduleIndex
// @route   GET /api/quizzes/course/:courseId/module/:moduleIndex/lesson/:lessonIndex
// @access  Public
exports.getModuleQuizzes = async (req, res) => {
  try {
    const { courseId, moduleIndex, lessonIndex } = req.params;
    
    const query = { 
      course: courseId, 
      isActive: true 
    };

    // Add module filter
    if (typeof moduleIndex !== 'undefined') {
      query.moduleIndex = parseInt(moduleIndex);
    }

    // Add lesson filter if provided
    if (typeof lessonIndex !== 'undefined') {
      query.lessonIndex = parseInt(lessonIndex);
      query.quizType = 'lesson';
    } else if (typeof moduleIndex !== 'undefined') {
      // Get module quizzes (not lesson-specific)
      query.$or = [
        { quizType: 'module', moduleIndex: parseInt(moduleIndex) },
        { quizType: 'lesson', moduleIndex: parseInt(moduleIndex) }
      ];
    }

    const quizzes = await Quiz.find(query)
      .select('-questions.options.isCorrect') // Hide correct answers for non-instructors
      .populate('createdBy', 'name')
      .sort({ lessonIndex: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    console.error('Get module quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch module quizzes',
      error: error.message
    });
  }
};

// @desc    Get course structure with quiz info
// @route   GET /api/quizzes/course/:courseId/structure
// @access  Public
exports.getCourseStructureWithQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Get course with curriculum
    const course = await Course.findById(courseId).select('title curriculum');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get all quizzes for this course
    const quizzes = await Quiz.find({ course: courseId, isActive: true })
      .select('title quizType moduleIndex lessonIndex duration questionCount')
      .sort({ moduleIndex: 1, lessonIndex: 1 });

    // Organize curriculum with quiz info
    const structureWithQuizzes = course.curriculum.map((module, moduleIndex) => ({
      moduleIndex,
      title: module.title,
      description: module.description,
      duration: module.duration,
      moduleQuizzes: quizzes.filter(q => 
        q.quizType === 'module' && q.moduleIndex === moduleIndex
      ),
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        lessonIndex,
        title: lesson.title,
        duration: lesson.duration,
        isPreview: lesson.isPreview,
        lessonQuizzes: quizzes.filter(q => 
          q.quizType === 'lesson' && 
          q.moduleIndex === moduleIndex && 
          q.lessonIndex === lessonIndex
        )
      }))
    }));

    // Add course-level quizzes
    const courseQuizzes = quizzes.filter(q => q.quizType === 'course');

    res.status(200).json({
      success: true,
      course: {
        id: course._id,
        title: course.title,
        courseQuizzes,
        modules: structureWithQuizzes
      }
    });
  } catch (error) {
    console.error('Get course structure with quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course structure',
      error: error.message
    });
  }
};

// @desc    Get quizzes for a specific module
// @route   GET /api/quizzes/course/:courseId/module/:moduleIndex/all
// @access  Public
exports.getModuleQuizzes = async (req, res) => {
  try {
    const { courseId, moduleIndex } = req.params;
    const moduleIdx = parseInt(moduleIndex);

    // First check if course has embedded quizzes in curriculum
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check for embedded quiz in curriculum
    if (course.curriculum && 
        course.curriculum[moduleIdx] && 
        course.curriculum[moduleIdx].quiz &&
        course.curriculum[moduleIdx].quiz.questions &&
        course.curriculum[moduleIdx].quiz.questions.length > 0) {
      
      const moduleQuiz = course.curriculum[moduleIdx].quiz;
      
      // Generate three difficulty variants from the embedded quiz
      const quizzes = [];
      const difficulties = [
        { 
          level: 'Beginner', 
          questionRatio: 0.6, 
          timeModifier: -5, 
          passingModifier: -10,
          description: 'Start with fundamental concepts and basic understanding'
        },
        { 
          level: 'Intermediate', 
          questionRatio: 1, 
          timeModifier: 0, 
          passingModifier: 0,
          description: 'Test your comprehensive understanding of the module'
        },
        { 
          level: 'Advanced', 
          questionRatio: 1, 
          timeModifier: 10, 
          passingModifier: 15,
          description: 'Challenge yourself with higher standards and deeper analysis'
        }
      ];

      difficulties.forEach(diff => {
        const questionCount = Math.max(3, Math.floor(moduleQuiz.questions.length * diff.questionRatio));
        const selectedQuestions = moduleQuiz.questions.slice(0, questionCount);
        
        quizzes.push({
          _id: `${courseId}_${moduleIdx}_${diff.level.toLowerCase()}`,
          title: `${moduleQuiz.title} - ${diff.level}`,
          description: diff.description,
          difficulty: diff.level,
          duration: Math.max(5, (moduleQuiz.duration || 15) + diff.timeModifier),
          passingScore: Math.min(100, Math.max(50, (moduleQuiz.passingScore || 70) + diff.passingModifier)),
          questions: selectedQuestions,
          questionCount: selectedQuestions.length,
          isEmbedded: true
        });
      });

      return res.status(200).json({
        success: true,
        count: quizzes.length,
        quizzes,
        source: 'embedded'
      });
    }

    // Fallback: Check for separate Quiz documents
    const quizzes = await Quiz.find({ 
      course: courseId, 
      moduleIndex: moduleIdx,
      isActive: true 
    })
    .select('title description duration passingScore questions difficulty')
    .lean();

    if (quizzes.length > 0) {
      // Format existing quizzes to match expected structure
      const formattedQuizzes = quizzes.map(quiz => ({
        ...quiz,
        questionCount: quiz.questions.length,
        isEmbedded: false
      }));

      return res.status(200).json({
        success: true,
        count: formattedQuizzes.length,
        quizzes: formattedQuizzes,
        source: 'database'
      });
    }

    // No quizzes found
    res.status(200).json({
      success: true,
      count: 0,
      quizzes: [],
      message: 'No quizzes found for this module'
    });

  } catch (error) {
    console.error('Get module quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch module quizzes',
      error: error.message
    });
  }
};
