const { inngest } = require('../config/inngest');
const intelligentAIService = require('../utils/intelligentAIService');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');

/**
 * Dynamic Course Generation - Main Orchestrator
 * Generates complete course with modules, lessons, and quizzes progressively
 */
const generateDynamicCourseFunction = inngest.createFunction(
  {
    id: 'generate-dynamic-course',
    name: 'Generate Complete Course Dynamically',
    retries: 2,
    concurrency: {
      limit: 3,
      key: 'event.data.userId',
    },
    rateLimit: {
      limit: 5,
      period: '1m',
    },
  },
  { event: 'course/generate-dynamic' },
  async ({ event, step }) => {
    const { courseId, userId, config } = event.data;
    const { moduleCount, lessonsPerModule, includeQuizzes } = config;

    console.log(`🚀 Starting dynamic course generation for: ${config.title}`);

    // Step 1: Update course status
    await step.run('update-status-start', async () => {
      await Course.findByIdAndUpdate(courseId, {
        'metadata.generationStatus': 'generating',
        'metadata.progressPercentage': 0
      });
    });

    // Step 2: Generate course outline
    const outline = await step.run('generate-outline', async () => {
      try {
        console.log(`📝 Generating course outline...`);
        const result = await intelligentAIService.generateCourseOutline({
          title: config.title,
          description: config.description,
          category: config.category,
          level: config.level,
          moduleCount,
          skills: config.skills
        });
        
        console.log(`✅ Outline generated with ${result.modules.length} modules`);
        return result;
      } catch (error) {
        console.error('❌ Outline generation failed:', error);
        throw error;
      }
    });

    // Step 3: Generate modules progressively
    const generatedModules = [];
    
    for (let i = 0; i < outline.modules.length; i++) {
      const moduleOutline = outline.modules[i];
      
      const moduleData = await step.run(`generate-module-${i}`, async () => {
        try {
          console.log(`📚 Generating module ${i + 1}/${outline.modules.length}: ${moduleOutline.title}`);
          
          const module = await intelligentAIService.generateModuleContent({
            title: moduleOutline.title,
            description: moduleOutline.description,
            lessonCount: lessonsPerModule,
            courseContext: {
              title: config.title,
              category: config.category,
              level: config.level
            }
          });

          // Update progress
          const progress = Math.round(((i + 1) / outline.modules.length) * 80); // 80% for modules
          await Course.findByIdAndUpdate(courseId, {
            $push: { curriculum: module },
            'metadata.progressPercentage': progress
          });

          console.log(`✅ Module ${i + 1} generated with ${module.lessons.length} lessons`);
          return module;
        } catch (error) {
          console.error(`❌ Module ${i + 1} generation failed:`, error);
          throw error;
        }
      });

      generatedModules.push(moduleData);
      
      // Small delay between modules to avoid rate limits
      if (i < outline.modules.length - 1) {
        await step.sleep(`delay-module-${i}`, '2s'); // 2 second delay
      }
    }

    // Step 4: Generate quizzes if requested and embed them in modules
    let quizzes = [];
    if (includeQuizzes) {
      quizzes = await step.run('generate-and-embed-quizzes', async () => {
        const course = await Course.findById(courseId);
        let successCount = 0;

        for (let index = 0; index < generatedModules.length; index++) {
          try {
            const module = generatedModules[index];
            console.log(`📝 Generating quiz for module ${index + 1}: ${module.title}`);
            
            const quizData = await intelligentAIService.generateModuleQuiz({
              moduleTitle: module.title,
              moduleDescription: module.description,
              lessons: module.lessons,
              difficulty: config.level,
              questionCount: 8
            });

            // Embed quiz directly in the module
            course.curriculum[index].quiz = {
              title: quizData.title || `${module.title} Quiz`,
              description: quizData.description || `Test your understanding of ${module.title}`,
              duration: quizData.duration || 15,
              passingScore: quizData.passingScore || 70,
              questions: quizData.questions,
              difficulty: config.level.toLowerCase(),
              isActive: true
            };

            successCount++;
            console.log(`✅ Quiz embedded in module ${index + 1}: ${module.title}`);
          } catch (error) {
            console.error(`❌ Quiz generation failed for module ${index}:`, error);
          }
        }

        // Save course with embedded quizzes
        await course.save();
        console.log(`✅ ${successCount} quizzes embedded in course modules`);
        
        return successCount;
      });

      // Update progress to 100%
      await step.run('update-progress-quizzes', async () => {
        await Course.findByIdAndUpdate(courseId, {
          'metadata.progressPercentage': 100
        });
      });
    }

    // Step 5: Finalize course
    const finalCourse = await step.run('finalize-course', async () => {
      const course = await Course.findByIdAndUpdate(
        courseId,
        {
          isPublished: true,
          'metadata.generationStatus': 'completed',
          'metadata.generationCompleted': new Date(),
          'metadata.modulesGenerated': generatedModules.length,
          'metadata.quizzesGenerated': quizzes, // This is now the count
          'metadata.progressPercentage': 100
        },
        { new: true }
      );

      console.log(`🎉 Course generation completed: ${course.title}`);
      console.log(`   📚 Modules: ${generatedModules.length}`);
      console.log(`   📝 Lessons: ${generatedModules.reduce((sum, m) => sum + m.lessons.length, 0)}`);
      console.log(`   ❓ Quizzes: ${quizzes}`);
      return course;
    });

    // Step 6: Send completion notification
    await step.run('send-notification', async () => {
      await inngest.send({
        name: 'course/generation-complete',
        data: {
          courseId: finalCourse._id.toString(),
          userId,
          success: true,
          stats: {
            modulesGenerated: generatedModules.length,
            lessonsGenerated: generatedModules.reduce((sum, m) => sum + m.lessons.length, 0),
            quizzesGenerated: quizzes // Now shows actual count
          }
        }
      });
    });

    return {
      success: true,
      course: finalCourse,
      stats: {
        modulesGenerated: generatedModules.length,
        quizzesGenerated: quizzes, // Now the count, not array
        processingTime: Date.now() - event.ts
      }
    };
  }
);

/**
 * Generate Single Module
 */
const generateModuleFunction = inngest.createFunction(
  {
    id: 'generate-module',
    name: 'Generate Single Module',
    retries: 2,
    concurrency: {
      limit: 10,
    },
  },
  { event: 'module/generate' },
  async ({ event, step }) => {
    const { courseId, userId, moduleConfig } = event.data;

    const moduleData = await step.run('generate-module-content', async () => {
      console.log(`📚 Generating module: ${moduleConfig.title}`);
      
      return await intelligentAIService.generateModuleContent({
        title: moduleConfig.title,
        description: moduleConfig.description,
        lessonCount: moduleConfig.lessonCount,
        courseContext: moduleConfig.courseContext
      });
    });

    await step.run('save-module', async () => {
      await Course.findByIdAndUpdate(courseId, {
        $push: { curriculum: moduleData }
      });
      
      console.log(`✅ Module saved: ${moduleConfig.title}`);
    });

    await step.run('notify-completion', async () => {
      await inngest.send({
        name: 'module/generation-complete',
        data: {
          courseId,
          userId,
          moduleTitle: moduleConfig.title,
          success: true
        }
      });
    });

    return {
      success: true,
      module: moduleData
    };
  }
);

/**
 * Generate Lesson Quiz
 */
const generateLessonQuizFunction = inngest.createFunction(
  {
    id: 'generate-lesson-quiz',
    name: 'Generate Quiz for Lesson',
    retries: 2,
    concurrency: {
      limit: 20,
    },
  },
  { event: 'quiz/generate-lesson' },
  async ({ event, step }) => {
    const { courseId, moduleIndex, lessonIndex, userId, config } = event.data;

    const quizData = await step.run('generate-quiz', async () => {
      console.log(`📝 Generating quiz for lesson: ${config.lessonTitle}`);
      
      return await intelligentAIService.generateLessonQuiz({
        lessonTitle: config.lessonTitle,
        lessonContent: config.lessonContent,
        difficulty: config.difficulty,
        questionCount: config.questionCount
      });
    });

    await step.run('save-quiz', async () => {
      const course = await Course.findById(courseId);
      const module = course.curriculum[moduleIndex];
      
      if (!module.lessons[lessonIndex].quiz) {
        module.lessons[lessonIndex].quiz = {
          title: quizData.title,
          description: quizData.description,
          duration: quizData.duration || 10,
          passingScore: 70,
          questions: quizData.questions,
          difficulty: config.difficulty,
          totalQuestions: quizData.questions.length
        };

        await course.save();
        console.log(`✅ Quiz saved for lesson: ${config.lessonTitle}`);
      }
    });

    return {
      success: true,
      quiz: quizData
    };
  }
);

/**
 * Regenerate Module
 */
const regenerateModuleFunction = inngest.createFunction(
  {
    id: 'regenerate-module',
    name: 'Regenerate Module Content',
    retries: 2,
  },
  { event: 'module/regenerate' },
  async ({ event, step }) => {
    const { courseId, moduleIndex, userId, config } = event.data;

    const course = await step.run('get-course', async () => {
      return await Course.findById(courseId);
    });

    const oldQuiz = course.curriculum[moduleIndex]?.quiz;

    const newModuleData = await step.run('regenerate-content', async () => {
      console.log(`🔄 Regenerating module: ${config.moduleTitle}`);
      
      return await intelligentAIService.generateModuleContent({
        title: config.moduleTitle,
        description: config.moduleDescription || `Comprehensive module on ${config.moduleTitle}`,
        lessonCount: course.curriculum[moduleIndex]?.lessons?.length || 4,
        courseContext: config.courseContext
      });
    });

    await step.run('update-module', async () => {
      // Keep old quiz if requested
      if (config.keepQuiz && oldQuiz) {
        newModuleData.quiz = oldQuiz;
      }

      course.curriculum[moduleIndex] = newModuleData;
      await course.save();
      
      console.log(`✅ Module regenerated: ${config.moduleTitle}`);
    });

    return {
      success: true,
      module: newModuleData
    };
  }
);

/**
 * Enhance Content
 */
const enhanceContentFunction = inngest.createFunction(
  {
    id: 'enhance-content',
    name: 'Enhance Module Content with AI',
    retries: 2,
  },
  { event: 'content/enhance' },
  async ({ event, step }) => {
    const { courseId, moduleIndex, userId, config } = event.data;

    const enhancedContent = await step.run('enhance-with-ai', async () => {
      console.log(`✨ Enhancing content with type: ${config.enhancementType}`);
      
      return await intelligentAIService.enhanceContent({
        content: config.currentContent,
        enhancementType: config.enhancementType, // expand, simplify, add-examples
        context: {
          courseId,
          moduleIndex
        }
      });
    });

    await step.run('update-content', async () => {
      const course = await Course.findById(courseId);
      
      // Update module with enhanced content
      course.curriculum[moduleIndex].description = enhancedContent.description;
      course.curriculum[moduleIndex].lessons = enhancedContent.lessons;
      
      if (!course.metadata) course.metadata = {};
      course.metadata.lastEnhanced = new Date();
      course.metadata.aiEnhanced = true;

      await course.save();
      console.log(`✅ Content enhanced for module ${moduleIndex}`);
    });

    return {
      success: true,
      enhancedContent
    };
  }
);

// Export all functions
module.exports = {
  generateDynamicCourseFunction,
  generateModuleFunction,
  generateLessonQuizFunction,
  regenerateModuleFunction,
  enhanceContentFunction
};
