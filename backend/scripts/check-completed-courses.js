const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

mongoose
  .connect(
    'mongodb+srv://karyampudimadhav_db_user:zzvL68ssFyoa7uJO@learningplatform.hif9kqr.mongodb.net/?retryWrites=true&w=majority&appName=LearningPlatform'
  )
  .then(async () => {
    console.log('Connected to DB');

    const enrollments = await Enrollment.find({
      user: '68f5d3cf72845fb2dd622599',
    }).populate('course', 'title');

    console.log('\nStudent2 Enrollments:');
    enrollments.forEach((e) =>
      console.log(
        `- Course: ${e.course.title}, Progress: ${e.progress}%, Completed: ${e.completed}`
      )
    );

    const completedEnrollment = enrollments.find((e) => e.completed);
    if (completedEnrollment) {
      console.log(
        '\n✅ Found completed enrollment for course:',
        completedEnrollment.course._id
      );
      console.log('Course ID to use for certificate:', completedEnrollment.course._id);
    } else {
      console.log('\n⚠️ No completed enrollments found');
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
