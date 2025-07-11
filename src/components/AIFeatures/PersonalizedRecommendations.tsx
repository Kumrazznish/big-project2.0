import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { Star, TrendingUp, Lightbulb, BookOpen, Target, Award, Clock, Users, Globe, Zap, Brain, Code, Palette, Calculator, Database, Smartphone, Camera, Headphones, Monitor, Wifi, Settings, Lock, Layers, Cpu, RefreshCw, ExternalLink, Play, Download, Share, Heart, ThumbsUp, Filter, Search, Eye, BarChart3, Calendar, MessageCircle } from 'lucide-react';

interface PersonalizedRecommendationsProps {
  chapter: any;
  subject: string;
  difficulty: string;
}

interface Recommendation {
  id: string;
  type: 'resource' | 'practice' | 'concept' | 'tool' | 'community' | 'project';
  title: string;
  description: string;
  relevance: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  url?: string;
  rating: number;
  reviews: number;
  provider: string;
  isFree: boolean;
  reasoning: string;
}

interface LearningProfile {
  strengths: string[];
  weaknesses: string[];
  learningStyle: string;
  interests: string[];
  goals: string[];
  timeAvailable: string;
  experience: string;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({ chapter, subject, difficulty }) => {
  const { theme } = useTheme();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningProfile, setLearningProfile] = useState<LearningProfile>({
    strengths: [],
    weaknesses: [],
    learningStyle: 'mixed',
    interests: [],
    goals: [],
    timeAvailable: 'regular',
    experience: difficulty
  });
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'time'>('relevance');
  const [showProfile, setShowProfile] = useState(false);
  const [likedRecommendations, setLikedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateRecommendations();
  }, [chapter.title, subject, difficulty]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate personalized learning recommendations for "${chapter.title}" in ${subject} at ${difficulty} level.

Learning Profile:
- Strengths: ${learningProfile.strengths.join(', ') || 'General knowledge'}
- Weaknesses: ${learningProfile.weaknesses.join(', ') || 'None specified'}
- Learning Style: ${learningProfile.learningStyle}
- Interests: ${learningProfile.interests.join(', ') || 'General learning'}
- Goals: ${learningProfile.goals.join(', ') || 'Skill improvement'}
- Time Available: ${learningProfile.timeAvailable}

Generate 8-12 diverse recommendations as JSON array:

[
  {
    "id": "rec1",
    "type": "resource",
    "title": "Interactive Tutorial: Advanced Concepts",
    "description": "Comprehensive tutorial covering advanced topics with hands-on examples",
    "relevance": 95,
    "difficulty": "intermediate",
    "estimatedTime": "2-3 hours",
    "tags": ["tutorial", "interactive", "advanced"],
    "url": "https://example.com/tutorial",
    "rating": 4.8,
    "reviews": 1250,
    "provider": "TechEd Platform",
    "isFree": true,
    "reasoning": "Matches your learning style and fills knowledge gaps"
  }
]

Types: resource, practice, concept, tool, community, project
Include mix of free and paid resources
Relevance: 1-100 based on profile match
Provide realistic URLs and providers`;

      const response = await geminiService.makeRequest(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const recommendationsData = JSON.parse(cleanedResponse);
      
      const recommendationsWithIds = recommendationsData.map((rec: any, index: number) => ({
        ...rec,
        id: `rec_${Date.now()}_${index}`
      }));
      
      setRecommendations(recommendationsWithIds);
      
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      // Fallback recommendations
      setRecommendations([
        {
          id: 'fallback_1',
          type: 'resource',
          title: `${chapter.title} Documentation`,
          description: `Official documentation and guides for ${chapter.title}`,
          relevance: 90,
          difficulty: difficulty as any,
          estimatedTime: '1-2 hours',
          tags: ['documentation', 'official'],
          rating: 4.5,
          reviews: 500,
          provider: 'Official Docs',
          isFree: true,
          reasoning: 'Essential reference material for the topic'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource': return BookOpen;
      case 'practice': return Target;
      case 'concept': return Lightbulb;
      case 'tool': return Settings;
      case 'community': return Users;
      case 'project': return Code;
      default: return Star;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resource': return 'from-blue-500 to-cyan-500';
      case 'practice': return 'from-green-500 to-emerald-500';
      case 'concept': return 'from-yellow-500 to-orange-500';
      case 'tool': return 'from-purple-500 to-pink-500';
      case 'community': return 'from-indigo-500 to-blue-500';
      case 'project': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'intermediate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'advanced': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const handleLike = (recommendationId: string) => {
    setLikedRecommendations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recommendationId)) {
        newSet.delete(recommendationId);
      } else {
        newSet.add(recommendationId);
      }
      return newSet;
    });
  };

  const filteredRecommendations = recommendations
    .filter(rec => selectedType === 'all' || rec.type === selectedType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'time': return a.estimatedTime.localeCompare(b.estimatedTime);
        default: return b.relevance - a.relevance;
      }
    });

  const recommendationTypes = [
    { id: 'all', name: 'All', count: recommendations.length },
    { id: 'resource', name: 'Resources', count: recommendations.filter(r => r.type === 'resource').length },
    { id: 'practice', name: 'Practice', count: recommendations.filter(r => r.type === 'practice').length },
    { id: 'concept', name: 'Concepts', count: recommendations.filter(r => r.type === 'concept').length },
    { id: 'tool', name: 'Tools', count: recommendations.filter(r => r.type === 'tool').length },
    { id: 'community', name: 'Community', count: recommendations.filter(r => r.type === 'community').length },
    { id: 'project', name: 'Projects', count: recommendations.filter(r => r.type === 'project').length }
  ];

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Personalized Recommendations
            </h3>
            <p className="text-violet-500 font-medium">AI-curated learning resources</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Learning Profile */}
      {showProfile && (
        <div className={`border rounded-2xl p-6 mb-8 transition-colors ${
          theme === 'dark' ? 'border-white/10 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className={`text-lg font-bold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Learning Profile</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Learning Style
              </label>
              <select
                value={learningProfile.learningStyle}
                onChange={(e) => setLearningProfile(prev => ({ ...prev, learningStyle: e.target.value }))}
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
                value={learningProfile.timeAvailable}
                onChange={(e) => setLearningProfile(prev => ({ ...prev, timeAvailable: e.target.value }))}
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
          </div>

          <div className="mt-4">
            <button
              onClick={generateRecommendations}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all"
            >
              Update Recommendations
            </button>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          {recommendationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                selectedType === type.id
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                  : theme === 'dark'
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{type.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedType === type.id
                  ? 'bg-white/20'
                  : theme === 'dark'
                    ? 'bg-slate-600'
                    : 'bg-gray-200'
              }`}>
                {type.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <span className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 border-white/10 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="time">Time Required</option>
          </select>
        </div>
      </div>

      {/* Recommendations Grid */}
      {isGenerating ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-violet-500/30 rounded-full animate-spin mx-auto mb-4">
            <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"></div>
          </div>
          <p className={`text-lg transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            AI is generating personalized recommendations...
          </p>
        </div>
      ) : filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecommendations.map((recommendation) => {
            const TypeIcon = getTypeIcon(recommendation.type);
            const isLiked = likedRecommendations.has(recommendation.id);
            
            return (
              <div
                key={recommendation.id}
                className={`border rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' 
                    ? 'border-white/10 bg-slate-700/30 hover:border-violet-500/30' 
                    : 'border-gray-200 bg-gray-50 hover:border-violet-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getTypeColor(recommendation.type)} flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className={`font-bold text-lg leading-tight transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {recommendation.title}
                      </h5>
                      <button
                        onClick={() => handleLike(recommendation.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isLiked
                            ? 'text-red-500 bg-red-500/10'
                            : theme === 'dark'
                              ? 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                              : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <p className={`text-sm mb-4 leading-relaxed transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {recommendation.description}
                    </p>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(recommendation.difficulty)}`}>
                        {recommendation.difficulty}
                      </span>
                      <span className={`text-xs transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {recommendation.estimatedTime}
                      </span>
                      {recommendation.isFree && (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-500 border border-green-500/20">
                          Free
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(recommendation.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {recommendation.rating} ({recommendation.reviews} reviews)
                        </span>
                      </div>
                      
                      <div className="text-violet-500 font-bold text-sm">
                        {recommendation.relevance}% match
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recommendation.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            theme === 'dark' 
                              ? 'bg-slate-600 text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {recommendation.tags.length > 3 && (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          theme === 'dark' 
                            ? 'bg-slate-600 text-gray-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          +{recommendation.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className={`p-3 rounded-lg border-l-4 border-violet-500 mb-4 transition-colors ${
                      theme === 'dark' ? 'bg-violet-500/10' : 'bg-violet-50'
                    }`}>
                      <p className={`text-sm transition-colors ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <strong>Why recommended:</strong> {recommendation.reasoning}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        by {recommendation.provider}
                      </span>
                      
                      {recommendation.url && (
                        <a
                          href={recommendation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium"
                        >
                          <span>View Resource</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Star className={`w-24 h-24 mx-auto mb-8 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-3xl font-bold mb-4 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            No Recommendations Found
          </h3>
          <p className={`text-xl mb-8 transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Try adjusting your filters or update your learning profile
          </p>
          <button
            onClick={generateRecommendations}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-12 py-4 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-bold text-lg"
          >
            Generate Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;