const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const dynamicQuizService = require('../utils/dynamicQuizService');

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

    // If no curriculum provided, generate dynamic curriculum using AI
    if (!req.body.curriculum || req.body.curriculum.length === 0) {
      console.log(`🚀 Generating complete dynamic curriculum for course: ${req.body.title}`);
      
      try {
        const dynamicCurriculum = await dynamicQuizService.generateCompleteCurriculum(
          req.body.title,
          req.body.description,
          req.body.category,
          req.body.level
        );
        
        if (dynamicCurriculum && dynamicCurriculum.length > 0) {
          req.body.curriculum = dynamicCurriculum;
          console.log(`✅ Generated ${dynamicCurriculum.length} dynamic modules for course`);
        } else {
          console.log(`⚠️ No dynamic curriculum generated, proceeding with manual curriculum`);
        }
      } catch (curriculumError) {
        console.error('❌ Failed to generate dynamic curriculum:', curriculumError);
        console.log(`🔄 Proceeding with manual curriculum or empty curriculum`);
      }
    }

    const course = await Course.create(req.body);

    // Generate AI-powered quizzes for each module in the curriculum
    if (course.curriculum && course.curriculum.length > 0) {
      console.log(`🎯 Generating AI-powered quizzes for course: ${course.title}`);
      
      for (let i = 0; i < course.curriculum.length; i++) {
        const module = course.curriculum[i];
        
        try {
          console.log(`🤖 Generating AI-powered quizzes for module: ${module.title}`);
          
          // Generate AI-powered quiz for this module
          const aiQuizzes = await dynamicQuizService.generateModuleQuizzes(
            course.title, 
            module.title, 
            module.description || ''
          );

          if (aiQuizzes && aiQuizzes.length > 0) {
            // Use the intermediate-level quiz as the embedded quiz
            const primaryQuiz = aiQuizzes.find(q => q.difficulty === 'intermediate') || aiQuizzes[0];
            
            // Convert AI quiz format to embedded format
            const embeddedQuiz = {
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

            // Store the quiz directly in the curriculum
            course.curriculum[i].quiz = embeddedQuiz;
            
            console.log(`   ✅ Created AI-powered quiz for module: ${module.title}`);
          } else {
            throw new Error('No AI quizzes generated');
          }
            
        } catch (quizError) {
          console.error(`   ❌ Failed to generate AI quizzes for ${module.title}:`, quizError);
          
          // Fallback to enhanced template-based quiz
          console.log(`🔄 Using enhanced fallback quiz generation for: ${module.title}`);
          
          const fallbackQuizzes = dynamicQuizService.generateFallbackQuizzes(module.title);
          const fallbackQuiz = fallbackQuizzes.find(q => q.difficulty === 'beginner') || fallbackQuizzes[0];
          
          // Convert fallback quiz to embedded format
          const embeddedFallbackQuiz = {
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

          course.curriculum[i].quiz = embeddedFallbackQuiz;
          console.log(`   ✅ Created enhanced fallback quiz for module: ${module.title}`);
        }
      }
      
      // Save the updated course with embedded quizzes
      await course.save();
      console.log(`🎉 Successfully created course with ${course.curriculum.length} modules and AI-powered quizzes`);
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully with dynamic AI-generated content',
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
