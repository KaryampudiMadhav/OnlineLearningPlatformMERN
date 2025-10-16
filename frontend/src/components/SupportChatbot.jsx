import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, Bot, User, Lightbulb, 
  BookOpen, HelpCircle, Zap, Minimize2, Maximize2
} from 'lucide-react';

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hi! I\'m your learning assistant 🤖. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

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
      message: 'I need help with quiz questions'
    },
    {
      icon: BookOpen,
      text: 'Lesson Doubt',
      message: 'I have doubts about a lesson'
    },
    {
      icon: Zap,
      text: 'Technical Issue',
      message: 'I\'m facing a technical problem'
    },
    {
      icon: Lightbulb,
      text: 'Study Tips',
      message: 'Can you give me study tips?'
    }
  ];

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Quiz-related responses
    if (message.includes('quiz') || message.includes('question') || message.includes('answer')) {
      return {
        message: `I can help you with quiz-related questions! Here are some tips:
        
📝 **Quiz Tips:**
• Read questions carefully before selecting answers
• Look for keywords that hint at the correct answer
• Use process of elimination for multiple choice
• Don't spend too much time on one question

**Need specific help?** Tell me:
• Which quiz are you taking?
• What topic are you struggling with?
• Are you having technical issues with the quiz?`,
        suggestions: [
          'Quiz taking strategies',
          'I can\'t submit my quiz',
          'Quiz timer issues'
        ]
      };
    }
    
    // Lesson-related responses
    if (message.includes('lesson') || message.includes('doubt') || message.includes('understand') || message.includes('concept')) {
      return {
        message: `I'm here to help clarify any concepts! 📚
        
**How I can assist:**
• Explain difficult concepts in simple terms
• Provide additional examples
• Suggest related resources
• Help with practical applications

**Please tell me:**
• Which lesson or topic you're struggling with?
• What specific concept is unclear?
• Do you need examples or practice problems?`,
        suggestions: [
          'JavaScript functions explained',
          'React components basics',
          'Need practice examples'
        ]
      };
    }
    
    // Technical issues
    if (message.includes('technical') || message.includes('problem') || message.includes('issue') || message.includes('error')) {
      return {
        message: `Let me help you resolve technical issues! 🔧
        
**Common Solutions:**
• Try refreshing the page (Ctrl+F5)
• Clear your browser cache
• Check your internet connection
• Try a different browser

**Still having issues?** Please describe:
• What exactly is happening?
• Which page or feature isn't working?
• Any error messages you see?`,
        suggestions: [
          'Video won\'t load',
          'Can\'t access course',
          'Login problems'
        ]
      };
    }
    
    // Study tips
    if (message.includes('study') || message.includes('tip') || message.includes('learn') || message.includes('improve')) {
      return {
        message: `Here are some effective study strategies! 🎯
        
📖 **Study Tips:**
• Break study sessions into 25-30 minute chunks
• Take notes while watching lessons
• Practice coding examples yourself
• Review previous lessons regularly
• Join study groups or forums

🧠 **Memory Techniques:**
• Create mind maps for complex topics
• Use flashcards for key concepts
• Teach concepts to others
• Apply knowledge through projects

**Want specific advice for your course or subject?**`,
        suggestions: [
          'How to practice coding?',
          'Best note-taking methods',
          'Managing study time'
        ]
      };
    }
    
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        message: `Hello! Great to see you learning today! 👋
        
I'm your personal learning assistant and I can help with:
• Quiz questions and strategies
• Lesson explanations and doubts  
• Technical issues
• Study tips and methods
• Course navigation

What would you like help with?`,
        suggestions: [
          'Quiz help',
          'Explain a concept',
          'Study tips',
          'Technical support'
        ]
      };
    }
    
    // Default response
    return {
      message: `I'm here to help with your learning journey! 🚀
      
I can assist you with:
• **Quiz Support** - Help with quiz questions, strategies, and technical issues
• **Concept Clarification** - Explain difficult topics and provide examples  
• **Study Guidance** - Share effective learning techniques and tips
• **Technical Help** - Resolve platform issues and navigation problems

**How can I help you today?**`,
      suggestions: [
        'I need quiz help',
        'Explain a concept',
        'Study strategies',
        'Technical issue'
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
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: botResponse.message,
        suggestions: botResponse.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action) => {
    setInputMessage(action.message);
    handleSendMessage();
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
      >
        <MessageCircle size={28} />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold">!</span>
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Learning Assistant</h3>
            <p className="text-xs text-white/80">Online • Always ready to help</p>
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
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <action.icon size={20} className="text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-800">{action.text}</p>
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                } rounded-2xl px-4 py-3`}>
                  <div className="flex items-start gap-2">
                    {msg.type === 'bot' && (
                      <Bot size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{msg.message}</p>
                      {msg.suggestions && (
                        <div className="mt-3 space-y-1">
                          {msg.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.type === 'user' && (
                      <User size={16} className="text-blue-200 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
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
                className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportChatbot;