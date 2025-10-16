const fetch = require('node-fetch');

class DynamicQuizService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
  }

  async generateModuleQuizzes(courseTitle, moduleTitle, moduleDescription = '') {
    try {
      console.log(`🎯 Generating 3 dynamic quizzes for module: ${moduleTitle}`);

      const prompt = `
Generate 3 different quiz assessments for the module "${moduleTitle}" in the course "${courseTitle}".

Module Context: ${moduleDescription}

Create 3 quizzes with different difficulty levels:
1. Beginner Quiz (5 questions) - Basic concepts and definitions
2. Intermediate Quiz (5 questions) - Application and understanding
3. Advanced Quiz (5 questions) - Analysis and critical thinking

For each quiz, provide:
- Quiz title
- Quiz description
- Difficulty level
- 5 multiple choice questions

Each question should have:
- Question text
- 4 answer options (A, B, C, D)
- Correct answer (A, B, C, or D)
- Explanation for the correct answer

Format as valid JSON:
{
  "quizzes": [
    {
      "title": "Quiz title",
      "description": "Quiz description",
      "difficulty": "beginner|intermediate|advanced",
      "questions": [
        {
          "question": "Question text",
          "options": [
            { "text": "Option A", "isCorrect": false },
            { "text": "Option B", "isCorrect": true },
            { "text": "Option C", "isCorrect": false },
            { "text": "Option D", "isCorrect": false }
          ],
          "explanation": "Explanation of correct answer"
        }
      ]
    }
  ]
}

Make questions relevant to "${moduleTitle}" and educational. Ensure each quiz tests different aspects of the module content.`;

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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        throw new Error('Invalid API response format');
      }

      const generatedContent = data.candidates[0].content.parts[0].text;
      
      // Clean and parse JSON
      const cleanedContent = generatedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const quizData = JSON.parse(cleanedContent);

      if (!quizData.quizzes || !Array.isArray(quizData.quizzes)) {
        throw new Error('Invalid quiz data structure');
      }

      console.log(`✅ Successfully generated ${quizData.quizzes.length} quizzes for ${moduleTitle}`);
      return quizData.quizzes;

    } catch (error) {
      console.error(`❌ Failed to generate dynamic quizzes for ${moduleTitle}:`, error);
      
      // Fallback to template quizzes
      return this.generateFallbackQuizzes(moduleTitle);
    }
  }

  generateFallbackQuizzes(moduleTitle) {
    console.log(`🔄 Using fallback quiz generation for: ${moduleTitle}`);
    
    return [
      {
        title: `${moduleTitle} - Fundamentals Quiz`,
        description: `Test your basic understanding of ${moduleTitle} concepts`,
        difficulty: 'beginner',
        questions: [
          {
            question: `What are the key concepts in ${moduleTitle}?`,
            options: [
              { text: 'Fundamental principles and core theory', isCorrect: true },
              { text: 'Advanced optimization techniques only', isCorrect: false },
              { text: 'Historical background information', isCorrect: false },
              { text: 'Unrelated supplementary material', isCorrect: false }
            ],
            explanation: `Understanding the fundamental principles is essential for mastering ${moduleTitle}.`
          },
          {
            question: `Which approach is most effective when learning ${moduleTitle}?`,
            options: [
              { text: 'Memorizing definitions without understanding', isCorrect: false },
              { text: 'Combining theoretical study with practical application', isCorrect: true },
              { text: 'Skipping foundational concepts', isCorrect: false },
              { text: 'Only focusing on advanced topics', isCorrect: false }
            ],
            explanation: 'The most effective learning combines theory with practice.'
          },
          {
            question: `How does ${moduleTitle} apply to real-world scenarios?`,
            options: [
              { text: 'It has no practical applications', isCorrect: false },
              { text: 'It only applies to theoretical situations', isCorrect: false },
              { text: 'It provides practical solutions and frameworks', isCorrect: true },
              { text: 'It only works in controlled environments', isCorrect: false }
            ],
            explanation: 'The concepts are designed to be applied in real-world situations.'
          },
          {
            question: `What should you focus on to master ${moduleTitle}?`,
            options: [
              { text: 'Surface-level memorization', isCorrect: false },
              { text: 'Deep understanding and practical skills', isCorrect: true },
              { text: 'Speed over comprehension', isCorrect: false },
              { text: 'Avoiding challenging exercises', isCorrect: false }
            ],
            explanation: 'Mastery requires both deep understanding and practical application.'
          },
          {
            question: `How can you validate your understanding of ${moduleTitle}?`,
            options: [
              { text: 'By repeating definitions word-for-word', isCorrect: false },
              { text: 'By avoiding practical exercises', isCorrect: false },
              { text: 'By applying concepts to solve problems', isCorrect: true },
              { text: 'By memorizing examples without understanding', isCorrect: false }
            ],
            explanation: 'True understanding is demonstrated through problem-solving application.'
          }
        ]
      },
      {
        title: `${moduleTitle} - Application Quiz`,
        description: `Test your ability to apply ${moduleTitle} concepts`,
        difficulty: 'intermediate',
        questions: [
          {
            question: `When implementing ${moduleTitle} concepts, what is the first step?`,
            options: [
              { text: 'Skip planning and start coding immediately', isCorrect: false },
              { text: 'Understand requirements and plan the approach', isCorrect: true },
              { text: 'Copy solutions from others without understanding', isCorrect: false },
              { text: 'Use the most complex solution available', isCorrect: false }
            ],
            explanation: 'Proper planning and understanding requirements is crucial for successful implementation.'
          },
          {
            question: `What is a common challenge when working with ${moduleTitle}?`,
            options: [
              { text: 'Concepts are too simple to be useful', isCorrect: false },
              { text: 'Balancing complexity with practical implementation', isCorrect: true },
              { text: 'There are no real-world applications', isCorrect: false },
              { text: 'Technology limitations make it impossible', isCorrect: false }
            ],
            explanation: 'Finding the right balance between theoretical concepts and practical implementation is often challenging.'
          },
          {
            question: `How should you approach problems in ${moduleTitle}?`,
            options: [
              { text: 'Use random trial and error', isCorrect: false },
              { text: 'Apply systematic problem-solving methods', isCorrect: true },
              { text: 'Avoid analyzing the problem deeply', isCorrect: false },
              { text: 'Only use pre-built solutions', isCorrect: false }
            ],
            explanation: 'Systematic approaches lead to better understanding and more reliable solutions.'
          },
          {
            question: `What role does practice play in mastering ${moduleTitle}?`,
            options: [
              { text: 'Practice is unnecessary if theory is understood', isCorrect: false },
              { text: 'Practice is essential for developing proficiency', isCorrect: true },
              { text: 'Only theoretical knowledge matters', isCorrect: false },
              { text: 'Practice should be avoided to prevent bad habits', isCorrect: false }
            ],
            explanation: 'Regular practice is essential for developing proficiency and confidence.'
          },
          {
            question: `How do you know if you have successfully applied ${moduleTitle} concepts?`,
            options: [
              { text: 'The solution works and meets requirements', isCorrect: true },
              { text: 'The code looks complex and impressive', isCorrect: false },
              { text: 'It uses the latest technology trends', isCorrect: false },
              { text: 'Other people cannot understand it', isCorrect: false }
            ],
            explanation: 'Success is measured by whether the solution works effectively and meets the defined requirements.'
          }
        ]
      },
      {
        title: `${moduleTitle} - Advanced Analysis Quiz`,
        description: `Test your analytical and critical thinking skills in ${moduleTitle}`,
        difficulty: 'advanced',
        questions: [
          {
            question: `When evaluating different approaches in ${moduleTitle}, what factors should you consider?`,
            options: [
              { text: 'Only the speed of implementation', isCorrect: false },
              { text: 'Performance, maintainability, scalability, and requirements fit', isCorrect: true },
              { text: 'Which approach is most popular currently', isCorrect: false },
              { text: 'The approach that requires least documentation', isCorrect: false }
            ],
            explanation: 'Comprehensive evaluation should consider multiple factors including performance, maintainability, and alignment with requirements.'
          },
          {
            question: `How should you handle trade-offs in ${moduleTitle} implementations?`,
            options: [
              { text: 'Always choose the fastest solution', isCorrect: false },
              { text: 'Analyze context and make informed decisions based on priorities', isCorrect: true },
              { text: 'Avoid making any trade-offs', isCorrect: false },
              { text: 'Choose based on personal preference only', isCorrect: false }
            ],
            explanation: 'Trade-offs should be made based on careful analysis of context, requirements, and priorities.'
          },
          {
            question: `What indicates deep understanding of ${moduleTitle}?`,
            options: [
              { text: 'Memorizing all related terminology', isCorrect: false },
              { text: 'Ability to adapt concepts to novel situations', isCorrect: true },
              { text: 'Using the most complex implementation possible', isCorrect: false },
              { text: 'Following examples exactly without modification', isCorrect: false }
            ],
            explanation: 'Deep understanding is demonstrated by the ability to adapt and apply concepts in new and different contexts.'
          },
          {
            question: `How do you optimize solutions in ${moduleTitle}?`,
            options: [
              { text: 'Make random changes and see what works', isCorrect: false },
              { text: 'Measure, analyze, and make informed improvements', isCorrect: true },
              { text: 'Always use the newest technology available', isCorrect: false },
              { text: 'Copy optimization patterns without understanding', isCorrect: false }
            ],
            explanation: 'Effective optimization requires measurement, analysis, and systematic improvement based on data.'
          },
          {
            question: `What is the best way to stay current with ${moduleTitle} developments?`,
            options: [
              { text: 'Only read about new trends without practicing', isCorrect: false },
              { text: 'Combine continuous learning with practical experimentation', isCorrect: true },
              { text: 'Stick with what you learned initially', isCorrect: false },
              { text: 'Follow trends without critical evaluation', isCorrect: false }
            ],
            explanation: 'Staying current requires both continuous learning and practical application to evaluate new developments critically.'
          }
        ]
      }
    ];
  }
}

module.exports = new DynamicQuizService();