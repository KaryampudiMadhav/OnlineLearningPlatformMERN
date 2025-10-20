const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const checkCourseStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const courseId = '68f4e8d20f42887cdc60a312';
    const course = await Course.findById(courseId).select('title metadata curriculum');
    
    if (!course) {
      console.log('❌ Course not found');
      process.exit(1);
    }

    console.log('\n🔍 Course Status Debug:');
    console.log('========================');
    console.log('Title:', course.title);
    console.log('\nMetadata:');
    console.log(JSON.stringify(course.metadata, null, 2));
    console.log('\nCurriculum length:', course.curriculum?.length || 0);
    console.log('Curriculum modules:', course.curriculum?.length);
    
    if (course.curriculum && course.curriculum.length > 0) {
      console.log('\n📚 Modules:');
      course.curriculum.forEach((module, idx) => {
        console.log(`  ${idx + 1}. ${module.title} - ${module.lessons?.length || 0} lessons`);
      });
    }

    const requestedModules = course.metadata?.requestedModules || 0;
    const currentModules = course.curriculum?.length || 0;
    const progress = requestedModules > 0 
      ? Math.round((currentModules / requestedModules) * 100) 
      : 0;

    console.log('\n📊 Calculated Status:');
    console.log('  Status:', course.metadata?.generationStatus || 'unknown');
    console.log('  Progress:', `${progress}%`);
    console.log('  Current modules:', currentModules);
    console.log('  Requested modules:', requestedModules);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCourseStatus();
