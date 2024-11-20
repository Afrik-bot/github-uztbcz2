import { useState } from 'react';
import { CheckCircleIcon, Squares2X2Icon as ViewGridIcon, ListBulletIcon as ViewListIcon } from '@heroicons/react/24/outline';
import { formatFileSize, formatDistanceToNow } from '../../utils/format';
import type { MediaFile } from '../../types/media';

interface MediaGridProps {
  files: MediaFile[];
  selectedFiles: string[];
  onSelect: (ids: string[]) => void;
  onPreview: (file: MediaFile) => void;
}

export default function MediaGrid({ files, selectedFiles, onSelect, onPreview }: MediaGridProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const toggleSelection = (id: string) => {
    if (selectedFiles.includes(id)) {
      onSelect(selectedFiles.filter(fileId => fileId !== id));
    } else {
      onSelect([...selectedFiles, id]);
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setView('grid')}
          className={`p-2 rounded-lg transition-colors ${
            view === 'grid' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ViewGridIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView('list')}
          className={`p-2 rounded-lg transition-colors ${
            view === 'list' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ViewListIcon className="w-5 h-5" />
        </button>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map(file => (
            <div
              key={file.id}
              onClick={() => toggleSelection(file.id)}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border ${
                selectedFiles.includes(file.id)
                  ? 'border-purple-500'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full aspect-square object-cover"
                />
              ) : file.type.startsWith('video/') ? (
                <video
                  src={file.url}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">{file.type.split('/')[1].toUpperCase()}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-2 right-2">
                  <CheckCircleIcon
                    className={`w-6 h-6 ${
                      selectedFiles.includes(file.id)
                        ? 'text-purple-500'
                        : 'text-gray-400'
                    }`}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(file);
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {files.map(file => (
            <div
              key={file.id}
              onClick={() => toggleSelection(file.id)}
              className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                selectedFiles.includes(file.id)
                  ? 'bg-purple-500/10'
                  : 'hover:bg-gray-800'
              }`}
            >
              <CheckCircleIcon
                className={`w-6 h-6 flex-shrink-0 ${
                  selectedFiles.includes(file.id)
                    ? 'text-purple-500'
                    : 'text-gray-400'
                }`}
              />

              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{file.name}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{file.type.split('/')[1].toUpperCase()}</span>
                  <span>{formatDistanceToNow(new Date(file.createdAt))} ago</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(file);
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}