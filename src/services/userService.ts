import { firebaseService } from './firebaseService';
import { UserProfile, LearningHistory } from '../types';

class UserService {
  async getOrCreateUser(userData: {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  }): Promise<UserProfile> {
    try {
      return await firebaseService.getOrCreateUser(userData);
    } catch (error) {
      console.error('Error in userService.getOrCreateUser:', error);
      // Fallback to localStorage if Firebase fails
      const fallbackUser: UserProfile = {
        _id: userData.clerkId,
        clerkId: userData.clerkId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`user_${userData.clerkId}`, JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }

  async updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      return await firebaseService.updateUser(userId, data);
    } catch (error) {
      console.error('Error in userService.updateUser:', error);
      // Fallback to localStorage
      const existingUser = localStorage.getItem(`user_${userId}`);
      if (existingUser) {
        const user = JSON.parse(existingUser);
        const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem(`user_${userId}`, JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw error;
    }
  }

  async getUserHistory(userId: string): Promise<LearningHistory[]> {
    try {
      return await firebaseService.getUserHistory(userId);
    } catch (error) {
      console.error('Error in userService.getUserHistory:', error);
      // Fallback to localStorage
      const history = localStorage.getItem(`history_${userId}`);
      return history ? JSON.parse(history) : [];
    }
  }

  async addToHistory(userId: string, historyData: {
    subject: string;
    difficulty: string;
    roadmapId: string;
    chapterProgress: { chapterId: string; completed: boolean; completedAt?: Date }[];
    learningPreferences: {
      learningStyle: string;
      timeCommitment: string;
      goals: string[];
    };
  }): Promise<LearningHistory> {
    try {
      return await firebaseService.addToHistory(userId, historyData);
    } catch (error) {
      console.error('Error in userService.addToHistory:', error);
      // Fallback to localStorage
      const newHistory: LearningHistory = {
        _id: `history_${Date.now()}`,
        userId,
        ...historyData,
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        chapterProgress: historyData.chapterProgress.map(cp => ({
          ...cp,
          completedAt: cp.completedAt?.toISOString()
        }))
      };
      
      const existingHistory = localStorage.getItem(`history_${userId}`);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(newHistory);
      localStorage.setItem(`history_${userId}`, JSON.stringify(history));
      
      return newHistory;
    }
  }

  async updateChapterProgress(userId: string, historyId: string, chapterId: string, completed: boolean): Promise<void> {
    try {
      await firebaseService.updateChapterProgress(userId, historyId, chapterId, completed);
    } catch (error) {
      console.error('Error in userService.updateChapterProgress:', error);
      // Fallback to localStorage
      const existingHistory = localStorage.getItem(`history_${userId}`);
      if (existingHistory) {
        const history = JSON.parse(existingHistory);
        const historyItem = history.find((h: any) => h._id === historyId);
        if (historyItem) {
          const chapterIndex = historyItem.chapterProgress.findIndex(
            (cp: any) => cp.chapterId === chapterId
          );
          if (chapterIndex !== -1) {
            historyItem.chapterProgress[chapterIndex].completed = completed;
            historyItem.chapterProgress[chapterIndex].completedAt = completed ? new Date().toISOString() : undefined;
          } else {
            historyItem.chapterProgress.push({
              chapterId,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined
            });
          }
          historyItem.lastAccessedAt = new Date().toISOString();
          localStorage.setItem(`history_${userId}`, JSON.stringify(history));
        }
      }
    }
  }
}

export const userService = new UserService();