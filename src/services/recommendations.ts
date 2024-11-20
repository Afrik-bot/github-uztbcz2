import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { videos as fallbackVideos } from '../data/videos';
import type { Video } from '../types/video';

export async function getRecommendedVideos(maxVideos = 10): Promise<Video[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No authenticated user, using default recommendations');
      return fallbackVideos.slice(0, maxVideos);
    }

    // First try to get user preferences
    const userPrefsRef = collection(db, 'user_preferences');
    const userPrefsQuery = query(
      userPrefsRef,
      where('userId', '==', currentUser.uid),
      limit(1)
    );

    const prefsSnapshot = await getDocs(userPrefsQuery);
    const userPrefs = prefsSnapshot.docs[0]?.data();

    // If no preferences found, return default videos
    if (!userPrefs?.topics?.length) {
      console.log('No user preferences found, using default recommendations');
      return fallbackVideos.slice(0, maxVideos);
    }

    // Query videos collection with user's preferred topics
    const videosRef = collection(db, 'videos');
    const videosQuery = query(
      videosRef,
      where('topics', 'array-contains-any', userPrefs.topics),
      orderBy('createdAt', 'desc'),
      limit(maxVideos)
    );

    const videosSnapshot = await getDocs(videosQuery);
    
    if (videosSnapshot.empty) {
      console.log('No matching videos found, using default recommendations');
      return fallbackVideos.slice(0, maxVideos);
    }

    return videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Video[];

  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    // Always fall back to default videos on error
    return fallbackVideos.slice(0, maxVideos);
  }
}