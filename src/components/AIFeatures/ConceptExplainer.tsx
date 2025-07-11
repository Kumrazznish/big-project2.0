import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { Lightbulb, Search, Loader, BookOpen, Target, Brain, Zap, ArrowRight, CheckCircle } from 'lucide-react';

interface ConceptExplainerProps {
  chapter: any;
  subject: string;
  difficulty: string;
}

const ConceptExplainer: React.FC<ConceptExplainerProps> = ({ chapter, subject, difficulty }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [explanation, setExplanation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const explainConcept = async (concept: string) => {
    if (!concept.trim()) return;

    setIsLoading(true);
    try {
      const prompt = `Explain the concept "${concept}" in the context of ${chapter.title} (${subject}) for ${difficulty} level learners.

Provide a comprehensive explanation with:

1. **Simple Definition**: Clear, concise explanation
2. **Why It Matters**: Importance and relevance
3. **How It Works**: Step-by-step breakdown
4. **Real-World Example**: Practical application
5. **Common Misconceptions**: What students often get wrong
6. **Related Concepts**: Connected ideas to explore
7. **Practice Tip**: How to master this concept

Format as JSON:
{
  "concept": "${concept}",
  "definition": "Clear definition here",
  "importance": "Why this matters",
  "howItWorks": "Step-by-step explanation",
  "example": "Real-world example",
  "misconceptions": ["Common mistake 1", "Common mistake 2"],
  "relatedConcepts": ["Related concept 1", "Related concept 2"],
  "practiceTip": "How to practice and master this"
}`;

      const response = await geminiService.makeRequest(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedExplanation = JSON.parse(cleanedResponse);
      
      setExplanation(parsedExplanation);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [concept, ...prev.filter(item => item !== concept)].slice(0, 5);
        return updated;
      });
      
    } catch (error) {
      console.error('Failed to explain concept:', error);
      setExplanation({
        concept,
        definition: 'Sorry, I encountered an error while explaining this concept. Please try again.',
        importance: '',
        howItWorks: '',
        example: '',
        misconceptions: [],
        relatedConcepts: [],
        practiceTip: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    explainConcept(searchTerm);
  };

  const handleRecentSearch = (term: string) => {
    setSearchTerm(term);
    explainConcept(term);
  };

  const suggestedConcepts = [
    'Key concepts',
    'Main principles',
    'Best practices',
    'Common patterns',
    'Implementation details'
  ];

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center mb-8">
        <Lightbulb className="w-7 h-7 mr-3 text-yellow-500" />
        <h3 className={`text-2xl font-bold transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          AI Concept Explainer
        </h3>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="flex space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter any concept you want explained..."
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-white/10 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchTerm.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Explain'}
          </button>
        </div>

        {/* Suggested Concepts */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Quick suggestions:</span>
          {suggestedConcepts.map((concept, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchTerm(concept);
                explainConcept(concept);
              }}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {concept}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className={`text-sm transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Recent:</span>
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearch(term)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  theme === 'dark' 
                    ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Explanation */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className={`text-lg transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            AI is analyzing and explaining the concept...
          </p>
        </div>
      )}

      {explanation && !isLoading && (
        <div className="space-y-6">
          {/* Header */}
          <div className={`text-center p-6 rounded-2xl transition-colors ${
            theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'
          }`}>
            <h4 className={`text-2xl font-bold mb-2 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {explanation.concept}
            </h4>
            <p className="text-yellow-600 font-medium">Concept Explanation</p>
          </div>

          {/* Definition */}
          <div className={`p-6 rounded-2xl border-l-4 border-blue-500 transition-colors ${
            theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h5 className={`font-bold transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Definition</h5>
            </div>
            <p className={`transition-colors ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>{explanation.definition}</p>
          </div>

          {/* Importance */}
          {explanation.importance && (
            <div className={`p-6 rounded-2xl border-l-4 border-green-500 transition-colors ${
              theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-green-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Why It Matters</h5>
              </div>
              <p className={`transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>{explanation.importance}</p>
            </div>
          )}

          {/* How It Works */}
          {explanation.howItWorks && (
            <div className={`p-6 rounded-2xl border-l-4 border-purple-500 transition-colors ${
              theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-5 h-5 text-purple-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>How It Works</h5>
              </div>
              <p className={`transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>{explanation.howItWorks}</p>
            </div>
          )}

          {/* Example */}
          {explanation.example && (
            <div className={`p-6 rounded-2xl border-l-4 border-orange-500 transition-colors ${
              theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-orange-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Real-World Example</h5>
              </div>
              <p className={`transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>{explanation.example}</p>
            </div>
          )}

          {/* Misconceptions */}
          {explanation.misconceptions && explanation.misconceptions.length > 0 && (
            <div className={`p-6 rounded-2xl border-l-4 border-red-500 transition-colors ${
              theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'
            }`}>
              <h5 className={`font-bold mb-3 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Common Misconceptions</h5>
              <ul className="space-y-2">
                {explanation.misconceptions.map((misconception: string, index: number) => (
                  <li key={index} className={`flex items-start space-x-2 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span className="text-red-500 mt-1">⚠️</span>
                    <span>{misconception}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Concepts */}
          {explanation.relatedConcepts && explanation.relatedConcepts.length > 0 && (
            <div className={`p-6 rounded-2xl transition-colors ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <h5 className={`font-bold mb-3 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Related Concepts to Explore</h5>
              <div className="flex flex-wrap gap-2">
                {explanation.relatedConcepts.map((concept: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(concept);
                      explainConcept(concept);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{concept}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Practice Tip */}
          {explanation.practiceTip && (
            <div className={`p-6 rounded-2xl border-l-4 border-cyan-500 transition-colors ${
              theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-cyan-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Practice Tip</h5>
              </div>
              <p className={`transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>{explanation.practiceTip}</p>
            </div>
          )}
        </div>
      )}

      {!explanation && !isLoading && (
        <div className="text-center py-12">
          <Lightbulb className={`w-16 h-16 mx-auto mb-4 transition-colors ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`text-lg transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Enter any concept you'd like me to explain in detail!
          </p>
        </div>
      )}
    </div>
  );
};

export default ConceptExplainer;