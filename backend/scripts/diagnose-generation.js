#!/usr/bin/env node

/**
 * Diagnostic Script for Course Generation Issues
 * Run: node backend/scripts/diagnose-generation.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function diagnose() {
  console.log('🔍 Diagnosing Course Generation Issues...\n');

  // 1. Check MongoDB Connection
  console.log('1️⃣ Checking MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }

  // 2. Check for stuck courses
  console.log('2️⃣ Checking for stuck courses...');
  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
  
  const stuckCourses = await Course.find({
    'metadata.generationStatus': 'generating'
  }).select('title metadata createdAt');

  if (stuckCourses.length > 0) {
    console.log(`⚠️  Found ${stuckCourses.length} stuck course(s):`);
    stuckCourses.forEach((course, i) => {
      const age = Math.round((Date.now() - course.createdAt) / 1000 / 60);
      console.log(`   ${i + 1}. "${course.title}" - stuck for ${age} minutes`);
    });
    console.log('\n   Fix: Run this command to reset stuck courses:');
    console.log('   node backend/scripts/reset-stuck-courses.js\n');
  } else {
    console.log('✅ No stuck courses found\n');
  }

  // 3. Check Gemini API Key
  console.log('3️⃣ Checking Gemini API Key...');
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    console.log('✅ Gemini API Key is configured\n');
  } else {
    console.log('❌ Gemini API Key is NOT configured or still has placeholder value\n');
  }

  // 4. Check Inngest Configuration
  console.log('4️⃣ Checking Inngest Setup...');
  console.log('   ⚠️  Cannot verify Inngest from here');
  console.log('   Please check manually:');
  console.log('   - Is Inngest dev server running? (npx inngest-cli@latest dev)');
  console.log('   - Check dashboard: http://127.0.0.1:8288\n');

  // 5. Recent course generations
  console.log('5️⃣ Checking recent course generations...');
  const recentCourses = await Course.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title metadata createdAt');

  console.log(`   Last 5 courses created:\n`);
  recentCourses.forEach((course, i) => {
    const status = course.metadata?.generationStatus || 'unknown';
    const age = Math.round((Date.now() - course.createdAt) / 1000 / 60);
    const emoji = status === 'completed' ? '✅' : status === 'generating' ? '⏳' : '❌';
    console.log(`   ${emoji} "${course.title}" - ${status} (${age}m ago)`);
  });

  console.log('\n🎯 Diagnosis Complete!\n');
  
  // Recommendations
  console.log('📋 Recommendations:');
  console.log('   1. Make sure Inngest dev server is running:');
  console.log('      npx inngest-cli@latest dev\n');
  console.log('   2. Check backend logs for errors\n');
  console.log('   3. If courses are stuck, reset them:');
  console.log('      node backend/scripts/reset-stuck-courses.js\n');

  await mongoose.connection.close();
  process.exit(0);
}

diagnose().catch(error => {
  console.error('❌ Diagnosis failed:', error);
  process.exit(1);
});
