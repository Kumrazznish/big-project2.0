import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useTheme } from '../contexts/ThemeContext';
import { Brain, History, BookOpen, User, Menu, X, Sparkles, BarChart3, Settings, Bell, Sun, Moon } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BookOpen, description: 'Your learning hub' },
    { id: 'history', name: 'Progress', icon: History, description: 'Track your journey' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Performance insights' },
  ];

  return (
    <nav className={`backdrop-blur-xl border-b sticky top-0 z-50 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900/95 border-slate-700/50' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
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
              <span className={`text-xl font-bold transition-colors ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                  : 'text-gray-900'
              }`}>
                LearnAI Pro
              </span>
              <div className="text-xs text-cyan-500 font-medium">Next-Gen Learning</div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    currentView === item.id
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400'
                        : 'bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200 text-cyan-600'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className="group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                  
                  {currentView === item.id && (
                    <div className={`absolute inset-0 rounded-xl ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10' 
                        : 'bg-gradient-to-r from-cyan-500/5 to-purple-500/5'
                    }`}></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
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

            {/* Notifications */}
            <button className={`relative p-2 rounded-xl transition-all ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-slate-800/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}>
              <Bell size={20} />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>

            {/* Settings */}
            <button className={`p-2 rounded-xl transition-all ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-slate-800/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}>
              <Settings size={20} />
            </button>

            {/* User Info */}
            <div className={`hidden md:flex items-center space-x-3 rounded-xl px-4 py-2 ${
              theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
            }`}>
              <div className="text-right">
                <div className={`text-sm font-medium transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.firstName || 'User'}
                </div>
                <div className="text-xs text-cyan-500">Pro Member</div>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl border-2 border-cyan-500/30"
                  }
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-all ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-slate-800/50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t py-4 transition-colors ${
            theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
          }`}>
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      currentView === item.id
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400'
                          : 'bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200 text-cyan-600'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Mobile User Info */}
            <div className={`mt-4 pt-4 border-t flex items-center space-x-3 transition-colors ${
              theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl border-2 border-cyan-500/30"
                  }
                }}
              />
              <div>
                <div className={`text-sm font-medium transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.firstName || 'User'}
                </div>
                <div className="text-xs text-cyan-500">Pro Member</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;