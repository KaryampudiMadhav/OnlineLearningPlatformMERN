/**
 * Inngest Development Server Configuration
 * This file configures the Inngest development server for local testing
 * of the AI Agent Kit functionality
 */

const { serve } = require("inngest/next");
const { inngest } = require("./config/inngest");
const {
  generateCourseContent,
  generateQuizContent,
  processContentAssistant,
  handleSupportChat,
  healthCheck
} = require("./inngest/functions");

// Configure Inngest development server
const handler = serve({
  client: inngest,
  functions: [
    generateCourseContent,
    generateQuizContent,
    processContentAssistant,
    handleSupportChat,
    healthCheck
  ],
  servePath: "/api/inngest",
  signingKey: process.env.INNGEST_SIGNING_KEY,
  streaming: true, // Enable streaming for large AI responses
});

// Development middleware for better debugging
const devMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Inngest Dev] ${req.method} ${req.path}`);
    console.log(`[Inngest Dev] Headers:`, req.headers);
    
    // Log function executions
    const originalSend = res.send;
    res.send = function(data) {
      console.log(`[Inngest Dev] Response:`, data);
      originalSend.call(this, data);
    };
  }
  next();
};

// Enhanced handler with development features
const devHandler = async (req, res) => {
  // Add CORS headers for development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  }

  try {
    await handler(req, res);
  } catch (error) {
    console.error('[Inngest Dev] Error:', error);
    res.status(500).json({
      error: 'Inngest handler error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Health check endpoint for Inngest
const healthCheckHandler = (req, res) => {
  res.json({
    status: 'healthy',
    service: 'inngest-dev-server',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    agents: {
      'course-generator': 'ready',
      'quiz-generator': 'ready',
      'content-assistant': 'ready',
      'support-chatbot': 'ready'
    },
    config: {
      devMode: process.env.INNGEST_DEV_MODE === 'true',
      signingKeySet: !!process.env.INNGEST_SIGNING_KEY,
      eventKeySet: !!process.env.INNGEST_EVENT_KEY
    }
  });
};

module.exports = {
  handler: devHandler,
  healthCheck: healthCheckHandler,
  middleware: devMiddleware
};