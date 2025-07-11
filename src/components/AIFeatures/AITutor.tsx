import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { Brain, MessageCircle, Send, Loader, Sparkles, BookOpen, Target, Lightbulb, HelpCircle, CheckCircle, X, User, Bot, Mic, Volume2, Eye, Zap, Star, Award, TrendingUp, BarChart3, Clock, Calendar, Settings, RefreshCw, Download, Share, Heart, ThumbsUp, ThumbsDown, Flag, MoreHorizontal } from 'lucide-react';

interface AITutorProps {
  chapter: any;
  subject: string;
  difficulty: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  reactions?: string[];
  helpful?: boolean;
}

interface TutorSession {
  id: string;
  startTime: Date;
  messages: Message[];
  topic: string;
  progress: number;
}

const AITutor: React.FC<AITutorProps> = ({ chapter, subject, difficulty }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<TutorSession | null>(null);
  const [tutorMode, setTutorMode] = useState<'conversational' | 'quiz' | 'explanation' | 'practice'>('conversational');
  const [learningProgress, setLearningProgress] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    questionsAsked: 0,
    conceptsExplained: 0,
    timeSpent: 0,
    helpfulResponses: 0
  });

  useEffect(() => {
    initializeTutorSession();
  }, [chapter.title]);

  const initializeTutorSession = () => {
    const session: TutorSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      messages: [],
      topic: chapter.title,
      progress: 0
    };

    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'ai',
      content: `Hello! I'm your AI tutor for "${chapter.title}". I'm here to help you understand this topic thoroughly and answer any questions you might have.\n\nI can help you with:\n• Explaining complex concepts in simple terms\n• Providing examples and analogies\n• Creating practice questions\n• Reviewing key points\n• Connecting ideas to real-world applications\n\nWhat would you like to explore first?`,
      timestamp: new Date()
    };

    setCurrentSession(session);
    setMessages([welcomeMessage]);
    setLearningProgress(0);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing_${Date.now()}`,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const prompt = `You are an expert AI tutor specializing in "${chapter.title}" within ${subject} at ${difficulty} level. 

Current tutoring mode: ${tutorMode}
Student question: "${message}"

Context: You are helping a student understand ${chapter.title}. Be encouraging, patient, and adaptive to their learning style.

Provide a helpful, educational response that:
1. Directly addresses their question
2. Uses clear, appropriate language for ${difficulty} level
3. Provides examples when helpful
4. Encourages further learning
5. Connects to broader concepts when relevant

Keep responses conversational and engaging. If they seem confused, offer to explain differently or provide more examples.`;

      const response = await geminiService.makeRequest(prompt);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        questionsAsked: prev.questionsAsked + 1,
        conceptsExplained: prev.conceptsExplained + (response.includes('concept') ? 1 : 0)
      }));

      // Update learning progress
      setLearningProgress(prev => Math.min(prev + 5, 100));
      
    } catch (error) {
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleModeChange = (newMode: typeof tutorMode) => {
    setTutorMode(newMode);
    
    let modeMessage = '';
    switch (newMode) {
      case 'quiz':
        modeMessage = "Great! I'll create some quiz questions to test your understanding. Ready to start?";
        break;
      case 'explanation':
        modeMessage = "Perfect! I'll focus on explaining concepts in detail. What would you like me to explain?";
        break;
      case 'practice':
        modeMessage = "Excellent! Let's work on some practice problems. What type of practice would you like?";
        break;
      default:
        modeMessage = "I'm back to conversational mode. Feel free to ask me anything!";
    }

    const modeChangeMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'ai',
      content: modeMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, modeChangeMessage]);
  };

  const handleMessageReaction = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
    
    if (helpful) {
      setSessionStats(prev => ({
        ...prev,
        helpfulResponses: prev.helpfulResponses + 1
      }));
    }
  };

  const generateQuickSuggestions = () => {
    const suggestions = [
      `Explain the key concepts in ${chapter.title}`,
      `Give me a practical example`,
      `What are common mistakes to avoid?`,
      `How does this apply in real-world scenarios?`,
      `Can you create a practice question?`,
      `What should I focus on most?`
    ];
    
    return suggestions;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`backdrop-blur-xl border rounded-3xl transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b transition-colors ${
        theme === 'dark' ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                AI Tutor
              </h3>
              <p className="text-purple-500 font-medium">Personal learning assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress Indicator */}
            <div className="text-center">
              <div className={`text-sm font-medium transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Progress
              </div>
              <div className="text-purple-500 font-bold text-lg">{learningProgress}%</div>
            </div>
            
            {/* Session Stats */}
            <div className={`text-right text-sm transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div>Questions: {sessionStats.questionsAsked}</div>
              <div>Helpful: {sessionStats.helpfulResponses}</div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-2 mt-4">
          {[
            { id: 'conversational', name: 'Chat', icon: MessageCircle },
            { id: 'explanation', name: 'Explain', icon: Lightbulb },
            { id: 'quiz', name: 'Quiz', icon: HelpCircle },
            { id: 'practice', name: 'Practice', icon: Target }
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id as typeof tutorMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  tutorMode === mode.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : theme === 'dark'
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{mode.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-slate-700 text-gray-300'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.isTyping ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-purple-500">AI is thinking...</span>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {/* Message Actions for AI messages */}
                        {message.type === 'ai' && !message.isTyping && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleMessageReaction(message.id, true)}
                              className={`p-1 rounded transition-colors ${
                                message.helpful === true
                                  ? 'text-green-500'
                                  : 'text-gray-400 hover:text-green-500'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMessageReaction(message.id, false)}
                              className={`p-1 rounded transition-colors ${
                                message.helpful === false
                                  ? 'text-red-500'
                                  : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className={`px-6 py-4 border-t transition-colors ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        }`}>
          <p className={`text-sm mb-3 transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Quick suggestions:
          </p>
          <div className="flex flex-wrap gap-2">
            {generateQuickSuggestions().slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`p-6 border-t transition-colors ${
        theme === 'dark' ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder="Ask me anything about this chapter..."
            className={`flex-1 p-4 rounded-xl border transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 border-white/10 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={initializeTutorSession}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Session</span>
            </button>
          </div>
          
          <div className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Learning progress: {learningProgress}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;