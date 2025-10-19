// Use native fetch or fallback to node-fetch
const fetch = globalThis.fetch || require('node-fetch');

class DynamicQuizService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  }

  // Generate skills-based learning path with modules and quizzes
  async generateSkillsBasedCurriculum(skills) {
    console.log(`🚀 Generating skills-based curriculum for: ${skills.join(', ')}`);
    
    try {
      const prompt = `Your task is to:
1. Analyze a list of technical skills: ${skills.map(s => `"${s}"`).join(', ')}
2. For each skill, return:
   - difficulty: "beginner", "intermediate", or "advanced"
   - steps: A list of learning modules with:
     - step: A description of what the learner should do
     - resources: 3–5 helpful URLs (YouTube videos, articles, official docs, courses) - USE REAL, WORKING URLs
     - estimatedTime: Estimated time to complete the step (e.g., "2 hours", "1 week")
     - tags: Array of tags like ["project-based", "video", "course", "documentation"]
     - quiz: A short quiz (4–5 questions) for that module step. Each question must include:
        - question: The question text
        - options: Multiple choice options (array of 4 strings)
        - answer: Correct answer from options

🚨 IMPORTANT:
- Return ONLY raw JSON with the structure shown below
- DO NOT wrap output in markdown or code blocks
- Make sure JSON is parsable
- Each skill should have at least 5-7 modules (steps)
- Use REAL working URLs from YouTube, official documentation, popular learning platforms
- Make quizzes challenging and educational
- Progress from basic to advanced concepts in the steps

REQUIRED JSON STRUCTURE:
[
  {
    "skill": "Skill name",
    "difficulty": "beginner",
    "steps": [
      {
        "step": "Learn basic syntax and fundamentals",
        "estimatedTime": "2 hours",
        "tags": ["video", "documentation"],
        "resources": [
          "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          "https://www.codecademy.com/learn/introduction-to-javascript"
        ],
        "quiz": [
          {
            "question": "What is the correct way to declare a variable in JavaScript?",
            "options": ["var myVar = 5;", "int myVar = 5;", "let myVar = five;", "variable myVar = 5;"],
            "answer": "var myVar = 5;"
          },
          {
            "question": "Which data type is NOT primitive in JavaScript?",
            "options": ["string", "number", "object", "boolean"],
            "answer": "object"
          }
        ]
      }
    ]
  }
]`;

      const response = await this.makeGeminiRequest(prompt);
      
      if (response && Array.isArray(response)) {
        console.log(`✅ Generated skills-based curriculum for ${response.length} skills`);
        return response;
      } else {
        throw new Error('Invalid skills-based curriculum response format');
      }
      
    } catch (error) {
      console.error('❌ Failed to generate skills-based curriculum:', error);
      return this.generateFallbackSkillsCurriculum(skills);
    }
  }

  generateFallbackSkillsCurriculum(skills) {
    console.log(`🔄 Using fallback skills-based curriculum for: ${skills.join(', ')}`);
    
    return skills.map(skill => ({
      skill: skill,
      difficulty: 'beginner',
      steps: [
        {
          step: `Learn ${skill} fundamentals and core concepts`,
          estimatedTime: '3 hours',
          tags: ['video', 'documentation', 'beginner'],
          resources: [
            'https://www.youtube.com/results?search_query=' + encodeURIComponent(skill + ' tutorial'),
            'https://www.google.com/search?q=' + encodeURIComponent(skill + ' documentation'),
            'https://www.udemy.com/courses/search/?q=' + encodeURIComponent(skill)
          ],
          quiz: [
            {
              question: `What is ${skill} primarily used for?`,
              options: [
                'Building and creating software solutions',
                'Only for academic purposes',
                'Hardware configuration',
                'Database management only'
              ],
              answer: 'Building and creating software solutions'
            },
            {
              question: `What is the first step in learning ${skill}?`,
              options: [
                'Understanding the basic concepts and terminology',
                'Building complex projects immediately',
                'Memorizing all advanced features',
                'Skipping documentation'
              ],
              answer: 'Understanding the basic concepts and terminology'
            }
          ]
        },
        {
          step: `Set up development environment for ${skill}`,
          estimatedTime: '1 hour',
          tags: ['setup', 'tools', 'environment'],
          resources: [
            'https://www.youtube.com/results?search_query=' + encodeURIComponent(skill + ' setup'),
            'https://www.google.com/search?q=' + encodeURIComponent(skill + ' installation guide')
          ],
          quiz: [
            {
              question: `Why is setting up a proper development environment important for ${skill}?`,
              options: [
                'It ensures efficient workflow and reduces errors',
                'It is not important at all',
                'Only for professional developers',
                'To make the computer slower'
              ],
              answer: 'It ensures efficient workflow and reduces errors'
            }
          ]
        },
        {
          step: `Build your first project with ${skill}`,
          estimatedTime: '4 hours',
          tags: ['project-based', 'hands-on', 'practice'],
          resources: [
            'https://www.youtube.com/results?search_query=' + encodeURIComponent(skill + ' beginner project'),
            'https://github.com/search?q=' + encodeURIComponent(skill + ' examples')
          ],
          quiz: [
            {
              question: `What is the benefit of building projects while learning ${skill}?`,
              options: [
                'Practical experience reinforces theoretical knowledge',
                'Projects are a waste of time',
                'Only reading is sufficient',
                'Projects make learning harder'
              ],
              answer: 'Practical experience reinforces theoretical knowledge'
            }
          ]
        },
        {
          step: `Learn ${skill} best practices and design patterns`,
          estimatedTime: '5 hours',
          tags: ['best-practices', 'patterns', 'advanced'],
          resources: [
            'https://www.youtube.com/results?search_query=' + encodeURIComponent(skill + ' best practices'),
            'https://www.google.com/search?q=' + encodeURIComponent(skill + ' design patterns')
          ],
          quiz: [
            {
              question: `Why are best practices important in ${skill}?`,
              options: [
                'They improve code quality, maintainability, and collaboration',
                'They make code more complex',
                'They are optional and not needed',
                'They slow down development'
              ],
              answer: 'They improve code quality, maintainability, and collaboration'
            }
          ]
        },
        {
          step: `Master advanced ${skill} concepts and optimization`,
          estimatedTime: '6 hours',
          tags: ['advanced', 'optimization', 'performance'],
          resources: [
            'https://www.youtube.com/results?search_query=' + encodeURIComponent(skill + ' advanced'),
            'https://www.google.com/search?q=' + encodeURIComponent(skill + ' optimization')
          ],
          quiz: [
            {
              question: `What distinguishes advanced ${skill} developers?`,
              options: [
                'Deep understanding of internals and ability to optimize',
                'Memorizing all syntax',
                'Using the most complex solutions always',
                'Avoiding documentation'
              ],
              answer: 'Deep understanding of internals and ability to optimize'
            }
          ]
        }
      ]
    }));
  }

  // Generate complete dynamic course curriculum
  async generateCompleteCurriculum(courseTitle, courseDescription, courseCategory, courseLevel, moduleCount = 5, lessonsPerModule = 4) {
    console.log(`🚀 Generating complete dynamic curriculum for course: ${courseTitle}`);
    
    try {
      const prompt = `
You are an expert educational content creator and curriculum designer with decades of experience in creating comprehensive, engaging, and effective online courses.

Create a complete course curriculum for:
**Course Title:** ${courseTitle}
**Course Description:** ${courseDescription}
**Category:** ${courseCategory}
**Level:** ${courseLevel}
**Required Modules:** ${moduleCount}
**Lessons per Module:** ${lessonsPerModule}

REQUIREMENTS:
1. Generate exactly ${moduleCount} comprehensive modules that build upon each other logically
2. Each module should have exactly ${lessonsPerModule} lessons with video content
3. Include realistic video URLs (use educational YouTube videos, course platform samples, or educational content)
4. Each lesson should have clear learning objectives and detailed content
5. Progressive difficulty that matches the course level (${courseLevel})
6. Practical, hands-on content where applicable
7. Industry-relevant examples and case studies for ${courseCategory}

RESPONSE FORMAT (JSON):
{
  "curriculum": [
    {
      "title": "Module 1 Title",
      "description": "Comprehensive module description explaining what students will learn",
      "duration": "2 hours",
      "lessons": [
        {
          "title": "Lesson 1.1 Title",
          "duration": "15 minutes",
          "isPreview": true,
          "videoUrl": "https://www.youtube.com/watch?v=SAMPLE_ID",
          "content": "Detailed lesson content, learning objectives, and key concepts covered"
        },
        {
          "title": "Lesson 1.2 Title", 
          "duration": "20 minutes",
          "isPreview": false,
          "videoUrl": "https://www.youtube.com/watch?v=SAMPLE_ID2",
          "content": "Detailed lesson content with practical examples and exercises"
        }
      ]
    }
  ]
}

CONTENT QUALITY STANDARDS:
- Professional, industry-relevant content for ${courseCategory}
- Clear progression from basic to advanced concepts suitable for ${courseLevel} learners
- Practical application and real-world examples
- Engaging and interactive learning experiences
- Comprehensive coverage of the subject matter
- Each lesson builds upon previous knowledge
- Include hands-on projects and exercises where appropriate

VIDEO URL GUIDELINES:
- Use realistic, educational video URLs from platforms like YouTube
- Mix of tutorial videos, lectures, and practical demonstrations
- Ensure URLs are relevant to the lesson content and ${courseCategory}
- First lesson of first module should be preview (isPreview: true)
- Include variety: introductory videos, deep-dive tutorials, case studies

SPECIFIC REQUIREMENTS FOR ${courseCategory}:
- Tailor content specifically to ${courseCategory} industry standards
- Include current tools and technologies used in ${courseCategory}
- Add real-world projects and case studies from ${courseCategory}
- Ensure content matches ${courseLevel} difficulty expectations

Generate a curriculum that would be worth the course price and provide genuine educational value to students pursuing ${courseCategory} at ${courseLevel} level.`;

      const response = await this.makeGeminiRequest(prompt);
      
      if (response && response.curriculum) {
        console.log(`✅ Generated ${response.curriculum.length} dynamic modules for: ${courseTitle}`);
        return response.curriculum;
      } else {
        throw new Error('Invalid curriculum response format');
      }
      
    } catch (error) {
      console.error('❌ Failed to generate dynamic curriculum:', error);
      return this.generateFallbackCurriculum(courseTitle, courseCategory, courseLevel, moduleCount, lessonsPerModule);
    }
  }

  async generateModuleQuizzes(courseTitle, moduleTitle, moduleDescription = '') {
    try {
      console.log(`🎯 Generating AI-powered quiz for module: ${moduleTitle}`);

      // Enhanced prompt for much better quiz generation
      const prompt = `You are an expert educational content creator. Create a comprehensive, high-quality quiz for students learning about "${moduleTitle}" in the course "${courseTitle}".

**Module Context:**
Course: ${courseTitle}
Module: ${moduleTitle}
Description: ${moduleDescription}

**Your Task:**
Generate exactly 5 multiple-choice questions that thoroughly test understanding of "${moduleTitle}". Each question should be:
- Specific to the module content (not generic)
- Educationally valuable and challenging
- Clear and unambiguous
- Progressive in difficulty (basic → intermediate → advanced concepts)

**Question Types to Include:**
1. **Conceptual Understanding** - Test core concepts and definitions
2. **Application** - How to apply the knowledge practically
3. **Analysis** - Compare/contrast or analyze relationships
4. **Problem-Solving** - Scenario-based questions
5. **Critical Thinking** - Evaluate or synthesize information

**Content Guidelines:**
- Make questions SPECIFIC to "${moduleTitle}" - avoid generic learning questions
- Include real-world scenarios and practical applications
- Use technical terms and concepts relevant to the subject
- Ensure each question has one clearly correct answer
- Write detailed explanations that teach additional concepts

**Format Requirements:**
Return ONLY a valid JSON object (no markdown, no extra text):

{
  "title": "${moduleTitle} - Knowledge Assessment",
  "description": "Comprehensive evaluation of ${moduleTitle} concepts and applications",
  "difficulty": "intermediate",
  "questions": [
    {
      "question": "Specific, detailed question about ${moduleTitle} concepts...",
      "options": [
        { "text": "Detailed option A", "isCorrect": false },
        { "text": "Detailed correct option B", "isCorrect": true },
        { "text": "Detailed option C", "isCorrect": false },
        { "text": "Detailed option D", "isCorrect": false }
      ],
      "explanation": "Comprehensive explanation of why this answer is correct and what concept it demonstrates. Include additional learning points."
    }
  ]
}

**Example Quality Standards:**
❌ Bad: "What is the main goal of ${moduleTitle}?"
✅ Good: "When implementing [specific concept from moduleTitle], which approach ensures optimal [specific technical outcome]?"

❌ Bad: "How do you learn ${moduleTitle}?"
✅ Good: "In a scenario where [specific situation], what would be the most effective application of [specific technique from moduleTitle]?"

Generate the quiz now for "${moduleTitle}" - make it challenging, specific, and educational!`;

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            candidateCount: 1,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API Error:', response.status, errorText);
        throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        console.error('❌ Invalid Gemini response:', JSON.stringify(data, null, 2));
        throw new Error('Invalid response from Gemini API');
      }

      const generatedContent = data.candidates[0].content.parts[0].text;
      console.log('🤖 Raw Gemini response length:', generatedContent.length);
      
      // Clean and parse JSON response
      let cleanedContent = generatedContent
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Handle potential JSON wrapper issues
      if (cleanedContent.startsWith('```') || cleanedContent.includes('```')) {
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[0];
        }
      }

      let quizData;
      try {
        quizData = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('📝 Raw content preview:', cleanedContent.substring(0, 200) + '...');
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }

      // Validate and enhance quiz structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        console.error('❌ Invalid quiz structure:', Object.keys(quizData));
        throw new Error('AI response missing questions array');
      }

      // Validate and filter questions
      const validQuestions = quizData.questions.filter((q, index) => {
        const isValid = q.question && 
                       q.options && 
                       Array.isArray(q.options) && 
                       q.options.length === 4 &&
                       q.options.filter(opt => opt.isCorrect === true).length === 1 &&
                       q.explanation;
        
        if (!isValid) {
          console.warn(`⚠️ Invalid question ${index + 1}:`, {
            hasQuestion: !!q.question,
            hasOptions: !!q.options,
            optionsLength: q.options?.length,
            correctAnswers: q.options?.filter(opt => opt.isCorrect === true).length,
            hasExplanation: !!q.explanation
          });
        }
        return isValid;
      });

      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated by AI');
      }

      // Enhance the quiz object
      const enhancedQuiz = {
        title: quizData.title || `${moduleTitle} - AI Assessment`,
        description: quizData.description || `AI-generated quiz covering ${moduleTitle} concepts`,
        difficulty: quizData.difficulty || 'intermediate',
        questions: validQuestions.map(q => ({
          ...q,
          type: 'multiple-choice',
          difficulty: q.difficulty || 'intermediate'
        }))
      };

      console.log(`✅ Generated high-quality quiz with ${validQuestions.length}/5 valid questions for: ${moduleTitle}`);
      
      if (validQuestions.length < 5) {
        console.warn(`⚠️ Only ${validQuestions.length} out of 5 questions were valid. Consider improving prompts.`);
      }

      return [enhancedQuiz]; // Return as array for compatibility

    } catch (error) {
      console.error(`❌ AI Quiz Generation failed for ${moduleTitle}:`, error.message);
      
      // Enhanced fallback with better questions
      console.log(`🔄 Using enhanced fallback quiz for: ${moduleTitle}`);
      return this.generateEnhancedFallbackQuiz(moduleTitle, moduleDescription);
    }
  }

  generateFallbackQuizzes(moduleTitle) {
    console.log(`🔄 Using enhanced fallback quiz generation for: ${moduleTitle}`);
    return this.generateEnhancedFallbackQuiz(moduleTitle, '');
  }

  generateFallbackCurriculum(courseTitle, courseCategory, courseLevel, moduleCount = 5, lessonsPerModule = 4) {
    console.log(`🔄 Using enhanced fallback curriculum generation for: ${courseTitle}`);
    
    const levelPrefix = courseLevel === 'Beginner' ? 'Introduction to' : 
                       courseLevel === 'Advanced' ? 'Advanced' : 'Intermediate';
    
    const modules = [];
    const moduleProgression = [
      'Fundamentals and Setup',
      'Core Concepts and Theory',
      'Practical Applications', 
      'Advanced Techniques and Optimization',
      'Expert Level Implementation',
      'Industry Best Practices',
      'Real-world Projects',
      'Professional Mastery'
    ];
    
    for (let i = 0; i < moduleCount; i++) {
      const progressionLevel = moduleProgression[i] || `Advanced Module ${i + 1}`;
      
      const lessons = [];
      const lessonTypes = [
        'Introduction and Overview',
        'Key Principles and Concepts', 
        'Hands-on Practice Session',
        'Real-world Examples and Case Studies',
        'Best Practices and Standards',
        'Advanced Techniques and Tips',
        'Problem Solving Workshop',
        'Project Implementation'
      ];
      
      for (let j = 0; j < lessonsPerModule; j++) {
        const lessonType = lessonTypes[j] || `Advanced Lesson ${j + 1}`;
        const isFirstLessonOfFirstModule = i === 0 && j === 0;
        
        lessons.push({
          title: `${lessonType}: ${courseTitle}`,
          content: `Comprehensive coverage of ${lessonType.toLowerCase()} in ${courseTitle}. This lesson provides detailed explanation, practical examples, and hands-on exercises specifically designed for ${courseLevel} learners in ${courseCategory}.`,
          duration: `${15 + (j * 3)} minutes`,
          isPreview: isFirstLessonOfFirstModule,
          videoUrl: this.generateRelevantVideoUrl(courseCategory, lessonType, courseTitle),
          materials: [
            `${courseTitle} Study Guide`,
            'Interactive Exercises',
            'Code Examples and Templates',
            'Additional Learning Resources'
          ]
        });
      }
      
      modules.push({
        title: `${progressionLevel}: ${courseTitle}`,
        description: `Comprehensive coverage of ${progressionLevel.toLowerCase()} in ${courseTitle}. Specifically designed for ${courseLevel} level students in ${courseCategory}. Build solid understanding through structured learning and practical application.`,
        duration: `${1.5 + (i * 0.5)} hours`,
        lessons
      });
    }
    
    console.log(`✅ Generated ${modules.length} enhanced fallback modules`);
    return modules;
  }

  generateRelevantVideoUrl(category, lessonType, courseTitle) {
    // Generate realistic educational video URLs based on category
    const videoUrls = {
      'Web Development': [
        'https://www.youtube.com/watch?v=UB1O30fR-EE',
        'https://www.youtube.com/watch?v=hdI2bqOjy3c',
        'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
        'https://www.youtube.com/watch?v=DHjqpvDnNGE',
        'https://www.youtube.com/watch?v=PkZNo7MFNFg'
      ],
      'Data Science': [
        'https://www.youtube.com/watch?v=ua-CiDNNj30',
        'https://www.youtube.com/watch?v=rfscVS0vtbw',
        'https://www.youtube.com/watch?v=HW29067qVWk',
        'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
        'https://www.youtube.com/watch?v=7eh4d6sabA0'
      ],
      'Artificial Intelligence': [
        'https://www.youtube.com/watch?v=ukzFI9rgwfU',
        'https://www.youtube.com/watch?v=aircAruvnKk',
        'https://www.youtube.com/watch?v=ZkjP5RJLQF4',
        'https://www.youtube.com/watch?v=VyWAvY2CF9c',
        'https://www.youtube.com/watch?v=i_McNBDP9Qs'
      ],
      'UI/UX Design': [
        'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
        'https://www.youtube.com/watch?v=TMe0WnkF1Lc',
        'https://www.youtube.com/watch?v=YiLUYf4HDh4',
        'https://www.youtube.com/watch?v=68w2VwalD5w',
        'https://www.youtube.com/watch?v=6t_SimJhEiM'
      ],
      'Mobile Development': [
        'https://www.youtube.com/watch?v=VPvVD8t02Z8',
        'https://www.youtube.com/watch?v=0-S5a0eXPoc',
        'https://www.youtube.com/watch?v=fq4N0hgOWzU',
        'https://www.youtube.com/watch?v=X8ipUgXH6jw',
        'https://www.youtube.com/watch?v=Nu3TKMV-lnE'
      ]
    };
    
    const categoryUrls = videoUrls[category] || videoUrls['Web Development'];
    const randomIndex = Math.floor(Math.random() * categoryUrls.length);
    return categoryUrls[randomIndex];
  }

  generateEnhancedFallbackQuiz(moduleTitle, moduleDescription = '') {
    console.log(`🔄 Using enhanced fallback quiz generation for: ${moduleTitle}`);
    // Much better fallback questions - more specific and educational
    const fallbackQuiz = {
      title: `${moduleTitle} - Assessment Quiz`,
      description: `Comprehensive assessment covering key concepts and practical applications in ${moduleTitle}`,
      difficulty: 'intermediate',
      questions: [
        {
          question: `What are the fundamental principles that govern ${moduleTitle}?`,
          options: [
            { text: 'Core theoretical foundations, practical methodologies, and implementation strategies', isCorrect: true },
            { text: 'Only memorization of basic definitions and terminology', isCorrect: false },
            { text: 'Advanced techniques without foundational understanding', isCorrect: false },
            { text: 'Generic learning approaches without specific focus', isCorrect: false }
          ],
          explanation: `${moduleTitle} is built upon solid theoretical foundations combined with practical methodologies. Understanding both the 'why' and 'how' is essential for mastery.`
        },
        {
          question: `In a professional context, how would you effectively apply ${moduleTitle} concepts?`,
          options: [
            { text: 'Copy existing solutions without understanding the underlying principles', isCorrect: false },
            { text: 'Analyze requirements, apply relevant concepts, and validate results systematically', isCorrect: true },
            { text: 'Use only the most complex approaches regardless of context', isCorrect: false },
            { text: 'Avoid practical application and focus solely on theory', isCorrect: false }
          ],
          explanation: `Effective application requires systematic analysis, thoughtful selection of appropriate concepts, and validation of results in the specific context.`
        },
        {
          question: `What distinguishes advanced understanding of ${moduleTitle} from basic knowledge?`,
          options: [
            { text: 'Ability to memorize more definitions and technical terms', isCorrect: false },
            { text: 'Understanding interconnections, adapting to new scenarios, and solving complex problems', isCorrect: true },
            { text: 'Using the most sophisticated tools without understanding', isCorrect: false },
            { text: 'Following standard procedures without deviation', isCorrect: false }
          ],
          explanation: `Advanced understanding involves seeing connections between concepts, adapting knowledge to new situations, and solving complex, multi-faceted problems.`
        },
        {
          question: `When troubleshooting issues related to ${moduleTitle}, what is the most effective approach?`,
          options: [
            { text: 'Randomly try different solutions until something works', isCorrect: false },
            { text: 'Systematically analyze symptoms, identify root causes, and apply targeted solutions', isCorrect: true },
            { text: 'Always use the same solution regardless of the specific problem', isCorrect: false },
            { text: 'Immediately seek help without attempting any analysis', isCorrect: false }
          ],
          explanation: `Effective troubleshooting requires systematic analysis to identify root causes, followed by the application of targeted solutions based on understanding.`
        },
        {
          question: `How does ${moduleTitle} integrate with broader professional practices and other domains?`,
          options: [
            { text: 'It operates in complete isolation from other knowledge areas', isCorrect: false },
            { text: 'It complements and enhances other skills while contributing to overall expertise', isCorrect: true },
            { text: 'It replaces the need for other knowledge and skills', isCorrect: false },
            { text: 'It only has value when used exactly as originally designed', isCorrect: false }
          ],
          explanation: `${moduleTitle} works best when integrated with broader professional practices, complementing other skills and contributing to comprehensive expertise.`
        }
      ]
    };

    console.log(`✅ Generated enhanced fallback quiz for: ${moduleTitle}`);
    return [fallbackQuiz];
  }

  // Generate skills-based course content
  async generateSkillBasedCourse(skills, courseTitle, courseDescription, difficulty = 'beginner') {
    console.log(`🚀 Generating skills-based course for: ${skills.join(', ')}`);
    
    try {
      const prompt = `
You are an expert educational content creator and technical skills trainer with decades of experience in creating comprehensive, practical online courses.

Your task is to:
1. Analyze a list of technical skills: ${skills.join(', ')}
2. Create a comprehensive course titled: "${courseTitle}"
3. Course description: "${courseDescription}"
4. Target difficulty: ${difficulty}

For each skill, return:
- difficulty: "beginner", "intermediate", or "advanced" 
- steps: A list of learning modules with:
  - step: A description of what the learner should do
  - resources: 3–5 helpful URLs (YouTube videos, articles, official docs, courses)
  - estimatedTime: Estimated time to complete the step (e.g., "2 hours", "1 week")
  - tags: Array of tags like ["project-based", "video", "course", "documentation"]
  - quiz: A short quiz (4–5 questions) for that module step. Each question must include:
     - question: The question text
     - options: Multiple choice options (array of 4 strings)
     - answer: Correct answer from options

🚨 IMPORTANT:
- Return ONLY raw JSON with the structure shown below
- DO NOT wrap output in markdown or code blocks
- Make sure JSON is parsable
- Each skill should have at least 5 modules (steps)
- Use real, working URLs for resources (YouTube, official docs, course platforms)
- Progressive difficulty in steps
- Practical, hands-on learning approach

EXACT JSON STRUCTURE:
[
  {
    "skill": "Skill name",
    "difficulty": "${difficulty}",
    "steps": [
      {
        "step": "Learn basic syntax and setup",
        "estimatedTime": "2 hours",
        "tags": ["video", "documentation"],
        "resources": [
          "https://www.youtube.com/watch?v=example1",
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
        ],
        "quiz": [
          {
            "question": "What is the correct way to declare a variable in JavaScript?",
            "options": ["var myVar = 5;", "int myVar = 5;", "let myVar = five;", "variable myVar = 5;"],
            "answer": "var myVar = 5;"
          },
          {
            "question": "Which of the following is a JavaScript data type?",
            "options": ["String", "Integer", "Float", "Character"],
            "answer": "String"
          }
        ]
      }
    ]
  }
]`;

      const response = await this.makeGeminiRequest(prompt);
      
      if (response && Array.isArray(response)) {
        console.log(`✅ Generated skills-based course with ${response.length} skills`);
        return response;
      } else {
        throw new Error('Invalid skills-based course response format');
      }
      
    } catch (error) {
      console.error('❌ Failed to generate skills-based course:', error);
      return this.generateFallbackSkillsCourse(skills, difficulty);
    }
  }

  // Fallback skills-based course generation
  generateFallbackSkillsCourse(skills, difficulty = 'beginner') {
    console.log(`🔄 Using fallback skills-based course generation for: ${skills.join(', ')}`);
    
    return skills.map(skill => ({
      skill: skill,
      difficulty: difficulty,
      steps: [
        {
          step: `Introduction to ${skill}`,
          estimatedTime: "2 hours",
          tags: ["video", "documentation"],
          resources: [
            "https://www.youtube.com/results?search_query=" + encodeURIComponent(skill + " tutorial"),
            "https://developer.mozilla.org/en-US/docs/",
            "https://www.freecodecamp.org/learn/",
            "https://www.codecademy.com/"
          ],
          quiz: [
            {
              question: `What is ${skill} primarily used for?`,
              options: [
                `${skill} is a modern technology for building applications`,
                `${skill} is only for advanced developers`,
                `${skill} is outdated technology`,
                `${skill} has no practical applications`
              ],
              answer: `${skill} is a modern technology for building applications`
            },
            {
              question: `Which approach is best when learning ${skill}?`,
              options: [
                "Memorizing syntax without understanding",
                "Combining theory with hands-on practice",
                "Only reading documentation",
                "Skipping the basics"
              ],
              answer: "Combining theory with hands-on practice"
            }
          ]
        },
        {
          step: `Core concepts and fundamentals of ${skill}`,
          estimatedTime: "4 hours",
          tags: ["course", "project-based"],
          resources: [
            "https://www.udemy.com/courses/search/?q=" + encodeURIComponent(skill),
            "https://coursera.org/search?query=" + encodeURIComponent(skill),
            "https://edx.org/search?q=" + encodeURIComponent(skill),
            "https://pluralsight.com/search?q=" + encodeURIComponent(skill)
          ],
          quiz: [
            {
              question: `What are the fundamental principles of ${skill}?`,
              options: [
                "Core concepts, best practices, and practical application",
                "Only advanced techniques",
                "Memorization of all functions",
                "Historical background only"
              ],
              answer: "Core concepts, best practices, and practical application"
            },
            {
              question: `How should you practice ${skill} effectively?`,
              options: [
                "Only theoretical study",
                "Building real projects and solving problems",
                "Copying code without understanding",
                "Avoiding challenging exercises"
              ],
              answer: "Building real projects and solving problems"
            }
          ]
        },
        {
          step: `Hands-on project development with ${skill}`,
          estimatedTime: "6 hours",
          tags: ["project-based", "video"],
          resources: [
            "https://github.com/search?q=" + encodeURIComponent(skill + " project"),
            "https://www.youtube.com/results?search_query=" + encodeURIComponent(skill + " project tutorial"),
            "https://codepen.io/search/pens?q=" + encodeURIComponent(skill),
            "https://replit.com/templates"
          ],
          quiz: [
            {
              question: `What is the best way to learn ${skill} through projects?`,
              options: [
                "Start with complex projects immediately",
                "Begin with simple projects and gradually increase complexity",
                "Only follow tutorials without modification",
                "Avoid projects until theory is mastered"
              ],
              answer: "Begin with simple projects and gradually increase complexity"
            },
            {
              question: `How do you debug issues in ${skill} projects?`,
              options: [
                "Guess and check randomly",
                "Systematically identify and fix problems",
                "Restart from scratch every time",
                "Ignore errors and continue"
              ],
              answer: "Systematically identify and fix problems"
            }
          ]
        },
        {
          step: `Advanced techniques and best practices in ${skill}`,
          estimatedTime: "5 hours",
          tags: ["documentation", "course"],
          resources: [
            "https://stackoverflow.com/questions/tagged/" + encodeURIComponent(skill.toLowerCase()),
            "https://medium.com/search?q=" + encodeURIComponent(skill),
            "https://dev.to/search?q=" + encodeURIComponent(skill),
            "https://www.smashingmagazine.com/search/?q=" + encodeURIComponent(skill)
          ],
          quiz: [
            {
              question: `What characterizes advanced ${skill} knowledge?`,
              options: [
                "Memorizing all syntax",
                "Understanding patterns, optimization, and architecture",
                "Using only the newest features",
                "Avoiding documentation"
              ],
              answer: "Understanding patterns, optimization, and architecture"
            },
            {
              question: `How do you stay current with ${skill} developments?`,
              options: [
                "Only read about trends",
                "Practice, experiment, and engage with community",
                "Stick to old methods",
                "Avoid new updates"
              ],
              answer: "Practice, experiment, and engage with community"
            }
          ]
        },
        {
          step: `Professional application and portfolio development with ${skill}`,
          estimatedTime: "8 hours",
          tags: ["project-based", "portfolio"],
          resources: [
            "https://github.com/topics/" + encodeURIComponent(skill.toLowerCase()),
            "https://www.behance.net/search/projects?search=" + encodeURIComponent(skill),
            "https://dribbble.com/search/" + encodeURIComponent(skill),
            "https://awwwards.com/websites/" + encodeURIComponent(skill)
          ],
          quiz: [
            {
              question: `What makes a strong ${skill} portfolio project?`,
              options: [
                "Complex code that nobody can understand",
                "Clean, well-documented, and functional solutions",
                "Copying existing projects exactly",
                "Using every possible feature"
              ],
              answer: "Clean, well-documented, and functional solutions"
            },
            {
              question: `How should you present your ${skill} projects professionally?`,
              options: [
                "Show only the final result",
                "Document process, challenges, and solutions",
                "Hide any difficulties encountered",
                "Focus only on technical details"
              ],
              answer: "Document process, challenges, and solutions"
            }
          ]
        }
      ]
    }));
  }
}

module.exports = new DynamicQuizService();