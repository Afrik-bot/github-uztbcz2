import { useState, useRef, useEffect } from 'react';
import { 
  ArrowPathIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { formatDuration } from '../../utils/format';

interface AudioEditorProps {
  file: File;
  onSave: (file: File) => void;
  onCancel: () => void;
}

export default function AudioEditor({ file, onSave, onCancel }: AudioEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(file);
    }
  }, [file]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
    }
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      // In a real implementation, you would process the audio here
      // For now, we'll just pass the original file
      onSave(file);
    } catch (error) {
      console.error('Error saving audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-medium text-white">Edit Audio</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Audio Player */}
        <div className="bg-gray-800 rounded-lg p-6">
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="space-y-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 w-16">
                {formatDuration(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="flex-1 accent-purple-500"
              />
              <span className="text-sm text-gray-400 w-16">
                {formatDuration(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="flex-1 accent-purple-500"
              />
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