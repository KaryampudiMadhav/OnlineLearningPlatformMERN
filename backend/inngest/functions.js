const { inngest } = require('../config/inngest');
const intelligentAIService = require('../utils/intelligentAIService');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');

// Course generation function with queue management
const generateCourseFunction = inngest.createFunction(
  {
    id: 'generate-course',
    name: 'Generate AI Course',
    retries: 3,
    concurrency: {
      limit: 5, // Limit concurrent course generations
      key: 'event.data.userId', // Per user concurrency
    },
    rateLimit: {
      limit: 10,
      period: '1m', // 10 requests per minute
    },
  },
  { event: 'course/generate' },
  async ({ event, step }) => {
    const { skills, options, userId, courseData } = event.data;

    // Step 1: Validate input
    await step.run('validate-input', async () => {
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        throw new Error('Skills array is required');
      }
      console.log(`🎯 Generating course for skills: ${skills.join(', ')}`);
      return { validated: true };
    });

    // Step 2: Generate course content with AI
    const generatedCourse = await step.run('generate-ai-content', async () => {
      try {
        const result = await intelligentAIService.generateSkillsBasedCourse(skills, options);
        console.log(`✅ AI course generation completed`);
        return result;
      } catch (error) {
        console.error(`❌ AI generation failed:`, error);
        throw error;
      }
    });

    // Step 3: Create course in database
    const savedCourse = await step.run('save-course', async () => {
      try {
        const curriculum = convertToCurriculum(generatedCourse.modules);
        
        const course = await Course.create({
          title: generatedCourse.title,
          description: generatedCourse.description,
          instructor: courseData.instructor || 'AI Generated',
          instructorId: userId,
          category: courseData.category || 'AI Generated',
          level: options.level || 'Intermediate',
          price: courseData.price || 0,
          duration: calculateDuration(generatedCourse.modules),
          curriculum: curriculum,
          requirements: [`Basic understanding of programming`],
          whatYouWillLearn: skills.map(skill => `Master ${skill} from fundamentals to advanced`),
          tags: skills,
          isPublished: true,
          metadata: {
            aiGenerated: true,
            generatedAt: new Date(),
            skills: skills,
            aiProvider: 'gemini',
          },
        });

        console.log(`💾 Course saved with ID: ${course._id}`);
        return course;
      } catch (error) {
        console.error(`❌ Course save failed:`, error);
        throw error;
      }
    });

    // Step 4: Generate quizzes for each module
    const quizzes = await step.run('generate-quizzes', async () => {
      const quizPromises = generatedCourse.modules.map(async (module, moduleIndex) => {
        try {
          const quiz = await intelligentAIService.generateQuizForModule(module, options.level);
          
          return await Quiz.create({
            course: savedCourse._id,
            quizType: 'module',
            moduleIndex: moduleIndex,
            moduleTitle: module.skill,
            title: quiz.title,
            description: quiz.description,
            duration: quiz.duration,
            passingScore: quiz.passingScore,
            questions: quiz.questions,
            difficulty: quiz.difficulty,
            createdBy: userId,
            metadata: {
              aiGenerated: true,
              generatedAt: new Date(),
            },
          });
        } catch (error) {
          console.error(`❌ Quiz generation failed for module ${moduleIndex}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(quizPromises);
      const successfulQuizzes = results
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

      console.log(`📝 Generated ${successfulQuizzes.length} quizzes`);
      return successfulQuizzes;
    });

    // Step 5: Send completion notification
    await step.run('send-notification', async () => {
      await inngest.send({
        name: 'course/generation-complete',
        data: {
          courseId: savedCourse._id,
          userId: userId,
          skills: skills,
          quizCount: quizzes.length,
          success: true,
        },
      });
      
      console.log(`🎉 Course generation completed successfully`);
      return { notified: true };
    });

    return {
      success: true,
      course: savedCourse,
      quizzes: quizzes,
      metadata: {
        skillsCount: skills.length,
        modulesGenerated: generatedCourse.modules.length,
        quizzesGenerated: quizzes.length,
        processingTime: Date.now() - event.ts,
      },
    };
  }
);

// Quiz generation function
const generateQuizFunction = inngest.createFunction(
  {
    id: 'generate-quiz',
    name: 'Generate AI Quiz',
    retries: 2,
    concurrency: {
      limit: 10, // Higher limit for quizzes
    },
    rateLimit: {
      limit: 20,
      period: '1m',
    },
  },
  { event: 'quiz/generate' },
  async ({ event, step }) => {
    const { moduleContent, difficulty, courseId, userId } = event.data;

    // Generate quiz with AI
    const generatedQuiz = await step.run('generate-ai-quiz', async () => {
      return await intelligentAIService.generateQuizForModule(moduleContent, difficulty);
    });

    // Save quiz to database
    const savedQuiz = await step.run('save-quiz', async () => {
      return await Quiz.create({
        course: courseId,
        quizType: 'module',
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        duration: generatedQuiz.duration,
        passingScore: generatedQuiz.passingScore,
        questions: generatedQuiz.questions,
        difficulty: difficulty,
        createdBy: userId,
        metadata: {
          aiGenerated: true,
          generatedAt: new Date(),
        },
      });
    });

    return {
      success: true,
      quiz: savedQuiz,
    };
  }
);

// Content improvement function
const improveContentFunction = inngest.createFunction(
  {
    id: 'improve-content',
    name: 'Improve Content with AI',
    retries: 2,
  },
  { event: 'content/improve' },
  async ({ event, step }) => {
    const { content, type, targetId, userId } = event.data;

    // Improve content with AI
    const improvements = await step.run('improve-with-ai', async () => {
      return await intelligentAIService.improveContent(content, type);
    });

    // Update content in database if targetId provided
    if (targetId) {
      await step.run('update-content', async () => {
        // Update course, lesson, or other content based on type
        if (type === 'course') {
          await Course.findByIdAndUpdate(targetId, {
            $set: {
              description: improvements.improvedContent,
              'metadata.aiImproved': true,
              'metadata.lastImproved': new Date(),
            },
          });
        }
      });
    }

    return {
      success: true,
      improvements: improvements,
    };
  }
);

// Batch processing function
const batchProcessFunction = inngest.createFunction(
  {
    id: 'batch-process-ai',
    name: 'Batch Process AI Requests',
    concurrency: {
      limit: 3, // Limited concurrency for batch jobs
    },
  },
  { event: 'ai/batch-process' },
  async ({ event, step }) => {
    const { requests, userId } = event.data;

    const results = await step.run('process-batch', async () => {
      return await intelligentAIService.processBatchRequests(requests);
    });

    // Send completion notification
    await step.run('notify-completion', async () => {
      await inngest.send({
        name: 'ai/batch-complete',
        data: {
          userId: userId,
          results: results,
          totalRequests: requests.length,
          successCount: results.filter(r => r.status === 'fulfilled').length,
        },
      });
    });

    return {
      success: true,
      results: results,
    };
  }
);

// Health check function
const healthCheckFunction = inngest.createFunction(
  {
    id: 'ai-health-check',
    name: 'AI Services Health Check',
  },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    const healthStatus = await step.run('check-health', async () => {
      return await intelligentAIService.checkHealth();
    });

    // Send alert if unhealthy
    if (Object.values(healthStatus).some(status => status.status === 'unhealthy')) {
      await step.run('send-alert', async () => {
        await inngest.send({
          name: 'ai/health-alert',
          data: {
            status: healthStatus,
            timestamp: new Date().toISOString(),
          },
        });
      });
    }

    return healthStatus;
  }
);

// Helper functions
function convertToCurriculum(modules) {
  return modules.map((module, index) => ({
    title: module.skill,
    description: `Master ${module.skill} through comprehensive lessons and practical exercises`,
    duration: module.estimatedTime || '3 hours',
    lessons: module.modules[0]?.lessons?.map((lesson, lessonIndex) => ({
      title: lesson.title,
      duration: lesson.duration,
      isPreview: index === 0 && lessonIndex === 0,
      videoUrl: lesson.resources?.[0] || '',
      content: lesson.content,
    })) || [
      {
        title: `Introduction to ${module.skill}`,
        duration: '30 minutes',
        isPreview: index === 0,
        videoUrl: 'https://www.youtube.com/watch?v=example',
        content: `Learn the fundamentals of ${module.skill}`,
      },
    ],
    quiz: module.modules[0]?.quiz ? {
      title: `${module.skill} Assessment`,
      description: `Test your understanding of ${module.skill}`,
      duration: 15,
      passingScore: 70,
      questions: module.modules[0].quiz.map(q => ({
        question: q.question,
        type: 'multiple-choice',
        options: q.options,
        correctAnswer: q.options.indexOf(q.answer),
        explanation: q.explanation,
        difficulty: module.difficulty,
      })),
      difficulty: module.difficulty,
      totalQuestions: module.modules[0].quiz.length,
    } : null,
  }));
}

function calculateDuration(modules) {
  const totalHours = modules.reduce((sum, module) => {
    const timeStr = module.estimatedTime || '3 hours';
    const hours = parseInt(timeStr.match(/\d+/)?.[0] || '3');
    return sum + hours;
  }, 0);
  
  return `${totalHours} hours`;
}

// Per-skill generation function (new structured approach)
const generateSkillCourseFunction = inngest.createFunction(
  {
    id: 'generate-skill-course',
    name: 'Generate Course for Single Skill',
    retries: 2,
    concurrency: {
      limit: 5,
    },
    rateLimit: {
      limit: 10,
      period: '1m',
    },
  },
  { event: 'skill/generate-course' },
  async ({ event, step }) => {
    const { skill, difficulty, userId } = event.data;

    // Step 1: Generate structured course data for single skill
    const skillCourseData = await step.run('generate-skill-content', async () => {
      try {
        console.log(`🎯 Generating structured course for skill: ${skill}`);
        
        // Call AI to generate ONLY the strict JSON structure
        const result = await intelligentAIService.generateSkillSteps(skill, difficulty);
        
        console.log(`✅ Skill course data generated for: ${skill}`);
        return result;
      } catch (error) {
        console.error(`❌ Skill generation failed for ${skill}:`, error);
        throw error;
      }
    });

    // Step 2: Validate structure
    await step.run('validate-structure', async () => {
      if (!skillCourseData || !skillCourseData.steps || !Array.isArray(skillCourseData.steps)) {
        throw new Error('Invalid course structure - steps array required');
      }
      
      if (skillCourseData.steps.length < 5) {
        throw new Error('Course must have at least 5 steps per skill');
      }

      // Validate each step has required fields
      skillCourseData.steps.forEach((step, idx) => {
        if (!step.step || !step.estimatedTime || !step.resources || !step.quiz) {
          throw new Error(`Step ${idx + 1} missing required fields`);
        }
        
        if (!Array.isArray(step.quiz) || step.quiz.length < 4) {
          throw new Error(`Step ${idx + 1} must have at least 4 quiz questions`);
        }

        // Validate each quiz question
        step.quiz.forEach((q, qIdx) => {
          if (!q.question || !q.options || !Array.isArray(q.options) || !q.answer) {
            throw new Error(`Step ${idx + 1}, Question ${qIdx + 1} is invalid`);
          }
        });
      });

      console.log(`✅ Validated ${skillCourseData.steps.length} steps for ${skill}`);
      return { valid: true };
    });

    // Step 3: Send completion event
    await step.run('send-completion', async () => {
      await inngest.send({
        name: 'skill/generation-complete',
        data: {
          skill: skill,
          userId: userId,
          stepsGenerated: skillCourseData.steps.length,
          success: true,
        },
      });
    });

    return {
      success: true,
      skill: skill,
      difficulty: difficulty,
      data: skillCourseData,
    };
  }
);

// Export all functions
module.exports = {
  generateCourseFunction,
  generateQuizFunction,
  improveContentFunction,
  batchProcessFunction,
  healthCheckFunction,
  generateSkillCourseFunction,
};