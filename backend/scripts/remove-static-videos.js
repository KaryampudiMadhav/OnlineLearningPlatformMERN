require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function removeStaticVideos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('🗑️  Removing static placeholder videos...\n');
    
    const courses = await Course.find({});
    
    let totalCoursesUpdated = 0;
    let totalVideosRemoved = 0;
    
    for (const course of courses) {
      let courseUpdated = false;
      let videosRemoved = 0;
      
      course.curriculum.forEach((module) => {
        module.lessons.forEach((lesson) => {
          // Remove Rick Astley placeholder
          if (lesson.videoUrl === 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') {
            console.log(`   🗑️  Removed from: ${lesson.title}`);
            lesson.videoUrl = null; // Set to null so frontend shows placeholder
            courseUpdated = true;
            videosRemoved++;
          }
        });
      });
      
      if (courseUpdated) {
        await course.save();
        totalCoursesUpdated++;
        totalVideosRemoved += videosRemoved;
        console.log(`\n✅ Updated Course: ${course.title}`);
        console.log(`   📊 Removed ${videosRemoved} placeholder videos\n`);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`📚 Total Courses Checked: ${courses.length}`);
    console.log(`✅ Courses Updated: ${totalCoursesUpdated}`);
    console.log(`🗑️  Total Videos Removed: ${totalVideosRemoved}`);
    console.log('═══════════════════════════════════════\n');
    
    if (totalVideosRemoved === 0) {
      console.log('✅ No static placeholder videos found!');
    } else {
      console.log('✅ Static placeholder videos removed!');
      console.log('📌 Videos set to null (frontend will show gray placeholder)');
      console.log('🎯 NEW courses will have Gemini AI-generated videos');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting Static Video Removal...\n');
removeStaticVideos();
