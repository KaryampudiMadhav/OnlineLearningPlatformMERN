#!/usr/bin/env node

/**
 * Reset Stuck Courses Script
 * Run: node backend/scripts/reset-stuck-courses.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function resetStuckCourses() {
  console.log('🔄 Resetting Stuck Courses...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

    // Find stuck courses (generating for more than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const stuckCourses = await Course.find({
      'metadata.generationStatus': 'generating',
      createdAt: { $lt: tenMinutesAgo }
    });

    if (stuckCourses.length === 0) {
      console.log('✅ No stuck courses found!\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`Found ${stuckCourses.length} stuck course(s):\n`);
    
    stuckCourses.forEach((course, i) => {
      const age = Math.round((Date.now() - course.createdAt) / 1000 / 60);
      console.log(`   ${i + 1}. "${course.title}" (stuck for ${age} minutes)`);
    });

    console.log('\n🔄 Resetting these courses to "failed" status...\n');

    const result = await Course.updateMany(
      {
        'metadata.generationStatus': 'generating',
        createdAt: { $lt: tenMinutesAgo }
      },
      {
        $set: {
          'metadata.generationStatus': 'failed',
          'metadata.failedAt': new Date(),
          'metadata.failureReason': 'Generation timed out (exceeded 10 minutes)'
        }
      }
    );

    console.log(`✅ Reset ${result.modifiedCount} course(s)\n`);
    console.log('You can now try generating these courses again.\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Failed to reset courses:', error);
    process.exit(1);
  }
}

resetStuckCourses();
