require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function checkVideoUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get the most recent AI-generated course
    const course = await Course.findOne({ 
      title: { $regex: 'AI', $options: 'i' }
    }).sort({ createdAt: -1 });
    
    if (!course) {
      console.log('❌ No AI-generated courses found');
      process.exit(0);
    }
    
    console.log(`📚 Course: ${course.title}`);
    console.log(`🆔 ID: ${course._id}`);
    console.log(`📅 Created: ${course.createdAt}\n`);
    
    // Check each module's video URLs
    course.curriculum.forEach((module, modIndex) => {
      console.log(`\n📦 Module ${modIndex + 1}: ${module.title}`);
      
      if (module.lessons && module.lessons.length > 0) {
        module.lessons.forEach((lesson, lessonIndex) => {
          console.log(`  📝 Lesson ${lessonIndex + 1}: ${lesson.title}`);
          console.log(`     🎥 Video URL: ${lesson.videoUrl || 'NO VIDEO URL'}`);
          
          // Check if it's a problematic URL
          if (lesson.videoUrl) {
            if (lesson.videoUrl === 'https://www.youtube.com/') {
              console.log('     ⚠️  ERROR: Just base YouTube URL (no video ID)');
            } else if (lesson.videoUrl.includes('/results?search_query=')) {
              console.log('     ⚠️  ERROR: Search URL (not a video)');
            } else if (lesson.videoUrl.includes('/watch?v=')) {
              const videoId = lesson.videoUrl.split('watch?v=')[1]?.split('&')[0];
              console.log(`     ✅ Valid watch URL (ID: ${videoId})`);
            } else if (lesson.videoUrl.includes('/embed/')) {
              const videoId = lesson.videoUrl.split('/embed/')[1]?.split('?')[0];
              console.log(`     ✅ Valid embed URL (ID: ${videoId})`);
            } else {
              console.log('     ⚠️  UNKNOWN: Unrecognized URL format');
            }
          }
        });
      } else {
        console.log('  ❌ No lessons found');
      }
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVideoUrls();
