import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatFileSize, formatDistanceToNow } from '../../utils/format';
import type { MediaFile } from '../../types/media';

interface MediaPreviewProps {
  file: MediaFile;
  onClose: () => void;
}

export default function MediaPreview({ file, onClose }: MediaPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-5xl p-4">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="aspect-video bg-gray-800">
            {file.type.startsWith('image/') ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-contain"
                onLoad={() => setIsLoading(false)}
              />
            ) : file.type.startsWith('video/') ? (
              <video
                src={file.url}
                controls
                className="w-full h-full"
                onLoadedData={() => setIsLoading(false)}
              />
            ) : file.type.startsWith('audio/') ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <audio
                  src={file.url}
                  controls
                  className="w-full"
                  onLoadedData={() => setIsLoading(false)}
                />
              </div>
            ) : null}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-2">{file.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{formatFileSize(file.size)}</span>
              <span>{file.type.split('/')[1].toUpperCase()}</span>
              <span>Uploaded {formatDistanceToNow(new Date(file.createdAt))} ago</span>
            </div>

            {file.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {file.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-800 rounded-lg text-sm text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}