import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { geminiService } from '../services/geminiService';
import { CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft, RotateCcw, Award, Target, Zap, Brain, AlertCircle, Trophy, Star, TrendingUp } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface Quiz {
  chapterId: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
  totalQuestions: number;
  totalPoints: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
}

interface QuizViewProps {
  chapter: Chapter;
  subject: string;
  difficulty: string;
  onBack: () => void;
  onQuizComplete: (result: QuizResult) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ chapter, subject, difficulty, onBack, onQuizComplete }) => {
  const { theme } = useTheme();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;

  useEffect(() => {
    generateQuiz();
  }, [chapter.id, subject, difficulty]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, quizStarted, showResults]);

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check rate limit status before making request
      const rateLimitStatus = geminiService.getRateLimitStatus();
      if (!rateLimitStatus.canMakeRequest) {
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimitStatus.waitTime / 1000)} seconds before trying again.`);
      }
      
      const quizData = await geminiService.generateQuiz(chapter.title, subject, difficulty);
      setQuiz(quizData);
      setSelectedAnswers(new Array(quizData.questions.length).fill(-1));
      setTimeLeft(quizData.timeLimit);
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      generateQuiz();
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;
    
    setShowResults(true);
    const result = calculateResult();
    onQuizComplete(result);
  };

  const calculateResult = (): QuizResult => {
    if (!quiz) {
      return {
        score: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        percentage: 0,
        answers: []
      };
    }

    const answers = selectedAnswers.map((answer, index) => ({
      questionId: quiz.questions[index].id,
      selectedAnswer: answer,
      isCorrect: answer === quiz.questions[index].correctAnswer
    }));

    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const wrongAnswers = answers.filter(answer => !answer.isCorrect).length;
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer.isCorrect ? quiz.questions[index].points : 0);
    }, 0);
    const percentage = Math.round((score / quiz.totalPoints) * 100);

    return {
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      wrongAnswers,
      percentage,
      answers
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quiz?.questions.length || 0).fill(-1));
    setShowResults(false);
    setQuizStarted(false);
    setTimeLeft(quiz?.timeLimit || 0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-purple-500/30 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
              </div>
              <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Generating Quiz Questions
              </h3>
              <p className={`transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                AI is creating personalized quiz questions for {chapter.title}...
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
          <div className={`max-w-md mx-4 p-8 rounded-3xl border text-center transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-red-500/30 backdrop-blur-xl' 
              : 'bg-white/80 border-red-200 backdrop-blur-xl'
          }`}>
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-4 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Quiz Generation Failed
            </h3>
            <p className={`mb-6 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {error}
            </p>
            <div className="space-y-3">
              {retryCount < maxRetries && (
                <button
                  onClick={handleRetry}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-semibold"
                >
                  Try Again ({retryCount + 1}/{maxRetries})
                </button>
              )}
              <button
                onClick={onBack}
                className={`w-full border px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
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

  if (!quiz) return null;

  if (showResults) {
    const result = calculateResult();
    const passed = result.percentage >= quiz.passingScore;

    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className={`backdrop-blur-xl border rounded-3xl p-8 text-center mb-8 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="mb-8">
              {passed ? (
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-12 h-12 text-white" />
                </div>
              )}
              <h1 className={`text-4xl font-bold mb-4 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Quiz Complete!
              </h1>
              <p className={`text-xl transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {passed ? 'Congratulations! You passed!' : 'Keep studying and try again!'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-2xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-blue-500 font-semibold mb-1">Score</p>
                <p className="text-3xl font-bold text-blue-600">{result.percentage}%</p>
              </div>
              
              <div className={`p-6 rounded-2xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-green-500 font-semibold mb-1">Correct</p>
                <p className="text-3xl font-bold text-green-600">{result.correctAnswers}/{result.totalQuestions}</p>
              </div>
              
              <div className={`p-6 rounded-2xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-purple-500 font-semibold mb-1">Points</p>
                <p className="text-3xl font-bold text-purple-600">{result.score}/{quiz.totalPoints}</p>
              </div>
              
              <div className={`p-6 rounded-2xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-orange-500 font-semibold mb-1">Time Used</p>
                <p className="text-3xl font-bold text-orange-600">{formatTime(quiz.timeLimit - timeLeft)}</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={restartQuiz}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onBack}
                className={`border px-8 py-4 rounded-xl transition-all duration-300 font-semibold ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-white/5' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                Back to Chapter
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Detailed Results
            </h2>
            <div className="space-y-6">
              {quiz.questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
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
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-bold transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            Question {index + 1}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(question.difficulty)} text-white`}>
                              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                            </span>
                            <span className="text-purple-500 font-medium text-sm">{question.points} pts</span>
                          </div>
                        </div>
                        
                        <p className={`mb-4 transition-colors ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {question.question}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-xl border transition-colors ${
                                optionIndex === question.correctAnswer
                                  ? theme === 'dark'
                                    ? 'border-green-500 bg-green-500/20 text-green-400'
                                    : 'border-green-500 bg-green-100 text-green-700'
                                  : optionIndex === userAnswer && !isCorrect
                                    ? theme === 'dark'
                                      ? 'border-red-500 bg-red-500/20 text-red-400'
                                      : 'border-red-500 bg-red-100 text-red-700'
                                    : theme === 'dark'
                                      ? 'border-gray-600 bg-slate-700/50 text-gray-300'
                                      : 'border-gray-200 bg-gray-50 text-gray-700'
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
                          <p className={`text-sm transition-colors ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className={`backdrop-blur-xl border rounded-3xl p-8 text-center transition-colors ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <Brain className="w-12 h-12 text-white" />
            </div>
            
            <h1 className={`text-4xl font-bold mb-4 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {quiz.title}
            </h1>
            <p className={`text-xl mb-8 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {quiz.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-2xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                <p className="text-blue-500 font-semibold mb-2">Time Limit</p>
                <p className={`text-2xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatTime(quiz.timeLimit)}
                </p>
              </div>
              
              <div className={`p-6 rounded-2xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <Target className="w-8 h-8 text-green-500 mx-auto mb-4" />
                <p className="text-green-500 font-semibold mb-2">Questions</p>
                <p className={`text-2xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {quiz.totalQuestions}
                </p>
              </div>
              
              <div className={`p-6 rounded-2xl transition-colors ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                <p className="text-purple-500 font-semibold mb-2">Passing Score</p>
                <p className={`text-2xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {quiz.passingScore}%
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-2xl mb-8 border-l-4 border-cyan-500 transition-colors ${
              theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'
            }`}>
              <h3 className={`font-bold mb-2 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Quiz Instructions:
              </h3>
              <ul className={`text-left space-y-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <li>• Read each question carefully before selecting your answer</li>
                <li>• You can navigate between questions using the Previous/Next buttons</li>
                <li>• Your progress is automatically saved</li>
                <li>• Submit your quiz before time runs out</li>
                <li>• You need {quiz.passingScore}% to pass this quiz</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={onBack}
                className={`border px-8 py-4 rounded-xl transition-all duration-300 font-semibold ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-white/5' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                Back to Chapter
              </button>
              <button
                onClick={startQuiz}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Start Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredQuestions = selectedAnswers.filter(answer => answer !== -1).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className={`backdrop-blur-xl border rounded-3xl p-6 mb-8 transition-colors ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-white/10' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {quiz.title}
            </h1>
            <div className="flex items-center space-x-6">
              <div className={`flex items-center space-x-2 ${
                timeLeft < 60 ? 'text-red-500' : 'text-orange-500'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
              <span className={`transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className={`w-full rounded-full h-3 ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
            }`}>
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className={`transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Progress: {Math.round(progress)}%
              </span>
              <span className={`transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Answered: {answeredQuestions}/{quiz.questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-8 transition-colors ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-white/10' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getDifficultyColor(currentQ.difficulty)} flex items-center justify-center`}>
                <span className="text-white font-bold">{currentQuestion + 1}</span>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(currentQ.difficulty)} text-white`}>
                  {currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1)}
                </span>
              </div>
            </div>
            <div className="text-purple-500 font-bold">
              {currentQ.points} points
            </div>
          </div>
          
          <h2 className={`text-2xl font-bold mb-8 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {currentQ.question}
          </h2>
          
          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                  selectedAnswers[currentQuestion] === index
                    ? theme === 'dark'
                      ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg'
                      : 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                    : theme === 'dark'
                      ? 'border-white/10 hover:border-purple-500/50 hover:bg-slate-700/50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-purple-500 bg-purple-500'
                      : theme === 'dark'
                        ? 'border-gray-500'
                        : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-lg transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
              currentQuestion === 0
                ? theme === 'dark'
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Previous</span>
          </button>
          
          <div className="text-center">
            <div className={`text-sm mb-2 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
            <div className="text-purple-500 font-medium">
              {selectedAnswers[currentQuestion] !== -1 ? 'Answer selected' : 'Select an answer'}
            </div>
          </div>

          <div className="flex space-x-4">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center space-x-2"
              >
                <Award className="w-5 h-5" />
                <span>Submit Quiz</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizView;