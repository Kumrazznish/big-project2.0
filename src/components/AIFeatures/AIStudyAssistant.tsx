import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { Brain, MessageCircle, Send, Loader, Sparkles, BookOpen, Target, Lightbulb, HelpCircle, CheckCircle, X } from 'lucide-react';

interface AIStudyAssistantProps {
  chapter: any;
  subject: string;
  difficulty: string;
}

const AIStudyAssistant: React.FC<AIStudyAssistantProps> = ({ chapter, subject, difficulty }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message and suggestions
      setMessages([{
        type: 'ai',
        content: `Hi! I'm your AI Study Assistant for "${chapter.title}". I can help you understand concepts, answer questions, provide examples, and guide your learning. What would you like to know?`,
        timestamp: new Date()
      }]);
      
      setSuggestions([
        `Explain the key concepts in ${chapter.title}`,
        `Give me a practical example`,
        `What are common mistakes to avoid?`,
        `How does this relate to real-world applications?`,
        `Can you create a simple exercise for me?`
      ]);
    }
  }, [isOpen, chapter.title, messages.length]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage = { type: 'user' as const, content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const prompt = `You are an AI Study Assistant helping a student learn "${chapter.title}" in ${subject} at ${difficulty} level.

Student question: "${message}"

Context: The student is currently studying ${chapter.title} as part of their ${subject} learning journey.

Provide a helpful, educational response that:
1. Directly answers their question
2. Provides clear explanations
3. Includes practical examples when relevant
4. Encourages further learning
5. Is appropriate for ${difficulty} level

Keep the response conversational, encouraging, and educational. Limit to 2-3 paragraphs.`;

      const response = await geminiService.makeRequest(prompt);
      
      const aiMessage = { type: 'ai' as const, content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        type: 'ai' as const, 
        content: 'I apologize, but I encountered an error. Please try asking your question again.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    setSuggestions([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 ${
          theme === 'dark' ? 'shadow-purple-500/25' : 'shadow-purple-500/50'
        }`}
      >
        <Brain className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[500px] rounded-3xl border shadow-2xl z-50 flex flex-col transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800 border-white/10' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-bold transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>AI Study Assistant</h3>
            <p className="text-xs text-purple-500">Always here to help</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              message.type === 'user'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : theme === 'dark'
                  ? 'bg-slate-700 text-gray-300'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 opacity-70`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-2xl ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <Loader className="w-5 h-5 animate-spin text-purple-500" />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <p className={`text-xs mb-2 transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Suggested questions:</p>
          <div className="space-y-2">
            {suggestions.slice(0, 2).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder="Ask me anything about this chapter..."
            className={`flex-1 p-3 rounded-xl border transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 border-white/10 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIStudyAssistant;