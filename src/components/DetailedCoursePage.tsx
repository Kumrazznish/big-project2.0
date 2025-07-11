import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import AIStudyAssistant from './AIFeatures/AIStudyAssistant';
import SmartNotes from './AIFeatures/SmartNotes';
import ConceptExplainer from './AIFeatures/ConceptExplainer';
import CodeAnalyzer from './AIFeatures/CodeAnalyzer';
import ProgressTracker from './AIFeatures/ProgressTracker';
import StudyPlanner from './AIFeatures/StudyPlanner';
import AITutor from './AIFeatures/AITutor';
import SmartQuizGenerator from './AIFeatures/SmartQuizGenerator';
import LearningPathOptimizer from './AIFeatures/LearningPathOptimizer';
import PersonalizedRecommendations from './AIFeatures/PersonalizedRecommendations';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Clock, 
  Play, 
  Award, 
  Code, 
  Lightbulb, 
  Target, 
  ExternalLink, 
  Download, 
  Video, 
  FileText, 
  Link, 
  ChevronRight,
  Copy,
  Check,
  Youtube,
  AlertCircle,
  Brain,
  Monitor,
  Layers,
  Database,
  Smartphone,
  Camera,
  Headphones,
  Wifi,
  Settings,
  Lock,
  Star,
  TrendingUp,
  Zap,
  Trophy,
  Timer,
  BarChart3,
  Sparkles,
  Menu,
  X,
  MessageCircle,
  PenTool,
  Search,
  BarChart,
  Calendar,
  Users,
  Globe,
  Shield,
  Rocket,
  Cpu,
  Palette,
  Calculator,
  Headphones as HeadphonesIcon,
  Mic,
  Volume2,
  Eye,
  MousePointer,
  Keyboard,
  Gamepad2,
  Smartphone as SmartphoneIcon,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Tv,
  Radio,
  Speaker,
  Headset,
  Webcam,
  Printer,
  Scanner,
  HardDrive,
  Usb,
  Bluetooth,
  Wifi as WifiIcon,
  Signal,
  Battery,
  Power,
  Plug,
  Zap as ZapIcon,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Flame,
  Snowflake,
  Umbrella,
  Rainbow,
  Sunrise,
  Sunset,
  Stars,
  CloudLightning,
  Tornado,
  Volcano,
  Mountain,
  Trees,
  Flower,
  Leaf,
  Seedling,
  Cactus,
  PalmTree,
  Pine,
  Mushroom,
  Bug,
  Butterfly,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Turtle,
  Elephant,
  Lion,
  Tiger,
  Bear,
  Wolf,
  Fox,
  Deer,
  Horse,
  Cow,
  Pig,
  Sheep,
  Chicken,
  Duck,
  Penguin,
  Owl,
  Eagle,
  Dove,
  Parrot,
  Flamingo,
  Swan,
  Peacock,
  Turkey,
  Rooster,
  Bee,
  Ant,
  Spider,
  Snail,
  Worm,
  Ladybug,
  Dragonfly,
  Grasshopper,
  Cricket,
  Scorpion,
  Crab,
  Lobster,
  Shrimp,
  Octopus,
  Squid,
  Jellyfish,
  Starfish,
  Seahorse,
  Whale,
  Dolphin,
  Shark,
  Stingray,
  Seal,
  Walrus,
  Otter,
  Beaver,
  Squirrel,
  Chipmunk,
  Hedgehog,
  Bat,
  Mouse,
  Rat,
  Hamster,
  GuineaPig,
  Ferret,
  Skunk,
  Raccoon,
  Opossum,
  Kangaroo,
  Koala,
  Panda,
  Sloth,
  Monkey,
  Gorilla,
  Orangutan,
  Chimpanzee,
  Lemur,
  Giraffe,
  Zebra,
  Rhinoceros,
  Hippopotamus,
  Crocodile,
  Alligator,
  Lizard,
  Iguana,
  Chameleon,
  Gecko,
  Snake,
  Cobra,
  Viper,
  Python,
  Boa,
  Turtle as TurtleIcon,
  Tortoise,
  Frog,
  Toad,
  Salamander,
  Newt,
  Axolotl,
  Tadpole,
  Egg,
  Nest,
  Feather,
  Paw,
  Hoof,
  Horn,
  Antler,
  Tail,
  Wing,
  Beak,
  Claw,
  Fang,
  Scale,
  Shell,
  Fin,
  Gill,
  Tentacle,
  Sucker,
  Spine,
  Quill,
  Mane,
  Fur,
  Hide,
  Skin,
  Bone,
  Skull,
  Skeleton,
  Fossil,
  Amber,
  Crystal,
  Diamond,
  Ruby,
  Emerald,
  Sapphire,
  Pearl,
  Gold,
  Silver,
  Copper,
  Bronze,
  Iron,
  Steel,
  Aluminum,
  Titanium,
  Platinum,
  Lead,
  Tin,
  Zinc,
  Nickel,
  Cobalt,
  Chromium,
  Manganese,
  Tungsten,
  Uranium,
  Plutonium,
  Radium,
  Helium,
  Neon,
  Argon,
  Krypton,
  Xenon,
  Radon,
  Hydrogen,
  Oxygen,
  Nitrogen,
  Carbon,
  Silicon,
  Phosphorus,
  Sulfur,
  Chlorine,
  Fluorine,
  Bromine,
  Iodine,
  Sodium,
  Potassium,
  Calcium,
  Magnesium,
  Lithium,
  Beryllium,
  Boron,
  Scandium,
  Vanadium,
  Molybdenum,
  Technetium,
  Ruthenium,
  Rhodium,
  Palladium,
  Cadmium,
  Indium,
  Antimony,
  Tellurium,
  Cesium,
  Barium,
  Lanthanum,
  Cerium,
  Praseodymium,
  Neodymium,
  Promethium,
  Samarium,
  Europium,
  Gadolinium,
  Terbium,
  Dysprosium,
  Holmium,
  Erbium,
  Thulium,
  Ytterbium,
  Lutetium,
  Hafnium,
  Tantalum,
  Rhenium,
  Osmium,
  Iridium,
  Mercury,
  Thallium,
  Bismuth,
  Polonium,
  Astatine,
  Francium,
  Actinium,
  Thorium,
  Protactinium,
  Neptunium,
  Americium,
  Curium,
  Berkelium,
  Californium,
  Einsteinium,
  Fermium,
  Mendelevium,
  Nobelium,
  Lawrencium,
  Rutherfordium,
  Dubnium,
  Seaborgium,
  Bohrium,
  Hassium,
  Meitnerium,
  Darmstadtium,
  Roentgenium,
  Copernicium,
  Nihonium,
  Flerovium,
  Moscovium,
  Livermorium,
  Tennessine,
  Oganesson
} from 'lucide-react';

interface DetailedCourse {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  chapters: {
    id: string;
    title: string;
    content: any;
    quiz: any;
    completed: boolean;
  }[];
  generatedAt: string;
}

interface DetailedCoursePageProps {
  detailedCourse: DetailedCourse;
  subject: string;
  difficulty: string;
  onBack: () => void;
  onChapterComplete: (chapterId: string) => void;
  onQuizStart: (chapter: any) => void;
}

const DetailedCoursePage: React.FC<DetailedCoursePageProps> = ({
  detailedCourse,
  subject,
  difficulty,
  onBack,
  onChapterComplete,
  onQuizStart
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<{ [key: string]: boolean }>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeAIFeature, setActiveAIFeature] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChapters, setFilteredChapters] = useState(detailedCourse.chapters);
  const [viewMode, setViewMode] = useState<'content' | 'ai-features'>('content');

  useEffect(() => {
    // Always select the first chapter when the detailed course loads
    if (detailedCourse.chapters.length > 0) {
      setSelectedChapter(detailedCourse.chapters[0]);
    }
  }, [detailedCourse, selectedChapter]);

  useEffect(() => {
    // Filter chapters based on search query
    const filtered = detailedCourse.chapters.filter(chapter =>
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.content?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChapters(filtered);
  }, [searchQuery, detailedCourse.chapters]);

  const handleChapterSelect = (chapter: any) => {
    setSelectedChapter(chapter);
    setActiveAIFeature(null);
    setViewMode('content');
  };

  const handleMarkComplete = async (chapterId: string) => {
    if (user) {
      try {
        const history = await userService.getUserHistory(user._id);
        const currentHistory = history.find(h => h.roadmapId === detailedCourse.roadmapId);
        
        if (currentHistory) {
          await userService.updateChapterProgress(
            user._id,
            currentHistory._id,
            chapterId,
            true
          );
          onChapterComplete(chapterId);
        }
      } catch (error) {
        console.error('Failed to update chapter progress:', error);
      }
    }
  };

  const copyToClipboard = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(title);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'documentation': return BookOpen;
      case 'tutorial': return Play;
      default: return Link;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getChapterIcon = (index: number) => {
    const icons = [BookOpen, Code, Lightbulb, Target, Brain, Monitor, Layers, Database, Wifi, Camera, Headphones, Settings, Lock, Trophy, BarChart3, Zap, Star, Award];
    return icons[index % icons.length];
  };

  const completedChapters = detailedCourse.chapters.filter(ch => ch.completed).length;
  const totalChapters = detailedCourse.chapters.length;
  const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

  const aiFeatures = [
    { id: 'notes', name: 'Smart Notes', icon: PenTool, description: 'AI-powered note taking', color: 'from-blue-500 to-cyan-500' },
    { id: 'explainer', name: 'Concept Explainer', icon: Lightbulb, description: 'Explain any concept', color: 'from-yellow-500 to-orange-500' },
    { id: 'code', name: 'Code Analyzer', icon: Code, description: 'Analyze and improve code', color: 'from-green-500 to-emerald-500' },
    { id: 'progress', name: 'Progress Tracker', icon: BarChart, description: 'Track your learning', color: 'from-purple-500 to-pink-500' },
    { id: 'planner', name: 'Study Planner', icon: Calendar, description: 'Plan your study sessions', color: 'from-indigo-500 to-purple-500' },
    { id: 'tutor', name: 'AI Tutor', icon: Brain, description: 'Personal AI tutor', color: 'from-pink-500 to-rose-500' },
    { id: 'quiz-gen', name: 'Quiz Generator', icon: Award, description: 'Generate custom quizzes', color: 'from-orange-500 to-red-500' },
    { id: 'optimizer', name: 'Path Optimizer', icon: Target, description: 'Optimize learning path', color: 'from-teal-500 to-cyan-500' },
    { id: 'recommendations', name: 'Recommendations', icon: Star, description: 'Personalized suggestions', color: 'from-violet-500 to-purple-500' }
  ];

  if (!selectedChapter) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className={`text-lg transition-colors ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Enhanced Sidebar */}
      <div className={`${sidebarOpen ? 'w-96' : 'w-16'} transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-slate-800/95 border-r border-white/10' 
          : 'bg-white/95 border-r border-gray-200'
      } backdrop-blur-xl flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className={`text-xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Course Navigation
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <div className={`text-sm transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {completedChapters}/{totalChapters} completed
                  </div>
                  <div className="text-cyan-500 font-medium">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
              }`}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {sidebarOpen && (
            <>
              <div className={`w-full rounded-full h-2 mt-4 ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-colors ${
                    theme === 'dark' 
                      ? 'bg-slate-700 border-white/10 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </>
          )}
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredChapters.map((chapter, index) => {
            const ChapterIcon = getChapterIcon(index);
            const isSelected = selectedChapter?.id === chapter.id;
            
            return (
              <button
                key={chapter.id}
                onClick={() => handleChapterSelect(chapter)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                  isSelected
                    ? theme === 'dark'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                      : 'bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200'
                    : theme === 'dark'
                      ? 'hover:bg-slate-700/50'
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    chapter.completed 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    {chapter.completed ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <ChapterIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  {sidebarOpen && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold text-sm truncate transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {chapter.title}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {index + 1}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed transition-colors ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {chapter.content?.description || 'Chapter content'}
                      </p>
                      {chapter.completed && (
                        <div className="flex items-center space-x-1 mt-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-500 font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* AI Features */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-bold transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                AI Learning Tools
              </h3>
              <button
                onClick={() => setViewMode(viewMode === 'content' ? 'ai-features' : 'content')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'ai-features'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : theme === 'dark'
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {viewMode === 'content' ? 'Show AI' : 'Show Content'}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {aiFeatures.slice(0, 6).map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveAIFeature(activeAIFeature === feature.id ? null : feature.id);
                      setViewMode('ai-features');
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      activeAIFeature === feature.id
                        ? `bg-gradient-to-r ${feature.color} text-white`
                        : theme === 'dark'
                          ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-xs font-medium">{feature.name}</div>
                      <div className="text-xs opacity-75">{feature.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className={`backdrop-blur-xl border-b p-6 transition-colors ${
          theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-slate-800/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back to Roadmap</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <h1 className={`text-2xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedChapter.title}
                </h1>
                <p className={`transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {subject} • {difficulty} Level
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className={`flex items-center rounded-lg p-1 ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setViewMode('content')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'content'
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-600 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setViewMode('ai-features')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'ai-features'
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-600 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  AI Tools
                </button>
              </div>

              {!selectedChapter.completed && (
                <button
                  onClick={() => handleMarkComplete(selectedChapter.id)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark Complete</span>
                </button>
              )}
              {selectedChapter.quiz && (
                <button
                  onClick={() => onQuizStart(selectedChapter)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center space-x-2"
                >
                  <Award className="w-5 h-5" />
                  <span>Take Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'ai-features' ? (
            <div className="p-8">
              {activeAIFeature === 'notes' && (
                <SmartNotes chapter={selectedChapter} subject={subject} />
              )}
              {activeAIFeature === 'explainer' && (
                <ConceptExplainer chapter={selectedChapter} subject={subject} difficulty={difficulty} />
              )}
              {activeAIFeature === 'code' && (
                <CodeAnalyzer chapter={selectedChapter} subject={subject} />
              )}
              {activeAIFeature === 'progress' && (
                <ProgressTracker chapter={selectedChapter} subject={subject} />
              )}
              {activeAIFeature === 'planner' && (
                <StudyPlanner chapter={selectedChapter} subject={subject} difficulty={difficulty} />
              )}
              {activeAIFeature === 'tutor' && (
                <AITutor chapter={selectedChapter} subject={subject} difficulty={difficulty} />
              )}
              {activeAIFeature === 'quiz-gen' && (
                <SmartQuizGenerator chapter={selectedChapter} subject={subject} difficulty={difficulty} />
              )}
              {activeAIFeature === 'optimizer' && (
                <LearningPathOptimizer chapter={selectedChapter} subject={subject} difficulty={difficulty} />
              )}
              {activeAIFeature === 'recommendations' && (
                <PersonalizedRecommendations chapter={selectedChapter} subject={subject} difficulty={difficulty} />
              )}
              
              {!activeAIFeature && (
                <div className="text-center py-16">
                  <Brain className={`w-24 h-24 mx-auto mb-8 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <h3 className={`text-3xl font-bold mb-4 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    AI Learning Tools
                  </h3>
                  <p className={`text-xl mb-8 transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Select an AI tool from the sidebar to enhance your learning experience
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {aiFeatures.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <button
                          key={feature.id}
                          onClick={() => setActiveAIFeature(feature.id)}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                            theme === 'dark'
                              ? 'border-white/10 bg-slate-800/50 hover:border-cyan-500/30'
                              : 'border-gray-200 bg-white/80 hover:border-cyan-300 hover:shadow-xl'
                          }`}
                        >
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h4 className={`text-lg font-bold mb-2 transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {feature.name}
                          </h4>
                          <p className={`text-sm transition-colors ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {feature.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 space-y-12">
              {/* Learning Objectives */}
              {selectedChapter.content.learningObjectives && (
                <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border-white/10' 
                    : 'bg-white/80 border-gray-200'
                }`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Target className="w-7 h-7 mr-3 text-purple-500" />
                    Learning Objectives
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedChapter.content.learningObjectives.map((objective: string, index: number) => (
                      <div key={index} className={`flex items-start space-x-3 p-4 rounded-xl transition-colors ${
                        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className={`transition-colors ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {objective}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Section */}
              {selectedChapter.content.videoId && selectedChapter.content.videoId !== 'dQw4w9WgXcQ' && (
                <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border-white/10' 
                    : 'bg-white/80 border-gray-200'
                }`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Youtube className="w-7 h-7 mr-3 text-red-500" />
                    Video Lesson
                  </h2>
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
                    {!videoError[selectedChapter.id] ? (
                      <iframe
                        src={getYouTubeEmbedUrl(selectedChapter.content.videoId)}
                        title={selectedChapter.title}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        onError={() => setVideoError(prev => ({ ...prev, [selectedChapter.id]: true }))}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center transition-colors ${
                        theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        <div className="text-center">
                          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className={`mb-4 transition-colors ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Video could not be loaded
                          </p>
                          <a
                            href={`https://www.youtube.com/watch?v=${selectedChapter.content.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            <Youtube className="w-4 h-4" />
                            <span>Watch on YouTube</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-800/50 border-white/10' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <BookOpen className="w-7 h-7 mr-3 text-blue-500" />
                  Course Content
                </h2>

                <div className="space-y-8">
                  {/* Introduction */}
                  {selectedChapter.content.content.introduction && (
                    <div>
                      <h3 className={`text-xl font-bold mb-4 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Introduction
                      </h3>
                      <p className={`text-lg leading-relaxed transition-colors ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedChapter.content.content.introduction}
                      </p>
                    </div>
                  )}

                  {/* Main Content */}
                  {selectedChapter.content.content.mainContent && (
                    <div>
                      <h3 className={`text-xl font-bold mb-4 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Main Content
                      </h3>
                      <div className={`prose max-w-none transition-colors ${
                        theme === 'dark' ? 'prose-invert' : ''
                      }`}>
                        <div className={`text-lg leading-relaxed whitespace-pre-line transition-colors ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {selectedChapter.content.content.mainContent}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Points */}
                  {selectedChapter.content.content.keyPoints && (
                    <div>
                      <h3 className={`text-xl font-bold mb-4 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Key Points
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedChapter.content.content.keyPoints.map((point: string, index: number) => (
                          <div key={index} className={`flex items-start space-x-3 p-4 rounded-xl transition-colors ${
                            theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                          }`}>
                            <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                            <p className={`transition-colors ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {selectedChapter.content.content.summary && (
                    <div className={`p-6 rounded-2xl border-l-4 border-cyan-500 transition-colors ${
                      theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'
                    }`}>
                      <h3 className={`text-xl font-bold mb-4 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Summary
                      </h3>
                      <p className={`text-lg leading-relaxed transition-colors ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedChapter.content.content.summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Examples */}
              {selectedChapter.content.codeExamples && selectedChapter.content.codeExamples.length > 0 && (
                <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border-white/10' 
                    : 'bg-white/80 border-gray-200'
                }`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Code className="w-7 h-7 mr-3 text-green-500" />
                    Code Examples
                  </h2>
                  <div className="space-y-6">
                    {selectedChapter.content.codeExamples.map((example: any, index: number) => (
                      <div key={index} className={`border rounded-2xl overflow-hidden transition-colors ${
                        theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                      }`}>
                        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
                          theme === 'dark' ? 'bg-slate-700/50 border-white/10' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h3 className={`text-lg font-bold transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {example.title}
                          </h3>
                          <button
                            onClick={() => copyToClipboard(example.code, example.title)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                              copiedCode === example.title
                                ? 'bg-green-500 text-white'
                                : theme === 'dark'
                                  ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {copiedCode === example.title ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span className="text-sm font-medium">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 p-6">
                          <pre className="text-green-400 text-sm overflow-x-auto">
                            <code>{example.code}</code>
                          </pre>
                        </div>
                        <div className={`px-6 py-4 transition-colors ${
                          theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-50'
                        }`}>
                          <p className={`transition-colors ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {example.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Exercises */}
              {selectedChapter.content.practicalExercises && selectedChapter.content.practicalExercises.length > 0 && (
                <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border-white/10' 
                    : 'bg-white/80 border-gray-200'
                }`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Zap className="w-7 h-7 mr-3 text-yellow-500" />
                    Practical Exercises
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedChapter.content.practicalExercises.map((exercise: any, index: number) => (
                      <div key={index} className={`border rounded-2xl p-6 transition-colors ${
                        theme === 'dark' ? 'border-white/10 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-bold transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {exercise.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)} text-white`}>
                            {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                          </span>
                        </div>
                        <p className={`transition-colors ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {exercise.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Resources */}
              {selectedChapter.content.additionalResources && selectedChapter.content.additionalResources.length > 0 && (
                <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border-white/10' 
                    : 'bg-white/80 border-gray-200'
                }`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <ExternalLink className="w-7 h-7 mr-3 text-purple-500" />
                    Additional Resources
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedChapter.content.additionalResources.map((resource: any, index: number) => {
                      const ResourceIcon = getResourceIcon(resource.type);
                      return (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group border rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                            theme === 'dark' 
                              ? 'border-white/10 bg-slate-700/30 hover:border-purple-500/30' 
                              : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <ResourceIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className={`text-lg font-bold mb-2 group-hover:text-purple-500 transition-colors ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {resource.title}
                              </h3>
                              <p className={`mb-3 transition-colors ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {resource.description}
                              </p>
                              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                theme === 'dark' ? 'bg-slate-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                              </span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {selectedChapter.content.nextSteps && selectedChapter.content.nextSteps.length > 0 && (
                <div className={`backdrop-blur-xl border rounded-3xl p-8 transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-800/50 border-white/10' 
                    : 'bg-white/80 border-gray-200'
                }`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Star className="w-7 h-7 mr-3 text-cyan-500" />
                    Next Steps
                  </h2>
                  <div className="space-y-4">
                    {selectedChapter.content.nextSteps.map((step: string, index: number) => (
                      <div key={index} className={`flex items-start space-x-4 p-4 rounded-xl transition-colors ${
                        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className={`text-lg transition-colors ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Study Assistant - Floating */}
      <AIStudyAssistant chapter={selectedChapter} subject={subject} difficulty={difficulty} />
    </div>
  );
};

export default DetailedCoursePage;