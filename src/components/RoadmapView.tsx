import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { geminiService } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';
import { userService } from '../services/userService';
import { CheckCircle, Circle, Play, Book, Award, Clock, ArrowLeft, Zap, Target, Users, TrendingUp, Star, ChevronRight, Sparkles, Brain, Code, Palette, Calculator, Globe, Lightbulb, BookOpen, Trophy, Timer, BarChart3, Rocket, Shield, FileText, Video, AlertCircle, Youtube, ExternalLink, Download, Layers, Cpu, Database, Smartphone, Camera, Headphones, Monitor, Wifi, Settings, Lock } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  estimatedHours: string;
  difficulty: string;
  position: 'left' | 'right';
  completed: boolean;
  keyTopics: string[];
  skills: string[];
  practicalProjects: string[];
  resources: number;
  courseContent?: any;
  quiz?: any;
}

interface Roadmap {
  subject: string;
  difficulty: string;
  description: string;
  totalDuration: string;
  estimatedHours: string;
  prerequisites: string[];
  learningOutcomes: string[];
  chapters: Chapter[];
}

interface DetailedCourse {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  chapters: {
    id: string;
    title: string;
    content: any;
    quiz: any;
    completed: boolean;
  }[];
  generatedAt: string;
}

interface RoadmapViewProps {
  subject: string;
  difficulty: string;
  roadmapId?: string;
  onBack: () => void;
  onChapterSelect: (chapter: Chapter) => void;
  onDetailedCourseGenerated: (courseData: any) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ subject, difficulty, roadmapId, onBack, onChapterSelect, onDetailedCourseGenerated }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [detailedCourse, setDetailedCourse] = useState<DetailedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCourse, setGeneratingCourse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [currentRoadmapId, setCurrentRoadmapId] = useState<string>(roadmapId || '');
  const [courseProgress, setCourseProgress] = useState<{ [key: string]: boolean }>({});
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, currentChapter: '' });

  const maxRetries = 3;

  useEffect(() => {
    console.log('RoadmapView mounted with:', { subject, difficulty });
    
    if (roadmapId) {
      // Load existing roadmap from database
      setCurrentRoadmapId(roadmapId);
      loadExistingRoadmap(roadmapId);
    } else {
      // Generate new roadmap
      const newRoadmapId = `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentRoadmapId(newRoadmapId);
      generateRoadmap();
    }
  }, [subject, difficulty, roadmapId]);

  const loadExistingRoadmap = async (roadmapId: string) => {
    if (!user) return;
    
    try {
      // Load roadmap from Supabase
      const roadmaps = await supabaseService.getUserRoadmaps(user.id);
      const existingRoadmap = roadmaps.find(r => r.id === roadmapId);
      
      if (existingRoadmap) {
        setRoadmap(existingRoadmap.roadmap_data);
        
        // Check if detailed course exists
        const detailedCourse = await supabaseService.getDetailedCourse(roadmapId);
        if (detailedCourse) {
          setDetailedCourse(detailedCourse.course_data);
        }
      }
    } catch (error) {
      console.error('Failed to load existing roadmap:', error);
      setError('Failed to load roadmap');
    }
  };

  const generateRoadmap = async () => {
    console.log('Generating roadmap for:', { subject, difficulty });
    setLoading(true);
    setError(null);
    
    try {
      const rateLimitStatus = geminiService.getRateLimitStatus();
      if (!rateLimitStatus.canMakeRequest) {
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimitStatus.waitTime / 1000)} seconds before trying again.`);
      }
      
      const roadmapData = await geminiService.generateRoadmap(subject, difficulty);
      console.log('Roadmap generated successfully:', roadmapData);
      setRoadmap(roadmapData);
      
      // Save roadmap to database if logged in
      if (user) {
        try {
          const savedRoadmap = await supabaseService.saveRoadmap(
            user.id,
            subject,
            difficulty,
            roadmapData
          );
          setCurrentRoadmapId(savedRoadmap.id);
        } catch (historyError) {
          console.error('Failed to save roadmap:', historyError);
        }
      }
      
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedCourse = async () => {
    if (!roadmap || !user) {
      console.error('Cannot generate detailed course: missing roadmap or user');
      return;
    }
    
    setGeneratingCourse(true);
    setError(null);
    setGenerationProgress({ current: 0, total: roadmap.chapters.length * 2, currentChapter: '' });
    
    try {
      const courseChapters = [];
      
      // Generate detailed content and quiz for each chapter
      for (let i = 0; i < roadmap.chapters.length; i++) {
        const chapter = roadmap.chapters[i];
        
        // Update progress for course content generation
        setGenerationProgress({ 
          current: i * 2 + 1, 
          total: roadmap.chapters.length * 2, 
          currentChapter: `Generating content for: ${chapter.title}` 
        });
        
        // Generate course content with enhanced error handling
        let courseContent;
        try {
          courseContent = await geminiService.generateCourseContent(
            chapter.title, 
            subject, 
            difficulty
          );
        } catch (contentError) {
          console.error(`Failed to generate content for ${chapter.title}:`, contentError);
          // Create comprehensive fallback content
          courseContent = {
            title: chapter.title,
            description: `Comprehensive guide to ${chapter.title} in ${subject}`,
            learningObjectives: [
              `Master ${chapter.title} fundamentals`,
              'Apply concepts in real-world scenarios',
              'Understand best practices and patterns',
              'Build practical projects'
            ],
            estimatedTime: chapter.estimatedHours,
            content: {
              introduction: `Welcome to ${chapter.title}! This chapter will guide you through the essential concepts and practical applications of ${chapter.title} in ${subject}. You'll learn step-by-step how to implement these concepts effectively.`,
              mainContent: `${chapter.title} is a crucial aspect of ${subject} that enables developers to create robust and efficient solutions. In this comprehensive guide, we'll explore the fundamental principles, examine real-world applications, and provide hands-on examples.\n\nKey areas we'll cover include:\n\n1. Core Concepts: Understanding the foundational principles of ${chapter.title}\n2. Practical Implementation: Step-by-step guides for applying these concepts\n3. Best Practices: Industry-standard approaches and patterns\n4. Common Pitfalls: How to avoid typical mistakes and challenges\n5. Advanced Techniques: Taking your skills to the next level\n\nThroughout this chapter, you'll work with practical examples that demonstrate real-world usage patterns. Each concept is explained with clear examples and detailed explanations to ensure thorough understanding.`,
              keyPoints: [
                `Understanding ${chapter.title} fundamentals`,
                'Practical implementation strategies',
                'Best practices and design patterns',
                'Performance optimization techniques',
                'Real-world application examples'
              ],
              summary: `In this chapter, you've mastered the essential concepts of ${chapter.title}. You now understand how to implement these concepts effectively, follow best practices, and apply them in real-world scenarios. Continue practicing with the provided exercises to reinforce your learning.`
            },
            videoId: 'dQw4w9WgXcQ',
            codeExamples: [
              {
                title: `Basic ${chapter.title} Implementation`,
                code: `// ${chapter.title} Example\n// This demonstrates core concepts\n\nfunction ${chapter.title.replace(/\s+/g, '').toLowerCase()}Example() {\n  console.log('Learning ${chapter.title}');\n  \n  // Implementation logic here\n  const result = processData();\n  return result;\n}\n\nfunction processData() {\n  return '${chapter.title} implementation complete';\n}\n\n// Usage\nconst output = ${chapter.title.replace(/\s+/g, '').toLowerCase()}Example();\nconsole.log(output);`,
                explanation: `This example demonstrates the basic implementation of ${chapter.title}. It shows the fundamental structure and common patterns you'll use when working with these concepts.`
              }
            ],
            practicalExercises: [
              {
                title: `${chapter.title} Practice Exercise`,
                description: `Create a practical implementation of ${chapter.title} concepts using the techniques learned in this chapter.`,
                difficulty: 'medium'
              }
            ],
            additionalResources: [
              {
                title: `${chapter.title} Documentation`,
                url: `https://developer.mozilla.org/en-US/docs/Web/${chapter.title.replace(/\s+/g, '_')}`,
                type: 'documentation',
                description: `Official documentation for ${chapter.title}`
              }
            ],
            nextSteps: [
              'Practice the provided exercises',
              'Explore additional resources',
              'Apply concepts in personal projects',
              'Review and reinforce key concepts'
            ]
          };
        }
        
        // Wait between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update progress for quiz generation
        setGenerationProgress({ 
          current: i * 2 + 2, 
          total: roadmap.chapters.length * 2, 
          currentChapter: `Generating quiz for: ${chapter.title}` 
        });
        
        // Generate quiz with enhanced error handling
        let quiz;
        try {
          quiz = await geminiService.generateQuiz(
            chapter.title, 
            subject, 
            difficulty
          );
        } catch (quizError) {
          console.error(`Failed to generate quiz for ${chapter.title}:`, quizError);
          // Create comprehensive fallback quiz
          quiz = {
            chapterId: chapter.id,
            title: `Quiz: ${chapter.title}`,
            description: `Test your understanding of ${chapter.title} concepts`,
            timeLimit: 600,
            passingScore: 70,
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: `What is the primary purpose of ${chapter.title} in ${subject}?`,
                options: [
                  'To complicate the development process',
                  `To provide essential functionality for ${subject} applications`,
                  'To replace all other technologies',
                  'To make code harder to understand'
                ],
                correctAnswer: 1,
                explanation: `${chapter.title} serves as a fundamental component in ${subject}, providing essential functionality that enables developers to build robust applications.`,
                difficulty: 'easy',
                points: 10
              }
            ],
            totalQuestions: 1,
            totalPoints: 10
          };
        }
        
        courseChapters.push({
          id: chapter.id,
          title: chapter.title,
          content: courseContent,
          quiz: quiz,
          completed: false
        });
        
        // Wait between chapters to avoid overwhelming the API
        if (i < roadmap.chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      const detailedCourseData: DetailedCourse = {
        id: `course_${currentRoadmapId}`,
        roadmapId: currentRoadmapId,
        title: `Complete ${subject} Course`,
        description: `Comprehensive ${subject} course with detailed content and interactive quizzes`,
        chapters: courseChapters,
        generatedAt: new Date().toISOString()
      };
      
      setDetailedCourse(detailedCourseData);

      // Save detailed course to database
      if (user && currentRoadmapId) {
        await supabaseService.saveDetailedCourse(user.id, currentRoadmapId, detailedCourseData);
      }

      // Notify parent component and navigate
      onDetailedCourseGenerated(detailedCourseData);
      
    } catch (error) {
      console.error('Failed to generate detailed course:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate detailed course');
    } finally {
      setGeneratingCourse(false);
      setGenerationProgress({ current: 0, total: 0, currentChapter: '' });
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      generateRoadmap();
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    // Only allow chapter selection if detailed course exists
    if (!detailedCourse) return;

    const courseChapter = detailedCourse.chapters.find(c => c.id === chapter.id);
    const enhancedChapter = {
      ...chapter,
      courseContent: courseChapter?.content,
      quiz: courseChapter?.quiz
    };
    
    setSelectedChapter(chapter.id);
    onChapterSelect(enhancedChapter);
  };

  const updateChapterProgress = async (chapterId: string, completed: boolean) => {
    if (!currentRoadmapId) return;
    
    try {
      setCourseProgress(prev => ({
        ...prev,
        [chapterId]: completed
      }));

      // Update in Supabase
      await supabaseService.updateChapterProgress(currentRoadmapId, chapterId, completed);
      
    } catch (error) {
      console.error('Failed to update chapter progress:', error);
    }
  };

  const getSubjectIcon = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('programming') || subjectLower.includes('code')) return Code;
    if (subjectLower.includes('design') || subjectLower.includes('ui')) return Palette;
    if (subjectLower.includes('data') || subjectLower.includes('ai')) return Brain;
    if (subjectLower.includes('web')) return Globe;
    if (subjectLower.includes('math')) return Calculator;
    if (subjectLower.includes('mobile')) return Smartphone;
    if (subjectLower.includes('database')) return Database;
    if (subjectLower.includes('network')) return Wifi;
    if (subjectLower.includes('security')) return Lock;
    if (subjectLower.includes('system')) return Cpu;
    return BookOpen;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'from-green-500 to-emerald-500';
      case 'intermediate': return 'from-yellow-500 to-orange-500';
      case 'advanced': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getChapterIcon = (index: number) => {
    const icons = [BookOpen, Code, Lightbulb, Target, Rocket, Shield, Trophy, BarChart3, Zap, Brain, Star, Award, Layers, Monitor, Settings, Database, Wifi, Camera, Headphones, Download];
    return icons[index % icons.length];
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
              <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-cyan-500" />
            </div>
            <div>
              <h3 className={`text-3xl font-bold mb-4 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Generating Your Personalized Roadmap
              </h3>
              <p className={`text-lg transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                AI is analyzing your preferences and creating the perfect learning path for {subject}...
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              Oops! Something went wrong
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

  if (!roadmap) return null;

  const SubjectIcon = getSubjectIcon(roadmap.subject);
  const completedChapters = roadmap.chapters.filter(chapter => courseProgress[chapter.id] || chapter.completed).length;
  const totalChapters = roadmap.chapters.length;
  const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className={`flex items-center space-x-3 mb-8 px-6 py-3 rounded-xl transition-all duration-300 ${
              theme === 'dark' 
                ? 'text-gray-300 hover:text-white hover:bg-slate-800/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold text-lg">Back to Selection</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-8">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-r ${getDifficultyColor(roadmap.difficulty)} flex items-center justify-center shadow-2xl`}>
                <SubjectIcon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className={`text-5xl font-bold mb-4 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                    : 'text-gray-900'
                }`}>
                  {roadmap.subject}
                </h1>
                <p className={`text-xl mb-6 max-w-2xl transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {roadmap.description}
                </p>
                <div className="flex items-center space-x-8">
                  <div className={`inline-flex px-6 py-3 rounded-xl bg-gradient-to-r ${getDifficultyColor(roadmap.difficulty)} text-white font-bold text-lg`}>
                    {roadmap.difficulty.charAt(0).toUpperCase() + roadmap.difficulty.slice(1)}
                  </div>
                  <div className={`flex items-center space-x-3 transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Clock className="w-6 h-6" />
                    <span className="text-lg font-medium">{roadmap.totalDuration}</span>
                  </div>
                  <div className={`flex items-center space-x-3 transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Timer className="w-6 h-6" />
                    <span className="text-lg font-medium">{roadmap.estimatedHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Circle */}
            <div className="text-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className={theme === 'dark' ? 'text-gray-700' : 'text-gray-200'}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#progress-gradient)"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {Math.round(progress)}%
                    </div>
                    <div className={`text-sm transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Complete
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar - Always Visible */}
      <div className={`backdrop-blur-xl border-b sticky top-20 z-10 transition-colors ${
        theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {detailedCourse ? '✅ Enhanced course available' : '⚡ Basic roadmap ready'}
            </div>
            {!detailedCourse && !generatingCourse && (
              <button
                onClick={generateDetailedCourse}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold text-sm flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Enhanced Course</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Course Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Prerequisites */}
          <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Shield className="w-6 h-6 mr-3 text-blue-500" />
              Prerequisites
            </h3>
            <div className="space-y-3">
              {roadmap.prerequisites.map((prereq, index) => (
                <div key={index} className={`flex items-center text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                  {prereq}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Target className="w-6 h-6 mr-3 text-purple-500" />
              Learning Outcomes
            </h3>
            <div className="space-y-3">
              {roadmap.learningOutcomes.map((outcome, index) => (
                <div key={index} className={`flex items-center text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Star className="w-5 h-5 mr-3 text-yellow-500" />
                  {outcome}
                </div>
              ))}
            </div>
          </div>

          {/* Course Stats */}
          <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <BarChart3 className="w-6 h-6 mr-3 text-cyan-500" />
              Course Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Chapters</span>
                <span className="font-bold text-cyan-500 text-xl">{totalChapters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Completed</span>
                <span className="font-bold text-green-500 text-xl">{completedChapters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Progress</span>
                <span className="font-bold text-purple-500 text-xl">{Math.round(progress)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Course Status</span>
                <span className={`font-bold text-xl ${detailedCourse ? 'text-green-500' : 'text-orange-500'}`}>
                  {detailedCourse ? 'Enhanced' : 'Basic'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Generation Progress */}
        {generatingCourse && (
          <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-12 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin mx-auto">
                  <div className="absolute top-0 left-0 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                </div>
                <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-4 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Generating Enhanced Course Content
                </h3>
                <p className={`text-lg mb-6 transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {generationProgress.currentChapter}
                </p>
                <div className={`w-full rounded-full h-4 mb-4 ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {generationProgress.current} of {generationProgress.total} steps completed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Timeline */}
        <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-12 transition-colors ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-white/10' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <h2 className={`text-3xl font-bold mb-12 text-center transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Your Learning Journey
          </h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full rounded-full ${
              theme === 'dark' ? 'bg-gradient-to-b from-cyan-500 to-purple-500' : 'bg-gradient-to-b from-cyan-400 to-purple-400'
            }`}></div>

            <div className="space-y-16">
              {roadmap.chapters.map((chapter, index) => {
                const ChapterIcon = getChapterIcon(index);
                const isLeft = chapter.position === 'left';
                const isCompleted = courseProgress[chapter.id] || chapter.completed;
                const hasDetailedContent = detailedCourse?.chapters.find(c => c.id === chapter.id);
                
                return (
                  <div key={chapter.id} className="relative">
                    {/* Timeline Node */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2">
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${getDifficultyColor(chapter.difficulty)} flex items-center justify-center shadow-2xl border-4 ${
                        theme === 'dark' ? 'border-slate-900' : 'border-white'
                      }`}>
                        <ChapterIcon className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    {/* Chapter Card */}
                    <div className={`flex ${isLeft ? 'justify-start pr-12' : 'justify-end pl-12'}`}>
                      <div className={`w-full max-w-lg ${isLeft ? 'mr-12' : 'ml-12'}`}>
                        <div
                          className={`group relative backdrop-blur-xl border-2 rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 ${
                            selectedChapter === chapter.id
                              ? theme === 'dark'
                                ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-2xl shadow-cyan-500/20'
                                : 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-purple-50 shadow-2xl shadow-cyan-500/20'
                              : isCompleted
                                ? theme === 'dark'
                                  ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10'
                                  : 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                                : theme === 'dark'
                                  ? 'border-white/10 bg-slate-800/50 hover:border-cyan-500/30'
                                  : 'border-gray-200 bg-white/80 hover:border-cyan-300 hover:shadow-xl'
                          }`}
                          onClick={() => handleChapterClick(chapter)}
                        >
                          {/* Status Badges */}
                          <div className="absolute top-6 right-6 flex items-center space-x-2">
                            {detailedCourse && (
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                              </div>
                            )}
                            {!detailedCourse && (
                              <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center opacity-50">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {isCompleted ? (
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                              </div>
                            )}
                            {isCompleted ? (
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                              }`}>
                                <Circle className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            <div>
                              <h3 className={`text-2xl font-bold mb-3 pr-20 transition-colors ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {chapter.title}
                              </h3>
                              <p className={`text-lg mb-6 transition-colors ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {chapter.description}
                              </p>
                            </div>

                            {/* Chapter Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className={`flex items-center space-x-3 transition-colors ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                <Clock className="w-5 h-5" />
                                <span className="font-medium">{chapter.duration}</span>
                              </div>
                              <div className={`flex items-center space-x-3 transition-colors ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                <Timer className="w-5 h-5" />
                                <span className="font-medium">{chapter.estimatedHours}</span>
                              </div>
                            </div>

                            {/* Key Topics */}
                            <div>
                              <h4 className={`font-bold mb-3 transition-colors ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Key Topics:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {chapter.keyTopics.slice(0, 4).map((topic, topicIndex) => (
                                  <span
                                    key={topicIndex}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                      theme === 'dark' 
                                        ? 'bg-slate-700 text-gray-300' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {topic}
                                  </span>
                                ))}
                                {chapter.keyTopics.length > 4 && (
                                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                    theme === 'dark' 
                                      ? 'bg-slate-700 text-gray-300' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    +{chapter.keyTopics.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Skills & Projects */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-purple-500 font-bold">Skills: {chapter.skills.length}</span>
                              </div>
                              <div>
                                <span className="text-cyan-500 font-bold">Projects: {chapter.practicalProjects.length}</span>
                              </div>
                            </div>

                            {/* Content Status */}
                            {detailedCourse ? (
                              <div className={`flex items-center space-x-3 ${
                                theme === 'dark' ? 'text-green-400' : 'text-green-600'
                              }`}>
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">✅ Enhanced content ready!</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className={`flex items-center space-x-3 ${
                                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                                }`}>
                                  <Clock className="w-5 h-5" />
                                  <span className="font-medium">⚡ Basic content available</span>
                                </div>
                                <button
                                  onClick={generateDetailedCourse}
                                  disabled={generatingCourse}
                                  className="text-purple-500 hover:text-purple-600 font-medium text-sm underline"
                                >
                                  Generate enhanced version →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate Detailed Course Button - Always Visible */}
        {!detailedCourse && !generatingCourse && (
          <div className="text-center mb-12">
            <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-8 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-white/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h3 className={`text-3xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                🚀 Ready to Supercharge Your Learning?
              </h3>
              <p className={`text-xl mb-10 max-w-3xl mx-auto transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Transform your basic roadmap into a comprehensive course with AI-generated content, interactive examples, 
                video lessons, hands-on exercises, and personalized quizzes for every chapter.
              </p>
              
              {/* Enhanced Features Preview */}
              <div className={`p-6 rounded-2xl mb-8 border-l-4 border-purple-500 transition-colors ${
                theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
              }`}>
                <p className={`text-lg font-semibold transition-colors ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                }`}>
                  ✨ Generate detailed content for all {roadmap.chapters.length} chapters with AI-powered explanations, code examples, quizzes, and video lessons!
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className={`p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <Video className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <h4 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Video Lessons</h4>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Curated YouTube videos</p>
                </div>
                <div className={`p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <Code className="w-8 h-8 text-green-500 mx-auto mb-4" />
                  <h4 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Code Examples</h4>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Interactive coding demos</p>
                </div>
                <div className={`p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                  <h4 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Smart Quizzes</h4>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Adaptive assessments</p>
                </div>
                <div className={`p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                  <h4 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Exercises</h4>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Hands-on practice</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={generateDetailedCourse}
              disabled={generatingCourse || !roadmap}
              className="group px-16 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 flex items-center space-x-4 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-10 h-10 group-hover:rotate-12 transition-transform" />
              <span>{generatingCourse ? 'Generating...' : '🚀 Generate Enhanced Course'}</span>
              {!generatingCourse && <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />}
            </button>
            <p className={`mt-4 text-lg transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              🎯 Transform your roadmap into a complete learning experience with AI-powered content
            </p>
            
            {/* Additional Info */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span>Free to generate</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-500">
                <Clock className="w-4 h-4" />
                <span>Takes 2-3 minutes</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-500">
                <Brain className="w-4 h-4" />
                <span>AI-powered content</span>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Generate Button for Mobile */}
        {!detailedCourse && !generatingCourse && (
          <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <button
              onClick={generateDetailedCourse}
              disabled={generatingCourse || !roadmap}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 shadow-2xl"
            >
              <Sparkles className="w-6 h-6" />
              <span>{generatingCourse ? 'Generating...' : 'Generate Enhanced Course'}</span>
            </button>
          </div>
        )}
      </div>

      {/* SVG Gradients */}
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
                                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                              }`}>
                                <Video className="w-5 h-5" />
                                <span className="font-medium">Enhanced content & quiz available</span>
                              </div>
                            ) : (
                              <div className={`flex items-center space-x-3 cursor-not-allowed ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                <BookOpen className="w-5 h-5" />
                                <span className="font-medium">Generate detailed course to access</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate Detailed Course Button */}
        {!detailedCourse && !generatingCourse && (
          <div className="text-center">
            <div className={`backdrop-blur-xl border rounded-3xl p-10 mb-8 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-white/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h3 className={`text-3xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                🚀 Unlock Enhanced Learning Experience
              </h3>
              <p className={`text-xl mb-10 max-w-3xl mx-auto transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Transform your roadmap into a comprehensive course with AI-generated content, interactive examples, 
                video lessons, hands-on exercises, and personalized quizzes for every chapter.
              </p>
              
              {/* Enhanced Features Preview */}
              <div className={`p-6 rounded-2xl mb-8 border-l-4 border-purple-500 transition-colors ${
                theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
              }`}>
                <p className={`text-lg font-semibold transition-colors ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                }`}>
                  ✨ Generate detailed content for all {roadmap.chapters.length} chapters with AI-powered explanations, code examples, quizzes, and video lessons!
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className={`p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <Video className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <h4 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Video Lessons</h4>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Curated YouTube videos</p>
                </div>
                <div className={`p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <Code className="w-8 h-8 text-green-500 mx-auto mb-4" />
                  <h4 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Code Examples</h4>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Interactive coding demos</p>
                </div>
                <div className={`p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                  <h4 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Smart Quizzes</h4>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Adaptive assessments</p>
                </div>
                <div className={`p-6 rounded-2xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                  <h4 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Exercises</h4>
                  <p className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Hands-on practice</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={generateDetailedCourse}
              disabled={generatingCourse || !roadmap}
              className="group px-16 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 flex items-center space-x-4 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-10 h-10 group-hover:rotate-12 transition-transform" />
              <span>{generatingCourse ? 'Generating...' : 'Generate Enhanced Course'}</span>
              {!generatingCourse && <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />}
            </button>
            <p className={`mt-4 text-lg transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              🎯 Transform your roadmap into a complete learning experience with AI-powered content
            </p>
            
            {/* Additional Info */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span>Free to generate</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-500">
                <Clock className="w-4 h-4" />
                <span>Takes 2-3 minutes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SVG Gradients */}
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