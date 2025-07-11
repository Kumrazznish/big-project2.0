import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import HistoryPage from './components/HistoryPage';
import SubjectSelector from './components/SubjectSelector';
import RoadmapView from './components/RoadmapView';
import DetailedCoursePage from './components/DetailedCoursePage';
import ChapterDetails from './components/ChapterDetails';
import QuizView from './components/QuizView';
import { supabaseService } from './services/supabaseService';
import { Chapter, QuizResult } from './types';
import { userService } from './services/userService';
import { useAuth } from './contexts/AuthContext';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

type AppState = 'dashboard' | 'history' | 'selection' | 'roadmap' | 'detailed-course' | 'chapter' | 'quiz';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentState, setCurrentState] = useState<AppState>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [currentRoadmapId, setCurrentRoadmapId] = useState<string>('');
  const [detailedCourse, setDetailedCourse] = useState<any>(null);
  const [isFromHistory, setIsFromHistory] = useState<boolean>(false);

  const handleSubjectSelect = async (subject: string, difficulty: string, learningStyle: string, timeCommitment: string, goals: string[]) => {
    console.log('Subject selected:', { subject, difficulty, learningStyle, timeCommitment, goals });
    
    setSelectedSubject(subject);
    setSelectedDifficulty(difficulty);
    
    // Store additional preferences for enhanced roadmap generation
    localStorage.setItem('learningPreferences', JSON.stringify({
      learningStyle,
      timeCommitment,
      goals
    }));
    
    // Generate unique roadmap ID
    const roadmapId = `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentRoadmapId(roadmapId);
    
    console.log('Navigating to roadmap view...');
    setIsFromHistory(false);
    setCurrentState('roadmap');
  };

  const handleDetailedCourseGenerated = (courseData: any) => {
    console.log('Detailed course generated:', courseData);
    setDetailedCourse(courseData);
    // Automatically navigate to the detailed course view
    setIsFromHistory(false);
    setTimeout(() => {
      setCurrentState('detailed-course');
    }, 500);
  };

  const handleChapterCompleted = (chapterId: string) => {
    if (detailedCourse) {
      const updatedCourse = {
        ...detailedCourse,
        chapters: detailedCourse.chapters.map((chapter: any) =>
          chapter.id === chapterId ? { ...chapter, completed: true } : chapter
        )
      };
      setDetailedCourse(updatedCourse);
      localStorage.setItem(`detailed_course_${currentRoadmapId}`, JSON.stringify(updatedCourse));
    }
  };

  const handleChapterSelect = (chapter: Chapter) => {
    console.log('Chapter selected:', chapter);
    setSelectedChapter(chapter);
    setCurrentState('chapter');
  };

  const handleQuizStart = (chapter: Chapter) => {
    console.log('Quiz started for chapter:', chapter);
    setSelectedChapter(chapter);
    setCurrentState('quiz');
  };

  const handleQuizComplete = async (result: QuizResult) => {
    console.log('Quiz completed:', result);
    
    // Update chapter progress if user is logged in
    if (user && selectedChapter && currentRoadmapId) {
      try {
        // Find the history entry and update chapter progress
        const history = await userService.getUserHistory(user._id);
        const currentHistory = history.find(h => h.roadmapId === currentRoadmapId);
        
        if (currentHistory) {
          await userService.updateChapterProgress(
            user._id, 
            currentHistory._id, 
            selectedChapter.id, 
            result.percentage >= 70 // Mark as completed if score is 70% or higher
          );
        }
      } catch (error) {
        console.error('Failed to update chapter progress:', error);
      }
    }
    
    // Go back to chapter details after quiz completion
    setCurrentState('chapter');
  };

  const handleBackToSelection = () => {
    console.log('Going back to selection');
    setCurrentState('selection');
    setSelectedSubject('');
    setSelectedDifficulty('');
    setSelectedChapter(null);
    setCurrentRoadmapId('');
  };

  const handleBackToRoadmap = () => {
    console.log('Going back to roadmap');
    setCurrentState('roadmap');
    setSelectedChapter(null);
  };

  const handleBackToDetailedCourse = () => {
    console.log('Going back to detailed course');
    setCurrentState('detailed-course');
    setSelectedChapter(null);
  };

  const handleBackToChapter = () => {
    console.log('Going back to chapter');
    setCurrentState('chapter');
  };

  const handleNavigate = (view: string) => {
    console.log('Navigating to:', view);
    setCurrentState(view as AppState);
  };

  const handleContinueLearning = (subject: string, difficulty: string, roadmapId: string) => {
    console.log('Continuing learning:', { subject, difficulty, roadmapId });
    setSelectedSubject(subject);
    setSelectedDifficulty(difficulty);
    setCurrentRoadmapId(roadmapId);
    setIsFromHistory(true);
    setCurrentState('roadmap');
  };

  const handleViewDetailedCourse = (courseData: any) => {
    console.log('Viewing detailed course:', courseData);
    setDetailedCourse(courseData);
    setSelectedSubject(courseData.title || 'Course');
    setSelectedDifficulty('intermediate');
    setCurrentRoadmapId(courseData.roadmapId || courseData.id);
    setIsFromHistory(true);
    setCurrentState('detailed-course');
  };

  const handleStartNewLearning = () => {
    console.log('Starting new learning path');
    setSelectedSubject('');
    setSelectedDifficulty('');
    setSelectedChapter(null);
    setCurrentRoadmapId('');
    setCurrentState('selection');
    setIsFromHistory(false);
  };

  // Show navigation for authenticated users
  const showNavigation = ['dashboard', 'history', 'selection', 'roadmap', 'detailed-course', 'chapter', 'quiz'].includes(currentState);

  console.log('Current state:', currentState);
  console.log('User:', user);
  console.log('Show navigation:', showNavigation);

  return (
    <div className="min-h-screen">
      {showNavigation && (
        <Navigation currentView={currentState} onNavigate={handleNavigate} />
      )}
      
      {currentState === 'dashboard' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-2xl text-gray-600 dark:text-gray-400">
                Continue your learning journey or start something new
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-2xl p-12 text-center hover:shadow-3xl transition-all duration-500 hover:scale-105 backdrop-blur-xl border border-gray-200 dark:border-white/10">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Start New Learning Path</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Create a personalized AI-generated roadmap for any subject you want to master
                </p>
                <button
                  onClick={handleStartNewLearning}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg hover:scale-105 shadow-lg"
                >
                  Get Started
                </button>
              </div>
              
              <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-2xl p-12 text-center hover:shadow-3xl transition-all duration-500 hover:scale-105 backdrop-blur-xl border border-gray-200 dark:border-white/10">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">View Learning History</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Track your progress and continue from where you left off in your previous courses
                </p>
                <button
                  onClick={() => handleNavigate('history')}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-10 py-4 rounded-2xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 font-bold text-lg hover:scale-105 shadow-lg"
                >
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentState === 'history' && (
        <HistoryPage 
          onContinueLearning={handleContinueLearning}
          onViewDetailedCourse={handleViewDetailedCourse}
        />
      )}
      
      {currentState === 'selection' && (
        <div className="min-h-screen">
          <SubjectSelector onSubjectSelect={handleSubjectSelect} />
        </div>
      )}
      
      {currentState === 'roadmap' && selectedSubject && selectedDifficulty && (
        <div className="min-h-screen">
          <RoadmapView
            subject={selectedSubject}
            difficulty={selectedDifficulty}
            roadmapId={isFromHistory ? currentRoadmapId : undefined}
            onBack={handleBackToSelection}
            onChapterSelect={handleChapterSelect}
            onDetailedCourseGenerated={handleDetailedCourseGenerated}
          />
        </div>
      )}
      
      {currentState === 'detailed-course' && detailedCourse && (
        <div className="min-h-screen">
          <DetailedCoursePage
            detailedCourse={detailedCourse}
            subject={selectedSubject}
            difficulty={selectedDifficulty}
            onBack={() => setCurrentState('roadmap')}
            onChapterComplete={handleChapterCompleted}
            onQuizStart={handleQuizStart}
          />
        </div>
      )}
      
      {currentState === 'chapter' && selectedChapter && (
        <div className="min-h-screen">
          <ChapterDetails
            chapter={selectedChapter}
            subject={selectedSubject}
            difficulty={selectedDifficulty}
            onBack={detailedCourse ? handleBackToDetailedCourse : handleBackToRoadmap}
            onQuizStart={handleQuizStart}
          />
        </div>
      )}
      
      {currentState === 'quiz' && selectedChapter && (
        <div className="min-h-screen">
          <QuizView
            chapter={selectedChapter}
            subject={selectedSubject}
            difficulty={selectedDifficulty}
            onBack={handleBackToChapter}
            onQuizComplete={handleQuizComplete}
          />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <ProtectedRoute fallback={<LandingPage />}>
              <AppContent />
            </ProtectedRoute>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;