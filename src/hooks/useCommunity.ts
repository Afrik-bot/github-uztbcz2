import { useState, useEffect } from 'react';
import { checkMembership, joinCommunity, leaveCommunity } from '../services/community';

export function useCommunity(communityId: string) {
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkCurrentMembership();
  }, [communityId]);

  const checkCurrentMembership = async () => {
    try {
      const status = await checkMembership(communityId);
      setIsMember(status);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const toggleMembership = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isMember) {
        await leaveCommunity(communityId);
        setIsMember(false);
      } else {
        await joinCommunity(communityId);
        setIsMember(true);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isMember,
    isLoading,
    error,
    toggleMembership
  };
}