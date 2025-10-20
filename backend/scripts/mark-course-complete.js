const mongoose = require('mongoose');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

mongoose
  .connect(
    'mongodb+srv://karyampudimadhav_db_user:zzvL68ssFyoa7uJO@learningplatform.hif9kqr.mongodb.net/?retryWrites=true&w=majority&appName=LearningPlatform'
  )
  .then(async () => {
    console.log('Connected to DB\n');

    // Find student2
    const student2 = await User.findOne({ email: 'student2@example.com' });
    if (!student2) {
      console.log('❌ Student2 not found');
      process.exit(1);
    }

    console.log('✅ Found Student2:', student2.name, '(ID:', student2._id + ')');

    // Find their enrollments
    const enrollments = await Enrollment.find({ user: student2._id }).populate(
      'course',
      'title'
    );
    console.log(`\n📚 Student2 has ${enrollments.length} enrollments:`);

    if (enrollments.length > 0) {
      enrollments.forEach((e, i) => {
        console.log(
          `${i + 1}. ${e.course.title} - Progress: ${e.progress}%, Completed: ${e.completed}`
        );
      });

      // Mark the first enrollment as completed for testing
      const firstEnrollment = enrollments[0];
      firstEnrollment.completed = true;
      firstEnrollment.completedAt = new Date();
      firstEnrollment.progress = 100;
      await firstEnrollment.save();

      console.log(`\n✅ Marked "${firstEnrollment.course.title}" as completed`);
      console.log(`📝 Course ID for certificate: ${firstEnrollment.course._id}`);
      console.log(
        `\n🔗 Test certificate generation with: POST /api/certificates/generate/${firstEnrollment.course._id}`
      );
    } else {
      console.log('\n⚠️ No enrollments found for student2');
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
