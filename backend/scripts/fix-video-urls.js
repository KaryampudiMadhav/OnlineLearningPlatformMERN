require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function fixVideoUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find courses with missing video URLs
    const courses = await Course.find({});
    
    let totalCoursesFixed = 0;
    let totalLessonsFixed = 0;
    
    for (const course of courses) {
      let courseUpdated = false;
      let lessonsFixed = 0;
      
      course.curriculum.forEach((module, modIndex) => {
        // Fix quiz difficulty if it's capitalized
        if (module.quiz && module.quiz.difficulty) {
          const lowercaseDifficulty = module.quiz.difficulty.toLowerCase();
          if (module.quiz.difficulty !== lowercaseDifficulty) {
            module.quiz.difficulty = lowercaseDifficulty;
            courseUpdated = true;
          }
        }
        
        module.lessons.forEach((lesson, lessonIndex) => {
          // Check if video URL is missing, empty, or a search URL
          const needsFix = !lesson.videoUrl || 
                          lesson.videoUrl.trim() === '' ||
                          lesson.videoUrl === 'https://www.youtube.com/' ||
                          lesson.videoUrl.includes('/results?search_query=');
          
          if (needsFix) {
            // Use a valid placeholder video URL
            lesson.videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            courseUpdated = true;
            lessonsFixed++;
            console.log(`   📝 Fixed Lesson ${lessonIndex + 1}: ${lesson.title}`);
          }
        });
      });
      
      if (courseUpdated) {
        await course.save();
        totalCoursesFixed++;
        totalLessonsFixed += lessonsFixed;
        console.log(`\n✅ Updated Course: ${course.title}`);
        console.log(`   📊 Fixed ${lessonsFixed} lessons\n`);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`📚 Total Courses Checked: ${courses.length}`);
    console.log(`✅ Courses Updated: ${totalCoursesFixed}`);
    console.log(`📝 Total Lessons Fixed: ${totalLessonsFixed}`);
    console.log('═══════════════════════════════════════\n');
    
    if (totalLessonsFixed === 0) {
      console.log('🎉 All video URLs are already in good shape!');
    } else {
      console.log('⚠️  Note: Placeholder videos added (Rick Astley)');
      console.log('📌 Instructors should replace with actual tutorial videos');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

console.log('🎬 Starting Video URL Fix Script...\n');
fixVideoUrls();
