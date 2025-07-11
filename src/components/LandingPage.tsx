import React, { useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Brain, 
  Zap, 
  Target, 
  Users, 
  BookOpen, 
  Award, 
  ArrowRight, 
  CheckCircle,
  Star,
  Play,
  TrendingUp,
  Clock,
  Sparkles,
  Rocket,
  Shield,
  Globe,
  ChevronRight,
  BarChart3,
  Lightbulb,
  Code,
  Palette,
  Calculator,
  Database,
  Smartphone,
  Camera,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Personalization',
      description: 'Advanced machine learning algorithms create truly personalized learning experiences that adapt to your unique style, pace, and goals.',
      highlight: 'Smart Adaptation',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Rocket,
      title: 'Accelerated Learning Paths',
      description: 'Our proprietary methodology reduces learning time by up to 60% through optimized content sequencing and spaced repetition.',
      highlight: '60% Faster',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Precision Skill Mapping',
      description: 'Detailed skill assessments and gap analysis ensure you focus on exactly what you need to learn for maximum impact.',
      highlight: 'Laser Focus',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Comprehensive learning analytics provide insights into your progress, strengths, and areas for improvement.',
      highlight: 'Data-Driven',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'Industry Certification',
      description: 'Earn recognized certifications and badges that validate your skills to employers and peers.',
      highlight: 'Verified Skills',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Connect with learners worldwide, participate in challenges, and learn from diverse perspectives.',
      highlight: 'Connected Learning',
      gradient: 'from-teal-500 to-cyan-500'
    }
  ];

  const subjects = [
    { icon: Code, name: 'Programming', color: 'from-blue-500 to-cyan-500', students: '125K+' },
    { icon: Palette, name: 'Design', color: 'from-purple-500 to-pink-500', students: '89K+' },
    { icon: Database, name: 'Data Science', color: 'from-green-500 to-emerald-500', students: '156K+' },
    { icon: Smartphone, name: 'Mobile Dev', color: 'from-orange-500 to-red-500', students: '78K+' },
    { icon: Calculator, name: 'Mathematics', color: 'from-indigo-500 to-purple-500', students: '92K+' },
    { icon: Camera, name: 'Digital Media', color: 'from-pink-500 to-rose-500', students: '64K+' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Software Engineer at Google',
      content: 'The AI-powered roadmaps are incredibly precise. I went from beginner to landing my dream job at Google in just 8 months.',
      rating: 5,
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      achievement: 'Career Transition Success'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Lead Data Scientist at Netflix',
      content: 'The personalized learning approach helped me master machine learning concepts 3x faster than traditional methods.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      achievement: 'Skill Mastery'
    },
    {
      name: 'Emily Johnson',
      role: 'Principal UX Designer at Airbnb',
      content: 'The real-time feedback and adaptive content made learning design principles intuitive and engaging.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      achievement: 'Design Excellence'
    }
  ];

  const stats = [
    { number: '500K+', label: 'Active Learners', icon: Users },
    { number: '2,500+', label: 'Learning Paths', icon: BookOpen },
    { number: '98.5%', label: 'Success Rate', icon: TrendingUp },
    { number: '24/7', label: 'AI Support', icon: Brain }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Navigation */}
      <nav className={`backdrop-blur-xl border-b sticky top-0 z-50 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-black/20 border-white/10' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <span className={`text-2xl font-bold transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                    : 'text-gray-900'
                }`}>
                  LearnAI Pro
                </span>
                <div className="text-xs text-cyan-500 font-medium">Next-Gen Learning</div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`transition-colors font-medium ${
                theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Features</a>
              <a href="#subjects" className={`transition-colors font-medium ${
                theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Subjects</a>
              <a href="#testimonials" className={`transition-colors font-medium ${
                theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Success Stories</a>
              <a href="#pricing" className={`transition-colors font-medium ${
                theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Pricing</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <SignInButton mode="modal">
                <button className={`font-medium transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Sign In
                </button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                  Start Free Trial
                </button>
              </SignUpButton>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden border-t py-4 transition-colors ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div className="space-y-2">
                <a href="#features" className={`block px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>Features</a>
                <a href="#subjects" className={`block px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>Subjects</a>
                <a href="#testimonials" className={`block px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>Success Stories</a>
                <a href="#pricing" className={`block px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>Pricing</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-500/10'
          }`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/10'
          }`}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className={`inline-flex items-center space-x-2 border rounded-full px-4 py-2 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20' 
                  : 'bg-gradient-to-r from-cyan-50 to-purple-50 border-cyan-200'
              }`}>
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span className="text-cyan-500 text-sm font-medium">AI-Powered Learning Revolution</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className={`transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent' 
                      : 'text-gray-900'
                  }`}>
                    Master Skills
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    10x Faster
                  </span>
                </h1>
                <p className={`text-xl leading-relaxed max-w-2xl transition-colors ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Revolutionary AI technology creates hyper-personalized learning experiences that adapt in real-time. 
                  Join 500,000+ learners who've accelerated their careers with our intelligent platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <SignUpButton mode="modal">
                  <button className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 flex items-center justify-center">
                    Start Learning Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignUpButton>
                <button className={`group border-2 px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-white/5' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}>
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 border-3 border-white dark:border-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className={`font-medium transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>4.9/5 from 50,000+ reviews</p>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Interactive Dashboard Preview */}
              <div className={`relative backdrop-blur-xl border rounded-3xl p-8 shadow-2xl transition-colors ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-semibold transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>Learning Dashboard</h3>
                        <p className={`text-sm transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Real-time Progress</p>
                      </div>
                    </div>
                    <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                      On Track
                    </div>
                  </div>
                  
                  {/* Progress Rings */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'JavaScript', progress: 85, color: 'from-yellow-400 to-orange-500' },
                      { label: 'React', progress: 72, color: 'from-blue-400 to-cyan-500' },
                      { label: 'Node.js', progress: 58, color: 'from-green-400 to-emerald-500' }
                    ].map((skill, index) => (
                      <div key={skill.label} className="text-center">
                        <div className="relative w-16 h-16 mx-auto mb-2">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className={theme === 'dark' ? 'text-gray-700' : 'text-gray-200'}
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - skill.progress / 100)}`}
                              className="transition-all duration-1000"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-sm font-bold transition-colors ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{skill.progress}%</span>
                          </div>
                        </div>
                        <p className={`text-xs font-medium transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{skill.label}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* AI Recommendations */}
                  <div className={`border rounded-2xl p-4 transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/20' 
                      : 'bg-gradient-to-r from-purple-50 to-cyan-50 border-purple-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-purple-500" />
                      <span className="text-purple-500 text-sm font-medium">AI Recommendation</span>
                    </div>
                    <p className={`text-sm transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Focus on async/await patterns to boost your JavaScript mastery by 23%
                    </p>
                    <button className="mt-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform">
                      Start Learning
                    </button>
                  </div>
                  
                  {/* Achievement */}
                  <div className={`flex items-center space-x-3 border rounded-xl p-3 transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  }`}>
                    <Award className="w-8 h-8 text-green-500" />
                    <div>
                      <p className={`font-medium text-sm transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>New Achievement!</p>
                      <p className="text-green-500 text-xs">React Hooks Master</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-3 shadow-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-3 shadow-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 backdrop-blur-xl border-y transition-colors ${
        theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className={`text-4xl lg:text-5xl font-bold mb-2 transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                      : 'text-gray-900'
                  }`}>
                    {stat.number}
                  </div>
                  <div className={`font-medium transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className={`inline-flex items-center space-x-2 border rounded-full px-4 py-2 mb-6 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20' 
                : 'bg-gradient-to-r from-cyan-50 to-purple-50 border-cyan-200'
            }`}>
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-cyan-500 text-sm font-medium">Advanced Features</span>
            </div>
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-colors ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                : 'text-gray-900'
            }`}>
              The Future of Learning
            </h2>
            <p className={`text-xl max-w-3xl mx-auto transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Experience cutting-edge AI technology that revolutionizes how you learn, 
              making education more efficient, personalized, and engaging than ever before.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className={`group relative backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 hover:scale-105 cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 hover:border-cyan-500/30' 
                      : 'bg-white/80 border-gray-200 hover:border-cyan-300 hover:shadow-xl'
                  } ${
                    activeFeature === index 
                      ? theme === 'dark' 
                        ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20' 
                        : 'border-cyan-400 shadow-2xl shadow-cyan-500/20'
                      : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className={`text-xl font-bold transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{feature.title}</h3>
                        <span className={`bg-gradient-to-r ${feature.gradient} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                          {feature.highlight}
                        </span>
                      </div>
                      <p className={`leading-relaxed transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{feature.description}</p>
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-cyan-500/5 to-purple-500/5' 
                      : 'bg-gradient-to-r from-cyan-500/5 to-purple-500/5'
                  }`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className={`py-32 backdrop-blur-xl transition-colors ${
        theme === 'dark' ? 'bg-black/20' : 'bg-white/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-colors ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                : 'text-gray-900'
            }`}>
              Master Any Subject
            </h2>
            <p className={`text-xl max-w-3xl mx-auto transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              From programming to design, our AI adapts to any domain with expert-level curriculum and real-world projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, index) => {
              const Icon = subject.icon;
              return (
                <div key={index} className={`group relative backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 hover:scale-105 cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 hover:border-cyan-500/30' 
                    : 'bg-white/80 border-gray-200 hover:border-cyan-300 hover:shadow-xl'
                }`}>
                  <div className="text-center space-y-6">
                    <div className={`w-20 h-20 bg-gradient-to-r ${subject.color} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-2xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{subject.name}</h3>
                      <p className="text-cyan-500 font-medium">{subject.students} students</p>
                    </div>
                    <button className={`w-full border py-3 rounded-xl transition-all duration-300 font-medium group-hover:scale-105 ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30' 
                        : 'bg-gradient-to-r from-cyan-50 to-purple-50 border-cyan-200 text-cyan-600 hover:from-cyan-100 hover:to-purple-100'
                    }`}>
                      Explore Paths
                      <ChevronRight className="inline-block ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-colors ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                : 'text-gray-900'
            }`}>
              Success Stories
            </h2>
            <p className={`text-xl transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Real people, real results, real career transformations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 hover:border-cyan-500/30' 
                  : 'bg-white/80 border-gray-200 hover:border-cyan-300 hover:shadow-xl'
              }`}>
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className={`mb-8 italic leading-relaxed transition-colors ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className={`font-semibold transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{testimonial.name}</div>
                    <div className={`text-sm transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{testimonial.role}</div>
                    <div className="text-cyan-500 text-xs font-medium mt-1">{testimonial.achievement}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`relative backdrop-blur-xl border rounded-3xl p-16 overflow-hidden transition-colors ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20' 
              : 'bg-gradient-to-r from-cyan-50 to-purple-50 border-cyan-200'
          }`}>
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-2xl ${
                theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-500/10'
              }`}></div>
              <div className={`absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full blur-2xl ${
                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/10'
              }`}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-colors ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                  : 'text-gray-900'
              }`}>
                Ready to Transform Your Future?
              </h2>
              <p className={`text-xl mb-10 max-w-2xl mx-auto transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Join the learning revolution. Start your personalized AI-powered journey today and unlock your potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-4 rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-cyan-500/25 hover:scale-105">
                    Start Free Trial
                  </button>
                </SignUpButton>
                <button className={`border-2 px-10 py-4 rounded-xl transition-all duration-300 font-semibold text-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-white/5' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}>
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`backdrop-blur-xl border-t py-16 transition-colors ${
        theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xl font-bold transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                    : 'text-gray-900'
                }`}>
                  LearnAI Pro
                </span>
              </div>
              <p className={`max-w-xs transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Revolutionizing education with AI-powered personalized learning experiences.
              </p>
            </div>
            
            <div>
              <h3 className={`font-semibold mb-4 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Platform</h3>
              <ul className={`space-y-2 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Features</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Pricing</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>API</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className={`font-semibold mb-4 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Support</h3>
              <ul className={`space-y-2 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Help Center</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Contact</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Community</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className={`font-semibold mb-4 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Company</h3>
              <ul className={`space-y-2 transition-colors ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>About</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Blog</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Careers</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center transition-colors ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}>
            <p className={`transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>&copy; 2025 LearnAI Pro. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className={`transition-colors ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Privacy</a>
              <a href="#" className={`transition-colors ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Terms</a>
              <a href="#" className={`transition-colors ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* SVG Gradients */}
      <svg className="hidden">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default LandingPage;