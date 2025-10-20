/**
 * Complete Demo Environment Setup
 * Creates achievements, badges, enrollments, progress, and certificates
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const Certificate = require('../models/Certificate');
const Review = require('../models/Review');

// Achievement definitions
const achievements = [
  {
    name: 'First Steps',
    description: 'Completed your first lesson',
    icon: '🎯',
    category: 'course',
    points: 50,
    requirement: 'Complete 1 lesson'
  },
  {
    name: 'Knowledge Seeker',
    description: 'Completed 10 lessons',
    icon: '📚',
    category: 'course',
    points: 100,
    requirement: 'Complete 10 lessons'
  },
  {
    name: 'Learning Master',
    description: 'Completed 50 lessons',
    icon: '🎓',
    category: 'course',
    points: 500,
    requirement: 'Complete 50 lessons'
  },
  {
    name: 'Quiz Novice',
    description: 'Passed your first quiz',
    icon: '📝',
    category: 'quiz',
    points: 50,
    requirement: 'Pass 1 quiz'
  },
  {
    name: 'Quiz Expert',
    description: 'Passed 10 quizzes',
    icon: '✅',
    category: 'quiz',
    points: 200,
    requirement: 'Pass 10 quizzes'
  },
  {
    name: 'Perfect Score',
    description: 'Got 100% on a quiz',
    icon: '💯',
    category: 'quiz',
    points: 150,
    requirement: 'Score 100% on any quiz'
  },
  {
    name: 'Course Completer',
    description: 'Completed your first course',
    icon: '🏆',
    category: 'course',
    points: 300,
    requirement: 'Complete 1 full course'
  },
  {
    name: 'Dedicated Learner',
    description: 'Completed 3 courses',
    icon: '⭐',
    category: 'course',
    points: 1000,
    requirement: 'Complete 3 courses'
  },
  {
    name: 'Reviewer',
    description: 'Left your first review',
    icon: '💬',
    category: 'review',
    points: 30,
    requirement: 'Write 1 review'
  },
  {
    name: 'Helpful Critic',
    description: 'Left 5 helpful reviews',
    icon: '⭐⭐⭐⭐⭐',
    category: 'review',
    points: 100,
    requirement: 'Write 5 reviews'
  },
  {
    name: 'Consistent Learner',
    description: 'Learned for 7 days straight',
    icon: '🔥',
    category: 'streak',
    points: 200,
    requirement: '7 day streak'
  },
  {
    name: 'Dedication',
    description: 'Learned for 30 days straight',
    icon: '💪',
    category: 'streak',
    points: 500,
    requirement: '30 day streak'
  },
  {
    name: 'Level 10',
    description: 'Reached level 10',
    icon: '🎖️',
    category: 'level',
    points: 0,
    requirement: 'Reach level 10'
  },
  {
    name: 'Level 25',
    description: 'Reached level 25',
    icon: '🏅',
    category: 'level',
    points: 0,
    requirement: 'Reach level 25'
  },
  {
    name: 'Level 50',
    description: 'Reached level 50',
    icon: '👑',
    category: 'level',
    points: 0,
    requirement: 'Reach level 50'
  }
];

// Badge definitions
const badges = [
  {
    name: 'Early Bird',
    description: 'Joined the platform',
    icon: '🐦',
    category: 'general',
    rarity: 'common'
  },
  {
    name: 'Web Developer',
    description: 'Completed a Web Development course',
    icon: '💻',
    category: 'course',
    rarity: 'common'
  },
  {
    name: 'Python Expert',
    description: 'Completed a Python course',
    icon: '🐍',
    category: 'course',
    rarity: 'common'
  },
  {
    name: 'Marketing Guru',
    description: 'Completed a Digital Marketing course',
    icon: '📱',
    category: 'course',
    rarity: 'common'
  },
  {
    name: 'Designer',
    description: 'Completed a UI/UX Design course',
    icon: '🎨',
    category: 'course',
    rarity: 'common'
  },
  {
    name: 'Data Scientist',
    description: 'Completed a Data Science course',
    icon: '📊',
    category: 'course',
    rarity: 'rare'
  },
  {
    name: 'Speed Learner',
    description: 'Completed a course in record time',
    icon: '⚡',
    category: 'achievement',
    rarity: 'rare'
  },
  {
    name: 'Quiz Master',
    description: 'Perfect score on 5 quizzes',
    icon: '🎯',
    category: 'quiz',
    rarity: 'rare'
  },
  {
    name: 'Community Helper',
    description: 'Helped 10 fellow students',
    icon: '🤝',
    category: 'community',
    rarity: 'epic'
  },
  {
    name: 'Legendary Learner',
    description: 'Completed 10 courses',
    icon: '🌟',
    category: 'achievement',
    rarity: 'legendary'
  }
];

async function setupDemoEnvironment() {
  try {
    console.log('\n🚀 Setting Up Complete Demo Environment...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users and courses
    const students = await User.find({ role: 'student' });
    const courses = await Course.find({});
    const instructors = await User.find({ role: 'instructor' });

    console.log(`👥 Found ${students.length} students`);
    console.log(`📚 Found ${courses.length} courses`);
    console.log(`👨‍🏫 Found ${instructors.length} instructors\n`);

    // Create Achievements
    console.log('🏆 Creating Achievements...');
    await Achievement.deleteMany({});
    const createdAchievements = await Achievement.insertMany(achievements);
    console.log(`   ✅ Created ${createdAchievements.length} achievements\n`);

    // Create Badges
    console.log('🎖️  Creating Badges...');
    await Badge.deleteMany({});
    const createdBadges = await Badge.insertMany(badges);
    console.log(`   ✅ Created ${createdBadges.length} badges\n`);

    // Create Enrollments and Progress
    console.log('📝 Creating Enrollments and Progress...');
    await Enrollment.deleteMany({});
    await UserProgress.deleteMany({});

    let enrollmentCount = 0;
    let certificateCount = 0;

    for (const student of students) {
      // Enroll student in 2-3 random courses
      const numCourses = Math.floor(Math.random() * 2) + 2; // 2-3 courses
      const shuffledCourses = courses.sort(() => 0.5 - Math.random());
      const enrolledCourses = shuffledCourses.slice(0, numCourses);

      for (let i = 0; i < enrolledCourses.length; i++) {
        const course = enrolledCourses[i];
        const isCompleted = i === 0; // First course is completed
        const progress = isCompleted ? 100 : Math.floor(Math.random() * 60) + 20; // 20-80% for incomplete

        // Create enrollment
        const enrollment = await Enrollment.create({
          student: student._id,
          course: course._id,
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          progress: progress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null
        });

        enrollmentCount++;

        // Create user progress
        const completedLessons = [];
        const totalLessons = course.curriculum.reduce((acc, module) => acc + module.lessons.length, 0);
        const lessonsToComplete = Math.floor((progress / 100) * totalLessons);

        let lessonIndex = 0;
        for (const module of course.curriculum) {
          for (const lesson of module.lessons) {
            if (lessonIndex < lessonsToComplete) {
              completedLessons.push(lesson._id);
            }
            lessonIndex++;
          }
        }

        await UserProgress.create({
          user: student._id,
          course: course._id,
          completedLessons: completedLessons,
          lastAccessedLesson: completedLessons[completedLessons.length - 1],
          progress: progress,
          timeSpent: Math.floor(Math.random() * 1000) + 100
        });

        // Create certificate if completed
        if (isCompleted) {
          await Certificate.create({
            student: student._id,
            course: course._id,
            instructor: course.instructorId,
            certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            grade: ['A+', 'A', 'A-', 'B+'][Math.floor(Math.random() * 4)],
            completionDate: new Date(),
            issueDate: new Date()
          });
          certificateCount++;
        }
      }

      // Award some achievements and badges to each student
      const earnedAchievements = createdAchievements.slice(0, Math.floor(Math.random() * 5) + 3);
      const earnedBadges = createdBadges.slice(0, Math.floor(Math.random() * 4) + 2);

      // Update student's achievements and badges
      await User.findByIdAndUpdate(student._id, {
        achievements: earnedAchievements.map(a => a._id),
        badges: earnedBadges.map(b => b._id),
        xp: Math.floor(Math.random() * 2000) + 500,
        level: Math.floor(Math.random() * 10) + 1
      });
    }

    console.log(`   ✅ Created ${enrollmentCount} enrollments`);
    console.log(`   ✅ Created ${enrollmentCount} progress records`);
    console.log(`   ✅ Created ${certificateCount} certificates\n`);

    // Create Reviews
    console.log('⭐ Creating Reviews...');
    await Review.deleteMany({});
    let reviewCount = 0;

    const reviewTexts = [
      "Excellent course! Very comprehensive and well-structured.",
      "Great instructor, learned a lot. Highly recommended!",
      "Good content but could use more practical examples.",
      "Amazing course! Best investment in my learning journey.",
      "Clear explanations and great pacing. Love it!",
      "Very detailed and thorough. Worth every penny.",
      "Instructor is knowledgeable and explains concepts well.",
      "Good course for beginners. Easy to follow.",
      "Fantastic! I'm now confident in my skills.",
      "Well organized course with excellent resources."
    ];

    for (const course of courses) {
      const numReviews = Math.floor(Math.random() * 5) + 3; // 3-7 reviews per course
      
      for (let i = 0; i < numReviews && i < students.length; i++) {
        await Review.create({
          course: course._id,
          user: students[i]._id,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          helpful: Math.floor(Math.random() * 20)
        });
        reviewCount++;
      }

      // Update course ratings
      const courseReviews = await Review.find({ course: course._id });
      if (courseReviews.length > 0) {
        const avgRating = courseReviews.reduce((acc, r) => acc + r.rating, 0) / courseReviews.length;
        await Course.findByIdAndUpdate(course._id, {
          averageRating: parseFloat(avgRating.toFixed(1)),
          reviewCount: courseReviews.length
        });
      }
    }

    console.log(`   ✅ Created ${reviewCount} reviews\n`);

    console.log('✅ Demo Environment Setup Complete!\n');
    console.log('=' .repeat(60));
    console.log('\n📊 SUMMARY\n');
    console.log(`   Achievements: ${createdAchievements.length}`);
    console.log(`   Badges: ${createdBadges.length}`);
    console.log(`   Enrollments: ${enrollmentCount}`);
    console.log(`   Certificates: ${certificateCount}`);
    console.log(`   Reviews: ${reviewCount}`);
    console.log(`   Students with Progress: ${students.length}`);
    console.log('\n' + '='.repeat(60));

    // Print login credentials
    console.log('\n🔐 LOGIN CREDENTIALS\n');
    console.log('=' .repeat(60));
    
    console.log('\n👑 ADMIN:');
    console.log('   Email: admin@elearning.com');
    console.log('   Password: demo123');
    
    console.log('\n👨‍🏫 INSTRUCTORS:');
    for (const instructor of instructors) {
      console.log(`   Email: ${instructor.email}`);
      console.log(`   Password: demo123`);
      console.log(`   Name: ${instructor.name}`);
      console.log('   ---');
    }
    
    console.log('\n👨‍🎓 STUDENTS:');
    for (const student of students) {
      const userProgress = await UserProgress.find({ user: student._id });
      const enrollments = await Enrollment.find({ student: student._id });
      const completedCourses = enrollments.filter(e => e.completed).length;
      
      console.log(`   Email: ${student.email}`);
      console.log(`   Password: demo123`);
      console.log(`   Name: ${student.name}`);
      console.log(`   Enrolled Courses: ${enrollments.length}`);
      console.log(`   Completed: ${completedCourses}`);
      console.log(`   Level: ${student.level || 1}`);
      console.log(`   XP: ${student.xp || 0}`);
      console.log('   ---');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ ALL DONE! Your platform is ready! 🚀\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

setupDemoEnvironment();
