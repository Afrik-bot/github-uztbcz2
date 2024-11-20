import { useNetwork } from '../hooks/useNetwork';
import { WifiIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

export default function NetworkStatus() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white rounded-lg shadow-lg backdrop-blur-sm">
        <NoSymbolIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Working Offline</span>
        <span className="text-xs opacity-75">Changes will sync when back online</span>
      </div>
    </div>
  );
}