import { useState, useEffect } from 'react';
import { VideoCameraIcon, PlusIcon } from '@heroicons/react/24/outline';
import VideoCard from '../VideoCard';
import CommunityVideoUpload from './CommunityVideoUpload';
import { getVideos } from '../../services/storage';
import type { Video } from '../../types/video';

interface CommunityVideosProps {
  communityId: string;
}

export default function CommunityVideos({ communityId }: CommunityVideosProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [communityId]);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const communityVideos = await getVideos(communityId);
      setVideos(communityVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Community Videos</h3>
        <button
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Upload Video
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <VideoCameraIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No videos yet</p>
          <button
            onClick={() => setIsUploading(true)}
            className="mt-4 text-purple-500 hover:text-purple-400 transition-colors"
          >
            Upload the first video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      {isUploading && (
        <CommunityVideoUpload
          communityId={communityId}
          onClose={() => setIsUploading(false)}
          onUploadComplete={loadVideos}
        />
      )}
    </div>
  );
}