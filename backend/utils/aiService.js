const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (free tier)
let genAI = null;

const initializeAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
    console.warn('   AI features will use mock data. To enable AI:');
    console.warn('   1. Get free API key from: https://makersuite.google.com/app/apikey');
    console.warn('   2. Add GEMINI_API_KEY=your_key_here to .env file');
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Google Gemini AI initialized successfully (FREE tier)');
    return genAI;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    return null;
  }
};

// Generate quiz questions using AI
const generateQuizQuestions = async (topic, difficulty, questionCount, questionTypes) => {
  // If AI not initialized, fall back to mock data
  if (!genAI) {
    console.log('🔄 Using mock data (AI not configured)');
    return generateMockQuestions(topic, difficulty, questionCount, questionTypes);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Create ${questionCount} ${difficulty}-level quiz questions about "${topic}".

Requirements:
- Question types: ${questionTypes.join(', ')}
- Difficulty: ${difficulty}
- Format as valid JSON array
- Each question must have: question, type, options (array of {text, isCorrect}), explanation, points

Example format:
[
  {
    "question": "What is JavaScript?",
    "type": "multiple-choice",
    "options": [
      {"text": "Programming language", "isCorrect": true},
      {"text": "Database", "isCorrect": false},
      {"text": "Operating system", "isCorrect": false},
      {"text": "Hardware", "isCorrect": false}
    ],
    "explanation": "JavaScript is a programming language used for web development",
    "points": 1
  }
]

Topic: ${topic}
Difficulty: ${difficulty}
Generate exactly ${questionCount} questions now:`;

    console.log(`🤖 Generating ${questionCount} AI questions about "${topic}"...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let questions;
    try {
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.warn('⚠️  Failed to parse AI response, using mock data');
      return generateMockQuestions(topic, difficulty, questionCount, questionTypes);
    }

    // Validate and clean questions
    const validQuestions = questions.filter(q => 
      q.question && 
      q.options && 
      Array.isArray(q.options) && 
      q.options.length >= 2 &&
      q.options.some(opt => opt.isCorrect)
    ).slice(0, questionCount);

    if (validQuestions.length === 0) {
      console.warn('⚠️  No valid questions generated, using mock data');
      return generateMockQuestions(topic, difficulty, questionCount, questionTypes);
    }

    console.log(`✅ Generated ${validQuestions.length} AI questions successfully`);
    return validQuestions;

  } catch (error) {
    console.error('❌ AI generation failed:', error.message);
    console.log('🔄 Falling back to mock data');
    return generateMockQuestions(topic, difficulty, questionCount, questionTypes);
  }
};

// Generate course templates using AI
const generateCourseTemplate = async (category, level, duration) => {
  if (!genAI) {
    console.log('🔄 Using predefined template (AI not configured)');
    return generateMockTemplate(category, level, duration);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Create a comprehensive course template for "${category}" at ${level} level.

Requirements:
- Target Duration: ${duration} hours
- Level: ${level}
- Include 5-8 modules with lessons
- Each module should have 3-5 lessons
- Provide learning objectives, key topics, and quiz suggestions

Format as JSON:
{
  "title": "Course Title",
  "description": "Course description",
  "category": "${category}",
  "level": "${level}",
  "duration": "${Math.ceil(duration / 4)} weeks",
  "estimatedHours": ${duration},
  "curriculum": [
    {
      "title": "Module Title",
      "description": "Module description",
      "lessons": [
        {
          "title": "Lesson Title",
          "description": "Lesson description",
          "duration": 30,
          "objectives": ["Learning objective 1", "Learning objective 2"]
        }
      ],
      "quizSuggestion": "Quiz topic for this module"
    }
  ],
  "features": ["Feature 1", "Feature 2"],
  "prerequisites": ["Prerequisite 1"],
  "learningOutcomes": ["Outcome 1", "Outcome 2"]
}

Generate the template:`;

    console.log(`🤖 Generating ${category} course template (${level} level)...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let template;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        template = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.warn('⚠️  Failed to parse AI template response, using predefined template');
      return generateMockTemplate(category, level, duration);
    }

    // Ensure duration field exists
    if (!template.duration) {
      template.duration = `${Math.ceil(duration / 4)} weeks`;
    }

    console.log(`✅ Generated AI course template for ${category}`);
    return template;

  } catch (error) {
    console.error('❌ AI template generation failed:', error.message);
    console.log('🔄 Falling back to predefined template');
    return generateMockTemplate(category, level, duration);
  }
};

// NEW: Generate skills-based course with dynamic AI content
const generateSkillsBasedCourse = async (skills) => {
  if (!genAI) {
    console.log('🔄 AI not configured, cannot generate skills-based course');
    throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `Your task is to:
1. Analyze a list of technical skills: ${skills.map(s => `"${s}"`).join(', ')}.
2. For each skill, return:
   - difficulty: "beginner", "intermediate", or "advanced"
   - steps: A list of learning modules with:
     - step: A description of what the learner should do
     - resources: 3–5 helpful URLs (YouTube videos, articles, official docs, courses)
     - estimatedTime: Estimated time to complete the step (e.g., "2 hours", "1 week")
     - tags: Array of tags like ["project-based", "video", "course", "documentation"]
     - quiz: A short quiz (4–5 questions) for that module step. Each question must include:
        - question: The question text
        - options: Multiple choice options (array of 4 strings)
        - answer: Correct answer from options

🚨 IMPORTANT:
- Return ONLY raw JSON with the structure shown below
- DO NOT wrap output in markdown or code blocks
- Make sure JSON is parsable
- Each skill should have at least 5 modules (steps)
- Use REAL resource URLs from YouTube, official documentation, etc.

EXACT FORMAT:
[
  {
    "skill": "Skill name",
    "difficulty": "beginner",
    "steps": [
      {
        "step": "Learn basic syntax",
        "estimatedTime": "2 hours",
        "tags": ["video", "documentation"],
        "resources": [
          "https://youtube.com/watch?v=example1",
          "https://developer.mozilla.org/docs",
          "https://www.w3schools.com/tutorial"
        ],
        "quiz": [
          {
            "question": "What is the correct way to declare a variable?",
            "options": ["var myVar = 5;", "int myVar = 5;", "let myVar = five;", "variable myVar = 5;"],
            "answer": "var myVar = 5;"
          },
          {
            "question": "Another question here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A"
          }
        ]
      }
    ]
  }
]

Generate the course structure now:`;

    console.log(`🤖 Generating skills-based course for: ${skills.join(', ')}`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📝 Raw AI Response (first 500 chars):', text.substring(0, 500) + '...');
    
    // Parse JSON response - extract JSON array
    let courseData;
    try {
      // Remove markdown code blocks if present
      let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // Find JSON array
      const jsonMatch = cleanText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        courseData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON array found in response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError.message);
      console.log('Raw response:', text);
      throw new Error('Failed to parse AI-generated course structure');
    }

    // Validate structure
    if (!Array.isArray(courseData) || courseData.length === 0) {
      throw new Error('Invalid course data structure');
    }

    // Validate each skill
    for (const skillData of courseData) {
      if (!skillData.skill || !skillData.difficulty || !Array.isArray(skillData.steps)) {
        throw new Error(`Invalid skill data structure for ${skillData.skill || 'unknown'}`);
      }
      
      // Ensure at least 5 steps
      if (skillData.steps.length < 5) {
        console.warn(`⚠️  Skill "${skillData.skill}" has only ${skillData.steps.length} steps, expected at least 5`);
      }
    }

    console.log(`✅ Generated course structure for ${courseData.length} skills`);
    return courseData;

  } catch (error) {
    console.error('❌ Skills-based course generation failed:', error.message);
    throw error;
  }
};

// Mock question generator (fallback)
const generateMockQuestions = (topic, difficulty, count, types) => {
  const questionBank = {
    javascript: [
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
        question: 'JavaScript is a compiled language.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'JavaScript is an interpreted language, not compiled',
        points: 1
      }
    ],
    python: [
      {
        question: 'Which keyword is used to define a function in Python?',
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
    ],
    react: [
      {
        question: 'What does JSX stand for?',
        type: 'multiple-choice',
        options: [
          { text: 'JavaScript XML', isCorrect: true },
          { text: 'Java Syntax Extension', isCorrect: false },
          { text: 'JavaScript Extension', isCorrect: false },
          { text: 'JSON XML', isCorrect: false }
        ],
        explanation: 'JSX stands for JavaScript XML',
        points: 1
      }
    ]
  };

  const topicLower = topic.toLowerCase();
  let questions = questionBank[topicLower] || [
    {
      question: `What is the main concept in ${topic}?`,
      type: 'multiple-choice',
      options: [
        { text: 'Core principles', isCorrect: true },
        { text: 'Advanced techniques', isCorrect: false },
        { text: 'Basic syntax', isCorrect: false },
        { text: 'Complex algorithms', isCorrect: false }
      ],
      explanation: `Understanding core principles is fundamental in ${topic}`,
      points: 1
    }
  ];

  // Duplicate and modify questions to meet count
  const result = [];
  for (let i = 0; i < count; i++) {
    const baseQuestion = questions[i % questions.length];
    result.push({
      ...baseQuestion,
      question: `${baseQuestion.question} (Question ${i + 1})`
    });
  }

  return result;
};

// Mock template generator (fallback)
const generateMockTemplate = (category, level, duration) => {
  const templates = {
    'Web Development': {
      title: 'Complete Web Development Bootcamp',
      description: 'Master modern web development from HTML to full-stack applications',
      duration: '12 weeks',
      curriculum: [
        {
          title: 'HTML & CSS Fundamentals',
          description: 'Learn the building blocks of web development',
          lessons: [
            { title: 'HTML Structure', description: 'Understanding HTML elements and structure', duration: 45 },
            { title: 'CSS Styling', description: 'Styling web pages with CSS', duration: 60 },
            { title: 'Responsive Design', description: 'Making websites mobile-friendly', duration: 45 }
          ]
        },
        {
          title: 'JavaScript Basics',
          description: 'Programming fundamentals with JavaScript',
          lessons: [
            { title: 'Variables & Functions', description: 'JavaScript syntax and functions', duration: 60 },
            { title: 'DOM Manipulation', description: 'Interactive web pages', duration: 45 }
          ]
        }
      ]
    },
    'Data Science': {
      title: 'Data Science with Python',
      description: 'Complete guide to data science using Python',
      duration: '16 weeks',
      curriculum: [
        {
          title: 'Python Fundamentals',
          description: 'Learn Python programming basics',
          lessons: [
            { title: 'Python Syntax', description: 'Basic Python programming', duration: 60 },
            { title: 'Data Structures', description: 'Lists, dictionaries, and sets', duration: 45 }
          ]
        }
      ]
    }
  };

  return {
    ...templates[category] || templates['Web Development'],
    category,
    level,
    duration: `${Math.ceil(duration / 4)} weeks`, // Convert hours to weeks
    estimatedHours: duration,
    features: ['Interactive lessons', 'Practical projects', 'Quiz assessments', 'Certificate'],
    prerequisites: level === 'beginner' ? ['Basic computer skills'] : ['Programming basics'],
    learningOutcomes: ['Master core concepts', 'Build real projects', 'Industry-ready skills']
  };
};

module.exports = {
  initializeAI,
  generateQuizQuestions,
  generateCourseTemplate,
  generateSkillsBasedCourse
};