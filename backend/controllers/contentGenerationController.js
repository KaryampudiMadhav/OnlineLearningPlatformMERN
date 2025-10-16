const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/bulk-imports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// @desc    Upload and process bulk quiz import
// @route   POST /api/content-generation/bulk-import-quizzes
// @access  Private (Instructor/Admin)
exports.bulkImportQuizzes = [
  upload.single('csvFile'),
  async (req, res) => {
    try {
      const { courseId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a CSV file'
        });
      }

      // Verify course exists and user is instructor
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to import quizzes for this course'
        });
      }

      const quizzes = [];
      const errors = [];
      let rowNumber = 0;

      // Process CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (row) => {
            rowNumber++;
            try {
              // Parse quiz data from CSV row
              const quiz = parseQuizFromCSV(row, courseId, req.user.id, course);
              if (quiz) {
                quizzes.push(quiz);
              }
            } catch (error) {
              errors.push(`Row ${rowNumber}: ${error.message}`);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Create quizzes in database
      const createdQuizzes = [];
      for (const quizData of quizzes) {
        try {
          const quiz = await Quiz.create(quizData);
          createdQuizzes.push(quiz);
        } catch (error) {
          errors.push(`Failed to create quiz "${quizData.title}": ${error.message}`);
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        message: `Successfully imported ${createdQuizzes.length} quizzes`,
        data: {
          imported: createdQuizzes.length,
          errors: errors.length,
          errorDetails: errors.slice(0, 10), // Limit error details
          quizzes: createdQuizzes.map(q => ({
            id: q._id,
            title: q.title,
            questionCount: q.questions.length
          }))
        }
      });

    } catch (error) {
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error('Bulk import error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import quizzes',
        error: error.message
      });
    }
  }
];

// Helper function to parse quiz from CSV row
const parseQuizFromCSV = (row, courseId, createdBy, course) => {
  // Expected CSV format:
  // quizTitle, quizType, moduleIndex, lessonIndex, duration, passingScore, questionText, questionType, option1, option2, option3, option4, correctAnswer, explanation, points

  const {
    quizTitle,
    quizType = 'course',
    moduleIndex,
    lessonIndex,
    duration = 30,
    passingScore = 70,
    questionText,
    questionType = 'multiple-choice',
    option1,
    option2,
    option3,
    option4,
    correctAnswer,
    explanation = '',
    points = 1
  } = row;

  if (!quizTitle || !questionText) {
    throw new Error('Quiz title and question text are required');
  }

  // Validate module/lesson indices
  let moduleTitle = null;
  let lessonTitle = null;
  
  if (quizType === 'module' && moduleIndex !== undefined) {
    const modIndex = parseInt(moduleIndex);
    if (!course.curriculum || !course.curriculum[modIndex]) {
      throw new Error(`Invalid module index: ${moduleIndex}`);
    }
    moduleTitle = course.curriculum[modIndex].title;
  }
  
  if (quizType === 'lesson' && moduleIndex !== undefined && lessonIndex !== undefined) {
    const modIndex = parseInt(moduleIndex);
    const lessIndex = parseInt(lessonIndex);
    if (!course.curriculum || 
        !course.curriculum[modIndex] || 
        !course.curriculum[modIndex].lessons ||
        !course.curriculum[modIndex].lessons[lessIndex]) {
      throw new Error(`Invalid lesson index: ${moduleIndex}.${lessonIndex}`);
    }
    moduleTitle = course.curriculum[modIndex].title;
    lessonTitle = course.curriculum[modIndex].lessons[lessIndex].title;
  }

  // Build options array
  const options = [];
  if (option1) options.push({ text: option1, isCorrect: correctAnswer === '1' || correctAnswer === option1 });
  if (option2) options.push({ text: option2, isCorrect: correctAnswer === '2' || correctAnswer === option2 });
  if (option3) options.push({ text: option3, isCorrect: correctAnswer === '3' || correctAnswer === option3 });
  if (option4) options.push({ text: option4, isCorrect: correctAnswer === '4' || correctAnswer === option4 });

  // Ensure at least one correct answer
  if (!options.some(opt => opt.isCorrect)) {
    throw new Error('No correct answer specified');
  }

  return {
    course: courseId,
    quizType,
    moduleIndex: moduleIndex !== undefined ? parseInt(moduleIndex) : undefined,
    moduleTitle,
    lessonIndex: lessonIndex !== undefined ? parseInt(lessonIndex) : undefined,
    lessonTitle,
    title: quizTitle,
    duration: parseInt(duration),
    passingScore: parseInt(passingScore),
    questions: [{
      question: questionText,
      type: questionType,
      options,
      explanation,
      points: parseInt(points)
    }],
    createdBy
  };
};

// @desc    Generate course template
// @route   POST /api/content-generation/course-template
// @access  Private (Instructor/Admin)
exports.generateCourseTemplate = async (req, res) => {
  try {
    const { templateType, customization } = req.body;
    
    const templates = {
      'web-development': {
        title: 'Web Development Fundamentals',
        description: 'Complete course covering modern web development from basics to advanced concepts',
        category: 'Web Development',
        level: 'Beginner',
        duration: '12 weeks',
        curriculum: [
          {
            title: 'HTML Fundamentals',
            description: 'Learn the building blocks of web pages',
            duration: '2 weeks',
            lessons: [
              { title: 'HTML Structure and Syntax', duration: '45 min', content: 'Basic HTML structure, tags, and attributes' },
              { title: 'Forms and Input Elements', duration: '60 min', content: 'Creating interactive forms' },
              { title: 'Semantic HTML', duration: '45 min', content: 'Using semantic elements for better structure' }
            ]
          },
          {
            title: 'CSS Styling',
            description: 'Style your web pages with CSS',
            duration: '3 weeks',
            lessons: [
              { title: 'CSS Selectors and Properties', duration: '60 min', content: 'Basic styling techniques' },
              { title: 'Flexbox Layout', duration: '75 min', content: 'Modern layout with flexbox' },
              { title: 'CSS Grid', duration: '75 min', content: 'Advanced layouts with CSS Grid' },
              { title: 'Responsive Design', duration: '90 min', content: 'Making websites mobile-friendly' }
            ]
          },
          {
            title: 'JavaScript Programming',
            description: 'Add interactivity with JavaScript',
            duration: '4 weeks',
            lessons: [
              { title: 'JavaScript Basics', duration: '60 min', content: 'Variables, functions, and control flow' },
              { title: 'DOM Manipulation', duration: '75 min', content: 'Interacting with HTML elements' },
              { title: 'Event Handling', duration: '60 min', content: 'Responding to user interactions' },
              { title: 'Async JavaScript', duration: '90 min', content: 'Promises, async/await, and fetch API' }
            ]
          },
          {
            title: 'Modern Frameworks',
            description: 'Introduction to React and modern development',
            duration: '3 weeks',
            lessons: [
              { title: 'React Basics', duration: '90 min', content: 'Components, props, and state' },
              { title: 'React Hooks', duration: '75 min', content: 'useState, useEffect, and custom hooks' },
              { title: 'Building a Project', duration: '120 min', content: 'Complete React application' }
            ]
          }
        ],
        suggestedQuizzes: [
          { title: 'HTML Fundamentals Quiz', moduleIndex: 0, quizType: 'module', duration: 20, questions: 10 },
          { title: 'CSS Basics Quiz', moduleIndex: 1, quizType: 'module', duration: 25, questions: 12 },
          { title: 'JavaScript Quiz', moduleIndex: 2, quizType: 'module', duration: 30, questions: 15 },
          { title: 'React Fundamentals', moduleIndex: 3, quizType: 'module', duration: 25, questions: 10 },
          { title: 'Final Assessment', quizType: 'course', duration: 60, questions: 40 }
        ]
      },
      'data-science': {
        title: 'Data Science with Python',
        description: 'Comprehensive data science course using Python and popular libraries',
        category: 'Data Science',
        level: 'Intermediate',
        duration: '16 weeks',
        curriculum: [
          {
            title: 'Python for Data Science',
            description: 'Python fundamentals and data science libraries',
            duration: '4 weeks',
            lessons: [
              { title: 'Python Basics Review', duration: '60 min' },
              { title: 'NumPy for Numerical Computing', duration: '90 min' },
              { title: 'Pandas for Data Manipulation', duration: '120 min' },
              { title: 'Matplotlib and Seaborn Visualization', duration: '90 min' }
            ]
          },
          {
            title: 'Data Analysis and Statistics',
            description: 'Statistical concepts and exploratory data analysis',
            duration: '4 weeks',
            lessons: [
              { title: 'Descriptive Statistics', duration: '75 min' },
              { title: 'Probability Distributions', duration: '90 min' },
              { title: 'Hypothesis Testing', duration: '105 min' },
              { title: 'Correlation and Regression', duration: '90 min' }
            ]
          },
          {
            title: 'Machine Learning Fundamentals',
            description: 'Introduction to machine learning algorithms',
            duration: '6 weeks',
            lessons: [
              { title: 'Supervised Learning Overview', duration: '75 min' },
              { title: 'Linear and Logistic Regression', duration: '120 min' },
              { title: 'Decision Trees and Random Forest', duration: '105 min' },
              { title: 'Support Vector Machines', duration: '90 min' },
              { title: 'Clustering Algorithms', duration: '90 min' },
              { title: 'Model Evaluation and Validation', duration: '120 min' }
            ]
          },
          {
            title: 'Advanced Topics and Projects',
            description: 'Deep learning basics and capstone project',
            duration: '2 weeks',
            lessons: [
              { title: 'Introduction to Neural Networks', duration: '105 min' },
              { title: 'Capstone Project', duration: '180 min' }
            ]
          }
        ],
        suggestedQuizzes: [
          { title: 'Python & Libraries Quiz', moduleIndex: 0, quizType: 'module', duration: 30 },
          { title: 'Statistics Quiz', moduleIndex: 1, quizType: 'module', duration: 35 },
          { title: 'Machine Learning Quiz', moduleIndex: 2, quizType: 'module', duration: 45 },
          { title: 'Data Science Final Exam', quizType: 'course', duration: 90 }
        ]
      }
    };

    let template = templates[templateType];
    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template type',
        availableTemplates: Object.keys(templates)
      });
    }

    // Apply customization if provided
    if (customization) {
      template = { ...template, ...customization };
      if (customization.instructor) {
        template.instructor = customization.instructor;
        template.instructorId = req.user.id;
      }
    }

    // Set default instructor info
    template.instructor = template.instructor || req.user.name;
    template.instructorId = req.user.id;

    res.status(200).json({
      success: true,
      message: 'Course template generated successfully',
      template
    });

  } catch (error) {
    console.error('Generate course template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate course template',
      error: error.message
    });
  }
};

// @desc    Auto-generate quiz questions using AI (basic implementation)
// @route   POST /api/content-generation/auto-generate-quiz
// @access  Private (Instructor/Admin)
exports.autoGenerateQuiz = async (req, res) => {
  try {
    const { 
      courseId, 
      topic, 
      difficulty = 'intermediate', 
      questionCount = 10, 
      questionTypes = ['multiple-choice'],
      moduleIndex,
      lessonIndex 
    } = req.body;

    // Verify course access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate quizzes for this course'
      });
    }

    // Basic AI-like question generation (would integrate with OpenAI API in production)
    const generatedQuestions = generateQuestionsForTopic(topic, difficulty, questionCount, questionTypes);

    // Determine quiz placement
    let quizType = 'course';
    let moduleTitle = null;
    let lessonTitle = null;

    if (typeof moduleIndex === 'number') {
      quizType = 'module';
      if (course.curriculum && course.curriculum[moduleIndex]) {
        moduleTitle = course.curriculum[moduleIndex].title;
        
        if (typeof lessonIndex === 'number' && course.curriculum[moduleIndex].lessons && course.curriculum[moduleIndex].lessons[lessonIndex]) {
          quizType = 'lesson';
          lessonTitle = course.curriculum[moduleIndex].lessons[lessonIndex].title;
        }
      }
    }

    const quizData = {
      course: courseId,
      quizType,
      moduleIndex,
      moduleTitle,
      lessonIndex,
      lessonTitle,
      title: `${topic} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
      description: `Auto-generated quiz covering ${topic} concepts`,
      duration: Math.max(15, questionCount * 1.5), // 1.5 minutes per question minimum
      passingScore: 70,
      questions: generatedQuestions,
      createdBy: req.user.id
    };

    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        questionCount: quiz.questions.length,
        duration: quiz.duration,
        quizType: quiz.quizType
      }
    });

  } catch (error) {
    console.error('Auto-generate quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
};

// Basic question generation (would use AI service in production)
const generateQuestionsForTopic = (topic, difficulty, count, types) => {
  // This is a simplified example - in production, you'd use OpenAI API or similar
  const questionBank = {
    'javascript': [
      {
        question: 'Which keyword is used to declare a variable in JavaScript ES6?',
        type: 'multiple-choice',
        options: [
          { text: 'var', isCorrect: false },
          { text: 'let', isCorrect: true },
          { text: 'const', isCorrect: false },
          { text: 'variable', isCorrect: false }
        ],
        explanation: 'let is used to declare block-scoped variables in ES6',
        points: 1
      },
      {
        question: 'What does JSON stand for?',
        type: 'multiple-choice',
        options: [
          { text: 'JavaScript Object Notation', isCorrect: true },
          { text: 'Java Serialized Object Network', isCorrect: false },
          { text: 'JavaScript Online Network', isCorrect: false },
          { text: 'Java Object Notation', isCorrect: false }
        ],
        explanation: 'JSON stands for JavaScript Object Notation',
        points: 1
      }
    ],
    'python': [
      {
        question: 'Which of the following is used to create a function in Python?',
        type: 'multiple-choice',
        options: [
          { text: 'function', isCorrect: false },
          { text: 'def', isCorrect: true },
          { text: 'func', isCorrect: false },
          { text: 'define', isCorrect: false }
        ],
        explanation: 'def keyword is used to define functions in Python',
        points: 1
      }
    ]
  };

  const topicLower = topic.toLowerCase();
  let availableQuestions = questionBank[topicLower] || [];
  
  // If no specific questions, generate generic ones
  if (availableQuestions.length === 0) {
    availableQuestions = [
      {
        question: `What is a key concept in ${topic}?`,
        type: 'multiple-choice',
        options: [
          { text: 'Basic understanding', isCorrect: true },
          { text: 'Advanced techniques', isCorrect: false },
          { text: 'Expert knowledge', isCorrect: false },
          { text: 'Theoretical concepts', isCorrect: false }
        ],
        explanation: `Understanding basic concepts is fundamental in ${topic}`,
        points: 1
      }
    ];
  }

  // Return up to requested count, repeating if necessary
  const questions = [];
  for (let i = 0; i < count; i++) {
    const questionIndex = i % availableQuestions.length;
    questions.push({ ...availableQuestions[questionIndex] });
  }

  return questions;
};

// @desc    Get available course templates
// @route   GET /api/content-generation/templates
// @access  Private (Instructor/Admin)
exports.getAvailableTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'web-development',
        title: 'Web Development Fundamentals',
        description: 'Complete web development course with HTML, CSS, JavaScript, and React',
        category: 'Web Development',
        level: 'Beginner',
        duration: '12 weeks',
        moduleCount: 4,
        estimatedHours: 48,
        topics: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design']
      },
      {
        id: 'data-science',
        title: 'Data Science with Python',
        description: 'Comprehensive data science course covering Python, statistics, and machine learning',
        category: 'Data Science',
        level: 'Intermediate',
        duration: '16 weeks',
        moduleCount: 4,
        estimatedHours: 64,
        topics: ['Python', 'NumPy', 'Pandas', 'Statistics', 'Machine Learning', 'Data Visualization']
      },
      {
        id: 'digital-marketing',
        title: 'Digital Marketing Mastery',
        description: 'Complete digital marketing course covering SEO, social media, and analytics',
        category: 'Digital Marketing',
        level: 'Beginner',
        duration: '10 weeks',
        moduleCount: 5,
        estimatedHours: 40,
        topics: ['SEO', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Analytics']
      },
      {
        id: 'business-fundamentals',
        title: 'Business Fundamentals',
        description: 'Essential business concepts for entrepreneurs and professionals',
        category: 'Business',
        level: 'Beginner',
        duration: '8 weeks',
        moduleCount: 4,
        estimatedHours: 32,
        topics: ['Business Strategy', 'Finance', 'Marketing', 'Operations', 'Leadership']
      }
    ];

    res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

module.exports = {
  bulkImportQuizzes: exports.bulkImportQuizzes,
  generateCourseTemplate: exports.generateCourseTemplate,
  autoGenerateQuiz: exports.autoGenerateQuiz,
  getAvailableTemplates: exports.getAvailableTemplates
};