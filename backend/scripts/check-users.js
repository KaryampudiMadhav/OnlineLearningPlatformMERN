/**
 * Check Users in Database
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function checkUsers() {
  try {
    console.log('🔍 Checking Users in Database...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find().select('+password');
    
    console.log(`📊 Total Users: ${users.length}\n`);

    for (const user of users) {
      console.log(`👤 User: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      
      // Test password
      const isPasswordDemo123 = await bcrypt.compare('demo123', user.password);
      console.log(`   Password is "demo123": ${isPasswordDemo123 ? '✅ YES' : '❌ NO'}`);
      console.log('');
    }

    // Test direct password comparison
    console.log('\n🔐 Testing Direct Login for student1@example.com...');
    const testUser = await User.findOne({ email: 'student1@example.com' }).select('+password');
    
    if (testUser) {
      console.log('   User found: ✅');
      console.log(`   Has comparePassword method: ${typeof testUser.comparePassword === 'function' ? '✅' : '❌'}`);
      
      const passwordMatches = await testUser.comparePassword('demo123');
      console.log(`   Password "demo123" matches: ${passwordMatches ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('   User NOT found: ❌');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkUsers();
