import { useState } from 'react';
import { Check, Loader2, X, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadedImage } from '@/types';

interface ImageChipProps {
  image: UploadedImage;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
}

export const ImageChip = ({ image, isExpanded, onToggleExpand, onRemove }: ImageChipProps) => {
  const [imageError, setImageError] = useState(false);

  const getStatusIcon = () => {
    switch (image.uploadStatus) {
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'uploaded':
      case 'upscaling':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'completed':
        return (
          <div className="bg-success rounded-full p-1">
            <Check className="w-3 h-3 text-success-foreground" />
          </div>
        );
      case 'error':
        return (
          <div className="bg-destructive rounded-full p-1">
            <X className="w-3 h-3 text-destructive-foreground" />
          </div>
        );
      default:
        return null;
    }
  };

  const canExpand = image.uploadStatus === 'completed' && !imageError;

  return (
    <div className="w-full">
      {/* Chip */}
      <div
        className={cn(
          "card-gradient rounded-xl border border-border transition-all duration-300",
          "hover:shadow-card hover:border-primary/30",
          image.uploadStatus === 'uploading' && "opacity-70",
          image.uploadStatus === 'completed' && "shadow-card",
          canExpand && "cursor-pointer",
          isExpanded && "rounded-b-none border-b-0"
        )}
        onClick={canExpand ? onToggleExpand : undefined}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Thumbnail */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {!imageError ? (
              <img
                src={image.originalUrl}
                alt={image.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{image.name}</h4>
            <p className="text-sm text-muted-foreground">
              {(image.size / 1024 / 1024).toFixed(2)} MB
              {image.uploadStatus === 'upscaling' && ' • Upscaling...'}
              {image.uploadStatus === 'completed' && ' • Ready'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar for uploading */}
        {image.uploadStatus === 'uploading' && (
          <div className="px-4 pb-4">
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="h-1 primary-gradient rounded-full transition-all duration-300"
                style={{ width: `${image.uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded comparison view */}
      {isExpanded && image.uploadStatus === 'completed' && image.upscaledUrl && (
        <div className="card-gradient border-x border-b border-border rounded-b-xl p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-3">
              <h5 className="font-medium text-muted-foreground">Original</h5>
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <img
                  src={image.originalUrl}
                  alt={`Original ${image.name}`}
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Upscaled */}
            <div className="space-y-3">
              <h5 className="font-medium text-muted-foreground">Upscaled (2x)</h5>
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <img
                  src={image.upscaledUrl}
                  alt={`Upscaled ${image.name}`}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};