import { useState, useEffect } from 'react';
import { generateLeaderRankings } from '../../services/openai';
import LeaderRanking from '../LeaderRanking';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function LeaderRankings() {
  const [rankings, setRankings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await generateLeaderRankings();
      if (data) {
        setRankings(data);
      } else {
        setError('Failed to generate rankings');
      }
    } catch (error) {
      setError('An error occurred while generating rankings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-lg">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadRankings}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors mx-auto"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">African Leaders Weekly Ranking</h2>
          <p className="text-gray-400">AI-generated rankings based on performance metrics</p>
        </div>
        <button
          onClick={loadRankings}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {rankings?.rankings.map((leader: any) => (
          <LeaderRanking key={leader.name} leader={leader} />
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center">
        Rankings are generated using AI analysis of public data and news sources.
        Last updated: {new Date(rankings?.timestamp).toLocaleDateString()}
      </p>
    </div>
  );
}