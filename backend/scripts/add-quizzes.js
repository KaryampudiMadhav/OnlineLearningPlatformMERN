/**
 * Add Quizzes to Course Modules
 * This script adds comprehensive quizzes to each module in all courses
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');

// Quiz questions for different topics
const quizTemplates = {
  webDev: [
    {
      question: "What does HTML stand for?",
      type: "multiple-choice",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks Text Markup Language"],
      correctAnswer: 0,
      explanation: "HTML stands for Hyper Text Markup Language.",
      points: 1
    },
    {
      question: "Which CSS property controls text size?",
      type: "multiple-choice",
      options: ["font-weight", "text-size", "font-size", "text-style"],
      correctAnswer: 2,
      explanation: "The font-size property controls the size of text.",
      points: 1
    },
    {
      question: "JavaScript is a compiled language. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "JavaScript is an interpreted language, not compiled.",
      points: 1
    },
    {
      question: "Which keyword is used to declare a constant in JavaScript?",
      type: "multiple-choice",
      options: ["var", "let", "const", "constant"],
      correctAnswer: 2,
      explanation: "The 'const' keyword is used to declare constants in JavaScript.",
      points: 1
    },
    {
      question: "React uses a Virtual DOM. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "React uses a Virtual DOM for efficient UI updates.",
      points: 1
    }
  ],
  python: [
    {
      question: "Which of the following is used to define a function in Python?",
      type: "multiple-choice",
      options: ["function", "def", "func", "define"],
      correctAnswer: 1,
      explanation: "The 'def' keyword is used to define functions in Python.",
      points: 1
    },
    {
      question: "Python is an interpreted language. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "Python is an interpreted language.",
      points: 1
    },
    {
      question: "Which data structure is immutable in Python?",
      type: "multiple-choice",
      options: ["List", "Dictionary", "Tuple", "Set"],
      correctAnswer: 2,
      explanation: "Tuples are immutable in Python.",
      points: 1
    },
    {
      question: "Python uses indentation for code blocks. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "Python uses indentation to define code blocks.",
      points: 1
    },
    {
      question: "What is the output of: print(type([]))?",
      type: "multiple-choice",
      options: ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"],
      correctAnswer: 1,
      explanation: "[] creates an empty list, so the type is 'list'.",
      points: 1
    }
  ],
  marketing: [
    {
      question: "What does SEO stand for?",
      type: "multiple-choice",
      options: ["Social Engine Optimization", "Search Engine Optimization", "Secure Email Operation", "Site Enhancement Optimization"],
      correctAnswer: 1,
      explanation: "SEO stands for Search Engine Optimization.",
      points: 1
    },
    {
      question: "Content marketing focuses only on selling products. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "Content marketing focuses on providing value to attract and engage customers.",
      points: 1
    },
    {
      question: "Which metric measures cost per click in advertising?",
      type: "multiple-choice",
      options: ["CPM", "CPC", "CTR", "ROI"],
      correctAnswer: 1,
      explanation: "CPC (Cost Per Click) measures the cost for each click on an ad.",
      points: 1
    },
    {
      question: "Social media marketing can increase brand awareness. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "Social media marketing is effective for increasing brand awareness.",
      points: 1
    },
    {
      question: "What does CTR stand for in digital marketing?",
      type: "multiple-choice",
      options: ["Cost To Revenue", "Click Through Rate", "Customer Target Reach", "Content Time Ratio"],
      correctAnswer: 1,
      explanation: "CTR stands for Click Through Rate.",
      points: 1
    }
  ],
  design: [
    {
      question: "What does UX stand for?",
      type: "multiple-choice",
      options: ["User Exchange", "User Experience", "Universal Experience", "User Execution"],
      correctAnswer: 1,
      explanation: "UX stands for User Experience.",
      points: 1
    },
    {
      question: "Wireframes are high-fidelity design mockups. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "Wireframes are low-fidelity sketches, not high-fidelity mockups.",
      points: 1
    },
    {
      question: "Which principle refers to the visual weight of elements?",
      type: "multiple-choice",
      options: ["Contrast", "Balance", "Alignment", "Repetition"],
      correctAnswer: 1,
      explanation: "Balance refers to the distribution of visual weight in a design.",
      points: 1
    },
    {
      question: "Figma is a cloud-based design tool. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "Figma is a cloud-based collaborative design tool.",
      points: 1
    },
    {
      question: "What is the purpose of a design system?",
      type: "multiple-choice",
      options: ["To create random designs", "To maintain consistency", "To limit creativity", "To slow down development"],
      correctAnswer: 1,
      explanation: "Design systems help maintain consistency across products.",
      points: 1
    }
  ],
  dataScience: [
    {
      question: "What does ML stand for in data science?",
      type: "multiple-choice",
      options: ["Multiple Learning", "Machine Learning", "Manual Logic", "Model Linking"],
      correctAnswer: 1,
      explanation: "ML stands for Machine Learning.",
      points: 1
    },
    {
      question: "Supervised learning requires labeled data. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "Supervised learning algorithms require labeled training data.",
      points: 1
    },
    {
      question: "Which library is commonly used for data manipulation in Python?",
      type: "multiple-choice",
      options: ["TensorFlow", "Pandas", "Matplotlib", "Scikit-learn"],
      correctAnswer: 1,
      explanation: "Pandas is the primary library for data manipulation in Python.",
      points: 1
    },
    {
      question: "Neural networks are inspired by the human brain. True or False?",
      type: "true-false",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "Neural networks are modeled after biological neural networks in the brain.",
      points: 1
    },
    {
      question: "What is overfitting in machine learning?",
      type: "multiple-choice",
      options: ["Model works poorly on all data", "Model works too well on training data", "Model is too simple", "Model has no errors"],
      correctAnswer: 1,
      explanation: "Overfitting occurs when a model performs too well on training data but poorly on new data.",
      points: 1
    }
  ]
};

async function addQuizzesToCourses() {
  try {
    console.log('\n🎯 Adding Quizzes to Course Modules...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} courses\n`);

    for (const course of courses) {
      console.log(`   📖 Processing: "${course.title}"`);
      
      // Determine quiz template based on course category
      let quizTemplate;
      if (course.category === 'Web Development') {
        quizTemplate = quizTemplates.webDev;
      } else if (course.category === 'Data Science') {
        if (course.title.includes('Python')) {
          quizTemplate = quizTemplates.python;
        } else {
          quizTemplate = quizTemplates.dataScience;
        }
      } else if (course.category === 'Digital Marketing') {
        quizTemplate = quizTemplates.marketing;
      } else if (course.category === 'UI/UX Design') {
        quizTemplate = quizTemplates.design;
      } else {
        quizTemplate = quizTemplates.webDev; // Default
      }

      // Add quiz to each module in curriculum
      if (course.curriculum && course.curriculum.length > 0) {
        let quizCount = 0;
        course.curriculum = course.curriculum.map((module, index) => {
          // Only add quiz if not already present
          if (!module.quiz || !module.quiz.questions || module.quiz.questions.length === 0) {
            module.quiz = {
              title: `${module.title} - Assessment`,
              description: `Test your understanding of ${module.title}`,
              duration: 15,
              passingScore: 70,
              difficulty: course.level.toLowerCase(),
              questions: quizTemplate,
              isActive: true
            };
            quizCount++;
          }
          return module;
        });

        await course.save();
        console.log(`      ✅ Added ${quizCount} quizzes to ${course.curriculum.length} modules\n`);
      }
    }

    console.log('\n✅ All quizzes added successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Processed ${courses.length} courses`);
    console.log(`   - Added quizzes to all modules`);
    console.log(`   - Each quiz has 5 questions\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error adding quizzes:', error);
    process.exit(1);
  }
}

addQuizzesToCourses();
