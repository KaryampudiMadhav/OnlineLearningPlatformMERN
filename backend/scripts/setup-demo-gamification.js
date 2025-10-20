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

async function setupDemoEnvironment() {
  try {
    console.log('🚀 Setting Up Complete Demo Environment...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get users
    const students = await User.find({ role: 'student' });
    const courses = await Course.find();
    const instructors = await User.find({ role: 'instructor' });

    console.log(`👥 Found ${students.length} students`);
    console.log(`📚 Found ${courses.length} courses`);
    console.log(`👨‍🏫 Found ${instructors.length} instructors\n`);

    // ===== CREATE ACHIEVEMENTS =====
    console.log('🏆 Creating Achievements...');
    
    const achievementsData = [
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👣',
        color: '#10B981',
        category: 'learning',
        type: 'milestone',
        requirements: [{ metric: 'lessonsCompleted', operator: '>=', value: 1 }],
        rewards: { xp: 50 }
      },
      {
        name: 'Knowledge Seeker',
        description: 'Complete 5 lessons',
        icon: '📚',
        color: '#3B82F6',
        category: 'learning',
        type: 'milestone',
        requirements: [{ metric: 'lessonsCompleted', operator: '>=', value: 5 }],
        rewards: { xp: 100 }
      },
      {
        name: 'Quiz Expert',
        description: 'Pass 3 quizzes with 80% or higher',
        icon: '🎯',
        color: '#8B5CF6',
        category: 'mastery',
        type: 'milestone',
        requirements: [{ metric: 'quizzesPassed', operator: '>=', value: 3 }],
        rewards: { xp: 200 }
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '💯',
        color: '#EF4444',
        category: 'mastery',
        type: 'challenge',
        requirements: [{ metric: 'perfectQuizzes', operator: '>=', value: 1 }],
        rewards: { xp: 150 }
      },
      {
        name: 'Course Completer',
        description: 'Complete your first course',
        icon: '🎓',
        color: '#F59E0B',
        category: 'learning',
        type: 'milestone',
        requirements: [{ metric: 'coursesCompleted', operator: '>=', value: 1 }],
        rewards: { xp: 500 }
      },
      {
        name: 'Learning Master',
        description: 'Complete 3 courses',
        icon: '🏆',
        color: '#FFD700',
        category: 'mastery',
        type: 'milestone',
        requirements: [{ metric: 'coursesCompleted', operator: '>=', value: 3 }],
        rewards: { xp: 1000 }
      },
      {
        name: 'Early Bird',
        description: 'Complete a lesson before 9 AM',
        icon: '🌅',
        color: '#06B6D4',
        category: 'dedication',
        type: 'challenge',
        requirements: [{ metric: 'earlyBirdLessons', operator: '>=', value: 1 }],
        rewards: { xp: 75 }
      },
      {
        name: 'Night Owl',
        description: 'Complete a lesson after 10 PM',
        icon: '🦉',
        color: '#6366F1',
        category: 'dedication',
        type: 'challenge',
        requirements: [{ metric: 'nightOwlLessons', operator: '>=', value: 1 }],
        rewards: { xp: 75 }
      },
      {
        name: 'Consistent Learner',
        description: 'Study 5 days in a row',
        icon: '📅',
        color: '#14B8A6',
        category: 'dedication',
        type: 'milestone',
        requirements: [{ metric: 'currentStreak', operator: '>=', value: 5 }],
        rewards: { xp: 300 }
      },
      {
        name: 'Marathon Runner',
        description: 'Study for 30 days straight',
        icon: '🔥',
        color: '#DC2626',
        category: 'dedication',
        type: 'milestone',
        requirements: [{ metric: 'currentStreak', operator: '>=', value: 30 }],
        rewards: { xp: 1500 }
      },
      {
        name: 'Fast Learner',
        description: 'Complete a course in less than a week',
        icon: '⚡',
        color: '#F59E0B',
        category: 'exploration',
        type: 'challenge',
        requirements: [{ metric: 'fastCompletions', operator: '>=', value: 1 }],
        rewards: { xp: 400 }
      },
      {
        name: 'Social Butterfly',
        description: 'Leave 5 course reviews',
        icon: '🦋',
        color: '#EC4899',
        category: 'social',
        type: 'milestone',
        requirements: [{ metric: 'reviewsLeft', operator: '>=', value: 5 }],
        rewards: { xp: 200 }
      },
      {
        name: 'Community Helper',
        description: 'Have 10 helpful reviews',
        icon: '🤝',
        color: '#10B981',
        category: 'social',
        type: 'milestone',
        requirements: [{ metric: 'helpfulReviews', operator: '>=', value: 10 }],
        rewards: { xp: 500 }
      },
      {
        name: 'Rising Star',
        description: 'Earn 1000 XP',
        icon: '⭐',
        color: '#FCD34D',
        category: 'exploration',
        type: 'milestone',
        requirements: [{ metric: 'totalXP', operator: '>=', value: 1000 }],
        rewards: { xp: 100 }
      },
      {
        name: 'Legend',
        description: 'Earn 5000 XP',
        icon: '👑',
        color: '#9333EA',
        category: 'mastery',
        type: 'milestone',
        requirements: [{ metric: 'totalXP', operator: '>=', value: 5000 }],
        rewards: { xp: 500 }
      }
    ];

    // Clear existing achievements
    await Achievement.deleteMany({});
    
    const createdAchievements = await Achievement.insertMany(achievementsData);
    console.log(`✅ Created ${createdAchievements.length} achievements\n`);

    // ===== CREATE BADGES =====
    console.log('🎖️ Creating Badges...');
    
    const badgesData = [
      {
        name: 'Beginner',
        description: 'Complete your first course',
        icon: '🌱',
        color: '#10B981',
        category: 'course',
        rarity: 'common',
        requirements: { type: 'coursesCompleted', value: 1 },
        xpReward: 50
      },
      {
        name: 'Intermediate',
        description: 'Complete 3 courses',
        icon: '🌿',
        color: '#3B82F6',
        category: 'course',
        rarity: 'rare',
        requirements: { type: 'coursesCompleted', value: 3 },
        xpReward: 150
      },
      {
        name: 'Advanced',
        description: 'Complete 5 courses',
        icon: '🌳',
        color: '#8B5CF6',
        category: 'course',
        rarity: 'epic',
        requirements: { type: 'coursesCompleted', value: 5 },
        xpReward: 500
      },
      {
        name: 'Quiz Master',
        description: 'Pass 10 quizzes',
        icon: '🎯',
        color: '#EF4444',
        category: 'quiz',
        rarity: 'rare',
        requirements: { type: 'quizzesPassed', value: 10 },
        xpReward: 200
      },
      {
        name: 'Perfectionist',
        description: 'Score 100% on 3 quizzes',
        icon: '💯',
        color: '#F59E0B',
        category: 'quiz',
        rarity: 'epic',
        requirements: { type: 'perfectQuiz', value: 3 },
        xpReward: 300
      },
      {
        name: 'Streak Master',
        description: 'Achieve a 7-day learning streak',
        icon: '🔥',
        color: '#DC2626',
        category: 'streak',
        rarity: 'rare',
        requirements: { type: 'streak', value: 7 },
        xpReward: 250
      },
      {
        name: 'Reviewer',
        description: 'Write 5 course reviews',
        icon: '⭐',
        color: '#FBBF24',
        category: 'review',
        rarity: 'common',
        requirements: { type: 'reviewsWritten', value: 5 },
        xpReward: 100
      },
      {
        name: 'Certified Professional',
        description: 'Earn 3 certificates',
        icon: '📜',
        color: '#6366F1',
        category: 'achievement',
        rarity: 'epic',
        requirements: { type: 'certificatesEarned', value: 3 },
        xpReward: 400
      },
      {
        name: 'XP Champion',
        description: 'Earn 5000 total XP',
        icon: '👑',
        color: '#9333EA',
        category: 'achievement',
        rarity: 'legendary',
        requirements: { type: 'totalXP', value: 5000 },
        xpReward: 500
      },
      {
        name: 'Community Star',
        description: 'Get 20 helpful votes on reviews',
        icon: '🌟',
        color: '#EC4899',
        category: 'special',
        rarity: 'legendary',
        requirements: { type: 'helpfulVotes', value: 20 },
        xpReward: 600
      }
    ];

    // Clear existing badges
    await Badge.deleteMany({});
    
    const createdBadges = await Badge.insertMany(badgesData);
    console.log(`✅ Created ${createdBadges.length} badges\n`);

    // ===== CREATE ENROLLMENTS & PROGRESS =====
    console.log('📝 Creating Enrollments and Progress...');
    
    // Clear existing enrollments and certificates
    await Enrollment.deleteMany({});
    await Certificate.deleteMany({});

    let enrollmentsCreated = 0;
    let certificatesCreated = 0;

    for (const student of students) {
      // Enroll each student in 2-3 random courses
      const numCoursesToEnroll = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);
      const coursesToEnroll = shuffledCourses.slice(0, numCoursesToEnroll);

      for (const course of coursesToEnroll) {
        // Create enrollment
        const completionPercentage = Math.floor(Math.random() * 81) + 20; // 20-100%
        const isCompleted = completionPercentage === 100;
        
        const enrollment = await Enrollment.create({
          user: student._id,
          course: course._id,
          status: isCompleted ? 'completed' : 'active',
          progress: completionPercentage,
          startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          completedAt: isCompleted ? new Date() : null
        });

        enrollmentsCreated++;

        // Generate certificate for completed courses
        if (isCompleted) {
          const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          await Certificate.create({
            user: student._id,
            course: course._id,
            certificateId: certId,
            completionDate: new Date(),
            grade: ['A+', 'A', 'B+'][Math.floor(Math.random() * 3)],
            metadata: {
              courseDuration: course.duration || '40 hours',
              totalLessons: course.curriculum.reduce((sum, m) => sum + m.lessons.length, 0),
              completedLessons: course.curriculum.reduce((sum, m) => sum + m.lessons.length, 0),
              instructorName: instructors[0]?.name || 'StudySphere Academy'
            }
          });
          certificatesCreated++;
        }
      }
    }

    console.log(`✅ Created ${enrollmentsCreated} enrollments`);
    console.log(`✅ Created ${certificatesCreated} certificates\n`);

    // ===== CREATE REVIEWS =====
    console.log('⭐ Creating Reviews...');
    
    // Clear existing reviews
    await Review.deleteMany({});

    const reviewTemplates = [
      { rating: 5, title: 'Excellent Course!', comment: 'Very comprehensive and well-structured. Highly recommend this to anyone!', helpful: 8 },
      { rating: 5, title: 'Best Course Ever', comment: 'The best course I\'ve taken so far. Great instructor and amazing content quality.', helpful: 12 },
      { rating: 4, title: 'Very Good Content', comment: 'Very good course with practical examples. Could use more real-world projects though.', helpful: 5 },
      { rating: 5, title: 'Outstanding!', comment: 'Outstanding quality! Learned so much in such a short time. Worth every penny.', helpful: 15 },
      { rating: 4, title: 'Solid Learning Experience', comment: 'Solid course content overall. The instructor explains concepts very clearly.', helpful: 6 },
      { rating: 5, title: 'Perfect for All Levels', comment: 'Perfect for beginners and intermediate learners alike. Love the hands-on approach!', helpful: 10 },
      { rating: 3, title: 'Good But Could Be Better', comment: 'Good course overall but could be more up-to-date with latest industry trends.', helpful: 3 },
      { rating: 5, title: 'Life Changing', comment: 'Absolutely brilliant content! This course changed my career trajectory. Thank you so much!', helpful: 20 },
      { rating: 4, title: 'Great Course', comment: 'Great course, well paced and structured. Some sections could be explained better.', helpful: 4 },
      { rating: 5, title: 'Phenomenal Experience', comment: 'Phenomenal course! Crystal clear explanations and excellent support from the instructor.', helpful: 18 }
    ];

    let reviewsCreated = 0;

    for (const course of courses) {
      // Create 3-7 reviews per course
      const numReviews = Math.floor(Math.random() * 5) + 3;
      
      for (let i = 0; i < numReviews && i < students.length; i++) {
        const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
        
        await Review.create({
          user: students[i]._id,
          course: course._id,
          rating: template.rating,
          title: template.title,
          comment: template.comment,
          helpfulCount: template.helpful,
          isVerifiedPurchase: true,
          createdAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000)
        });

        reviewsCreated++;
      }

      // Update course rating
      const courseReviews = await Review.find({ course: course._id });
      const averageRating = courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;
      
      await Course.findByIdAndUpdate(course._id, {
        rating: Math.round(averageRating * 10) / 10,
        enrolledStudents: await Enrollment.countDocuments({ course: course._id })
      });
    }

    console.log(`✅ Created ${reviewsCreated} reviews\n`);

    // ===== SUMMARY =====
    console.log('\n' + '='.repeat(60));
    console.log('✨ DEMO ENVIRONMENT SETUP COMPLETE! ✨');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   - ${createdAchievements.length} Achievements`);
    console.log(`   - ${createdBadges.length} Badges`);
    console.log(`   - ${enrollmentsCreated} Enrollments`);
    console.log(`   - ${certificatesCreated} Certificates`);
    console.log(`   - ${reviewsCreated} Course Reviews`);

    console.log('\n👥 LOGIN CREDENTIALS:');
    console.log('\n🔑 ADMIN ACCOUNT:');
    console.log('   Email: admin@elearning.com');
    console.log('   Password: demo123');
    console.log('   Role: Admin');

    console.log('\n👨‍🏫 INSTRUCTOR ACCOUNTS:');
    for (let i = 0; i < instructors.length; i++) {
      console.log(`\n   Instructor ${i + 1}:`);
      console.log(`   Email: ${instructors[i].email}`);
      console.log(`   Password: demo123`);
      console.log(`   Name: ${instructors[i].name}`);
    }

    console.log('\n👨‍🎓 STUDENT ACCOUNTS:');
    for (let i = 0; i < students.length; i++) {
      const enrollments = await Enrollment.countDocuments({ user: students[i]._id });
      const completed = await Enrollment.countDocuments({ user: students[i]._id, status: 'completed' });
      
      console.log(`\n   Student ${i + 1}:`);
      console.log(`   Email: ${students[i].email}`);
      console.log(`   Password: demo123`);
      console.log(`   Name: ${students[i].name}`);
      console.log(`   Enrolled: ${enrollments} courses (${completed} completed)`);
    }

    console.log('\n\n🎉 You can now test:');
    console.log('   ✓ Course enrollments and progress tracking');
    console.log('   ✓ Certificates for completed courses');
    console.log('   ✓ Achievements and badges system');
    console.log('   ✓ Course reviews and ratings');
    console.log('   ✓ Student dashboards with gamification');
    console.log('\n🚀 Start your frontend and backend servers to explore!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the setup
setupDemoEnvironment();
