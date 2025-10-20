/**
 * Check Gamification Data
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');

async function checkGamification() {
  try {
    console.log('🔍 Checking Gamification Data...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Achievements
    const achievements = await Achievement.find();
    console.log(`📊 Achievements: ${achievements.length}`);
    if (achievements.length > 0) {
      console.log('   Sample achievements:');
      achievements.slice(0, 5).forEach(a => {
        console.log(`   - ${a.icon} ${a.name} (${a.category})`);
      });
    } else {
      console.log('   ❌ NO ACHIEVEMENTS FOUND!');
    }
    console.log('');

    // Check Badges
    const badges = await Badge.find();
    console.log(`🎖️  Badges: ${badges.length}`);
    if (badges.length > 0) {
      console.log('   Sample badges:');
      badges.slice(0, 5).forEach(b => {
        console.log(`   - ${b.icon} ${b.name} (${b.rarity} - ${b.category})`);
      });
    } else {
      console.log('   ❌ NO BADGES FOUND!');
    }
    console.log('');

    // Check User Progress
    const userProgress = await UserProgress.find().populate('user', 'name email');
    console.log(`👤 User Progress Records: ${userProgress.length}`);
    if (userProgress.length > 0) {
      console.log('   Sample records:');
      userProgress.slice(0, 3).forEach(up => {
        console.log(`   - ${up.user?.email}: Level ${up.level}, ${up.totalXP} XP`);
      });
    } else {
      console.log('   ℹ️  No user progress records yet (will be created on first login)');
    }
    console.log('');

    // Check All Users
    const allUsers = await User.find().select('name email role isActive');
    console.log(`👥 Total Users: ${allUsers.length}`);
    console.log('   Users by role:');
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    const instructorCount = allUsers.filter(u => u.role === 'instructor').length;
    const studentCount = allUsers.filter(u => u.role === 'student').length;
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Instructors: ${instructorCount}`);
    console.log(`   - Students: ${studentCount}`);
    console.log('');
    
    console.log('   All users:');
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) ${u.isActive ? '✅' : '❌ inactive'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Achievements: ${achievements.length}`);
    console.log(`✅ Badges: ${badges.length}`);
    console.log(`✅ Users: ${allUsers.length}`);
    console.log(`ℹ️  User Progress: ${userProgress.length} (created on user activity)`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkGamification();
