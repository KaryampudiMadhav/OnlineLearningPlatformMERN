const { agentConfig, executeWithAgent, processBatch, checkAgentHealth } = require('../config/inngest');
const { generateSkillsBasedCourse: aiGenerateSkillsBasedCourse } = require('./aiService');

class IntelligentAIService {
  constructor() {
    this.agentConfig = agentConfig;
    this.executeWithAgent = executeWithAgent;
    this.processBatch = processBatch;
    this.checkAgentHealth = checkAgentHealth;
    this.requestQueue = new Map();
  }

  // NEW: Generate structured steps for a single skill (returns strict JSON)
  async generateSkillSteps(skill, difficulty = 'intermediate') {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    try {
      console.log(`🎯 Generating structured steps for skill: ${skill} (${difficulty})`);
      
      const strictPrompt = `You are an expert course designer. Generate a detailed learning path for the skill: "${skill}" at ${difficulty} level.

CRITICAL: Return ONLY raw JSON, no markdown, no code blocks, no extra text.

The JSON structure must be exactly:
{
  "skill": "${skill}",
  "difficulty": "${difficulty}",
  "steps": [
    {
      "step": "Step title",
      "estimatedTime": "X hours/minutes",
      "tags": ["tag1", "tag2"],
      "resources": ["url1", "url2", "url3"],
      "quiz": [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "answer": "Correct option"
        }
      ]
    }
  ]
}

Requirements:
- Generate AT LEAST 5 steps per skill
- Each step must have 3+ resources (use real educational URLs like MDN, W3Schools, YouTube channels, official docs)
- Each step must have 4-5 quiz questions
- Each quiz question must have 4 options
- Tags should be relevant technical keywords

Generate the complete JSON now:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096, // Enough for detailed structure
        }
      });

      const result = await model.generateContent(strictPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean response - remove markdown code blocks if present
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      console.log('📦 Raw AI response (first 200 chars):', text.substring(0, 200));
      
      // Parse JSON
      const parsedData = JSON.parse(text);
      
      // Validate structure
      if (!parsedData.steps || !Array.isArray(parsedData.steps) || parsedData.steps.length < 5) {
        throw new Error('AI did not return at least 5 steps');
      }
      
      console.log(`✅ Generated ${parsedData.steps.length} steps for ${skill}`);
      return parsedData;
      
    } catch (error) {
      console.error(`❌ Skill step generation failed for ${skill}:`, error);
      
      // Fallback: generate minimal valid structure
      console.log('🔄 Using fallback step generation...');
      return this.generateFallbackSkillSteps(skill, difficulty);
    }
  }

  // Enhanced course generation with retry logic and token management
  async generateSkillsBasedCourse(skills, options = {}) {
    const agentId = 'course-generator';
    
    try {
      console.log(`🚀 Generating skills-based course for: ${skills.join(', ')}`);
      
      // NEW APPROACH: Generate per-skill using Inngest
      const { inngest } = require('../config/inngest');
      const skillResults = [];
      
      // Submit Inngest jobs for each skill
      for (const skill of skills) {
        console.log(`📤 Submitting Inngest job for skill: ${skill}`);
        
        try {
          const jobResult = await inngest.send({
            name: 'skill/generate-course',
            data: {
              skill: skill,
              difficulty: options.level || 'intermediate',
              userId: options.userId || 'system',
            },
          });
          
          skillResults.push({
            skill: skill,
            jobId: jobResult.ids[0],
            status: 'pending',
          });
          
        } catch (inngestError) {
          console.warn(`⚠️ Inngest job failed for ${skill}, using direct generation:`, inngestError);
          
          // Fallback: generate directly without Inngest
          const directResult = await this.generateSkillSteps(skill, options.level || 'intermediate');
          skillResults.push({
            skill: skill,
            data: directResult,
            status: 'completed',
          });
        }
      }
      
      // Wait for all jobs to complete (or use direct results)
      const completedResults = [];
      for (const result of skillResults) {
        if (result.status === 'completed' && result.data) {
          completedResults.push(result.data);
        } else {
          // For Inngest jobs, generate directly as fallback
          console.log(`🔄 Generating directly for ${result.skill}...`);
          const data = await this.generateSkillSteps(result.skill, options.level || 'intermediate');
          completedResults.push(data);
        }
      }

      console.log(`✅ Successfully generated course with ${completedResults.length} skill modules`);
      return completedResults;

    } catch (error) {
      console.error(`❌ Course generation failed:`, error);
      
      // Fallback to basic course generation
      console.log('🔄 Using fallback course generation...');
      return this.generateFallbackCourse(skills, options);
    }
  }

  // Mock AI service call (replace with real Gemini API call later)
  async callAIService(agent, prompt) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Return structured response based on prompt type
    if (prompt.type === 'quiz') {
      return {
        content: JSON.stringify(this.generateMockQuizData(prompt.moduleContent, prompt.difficulty, prompt.questionCount))
      };
    } else {
      return {
        content: JSON.stringify(this.generateMockCourseData(prompt.skills, prompt.options))
      };
    }
  }

  // Build quiz generation prompt
  buildQuizGenerationPrompt(moduleContent, difficulty, questionCount) {
    return {
      type: 'quiz',
      moduleContent,
      difficulty,
      questionCount,
      instructions: `Generate ${questionCount} ${difficulty} level quiz questions for the module: ${moduleContent.title}`
    };
  }

  // Parse quiz response
  parseQuizResponse(response, moduleContent, difficulty, questionCount) {
    try {
      const quizData = JSON.parse(response.content);
      return {
        title: `${moduleContent.title} Assessment`,
        description: `Test your understanding of ${moduleContent.title}`,
        difficulty,
        duration: Math.max(10, questionCount * 2), // 2 minutes per question
        passingScore: 70,
        questions: quizData.questions || quizData,
        metadata: {
          generatedAt: new Date().toISOString(),
          difficulty,
          questionCount: quizData.questions ? quizData.questions.length : questionCount,
        },
      };
    } catch (error) {
      console.error('Failed to parse quiz response:', error);
      // Return fallback structure
      return this.generateFallbackQuiz(moduleContent, difficulty);
    }
  }

  // Generate mock quiz data
  generateMockQuizData(moduleContent, difficulty, questionCount) {
    const difficultyMap = {
      'beginner': { time: 1, complexity: 'basic' },
      'intermediate': { time: 2, complexity: 'moderate' },
      'advanced': { time: 3, complexity: 'complex' }
    };

    const config = difficultyMap[difficulty] || difficultyMap['intermediate'];

    return {
      questions: Array.from({ length: questionCount }, (_, i) => ({
        question: `${config.complexity} question ${i + 1} about ${moduleContent.title}?`,
        type: 'multiple-choice',
        options: [
          `Correct answer about ${moduleContent.title}`,
          `Plausible but incorrect option A`,
          `Plausible but incorrect option B`,
          `Clearly incorrect option`
        ],
        correctAnswer: 0,
        explanation: `This ${difficulty} level question tests your understanding of key concepts in ${moduleContent.title}.`,
        difficulty,
        estimatedTime: config.time
      }))
    };
  }

  // Generate mock course data for testing
  generateMockCourseData(skills, options) {
    return skills.map(skill => ({
      skill,
      difficulty: options.level || 'intermediate',
      estimatedTime: '4 hours',
      modules: [{
        title: `${skill} Mastery`,
        description: `Complete guide to ${skill}`,
        lessons: [
          {
            title: `${skill} Fundamentals`,
            content: `Learn the basics of ${skill}`,
            duration: '45 minutes',
            resources: [
              'https://developer.mozilla.org/',
              'https://www.youtube.com/watch?v=example',
              'https://www.freecodecamp.org/'
            ]
          },
          {
            title: `Advanced ${skill} Concepts`,
            content: `Deep dive into ${skill} advanced topics`,
            duration: '60 minutes',
            resources: [
              'https://docs.github.com/',
              'https://stackoverflow.com/',
              'https://medium.com/'
            ]
          }
        ],
        quiz: [
          {
            question: `What is ${skill} primarily used for?`,
            options: ['Web development', 'Mobile apps', 'Desktop apps', 'All of the above'],
            answer: 'All of the above',
            explanation: `${skill} is versatile and can be used across multiple platforms.`
          },
          {
            question: `Which is a best practice when learning ${skill}?`,
            options: ['Practice regularly', 'Skip fundamentals', 'Avoid documentation', 'Learn everything at once'],
            answer: 'Practice regularly',
            explanation: `Regular practice is essential for mastering ${skill}.`
          }
        ]
      }]
    }));
  }

  // Analyze skills without generating full course
  async analyzeSkills(skills) {
    try {
      console.log(`🔍 Analyzing skills: ${skills.join(', ')}`);
      
      // Fallback analysis for now
      return skills.map(skill => ({
        skill,
        difficulty: this.estimateSkillDifficulty(skill),
        learningPath: `Learn ${skill} through structured lessons and hands-on practice`,
        estimatedTime: this.estimateLearningTime(skill),
        prerequisites: this.getSkillPrerequisites(skill),
        careerValue: this.assessCareerValue(skill),
        topics: this.getSkillTopics(skill),
        resources: this.getSkillResources(skill),
      }));
    } catch (error) {
      console.error(`❌ Skills analysis failed:`, error);
      throw error;
    }
  }

  // Enhanced quiz generation with multiple difficulty levels
  async generateQuizForModule(moduleContent, difficulty = 'intermediate') {
    const agentId = 'quiz-generator';
    
    try {
      console.log(`📝 Generating ${difficulty} quiz for: ${moduleContent.title}`);
      
      const questionCount = this.getQuestionCountByDifficulty(difficulty);
      const prompt = this.buildQuizGenerationPrompt(moduleContent, difficulty, questionCount);
      
      // Use the new executeWithAgent function with circuit breaker
      const response = await this.executeWithAgent(agentId, async (agent) => {
        return await this.callAIService(agent, prompt);
      });

      const quizData = this.parseQuizResponse(response, moduleContent, difficulty, questionCount);
      
      console.log(`✅ Generated ${difficulty} quiz with ${quizData.questions.length} questions`);
      return quizData;
      
    } catch (error) {
      console.error(`❌ Quiz generation failed:`, error);
      console.log('🔄 Using fallback quiz generation...');
      return this.generateFallbackQuiz(moduleContent, difficulty);
    }
  }

  // Enhanced content improvement with AI suggestions
  async improveContent(content, type = 'general') {
    try {
      console.log(`🔧 Improving ${type} content`);
      
      // Mock improvement for now
      return {
        improvedContent: `Enhanced: ${content}`,
        suggestions: [
          {
            type: 'clarity',
            original: content.substring(0, 50),
            improved: `Clearer version: ${content.substring(0, 50)}`,
            reason: 'Improved readability and clarity'
          }
        ],
        score: 8
      };
    } catch (error) {
      console.error(`❌ Content improvement failed:`, error);
      return { improved: content, suggestions: [] };
    }
  }

  // Enhanced chatbot with context awareness
  async getChatbotResponse(message, context = {}) {
    try {
      console.log(`💬 Processing chatbot message: ${message.substring(0, 50)}...`);
      
      // Mock chatbot response for now
      return {
        message: `Thanks for your question about "${message}". I'm here to help with your learning journey!`,
        suggestions: ['Try our practice exercises', 'Check out related courses'],
        resources: ['Documentation', 'Video tutorials'],
        confidence: 0.8,
      };
    } catch (error) {
      console.error(`❌ Chatbot response failed:`, error);
      return {
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        error: true,
      };
    }
  }

  // Check health of AI agents
  async checkHealth() {
    const healthStatus = {};
    
    // Test each agent status
    for (const agentId of ['course-generator', 'quiz-generator', 'content-assistant', 'support-chatbot']) {
      try {
        healthStatus[agentId] = {
          status: 'healthy',
          responseTime: Math.random() * 100 + 50, // Simulate response time
          lastChecked: new Date().toISOString(),
        };
      } catch (error) {
        healthStatus[agentId] = {
          status: 'unhealthy',
          error: error.message,
          lastChecked: new Date().toISOString(),
        };
      }
    }
    
    return healthStatus;
  }

  // Batch processing for multiple AI requests
  async processBatchRequests(requests) {
    const results = [];
    const batchSize = 5; // Process 5 requests at a time
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (request) => {
        try {
          switch (request.type) {
            case 'course-generation':
              return await this.generateSkillsBasedCourse(request.skills, request.options);
            case 'quiz-generation':
              return await this.generateQuizForModule(request.content, request.difficulty);
            case 'content-improvement':
              return await this.improveContent(request.content, request.type);
            default:
              throw new Error(`Unknown request type: ${request.type}`);
          }
        } catch (error) {
          return { error: error.message, requestId: request.id };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  // Helper methods for prompt building
  buildCourseGenerationPrompt(skills, options) {
    return `
You are an expert course designer. Create a comprehensive course structure for the following skills: ${skills.join(', ')}.

Requirements:
- Generate ${skills.length} main modules (one per skill)
- Each module should have 3-5 lessons
- Include practical exercises and projects
- Create 4-6 quiz questions per module
- Provide real resource URLs (YouTube, documentation, tutorials)
- Difficulty level: ${options.level || 'intermediate'}
- Target audience: ${options.audience || 'general learners'}

Return ONLY valid JSON.`;
  }

  buildSkillsAnalysisPrompt(skills) {
    return `
Analyze these technical skills: ${skills.map(skill => `"${skill}"`).join(', ')}.

For each skill, provide comprehensive analysis including:
- difficulty: "beginner", "intermediate", or "advanced"
- learningPath: Detailed description of the learning journey
- estimatedTime: Total time to achieve proficiency
- prerequisites: Required knowledge before starting
- careerValue: Market demand and career opportunities

Return ONLY valid JSON.`;
  }

  // Response parsing methods
  parseCourseResponse(response) {
    try {
      const cleanResponse = this.cleanJsonResponse(response.content || response);
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Failed to parse course response:', error);
      throw new Error('Invalid course generation response format');
    }
  }

  parseSkillsAnalysis(response) {
    try {
      const cleanResponse = this.cleanJsonResponse(response.content || response);
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Failed to parse skills analysis:', error);
      throw new Error('Invalid skills analysis response format');
    }
  }

  // Quiz generation helper methods
  buildQuizGenerationPrompt(moduleContent, difficulty, questionCount) {
    return {
      moduleContent,
      difficulty,
      questionCount,
      prompt: `Generate ${questionCount} ${difficulty} level quiz questions for "${moduleContent.title}". 
               Include multiple choice questions with 4 options each, correct answers, and explanations.`
    };
  }

  parseQuizResponse(response, moduleContent, difficulty, questionCount) {
    try {
      // For now, generate structured quiz data
      return {
        title: `${moduleContent.title} Assessment`,
        description: `Test your understanding of ${moduleContent.title}`,
        difficulty,
        duration: Math.max(10, questionCount * 2), // 2 minutes per question minimum
        passingScore: difficulty === 'beginner' ? 60 : difficulty === 'intermediate' ? 70 : 80,
        questions: Array.from({ length: questionCount }, (_, i) => ({
          question: `Advanced question ${i + 1} about ${moduleContent.title}?`,
          type: 'multiple-choice',
          options: [
            `Correct answer for ${moduleContent.title}`,
            `Incorrect option A`,
            `Incorrect option B`,
            `Incorrect option C`
          ],
          correctAnswer: 0,
          explanation: `This question tests your understanding of key concepts in ${moduleContent.title}.`,
          difficulty,
          points: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 10 : 15
        })),
        metadata: {
          generatedAt: new Date().toISOString(),
          difficulty,
          questionCount,
          moduleTitle: moduleContent.title
        },
      };
    } catch (error) {
      console.error('Failed to parse quiz response:', error);
      throw new Error('Invalid quiz generation response format');
    }
  }

  // Utility methods
  cleanJsonResponse(response) {
    if (typeof response !== 'string') {
      return JSON.stringify(response);
    }
    
    return response
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();
  }

  validateCourseStructure(courseData) {
    if (!Array.isArray(courseData)) return false;
    
    return courseData.every(skill => 
      skill.skill && 
      skill.difficulty && 
      skill.steps && 
      Array.isArray(skill.steps) &&
      skill.steps.length > 0 &&
      skill.steps.every(step => 
        step.step &&
        step.estimatedTime &&
        Array.isArray(step.resources) &&
        step.resources.length > 0 &&
        Array.isArray(step.quiz) &&
        step.quiz.length > 0
      )
    );
  }

  formatCourseData(courseData, skills, options) {
    return {
      title: options.title || `Master ${skills.join(', ')} - Complete Learning Path`,
      description: options.description || `Comprehensive course covering ${skills.join(', ')}`,
      skills: skills,
      skillsData: courseData, // New structure: array of {skill, difficulty, steps[]}
      metadata: {
        generatedAt: new Date().toISOString(),
        skillCount: skills.length,
        totalSteps: courseData.reduce((sum, skill) => sum + skill.steps.length, 0),
        difficulty: options.level || 'intermediate',
      },
    };
  }

  getQuestionCountByDifficulty(difficulty) {
    const counts = {
      'beginner': 4,
      'intermediate': 6,
      'advanced': 8,
    };
    return counts[difficulty] || 6;
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper methods for fallback analysis
  estimateSkillDifficulty(skill) {
    const advanced = ['machine learning', 'ai', 'blockchain', 'kubernetes', 'microservices'];
    const beginner = ['html', 'css', 'basic javascript', 'git basics'];
    
    const skillLower = skill.toLowerCase();
    if (advanced.some(adv => skillLower.includes(adv))) return 'advanced';
    if (beginner.some(beg => skillLower.includes(beg))) return 'beginner';
    return 'intermediate';
  }

  estimateLearningTime(skill) {
    const difficulty = this.estimateSkillDifficulty(skill);
    const timeMap = {
      'beginner': '2-4 weeks',
      'intermediate': '6-10 weeks',
      'advanced': '12-20 weeks'
    };
    return timeMap[difficulty];
  }

  getSkillPrerequisites(skill) {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('react')) return ['JavaScript ES6+', 'HTML/CSS'];
    if (skillLower.includes('node')) return ['JavaScript fundamentals'];
    if (skillLower.includes('python')) return ['Programming basics'];
    return ['Basic computer literacy'];
  }

  assessCareerValue(skill) {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('react') || skillLower.includes('javascript')) {
      return 'Very high demand in web development, average salary $75k-$120k';
    }
    if (skillLower.includes('python')) {
      return 'High demand in data science and web development, average salary $70k-$130k';
    }
    return 'Good market demand with competitive salaries';
  }

  getSkillTopics(skill) {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('react')) {
      return ['Components', 'JSX', 'State Management', 'Hooks', 'Routing'];
    }
    if (skillLower.includes('javascript')) {
      return ['Variables', 'Functions', 'Objects', 'Async Programming', 'DOM Manipulation'];
    }
    return ['Fundamentals', 'Best Practices', 'Real-world Applications'];
  }

  getSkillResources(skill) {
    return [
      'Official Documentation',
      'Interactive Online Courses',
      'YouTube Tutorials',
      'Practice Projects',
      'Community Forums'
    ];
  }

  // Circuit breaker implementation
  async handleCircuitBreaker(agentId, error) {
    if (!this.circuitBreaker.has(agentId)) {
      this.circuitBreaker.set(agentId, { failures: 0, lastFailure: null, state: 'closed' });
    }

    const breaker = this.circuitBreaker.get(agentId);
    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= 3) {
      breaker.state = 'open';
      console.log(`🚨 Circuit breaker opened for agent ${agentId}`);
      
      // Reset after 5 minutes
      setTimeout(() => {
        breaker.state = 'half-open';
        breaker.failures = 0;
        console.log(`🔄 Circuit breaker half-opened for agent ${agentId}`);
      }, 5 * 60 * 1000);
    }
  }

  // Fallback method for single skill steps
  generateFallbackSkillSteps(skill, difficulty) {
    console.log(`🔄 Using fallback step generation for: ${skill}`);
    
    return {
      skill: skill,
      difficulty: difficulty,
      steps: [
        {
          step: `Introduction to ${skill}`,
          estimatedTime: '2 hours',
          tags: [skill, 'fundamentals', 'basics'],
          resources: [
            'https://developer.mozilla.org/',
            'https://www.w3schools.com/',
            'https://www.youtube.com/results?search_query=' + encodeURIComponent(skill)
          ],
          quiz: [
            {
              question: `What is ${skill} used for?`,
              options: ['Web development', 'Data analysis', 'Mobile apps', 'All of the above'],
              answer: 'All of the above'
            },
            {
              question: `Why is ${skill} important?`,
              options: ['Industry standard', 'Easy to learn', 'Great community', 'All of the above'],
              answer: 'All of the above'
            },
            {
              question: `Which companies use ${skill}?`,
              options: ['Google', 'Facebook', 'Amazon', 'All major tech companies'],
              answer: 'All major tech companies'
            },
            {
              question: `What is the best way to learn ${skill}?`,
              options: ['Practice coding', 'Watch videos only', 'Read books only', 'Skip fundamentals'],
              answer: 'Practice coding'
            }
          ]
        },
        {
          step: `Core Concepts of ${skill}`,
          estimatedTime: '3 hours',
          tags: [skill, 'concepts', 'theory'],
          resources: [
            'https://github.com/topics/' + skill.toLowerCase().replace(/\s+/g, '-'),
            'https://stackoverflow.com/questions/tagged/' + skill.toLowerCase().replace(/\s+/g, '-'),
            'https://www.freecodecamp.org/'
          ],
          quiz: [
            {
              question: `What are the core features of ${skill}?`,
              options: ['Feature A', 'Feature B', 'Feature C', 'All features'],
              answer: 'All features'
            },
            {
              question: `How does ${skill} compare to alternatives?`,
              options: ['Better performance', 'Easier syntax', 'More features', 'Depends on use case'],
              answer: 'Depends on use case'
            },
            {
              question: `What is a common pattern in ${skill}?`,
              options: ['Pattern A', 'Pattern B', 'Pattern C', 'Pattern D'],
              answer: 'Pattern A'
            },
            {
              question: `What tools work well with ${skill}?`,
              options: ['Tool A', 'Tool B', 'Tool C', 'Many tools'],
              answer: 'Many tools'
            }
          ]
        },
        {
          step: `Practical ${skill} Development`,
          estimatedTime: '4 hours',
          tags: [skill, 'practice', 'projects'],
          resources: [
            'https://codepen.io/',
            'https://codesandbox.io/',
            'https://replit.com/'
          ],
          quiz: [
            {
              question: `What is the first step in a ${skill} project?`,
              options: ['Planning', 'Coding immediately', 'Deployment', 'Testing'],
              answer: 'Planning'
            },
            {
              question: `How do you debug ${skill} code?`,
              options: ['Console logs', 'Debugger tools', 'Code review', 'All methods'],
              answer: 'All methods'
            },
            {
              question: `What is best practice for ${skill}?`,
              options: ['Write clean code', 'Add comments', 'Test thoroughly', 'All of the above'],
              answer: 'All of the above'
            },
            {
              question: `How do you optimize ${skill} code?`,
              options: ['Reduce complexity', 'Use efficient algorithms', 'Profile performance', 'All techniques'],
              answer: 'All techniques'
            }
          ]
        },
        {
          step: `Advanced ${skill} Techniques`,
          estimatedTime: '3 hours',
          tags: [skill, 'advanced', 'optimization'],
          resources: [
            'https://medium.com/tag/' + skill.toLowerCase().replace(/\s+/g, '-'),
            'https://dev.to/t/' + skill.toLowerCase().replace(/\s+/g, ''),
            'https://www.udemy.com/'
          ],
          quiz: [
            {
              question: `What advanced ${skill} concept is important?`,
              options: ['Concept A', 'Concept B', 'Concept C', 'All concepts'],
              answer: 'All concepts'
            },
            {
              question: `How do you scale ${skill} applications?`,
              options: ['Horizontal scaling', 'Vertical scaling', 'Caching', 'Multiple strategies'],
              answer: 'Multiple strategies'
            },
            {
              question: `What security concerns exist with ${skill}?`,
              options: ['XSS attacks', 'SQL injection', 'CSRF', 'All vulnerabilities'],
              answer: 'All vulnerabilities'
            },
            {
              question: `How do you test ${skill} code?`,
              options: ['Unit tests', 'Integration tests', 'E2E tests', 'All types'],
              answer: 'All types'
            }
          ]
        },
        {
          step: `${skill} Best Practices and Production`,
          estimatedTime: '2 hours',
          tags: [skill, 'production', 'deployment'],
          resources: [
            'https://docs.github.com/',
            'https://www.netlify.com/',
            'https://vercel.com/'
          ],
          quiz: [
            {
              question: `What is important for production ${skill} apps?`,
              options: ['Performance', 'Security', 'Scalability', 'All factors'],
              answer: 'All factors'
            },
            {
              question: `How do you deploy ${skill} applications?`,
              options: ['Cloud platforms', 'Traditional servers', 'Containers', 'Various methods'],
              answer: 'Various methods'
            },
            {
              question: `What monitoring is needed for ${skill}?`,
              options: ['Error tracking', 'Performance monitoring', 'User analytics', 'All monitoring'],
              answer: 'All monitoring'
            },
            {
              question: `How do you maintain ${skill} code?`,
              options: ['Regular updates', 'Code reviews', 'Refactoring', 'All practices'],
              answer: 'All practices'
            },
            {
              question: `What documentation is needed for ${skill}?`,
              options: ['API docs', 'Code comments', 'User guides', 'All documentation'],
              answer: 'All documentation'
            }
          ]
        }
      ]
    };
  }

  // Fallback methods
  generateFallbackCourse(skills, options) {
    console.log(`🔄 Using fallback course generation for: ${skills.join(', ')}`);
    
    return {
      title: `Learn ${skills.join(', ')} - Essential Course`,
      description: `Fundamental course covering ${skills.join(', ')}`,
      skills: skills,
      modules: skills.map((skill, index) => ({
        skill,
        difficulty: 'beginner',
        estimatedTime: '3 hours',
        modules: [{
          title: `${skill} Fundamentals`,
          description: `Learn the core concepts of ${skill}`,
          lessons: [
            {
              title: `Introduction to ${skill}`,
              content: `Comprehensive introduction to ${skill}`,
              duration: '30 minutes',
              resources: ['https://developer.mozilla.org/', 'https://www.w3schools.com/']
            }
          ],
          quiz: [{
            question: `What is the most important concept in ${skill}?`,
            options: ['Understanding fundamentals', 'Memorizing syntax', 'Using tools', 'Reading documentation'],
            answer: 'Understanding fundamentals',
            explanation: `Understanding fundamentals is crucial for mastering ${skill}.`
          }]
        }]
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        skillCount: skills.length,
        fallback: true,
      },
    };
  }

  generateFallbackQuiz(moduleContent, difficulty) {
    return {
      title: `${moduleContent.title} Assessment`,
      description: `Test your understanding of ${moduleContent.title}`,
      difficulty,
      duration: 10,
      passingScore: 70,
      questions: [
        {
          question: `What is the main focus of ${moduleContent.title}?`,
          type: 'multiple-choice',
          options: ['Understanding concepts', 'Memorizing facts', 'Using tools', 'Reading documentation'],
          correctAnswer: 0,
          explanation: 'Understanding concepts is the foundation of learning.',
          difficulty
        }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        fallback: true,
      },
    };
  }

  // NEW DYNAMIC GENERATION METHODS

  /**
   * Generate course outline (module titles and descriptions) - WITH REAL, DIVERSE MODULES
   */
  async generateCourseOutline(config) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
      const skillsContext = config.skills?.length > 0 
        ? `\nFocus on these specific skills: ${config.skills.join(', ')}`
        : '';

      const prompt = `You are an expert curriculum designer. Create a COMPREHENSIVE, WELL-STRUCTURED course outline.

**Course Information:**
- Title: ${config.title}
- Description: ${config.description}
- Category: ${config.category}
- Level: ${config.level}
- Number of Modules: ${config.moduleCount}${skillsContext}

**CRITICAL REQUIREMENTS:**
1. Modules must follow a LOGICAL PROGRESSION (beginner → intermediate → advanced concepts)
2. Each module must be DISTINCT and cover different aspects
3. Module titles must be SPECIFIC and descriptive (not generic)
4. Descriptions must explain WHAT students will learn and WHY it matters
5. If skills are provided, ensure modules align with those skills
6. Estimate realistic durations based on content depth

Return ONLY valid JSON (no markdown):

{
  "modules": [
    {
      "title": "Specific, descriptive module title (not 'Module 1: Introduction')",
      "description": "Detailed description of what students will learn and achieve in this module. Include key concepts and outcomes.",
      "estimatedDuration": "X-Y hours (realistic estimate)"
    }
  ]
}

**IMPORTANT:**
- NO generic titles like "Introduction" or "Basics"
- Make each module title MEANINGFUL
- Ensure PROGRESSIVE difficulty
- Cover DIVERSE aspects of ${config.title}

Generate exactly ${config.moduleCount} well-structured modules NOW:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const outline = JSON.parse(text);
      console.log(`✅ Course outline generated with ${outline.modules.length} modules`);
      return outline;

    } catch (error) {
      console.error('❌ Outline generation failed:', error);
      
      // Better fallback outline with some structure
      const topics = config.skills?.length > 0 ? config.skills : 
        ['Fundamentals', 'Core Concepts', 'Practical Application', 'Advanced Topics', 'Best Practices'];
      
      return {
        modules: Array.from({ length: config.moduleCount }, (_, i) => ({
          title: `${topics[i] || `Topic ${i + 1}`} of ${config.title}`,
          description: `Comprehensive coverage of ${topics[i] || 'essential concepts'} with practical examples and real-world applications. Learn key principles and best practices.`,
          estimatedDuration: `${3 + i}  hours`
        }))
      };
    }
  }

  /**
   * Generate complete module with lessons - WITH REAL CONTENT, VIDEOS, AND LINKS
   */
  async generateModuleContent(config) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
      const prompt = `You are an expert course content creator. Generate COMPREHENSIVE, DETAILED module content with REAL resources.

**Module Information:**
- Title: ${config.title}
- Description: ${config.description}
- Course: ${config.courseContext.title} (${config.courseContext.category})
- Level: ${config.courseContext.level}
- Number of Lessons: ${config.lessonCount}

**CRITICAL REQUIREMENTS:**
1. Each lesson MUST have 800-1200 words of DETAILED, EDUCATIONAL content (not placeholders!)
2. Include REAL YouTube video URLs for each lesson (search for actual educational videos)
3. Add 3-5 study resource links per lesson (MDN, W3Schools, official docs, tutorials)
4. Content must be PRACTICAL with code examples, explanations, and real-world applications
5. Use proper markdown formatting for code blocks and lists

Return ONLY valid JSON (no markdown code blocks, no extra text):

{
  "title": "${config.title}",
  "description": "${config.description}",
  "duration": "X hours",
  "lessons": [
    {
      "title": "Specific, descriptive lesson title",
      "duration": "25-35 minutes",
      "isPreview": false,
      "videoUrl": "https://www.youtube.com/watch?v=ACTUAL_VIDEO_ID (find REAL educational videos)",
      "content": "## Introduction\\n\\n[800-1200 words of DETAILED content with examples, explanations, code snippets]\\n\\n## Key Concepts\\n\\n- Concept 1 with explanation\\n- Concept 2 with explanation\\n\\n## Practical Examples\\n\\n\`\`\`javascript\\n// Actual code example\\n\`\`\`\\n\\n## Summary\\n\\n[Comprehensive summary]",
      "resources": [
        "https://developer.mozilla.org/... (actual MDN link)",
        "https://www.w3schools.com/... (actual W3Schools link)",
        "https://github.com/... (actual GitHub repo)",
        "https://stackoverflow.com/... (relevant Stack Overflow)",
        "https://... (official documentation)"
      ]
    }
  ]
}

**IMPORTANT:** 
- NO placeholder text like "Detailed content goes here"
- NO fake URLs like "example.com"
- Use REAL YouTube videos about the topic
- Use REAL documentation links
- Write ACTUAL educational content
- Include code examples where relevant

Generate ${config.lessonCount} complete lessons NOW:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000, // Increased for detailed content
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const moduleData = JSON.parse(text);
      
      // Ensure first lesson is preview
      if (moduleData.lessons && moduleData.lessons.length > 0) {
        moduleData.lessons[0].isPreview = true;
      }

      console.log(`✅ Module generated: ${config.title} with ${moduleData.lessons?.length || 0} lessons`);
      return moduleData;

    } catch (error) {
      console.error('❌ Module generation failed:', error);
      console.error('Error details:', error.message);
      
      // Better fallback with some real content
      return {
        title: config.title,
        description: config.description,
        duration: `${config.lessonCount * 30} minutes`,
        lessons: Array.from({ length: config.lessonCount }, (_, i) => ({
          title: `${config.title} - Lesson ${i + 1}`,
          duration: '30 minutes',
          isPreview: i === 0,
          videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(config.title + ' tutorial')}`,
          content: `# ${config.title} - Lesson ${i + 1}\n\n## Overview\n\nThis lesson covers essential concepts of ${config.title}. You'll learn the fundamental principles and practical applications.\n\n## Key Concepts\n\n- Understanding the basics\n- Practical implementation\n- Best practices\n- Common pitfalls to avoid\n\n## Learning Objectives\n\nBy the end of this lesson, you will:\n- Understand core concepts\n- Be able to implement solutions\n- Apply best practices\n\n## Summary\n\nThis lesson provided a foundation in ${config.title}. Continue practicing and exploring the resources provided.`,
          resources: [
            'https://developer.mozilla.org/',
            'https://www.w3schools.com/',
            'https://github.com/topics',
            'https://stackoverflow.com/'
          ]
        }))
      };
    }
  }

  /**
   * Generate quiz for module - WITH REAL, MEANINGFUL QUESTIONS
   */
  async generateModuleQuiz(config) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
      const lessonTitles = config.lessons.map(l => l.title).join(', ');
      const lessonContent = config.lessons.map(l => l.content?.substring(0, 200) || '').join(' ');
      
      const prompt = `You are an expert educator creating assessment questions. Generate MEANINGFUL, EDUCATIONAL quiz questions.

**Module Information:**
- Title: ${config.moduleTitle}
- Description: ${config.moduleDescription}
- Lessons: ${lessonTitles}
- Level: ${config.difficulty}
- Questions Needed: ${config.questionCount}

**CRITICAL REQUIREMENTS:**
1. Questions MUST test UNDERSTANDING, not just memorization
2. Include a mix of: concepts, practical application, best practices, and problem-solving
3. All 4 options must be plausible (no obvious wrong answers)
4. Explanations must be detailed and educational (2-3 sentences minimum)
5. Cover different aspects of the module content

Return ONLY valid JSON (no markdown):

{
  "title": "${config.moduleTitle} - Assessment",
  "description": "Comprehensive quiz testing your understanding of ${config.moduleTitle}",
  "duration": ${Math.max(15, config.questionCount * 2)},
  "passingScore": 70,
  "questions": [
    {
      "question": "Clear, specific question testing understanding?",
      "type": "multiple-choice",
      "options": [
        "Plausible option A with detail",
        "Plausible option B with detail",
        "Plausible option C with detail",
        "Plausible option D with detail"
      ],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct and why others are wrong. Include learning points.",
      "difficulty": "${config.difficulty}",
      "points": 10
    }
  ]
}

**IMPORTANT:**
- NO generic questions like "What is important?"
- NO obvious answers like "All of the above"
- Test REAL understanding of the topic
- Make questions SPECIFIC to ${config.moduleTitle}
- Include practical scenarios where applicable

Generate ${config.questionCount} high-quality questions NOW:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 3000,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const quizData = JSON.parse(text);
      console.log(`✅ Module quiz generated with ${quizData.questions?.length || 0} questions`);
      return quizData;

    } catch (error) {
      console.error('❌ Module quiz generation failed:', error);
      
      // Better fallback quiz with some real questions
      return {
        title: `${config.moduleTitle} Assessment`,
        description: `Test your knowledge of ${config.moduleTitle}`,
        duration: Math.max(15, config.questionCount * 2),
        passingScore: 70,
        questions: [
          {
            question: `What is the primary purpose of ${config.moduleTitle}?`,
            type: 'multiple-choice',
            options: [
              'To solve specific technical problems',
              'To provide theoretical knowledge only',
              'To replace other technologies',
              'To complicate development processes'
            ],
            correctAnswer: 0,
            explanation: 'This module focuses on practical problem-solving and real-world applications.',
            difficulty: config.difficulty,
            points: 10
          },
          {
            question: `Which best practice is most important when working with ${config.moduleTitle}?`,
            type: 'multiple-choice',
            options: [
              'Understanding core concepts before implementation',
              'Memorizing all syntax',
              'Using the newest features only',
              'Avoiding documentation'
            ],
            correctAnswer: 0,
            explanation: 'Understanding fundamentals is crucial for effective implementation and problem-solving.',
            difficulty: config.difficulty,
            points: 10
          },
          {
            question: `How would you approach learning ${config.moduleTitle} effectively?`,
            type: 'multiple-choice',
            options: [
              'Combine theory with hands-on practice',
              'Only read documentation',
              'Skip basics and start with advanced topics',
              'Rely solely on tutorials'
            ],
            correctAnswer: 0,
            explanation: 'Effective learning combines theoretical understanding with practical application and experimentation.',
            difficulty: config.difficulty,
            points: 10
          }
        ].slice(0, config.questionCount)
      };
    }
  }

  /**
   * Generate quiz for specific lesson
   */
  async generateLessonQuiz(config) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
      const prompt = `Generate a quiz for this lesson:

Lesson Title: ${config.lessonTitle}
Lesson Content: ${config.lessonContent.substring(0, 500)}...
Difficulty: ${config.difficulty}
Number of Questions: ${config.questionCount}

Return ONLY valid JSON (no markdown) with ${config.questionCount} questions in this structure:
{
  "title": "Lesson Quiz",
  "description": "Quiz description",
  "duration": 10,
  "questions": [
    {
      "question": "Question text?",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation",
      "difficulty": "${config.difficulty}"
    }
  ]
}`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1536,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      return JSON.parse(text);

    } catch (error) {
      console.error('❌ Lesson quiz generation failed:', error);
      return {
        title: `${config.lessonTitle} Quiz`,
        description: 'Quick assessment',
        duration: 10,
        questions: []
      };
    }
  }

  /**
   * Enhance existing content
   */
  async enhanceContent(config) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
      let enhancementPrompt = '';
      
      switch (config.enhancementType) {
        case 'expand':
          enhancementPrompt = 'Expand and add more detailed explanations, examples, and depth';
          break;
        case 'simplify':
          enhancementPrompt = 'Simplify the language and make it more accessible for beginners';
          break;
        case 'add-examples':
          enhancementPrompt = 'Add practical code examples and real-world use cases';
          break;
        default:
          enhancementPrompt = 'Improve the overall quality and clarity';
      }

      const prompt = `${enhancementPrompt} for this module content:

Title: ${config.content.title}
Description: ${config.content.description}
Current Lessons: ${JSON.stringify(config.content.lessons).substring(0, 1000)}

Return ONLY valid JSON (no markdown) with enhanced content:
{
  "description": "Enhanced description",
  "lessons": [
    {
      "title": "Enhanced lesson title",
      "duration": "XX minutes",
      "isPreview": false,
      "videoUrl": "url",
      "content": "Enhanced detailed content"
    }
  ]
}`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      return JSON.parse(text);

    } catch (error) {
      console.error('❌ Content enhancement failed:', error);
      return config.content; // Return original if enhancement fails
    }
  }
}

module.exports = new IntelligentAIService();