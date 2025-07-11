export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  position: 'left' | 'right';
  completed: boolean;
}

export interface Roadmap {
  id: string;
  subject: string;
  difficulty: string;
  chapters: Chapter[];
  totalDuration: string;
  estimatedHours?: string;
  prerequisites?: string[];
  learningOutcomes?: string[];
  description: string;
}

export interface CourseContent {
  chapterId: string;
  title: string;
  description: string;
  learningObjectives?: string[];
  estimatedTime?: string;
  content: string | {
    introduction?: string;
    mainContent?: string;
    keyPoints?: string[];
    summary?: string;
  };
  videoUrl?: string;
  codeExamples?: (string | {
    title?: string;
    code: string;
    explanation?: string;
  })[];
  practicalExercises?: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  additionalResources?: {
    title: string;
    url: string;
    type: 'article' | 'documentation' | 'tutorial' | 'video';
    description?: string;
  }[];
  nextSteps?: string[];
}

export interface Quiz {
  id: string;
  chapterId: string;
  questions: Question[];
  totalQuestions: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
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

export interface UserProfile {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningHistory {
  _id: string;
  userId: string;
  subject: string;
  difficulty: string;
  roadmapId: string;
  chapterProgress: {
    chapterId: string;
    completed: boolean;
    completedAt?: string;
  }[];
  learningPreferences: {
    learningStyle: string;
    timeCommitment: string;
    goals: string[];
  };
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  timeSpent?: string;
}