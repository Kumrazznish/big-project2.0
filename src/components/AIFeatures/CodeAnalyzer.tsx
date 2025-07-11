import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { geminiService } from '../../services/geminiService';
import { Code, Play, CheckCircle, AlertTriangle, Lightbulb, Copy, Check, Zap, Target, Brain } from 'lucide-react';

interface CodeAnalyzerProps {
  chapter: any;
  subject: string;
}

const CodeAnalyzer: React.FC<CodeAnalyzerProps> = ({ chapter, subject }) => {
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this code in the context of ${chapter.title} (${subject}):

\`\`\`
${code}
\`\`\`

Provide a comprehensive analysis as JSON:

{
  "codeQuality": {
    "score": 85,
    "level": "Good"
  },
  "strengths": [
    "Clear variable naming",
    "Good structure"
  ],
  "improvements": [
    {
      "issue": "Missing error handling",
      "severity": "medium",
      "suggestion": "Add try-catch blocks",
      "improvedCode": "// Improved code here"
    }
  ],
  "bestPractices": [
    "Follow consistent naming conventions",
    "Add comments for complex logic"
  ],
  "securityIssues": [
    {
      "issue": "Potential vulnerability",
      "severity": "high",
      "fix": "How to fix it"
    }
  ],
  "performance": {
    "score": 75,
    "suggestions": [
      "Optimize loops",
      "Use efficient data structures"
    ]
  },
  "explanation": "What this code does and how it works",
  "relatedConcepts": ["Concept 1", "Concept 2"]
}

Provide practical, actionable feedback.`;

      const response = await geminiService.makeRequest(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedAnalysis = JSON.parse(cleanedResponse);
      
      setAnalysis(parsedAnalysis);
    } catch (error) {
      console.error('Failed to analyze code:', error);
      setAnalysis({
        codeQuality: { score: 0, level: 'Error' },
        strengths: [],
        improvements: [],
        bestPractices: [],
        securityIssues: [],
        performance: { score: 0, suggestions: [] },
        explanation: 'Failed to analyze code. Please try again.',
        relatedConcepts: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-800/50 border-white/10' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center mb-8">
        <Code className="w-7 h-7 mr-3 text-green-500" />
        <h3 className={`text-2xl font-bold transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          AI Code Analyzer
        </h3>
      </div>

      {/* Code Input */}
      <div className="mb-8">
        <label className={`block text-sm font-medium mb-3 transition-colors ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Paste your code here for analysis:
        </label>
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// Paste your ${subject} code here...\n// The AI will analyze it for quality, security, and performance`}
            rows={12}
            className={`w-full p-4 rounded-xl border font-mono text-sm transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-900 border-white/10 text-green-400 placeholder-gray-500' 
                : 'bg-gray-900 border-gray-200 text-green-400 placeholder-gray-400'
            }`}
          />
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className={`text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {code.length} characters
          </span>
          <button
            onClick={analyzeCode}
            disabled={!code.trim() || isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Code'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {isAnalyzing && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-green-500/30 rounded-full animate-spin mx-auto mb-4">
            <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
          </div>
          <p className={`text-lg transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            AI is analyzing your code for quality, security, and performance...
          </p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-8">
          {/* Code Quality Score */}
          <div className={`p-6 rounded-2xl text-center transition-colors ${
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
          }`}>
            <h4 className={`text-xl font-bold mb-4 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Code Quality Assessment</h4>
            <div className="flex items-center justify-center space-x-8">
              <div>
                <div className={`text-4xl font-bold ${getScoreColor(analysis.codeQuality.score)}`}>
                  {analysis.codeQuality.score}/100
                </div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Overall Score</div>
              </div>
              <div>
                <div className={`text-2xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {analysis.codeQuality.level}
                </div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Quality Level</div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          {analysis.explanation && (
            <div className={`p-6 rounded-2xl border-l-4 border-blue-500 transition-colors ${
              theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-5 h-5 text-blue-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Code Explanation</h5>
              </div>
              <p className={`transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>{analysis.explanation}</p>
            </div>
          )}

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className={`p-6 rounded-2xl border-l-4 border-green-500 transition-colors ${
              theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Strengths</h5>
              </div>
              <ul className="space-y-2">
                {analysis.strengths.map((strength: string, index: number) => (
                  <li key={index} className={`flex items-start space-x-2 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {analysis.improvements && analysis.improvements.length > 0 && (
            <div className={`p-6 rounded-2xl border-l-4 border-yellow-500 transition-colors ${
              theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Suggested Improvements</h5>
              </div>
              <div className="space-y-4">
                {analysis.improvements.map((improvement: any, index: number) => (
                  <div key={index} className={`border rounded-xl p-4 transition-colors ${
                    theme === 'dark' ? 'border-white/10 bg-slate-700/30' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h6 className={`font-medium transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{improvement.issue}</h6>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getSeverityColor(improvement.severity)}`}>
                        {improvement.severity}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{improvement.suggestion}</p>
                    {improvement.improvedCode && (
                      <div className="relative">
                        <pre className={`p-3 rounded-lg text-sm overflow-x-auto transition-colors ${
                          theme === 'dark' ? 'bg-slate-900 text-green-400' : 'bg-gray-900 text-green-400'
                        }`}>
                          <code>{improvement.improvedCode}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(improvement.improvedCode, `improved-${index}`)}
                          className={`absolute top-2 right-2 p-1 rounded transition-colors ${
                            theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-700'
                          }`}
                        >
                          {copiedCode === `improved-${index}` ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Issues */}
          {analysis.securityIssues && analysis.securityIssues.length > 0 && (
            <div className={`p-6 rounded-2xl border-l-4 border-red-500 transition-colors ${
              theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Security Issues</h5>
              </div>
              <div className="space-y-3">
                {analysis.securityIssues.map((issue: any, index: number) => (
                  <div key={index} className={`border rounded-xl p-4 transition-colors ${
                    theme === 'dark' ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h6 className={`font-medium transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{issue.issue}</h6>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className={`text-sm transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>{issue.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance */}
          {analysis.performance && (
            <div className={`p-6 rounded-2xl border-l-4 border-purple-500 transition-colors ${
              theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-purple-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Performance Analysis</h5>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.performance.score)}`}>
                  {analysis.performance.score}/100
                </div>
                <div className={`text-sm transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Performance Score</div>
              </div>
              {analysis.performance.suggestions && analysis.performance.suggestions.length > 0 && (
                <ul className="space-y-2">
                  {analysis.performance.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className={`flex items-start space-x-2 transition-colors ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Best Practices */}
          {analysis.bestPractices && analysis.bestPractices.length > 0 && (
            <div className={`p-6 rounded-2xl border-l-4 border-cyan-500 transition-colors ${
              theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-cyan-500" />
                <h5 className={`font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Best Practices</h5>
              </div>
              <ul className="space-y-2">
                {analysis.bestPractices.map((practice: string, index: number) => (
                  <li key={index} className={`flex items-start space-x-2 transition-colors ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Concepts */}
          {analysis.relatedConcepts && analysis.relatedConcepts.length > 0 && (
            <div className={`p-6 rounded-2xl transition-colors ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <h5 className={`font-bold mb-3 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Related Concepts</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.relatedConcepts.map((concept: string, index: number) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark' 
                        ? 'bg-slate-600 text-gray-300' 
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div className="text-center py-12">
          <Code className={`w-16 h-16 mx-auto mb-4 transition-colors ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`text-lg transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Paste your code above and click "Analyze Code" to get detailed feedback!
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeAnalyzer;