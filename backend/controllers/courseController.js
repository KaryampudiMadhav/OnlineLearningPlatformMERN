const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const dynamicQuizService = require('../utils/dynamicQuizService');

// Helper function to generate quiz for a module
const generateModuleQuiz = (module, moduleIndex, courseId, instructorId) => {
  const questionData = [
    {
      question: `What is the main learning objective of "${module.title}"?`,
      options: [
        { text: 'Understanding core concepts and practical application', isCorrect: true },
        { text: 'Memorizing definitions without context', isCorrect: false },
        { text: 'Skipping fundamental principles', isCorrect: false },
        { text: 'Focusing only on advanced topics', isCorrect: false }
      ],
      explanation: `The primary goal of "${module.title}" is to build a solid foundation through understanding core concepts and applying them practically.`
    },
    {
      question: `Which approach is most effective when studying "${module.title}"?`,
      options: [
        { text: 'Reading through content once quickly', isCorrect: false },
        { text: 'Active practice combined with theoretical study', isCorrect: true },
        { text: 'Avoiding hands-on exercises', isCorrect: false },
        { text: 'Only watching video content', isCorrect: false }
      ],
      explanation: 'Active learning through practice and theoretical understanding leads to better retention and skill development.'
    },
    {
      question: `What should you focus on to master the concepts in "${module.title}"?`,
      options: [
        { text: 'Surface-level understanding only', isCorrect: false },
        { text: 'Deep comprehension and practical skills', isCorrect: true },
        { text: 'Memorization without application', isCorrect: false },
        { text: 'Speed over understanding', isCorrect: false }
      ],
      explanation: 'Mastery requires both deep understanding of concepts and the ability to apply them in practical scenarios.'
    },
    {
      question: `How does "${module.title}" connect to the overall course?`,
      options: [
        { text: 'It stands alone without connections', isCorrect: false },
        { text: 'It builds upon previous modules and prepares for next ones', isCorrect: true },
        { text: 'It only reviews old material', isCorrect: false },
        { text: 'It introduces unrelated concepts', isCorrect: false }
      ],
      explanation: 'Each module is designed to build upon previous knowledge while preparing students for more advanced topics.'
    },
    {
      question: `What is the best way to demonstrate understanding of "${module.title}"?`,
      options: [
        { text: 'Repeating definitions verbatim', isCorrect: false },
        { text: 'Applying concepts to solve real problems', isCorrect: true },
        { text: 'Avoiding practical exercises', isCorrect: false },
        { text: 'Only completing theoretical assessments', isCorrect: false }
      ],
      explanation: 'True understanding is demonstrated through the ability to apply learned concepts to solve real-world problems and challenges.'
    }
  ];

  return {
    title: `${module.title} - Assessment Quiz`,
    description: `Comprehensive quiz covering key concepts from ${module.title}`,
    questions: questionData,
    duration: 15,
    totalMarks: questionData.length * 2,
    passingMarks: Math.ceil(questionData.length * 0.6 * 2),
    difficulty: 'intermediate',
    tags: ['module-quiz', module.title.toLowerCase().replace(/\s+/g, '-')],
    isActive: true,
    course: courseId,
    createdBy: instructorId,
    moduleIndex: moduleIndex
  };
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const {
      category,
      level,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
      featured,
    } = req.query;

    // Build query
    let query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (featured) query.isFeatured = featured === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = {};
    if (sort === 'popular') sortOption = { enrolledStudents: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'price-low') sortOption = { price: 1 };
    else if (sort === 'price-high') sortOption = { price: -1 };
    else sortOption = { createdAt: -1 };

    // Pagination
    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      courses: courses,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
exports.createCourse = async (req, res, next) => {
  try {
    // Add instructor ID from logged-in user
    req.body.instructorId = req.user._id;

    const course = await Course.create(req.body);

    // Generate quizzes for each module if curriculum exists
    if (course.curriculum && course.curriculum.length > 0) {
      console.log(`🎯 Generating quizzes for course: ${course.title}`);
      
      for (let i = 0; i < course.curriculum.length; i++) {
        const module = course.curriculum[i];
        
        try {
          // Generate 3 dynamic AI-powered quizzes for each module
          console.log(`🤖 Generating AI-powered quizzes for module: ${module.title}`);
          
          const aiQuizzes = await dynamicQuizService.generateModuleQuizzes(
            course.title, 
            module.title, 
            module.description || ''
          );

          // Create Quiz documents for each AI-generated quiz
          const moduleQuizzes = [];
          for (let quizIndex = 0; quizIndex < aiQuizzes.length; quizIndex++) {
            const aiQuiz = aiQuizzes[quizIndex];
            
            const quizData = {
              title: aiQuiz.title,
              description: aiQuiz.description,
              questions: aiQuiz.questions,
              duration: 15, // 15 minutes per quiz
              difficulty: aiQuiz.difficulty || 'intermediate',
              course: course._id,
              createdBy: req.user._id,
              moduleIndex: i,
              moduleTitle: module.title,
              quizType: 'module',
              isActive: true,
              passingScore: 70,
              maxAttempts: 3,
              shuffleQuestions: false,
              shuffleOptions: false,
              showCorrectAnswers: true,
              showExplanations: true
            };
            
            const savedQuiz = await Quiz.create(quizData);
            moduleQuizzes.push(savedQuiz);
            
            console.log(`   ✅ Created ${aiQuiz.difficulty} quiz: ${aiQuiz.title}`);
          }

          // Add quiz recommendations to the module (use the first quiz as primary)
          if (moduleQuizzes.length > 0) {
            const primaryQuiz = moduleQuizzes[0];
            course.curriculum[i].quizRecommendation = {
              title: primaryQuiz.title,
              description: primaryQuiz.description,
              questionCount: primaryQuiz.questions.length,
              timeLimit: primaryQuiz.duration,
              difficulty: primaryQuiz.difficulty,
              topics: [module.title],
              questions: primaryQuiz.questions,
              totalQuizzes: moduleQuizzes.length,
              quizIds: moduleQuizzes.map(q => q._id)
            };
          }

          console.log(`   🎉 Successfully created ${aiQuizzes.length} AI quizzes for module: ${module.title}`);
          
        } catch (quizError) {
          console.error(`   ❌ Failed to create AI quizzes for module ${module.title}:`, quizError);
          
          // Fallback to traditional quiz generation
          try {
            const fallbackQuizData = generateModuleQuiz(module, i, course._id, req.user._id);
            const fallbackQuiz = await Quiz.create(fallbackQuizData);
            
            course.curriculum[i].quizRecommendation = {
              title: fallbackQuiz.title,
              description: fallbackQuiz.description,
              questionCount: fallbackQuiz.questions.length,
              timeLimit: fallbackQuiz.duration,
              difficulty: fallbackQuiz.difficulty,
              topics: [module.title],
              questions: fallbackQuiz.questions,
              totalQuizzes: 1,
              quizIds: [fallbackQuiz._id]
            };
            
            console.log(`   🔄 Created fallback quiz for module: ${module.title}`);
          } catch (fallbackError) {
            console.error(`   ❌ Failed to create fallback quiz for module ${module.title}:`, fallbackError);
          }
        }
      }
      
      // Save the updated course with quiz recommendations
      await course.save();
      console.log(`🎉 Successfully created course with ${course.curriculum.length} module quizzes`);
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Instructor)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course owner or admin
    if (
      course.instructorId &&
      course.instructorId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin/Instructor)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course owner or admin
    if (
      course.instructorId &&
      course.instructorId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private (Admin)
exports.getCourseStats = async (req, res, next) => {
  try {
    const totalCourses = await Course.countDocuments({ isPublished: true });
    const categoryCounts = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalStudents = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, total: { $sum: '$enrolledStudents' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        categoryCounts,
        totalEnrollments: totalStudents[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor/Admin)
exports.getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructorId: req.user._id })
      .select('title description category level price enrolledStudents rating isPublished createdAt curriculum')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor courses',
      error: error.message,
    });
  }
};
