import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService, RoadmapData, DetailedCourseData } from '../services/supabaseService';
import { LearningHistory } from '../types';
import { Clock, BookOpen, Award, TrendingUp, Calendar, Filter, Play, Target, Users, Star, ChevronRight, BarChart3, Trophy, Zap, Brain, Code, Palette, Calculator, Globe, AlertCircle, RefreshCw, Sparkles, Timer, CheckCircle, Database, Smartphone, Camera, Headphones, Monitor, Wifi, Settings, Lock, Layers, Cpu } from 'lucide-react';

interface HistoryPageProps {
  onContinueLearning: (subject: string, difficulty: string, roadmapId: string) => void;
  onViewDetailedCourse: (courseData: any) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onContinueLearning, onViewDetailedCourse }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [detailedCourses, setDetailedCourses] = useState<DetailedCourseData[]>([]);
  const [activeTab, setActiveTab] = useState<'roadmaps' | 'courses'>('roadmaps');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading user data for:', user.id);
      
      const [roadmapsData, coursesData] = await Promise.all([
        supabaseService.getUserRoadmaps(user.id),
        supabaseService.getUserDetailedCourses(user.id)
      ]);
      
      console.log('User data loaded:', { roadmapsData, coursesData });
      setRoadmaps(roadmapsData);
      setDetailedCourses(coursesData);
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      loadUserData();
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
    if (subjectLower.includes('media')) return Camera;
    if (subjectLower.includes('audio')) return Headphones;
    if (subjectLower.includes('business')) return Target;
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const getProgressPercentage = (roadmapData: any) => {
    if (!roadmapData.chapters || roadmapData.chapters.length === 0) return 0;
    const completed = roadmapData.chapters.filter((chapter: any) => chapter.completed).length;
    return Math.round((completed / roadmapData.chapters.length) * 100);
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
              <BarChart3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-cyan-500" />
            </div>
            <div>
              <h3 className={`text-3xl font-bold mb-4 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Loading Your Progress
              </h3>
              <p className={`text-lg transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Fetching your learning history and achievements...
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
              Failed to Load Data
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
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again ({retryCount + 1}/{maxRetries})</span>
                </button>
              )}
            </div>
          </div>
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
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center space-x-3 border rounded-full px-6 py-3 mb-8 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20' 
              : 'bg-gradient-to-r from-cyan-50 to-purple-50 border-cyan-200'
          }`}>
            <Sparkles className="w-5 h-5 text-cyan-500" />
            <span className="text-cyan-500 font-semibold">Your Learning Library</span>
          </div>
          <h1 className={`text-5xl font-bold mb-6 transition-colors ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
              : 'text-gray-900'
          }`}>
            Learning History
          </h1>
          <p className={`text-2xl max-w-3xl mx-auto transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Access your saved roadmaps and detailed courses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-lg font-semibold transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Roadmaps Created
                </p>
                <p className={`text-4xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {roadmaps.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-lg font-semibold transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Detailed Courses
                </p>
                <p className={`text-4xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {detailedCourses.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-lg font-semibold transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This Month
                </p>
                <p className={`text-4xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {roadmaps.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-lg font-semibold transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Subjects
                </p>
                <p className={`text-4xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {new Set(roadmaps.map(r => r.subject)).size}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-12 transition-colors ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-white/10' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('roadmaps')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'roadmaps'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                  : theme === 'dark'
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Roadmaps ({roadmaps.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'courses'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                  : theme === 'dark'
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Detailed Courses ({detailedCourses.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'roadmaps' ? (
          roadmaps.length === 0 ? (
            <div className={`backdrop-blur-xl border rounded-3xl p-16 text-center transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-white/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <h3 className={`text-3xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                No Roadmaps Yet
              </h3>
              <p className={`text-xl mb-10 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Create your first learning roadmap to get started
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {roadmaps.map((roadmap) => {
                const SubjectIcon = getSubjectIcon(roadmap.subject);
                const progress = getProgressPercentage(roadmap.roadmap_data);
                
                return (
                  <div
                    key={roadmap.id}
                    className={`group backdrop-blur-xl border rounded-3xl p-10 transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
                      theme === 'dark' 
                        ? 'bg-slate-800/50 border-white/10 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10' 
                        : 'bg-white/80 border-gray-200 hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-500/10'
                    }`}
                    onClick={() => onContinueLearning(roadmap.subject, roadmap.difficulty, roadmap.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-8">
                        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${getDifficultyColor(roadmap.difficulty)} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                          <SubjectIcon className="w-10 h-10 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <h3 className={`text-3xl font-bold transition-colors ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {roadmap.subject}
                            </h3>
                            <span className={`px-4 py-2 rounded-full font-bold bg-gradient-to-r ${getDifficultyColor(roadmap.difficulty)} text-white`}>
                              {roadmap.difficulty.charAt(0).toUpperCase() + roadmap.difficulty.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className={`flex items-center space-x-3 transition-colors ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <Calendar className="w-5 h-5" />
                              <span className="text-lg">Created {formatDate(roadmap.created_at)}</span>
                            </div>
                            <div className={`flex items-center space-x-3 transition-colors ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <BookOpen className="w-5 h-5" />
                              <span className="text-lg">{roadmap.roadmap_data.chapters?.length || 0} chapters</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-lg font-bold transition-colors ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Progress
                              </span>
                              <span className="text-cyan-500 font-bold text-xl">{progress}%</span>
                            </div>
                            <div className={`w-full rounded-full h-4 ${
                              theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                            }`}>
                              <div 
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 h-4 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className={`text-lg font-bold transition-colors ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Continue Learning
                          </div>
                          <div className="text-cyan-500 font-bold text-2xl">
                            {progress}% Complete
                          </div>
                        </div>
                        <ChevronRight className="w-8 h-8 text-cyan-500 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          detailedCourses.length === 0 ? (
            <div className={`backdrop-blur-xl border rounded-3xl p-16 text-center transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-800/50 border-white/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
              <h3 className={`text-3xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                No Detailed Courses Yet
              </h3>
              <p className={`text-xl mb-10 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Generate detailed courses from your roadmaps to access enhanced content
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {detailedCourses.map((course) => {
                const roadmapData = course.roadmaps as any;
                const SubjectIcon = getSubjectIcon(roadmapData?.subject || 'programming');
                
                return (
                  <div
                    key={course.id}
                    className={`group backdrop-blur-xl border rounded-3xl p-10 transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
                      theme === 'dark' 
                        ? 'bg-slate-800/50 border-white/10 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10' 
                        : 'bg-white/80 border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10'
                    }`}
                    onClick={() => onViewDetailedCourse(course.course_data)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-8">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <h3 className={`text-3xl font-bold transition-colors ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {course.course_data.title}
                            </h3>
                            <span className="px-4 py-2 rounded-full font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              Enhanced Course
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className={`flex items-center space-x-3 transition-colors ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <Calendar className="w-5 h-5" />
                              <span className="text-lg">Created {formatDate(course.created_at)}</span>
                            </div>
                            <div className={`flex items-center space-x-3 transition-colors ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <BookOpen className="w-5 h-5" />
                              <span className="text-lg">{course.course_data.chapters?.length || 0} chapters</span>
                            </div>
                            <div className={`flex items-center space-x-3 transition-colors ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <Award className="w-5 h-5" />
                              <span className="text-lg">Quizzes & Exercises</span>
                            </div>
                          </div>

                          <p className={`text-lg transition-colors ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {course.course_data.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className={`text-lg font-bold transition-colors ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            View Course
                          </div>
                          <div className="text-purple-500 font-bold text-2xl">
                            Enhanced Content
                          </div>
                        </div>
                        <ChevronRight className="w-8 h-8 text-purple-500 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HistoryPage;