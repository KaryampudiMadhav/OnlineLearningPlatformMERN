import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, Bot, User, Lightbulb, 
  BookOpen, HelpCircle, Zap, Minimize2, Maximize2, AlertTriangle
} from 'lucide-react';

const AISupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hi! I\'m your AI Learning Assistant powered by Google Gemini. I can help you with: Quiz questions and explanations, Course concepts and topics, Study strategies, Technical issues, Programming help. What would you like to learn about?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = 'AIzaSyCcwBzDsQTG6q1kl6x-1xkjAok7MXWM0Vw'; // Your API key

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      icon: HelpCircle,
      text: 'Quiz Help',
      message: 'I need help understanding a quiz question'
    },
    {
      icon: BookOpen,
      text: 'Explain Concept',
      message: 'Can you explain a programming concept to me?'
    },
    {
      icon: Zap,
      text: 'Study Tips',
      message: 'What are some effective study strategies?'
    },
    {
      icon: Lightbulb,
      text: 'Debug Code',
      message: 'I have a coding problem that needs debugging'
    }
  ];

  // Clean text formatting function to remove markdown and special characters
  const cleanResponseText = (text) => {
    if (!text) return '';
    
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
      .replace(/`(.*?)`/g, '$1') // Remove `code`
      .replace(/#{1,6}\s+/g, '') // Remove # headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove [links](url)
      .replace(/^\s*[*\-+]\s+/gm, '• ') // Convert markdown lists to bullets
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up extra newlines
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();
  };

  const generateAIResponse = async (userMessage) => {
    try {
      const prompt = `You are a friendly and knowledgeable learning assistant for an e-learning platform. 
      
      The user is asking: "${userMessage}"
      
      Please provide a helpful, educational response that:
      - Is encouraging and supportive
      - Uses simple language when explaining complex concepts
      - Provides practical examples when possible
      - Offers follow-up suggestions
      - If it's about programming, include code examples
      - If it's about studying, give actionable tips
      - Keep responses concise but informative (max 300 words)
      
      Format your response in a friendly, conversational tone as if you're a supportive tutor.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      return {
        message: cleanResponseText(aiResponse),
        suggestions: generateSuggestions(userMessage)
      };
      
    } catch (error) {
      console.error('AI API Error:', error);
      return getFallbackResponse(userMessage);
    }
  };

  const generateSuggestions = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('quiz') || message.includes('question')) {
      return [
        'Explain this quiz question step by step',
        'Give me similar practice questions',
        'What topics should I review?'
      ];
    }
    
    if (message.includes('javascript') || message.includes('js')) {
      return [
        'JavaScript functions explained',
        'Common JS debugging tips',
        'JavaScript best practices'
      ];
    }
    
    if (message.includes('react')) {
      return [
        'React components basics',
        'State management in React',
        'React hooks explained'
      ];
    }
    
    if (message.includes('css') || message.includes('style')) {
      return [
        'CSS layout techniques',
        'Responsive design tips',
        'CSS debugging guide'
      ];
    }
    
    return [
      'Can you give me an example?',
      'What are the best practices?',
      'How can I practice this?'
    ];
  };

  const getFallbackResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('quiz') || message.includes('question')) {
      return {
        message: cleanResponseText(`I'd love to help with your quiz! Here are some general quiz-taking strategies: Before the Quiz: Review your notes and course materials, Practice similar questions, Get a good night's sleep. During the Quiz: Read questions carefully, Look for keywords, Eliminate obviously wrong answers, Don't spend too much time on one question. Need specific help? Feel free to share the quiz topic or specific questions you're struggling with!`),
        suggestions: [
          'Share a specific quiz question',
          'Quiz anxiety tips',
          'Time management strategies'
        ]
      };
    }
    
    if (message.includes('javascript') || message.includes('programming') || message.includes('code')) {
      return {
        message: cleanResponseText(`Let me help you with programming! JavaScript Learning Tips: Start with basics like variables, functions, loops. Practice coding daily even 15 minutes helps. Build small projects to apply concepts. Use console.log() to debug your code. Common Debugging Steps: Check the console for error messages. Verify your syntax missing semicolons, brackets. Test with simple inputs first. Break complex problems into smaller parts. Example Simple Function: function greetUser(name) { return "Hello, " + name + "!"; } console.log(greetUser("Student")); What specific programming topic would you like help with?`),
        suggestions: [
          'JavaScript functions',
          'Debugging tips',
          'Code examples'
        ]
      };
    }
    
    return {
      message: cleanResponseText(`I'm here to help with your learning! I can assist you with: Academic Support like explaining complex concepts, quiz preparation and strategies, study techniques and time management. Programming Help including code debugging and explanation, best practices and examples, step-by-step problem solving. General Learning such as note-taking strategies, memory techniques, motivation and goal setting. Note: I'm currently running in offline mode, but I can still provide helpful guidance based on common learning patterns! What specific topic would you like to explore?`),
      suggestions: [
        'Study strategies',
        'Programming help',
        'Quiz preparation',
        'Technical support'
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const botResponse = await generateAIResponse(currentMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: botResponse.message,
        suggestions: botResponse.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('AI API Error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: 'I apologize, but I\'m having trouble connecting right now. Please try again or ask me something else!',
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action.message);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
      >
        <MessageCircle size={28} />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-[500px]'  /* Changed to medium size */
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Learning Assistant</h3>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Powered by Google Gemini
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} className="text-white" /> : <Minimize2 size={16} className="text-white" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-4">{/* Reduced height from h-96 to h-72 for medium size */}
            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-lg text-left transition-colors border border-purple-100"
                  >
                    <action.icon size={20} className="text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-gray-800">{action.text}</p>
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${
                  msg.type === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : msg.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-50 text-gray-800 border border-gray-200'
                } rounded-2xl px-4 py-3`}>
                  <div className="flex items-start gap-2">
                    {msg.type === 'bot' && (
                      <div className="flex-shrink-0 mt-1">
                        {msg.isError ? (
                          <AlertTriangle size={16} className="text-red-500" />
                        ) : (
                          <Bot size={16} className="text-purple-600" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line leading-relaxed">{cleanResponseText(msg.message)}</p>{/* Apply text cleaning */}
                      {msg.suggestions && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Suggested questions:</p>
                          {msg.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-xs transition-colors border border-purple-100 hover:border-purple-200"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.type === 'user' && (
                      <User size={16} className="text-purple-200 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-purple-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about your studies..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Google Gemini AI • Ask questions about quizzes, programming, or study tips
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AISupportChatbot;