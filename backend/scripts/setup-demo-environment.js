/**
 * Complete Demo Environment Setup Script
 * 
 * This script:
 * 1. Clears all existing data (courses, users, enrollments, etc.)
 * 2. Creates sample users (students, instructors, admin)
 * 3. Generates 5 real courses using Gemini AI
 * 4. Creates enrollments with progress and completions
 * 5. Adds achievements, badges, and certificates
 * 
 * Usage: node scripts/setup-demo-environment.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const Certificate = require('../models/Certificate');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Review = require('../models/Review');
const DailyChallenge = require('../models/DailyChallenge');

const intelligentAIService = require('../utils/intelligentAIService');

// Demo credentials
const DEMO_PASSWORD = 'demo123';
const ADMIN_SECRET = 'admin2024secret';
const INSTRUCTOR_SECRET = 'instructor2024secret';

// Sample users data
const SAMPLE_USERS = {
  admin: {
    name: 'Admin User',
    email: 'admin@elearning.com',
    password: DEMO_PASSWORD,
    role: 'admin',
    secretCode: ADMIN_SECRET
  },
  instructors: [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@elearning.com',
      password: DEMO_PASSWORD,
      role: 'instructor',
      secretCode: INSTRUCTOR_SECRET,
      bio: 'Full-stack developer with 10+ years of experience in web technologies.'
    },
    {
      name: 'Prof. Michael Chen',
      email: 'michael.chen@elearning.com',
      password: DEMO_PASSWORD,
      role: 'instructor',
      secretCode: INSTRUCTOR_SECRET,
      bio: 'Data science expert and AI researcher with focus on machine learning.'
    }
  ],
  students: [
    {
      name: 'Alice Williams',
      email: 'alice@example.com',
      password: DEMO_PASSWORD,
      role: 'student'
    },
    {
      name: 'Bob Martinez',
      email: 'bob@example.com',
      password: DEMO_PASSWORD,
      role: 'student'
    },
    {
      name: 'Carol Davis',
      email: 'carol@example.com',
      password: DEMO_PASSWORD,
      role: 'student'
    },
    {
      name: 'David Brown',
      email: 'david@example.com',
      password: DEMO_PASSWORD,
      role: 'student'
    },
    {
      name: 'Emma Wilson',
      email: 'emma@example.com',
      password: DEMO_PASSWORD,
      role: 'student'
    }
  ]
};

// Courses to generate with Gemini
// NOTE: Starting with 1 course for testing, can add more later
// VALID CATEGORIES: 'Web Development', 'Data Science', 'Artificial Intelligence', 
// 'UI/UX Design', 'Digital Marketing', 'Mobile Development', 'Photography', 
// 'Music Production', 'Business', 'Other'
const COURSES_TO_CREATE = [
  {
    title: 'Complete JavaScript Mastery',
    description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, and modern frameworks',
    category: 'Web Development',  // Fixed: 'Programming' -> 'Web Development'
    level: 'Intermediate',
    price: 49.99,
    moduleCount: 3,  // Reduced to 3 modules for faster generation
    lessonsPerModule: 3,
    skills: ['JavaScript', 'ES6', 'Async/Await', 'DOM Manipulation']
  }
  // MORE COURSES CAN BE ADDED HERE LATER:
  // {
  //   title: 'Python for Data Science',
  //   description: 'Learn Python programming with focus on data analysis, visualization, and machine learning basics',
  //   category: 'Data Science',  // ✅ Valid category
  //   level: 'Beginner',
  //   price: 59.99,
  //   moduleCount: 3,
  //   lessonsPerModule: 3,
  //   skills: ['Python', 'Pandas', 'NumPy', 'Data Visualization']
  // },
  // {
  //   title: 'React Development Bootcamp',
  //   description: 'Build modern web applications with React, including hooks, state management, and best practices',
  //   category: 'Web Development',  // ✅ Valid category
  //   level: 'Intermediate',
  //   price: 69.99,
  //   moduleCount: 3,
  //   lessonsPerModule: 3,
  //   skills: ['React', 'Hooks', 'Redux', 'Component Design']
  // },
  // {
  //   title: 'Node.js Backend Development',
  //   description: 'Create scalable backend applications with Node.js, Express, MongoDB, and RESTful APIs',
  //   category: 'Web Development',  // ✅ Fixed: 'Backend Development' -> 'Web Development'
  //   level: 'Intermediate',
  //   price: 54.99,
  //   moduleCount: 3,
  //   lessonsPerModule: 3,
  //   skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs']
  // },
  // {
  //   title: 'Machine Learning Fundamentals',
  //   description: 'Introduction to machine learning concepts, algorithms, and practical applications',
  //   title: 'Machine Learning Fundamentals',
  //   description: 'Introduction to machine learning concepts, algorithms, and practical applications',
  //   category: 'Artificial Intelligence',
  //   level: 'Advanced',
  //   price: 79.99,
  //   moduleCount: 3,
  //   lessonsPerModule: 3,
  //   skills: ['Machine Learning', 'Algorithms', 'Python', 'TensorFlow']
  // }
];

async function clearDatabase() {
  console.log('\n🗑️  Clearing existing data...\n');
  
  await User.deleteMany({});
  console.log('   ✅ Users cleared');
  
  await Course.deleteMany({});
  console.log('   ✅ Courses cleared');
  
  await Enrollment.deleteMany({});
  console.log('   ✅ Enrollments cleared');
  
  await UserProgress.deleteMany({});
  console.log('   ✅ User progress cleared');
  
  await Achievement.deleteMany({});
  console.log('   ✅ Achievements cleared');
  
  await Badge.deleteMany({});
  console.log('   ✅ Badges cleared');
  
  await Certificate.deleteMany({});
  console.log('   ✅ Certificates cleared');
  
  await Quiz.deleteMany({});
  console.log('   ✅ Quizzes cleared');
  
  await QuizAttempt.deleteMany({});
  console.log('   ✅ Quiz attempts cleared');
  
  await Review.deleteMany({});
  console.log('   ✅ Reviews cleared');
  
  await DailyChallenge.deleteMany({});
  console.log('   ✅ Daily challenges cleared');
}

async function createUsers() {
  console.log('\n👥 Creating sample users...\n');
  
  const createdUsers = {
    admin: null,
    instructors: [],
    students: []
  };
  
  // Create admin
  const hashedPassword = await bcrypt.hash(SAMPLE_USERS.admin.password, 10);
  createdUsers.admin = await User.create({
    ...SAMPLE_USERS.admin,
    password: hashedPassword
  });
  console.log(`   ✅ Admin created: ${createdUsers.admin.email}`);
  
  // Create instructors
  for (const instructor of SAMPLE_USERS.instructors) {
    const hashedPassword = await bcrypt.hash(instructor.password, 10);
    const user = await User.create({
      ...instructor,
      password: hashedPassword
    });
    createdUsers.instructors.push(user);
    console.log(`   ✅ Instructor created: ${user.email}`);
  }
  
  // Create students
  for (const student of SAMPLE_USERS.students) {
    const hashedPassword = await bcrypt.hash(student.password, 10);
    const user = await User.create({
      ...student,
      password: hashedPassword
    });
    createdUsers.students.push(user);
    console.log(`   ✅ Student created: ${user.email}`);
  }
  
  return createdUsers;
}

async function generateCourseWithAI(courseConfig, instructorId, instructorName) {
  console.log(`\n   📚 Generating: "${courseConfig.title}"...`);
  
  try {
    // Step 1: Generate course outline
    const outline = await intelligentAIService.generateCourseOutline({
      title: courseConfig.title,
      description: courseConfig.description,
      category: courseConfig.category,
      level: courseConfig.level,
      moduleCount: courseConfig.moduleCount,
      skills: courseConfig.skills
    });
    
    console.log(`      ✓ Outline generated (${outline.modules.length} modules)`);
    
    // Step 2: Generate modules with lessons
    const generatedModules = [];
    for (let i = 0; i < outline.modules.length; i++) {
      const moduleOutline = outline.modules[i];
      
      try {
        console.log(`      📝 Generating module ${i + 1}/${outline.modules.length}: "${moduleOutline.title}"...`);
        
        const moduleContent = await intelligentAIService.generateModuleContent({
          title: moduleOutline.title,
          description: moduleOutline.description,
          lessonCount: courseConfig.lessonsPerModule,
          courseContext: {
            title: courseConfig.title,
            category: courseConfig.category,
            level: courseConfig.level
          }
        });
        
        generatedModules.push(moduleContent);
        console.log(`      ✅ Module ${i + 1}/${outline.modules.length}: ${moduleOutline.title} (${moduleContent.lessons?.length || 0} lessons)`);
      } catch (moduleError) {
        console.error(`      ❌ Failed to generate module "${moduleOutline.title}":`, moduleError.message);
        console.error(`      Full error:`, moduleError);
        throw moduleError;
      }
    }
    
    // Step 3: Create course in database
    const course = await Course.create({
      title: courseConfig.title,
      description: courseConfig.description,
      instructor: instructorName,
      instructorId: instructorId,
      category: courseConfig.category,
      level: courseConfig.level,
      price: courseConfig.price,
      duration: `${courseConfig.moduleCount * courseConfig.lessonsPerModule * 0.5} hours`,
      curriculum: generatedModules,
      isPublished: true,
      metadata: {
        aiGenerated: true,
        generationStatus: 'completed',
        requestedModules: courseConfig.moduleCount,
        modulesGenerated: generatedModules.length,
        progressPercentage: 100,
        skills: courseConfig.skills
      }
    });
    
    console.log(`      ✅ Course created: ${course._id}`);
    return course;
    
  } catch (error) {
    console.error(`      ❌ Failed to generate course: ${error.message}`);
    throw error;
  }
}

async function createEnrollmentsAndProgress(courses, students) {
  console.log('\n📝 Creating enrollments and progress...\n');
  
  const enrollments = [];
  
  // Enroll all students in all courses with varying progress
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    for (let j = 0; j < courses.length; j++) {
      const course = courses[j];
      
      // Determine completion status (some completed, some in progress)
      const isCompleted = (i + j) % 3 === 0; // 33% completion rate
      const progressPercentage = isCompleted ? 100 : Math.floor(Math.random() * 80) + 10;
      
      const enrollment = await Enrollment.create({
        user: student._id,  // Fixed: userId -> user
        course: course._id,  // Fixed: courseId -> course
        startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        progress: progressPercentage,
        status: isCompleted ? 'completed' : 'active',  // Fixed: 'in-progress' -> 'active'
        completedAt: isCompleted ? new Date() : null
      });
      
      enrollments.push(enrollment);
      
      if (isCompleted) {
        console.log(`   ✅ ${student.name} completed "${course.title}"`);
        
        // Create certificate for completed courses
        await Certificate.create({
          user: student._id,  // Fixed: userId -> user
          course: course._id,  // Fixed: courseId -> course
          issuedAt: new Date(),
          certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        });
      } else {
        console.log(`   📊 ${student.name} enrolled in "${course.title}" (${progressPercentage}%)`);
      }
    }
  }
  
  return enrollments;
}

async function createAchievementsAndBadges(students) {
  console.log('\n🏆 Creating achievements and badges...\n');
  
  const achievementTemplates = [
    { name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', points: 10 },
    { name: 'Course Completer', description: 'Complete your first course', icon: '✅', points: 50 },
    { name: 'Quiz Master', description: 'Score 100% on a quiz', icon: '🎓', points: 25 },
    { name: 'Dedicated Learner', description: 'Study for 7 days in a row', icon: '🔥', points: 30 },
    { name: 'Knowledge Seeker', description: 'Enroll in 5 courses', icon: '📚', points: 40 }
  ];
  
  const badgeTemplates = [
    { name: 'Bronze Badge', level: 'bronze', requiredPoints: 50, icon: '🥉' },
    { name: 'Silver Badge', level: 'silver', requiredPoints: 150, icon: '🥈' },
    { name: 'Gold Badge', level: 'gold', requiredPoints: 300, icon: '🥇' },
    { name: 'Platinum Badge', level: 'platinum', requiredPoints: 500, icon: '💎' }
  ];
  
  // Create achievements
  for (const template of achievementTemplates) {
    await Achievement.create(template);
  }
  console.log(`   ✅ Created ${achievementTemplates.length} achievement types`);
  
  // Create badges
  for (const template of badgeTemplates) {
    await Badge.create(template);
  }
  console.log(`   ✅ Created ${badgeTemplates.length} badge types`);
  
  // Award some achievements to students
  const achievements = await Achievement.find();
  for (const student of students) {
    const randomAchievements = achievements.slice(0, Math.floor(Math.random() * 3) + 1);
    
    for (const achievement of randomAchievements) {
      await Achievement.findByIdAndUpdate(achievement._id, {
        $addToSet: { earnedBy: student._id }
      });
    }
    
    console.log(`   🏅 Awarded ${randomAchievements.length} achievements to ${student.name}`);
  }
}

async function createReviews(courses, students) {
  console.log('\n⭐ Creating course reviews...\n');
  
  const reviewComments = [
    'Excellent course! Very well structured and easy to follow.',
    'Great instructor and comprehensive content. Highly recommended!',
    'This course helped me land my dream job. Thank you!',
    'Perfect for beginners. The explanations are crystal clear.',
    'Challenging but rewarding. Learned so much!',
    'Best course I\'ve taken on this platform. Worth every penny!',
    'Good content but could use more practical examples.',
    'Instructor is very knowledgeable and engaging.'
  ];
  
  for (const course of courses) {
    // Random number of reviews per course (2-4)
    const reviewCount = Math.floor(Math.random() * 3) + 2;
    const reviewers = students.slice(0, reviewCount);
    
    for (const student of reviewers) {
      const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
      
      await Review.create({
        courseId: course._id,
        userId: student._id,
        rating,
        comment,
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
      });
    }
    
    console.log(`   ✅ Added ${reviewCount} reviews for "${course.title}"`);
  }
}

async function main() {
  try {
    console.log('\n🚀 Starting Demo Environment Setup...\n');
    console.log('=' .repeat(60));
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Step 1: Clear existing data
    await clearDatabase();
    
    // Step 2: Create users
    const users = await createUsers();
    
    // Step 3: Generate courses with AI
    console.log('\n🤖 Generating courses with Gemini AI...');
    console.log('⏱️  This will take 2-3 minutes...\n');
    
    const courses = [];
    for (let i = 0; i < COURSES_TO_CREATE.length; i++) {
      const courseConfig = COURSES_TO_CREATE[i];
      const instructor = users.instructors[i % users.instructors.length];
      
      const course = await generateCourseWithAI(courseConfig, instructor._id, instructor.name);
      courses.push(course);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Step 4: Create enrollments and progress
    await createEnrollmentsAndProgress(courses, users.students);
    
    // Step 5: Create achievements and badges
    await createAchievementsAndBadges(users.students);
    
    // Step 6: Create reviews
    await createReviews(courses, users.students);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Demo Environment Setup Complete!\n');
    console.log('📊 Summary:');
    console.log(`   • Users: ${1 + users.instructors.length + users.students.length} total`);
    console.log(`     - 1 Admin`);
    console.log(`     - ${users.instructors.length} Instructors`);
    console.log(`     - ${users.students.length} Students`);
    console.log(`   • Courses: ${courses.length} (AI-generated)`);
    console.log(`   • Enrollments: ${users.students.length * courses.length}`);
    console.log(`   • Completed courses with certificates: ~${Math.floor(users.students.length * courses.length / 3)}`);
    console.log(`   • Achievements & Badges: Configured`);
    console.log(`   • Reviews: Added to all courses\n`);
    
    console.log('🔑 Demo Credentials:\n');
    console.log('   Admin:');
    console.log(`     Email: ${SAMPLE_USERS.admin.email}`);
    console.log(`     Password: ${DEMO_PASSWORD}`);
    console.log(`     Secret Code: ${ADMIN_SECRET}\n`);
    
    console.log('   Instructors:');
    SAMPLE_USERS.instructors.forEach(instructor => {
      console.log(`     Email: ${instructor.email}`);
      console.log(`     Password: ${DEMO_PASSWORD}`);
      console.log(`     Secret Code: ${INSTRUCTOR_SECRET}\n`);
    });
    
    console.log('   Students:');
    SAMPLE_USERS.students.forEach(student => {
      console.log(`     Email: ${student.email}`);
      console.log(`     Password: ${DEMO_PASSWORD}\n`);
    });
    
    console.log('=' + '='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
