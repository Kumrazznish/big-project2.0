import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { Award, Settings, Play, CheckCircle, XCircle, Clock, Target, Brain, Zap, Star, TrendingUp, BarChart3, Lightbulb, AlertCircle, RefreshCw, Download, Share, Filter, Shuffle, Eye, EyeOff } from 'lucide-react';

interface SmartQuizGeneratorProps {
  chapter: any;
  subject: string;
  difficulty: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  points: number;
}

interface QuizConfig {
  questionCount: number;
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
  topics: string[];
  timeLimit: number;
  questionTypes: string[];
}

const SmartQuizGenerator: React.FC<SmartQuizGeneratorProps> = ({ chapter, subject, difficulty }) => {
  const { theme } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    questionCount: 5,
    difficulty: 'mixed',
    topics: [chapter.title],
    timeLimit: 300,
    questionTypes: ['multiple-choice']
  });
  const [showConfig, setShowConfig] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  React.useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted) {
      handleQuizSubmit();
    }
  }, [timeLeft, quizStarted]);

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate ${quizConfig.questionCount} quiz questions for "${chapter.title}" in ${subject}.

Configuration:
- Difficulty: ${quizConfig.difficulty}
- Topics: ${quizConfig.topics.join(', ')}
- Question types: ${quizConfig.questionTypes.join(', ')}

Return as JSON array:
[
  {
    "id": "q1",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Detailed explanation of why this is correct",
    "difficulty": "medium",
    "topic": "${chapter.title}",
    "points": 10
  }
]

Requirements:
- Questions should test understanding, not just memorization
- Include practical application questions
- Vary difficulty if "mixed" is selected
- Provide clear, educational explanations
- Make incorrect options plausible but clearly wrong`;

      const response = await geminiService.makeRequest(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const generatedQuestions = JSON.parse(cleanedResponse);
      
      const questionsWithIds = generatedQuestions.map((q: any, index: number) => ({
        ...q,
        id: `q_${Date.now()}_${index}`
      }));
      
      setQuestions(questionsWithIds);
      setCurrentQuiz(questionsWithIds);
      setSelectedAnswers({});
      setShowResults(false);
      setCurrentQuestionIndex(0);
      
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quizConfig.timeLimit);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleQuizSubmit = () => {
    setQuizStarted(false);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    currentQuiz.forEach(question => {
      totalPoints += question.points;
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
        earnedPoints += question.points;
      }
    });

    return {
      correct,
      total: currentQuiz.length,
      percentage: Math.round((correct / currentQuiz.length) * 100),
      points: earnedPoints,
      totalPoints
    };
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const score = showResults ? calculateScore() : null;

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Smart Quiz Generator
            </h3>
            <p className="text-orange-500 font-medium">AI-powered adaptive quizzes</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Config</span>
          </button>
          
          {!quizStarted && currentQuiz.length === 0 && (
            <button
              onClick={generateQuiz}
              disabled={isGenerating}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Quiz'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className={`border rounded-2xl p-6 mb-8 transition-colors ${
          theme === 'dark' ? 'border-white/10 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className={`text-lg font-bold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Quiz Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Number of Questions
              </label>
              <select
                value={quizConfig.questionCount}
                onChange={(e) => setQuizConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Difficulty Level
              </label>
              <select
                value={quizConfig.difficulty}
                onChange={(e) => setQuizConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="mixed">Mixed Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Time Limit (seconds)
              </label>
              <select
                value={quizConfig.timeLimit}
                onChange={(e) => setQuizConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value={180}>3 minutes</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
                <option value={900}>15 minutes</option>
                <option value={0}>No time limit</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Question Types
              </label>
              <select
                value={quizConfig.questionTypes[0]}
                onChange={(e) => setQuizConfig(prev => ({ ...prev, questionTypes: [e.target.value] }))}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="mixed">Mixed Types</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Content */}
      {currentQuiz.length > 0 && !quizStarted && !showResults && (
        <div className="text-center py-12">
          <Award className={`w-24 h-24 mx-auto mb-6 ${
            theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
          }`} />
          <h3 className={`text-3xl font-bold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Quiz Ready!
          </h3>
          <p className={`text-xl mb-8 transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {currentQuiz.length} questions • {quizConfig.timeLimit > 0 ? formatTime(quizConfig.timeLimit) : 'No time limit'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className={`p-4 rounded-xl transition-colors ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-blue-500 font-bold">{currentQuiz.length}</div>
              <div className={`text-sm transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Questions</div>
            </div>
            <div className={`p-4 rounded-xl transition-colors ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-purple-500 font-bold">
                {quizConfig.timeLimit > 0 ? formatTime(quizConfig.timeLimit) : '∞'}
              </div>
              <div className={`text-sm transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Time Limit</div>
            </div>
            <div className={`p-4 rounded-xl transition-colors ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-yellow-500 font-bold">
                {currentQuiz.reduce((sum, q) => sum + q.points, 0)}
              </div>
              <div className={`text-sm transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Points</div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-12 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all font-bold text-lg flex items-center space-x-3 mx-auto"
          >
            <Play className="w-6 h-6" />
            <span>Start Quiz</span>
          </button>
        </div>
      )}

      {/* Active Quiz */}
      {quizStarted && !showResults && (
        <div>
          {/* Quiz Header */}
          <div className={`flex items-center justify-between p-4 rounded-xl mb-6 transition-colors ${
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-4">
              <span className={`text-lg font-bold transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Question {currentQuestionIndex + 1} of {currentQuiz.length}
              </span>
            </div>
            
            {quizConfig.timeLimit > 0 && (
              <div className={`flex items-center space-x-2 ${
                timeLeft < 60 ? 'text-red-500' : 'text-orange-500'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className={`w-full rounded-full h-2 mb-8 ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%` }}
            ></div>
          </div>

          {/* Current Question */}
          {currentQuiz[currentQuestionIndex] && (
            <div className={`border rounded-2xl p-8 transition-colors ${
              theme === 'dark' ? 'border-white/10 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getDifficultyColor(currentQuiz[currentQuestionIndex].difficulty)} text-white`}>
                  {currentQuiz[currentQuestionIndex].difficulty.charAt(0).toUpperCase() + currentQuiz[currentQuestionIndex].difficulty.slice(1)}
                </span>
                <span className="text-orange-500 font-bold">
                  {currentQuiz[currentQuestionIndex].points} points
                </span>
              </div>

              <h4 className={`text-xl font-bold mb-6 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {currentQuiz[currentQuestionIndex].question}
              </h4>

              <div className="space-y-3">
                {currentQuiz[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuiz[currentQuestionIndex].id, index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAnswers[currentQuiz[currentQuestionIndex].id] === index
                        ? theme === 'dark'
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-orange-400 bg-orange-50'
                        : theme === 'dark'
                          ? 'border-white/10 hover:border-orange-500/50 hover:bg-slate-600/50'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuiz[currentQuestionIndex].id] === index
                          ? 'border-orange-500 bg-orange-500'
                          : theme === 'dark'
                            ? 'border-gray-500'
                            : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuiz[currentQuestionIndex].id] === index && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className={`transition-colors ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-3 rounded-xl transition-colors ${
                    currentQuestionIndex === 0
                      ? theme === 'dark'
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-slate-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>

                {currentQuestionIndex === currentQuiz.length - 1 ? (
                  <button
                    onClick={handleQuizSubmit}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(currentQuiz.length - 1, currentQuestionIndex + 1))}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {showResults && score && (
        <div className="space-y-8">
          {/* Score Summary */}
          <div className={`text-center p-8 rounded-2xl transition-colors ${
            score.percentage >= 70
              ? theme === 'dark'
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-green-50 border border-green-200'
              : theme === 'dark'
                ? 'bg-orange-500/20 border border-orange-500/30'
                : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              score.percentage >= 70
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}>
              {score.percentage >= 70 ? (
                <CheckCircle className="w-12 h-12 text-white" />
              ) : (
                <Target className="w-12 h-12 text-white" />
              )}
            </div>

            <h3 className={`text-3xl font-bold mb-4 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Quiz Complete!
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className={`p-4 rounded-xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-white'
              }`}>
                <div className="text-3xl font-bold text-blue-500">{score.percentage}%</div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Score</div>
              </div>
              <div className={`p-4 rounded-xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-white'
              }`}>
                <div className="text-3xl font-bold text-green-500">{score.correct}</div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Correct</div>
              </div>
              <div className={`p-4 rounded-xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-white'
              }`}>
                <div className="text-3xl font-bold text-red-500">{score.total - score.correct}</div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Incorrect</div>
              </div>
              <div className={`p-4 rounded-xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-white'
              }`}>
                <div className="text-3xl font-bold text-purple-500">{score.points}</div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Points</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            <h4 className={`text-xl font-bold transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Detailed Results
            </h4>
            
            {currentQuiz.map((question, index) => {
              const userAnswer = selectedAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className={`border rounded-2xl p-6 transition-colors ${
                  isCorrect
                    ? theme === 'dark'
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-green-200 bg-green-50'
                    : theme === 'dark'
                      ? 'border-red-500/30 bg-red-500/10'
                      : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isCorrect
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <XCircle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h5 className={`font-bold mb-2 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Question {index + 1}
                      </h5>
                      <p className={`mb-4 transition-colors ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {question.question}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg transition-colors ${
                              optionIndex === question.correctAnswer
                                ? theme === 'dark'
                                  ? 'bg-green-500/20 border border-green-500/30'
                                  : 'bg-green-100 border border-green-300'
                                : optionIndex === userAnswer && !isCorrect
                                  ? theme === 'dark'
                                    ? 'bg-red-500/20 border border-red-500/30'
                                    : 'bg-red-100 border border-red-300'
                                  : theme === 'dark'
                                    ? 'bg-slate-700/50'
                                    : 'bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                optionIndex === question.correctAnswer
                                  ? 'border-green-500 bg-green-500'
                                  : optionIndex === userAnswer && !isCorrect
                                    ? 'border-red-500 bg-red-500'
                                    : 'border-gray-400'
                              }`}>
                                {(optionIndex === question.correctAnswer || (optionIndex === userAnswer && !isCorrect)) && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span>{option}</span>
                              {optionIndex === question.correctAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                              )}
                              {optionIndex === userAnswer && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className={`p-4 rounded-xl border-l-4 ${
                        isCorrect
                          ? theme === 'dark'
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-green-500 bg-green-50'
                          : theme === 'dark'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-500 font-medium text-sm">Explanation</span>
                        </div>
                        <p className={`text-sm transition-colors ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentQuiz([]);
                setQuestions([]);
                setShowResults(false);
                setQuizStarted(false);
                setSelectedAnswers({});
              }}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all font-bold"
            >
              Generate New Quiz
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {currentQuiz.length === 0 && !isGenerating && (
        <div className="text-center py-16">
          <Award className={`w-24 h-24 mx-auto mb-8 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-3xl font-bold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Smart Quiz Generator
          </h3>
          <p className={`text-xl mb-8 transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Generate personalized quizzes tailored to your learning needs
          </p>
          <button
            onClick={generateQuiz}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-12 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all font-bold text-lg"
          >
            Create Your First Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartQuizGenerator;