import { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import VideoActions from '../components/VideoActions';
import { getRecommendedVideos } from '../services/recommendations';
import type { Video } from '../types/video';

export default function Express() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendedVideos();
  }, []);

  const loadRecommendedVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const recommendedVideos = await getRecommendedVideos();
      setVideos(recommendedVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < 50) return;
    if (e.deltaY > 0 && currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [currentIndex, videos.length]);

  const toggleMute = () => setIsMuted(!isMuted);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadRecommendedVideos}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative h-full">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className={`absolute inset-0 transition-transform duration-500 ${
              index === currentIndex ? 'translate-y-0' :
              index < currentIndex ? '-translate-y-full' : 'translate-y-full'
            }`}
          >
            <div className="relative h-full">
              <VideoPlayer
                video={video}
                isActive={index === currentIndex}
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />
              <VideoActions video={video} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}