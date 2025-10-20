const axios = require('axios');

// POST /api/ai-support/chat
// Body: { message: string }
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'AI service not configured. Please check GEMINI_API_KEY in environment variables.' 
      });
    }

    try {
      // Create a simple, direct prompt
      const prompt = `Help with: ${message}\n\nProvide a clear, educational answer in 1-2 sentences.`;

      // Helper function to call Gemini with configurable maxTokens
      const callGemini = async (maxTokens = 800, retryAttempt = 0) => {
        console.log(`🤖 Generating AI response (attempt ${retryAttempt + 1}, maxTokens: ${maxTokens})...`);
        
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: maxTokens,
              candidateCount: 1
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH"
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('📦 Full API response:', JSON.stringify(response.data, null, 2));

        // Check if we have candidates
        if (!response.data.candidates || response.data.candidates.length === 0) {
          console.log('⚠️ No candidates in response');
          throw new Error('No candidates returned from AI model');
        }

        const candidate = response.data.candidates[0];
        console.log('🔍 First candidate:', JSON.stringify(candidate, null, 2));

        // Check finish reason and retry logic
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          console.log('⚠️ Response issue, finish reason:', candidate.finishReason);
          
          if (candidate.finishReason === 'MAX_TOKENS') {
            // Retry with lower token count if we haven't tried yet
            if (retryAttempt === 0 && maxTokens > 300) {
              console.log('🔄 Retrying with reduced tokens...');
              return callGemini(300, retryAttempt + 1);
            }
            
            // If we hit max tokens on retry, use partial content if available
            const partialText = candidate.content?.parts?.[0]?.text;
            if (partialText && partialText.trim().length > 0) {
              console.log('📝 Using partial response due to MAX_TOKENS');
              return { 
                text: partialText.trim() + '...',
                partial: true
              };
            }
          }
          
          throw new Error(`Response issue: ${candidate.finishReason}`);
        }

        const aiText = candidate.content?.parts?.[0]?.text || '';

        if (!aiText || aiText.trim().length === 0) {
          console.log('⚠️ Empty text in response');
          throw new Error('Empty response text');
        }

        console.log('✅ AI response generated successfully:', aiText.substring(0, 100) + '...');
        
        return { text: aiText.trim(), partial: false };
      };

      // Call Gemini with retry logic
      const result = await callGemini();
      
      res.status(200).json({ 
        success: true, 
        message: result.text,
        partial: result.partial || undefined
      });

    } catch (aiError) {
      console.error('Gemini AI generation error:', aiError.response?.data || aiError.message);
      
      // Try a simpler fallback with direct educational response
      const educationalResponse = getEducationalResponse(message);
      
      res.status(200).json({ 
        success: true, 
        message: educationalResponse,
        fallback: true
      });
    }

  } catch (error) {
    console.error('AI chat controller error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Fallback educational responses
const getEducationalResponse = (message) => {
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes('javascript')) {
    return 'JavaScript is a versatile programming language used for web development. It runs in browsers and servers, allowing you to create interactive websites, web applications, and even mobile apps. Key features include variables, functions, objects, and event handling.';
  }
  
  if (msgLower.includes('react')) {
    return 'React is a JavaScript library for building user interfaces. It uses components to create reusable UI elements and manages state efficiently. Key concepts include JSX, components, props, and hooks like useState and useEffect.';
  }
  
  if (msgLower.includes('css')) {
    return 'CSS (Cascading Style Sheets) is used to style HTML elements. It controls layout, colors, fonts, and animations. Key concepts include selectors, properties, flexbox, grid, and responsive design with media queries.';
  }
  
  if (msgLower.includes('html')) {
    return 'HTML (HyperText Markup Language) is the foundation of web pages. It uses tags to structure content like headings, paragraphs, links, and images. Key elements include divs, spans, forms, and semantic tags like header, nav, and footer.';
  }
  
  if (msgLower.includes('python')) {
    return 'Python is a beginner-friendly programming language known for its clean syntax. It\'s widely used for web development, data science, automation, and AI. Key features include variables, functions, lists, dictionaries, and libraries like NumPy and Pandas.';
  }
  
  if (msgLower.includes('quiz') || msgLower.includes('test')) {
    return 'Great question about quizzes! To succeed: read questions carefully, eliminate wrong answers first, manage your time, review your work, and practice regularly. Don\'t rush - understanding concepts is more important than speed.';
  }
  
  if (msgLower.includes('study') || msgLower.includes('learn')) {
    return 'Effective study strategies include: active learning (practice coding), spaced repetition, breaking complex topics into smaller parts, teaching concepts to others, and building projects to apply your knowledge. Set specific goals and take regular breaks!';
  }
  
  // Default response
  return `Thanks for your question about "${message}". While I\'m having technical difficulties with my AI service, I can still help you with programming concepts, study strategies, quiz preparation, and course material. Feel free to ask about specific topics like JavaScript, React, Python, or study techniques!`;
};

module.exports = { chat };
