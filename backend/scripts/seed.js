const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/database');
const seedDatabase = require('../utils/seedData');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const seedAll = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log('\n🌱 Starting database seeding...\n');

    // Seed courses
    await seedDatabase();

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@studysphere.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@studysphere.com',
        password: 'admin123',
        role: 'admin',
        avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        bio: 'Platform administrator',
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@studysphere.com');
      console.log('   Password: admin123');
    }

    // Create test instructor
    const instructorExists = await User.findOne({ email: 'instructor@studysphere.com' });
    if (!instructorExists) {
      await User.create({
        name: 'John Smith',
        email: 'instructor@studysphere.com',
        password: 'instructor123',
        role: 'instructor',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        bio: 'Experienced web development instructor',
      });
      console.log('✅ Instructor user created');
      console.log('   Email: instructor@studysphere.com');
      console.log('   Password: instructor123');
    }

    // Create test student
    const studentExists = await User.findOne({ email: 'student@studysphere.com' });
    if (!studentExists) {
      await User.create({
        name: 'Jane Doe',
        email: 'student@studysphere.com',
        password: 'student123',
        role: 'student',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        bio: 'Passionate learner',
      });
      console.log('✅ Student user created');
      console.log('   Email: student@studysphere.com');
      console.log('   Password: student123');
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();
