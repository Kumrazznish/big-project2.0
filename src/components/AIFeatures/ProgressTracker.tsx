import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, Target, Clock, Award, Calendar, BarChart3, Zap, Brain, CheckCircle, Star, Trophy, Timer, BookOpen } from 'lucide-react';

interface ProgressData {
  chaptersCompleted: number;
  totalChapters: number;
  timeSpent: number;
  streak: number;
  lastStudyDate: Date;
  weeklyGoal: number;
  weeklyProgress: number;
  achievements: string[];
  skillsLearned: string[];
  averageQuizScore: number;
  totalQuizzesTaken: number;
}

interface ProgressTrackerProps {
  chapter: any;
  subject: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ chapter, subject }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData>({
    chaptersCompleted: 0,
    totalChapters: 12,
    timeSpent: 0,
    streak: 0,
    lastStudyDate: new Date(),
    weeklyGoal: 5,
    weeklyProgress: 0,
    achievements: [],
    skillsLearned: [],
    averageQuizScore: 0,
    totalQuizzesTaken: 0
  });

  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', hours: 2.5, completed: true },
    { day: 'Tue', hours: 1.8, completed: true },
    { day: 'Wed', hours: 3.2, completed: true },
    { day: 'Thu', hours: 0, completed: false },
    { day: 'Fri', hours: 2.1, completed: true },
    { day: 'Sat', hours: 0, completed: false },
    { day: 'Sun', hours: 0, completed: false }
  ]);

  useEffect(() => {
    // Load progress data from localStorage
    const savedProgress = localStorage.getItem(`progress_${subject}_${user?.clerkId}`);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setProgressData({
        ...parsed,
        lastStudyDate: new Date(parsed.lastStudyDate)
      });
    } else {
      // Initialize with sample data
      setProgressData(prev => ({
        ...prev,
        chaptersCompleted: 3,
        timeSpent: 12.5,
        streak: 5,
        weeklyProgress: 3,
        achievements: ['First Chapter Complete', 'Quiz Master', 'Study Streak'],
        skillsLearned: ['Basic Concepts', 'Problem Solving', 'Best Practices'],
        averageQuizScore: 85,
        totalQuizzesTaken: 8
      }));
    }
  }, [subject, user]);

  const saveProgress = (newData: ProgressData) => {
    setProgressData(newData);
    localStorage.setItem(`progress_${subject}_${user?.clerkId}`, JSON.stringify(newData));
  };

  const getProgressPercentage = () => {
    return Math.round((progressData.chaptersCompleted / progressData.totalChapters) * 100);
  };

  const getWeeklyProgressPercentage = () => {
    return Math.round((progressData.weeklyProgress / progressData.weeklyGoal) * 100);
  };

  const getStreakColor = () => {
    if (progressData.streak >= 7) return 'text-green-500';
    if (progressData.streak >= 3) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const achievements = [
    { id: 'first_chapter', name: 'First Steps', description: 'Complete your first chapter', icon: '🎯', unlocked: progressData.chaptersCompleted >= 1 },
    { id: 'quiz_master', name: 'Quiz Master', description: 'Score 80%+ on 5 quizzes', icon: '🧠', unlocked: progressData.averageQuizScore >= 80 && progressData.totalQuizzesTaken >= 5 },
    { id: 'study_streak', name: 'Consistent Learner', description: 'Study for 7 days in a row', icon: '🔥', unlocked: progressData.streak >= 7 },
    { id: 'halfway', name: 'Halfway Hero', description: 'Complete 50% of the course', icon: '⭐', unlocked: getProgressPercentage() >= 50 },
    { id: 'time_master', name: 'Time Master', description: 'Study for 20+ hours total', icon: '⏰', unlocked: progressData.timeSpent >= 20 },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Score 100% on a quiz', icon: '💯', unlocked: progressData.averageQuizScore >= 95 }
  ];

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center mb-8">
        <TrendingUp className="w-7 h-7 mr-3 text-purple-500" />
        <h3 className={`text-2xl font-bold transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Progress Tracker
        </h3>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-2xl text-center transition-colors ${
          theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
        }`}>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className={`text-2xl font-bold transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {progressData.chaptersCompleted}/{progressData.totalChapters}
          </div>
          <div className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Chapters</div>
          <div className={`w-full rounded-full h-2 mt-2 ${
            theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'
          }`}>
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl text-center transition-colors ${
          theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
        }`}>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className={`text-2xl font-bold transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {formatTime(progressData.timeSpent)}
          </div>
          <div className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Time Spent</div>
        </div>

        <div className={`p-6 rounded-2xl text-center transition-colors ${
          theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
        }`}>
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className={`text-2xl font-bold ${getStreakColor()}`}>
            {progressData.streak}
          </div>
          <div className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Day Streak</div>
        </div>

        <div className={`p-6 rounded-2xl text-center transition-colors ${
          theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
        }`}>
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className={`text-2xl font-bold transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {progressData.averageQuizScore}%
          </div>
          <div className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Avg Quiz Score</div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className={`p-6 rounded-2xl mb-8 transition-colors ${
        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h4 className={`text-xl font-bold transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Weekly Goal Progress</h4>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="text-purple-500 font-medium">
              {progressData.weeklyProgress}/{progressData.weeklyGoal} hours
            </span>
          </div>
        </div>
        
        <div className={`w-full rounded-full h-4 mb-4 ${
          theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'
        }`}>
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(getWeeklyProgressPercentage(), 100)}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((day, index) => (
            <div key={index} className="text-center">
              <div className={`text-xs mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{day.day}</div>
              <div className={`w-full h-16 rounded-lg flex items-end justify-center transition-colors ${
                day.completed 
                  ? 'bg-gradient-to-t from-green-500 to-emerald-400' 
                  : theme === 'dark' 
                    ? 'bg-slate-600' 
                    : 'bg-gray-200'
              }`}>
                {day.hours > 0 && (
                  <div className="text-white text-xs font-medium mb-1">
                    {day.hours}h
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className={`p-6 rounded-2xl mb-8 transition-colors ${
        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
      }`}>
        <h4 className={`text-xl font-bold mb-6 flex items-center transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Achievements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`p-4 rounded-xl border transition-all ${
              achievement.unlocked
                ? theme === 'dark'
                  ? 'border-yellow-500/30 bg-yellow-500/10'
                  : 'border-yellow-300 bg-yellow-50'
                : theme === 'dark'
                  ? 'border-white/10 bg-slate-800/50 opacity-50'
                  : 'border-gray-200 bg-gray-100 opacity-50'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h5 className={`font-bold transition-colors ${
                    achievement.unlocked
                      ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                      : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>{achievement.name}</h5>
                  <p className={`text-sm transition-colors ${
                    achievement.unlocked
                      ? theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      : theme === 'dark' ? 'text-gray-600' : 'text-gray-500'
                  }`}>{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Learned */}
      <div className={`p-6 rounded-2xl transition-colors ${
        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
      }`}>
        <h4 className={`text-xl font-bold mb-6 flex items-center transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <Brain className="w-6 h-6 mr-2 text-cyan-500" />
          Skills Mastered
        </h4>
        <div className="flex flex-wrap gap-3">
          {progressData.skillsLearned.map((skill, index) => (
            <div key={index} className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
              theme === 'dark' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
            }`}>
              <Star className="w-4 h-4" />
              <span className="font-medium">{skill}</span>
            </div>
          ))}
        </div>
        
        {progressData.skillsLearned.length === 0 && (
          <p className={`text-center py-8 transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Complete chapters to unlock new skills!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;