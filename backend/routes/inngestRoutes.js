const express = require('express');
const { serve } = require('inngest/express');
const { inngest } = require('../config/inngest');
const {
  generateCourseFunction,
  generateQuizFunction,
  improveContentFunction,
  batchProcessFunction,
  healthCheckFunction
} = require('../inngest/functions');
const {
  generateDynamicCourseFunction,
  generateModuleFunction,
  generateLessonQuizFunction,
  regenerateModuleFunction,
  enhanceContentFunction
} = require('../inngest/dynamicCourseFunctions');

const router = express.Router();

// Serve Inngest functions
const inngestHandler = serve({
  client: inngest,
  functions: [
    // Original functions
    generateCourseFunction,
    generateQuizFunction,
    improveContentFunction,
    batchProcessFunction,
    healthCheckFunction,
    // New dynamic course functions
    generateDynamicCourseFunction,
    generateModuleFunction,
    generateLessonQuizFunction,
    regenerateModuleFunction,
    enhanceContentFunction,
  ],
});

// Mount Inngest handler
router.use('/inngest', inngestHandler);

module.exports = router;