import { useState, useRef, useEffect } from 'react';
import { 
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface ImageEditorProps {
  file: File;
  onSave: (file: File) => void;
  onCancel: () => void;
}

export default function ImageEditor({ file, onSave, onCancel }: ImageEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    imageRef.current = image;

    image.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = image.width;
        canvas.height = image.height;
        applyFilters();
      }
    };
  }, [file]);

  const applyFilters = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas
    ctx.filter = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filters
    ctx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
    `;

    // Draw image with current zoom
    const scaledWidth = canvas.width * zoom;
    const scaledHeight = canvas.height * zoom;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(imageRef.current, x, y, scaledWidth, scaledHeight);
  };

  useEffect(() => {
    applyFilters();
  }, [zoom, brightness, contrast, saturation]);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9);
      });

      // Create new file with original name
      const newFile = new File([blob], file.name, { type: 'image/jpeg' });
      onSave(newFile);
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-medium text-white">Edit Image</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Image Preview */}
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Zoom Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Zoom</span>
              <ArrowsPointingOutIcon className="w-5 h-5" />
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Brightness Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Brightness</span>
              <PhotoIcon className="w-5 h-5" />
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Contrast Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Contrast</span>
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Saturation Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Saturation</span>
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
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