import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveUserPreferences } from '../services/preferences';
import { 
  BeakerIcon, 
  GlobeAltIcon, 
  HeartIcon, 
  ComputerDesktopIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  MusicalNoteIcon,
  FilmIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const TOPICS = [
  { id: 'tech', icon: ComputerDesktopIcon, label: 'Technology' },
  { id: 'ai', icon: SparklesIcon, label: 'Artificial Intelligence' },
  { id: 'business', icon: BuildingOfficeIcon, label: 'Business' },
  { id: 'music', icon: MusicalNoteIcon, label: 'Music' },
  { id: 'entertainment', icon: FilmIcon, label: 'Entertainment' },
  { id: 'finance', icon: CurrencyDollarIcon, label: 'Finance' },
  { id: 'education', icon: AcademicCapIcon, label: 'Education' },
  { id: 'sustainability', icon: GlobeAltIcon, label: 'Sustainability' },
  { id: 'health', icon: HeartIcon, label: 'Health & Wellness' },
  { id: 'science', icon: BeakerIcon, label: 'Science' },
  { id: 'community', icon: UserGroupIcon, label: 'Community' },
  { id: 'innovation', icon: RocketLaunchIcon, label: 'Innovation' }
];

export default function Discover() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser, setOnboardingComplete } = useAuth();

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
    setError(null);
  };

  const handleContinue = async () => {
    if (!currentUser) {
      setError('You must be logged in to continue');
      return;
    }

    if (selectedTopics.length < 3) {
      setError('Please select at least 3 topics');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await saveUserPreferences(currentUser.uid, {
        topics: selectedTopics,
        updatedAt: new Date().toISOString()
      });

      setOnboardingComplete(true);
      navigate('/express');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to Tam Tam
          </h1>
          <p className="text-gray-400 text-lg">
            Select topics that interest you to personalize your experience
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {TOPICS.map(topic => {
              const Icon = topic.icon;
              const isSelected = selectedTopics.includes(topic.id);

              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'bg-gray-900/50 border-gray-800/50 text-gray-400 hover:border-purple-500/30'
                  }`}
                >
                  <Icon className="w-8 h-8" />
                  <span className="text-sm font-medium">{topic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-gray-400">
            {selectedTopics.length} of 3 minimum topics selected
          </div>
          <div className="w-full max-w-xs h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{
                width: `${Math.min((selectedTopics.length / 3) * 100, 100)}%`
              }}
            />
          </div>
          <button
            onClick={handleContinue}
            disabled={selectedTopics.length < 3 || isSubmitting}
            className="px-8 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}