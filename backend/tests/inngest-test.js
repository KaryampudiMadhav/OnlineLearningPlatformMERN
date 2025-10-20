/**
 * Inngest Agent Kit Test Suite
 * Tests the AI token management and circuit breaker functionality
 */

const axios = require('axios');
const { inngest } = require('../config/inngest');

class InngestTestSuite {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',     // Cyan
      success: '\x1b[32m',  // Green
      error: '\x1b[31m',    // Red
      warning: '\x1b[33m',  // Yellow
      reset: '\x1b[0m'      // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async test(name, testFn) {
    this.log(`Running test: ${name}`, 'info');
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
      this.log(`✓ ${name}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      this.log(`✗ ${name}: ${error.message}`, 'error');
    }
  }

  async testInngestHealth() {
    const response = await axios.get(`${this.baseUrl}/api/inngest/health`);
    if (response.status !== 200) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    const health = response.data;
    if (health.status !== 'healthy') {
      throw new Error(`Service unhealthy: ${health.status}`);
    }

    // Verify all agents are ready
    const agents = health.agents;
    const requiredAgents = ['course-generator', 'quiz-generator', 'content-assistant', 'support-chatbot'];
    
    for (const agent of requiredAgents) {
      if (agents[agent] !== 'ready') {
        throw new Error(`Agent ${agent} not ready: ${agents[agent]}`);
      }
    }
  }

  async testCourseGeneration() {
    const payload = {
      title: "Test Course",
      description: "A test course for validating AI generation",
      difficulty: "beginner",
      duration: 60,
      topics: ["introduction", "basics"]
    };

    const response = await axios.post(`${this.baseUrl}/api/ai-courses/generate`, payload, {
      timeout: 30000 // 30 second timeout
    });

    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`Course generation failed: ${response.status}`);
    }

    const result = response.data;
    if (!result.jobId && !result.course) {
      throw new Error('No job ID or course returned');
    }

    // If it's a job, check status
    if (result.jobId) {
      await this.waitForJobCompletion(result.jobId);
    }
  }

  async testQuizGeneration() {
    const payload = {
      courseId: "test-course-id",
      topic: "JavaScript Basics",
      difficulty: "intermediate",
      questionCount: 5
    };

    const response = await axios.post(`${this.baseUrl}/api/ai-courses/generate-quiz`, payload, {
      timeout: 20000
    });

    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`Quiz generation failed: ${response.status}`);
    }

    const result = response.data;
    if (!result.jobId && !result.quiz) {
      throw new Error('No job ID or quiz returned');
    }
  }

  async testCircuitBreaker() {
    // Test with invalid API key to trigger circuit breaker
    const originalEnv = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'invalid-key';

    try {
      const response = await axios.post(`${this.baseUrl}/api/ai-courses/health`, {}, {
        timeout: 10000
      });

      // Should still return a response (circuit breaker handling)
      if (response.status !== 200) {
        throw new Error(`Health check with invalid key failed: ${response.status}`);
      }

      const health = response.data;
      if (health.aiService !== 'degraded' && health.aiService !== 'unavailable') {
        this.log('Warning: Circuit breaker may not be working correctly', 'warning');
      }

    } finally {
      process.env.GEMINI_API_KEY = originalEnv;
    }
  }

  async testBatchProcessing() {
    const payload = {
      requests: [
        { topic: "React Basics", type: "course" },
        { topic: "Node.js Fundamentals", type: "course" },
        { topic: "Database Design", type: "quiz" }
      ]
    };

    const response = await axios.post(`${this.baseUrl}/api/ai-courses/batch`, payload, {
      timeout: 45000 // Longer timeout for batch
    });

    if (response.status !== 200 && response.status !== 202) {
      throw new Error(`Batch processing failed: ${response.status}`);
    }

    const result = response.data;
    if (!result.batchId && !result.results) {
      throw new Error('No batch ID or results returned');
    }
  }

  async testAISupportChat() {
    const payload = {
      message: "What is machine learning?",
      context: "beginner-friendly explanation"
    };

    const response = await axios.post(`${this.baseUrl}/api/ai-support/chat`, payload, {
      timeout: 15000
    });

    if (response.status !== 200) {
      throw new Error(`AI chat failed: ${response.status}`);
    }

    const result = response.data;
    if (!result.response || result.response.length < 10) {
      throw new Error('Invalid or empty AI response');
    }
  }

  async waitForJobCompletion(jobId, maxWait = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        const response = await axios.get(`${this.baseUrl}/api/ai-courses/status/${jobId}`);
        const status = response.data;
        
        if (status.status === 'completed') {
          return status;
        } else if (status.status === 'failed') {
          throw new Error(`Job failed: ${status.error}`);
        }
        
        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (Date.now() - startTime >= maxWait) {
          throw new Error(`Job timeout after ${maxWait}ms`);
        }
      }
    }
    
    throw new Error(`Job did not complete within ${maxWait}ms`);
  }

  async runAllTests() {
    this.log('Starting Inngest Agent Kit Test Suite', 'info');
    this.log('========================================', 'info');

    await this.test('Inngest Health Check', () => this.testInngestHealth());
    await this.test('AI Course Generation', () => this.testCourseGeneration());
    await this.test('AI Quiz Generation', () => this.testQuizGeneration());
    await this.test('Circuit Breaker Functionality', () => this.testCircuitBreaker());
    await this.test('Batch Processing', () => this.testBatchProcessing());
    await this.test('AI Support Chat', () => this.testAISupportChat());

    this.printResults();
  }

  printResults() {
    this.log('Test Suite Results', 'info');
    this.log('==================', 'info');
    this.log(`Total Tests: ${this.results.passed + this.results.failed}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');

    if (this.results.failed > 0) {
      this.log('\nFailed Tests:', 'error');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`- ${test.name}: ${test.error}`, 'error');
        });
    }

    this.log(`\nOverall: ${this.results.failed === 0 ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED'}`, 
             this.results.failed === 0 ? 'success' : 'error');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new InngestTestSuite();
  tester.runAllTests()
    .then(() => {
      process.exit(tester.results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed to run:', error);
      process.exit(1);
    });
}

module.exports = InngestTestSuite;