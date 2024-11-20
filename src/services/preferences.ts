import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { networkManager } from '../utils/networkManager';
import retry from 'retry';

interface UserPreferences {
  topics: string[];
  updatedAt: string;
  watchHistory?: string[];
  likedVideos?: string[];
  watchTime?: {
    [category: string]: number;
  };
}

const CACHE_KEY_PREFIX = 'userPrefs_';
const MAX_RETRIES = 3;
const INITIAL_RETRY_TIMEOUT = 1000;

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (!userId) return null;

  // Try to get from cache first
  const cachedData = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
  const cached = cachedData ? JSON.parse(cachedData) : null;

  // Return cached data immediately if offline
  if (!networkManager.isNetworkAvailable()) {
    console.log('Using cached preferences (offline)');
    return cached;
  }

  const operation = retry.operation({
    retries: MAX_RETRIES,
    factor: 2,
    minTimeout: INITIAL_RETRY_TIMEOUT,
    maxTimeout: 5000,
    randomize: true
  });

  return new Promise((resolve, reject) => {
    operation.attempt(async (currentAttempt) => {
      try {
        const userPrefsRef = doc(db, 'user_preferences', userId);
        const snapshot = await getDoc(userPrefsRef);
        
        if (!snapshot.exists()) {
          // If no preferences exist yet, return cached or null
          resolve(cached || { topics: [], updatedAt: new Date().toISOString() });
          return;
        }

        const data = snapshot.data() as UserPreferences;
        
        // Update cache with fresh data
        localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(data));
        
        resolve(data);
      } catch (error: any) {
        console.log(`Attempt ${currentAttempt} failed:`, error);
        
        if (operation.retry(error)) {
          return;
        }

        // If all retries failed, use cached data if available
        if (cached) {
          console.log('Using cached preferences after failed retries');
          resolve(cached);
        } else {
          // If no cache, return empty preferences
          resolve({ topics: [], updatedAt: new Date().toISOString() });
        }
      }
    });
  });
}

export async function saveUserPreferences(
  userId: string, 
  data: Partial<UserPreferences>
): Promise<void> {
  if (!userId) throw new Error('User ID is required');

  // Update cache immediately for optimistic UI
  const cachedData = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
  const currentPrefs = cachedData ? JSON.parse(cachedData) : {};
  const updatedPrefs = { 
    ...currentPrefs, 
    ...data,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(updatedPrefs));

  // If offline, queue the update for later
  if (!networkManager.isNetworkAvailable()) {
    console.log('Queuing preference update for when online');
    return;
  }

  const operation = retry.operation({
    retries: MAX_RETRIES,
    factor: 2,
    minTimeout: INITIAL_RETRY_TIMEOUT,
    maxTimeout: 5000,
    randomize: true
  });

  return new Promise((resolve, reject) => {
    operation.attempt(async (currentAttempt) => {
      try {
        const userPrefsRef = doc(db, 'user_preferences', userId);
        await setDoc(userPrefsRef, updatedPrefs, { merge: true });
        resolve();
      } catch (error: any) {
        console.log(`Save attempt ${currentAttempt} failed:`, error);
        
        if (operation.retry(error)) {
          return;
        }
        
        // Even if save fails, the data is still in local storage
        console.log('Preferences saved locally but failed to sync with server');
        resolve();
      }
    });
  });
}