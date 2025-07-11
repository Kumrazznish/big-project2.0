import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, BookOpen, CheckCircle, Sparkles, Zap, Star, Users, Trophy, Target } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface Chapter {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  completed?: boolean;
  hasDetailedContent?: boolean;
}

interface RoadmapViewProps {
  subject: string;
  difficulty: string;
  roadmapId: string;
  onBack: () => void;
  onChapterSelect: (chapter: Chapter) => void;
  onDetailedCourseGenerated: (roadmapId: string, detailedContent: any) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ 
  subject, 
  difficulty, 
  roadmapId, 
  onBack, 
  onChapterSelect, 
  onDetailedCourseGenerated 
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingDetailed, setGeneratingDetailed] = useState(false);
  const [hasDetailedContent, setHasDetailedContent] = useState(false);

  useEffect(() => {
    // Simulate loading chapters
    const mockChapters: Chapter[] = [
      {
        id: '1',
        title: 'Introduction to ' + subject,
        description: 'Get started with the fundamentals and core concepts',
        estimatedTime: '2-3 hours',
        difficulty: 'Beginner',
        topics: ['Overview', 'History', 'Key Concepts', 'Getting Started'],
        completed: false,
        hasDetailedContent: false
      },
      {
        id: '2',
        title: 'Core Principles',
        description: 'Deep dive into the essential principles and methodologies',
        estimatedTime: '4-5 hours',
        difficulty: 'Intermediate',
        topics: ['Fundamental Laws', 'Best Practices', 'Common Patterns'],
        completed: false,
        hasDetailedContent: false
      },
      {
        id: '3',
        title: 'Practical Applications',
        description: 'Apply your knowledge through hands-on projects and examples',
        estimatedTime: '6-8 hours',
        difficulty: 'Advanced',
        topics: ['Real-world Projects', 'Case Studies', 'Problem Solving'],
        completed: false,
        hasDetailedContent: false
      }
    ];

    setTimeout(() => {
      setChapters(mockChapters);
      setLoading(false);
    }, 1000);
  }, [subject]);

  const handleGenerateDetailedCourse = async () => {
    setGeneratingDetailed(true);
    
    try {
      // Simulate API call to generate detailed content
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const detailedContent = {
        roadmapId,
        enhancedChapters: chapters.map(chapter => ({
          ...chapter,
          hasDetailedContent: true,
          detailedLessons: [
            { id: '1', title: 'Lesson 1', content: 'Detailed content...' },
            { id: '2', title: 'Lesson 2', content: 'More detailed content...' }
          ]
        }))
      };

      setHasDetailedContent(true);
      setChapters(prev => prev.map(chapter => ({ ...chapter, hasDetailedContent: true })));
      onDetailedCourseGenerated(roadmapId, detailedContent);
    } catch (error) {
      console.error('Error generating detailed course:', error);
    } finally {
      setGeneratingDetailed(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
            Loading your learning roadmap...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Quick Action Bar */}
      <div className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-slate-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-slate-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {!hasDetailedContent && (
            <button
              onClick={handleGenerateDetailedCourse}
              disabled={generatingDetailed}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-4 h-4 ${generatingDetailed ? 'animate-spin' : 'animate-pulse'}`} />
              <span>{generatingDetailed ? 'Generating...' : 'Generate Detailed Course'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-4xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {subject} Learning Path
            </h1>
          </div>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
            <span className={`flex items-center space-x-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <Clock className="w-4 h-4" />
              <span>12-16 hours total</span>
            </span>
            <span className={`flex items-center space-x-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <Users className="w-4 h-4" />
              <span>{chapters.length} chapters</span>
            </span>
          </div>

          {/* Main Generate Button */}
          {!hasDetailedContent && (
            <div className={`p-6 rounded-2xl border-2 border-dashed mb-8 ${
              theme === 'dark' 
                ? 'border-purple-500/30 bg-slate-800/50' 
                : 'border-indigo-300 bg-white/50'
            }`}>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  🚀 Unlock Enhanced Learning Experience
                </h3>
                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Generate detailed lessons, interactive exercises, and personalized content
                </p>
                <div className="flex items-center justify-center space-x-6 mb-6 text-sm">
                  <div className={`flex items-center space-x-2 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>100% Free</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>Takes 2-3 minutes</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    <Star className="w-4 h-4" />
                    <span>AI-Powered</span>
                  </div>
                </div>
                <button
                  onClick={handleGenerateDetailedCourse}
                  disabled={generatingDetailed}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Sparkles className={`w-5 h-5 ${generatingDetailed ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>
                      {generatingDetailed ? 'Generating Enhanced Course...' : '✨ Generate Detailed Course'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {hasDetailedContent && (
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Enhanced course content generated successfully! 🎉</span>
              </div>
            </div>
          )}
        </div>

        {/* Chapters Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-700 hover:border-purple-500'
                  : 'bg-white/70 border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => onChapterSelect(chapter)}
            >
              {/* Chapter Number */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  {chapter.hasDetailedContent && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    }`}>
                      Enhanced
                    </div>
                  )}
                </div>
                {chapter.completed && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Chapter Content */}
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {chapter.title}
              </h3>
              
              <p className={`text-sm mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {chapter.description}
              </p>

              {/* Chapter Meta */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                  {chapter.difficulty}
                </span>
                <span className={`flex items-center space-x-1 text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{chapter.estimatedTime}</span>
                </span>
              </div>

              {/* Topics */}
              <div className="flex flex-wrap gap-1 mb-4">
                {chapter.topics.slice(0, 3).map((topic, topicIndex) => (
                  <span
                    key={topicIndex}
                    className={`px-2 py-1 rounded-md text-xs ${
                      theme === 'dark' 
                        ? 'bg-slate-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {topic}
                  </span>
                ))}
                {chapter.topics.length > 3 && (
                  <span className={`px-2 py-1 rounded-md text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    +{chapter.topics.length - 3} more
                  </span>
                )}
              </div>

              {/* Generate Button for Individual Chapter */}
              {!chapter.hasDetailedContent && !hasDetailedContent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateDetailedCourse();
                  }}
                  disabled={generatingDetailed}
                  className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className={`w-3 h-3 ${generatingDetailed ? 'animate-spin' : ''}`} />
                    <span>{generatingDetailed ? 'Generating...' : 'Enhance'}</span>
                  </div>
                </button>
              )}

              {/* Progress Indicator */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-b-2xl transition-all duration-300 ${
                chapter.completed ? 'w-full' : 'w-0 group-hover:w-1/4'
              }`} />
            </div>
          ))}
        </div>

        {/* Mobile Fixed Generate Button */}
        {!hasDetailedContent && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
            <button
              onClick={handleGenerateDetailedCourse}
              disabled={generatingDetailed}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className={`w-4 h-4 ${generatingDetailed ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{generatingDetailed ? 'Generating...' : 'Generate Course'}</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Progress Gradient Definition */}
      <svg className="hidden">
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default RoadmapView;