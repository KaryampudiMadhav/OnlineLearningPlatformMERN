/**
 * Quick script to check a generated course's details
 * Usage: node check-course.js <courseId>
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Get course ID from command line
const courseId = process.argv[2] || '68f47b9676836a9c06e76901';

async function checkCourse() {
  try {
    console.log('\n🔍 Checking course:', courseId);
    console.log('='.repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import Course model
    const Course = require('../models/Course');

    // Find the course
    const course = await Course.findById(courseId);

    if (!course) {
      console.log('❌ Course not found!');
      process.exit(1);
    }

    console.log('📚 Course Title:', course.title);
    console.log('📊 Status:', course.metadata?.generationStatus);
    console.log('📈 Progress:', course.metadata?.progressPercentage + '%');
    console.log('📂 Modules:', course.curriculum?.length || 0);
    console.log('📝 Published:', course.isPublished);
    console.log('\n' + '='.repeat(60));

    // Show each module
    if (course.curriculum && course.curriculum.length > 0) {
      console.log('\n📖 MODULES:\n');
      
      course.curriculum.forEach((module, idx) => {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`MODULE ${idx + 1}: ${module.moduleTitle || module.title}`);
        console.log(`${'─'.repeat(60)}`);
        
        if (module.lessons && module.lessons.length > 0) {
          console.log(`\n  📚 Lessons (${module.lessons.length}):`);
          module.lessons.forEach((lesson, lessonIdx) => {
            console.log(`\n    ${lessonIdx + 1}. ${lesson.title}`);
            console.log(`       ├─ Content: ${lesson.content ? lesson.content.substring(0, 100) + '...' : 'N/A'}`);
            console.log(`       ├─ Words: ${lesson.content ? lesson.content.split(' ').length : 0}`);
            console.log(`       ├─ Video: ${lesson.videoUrl || 'N/A'}`);
            console.log(`       ├─ Duration: ${lesson.duration || 'N/A'} mins`);
            
            if (lesson.resources && lesson.resources.length > 0) {
              console.log(`       └─ Resources: ${lesson.resources.length} items`);
              lesson.resources.forEach((resource, resIdx) => {
                console.log(`          ${resIdx + 1}. ${resource.title || resource.type}: ${resource.url}`);
              });
            }
          });
        }

        if (module.quiz && module.quiz.questions && module.quiz.questions.length > 0) {
          console.log(`\n  ❓ Quiz: ${module.quiz.questions.length} questions`);
          module.quiz.questions.forEach((q, qIdx) => {
            console.log(`    ${qIdx + 1}. ${q.question}`);
          });
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Course check complete!\n');

    // Check for potential issues
    console.log('🔍 Issue Detection:');
    
    if (!course.metadata?.generationStatus) {
      console.log('  ⚠️  No generation status set');
    } else if (course.metadata.generationStatus !== 'completed') {
      console.log(`  ⚠️  Status is "${course.metadata.generationStatus}" (expected "completed")`);
    }

    if (course.metadata?.progressPercentage !== 100) {
      console.log(`  ⚠️  Progress is ${course.metadata?.progressPercentage}% (expected 100%)`);
    }

    if (!course.isPublished) {
      console.log('  ⚠️  Course is not published');
    }

    if (!course.curriculum || course.curriculum.length === 0) {
      console.log('  ⚠️  No curriculum/modules found');
    }

    const totalLessons = course.curriculum?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
    if (totalLessons === 0) {
      console.log('  ⚠️  No lessons found in any module');
    }

    console.log('\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

checkCourse();
