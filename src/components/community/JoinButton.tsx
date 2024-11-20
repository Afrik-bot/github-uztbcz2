import { useState } from 'react';
import { useCommunityStore } from '../../stores/communityStore';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface JoinButtonProps {
  communityId: string;
  className?: string;
}

export default function JoinButton({ communityId, className = '' }: JoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { memberships, joinCommunityAction, leaveCommunityAction } = useCommunityStore();
  const navigate = useNavigate();
  const isMember = memberships[communityId] || false;

  const handleJoinToggle = async () => {
    if (!currentUser) {
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (isMember) {
        await leaveCommunityAction(communityId);
      } else {
        await joinCommunityAction(communityId);
      }
    } catch (error: any) {
      console.error('Failed to toggle membership:', error);
      setError(error.message || 'Failed to update membership');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleJoinToggle}
        disabled={isLoading}
        className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isMember
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'bg-purple-500 text-white hover:bg-purple-600'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          isMember ? 'Leave Community' : 'Join Community'
        )}
      </button>
      
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}