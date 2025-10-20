const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');

mongoose
  .connect(
    'mongodb+srv://karyampudimadhav_db_user:zzvL68ssFyoa7uJO@learningplatform.hif9kqr.mongodb.net/?retryWrites=true&w=majority&appName=LearningPlatform'
  )
  .then(async () => {
    console.log('Connected to DB\n');

    console.log('🧪 Testing Certificate creation with pre-save hook...\n');

    // Test 1: Using .save() method (should work)
    console.log('Test 1: Using new Certificate() + .save()');
    const cert1 = new Certificate({
      user: '68f5d4ce72845fb2dd6225dc',
      course: '68f5d4cf72845fb2dd622604',
      completionDate: new Date(),
      grade: 'A+',
    });
    
    try {
      await cert1.save();
      console.log('✅ SUCCESS! Certificate created with ID:', cert1.certificateId);
      await Certificate.deleteOne({ _id: cert1._id });
      console.log('✅ Test certificate deleted\n');
    } catch (error) {
      console.log('❌ FAILED:', error.message, '\n');
    }

    // Test 2: Using .create() method (should fail)
    console.log('Test 2: Using Certificate.create()');
    try {
      const cert2 = await Certificate.create({
        user: '68f5d4ce72845fb2dd6225dc',
        course: '68f5d4cf72845fb2dd622604',
        completionDate: new Date(),
        grade: 'A',
      });
      console.log('✅ Certificate created with ID:', cert2.certificateId);
      await Certificate.deleteOne({ _id: cert2._id });
      console.log('✅ Test certificate deleted\n');
    } catch (error) {
      console.log('❌ FAILED:', error.message, '\n');
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
