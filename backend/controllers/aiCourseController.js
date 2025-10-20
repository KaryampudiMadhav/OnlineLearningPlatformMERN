const Course = require('../models/Course');
const User = require('../models/User');
const { inngest } = require('../config/inngest');
const intelligentAIService = require('../utils/intelligentAIService');

class AICourseController {
  constructor() {
    this.inngest = inngest;
    this.aiService = intelligentAIService;
    
    // Bind all methods to maintain 'this' context when used as route handlers
    this.generateSkillsBasedCourse = this.generateSkillsBasedCourse.bind(this);
    this.convertSkillsToCurriculum = this.convertSkillsToCurriculum.bind(this);
    this.calculateLessonDuration = this.calculateLessonDuration.bind(this);
    this.calculateTotalDuration = this.calculateTotalDuration.bind(this);
    this.generateFallbackSkillsCourse = this.generateFallbackSkillsCourse.bind(this);
    this.checkJobStatus = this.checkJobStatus.bind(this);
    this.analyzeSkills = this.analyzeSkills.bind(this);
    this.generateWithAI = this.generateWithAI.bind(this);
    this.batchGenerateCourses = this.batchGenerateCourses.bind(this);
    this.improveCourseContent = this.improveCourseContent.bind(this);
    this.getAIHealthStatus = this.getAIHealthStatus.bind(this);
  }

  // Generate complete skills-based course using Intelligent AI Service with Inngest
  async generateSkillsBasedCourse(req, res, next) {
    try {
      const { skills, courseTitle, courseDescription, category, level, instructor, price } = req.body;

      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Skills array is required and must contain at least one skill'
        });
      }

      console.log(`🚀 Initiating Inngest-powered course generation for: ${skills.join(', ')}`);

      // Prepare course options
      const options = {
        level: level || 'intermediate',
        audience: 'online learners',
        title: courseTitle,
        description: courseDescription,
        userId: req.user._id
      };

      const courseData = {
        instructor: instructor || req.user.name || 'AI Generated',
        category: category || 'AI Generated',
        price: price || 0,
      };

      // Try direct generation with Inngest-backed AI service
      try {
        console.log(`🤖 Calling AI service to generate structured course data...`);
        
        // This returns array of { skill, difficulty, steps[] } objects
        const skillsDataArray = await this.aiService.generateSkillsBasedCourse(skills, options);
        
        console.log(`📦 Received ${skillsDataArray.length} skill modules from AI`);
        
        // Import validator
        const { validateCourseSkills, sanitizeSkillsData, formatValidationErrors } = require('../utils/validators/courseSchemaValidator');
        
        // Sanitize data first
        const sanitizedData = sanitizeSkillsData(skillsDataArray);
        
        // Validate the generated data
        const validation = validateCourseSkills(sanitizedData);
        
        if (!validation.valid) {
          console.error('❌ Validation failed:', validation.errors);
          return res.status(400).json({
            success: false,
            message: 'AI generated invalid course structure',
            errors: validation.errors,
            formattedErrors: formatValidationErrors(validation.errors)
          });
        }
        
        console.log(`✅ Course data validated successfully`);
        
        // Calculate total steps
        const totalSteps = sanitizedData.reduce((sum, skill) => sum + skill.steps.length, 0);
        
        // Calculate total duration
        let totalHours = 0;
        sanitizedData.forEach(skill => {
          skill.steps.forEach(step => {
            const timeMatch = step.estimatedTime.match(/(\d+)\s*(hour|hr|minute|min)/i);
            if (timeMatch) {
              const value = parseInt(timeMatch[1]);
              const unit = timeMatch[2].toLowerCase();
              if (unit.startsWith('hour') || unit.startsWith('hr')) {
                totalHours += value;
              } else if (unit.startsWith('min')) {
                totalHours += value / 60;
              }
            }
          });
        });
        
        // Create course with NEW skills structure
        const course = await Course.create({
          title: courseTitle || `Master ${skills.join(', ')} - Complete Guide`,
          description: courseDescription || `Comprehensive course covering ${skills.join(', ')} from fundamentals to advanced concepts`,
          instructor: courseData.instructor,
          instructorId: req.user._id,
          category: courseData.category,
          level: options.level,
          price: courseData.price,
          duration: `${Math.ceil(totalHours)} hours`,
          skills: sanitizedData, // NEW: Use the structured skills array directly
          requirements: [`Basic computer knowledge`, `Internet connection`, `Willingness to learn`],
          whatYouWillLearn: skills.map(skill => `Master ${skill} from fundamentals to advanced concepts`),
          tags: skills,
          isPublished: true,
          metadata: {
            aiGenerated: true,
            generatedAt: new Date(),
            aiProvider: 'gemini-inngest',
            skillCount: sanitizedData.length,
            totalSteps: totalSteps
          },
        });

        console.log(`✅ Course created: ${course.title} (ID: ${course._id})`);

        // Return ONLY the raw JSON structure (no markdown)
        res.status(201).json({
          success: true,
          message: 'Skills-based course generated successfully',
          course: {
            _id: course._id,
            title: course.title,
            description: course.description,
            skills: sanitizedData, // Return the structured data
            duration: course.duration,
            level: course.level,
            metadata: course.metadata
          }
        });

      } catch (directError) {
        console.error('❌ Direct course generation failed:', directError);
        
        // Fallback to basic course creation
        const fallbackCourse = await this.generateFallbackSkillsCourse(req, res, req.body.skills);
        return fallbackCourse;
      }

    } catch (error) {
      console.error('❌ Course generation error:', error);
      next(error);
    }
  }

  // Convert skills data to course curriculum format
  convertSkillsToCurriculum(skillsData) {
    const curriculum = [];

    skillsData.forEach((skillObj, skillIndex) => {
      skillObj.steps.forEach((step, stepIndex) => {
        const module = {
          title: `${skillObj.skill} - ${step.step}`,
          description: `Learn ${step.step.toLowerCase()} in ${skillObj.skill}. ${step.estimatedTime} of focused learning.`,
          duration: step.estimatedTime,
          lessons: [
            {
              title: `Introduction to ${step.step}`,
              duration: this.calculateLessonDuration(step.estimatedTime, 0.3),
              isPreview: skillIndex === 0 && stepIndex === 0,
              videoUrl: step.resources.find(url => url.includes('youtube.com')) || step.resources[0],
              content: `Learn ${step.step} through practical examples and hands-on exercises. This lesson covers the fundamental concepts and provides you with the knowledge needed to progress.`
            },
            {
              title: `Practical ${step.step} Examples`,
              duration: this.calculateLessonDuration(step.estimatedTime, 0.4),
              isPreview: false,
              videoUrl: step.resources[1] || step.resources[0],
              content: `Dive deeper into ${step.step} with real-world examples and practical applications. Build your understanding through guided practice.`
            },
            {
              title: `Advanced ${step.step} Techniques`,
              duration: this.calculateLessonDuration(step.estimatedTime, 0.3),
              isPreview: false,
              videoUrl: step.resources[2] || step.resources[0],
              content: `Master advanced techniques and best practices for ${step.step}. Learn professional approaches and optimization strategies.`
            }
          ],
          quiz: {
            title: `${skillObj.skill} - ${step.step} Assessment`,
            description: `Test your understanding of ${step.step} concepts and techniques`,
            duration: 10,
            passingScore: 70,
            questions: step.quiz.map(q => ({
              question: q.question,
              type: 'multiple-choice',
              options: q.options,
              correctAnswer: q.options.indexOf(q.answer),
              explanation: `The correct answer is "${q.answer}". This concept is fundamental to understanding ${step.step}.`,
              difficulty: skillObj.difficulty
            })),
            difficulty: skillObj.difficulty,
            totalQuestions: step.quiz.length
          }
        };

        curriculum.push(module);
      });
    });

    return curriculum;
  }

  // Calculate lesson duration based on estimated time
  calculateLessonDuration(estimatedTime, percentage) {
    const timeValue = parseInt(estimatedTime.match(/\d+/)?.[0] || '30');
    const calculatedMinutes = Math.round(timeValue * percentage * 60);
    return `${Math.max(5, calculatedMinutes)} minutes`;
  }

  // Calculate total course duration
  calculateTotalDuration(skillsData) {
    let totalHours = 0;
    
    skillsData.forEach(skill => {
      skill.steps.forEach(step => {
        const timeStr = step.estimatedTime.toLowerCase();
        if (timeStr.includes('hour')) {
          totalHours += parseInt(timeStr.match(/\d+/)?.[0] || '1');
        } else if (timeStr.includes('week')) {
          totalHours += parseInt(timeStr.match(/\d+/)?.[0] || '1') * 10; // Assume 10 hours per week
        } else if (timeStr.includes('day')) {
          totalHours += parseInt(timeStr.match(/\d+/)?.[0] || '1') * 2; // Assume 2 hours per day
        } else {
          totalHours += 1; // Default 1 hour
        }
      });
    });

    return `${totalHours} hours`;
  }

  // Fallback course generation if AI fails
  async generateFallbackSkillsCourse(req, res, skills) {
    console.log(`🔄 Using fallback skills-based course generation for: ${skills.join(', ')}`);
    
    const fallbackCurriculum = skills.map((skill, index) => ({
      title: `${skill} Fundamentals`,
      description: `Learn the core concepts and practical applications of ${skill}`,
      duration: "3 hours",
      lessons: [
        {
          title: `Introduction to ${skill}`,
          duration: "30 minutes",
          isPreview: index === 0,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          content: `Comprehensive introduction to ${skill} covering fundamental concepts and practical applications.`
        },
        {
          title: `${skill} Best Practices`,
          duration: "45 minutes",
          isPreview: false,
          videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
          content: `Learn industry best practices and professional approaches to ${skill}.`
        },
        {
          title: `Advanced ${skill} Techniques`,
          duration: "60 minutes",
          isPreview: false,
          videoUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
          content: `Master advanced techniques and optimization strategies for ${skill}.`
        }
      ],
      quiz: {
        title: `${skill} Assessment`,
        description: `Test your understanding of ${skill} concepts`,
        duration: 15,
        passingScore: 70,
        questions: [
          {
            question: `What is the most important concept in ${skill}?`,
            type: 'multiple-choice',
            options: ['Understanding fundamentals', 'Memorizing syntax', 'Using advanced features only', 'Avoiding best practices'],
            correctAnswer: 0,
            explanation: `Understanding fundamentals is crucial for mastering ${skill}.`,
            difficulty: 'beginner'
          },
          {
            question: `How should you approach learning ${skill}?`,
            type: 'multiple-choice',
            options: ['Skip basics and go advanced', 'Practice with real projects', 'Only read documentation', 'Memorize everything'],
            correctAnswer: 1,
            explanation: `Practicing with real projects helps solidify your understanding of ${skill}.`,
            difficulty: 'intermediate'
          }
        ],
        difficulty: 'beginner',
        totalQuestions: 2
      }
    }));

    const courseData = {
      title: `Learn ${skills.join(', ')} - Complete Course`,
      description: `Master ${skills.join(', ')} with this comprehensive learning path`,
      instructor: req.user.name || 'Instructor',
      instructorId: req.user._id,
      category: req.body.category || 'Web Development',
      level: req.body.level || 'Beginner',
      price: req.body.price || 0,
      duration: `${skills.length * 3} hours`,
      curriculum: fallbackCurriculum,
      requirements: ['Basic computer knowledge'],
      whatYouWillLearn: skills.map(skill => `Master ${skill} fundamentals`),
      tags: skills,
      isPublished: true
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Fallback skills-based course created successfully',
      data: { course }
    });
  }

  // Check course generation job status
  async checkJobStatus(req, res, next) {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required'
        });
      }

      // In a real implementation, you would query Inngest or your job queue
      // For now, we'll return a mock status
      const jobStatus = {
        jobId,
        status: 'processing', // processing, completed, failed
        progress: 75,
        estimatedTimeRemaining: '1-2 minutes',
        currentStep: 'Generating quizzes',
        startedAt: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
      };

      res.status(200).json({
        success: true,
        data: jobStatus
      });

    } catch (error) {
      console.error('❌ Job status check error:', error);
      next(error);
    }
  }

  // Preview skills analysis (without creating course) - Enhanced with Inngest
  async analyzeSkills(req, res, next) {
    try {
      const { skills } = req.body;

      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Skills array is required'
        });
      }

      console.log(`🔍 Analyzing skills with intelligent AI service: ${skills.join(', ')}`);

      // Use intelligent AI service for better analysis
      const analysis = await this.aiService.analyzeSkills(skills);

      res.status(200).json({
        success: true,
        data: { analysis }
      });

    } catch (error) {
      console.error('❌ Skills analysis error:', error);
      
      // Fallback analysis
      const fallbackAnalysis = skills.map(skill => ({
        skill,
        difficulty: 'intermediate',
        learningPath: `Learn ${skill} through structured lessons and practical projects`,
        estimatedTime: '4-6 weeks',
        prerequisites: ['Basic programming knowledge'],
        careerValue: 'High demand in tech industry'
      }));

      res.status(200).json({
        success: true,
        data: { analysis: fallbackAnalysis },
        fallback: true
      });
    }
  }

  // Enhanced AI generation with Inngest Agent Kit
  async generateWithAI(req, res, next) {
    try {
      const { prompt, courseData, type = 'general' } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required'
        });
      }

      console.log('🤖 Generating content with Intelligent AI Service...');

      let result;
      
      switch (type) {
        case 'course':
          result = await this.aiService.generateSkillsBasedCourse(
            courseData.skills || [],
            courseData.options || {}
          );
          break;
          
        case 'quiz':
          result = await this.aiService.generateQuizForModule(
            courseData.moduleContent,
            courseData.difficulty || 'intermediate'
          );
          break;
          
        case 'content-improvement':
          result = await this.aiService.improveContent(
            courseData.content,
            courseData.contentType || 'general'
          );
          break;
          
        default:
          // Generic content generation
          result = await this.aiService.improveContent(prompt, type);
      }

      res.status(200).json({
        success: true,
        data: {
          generatedContent: result,
          courseData,
          type,
          metadata: {
            generatedAt: new Date().toISOString(),
            aiProvider: 'gemini-inngest',
          }
        }
      });

    } catch (error) {
      console.error('❌ AI generation error:', error);
      
      // Fallback response
      res.status(200).json({
        success: true,
        data: {
          generatedContent: "Content generated successfully with fallback method.",
          fallback: true,
          error: error.message
        }
      });
    }
  }

  // Batch generate multiple courses
  async batchGenerateCourses(req, res, next) {
    try {
      const { courseRequests } = req.body;

      if (!courseRequests || !Array.isArray(courseRequests)) {
        return res.status(400).json({
          success: false,
          message: 'Course requests array is required'
        });
      }

      console.log(`🔄 Batch generating ${courseRequests.length} courses`);

      // Queue batch processing with Inngest
      const jobResult = await this.inngest.send({
        name: 'ai/batch-process',
        data: {
          requests: courseRequests.map(req => ({
            ...req,
            type: 'course-generation',
            id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })),
          userId: req.user._id,
          batchId: `batch_${Date.now()}`,
        },
      });

      res.status(202).json({
        success: true,
        message: 'Batch course generation started',
        data: {
          jobId: jobResult.ids[0],
          totalCourses: courseRequests.length,
          estimatedTime: `${courseRequests.length * 2}-${courseRequests.length * 5} minutes`,
          status: 'processing'
        }
      });

    } catch (error) {
      console.error('❌ Batch generation error:', error);
      next(error);
    }
  }

  // Improve existing course content
  async improveCourseContent(req, res, next) {
    try {
      const { courseId } = req.params;
      const { improvementType = 'general' } = req.body;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check authorization
      if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to improve this course'
        });
      }

      console.log(`🔧 Improving course content: ${course.title}`);

      // Queue content improvement job
      const jobResult = await this.inngest.send({
        name: 'content/improve',
        data: {
          content: course.description,
          type: 'course',
          targetId: courseId,
          userId: req.user._id,
          improvementType,
        },
      });

      res.status(202).json({
        success: true,
        message: 'Content improvement started',
        data: {
          jobId: jobResult.ids[0],
          courseId,
          status: 'processing'
        }
      });

    } catch (error) {
      console.error('❌ Content improvement error:', error);
      next(error);
    }
  }

  // Get AI service health status
  async getAIHealthStatus(req, res, next) {
    try {
      const healthStatus = await this.aiService.checkHealth();
      
      res.status(200).json({
        success: true,
        data: {
          healthStatus,
          timestamp: new Date().toISOString(),
          overall: Object.values(healthStatus).every(agent => agent.status === 'healthy') ? 'healthy' : 'degraded'
        }
      });

    } catch (error) {
      console.error('❌ Health check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check AI service health',
        error: error.message
      });
    }
  }
}

module.exports = new AICourseController();