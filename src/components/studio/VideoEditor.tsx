import { useState, useRef, useCallback } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ScissorsIcon, 
  PhotoIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { formatDuration } from '../../utils/format';

interface VideoEditorProps {
  file: File;
  onSave: (file: File, thumbnail: string) => void;
  onCancel: () => void;
}

export default function VideoEditor({ file, onSave, onCancel }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedThumbnailTime, setSelectedThumbnailTime] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setEndTime(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const captureThumbnail = useCallback(async (time: number) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.currentTime = time;

    return new Promise<string>((resolve) => {
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  }, []);

  const handleThumbnailCapture = async () => {
    const thumbnail = await captureThumbnail(currentTime);
    setThumbnailPreview(thumbnail);
    setSelectedThumbnailTime(currentTime);
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const thumbnail = await captureThumbnail(selectedThumbnailTime);
      // Here you would typically process the video with the trim points
      // For now, we'll just pass the original file and thumbnail
      onSave(file, thumbnail);
    } catch (error) {
      console.error('Error saving video:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-medium text-white">Edit Video</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Video Preview */}
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={URL.createObjectURL(file)}
            className="w-full h-full"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        {/* Playback Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6 text-white" />
              ) : (
                <PlayIcon className="w-6 h-6 text-white" />
              )}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <span className="text-sm text-gray-400">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>

          {/* Trim Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Trim Points</span>
              <ScissorsIcon className="w-5 h-5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                <input
                  type="range"
                  min={0}
                  max={endTime}
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <span className="text-sm text-gray-400">{formatDuration(startTime)}</span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Time</label>
                <input
                  type="range"
                  min={startTime}
                  max={duration}
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <span className="text-sm text-gray-400">{formatDuration(endTime)}</span>
              </div>
            </div>
          </div>

          {/* Thumbnail Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Thumbnail</span>
              <PhotoIcon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleThumbnailCapture}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Capture at Current Time
              </button>
              {thumbnailPreview && (
                <div className="relative w-24 h-24 bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 p-1 bg-green-500 rounded-full">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}