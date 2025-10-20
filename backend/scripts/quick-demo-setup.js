#!/usr/bin/env node

/**
 * Quick Demo Setup
 * 
 * One-command setup for complete demo environment
 */

console.log('\n🚀 Quick Demo Setup Starting...\n');
console.log('This will:');
console.log('  1. Clear all existing data');
console.log('  2. Create 8 sample users');
console.log('  3. Generate 5 courses with AI');
console.log('  4. Setup enrollments & certificates');
console.log('  5. Configure achievements & badges\n');

console.log('⏱️  Estimated time: 2-3 minutes\n');

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('⚠️  WARNING: This will DELETE ALL EXISTING DATA!\nAre you sure you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    console.log('\n✅ Starting setup...\n');
    rl.close();
    
    // Run the setup script
    const setupScript = path.join(__dirname, 'setup-demo-environment.js');
    const child = spawn('node', [setupScript], { stdio: 'inherit' });
    
    child.on('exit', (code) => {
      if (code === 0) {
        console.log('\n\n🎉 Setup complete! You can now:');
        console.log('   1. Start the backend: npm run dev');
        console.log('   2. Login with demo credentials');
        console.log('   3. Explore the platform!\n');
      }
    });
  } else {
    console.log('\n❌ Setup cancelled.\n');
    rl.close();
  }
});
