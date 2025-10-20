const mongoose = require('mongoose');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const generateQuizForModule = (module, moduleIndex, courseId) => {
  const questionData = [
    {
      question: `What is the main focus of the module "${module.title}"?`,
      options: [
        { text: 'Understanding core concepts and fundamentals', isCorrect: true },
        { text: 'Advanced implementation details only', isCorrect: false },
        { text: 'Historical background information', isCorrect: false },
        { text: 'Unrelated supplementary topics', isCorrect: false }
      ],
      explanation: `This module "${module.title}" focuses on building a strong foundation through core concepts and practical understanding.`
    },
    {
      question: `Which approach is most effective for mastering the concepts in "${module.title}"?`,
      options: [
        { text: 'Memorization of definitions only', isCorrect: false },
        { text: 'Practical application combined with theory', isCorrect: true },
        { text: 'Skipping hands-on exercises', isCorrect: false },
        { text: 'Avoiding real-world examples', isCorrect: false }
      ],
      explanation: 'Combining theoretical knowledge with practical application ensures deeper understanding and better retention.'
    },
    {
      question: `What prerequisite knowledge is important for "${module.title}"?`,
      options: [
        { text: 'No prior knowledge needed', isCorrect: false },
        { text: 'Understanding of previous modules', isCorrect: true },
        { text: 'Advanced expertise required', isCorrect: false },
        { text: 'Only theoretical background', isCorrect: false }
      ],
      explanation: 'Each module builds upon previous knowledge, making it important to understand earlier concepts first.'
    },
    {
      question: `How should you approach learning "${module.title}" effectively?`,
      options: [
        { text: 'Read through content quickly', isCorrect: false },
        { text: 'Take detailed notes and practice regularly', isCorrect: true },
        { text: 'Skip practice exercises', isCorrect: false },
        { text: 'Focus only on memorization', isCorrect: false }
      ],
      explanation: 'Active learning through note-taking and regular practice leads to better comprehension and skill development.'
    },
    {
      question: `What is the expected outcome after completing "${module.title}"?`,
      options: [
        { text: 'Surface-level awareness only', isCorrect: false },
        { text: 'Practical skills and deep understanding', isCorrect: true },
        { text: 'Memorized facts without application', isCorrect: false },
        { text: 'Theoretical knowledge without practice', isCorrect: false }
      ],
      explanation: 'The goal is to achieve both practical skills and deep conceptual understanding that can be applied in real situations.'
    }
  ];

  return {
    title: `${module.title} - Module Quiz`,
    description: `Test your understanding of the key concepts covered in ${module.title}`,
    course: courseId,
    createdBy: courseId, // Use courseId as createdBy for now
    moduleIndex: moduleIndex,
    questions: questionData,
    duration: 15, // 15 minutes
    totalMarks: questionData.length * 2, // 2 marks per question
    passingMarks: Math.ceil(questionData.length * 0.6 * 2), // 60% to pass
    difficulty: 'intermediate',
    tags: ['module-quiz', module.title.toLowerCase().replace(/\s+/g, '-')],
    isActive: true
  };
};

const addQuizzesToCourses = async () => {
  try {
    console.log('🚀 Starting to add quizzes to courses...');
    
    // Get all courses
    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} courses`);

    for (const course of courses) {
      console.log(`\n📖 Processing course: ${course.title}`);
      
      if (!course.curriculum || course.curriculum.length === 0) {
        console.log(`⚠️  Course "${course.title}" has no curriculum modules, skipping...`);
        continue;
      }

      let quizzesCreated = 0;
      
      for (let i = 0; i < course.curriculum.length; i++) {
        const module = course.curriculum[i];
        
        // Check if quiz already exists for this module
        const existingQuiz = await Quiz.findOne({
          course: course._id,
          moduleIndex: i
        });

        if (existingQuiz) {
          console.log(`   ✅ Quiz already exists for module ${i + 1}: ${module.title}`);
          
          // Update module with quiz recommendation if not present
          if (!module.quizRecommendation) {
            module.quizRecommendation = {
              title: existingQuiz.title,
              description: existingQuiz.description,
              questionCount: existingQuiz.questions.length,
              timeLimit: existingQuiz.duration,
              difficulty: existingQuiz.difficulty,
              topics: [module.title],
              questions: existingQuiz.questions
            };
          }
          continue;
        }

        // Create quiz for this module
        const quizData = generateQuizForModule(module, i, course._id);
        const quiz = new Quiz(quizData);
        await quiz.save();
        
        // Add quiz recommendation to the module
        module.quizRecommendation = {
          title: quiz.title,
          description: quiz.description,
          questionCount: quiz.questions.length,
          timeLimit: quiz.duration,
          difficulty: quiz.difficulty,
          topics: [module.title],
          questions: quiz.questions
        };

        quizzesCreated++;
        console.log(`   🎯 Created quiz for module ${i + 1}: ${module.title}`);
      }

      // Save the updated course with quiz recommendations
      await course.save();
      console.log(`✅ Updated course "${course.title}" with ${quizzesCreated} new quizzes`);
    }

    console.log('\n🎉 Successfully added quizzes to all courses!');
    
    // Display summary
    const totalQuizzes = await Quiz.countDocuments();
    console.log(`📊 Total quizzes in database: ${totalQuizzes}`);
    
  } catch (error) {
    console.error('❌ Error adding quizzes to courses:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
addQuizzesToCourses();