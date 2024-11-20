import { db } from '../lib/firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

class NetworkManager {
  private static instance: NetworkManager;
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(online: boolean) => void> = new Set();

  private constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private async handleOnline() {
    this.isOnline = true;
    try {
      await enableNetwork(db);
      console.log('Network connection restored');
      this.notifyListeners();
    } catch (error) {
      console.error('Error enabling network:', error);
    }
  }

  private async handleOffline() {
    this.isOnline = false;
    try {
      await disableNetwork(db);
      console.log('Offline mode enabled');
      this.notifyListeners();
    } catch (error) {
      console.error('Error enabling offline mode:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  addListener(listener: (online: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isNetworkAvailable(): boolean {
    return this.isOnline;
  }
}

export const networkManager = NetworkManager.getInstance();