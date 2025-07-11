import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { UserProfile, LearningHistory } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

class FirebaseService {
  private usersCollection = 'users';
  private historyCollection = 'learning_history';

  async getOrCreateUser(userData: {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  }): Promise<UserProfile> {
    try {
      // First, try to find user by clerkId
      const usersRef = collection(db, this.usersCollection);
      const q = query(usersRef, where('clerkId', '==', userData.clerkId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User exists, update their info
        const userDoc = querySnapshot.docs[0];
        const existingUser = { _id: userDoc.id, ...userDoc.data() } as UserProfile;
        
        // Update user info if it has changed
        const updateData = {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageUrl: userData.imageUrl,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(userDoc.ref, updateData);
        
        return {
          ...existingUser,
          ...updateData,
          updatedAt: new Date().toISOString()
        };
      } else {
        // User doesn't exist, create new one
        const newUserData = {
          clerkId: userData.clerkId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageUrl: userData.imageUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, this.usersCollection), newUserData);
        
        return {
          _id: docRef.id,
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error getting or creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      
      // Get updated user
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        return {
          _id: updatedDoc.id,
          ...updatedDoc.data(),
          updatedAt: new Date().toISOString()
        } as UserProfile;
      } else {
        throw new Error('User not found after update');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getUserHistory(userId: string): Promise<LearningHistory[]> {
    try {
      const historyRef = collection(db, this.historyCollection);
      const q = query(
        historyRef, 
        where('userId', '==', userId),
        orderBy('lastAccessedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const history: LearningHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          _id: doc.id,
          ...data,
          startedAt: this.timestampToString(data.startedAt),
          lastAccessedAt: this.timestampToString(data.lastAccessedAt),
          completedAt: data.completedAt ? this.timestampToString(data.completedAt) : undefined,
          chapterProgress: data.chapterProgress?.map((cp: any) => ({
            ...cp,
            completedAt: cp.completedAt ? this.timestampToString(cp.completedAt) : undefined
          })) || []
        } as LearningHistory);
      });
      
      return history;
    } catch (error) {
      console.error('Error getting user history:', error);
      throw error;
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
      const newHistoryData = {
        userId,
        subject: historyData.subject,
        difficulty: historyData.difficulty,
        roadmapId: historyData.roadmapId,
        chapterProgress: historyData.chapterProgress.map(cp => ({
          chapterId: cp.chapterId,
          completed: cp.completed,
          completedAt: cp.completedAt ? Timestamp.fromDate(cp.completedAt) : null
        })),
        learningPreferences: historyData.learningPreferences,
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        completedAt: null,
        timeSpent: null
      };

      const docRef = await addDoc(collection(db, this.historyCollection), newHistoryData);
      
      return {
        _id: docRef.id,
        userId,
        ...historyData,
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        chapterProgress: historyData.chapterProgress.map(cp => ({
          ...cp,
          completedAt: cp.completedAt?.toISOString()
        }))
      } as LearningHistory;
    } catch (error) {
      console.error('Error adding to history:', error);
      throw error;
    }
  }

  async updateChapterProgress(userId: string, historyId: string, chapterId: string, completed: boolean): Promise<void> {
    try {
      const historyRef = doc(db, this.historyCollection, historyId);
      const historyDoc = await getDoc(historyRef);
      
      if (!historyDoc.exists()) {
        throw new Error('Learning history not found');
      }
      
      const historyData = historyDoc.data();
      const chapterProgress = historyData.chapterProgress || [];
      
      // Find and update the chapter progress
      const chapterIndex = chapterProgress.findIndex(
        (chapter: any) => chapter.chapterId === chapterId
      );
      
      if (chapterIndex !== -1) {
        chapterProgress[chapterIndex].completed = completed;
        chapterProgress[chapterIndex].completedAt = completed ? serverTimestamp() : null;
      } else {
        // Add new chapter progress if it doesn't exist
        chapterProgress.push({
          chapterId,
          completed,
          completedAt: completed ? serverTimestamp() : null
        });
      }
      
      // Check if all chapters are completed
      const allCompleted = chapterProgress.every((chapter: any) => chapter.completed);
      
      const updateData: any = {
        chapterProgress,
        lastAccessedAt: serverTimestamp()
      };
      
      if (allCompleted && !historyData.completedAt) {
        updateData.completedAt = serverTimestamp();
      }
      
      await updateDoc(historyRef, updateData);
    } catch (error) {
      console.error('Error updating chapter progress:', error);
      throw error;
    }
  }

  private timestampToString(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    return new Date(timestamp).toISOString();
  }
}

export const firebaseService = new FirebaseService();