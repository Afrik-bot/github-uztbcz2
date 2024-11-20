import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, FolderIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatFileSize } from '../../utils/format';
import MediaGrid from './MediaGrid';
import MediaPreview from './MediaPreview';
import { MediaFile } from '../../types/media';

export default function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      folder: currentFolder,
      tags: [],
      createdAt: new Date().toISOString()
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [currentFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': []
    }
  });

  const handleDelete = () => {
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-700 hover:border-purple-500'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400">
          {isDragActive
            ? 'Drop your files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supports images, videos, and audio files up to 100MB
        </p>
      </div>

      {/* Actions Bar */}
      {selectedFiles.length > 0 && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-4 p-4 bg-gray-900 rounded-lg shadow-lg">
          <span className="text-sm text-gray-400">
            {selectedFiles.length} item{selectedFiles.length !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex-1" />

          <button
            onClick={() => setSelectedFiles([])}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear selection
          </button>

          <button
            onClick={() => {
              const folder = prompt('Enter folder name:');
              if (folder) setCurrentFolder(folder);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <FolderIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Move to folder</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      )}

      {/* Media Grid */}
      <div className="bg-gray-900 rounded-xl p-4">
        <MediaGrid
          files={files}
          selectedFiles={selectedFiles}
          onSelect={setSelectedFiles}
          onPreview={setPreviewFile}
        />
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <MediaPreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}