import { useState, useEffect } from 'react';
import { networkManager } from '../utils/networkManager';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(networkManager.isNetworkAvailable());

  useEffect(() => {
    // Add listener and get cleanup function
    const removeListener = networkManager.addListener((online) => {
      setIsOnline(online);
    });

    // Cleanup on unmount
    return removeListener;
  }, []);

  return { isOnline };
}