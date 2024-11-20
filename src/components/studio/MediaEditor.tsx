import { useState, useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { formatFileSize } from '../../utils/format';
import VideoEditor from './VideoEditor';
import ImageEditor from './ImageEditor';
import AudioEditor from './AudioEditor';

type EditorMode = 'image' | 'video' | 'audio';

export default function MediaEditor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<EditorMode>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setMode('image');
    } else if (file.type.startsWith('video/')) {
      setMode('video');
    } else if (file.type.startsWith('audio/')) {
      setMode('audio');
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setMode('image');
      } else if (file.type.startsWith('video/')) {
        setMode('video');
      } else if (file.type.startsWith('audio/')) {
        setMode('audio');
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSave = async (file: File, thumbnail?: string) => {
    // Here you would typically upload the edited file
    console.log('Saving edited file:', file, thumbnail);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">
            Drag and drop a file here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-purple-500 hover:text-purple-400"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports images, videos, and audio files up to {formatFileSize(100 * 1024 * 1024)}
          </p>
        </div>
      ) : (
        <>
          {mode === 'video' && (
            <VideoEditor
              file={selectedFile}
              onSave={handleSave}
              onCancel={() => setSelectedFile(null)}
            />
          )}
          {mode === 'image' && (
            <ImageEditor
              file={selectedFile}
              onSave={handleSave}
              onCancel={() => setSelectedFile(null)}
            />
          )}
          {mode === 'audio' && (
            <AudioEditor
              file={selectedFile}
              onSave={handleSave}
              onCancel={() => setSelectedFile(null)}
            />
          )}
        </>
      )}
    </div>
  );
}