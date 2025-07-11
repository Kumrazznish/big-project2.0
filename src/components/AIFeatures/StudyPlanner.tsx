import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { Calendar, Clock, Target, Plus, Edit3, Trash2, CheckCircle, AlertCircle, Brain, Zap } from 'lucide-react';

interface StudySession {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number;
  type: 'study' | 'practice' | 'quiz' | 'review';
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface StudyPlannerProps {
  chapter: any;
  subject: string;
  difficulty: string;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ chapter, subject, difficulty }) => {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    type: 'study' as const,
    priority: 'medium' as const
  });

  useEffect(() => {
    // Load sessions from localStorage
    const savedSessions = localStorage.getItem(`study_plan_${chapter.id}`);
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed.map((session: any) => ({
        ...session,
        date: new Date(session.date)
      })));
    }
  }, [chapter.id]);

  const saveSessionsToStorage = (updatedSessions: StudySession[]) => {
    localStorage.setItem(`study_plan_${chapter.id}`, JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  };

  const generateAIStudyPlan = async () => {
    setIsGeneratingAI(true);
    try {
      const prompt = `Create a comprehensive study plan for "${chapter.title}" in ${subject} at ${difficulty} level.

Generate a 7-day study plan with specific sessions. Return as JSON:

{
  "studyPlan": [
    {
      "title": "Session title",
      "description": "What to study and how",
      "dayOffset": 0,
      "duration": 60,
      "type": "study",
      "priority": "high"
    }
  ]
}

Include:
- 5-7 study sessions over a week
- Mix of study, practice, quiz, and review sessions
- Appropriate durations (30-120 minutes)
- Clear descriptions of what to focus on
- Progressive difficulty

Types: study, practice, quiz, review
Priorities: low, medium, high`;

      const response = await geminiService.makeRequest(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedPlan = JSON.parse(cleanedResponse);
      
      const aiSessions: StudySession[] = parsedPlan.studyPlan.map((session: any, index: number) => {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + session.dayOffset);
        
        return {
          id: `ai-${Date.now()}-${index}`,
          title: session.title,
          description: session.description,
          date: sessionDate,
          duration: session.duration,
          type: session.type,
          completed: false,
          priority: session.priority
        };
      });

      const updatedSessions = [...sessions, ...aiSessions];
      saveSessionsToStorage(updatedSessions);
    } catch (error) {
      console.error('Failed to generate AI study plan:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateSession = () => {
    const session: StudySession = {
      id: Date.now().toString(),
      title: newSession.title,
      description: newSession.description,
      date: new Date(newSession.date),
      duration: newSession.duration,
      type: newSession.type,
      completed: false,
      priority: newSession.priority
    };

    const updatedSessions = [...sessions, session];
    saveSessionsToStorage(updatedSessions);
    setNewSession({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      type: 'study',
      priority: 'medium'
    });
    setIsCreating(false);
  };

  const handleToggleComplete = (sessionId: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, completed: !session.completed } : session
    );
    saveSessionsToStorage(updatedSessions);
  };

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    saveSessionsToStorage(updatedSessions);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'from-blue-500 to-cyan-500';
      case 'practice': return 'from-green-500 to-emerald-500';
      case 'quiz': return 'from-purple-500 to-pink-500';
      case 'review': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const sortedSessions = sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
  const upcomingSessions = sortedSessions.filter(session => !session.completed);
  const completedSessions = sortedSessions.filter(session => session.completed);

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-2xl font-bold flex items-center transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <Calendar className="w-7 h-7 mr-3 text-indigo-500" />
          Study Planner
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={generateAIStudyPlan}
            disabled={isGeneratingAI}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            <Brain className="w-4 h-4" />
            <span>{isGeneratingAI ? 'Generating...' : 'AI Plan'}</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Create New Session */}
      {isCreating && (
        <div className={`border rounded-2xl p-6 mb-8 transition-colors ${
          theme === 'dark' ? 'border-white/10 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className={`text-lg font-bold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Create Study Session</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Session title..."
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              className={`p-3 rounded-xl border transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-600 border-white/10 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            />
            <input
              type="date"
              value={newSession.date}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
              className={`p-3 rounded-xl border transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-600 border-white/10 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <textarea
            placeholder="What will you study in this session?"
            value={newSession.description}
            onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
            rows={3}
            className={`w-full p-3 rounded-xl border mb-4 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-600 border-white/10 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Duration (minutes)</label>
              <input
                type="number"
                value={newSession.duration}
                onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                min="15"
                max="240"
                step="15"
                className={`w-full p-3 rounded-xl border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Type</label>
              <select
                value={newSession.type}
                onChange={(e) => setNewSession({ ...newSession, type: e.target.value as any })}
                className={`w-full p-3 rounded-xl border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="study">Study</option>
                <option value="practice">Practice</option>
                <option value="quiz">Quiz</option>
                <option value="review">Review</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Priority</label>
              <select
                value={newSession.priority}
                onChange={(e) => setNewSession({ ...newSession, priority: e.target.value as any })}
                className={`w-full p-3 rounded-xl border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCreating(false)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-slate-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSession}
              disabled={!newSession.title.trim() || !newSession.description.trim()}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              Create Session
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-8">
          <h4 className={`text-xl font-bold mb-6 flex items-center transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Target className="w-6 h-6 mr-2 text-green-500" />
            Upcoming Sessions ({upcomingSessions.length})
          </h4>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className={`border rounded-2xl p-6 transition-colors ${
                theme === 'dark' ? 'border-white/10 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getTypeColor(session.type)} flex items-center justify-center`}>
                      {session.type === 'study' && <Brain className="w-6 h-6 text-white" />}
                      {session.type === 'practice' && <Zap className="w-6 h-6 text-white" />}
                      {session.type === 'quiz' && <Target className="w-6 h-6 text-white" />}
                      {session.type === 'review' && <CheckCircle className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className={`text-lg font-bold transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{session.title}</h5>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(session.priority)}`}>
                          {session.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          theme === 'dark' 
                            ? 'bg-slate-600 text-gray-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {session.type}
                        </span>
                      </div>
                      <p className={`mb-3 transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{session.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className={`flex items-center space-x-1 transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className={`flex items-center space-x-1 transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(session.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleComplete(session.id)}
                      className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h4 className={`text-xl font-bold mb-6 flex items-center transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
            Completed Sessions ({completedSessions.length})
          </h4>
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <div key={session.id} className={`border rounded-2xl p-6 opacity-75 transition-colors ${
                theme === 'dark' ? 'border-white/10 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center`}>
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className={`text-lg font-bold mb-2 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{session.title}</h5>
                      <p className={`mb-3 transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{session.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className={`flex items-center space-x-1 transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className={`flex items-center space-x-1 transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(session.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleComplete(session.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <Calendar className={`w-16 h-16 mx-auto mb-4 transition-colors ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`text-lg transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No study sessions planned yet. Create your first session or generate an AI study plan!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;