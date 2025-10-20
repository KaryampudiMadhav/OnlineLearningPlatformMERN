/**
 * Test script to verify Inngest event sending and receiving
 * Run this to test if the 'course/generate-dynamic' event works
 */

const { inngest } = require('../config/inngest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testInngestEvent() {
  try {
    console.log('\n🧪 Testing Inngest Event System...\n');
    
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');
    
    // Create a test event payload
    const testPayload = {
      name: 'course/generate-dynamic',
      data: {
        courseId: 'test-' + Date.now(),
        userId: 'test-user-123',
        config: {
          title: 'Test Course: JavaScript Fundamentals',
          description: 'A test course to verify event system',
          category: 'Programming',
          level: 'Beginner',
          moduleCount: 2,
          lessonsPerModule: 2,
          includeQuizzes: true,
          skills: ['JavaScript', 'Programming Basics']
        }
      }
    };
    
    console.log('📤 Sending test event to Inngest:');
    console.log(JSON.stringify(testPayload, null, 2));
    console.log('');
    
    // Send the event
    const result = await inngest.send(testPayload);
    
    console.log('✅ Event sent successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('');
    
    console.log('🔍 Check the Inngest dev server at: http://127.0.0.1:8288');
    console.log('   - Look for the event in the stream');
    console.log('   - Verify the function "generate-dynamic-course" is triggered');
    console.log('');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ Test complete! MongoDB connection closed.\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    // Close MongoDB connection if open
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run the test
console.log('\n' + '='.repeat(60));
console.log('  INNGEST EVENT SYSTEM TEST');
console.log('='.repeat(60));

testInngestEvent();
