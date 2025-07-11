const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Firebase initialization flag
let firebaseInitialized = false;
let db = null;

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  db = admin.firestore();
  firebaseInitialized = true;
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
  console.log('Server will continue without Firebase functionality');
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware to check Firebase availability
const requireFirebase = (req, res, next) => {
  if (!firebaseInitialized) {
    return res.status(503).json({ 
      error: 'Firebase service unavailable',
      message: 'Database connection is not available. Please check server configuration.'
    });
  }
  next();
};

// Helper function to convert Firestore timestamp to ISO string
const timestampToString = (timestamp) => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date(timestamp).toISOString();
};

// Routes

// Get or create user
app.post('/api/users/get-or-create', requireFirebase, async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, imageUrl } = req.body;

    // Query for existing user
    const usersRef = db.collection('users');
    const query = usersRef.where('clerkId', '==', clerkId);
    const querySnapshot = await query.get();

    if (!querySnapshot.empty) {
      // User exists, update their info
      const userDoc = querySnapshot.docs[0];
      const existingUser = { _id: userDoc.id, ...userDoc.data() };
      
      const updateData = {
        email,
        firstName,
        lastName,
        imageUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await userDoc.ref.update(updateData);
      
      res.json({
        ...existingUser,
        ...updateData,
        updatedAt: new Date().toISOString()
      });
    } else {
      // User doesn't exist, create new one
      const newUserData = {
        clerkId,
        email,
        firstName,
        lastName,
        imageUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await usersRef.add(newUserData);
      
      res.json({
        _id: docRef.id,
        clerkId,
        email,
        firstName,
        lastName,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting or creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
app.put('/api/users/:userId', requireFirebase, async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const userRef = db.collection('users').doc(userId);
    await userRef.update(updateData);
    
    const updatedDoc = await userRef.get();
    if (updatedDoc.exists) {
      const userData = updatedDoc.data();
      res.json({
        _id: updatedDoc.id,
        ...userData,
        createdAt: timestampToString(userData.createdAt),
        updatedAt: timestampToString(userData.updatedAt)
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user learning history
app.get('/api/users/:userId/history', requireFirebase, async (req, res) => {
  try {
    const { userId } = req.params;

    const historyRef = db.collection('learning_history');
    const query = historyRef
      .where('userId', '==', userId)
      .orderBy('lastAccessedAt', 'desc');
    
    const querySnapshot = await query.get();
    const history = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        _id: doc.id,
        ...data,
        startedAt: timestampToString(data.startedAt),
        lastAccessedAt: timestampToString(data.lastAccessedAt),
        completedAt: data.completedAt ? timestampToString(data.completedAt) : undefined,
        chapterProgress: data.chapterProgress?.map(cp => ({
          ...cp,
          completedAt: cp.completedAt ? timestampToString(cp.completedAt) : undefined
        })) || []
      });
    });

    res.json(history);
  } catch (error) {
    console.error('Error getting user history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add to learning history
app.post('/api/users/:userId/history', requireFirebase, async (req, res) => {
  try {
    const { userId } = req.params;
    const historyData = req.body;

    const newHistoryData = {
      userId,
      subject: historyData.subject,
      difficulty: historyData.difficulty,
      roadmapId: historyData.roadmapId,
      chapterProgress: historyData.chapterProgress.map(cp => ({
        chapterId: cp.chapterId,
        completed: cp.completed,
        completedAt: cp.completedAt ? admin.firestore.Timestamp.fromDate(new Date(cp.completedAt)) : null
      })),
      learningPreferences: historyData.learningPreferences,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      timeSpent: null
    };

    const docRef = await db.collection('learning_history').add(newHistoryData);
    
    res.json({
      _id: docRef.id,
      userId,
      ...historyData,
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding to history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chapter progress
app.put('/api/users/:userId/history/:historyId/chapter/:chapterId', requireFirebase, async (req, res) => {
  try {
    const { userId, historyId, chapterId } = req.params;
    const { completed, completedAt } = req.body;

    const historyRef = db.collection('learning_history').doc(historyId);
    const historyDoc = await historyRef.get();
    
    if (!historyDoc.exists) {
      return res.status(404).json({ error: 'Learning history not found' });
    }
    
    const historyData = historyDoc.data();
    const chapterProgress = historyData.chapterProgress || [];
    
    // Find and update the chapter progress
    const chapterIndex = chapterProgress.findIndex(
      chapter => chapter.chapterId === chapterId
    );
    
    if (chapterIndex !== -1) {
      chapterProgress[chapterIndex].completed = completed;
      chapterProgress[chapterIndex].completedAt = completed 
        ? (completedAt ? admin.firestore.Timestamp.fromDate(new Date(completedAt)) : admin.firestore.FieldValue.serverTimestamp())
        : null;
    } else {
      // Add new chapter progress if it doesn't exist
      chapterProgress.push({
        chapterId,
        completed,
        completedAt: completed 
          ? (completedAt ? admin.firestore.Timestamp.fromDate(new Date(completedAt)) : admin.firestore.FieldValue.serverTimestamp())
          : null
      });
    }
    
    // Check if all chapters are completed
    const allCompleted = chapterProgress.every(chapter => chapter.completed);
    
    const updateData = {
      chapterProgress,
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (allCompleted && !historyData.completedAt) {
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await historyRef.update(updateData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating chapter progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: firebaseInitialized ? 'Firebase Firestore' : 'Unavailable',
    firebaseInitialized
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database status: ${firebaseInitialized ? 'Firebase Firestore connected' : 'Firebase unavailable'}`);
});