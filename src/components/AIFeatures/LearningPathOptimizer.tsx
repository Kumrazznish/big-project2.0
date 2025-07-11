import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { Target, TrendingUp, Zap, Brain, Clock, Star, Award, BarChart3, Lightbulb, CheckCircle, ArrowRight, RefreshCw, Settings, Eye, Filter, Calendar, Users, Globe, Shield, Rocket, Code, Palette, Calculator, Database, Smartphone, Camera, Headphones, Monitor, Wifi, Lock, Layers, Cpu } from 'lucide-react';

interface LearningPathOptimizerProps {
  chapter: any;
  subject: string;
  difficulty: string;
}

interface OptimizationSuggestion {
  id: string;
  type: 'sequence' | 'focus' | 'time' | 'method' | 'resource';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: string;
  actionItems: string[];
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  difficulty: string;
  steps: LearningStep[];
  efficiency: number;
  completionRate: number;
}

interface LearningStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  prerequisites: string[];
  resources: string[];
  completed: boolean;
}

const LearningPathOptimizer: React.FC<LearningPathOptimizerProps> = ({ chapter, subject, difficulty }) => {
  const { theme } = useTheme();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [optimizedPath, setOptimizedPath] = useState<LearningPath | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [timeAvailable, setTimeAvailable] = useState('regular');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    generateCurrentPath();
  }, [chapter.title, subject, difficulty]);

  const generateCurrentPath = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze the current learning path for "${chapter.title}" in ${subject} at ${difficulty} level.

Create a structured learning path with the following JSON format:

{
  "id": "path_current",
  "name": "Current Learning Path",
  "description": "Standard approach to learning ${chapter.title}",
  "estimatedTime": "4-6 hours",
  "difficulty": "${difficulty}",
  "steps": [
    {
      "id": "step1",
      "title": "Introduction and Overview",
      "description": "Basic introduction to concepts",
      "estimatedTime": "30 minutes",
      "prerequisites": [],
      "resources": ["Reading materials", "Video introduction"],
      "completed": false
    }
  ],
  "efficiency": 75,
  "completionRate": 68
}

Include 6-8 logical learning steps that build upon each other.`;

      const response = await geminiService.makeRequest(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const pathData = JSON.parse(cleanedResponse);
      
      setCurrentPath(pathData);
      await generateOptimizations(pathData);
      
    } catch (error) {
      console.error('Failed to generate learning path:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateOptimizations = async (currentPath: LearningPath) => {
    try {
      const prompt = `Analyze this learning path and provide optimization suggestions:

Current Path: ${JSON.stringify(currentPath)}
Learning Style: ${learningStyle}
Time Available: ${timeAvailable}
Focus Areas: ${focusAreas.join(', ')}

Generate optimization suggestions as JSON array:

[
  {
    "id": "opt1",
    "type": "sequence",
    "title": "Reorder Learning Sequence",
    "description": "Detailed description of the optimization",
    "impact": "high",
    "effort": "low",
    "estimatedImprovement": "25% faster completion",
    "actionItems": ["Action 1", "Action 2"]
  }
]

Types: sequence, focus, time, method, resource
Impact/Effort: high, medium, low

Provide 4-6 practical optimization suggestions.`;

      const response = await geminiService.makeRequest(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const optimizations = JSON.parse(cleanedResponse);
      
      setSuggestions(optimizations);
      
    } catch (error) {
      console.error('Failed to generate optimizations:', error);
    }
  };

  const applyOptimization = async (suggestionId: string) => {
    if (!currentPath) return;
    
    setIsAnalyzing(true);
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;

      const prompt = `Apply this optimization to the learning path:

Current Path: ${JSON.stringify(currentPath)}
Optimization: ${JSON.stringify(suggestion)}

Generate an optimized learning path with the same JSON structure but improved based on the optimization. Increase efficiency and completion rate appropriately.`;

      const response = await geminiService.makeRequest(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const optimizedPathData = JSON.parse(cleanedResponse);
      
      setOptimizedPath(optimizedPathData);
      
    } catch (error) {
      console.error('Failed to apply optimization:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sequence': return ArrowRight;
      case 'focus': return Target;
      case 'time': return Clock;
      case 'method': return Lightbulb;
      case 'resource': return Star;
      default: return Zap;
    }
  };

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Learning Path Optimizer
            </h3>
            <p className="text-teal-500 font-medium">AI-powered path optimization</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={generateCurrentPath}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : (
              'Reanalyze'
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`border rounded-2xl p-6 mb-8 transition-colors ${
          theme === 'dark' ? 'border-white/10 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className={`text-lg font-bold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Optimization Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Learning Style
              </label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="visual">Visual</option>
                <option value="practical">Hands-on</option>
                <option value="theoretical">Theoretical</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Time Available
              </label>
              <select
                value={timeAvailable}
                onChange={(e) => setTimeAvailable(e.target.value)}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="limited">Limited (1-2 hours/week)</option>
                <option value="regular">Regular (3-5 hours/week)</option>
                <option value="intensive">Intensive (10+ hours/week)</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Primary Goal
              </label>
              <select
                className={`w-full p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-600 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="understanding">Deep Understanding</option>
                <option value="application">Practical Application</option>
                <option value="certification">Certification Prep</option>
                <option value="project">Project Completion</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Current vs Optimized Comparison */}
      {currentPath && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Path */}
          <div className={`border rounded-2xl p-6 transition-colors ${
            theme === 'dark' ? 'border-white/10 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-bold transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Current Path</h4>
              <div className="flex items-center space-x-2">
                <div className={`text-sm px-2 py-1 rounded-lg transition-colors ${
                  theme === 'dark' ? 'bg-slate-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {currentPath.efficiency}% efficient
                </div>
              </div>
            </div>
            
            <p className={`text-sm mb-4 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {currentPath.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-teal-500 font-bold">{currentPath.estimatedTime}</div>
                <div className={`text-xs transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Estimated Time</div>
              </div>
              <div>
                <div className="text-blue-500 font-bold">{currentPath.completionRate}%</div>
                <div className={`text-xs transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Completion Rate</div>
              </div>
            </div>

            <div className="space-y-2">
              {currentPath.steps.slice(0, 4).map((step, index) => (
                <div key={step.id} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'bg-slate-600/50' : 'bg-white'
                }`}>
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.estimatedTime}
                    </div>
                  </div>
                </div>
              ))}
              {currentPath.steps.length > 4 && (
                <div className={`text-center text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  +{currentPath.steps.length - 4} more steps
                </div>
              )}
            </div>
          </div>

          {/* Optimized Path */}
          {optimizedPath && (
            <div className={`border rounded-2xl p-6 transition-colors ${
              theme === 'dark' 
                ? 'border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/10' 
                : 'border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Optimized Path</h4>
                <div className="flex items-center space-x-2">
                  <div className="text-sm px-2 py-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    {optimizedPath.efficiency}% efficient
                  </div>
                  <div className="text-xs text-green-500 font-medium">
                    +{optimizedPath.efficiency - currentPath.efficiency}%
                  </div>
                </div>
              </div>
              
              <p className={`text-sm mb-4 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {optimizedPath.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-teal-500 font-bold">{optimizedPath.estimatedTime}</div>
                  <div className={`text-xs transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Estimated Time</div>
                </div>
                <div>
                  <div className="text-blue-500 font-bold">{optimizedPath.completionRate}%</div>
                  <div className={`text-xs transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Completion Rate</div>
                </div>
              </div>

              <div className="space-y-2">
                {optimizedPath.steps.slice(0, 4).map((step, index) => (
                  <div key={step.id} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'bg-teal-500/20' : 'bg-white'
                  }`}>
                    <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </div>
                      <div className={`text-xs transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {step.estimatedTime}
                      </div>
                    </div>
                  </div>
                ))}
                {optimizedPath.steps.length > 4 && (
                  <div className={`text-center text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    +{optimizedPath.steps.length - 4} more steps
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-6">
          <h4 className={`text-xl font-bold transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Optimization Suggestions
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((suggestion) => {
              const TypeIcon = getTypeIcon(suggestion.type);
              return (
                <div
                  key={suggestion.id}
                  className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedSuggestion === suggestion.id
                      ? theme === 'dark'
                        ? 'border-teal-500/50 bg-teal-500/10'
                        : 'border-teal-300 bg-teal-50'
                      : theme === 'dark'
                        ? 'border-white/10 bg-slate-700/30 hover:border-teal-500/30'
                        : 'border-gray-200 bg-gray-50 hover:border-teal-300 hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedSuggestion(suggestion.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getImpactColor(suggestion.impact)} flex items-center justify-center`}>
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className={`font-bold transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {suggestion.title}
                        </h5>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getEffortColor(suggestion.effort)}`}>
                            {suggestion.effort} effort
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {suggestion.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-teal-500 font-medium text-sm">
                          {suggestion.estimatedImprovement}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            applyOptimization(suggestion.id);
                          }}
                          disabled={isAnalyzing}
                          className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all text-sm font-medium disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                      
                      {selectedSuggestion === suggestion.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                          <h6 className={`font-medium mb-2 transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            Action Items:
                          </h6>
                          <ul className="space-y-1">
                            {suggestion.actionItems.map((item, index) => (
                              <li key={index} className={`flex items-center space-x-2 text-sm transition-colors ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                <CheckCircle className="w-3 h-3 text-teal-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-teal-500/30 rounded-full animate-spin mx-auto mb-4">
            <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full"></div>
          </div>
          <p className={`text-lg transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            AI is analyzing your learning path and generating optimizations...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!currentPath && !isAnalyzing && (
        <div className="text-center py-16">
          <Target className={`w-24 h-24 mx-auto mb-8 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-3xl font-bold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Learning Path Optimizer
          </h3>
          <p className={`text-xl mb-8 transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Optimize your learning path for maximum efficiency and better outcomes
          </p>
          <button
            onClick={generateCurrentPath}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-12 py-4 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all font-bold text-lg"
          >
            Analyze Learning Path
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningPathOptimizer;