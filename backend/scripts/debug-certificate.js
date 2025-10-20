const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');

mongoose
  .connect(
    'mongodb+srv://karyampudimadhav_db_user:zzvL68ssFyoa7uJO@learningplatform.hif9kqr.mongodb.net/?retryWrites=true&w=majority&appName=LearningPlatform'
  )
  .then(async () => {
    console.log('Connected to DB\n');

    const courseId = '68f5d4cf72845fb2dd622604';
    const userId = '68f5d4ce72845fb2dd6225dc';

    console.log('🔍 Checking enrollment...');
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      console.log('❌ No enrollment found!');
      process.exit(1);
    }

    console.log('✅ Enrollment found:');
    console.log('- User:', userId);
    console.log('- Course:', courseId);
    console.log('- Progress:', enrollment.progress + '%');
    console.log('- Completed:', enrollment.completed);
    console.log('- Status:', enrollment.status);
    console.log('- CompletedAt:', enrollment.completedAt);

    console.log('\n🔍 Checking existing certificate...');
    const existingCert = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (existingCert) {
      console.log('⚠️  Certificate already exists:');
      console.log('- Certificate ID:', existingCert.certificateId);
      console.log('- Grade:', existingCert.grade);
      console.log('- Issue Date:', existingCert.issueDate);
    } else {
      console.log('✅ No existing certificate - ready to generate new one');
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
