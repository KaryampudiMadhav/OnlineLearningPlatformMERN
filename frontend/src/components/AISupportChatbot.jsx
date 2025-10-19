import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, Bot, User, Minimize2, Maximize2
} from 'lucide-react';

const AISupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: "Hi, I am here to help you in preparation. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Frontend should call backend proxy to avoid exposing API keys
  const BACKEND_AI_ENDPOINT = import.meta.env.VITE_BACKEND_AI_ENDPOINT || '/api/ai-support/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const cleanResponseText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^\s*[*\-+]\s+/gm, '• ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const generateAIResponse = async (userMessage) => {
    try {
      const systemPrompt = `You are a helpful study assistant. Respond in plain text only. Provide a concise answer consisting of 4-5 short lines (each line 1-2 short sentences). Do not include code blocks, JSON, lists, or extra explanation. Keep language simple and directly address the user's question.`;

      const prompt = `${systemPrompt}\n\nUser message: "${userMessage}"`;

      // Send request to our backend proxy which holds the API key server-side
      const response = await fetch(BACKEND_AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API request failed: ${response.status} - ${text}`);
      }

      const data = await response.json();
      const aiResponse = data.message || (data.data && data.data.choices?.[0]?.message?.content);

      if (!aiResponse) throw new Error('No response from AI backend');

      return {
        message: cleanResponseText(aiResponse),
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = () => ({
    message: cleanResponseText(
      "I'm here to help you. Please try asking your question again."
    ),
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen)
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-110 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50"
      >
        <MessageCircle size={28} />
      </button>
    );

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Learning Assistant</h3>
            <div className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" aria-hidden></span>
              <span>Powered by Google Gemini</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-50 text-gray-800 border border-gray-200'
                  } rounded-2xl px-4 py-3`}
                >
                  <div className="flex items-start gap-2">
                    {msg.type === 'bot' && <Bot size={16} className="text-purple-600 mt-1" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.message}</p>
                    </div>
                    {msg.type === 'user' && <User size={16} className="text-purple-200 mt-1" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Bot size={16} className="text-purple-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-xs text-gray-500">AI is thinking...</span>
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
                placeholder="Type your question here..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI Assistant powered by Google Gemini
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AISupportChatbot;
