const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');

mongoose
  .connect(
    'mongodb+srv://karyampudimadhav_db_user:zzvL68ssFyoa7uJO@learningplatform.hif9kqr.mongodb.net/?retryWrites=true&w=majority&appName=LearningPlatform'
  )
  .then(async () => {
    console.log('Connected to DB\n');

    const courseId = '68f5d4cf72845fb2dd622604';
    const userId = '68f5d4ce72845fb2dd6225dc';

    console.log('🗑️  Deleting existing certificate...');
    const result = await Certificate.deleteOne({
      user: userId,
      course: courseId,
    });

    if (result.deletedCount > 0) {
      console.log('✅ Certificate deleted successfully!');
      console.log('\n📝 Now you can generate a new certificate for:');
      console.log('- Student: student2@example.com');
      console.log('- Course ID:', courseId);
    } else {
      console.log('⚠️  No certificate found to delete');
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
