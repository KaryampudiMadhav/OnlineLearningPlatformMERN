const Course = require('../models/Course');
const dynamicQuizService = require('../utils/dynamicQuizService');

// @desc    Generate skills-based curriculum using Gemini AI
// @route   POST /api/courses/generate-skills-curriculum
// @access  Private (Admin/Instructor)
exports.generateSkillsCurriculum = async (req, res, next) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of skills to generate curriculum',
      });
    }

    console.log(`🎯 Generating AI-powered curriculum for skills: ${skills.join(', ')}`);

    // Generate complete skills-based curriculum with quizzes using Gemini AI
    const skillsCurriculum = await dynamicQuizService.generateSkillsBasedCurriculum(skills);

    res.status(200).json({
      success: true,
      message: 'Skills-based curriculum generated successfully',
      data: skillsCurriculum,
    });
  } catch (error) {
    console.error('❌ Error generating skills curriculum:', error);
    next(error);
  }
};

// @desc    Create new skills-based course with AI-generated content
// @route   POST /api/courses/create-skills-course
// @access  Private (Admin/Instructor)
exports.createSkillsCourse = async (req, res, next) => {
  try {
    const { title, description, category, level, price, duration, skills } = req.body;

    // Validate required fields
    if (!title || !description || !category || !skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and at least one skill',
      });
    }

    // Add instructor ID from logged-in user
    const courseData = {
      title,
      description,
      instructor: req.user.name || req.user.email,
      instructorId: req.user._id,
      category,
      level: level || 'Beginner',
      price: price || 0,
      duration: duration || 'Self-paced',
      skills: [], // Will be populated with AI-generated content
    };

    console.log(`🚀 Creating skills-based course: ${title}`);
    console.log(`🎯 Generating AI curriculum for skills: ${skills.join(', ')}`);

    // Generate complete skills-based curriculum with quizzes using Gemini AI
    const skillsCurriculum = await dynamicQuizService.generateSkillsBasedCurriculum(skills);

    if (skillsCurriculum && skillsCurriculum.length > 0) {
      courseData.skills = skillsCurriculum;
      console.log(`✅ Generated curriculum for ${skillsCurriculum.length} skills with modules and quizzes`);
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate skills curriculum. Please try again.',
      });
    }

    // Create the course with AI-generated skills curriculum
    const course = await Course.create(courseData);

    console.log(`🎉 Successfully created skills-based course: ${course.title}`);

    res.status(201).json({
      success: true,
      message: 'Skills-based course created successfully with AI-generated content',
      data: course,
    });
  } catch (error) {
    console.error('❌ Error creating skills-based course:', error);
    next(error);
  }
};

// @desc    Get all courses (supports both legacy and skills-based)
// @route   GET /api/courses/skills
// @access  Public
exports.getSkillsCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ 
      skills: { $exists: true, $ne: [] },
      isPublished: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('❌ Error fetching skills-based courses:', error);
    next(error);
  }
};
