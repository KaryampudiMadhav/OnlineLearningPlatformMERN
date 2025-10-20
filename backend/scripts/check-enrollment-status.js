const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

mongoose
  .connect(
    'mongodb+srv://karyampudimadhav_db_user:zzvL68ssFyoa7uJO@learningplatform.hif9kqr.mongodb.net/?retryWrites=true&w=majority&appName=LearningPlatform'
  )
  .then(async () => {
    console.log('Connected to DB\n');

    const student2 = await User.findOne({ email: 'student2@example.com' });
    const courseId = '68f5d4cf72845fb2dd6225e4';

    const enrollment = await Enrollment.findOne({
      user: student2._id,
      course: courseId,
    }).populate('course', 'title');

    console.log('Enrollment Details:');
    console.log('- Course:', enrollment.course.title);
    console.log('- Progress:', enrollment.progress + '%');
    console.log('- Completed:', enrollment.completed);
    console.log('- Status:', enrollment.status);
    console.log('- CompletedAt:', enrollment.completedAt);

    if (enrollment.status !== 'completed') {
      console.log('\n⚠️ Issue found: Status is not "completed"');
      console.log('Fixing enrollment status...');
      
      enrollment.status = 'completed';
      enrollment.completed = true;
      enrollment.completedAt = new Date();
      enrollment.progress = 100;
      await enrollment.save();
      
      console.log('✅ Fixed! Status is now "completed"');
    } else {
      console.log('\n✅ Status is correct');
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
