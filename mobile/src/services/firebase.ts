// filepath: mobile/src/services/firebase.ts
/**
 * SeaPark Firebase Service
 * ========================
 * 
 * Frontend Firebase integration for real-time data and authentication.
 * 
 * Firebase Services Used:
 * - Firestore: Real-time database for parking data and reports
 * - Authentication: User authentication
 * - Cloud Functions: Server-side logic (optional)
 * 
 * Real-time Features:
 * - Live parking availability updates
 * - User report streaming
 * - Score updates
 * 
 * Team Assignment: 1 developer
 * Time Estimate: 2-3 hours
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { 
  getAuth, 
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { FIREBASE_CONFIG, FEATURES } from '../constants';
import type { ParkingLot, ParkingReport, ParkingRating, User as UserType } from '../types';

// Initialize Firebase app
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

/**
 * Initialize Firebase services
 * Must be called before using any Firebase functionality
 */
export const initializeFirebase = (): void => {
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    auth = getAuth(app);
    
    if (FEATURES.development.logApiCalls) {
      console.log('[Firebase] Initialized successfully');
    }
  }
};

/**
 * Get Firestore instance
 */
export const getDatabase = (): Firestore => {
  if (!db) {
    initializeFirebase();
  }
  return db!;
};

/**
 * Get Auth instance
 */
export const getAuthInstance = (): Auth => {
  if (!auth) {
    initializeFirebase();
  }
  return auth!;
};

// ============================================================================
// Parking Lots - Real-time CRUD
// ============================================================================

/**
 * Subscribe to parking lots with real-time updates
 * 
 * @param callback - Function to call when data changes
 * @param freeOnly - Filter for free parking only
 * @returns Unsubscribe function
 */
export const subscribeToParkingLots = (
  callback: (lots: ParkingLot[]) => void,
  freeOnly: boolean = false
): (() => void) => {
  const database = getDatabase();
  let constraints: QueryConstraint[] = [limit(100)];
  
  if (freeOnly) {
    constraints.push(where('isFree', '==', true));
  }
  
  const q = query(collection(database, FIREBASE_CONFIG.collections.parkingLots), ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const lots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ParkingLot[];
    callback(lots);
  });
};

/**
 * Get a single parking lot
 */
export const getParkingLot = async (lotId: string): Promise<ParkingLot | null> => {
  const database = getDatabase();
  const docRef = doc(database, FIREBASE_CONFIG.collections.parkingLots, lotId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ParkingLot;
  }
  return null;
};

/**
 * Create a new parking lot
 */
export const createParkingLot = async (lotData: Partial<ParkingLot>): Promise<ParkingLot> => {
  const database = getDatabase();
  const docRef = await addDoc(collection(database, FIREBASE_CONFIG.collections.parkingLots), {
    ...lotData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  return { id: docRef.id, ...lotData } as ParkingLot;
};

/**
 * Update a parking lot
 */
export const updateParkingLot = async (
  lotId: string,
  lotData: Partial<ParkingLot>
): Promise<void> => {
  const database = getDatabase();
  const docRef = doc(database, FIREBASE_CONFIG.collections.parkingLots, lotId);
  await updateDoc(docRef, {
    ...lotData,
    updatedAt: Timestamp.now(),
  });
};

// ============================================================================
// Reports - Real-time Updates
// ============================================================================

/**
 * Subscribe to reports for a specific lot
 */
export const subscribeToLotReports = (
  lotId: string,
  callback: (reports: ParkingReport[]) => void
): (() => void) => {
  const database = getDatabase();
  const q = query(
    collection(database, FIREBASE_CONFIG.collections.reports),
    where('lotId', '==', lotId),
    orderBy('timestamp', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
    })) as ParkingReport[];
    callback(reports);
  });
};

/**
 * Submit a new report
 */
export const submitReport = async (
  lotId: string,
  userId: string,
  reportType: 'parked' | 'leaving' | 'full',
  latitude: number,
  longitude: number
): Promise<ParkingReport> => {
  const database = getDatabase();
  const docRef = await addDoc(collection(database, FIREBASE_CONFIG.collections.reports), {
    lotId,
    userId,
    reportType,
    latitude,
    longitude,
    timestamp: Timestamp.now(),
  });
  
  return {
    id: docRef.id,
    lotId,
    userId,
    reportType,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  };
};

// ============================================================================
// Ratings
// ============================================================================

/**
 * Get ratings for a parking lot
 */
export const getLotRatings = async (lotId: string): Promise<ParkingRating[]> => {
  const database = getDatabase();
  const q = query(
    collection(database, FIREBASE_CONFIG.collections.ratings),
    where('lotId', '==', lotId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
  })) as ParkingRating[];
};

/**
 * Submit a rating
 */
export const submitRating = async (
  lotId: string,
  userId: string,
  safeScore: number,
  cleanScore: number,
  spaceScore: number,
  comment?: string
): Promise<ParkingRating> => {
  const database = getDatabase();
  const docRef = await addDoc(collection(database, FIREBASE_CONFIG.collections.ratings), {
    lotId,
    userId,
    safeScore,
    cleanScore,
    spaceScore,
    comment,
    createdAt: Timestamp.now(),
  });
  
  return {
    id: docRef.id,
    lotId,
    userId,
    safeScore,
    cleanScore,
    spaceScore,
    comment: comment || null,
    createdAt: new Date().toISOString(),
  };
};

// ============================================================================
// User Authentication
// ============================================================================

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  const auth = getAuthInstance();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  const auth = getAuthInstance();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

/**
 * Sign out
 */
export const logOut = async (): Promise<void> => {
  const auth = getAuthInstance();
  await signOut(auth);
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuth = (callback: (user: User | null) => void): (() => void) => {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
};

// ============================================================================
// User Preferences
// ============================================================================

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string): Promise<UserType | null> => {
  const database = getDatabase();
  const docRef = doc(database, FIREBASE_CONFIG.collections.users, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserType;
  }
  return null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  userData: Partial<UserType>
): Promise<void> => {
  const database = getDatabase();
  const docRef = doc(database, FIREBASE_CONFIG.collections.users, userId);
  await updateDoc(docRef, userData);
};

/**
 * Add to favorites
 */
export const addFavorite = async (userId: string, lotId: string): Promise<void> => {
  const database = getDatabase();
  const userDoc = await getUserProfile(userId);
  
  if (userDoc) {
    const favorites = userDoc.favorites || [];
    if (!favorites.includes(lotId)) {
      await updateUserProfile(userId, {
        favorites: [...favorites, lotId],
      });
    }
  }
};

/**
 * Remove from favorites
 */
export const removeFavorite = async (userId: string, lotId: string): Promise<void> => {
  const database = getDatabase();
  const userDoc = await getUserProfile(userId);
  
  if (userDoc) {
    const favorites = (userDoc.favorites || []).filter(id => id !== lotId);
    await updateUserProfile(userId, { favorites });
  }
};

/**
 * Add to history
 */
export const addToHistory = async (
  userId: string,
  lotId: string,
  action: 'parked' | 'searched' | 'favorited'
): Promise<void> => {
  const database = getDatabase();
  await addDoc(collection(database, FIREBASE_CONFIG.collections.userHistory), {
    userId,
    lotId,
    action,
    timestamp: Timestamp.now(),
  });
};

// ============================================================================
// Export
// ============================================================================

export default {
  initializeFirebase,
  getDatabase,
  getAuthInstance,
  
  // Parking Lots
  subscribeToParkingLots,
  getParkingLot,
  createParkingLot,
  updateParkingLot,
  
  // Reports
  subscribeToLotReports,
  submitReport,
  
  // Ratings
  getLotRatings,
  submitRating,
  
  // Auth
  signIn,
  signUp,
  logOut,
  subscribeToAuth,
  
  // User
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  addToHistory,
};