/**
 * Migration Script: Fix Existing Courses
 * 
 * This script updates existing courses that were generated before the schema fix.
 * It sets the missing metadata fields so they work with the new polling mechanism.
 */

const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fixExistingCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all AI-generated courses with missing generationStatus
    const coursesToFix = await Course.find({
      'metadata.aiGenerated': true,
      'metadata.generationStatus': { $exists: false }
    });

    console.log(`🔍 Found ${coursesToFix.length} courses to fix\n`);

    if (coursesToFix.length === 0) {
      console.log('✅ No courses need fixing!');
      process.exit(0);
    }

    let fixed = 0;
    let failed = 0;

    for (const course of coursesToFix) {
      try {
        const moduleCount = course.curriculum?.length || 0;
        
        // Determine status based on curriculum
        let status = 'unknown';
        if (moduleCount > 0) {
          status = 'completed'; // If it has modules, consider it completed
        } else {
          status = 'failed'; // If no modules, probably failed
        }

        await Course.findByIdAndUpdate(course._id, {
          $set: {
            'metadata.generationStatus': status,
            'metadata.requestedModules': moduleCount, // Best guess
            'metadata.modulesGenerated': moduleCount,
            'metadata.progressPercentage': moduleCount > 0 ? 100 : 0,
            'metadata.generationCompleted': course.updatedAt // Use updatedAt as completion time
          }
        });

        console.log(`✅ Fixed: "${course.title}" (${moduleCount} modules) → ${status}`);
        fixed++;

      } catch (error) {
        console.error(`❌ Failed to fix "${course.title}":`, error.message);
        failed++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${coursesToFix.length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixExistingCourses();
