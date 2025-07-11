import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { geminiService } from '../services/geminiService';
import { userService } from '../services/userService';
import AIStudyAssistant from './AIFeatures/AIStudyAssistant';
import SmartNotes from './AIFeatures/SmartNotes';
import ConceptExplainer from './AIFeatures/ConceptExplainer';
import CodeAnalyzer from './AIFeatures/CodeAnalyzer';
import ProgressTracker from './AIFeatures/ProgressTracker';
import StudyPlanner from './AIFeatures/StudyPlanner';
import { Book, Clock, CheckCircle, Play, ArrowLeft, Code, Lightbulb, Target, ExternalLink, Download, BookOpen, Video, FileText, Link, Zap, Award, Star, ChevronRight, Copy, Check, Youtube, AlertCircle, Brain, Monitor, Layers, Database, Globe, Shield, Trophy, Timer, BarChart3, Settings, Wifi, Camera, Headphones, Smartphone } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  courseContent?: any;
  quiz?: any;
}

interface CourseContent {
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedTime: string;
  content: {
    introduction: string;
    mainContent: string;
    keyPoints: string[];
    summary: string;
  };
  videoId?: string;
  codeExamples: {
    title: string;
    code: string;
    explanation: string;
  }[];
  practicalExercises: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  additionalResources: {
    title: string;
    url: string;
    type: 'article' | 'documentation' | 'tutorial' | 'video';
    description: string;
  }[];
  nextSteps: string[];
}

interface ChapterDetailsProps {
  chapter: Chapter;
  subject: string;
  difficulty: string;
  onBack: () => void;
  onQuizStart: (chapter: Chapter) => void;
}

const ChapterDetails: React.FC<ChapterDetailsProps> = ({ chapter, subject, difficulty, onBack, onQuizStart }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(chapter.completed);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;

  useEffect(() => {
    if (chapter.courseContent) {
      // Use pre-generated content if available
      setCourseContent(chapter.courseContent);
      setLoading(false);
    } else {
      // Generate content on demand
      generateCourseContent();
    }
  }, [chapter.id, subject, difficulty]);

  const generateCourseContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check rate limit status before making request
      const rateLimitStatus = geminiService.getRateLimitStatus();
      if (!rateLimitStatus.canMakeRequest) {
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimitStatus.waitTime / 1000)} seconds before trying again.`);
      }
      
      const content = await geminiService.generateCourseContent(chapter.title, subject, difficulty);
      setCourseContent(content);
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to generate course content:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate course content');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      generateCourseContent();
    }
  };

  const handleMarkComplete = async () => {
    setIsCompleted(true);
    
    // Update progress in database if user is logged in
    if (user) {
      try {
        const history = await userService.getUserHistory(user._id);
        const currentHistory = history.find(h => 
          h.chapterProgress.some(cp => cp.chapterId === chapter.id)
        );
        
        if (currentHistory) {
          await userService.updateChapterProgress(
            user._id,
            currentHistory._id,
            chapter.id,
            true
          );
        }
      } catch (error) {
        console.error('Failed to update chapter progress:', error);
      }
    }
  };

  const copyToClipboard = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(title);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'documentation': return BookOpen;
      case 'tutorial': return Play;
      default: return Link;
    }
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-cyan-500/30 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"></div>
              </div>
              <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-cyan-500" />
            </div>
            <div>
              <h3 className={`text-3xl font-bold mb-4 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Loading Course Content
              </h3>
              <p className={`text-lg transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Preparing comprehensive learning materials for {chapter.title}...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className={`max-w-lg mx-4 p-10 rounded-3xl border text-center transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-red-500/30 backdrop-blur-xl' 
              : 'bg-white/80 border-red-200 backdrop-blur-xl'
          }`}>
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-2xl font-bold mb-6 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Content Loading Failed
            </h3>
            <p className={`mb-8 text-lg transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {error}
            </p>
            <div className="space-y-4">
              {retryCount < maxRetries && (
                <button
                  onClick={handleRetry}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-semibold text-lg"
                >
                  Try Again ({retryCount + 1}/{maxRetries})
                </button>
              )}
              <button
                onClick={onBack}
                className={`w-full border px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-white/5' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseContent) return null;

  const hasValidVideo = courseContent.videoId && courseContent.videoId !== 'dQw4w9WgXcQ';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-xl border-b sticky top-0 z-10 transition-colors ${
        theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className={`flex items-center space-x-3 mb-8 px-6 py-3 rounded-xl transition-all duration-300 ${
              theme === 'dark' 
                ? 'text-gray-300 hover:text-white hover:bg-slate-800/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold text-lg">Back to Roadmap</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-8">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className={`text-4xl font-bold mb-4 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                    : 'text-gray-900'
                }`}>
                  {courseContent.title}
                </h1>
                <p className={`text-xl mb-6 max-w-2xl transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {courseContent.description}
                </p>
                <div className="flex items-center space-x-8">
                  <div className={`flex items-center space-x-3 transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Clock className="w-6 h-6" />
                    <span className="text-lg font-medium">{courseContent.estimatedTime}</span>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center space-x-3 text-green-500">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold text-lg">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!isCompleted && (
                <button
                  onClick={handleMarkComplete}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg flex items-center space-x-3"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Mark Complete</span>
                </button>
              )}
              {chapter.quiz && (
                <button
                  onClick={() => onQuizStart(chapter)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg flex items-center space-x-3"
                >
                  <Award className="w-6 h-6" />
                  <span>Take Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Learning Objectives */}
        <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-12 transition-colors ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-white/10' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <h2 className={`text-3xl font-bold mb-8 flex items-center transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Target className="w-8 h-8 mr-4 text-purple-500" />
            Learning Objectives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseContent.learningObjectives.map((objective, index) => (
              <div key={index} className={`flex items-start space-x-4 p-6 rounded-2xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <p className={`text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {objective}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Video Section */}
        {hasValidVideo && courseContent.videoId && (
          <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-12 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-8 flex items-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Youtube className="w-8 h-8 mr-4 text-red-500" />
              Video Lesson
            </h2>
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
              {!videoError ? (
                <iframe
                  src={getYouTubeEmbedUrl(courseContent.videoId)}
                  title={courseContent.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onError={() => setVideoError(true)}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center transition-colors ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <div className="text-center">
                    <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <p className={`mb-6 text-lg transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Video could not be loaded
                    </p>
                    <a
                      href={`https://www.youtube.com/watch?v=${courseContent.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-3 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                    >
                      <Youtube className="w-5 h-5" />
                      <span>Watch on YouTube</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-12 transition-colors ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-white/10' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <h2 className={`text-3xl font-bold mb-8 flex items-center transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Book className="w-8 h-8 mr-4 text-blue-500" />
            Course Content
          </h2>

          <div className="space-y-10">
            {/* Introduction */}
            <div>
              <h3 className={`text-2xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Introduction
              </h3>
              <p className={`text-xl leading-relaxed transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {courseContent.content.introduction}
              </p>
            </div>

            {/* Main Content */}
            <div>
              <h3 className={`text-2xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Main Content
              </h3>
              <div className={`prose max-w-none transition-colors ${
                theme === 'dark' ? 'prose-invert' : ''
              }`}>
                <div className={`text-xl leading-relaxed whitespace-pre-line transition-colors ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {courseContent.content.mainContent}
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div>
              <h3 className={`text-2xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Key Points
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courseContent.content.keyPoints.map((point, index) => (
                  <div key={index} className={`flex items-start space-x-4 p-6 rounded-2xl transition-colors ${
                    theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                  }`}>
                    <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <p className={`text-lg transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className={`p-8 rounded-3xl border-l-4 border-cyan-500 transition-colors ${
              theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'
            }`}>
              <h3 className={`text-2xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Summary
              </h3>
              <p className={`text-xl leading-relaxed transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {courseContent.content.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        {courseContent.codeExamples && courseContent.codeExamples.length > 0 && (
          <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-12 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-8 flex items-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Code className="w-8 h-8 mr-4 text-green-500" />
              Code Examples
            </h2>
            <div className="space-y-8">
              {courseContent.codeExamples.map((example, index) => (
                <div key={index} className={`border rounded-3xl overflow-hidden transition-colors ${
                  theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className={`px-8 py-6 border-b flex items-center justify-between transition-colors ${
                    theme === 'dark' ? 'bg-slate-700/50 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`text-xl font-bold transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {example.title}
                    </h3>
                    <button
                      onClick={() => copyToClipboard(example.code, example.title)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        copiedCode === example.title
                          ? 'bg-green-500 text-white'
                          : theme === 'dark'
                            ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {copiedCode === example.title ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span className="font-medium">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900 p-8">
                    <pre className="text-green-400 text-lg overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                  <div className={`px-8 py-6 transition-colors ${
                    theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <p className={`text-lg transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {example.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practical Exercises */}
        {courseContent.practicalExercises && courseContent.practicalExercises.length > 0 && (
          <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-12 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-8 flex items-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Zap className="w-8 h-8 mr-4 text-yellow-500" />
              Practical Exercises
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {courseContent.practicalExercises.map((exercise, index) => (
                <div key={index} className={`border rounded-3xl p-8 transition-colors ${
                  theme === 'dark' ? 'border-white/10 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {exercise.title}
                    </h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)} text-white`}>
                      {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                    </span>
                  </div>
                  <p className={`text-lg transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {exercise.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Resources */}
        {courseContent.additionalResources && courseContent.additionalResources.length > 0 && (
          <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-12 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-8 flex items-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <ExternalLink className="w-8 h-8 mr-4 text-purple-500" />
              Additional Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {courseContent.additionalResources.map((resource, index) => {
                const ResourceIcon = getResourceIcon(resource.type);
                return (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group border rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
                      theme === 'dark' 
                        ? 'border-white/10 bg-slate-700/30 hover:border-purple-500/30' 
                        : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <ResourceIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-3 group-hover:text-purple-500 transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {resource.title}
                        </h3>
                        <p className={`text-lg mb-4 transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {resource.description}
                        </p>
                        <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          theme === 'dark' ? 'bg-slate-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {courseContent.nextSteps && courseContent.nextSteps.length > 0 && (
          <div className={`backdrop-blur-xl border rounded-3xl p-10 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-8 flex items-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Star className="w-8 h-8 mr-4 text-cyan-500" />
              Next Steps
            </h2>
            <div className="space-y-6">
              {courseContent.nextSteps.map((step, index) => (
                <div key={index} className={`flex items-start space-x-6 p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <p className={`text-lg transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI-Powered Features */}
        <div className="space-y-12">
          {/* Smart Notes */}
          <SmartNotes chapter={chapter} subject={subject} />
          
          {/* Concept Explainer */}
          <ConceptExplainer chapter={chapter} subject={subject} difficulty={difficulty} />
          
          {/* Code Analyzer (for programming subjects) */}
          {(subject.toLowerCase().includes('programming') || 
            subject.toLowerCase().includes('code') || 
            subject.toLowerCase().includes('development')) && (
            <CodeAnalyzer chapter={chapter} subject={subject} />
          )}
          
          {/* Progress Tracker */}
          <ProgressTracker chapter={chapter} subject={subject} />
          
          {/* Study Planner */}
          <StudyPlanner chapter={chapter} subject={subject} difficulty={difficulty} />
        </div>
      </div>

      {/* AI Study Assistant - Floating */}
      <AIStudyAssistant chapter={chapter} subject={subject} difficulty={difficulty} />
    </div>
  );
};

export default ChapterDetails;