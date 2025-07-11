import React, { useState } from 'react';
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Book, Code, Palette, Calculator, Globe, Zap, ArrowRight, Brain, Target, Clock, Users, Sparkles, TrendingUp, Award, CheckCircle, Star, Plus, Edit3 } from 'lucide-react';

import { geminiService } from '../services/geminiService';

interface SubjectSelectorProps {
  onSubjectSelect: (subject: string, difficulty: string, learningStyle: string, timeCommitment: string, goals: string[]) => void;
}

const predefinedSubjects = [
  {
    id: 'programming',
    name: 'Programming & Development',
    description: 'Master modern programming languages and frameworks',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    topics: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript'],
    students: '125K+',
    rating: 4.9,
    projects: 50
  },
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'Build responsive, modern web applications',
    icon: Globe,
    color: 'from-orange-500 to-red-500',
    topics: ['HTML/CSS', 'Frontend', 'Backend', 'Full Stack', 'APIs'],
    students: '98K+',
    rating: 4.8,
    projects: 35
  },
  {
    id: 'data-science',
    name: 'Data Science & AI',
    description: 'Analyze data and build intelligent systems',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    topics: ['Machine Learning', 'Statistics', 'Python', 'TensorFlow', 'Analytics'],
    students: '156K+',
    rating: 4.9,
    projects: 40
  },
  {
    id: 'design',
    name: 'Design & UI/UX',
    description: 'Create beautiful, user-centered designs',
    icon: Palette,
    color: 'from-pink-500 to-purple-500',
    topics: ['UI Design', 'UX Research', 'Figma', 'Prototyping', 'Design Systems'],
    students: '89K+',
    rating: 4.7,
    projects: 30
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Explore mathematical concepts and applications',
    icon: Calculator,
    color: 'from-green-500 to-teal-500',
    topics: ['Calculus', 'Linear Algebra', 'Statistics', 'Discrete Math', 'Applied Math'],
    students: '92K+',
    rating: 4.6,
    projects: 25
  },
  {
    id: 'business',
    name: 'Business & Marketing',
    description: 'Learn business strategy and digital marketing',
    icon: Target,
    color: 'from-indigo-500 to-blue-500',
    topics: ['Strategy', 'Marketing', 'Analytics', 'Leadership', 'Finance'],
    students: '67K+',
    rating: 4.8,
    projects: 20
  }
];

const difficulties = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Perfect for newcomers',
    duration: '3-6 months',
    color: 'from-emerald-400 to-green-500',
    icon: '🌱',
    features: ['Step-by-step guidance', 'Basic concepts', 'Hands-on practice'],
    timePerWeek: '3-5 hours'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Build on existing knowledge',
    duration: '2-4 months',
    color: 'from-yellow-400 to-orange-500',
    icon: '🚀',
    features: ['Advanced concepts', 'Real projects', 'Industry practices'],
    timePerWeek: '5-8 hours'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Master complex topics',
    duration: '1-3 months',
    color: 'from-red-400 to-pink-500',
    icon: '⚡',
    features: ['Expert techniques', 'Complex projects', 'Cutting-edge topics'],
    timePerWeek: '8-12 hours'
  }
];

const learningStyles = [
  {
    id: 'visual',
    name: 'Visual Learner',
    description: 'Learn best with diagrams, videos, and visual aids',
    icon: '👁️',
    features: ['Interactive diagrams', 'Video tutorials', 'Visual examples'],
    percentage: 35
  },
  {
    id: 'practical',
    name: 'Hands-on Learner',
    description: 'Learn by doing projects and practical exercises',
    icon: '🛠️',
    features: ['Coding exercises', 'Real projects', 'Interactive labs'],
    percentage: 40
  },
  {
    id: 'theoretical',
    name: 'Theoretical Learner',
    description: 'Prefer detailed explanations and conceptual understanding',
    icon: '📚',
    features: ['In-depth articles', 'Concept explanations', 'Theory deep-dives'],
    percentage: 15
  },
  {
    id: 'mixed',
    name: 'Mixed Approach',
    description: 'Combination of visual, practical, and theoretical learning',
    icon: '🎯',
    features: ['Balanced content', 'Multiple formats', 'Adaptive approach'],
    percentage: 10
  }
];

const timeCommitments = [
  {
    id: 'casual',
    name: 'Casual Learner',
    description: '1-3 hours per week',
    icon: Clock,
    timeline: '6-12 months',
    ideal: 'Working professionals'
  },
  {
    id: 'regular',
    name: 'Regular Learner',
    description: '4-8 hours per week',
    icon: Clock,
    timeline: '3-6 months',
    ideal: 'Dedicated students'
  },
  {
    id: 'intensive',
    name: 'Intensive Learner',
    description: '10+ hours per week',
    icon: Clock,
    timeline: '1-3 months',
    ideal: 'Career changers'
  }
];

const learningGoals = [
  { id: 'career-change', name: 'Career Change', icon: '💼', description: 'Switch to a new field' },
  { id: 'skill-upgrade', name: 'Skill Upgrade', icon: '📈', description: 'Enhance current skills' },
  { id: 'personal-project', name: 'Personal Project', icon: '🎨', description: 'Build something amazing' },
  { id: 'academic', name: 'Academic Study', icon: '🎓', description: 'Support formal education' },
  { id: 'certification', name: 'Certification', icon: '🏆', description: 'Earn credentials' },
  { id: 'hobby', name: 'Hobby/Interest', icon: '🌟', description: 'Learn for fun' }
];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSubjectSelect }) => {
  const { theme } = useTheme();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedLearningStyle, setSelectedLearningStyle] = useState<string>('');
  const [selectedTimeCommitment, setSelectedTimeCommitment] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [rateLimitStatus, setRateLimitStatus] = useState({ 
    canMakeRequest: true, 
    waitTime: 0, 
    requestsRemaining: 40,
    activeKeys: 0,
    keyStatuses: [] as Array<{ key: string; requests: number; available: boolean; errors: number }>
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check rate limit status periodically
  useEffect(() => {
    const checkRateLimit = () => {
      const status = geminiService.getRateLimitStatus();
      setRateLimitStatus(status);
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setIsCustomSubject(false);
    setCustomSubject('');
  };

  const handleCustomSubjectToggle = () => {
    setIsCustomSubject(true);
    setSelectedSubject('');
  };

  const handleSubmit = () => {
    const finalSubject = isCustomSubject ? customSubject : selectedSubject;
    
    if (finalSubject && selectedDifficulty && selectedLearningStyle && selectedTimeCommitment && selectedGoals.length > 0) {
      console.log('Submitting subject selection:', {
        selectedSubject: finalSubject,
        selectedDifficulty,
        selectedLearningStyle,
        selectedTimeCommitment,
        selectedGoals
      });
      
      // Check rate limit before proceeding
      if (!rateLimitStatus.canMakeRequest) {
        console.error('Cannot make request due to rate limits');
        return;
      }
      
      setIsLoading(true);
      onSubjectSelect(finalSubject, selectedDifficulty, selectedLearningStyle, selectedTimeCommitment, selectedGoals);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isCustomSubject ? customSubject.trim() : selectedSubject;
      case 2: return selectedDifficulty;
      case 3: return selectedLearningStyle;
      case 4: return selectedTimeCommitment;
      case 5: return selectedGoals.length > 0;
      default: return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepTitles = [
    'Choose Your Subject',
    'Select Your Level',
    'Learning Style',
    'Time Commitment',
    'Learning Goals'
  ];

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold transition-colors ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                  : 'text-gray-900'
              }`}>
                Personalized Learning Setup
              </h1>
              <p className={`mt-2 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Let's create your perfect learning experience</p>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step === currentStep
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white scale-110'
                        : step < currentStep
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : theme === 'dark'
                          ? 'bg-slate-700 text-gray-400'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 5 && (
                    <div className={`w-8 h-1 mx-2 rounded-full transition-all ${
                      step < currentStep 
                        ? 'bg-green-500' 
                        : theme === 'dark' 
                          ? 'bg-slate-700' 
                          : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-2 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{stepTitles[currentStep - 1]}</h2>
            <div className={`w-full rounded-full h-2 ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
            }`}>
              <div 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Step 1: Subject Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className={`inline-flex items-center space-x-2 border rounded-full px-4 py-2 mb-6 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20' 
                  : 'bg-gradient-to-r from-cyan-50 to-purple-50 border-cyan-200'
              }`}>
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span className="text-cyan-500 text-sm font-medium">500K+ Students Learning</span>
              </div>
              <p className={`text-xl transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Select a subject or create your own custom learning path</p>
            </div>
            
            {/* Custom Subject Option */}
            <div className={`backdrop-blur-xl border-2 rounded-3xl p-8 mb-8 transition-all duration-500 ${
              isCustomSubject
                ? theme === 'dark'
                  ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-2xl shadow-cyan-500/20'
                  : 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-purple-50 shadow-2xl shadow-cyan-500/20'
                : theme === 'dark'
                  ? 'border-white/10 bg-slate-800/50 hover:border-cyan-500/30'
                  : 'border-gray-200 bg-white/80 hover:border-cyan-300 hover:shadow-xl'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Edit3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Custom Subject</h3>
                    <p className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Create a personalized learning path for any topic</p>
                  </div>
                </div>
                {isCustomSubject && (
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              {isCustomSubject ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter your subject (e.g., Machine Learning, Digital Marketing, Photography...)"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className={`w-full p-4 rounded-xl border text-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-white/10 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                    autoFocus
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsCustomSubject(false)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white hover:bg-slate-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <span className="text-cyan-500 text-sm">✨ AI will create a custom roadmap for your subject</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleCustomSubjectToggle}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-3"
                >
                  <Plus className="w-6 h-6" />
                  <span>Create Custom Subject</span>
                </button>
              )}
            </div>

            {/* Predefined Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predefinedSubjects.map((subject) => {
                const Icon = subject.icon;
                return (
                  <div
                    key={subject.id}
                    className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 hover:scale-105 ${
                      selectedSubject === subject.id
                        ? theme === 'dark'
                          ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-2xl shadow-cyan-500/20'
                          : 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-purple-50 shadow-2xl shadow-cyan-500/20'
                        : theme === 'dark'
                          ? 'border-white/10 bg-slate-800/50 hover:border-cyan-500/30'
                          : 'border-gray-200 bg-white/80 hover:border-cyan-300 hover:shadow-xl'
                    }`}
                    onClick={() => handleSubjectSelect(subject.id)}
                  >
                    <div className="space-y-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${subject.color} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform`}>
                        <Icon size={36} />
                      </div>
                      
                      <div>
                        <h3 className={`text-xl font-bold mb-2 transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{subject.name}</h3>
                        <p className={`mb-4 transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{subject.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-yellow-500 font-medium">{subject.rating}</span>
                          </div>
                          <span className="text-cyan-500 font-medium">{subject.students}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {subject.topics.slice(0, 3).map((topic, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                theme === 'dark' 
                                  ? 'bg-slate-700 text-gray-300' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {topic}
                            </span>
                          ))}
                          {subject.topics.length > 3 && (
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              theme === 'dark' 
                                ? 'bg-slate-700 text-gray-300' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              +{subject.topics.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        <div className={`text-sm transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {subject.projects} hands-on projects
                        </div>
                      </div>
                    </div>
                    
                    {selectedSubject === subject.id && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Difficulty Selection */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <p className={`text-xl transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>What's your current experience level?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {difficulties.map((difficulty) => (
                <div
                  key={difficulty.id}
                  className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 hover:scale-105 ${
                    selectedDifficulty === difficulty.id
                      ? theme === 'dark'
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-2xl shadow-cyan-500/20'
                        : 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-purple-50 shadow-2xl shadow-cyan-500/20'
                      : theme === 'dark'
                        ? 'border-white/10 bg-slate-800/50 hover:border-cyan-500/30'
                        : 'border-gray-200 bg-white/80 hover:border-cyan-300 hover:shadow-xl'
                  }`}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                >
                  <div className="text-center space-y-6">
                    <div className="text-6xl">{difficulty.icon}</div>
                    <div className={`inline-flex px-6 py-3 rounded-2xl bg-gradient-to-r ${difficulty.color} text-white font-bold text-lg`}>
                      {difficulty.name}
                    </div>
                    <p className={`text-lg transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{difficulty.description}</p>
                    <div className="space-y-3">
                      <div className="text-cyan-500 font-medium">Duration: {difficulty.duration}</div>
                      <div className="text-purple-500 font-medium">{difficulty.timePerWeek}/week</div>
                    </div>
                    <div className="space-y-2">
                      {difficulty.features.map((feature, index) => (
                        <div key={index} className={`flex items-center text-sm transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedDifficulty === difficulty.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Learning Style */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <p className={`text-xl transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>How do you learn best?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {learningStyles.map((style) => (
                <div
                  key={style.id}
                  className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 hover:scale-105 ${
                    selectedLearningStyle === style.id
                      ? theme === 'dark'
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-2xl shadow-cyan-500/20'
                        : 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-purple-50 shadow-2xl shadow-cyan-500/20'
                      : theme === 'dark'
                        ? 'border-white/10 bg-slate-800/50 hover:border-cyan-500/30'
                        : 'border-gray-200 bg-white/80 hover:border-cyan-300 hover:shadow-xl'
                  }`}
                  onClick={() => setSelectedLearningStyle(style.id)}
                >
                  <div className="flex items-start space-x-6">
                    <div className="text-5xl">{style.icon}</div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-3 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{style.name}</h3>
                      <p className={`mb-4 transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{style.description}</p>
                      <div className="space-y-2 mb-4">
                        {style.features.map((feature, index) => (
                          <div key={index} className={`flex items-center text-sm transition-colors ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="text-cyan-500 font-medium">
                        {style.percentage}% of learners prefer this style
                      </div>
                    </div>
                  </div>
                  
                  {selectedLearningStyle === style.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Time Commitment */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <p className={`text-xl transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>How much time can you dedicate to learning?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {timeCommitments.map((commitment) => {
                const Icon = commitment.icon;
                return (
                  <div
                    key={commitment.id}
                    className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 hover:scale-105 ${
                      selectedTimeCommitment === commitment.id
                        ? theme === 'dark'
                          ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-2xl shadow-cyan-500/20'
                          : 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-purple-50 shadow-2xl shadow-cyan-500/20'
                        : theme === 'dark'
                          ? 'border-white/10 bg-slate-800/50 hover:border-cyan-500/30'
                          : 'border-gray-200 bg-white/80 hover:border-cyan-300 hover:shadow-xl'
                    }`}
                    onClick={() => setSelectedTimeCommitment(commitment.id)}
                  >
                    <div className="text-center space-y-6">
                      <Icon size={48} className="mx-auto text-cyan-500" />
                      <h3 className={`text-xl font-bold transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{commitment.name}</h3>
                      <p className={`transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{commitment.description}</p>
                      <div className="space-y-2">
                        <div className="text-purple-500 font-medium">Timeline: {commitment.timeline}</div>
                        <div className="text-cyan-500 font-medium">Ideal for: {commitment.ideal}</div>
                      </div>
                    </div>
                    
                    {selectedTimeCommitment === commitment.id && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Learning Goals */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <p className={`text-xl transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>What are you hoping to achieve? (Select all that apply)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {learningGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 hover:scale-105 ${
                    selectedGoals.includes(goal.id)
                      ? theme === 'dark'
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-xl shadow-cyan-500/20'
                        : 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-purple-50 shadow-xl shadow-cyan-500/20'
                      : theme === 'dark'
                        ? 'border-white/10 bg-slate-800/50 hover:border-cyan-500/30'
                        : 'border-gray-200 bg-white/80 hover:border-cyan-300 hover:shadow-lg'
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{goal.icon}</div>
                    <div>
                      <h3 className={`font-bold transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{goal.name}</h3>
                      <p className={`text-sm transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{goal.description}</p>
                    </div>
                  </div>
                  
                  {selectedGoals.includes(goal.id) && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex justify-between items-center mt-16 pt-8 border-t transition-colors ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        }`}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-8 py-4 rounded-xl font-semibold transition-all ${
              currentStep === 1
                ? theme === 'dark'
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          <div className="text-center">
            <div className={`text-sm mb-2 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Step {currentStep} of 5</div>
            <div className="text-cyan-500 font-medium">
              {currentStep === 5 ? 'Ready to generate your roadmap!' : 'Continue to customize your experience'}
            </div>
          </div>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`group px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                canProceed()
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  : theme === 'dark'
                    ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || !rateLimitStatus.canMakeRequest || isLoading}
              className={`group px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                canProceed() && rateLimitStatus.canMakeRequest && !isLoading
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  : theme === 'dark'
                    ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>
                {isLoading
                  ? 'Generating...'
                  : !rateLimitStatus.canMakeRequest 
                  ? `Wait ${Math.ceil(rateLimitStatus.waitTime / 1000)}s` 
                  : 'Generate My Roadmap'
                }
              </span>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
          )}
        </div>

        {/* Rate limit indicator */}
        {!rateLimitStatus.canMakeRequest && (
          <div className={`mt-4 p-4 rounded-xl border text-center transition-colors ${
            theme === 'dark' 
              ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
              : 'bg-orange-50 border-orange-200 text-orange-600'
          }`}>
            <p className="font-medium mb-2">API Rate Limit Reached</p>
            <p className="text-sm">Please wait {Math.ceil(rateLimitStatus.waitTime / 1000)} seconds before generating a roadmap.</p>
          </div>
        )}
        
        <div className={`mt-2 text-center text-xs transition-colors ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="flex items-center justify-center space-x-3 flex-wrap gap-1">
            <span>API Keys: {rateLimitStatus.activeKeys}</span>
            <span>Requests Available: {rateLimitStatus.requestsRemaining}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelector;