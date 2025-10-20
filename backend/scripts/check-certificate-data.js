const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');

mongoose
  .connect(
    'mongodb+srv://karyampudimadhav_db_user:zzvL68ssFyoa7uJO@learningplatform.hif9kqr.mongodb.net/?retryWrites=true&w=majority&appName=LearningPlatform'
  )
  .then(async () => {
    console.log('Connected to DB\n');

    console.log('🔍 Fetching certificates with populated user data...\n');

    const certificates = await Certificate.find()
      .populate('user', 'name email')
      .populate('course', 'title category');

    if (certificates.length === 0) {
      console.log('❌ No certificates found');
      process.exit(0);
    }

    console.log(`✅ Found ${certificates.length} certificate(s):\n`);

    certificates.forEach((cert, index) => {
      console.log(`Certificate ${index + 1}:`);
      console.log('- Certificate ID:', cert.certificateId);
      console.log('- User Object:', cert.user);
      console.log('- User Name:', cert.user?.name || 'NOT POPULATED');
      console.log('- User Email:', cert.user?.email || 'NOT POPULATED');
      console.log('- Course:', cert.course?.title || 'NOT POPULATED');
      console.log('- Grade:', cert.grade);
      console.log('- Metadata Instructor:', cert.metadata?.instructorName);
      console.log('---');
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
