import { useState } from 'react';
import { Check, Loader2, ArrowUpCircle, Download, CloudAlert, SplitSquareHorizontal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadedImage } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageChipProps {
  image: UploadedImage;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ImageChip = ({ image, isExpanded, onToggleExpand }: ImageChipProps) => {
  const [imageError, setImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const getStatusIcon = () => {
    switch (image.uploadStatus) {
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'uploaded':
      case 'upscaling':
      case 'color-grading':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'completed':
        return (
          <div className="bg-success rounded-full p-1">
            <Check className="w-3 h-3 text-success-foreground" />
          </div>
        );
      case 'error':
        return (
          <div className="bg-destructive rounded-lg p-1">
            <CloudAlert  size={18} />
          </div>
        );
      default:
        return null;
    }
  };

  const canExpand = image.uploadStatus === 'completed' && !imageError;

  const handleDownload = async (url: string, originalFileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Use original file name with upscaled prefix
      const fileExtension = originalFileName.split('.').pop();
      const baseName = originalFileName.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}_final.${fileExtension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const openImageModal = (url: string, title: string) => {
    setModalImage({ url, title });
    setShowImageModal(true);
  };

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
              {image.uploadStatus === 'uploading' && ' • Uploading...'}
              {image.uploadStatus === 'color-grading' && ' • Removing Cast...'}
              {image.uploadStatus === 'upscaling' && ' • Upscaling...'}
              {image.uploadStatus === 'completed' && image.processingTime && (
                <span className="inline-flex items-center gap-1 ml-1">
                  • <Clock className="w-3 h-3" /> {image.processingTime}s
                </span>
              )}
            </p>
          </div>


          {/* Status */}
          <div className="flex items-center gap-2">
            {image.uploadStatus === 'completed' && image.upscaledUrl && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setComparisonMode(!comparisonMode);
                  }}
                  className={cn(
                    "p-1 rounded-full hover:bg-primary/10 transition-colors",
                    comparisonMode ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <SplitSquareHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(image.upscaledUrl!, image.originalFileName || image.name);
                  }}
                  className="p-1 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
            {getStatusIcon()}
          </div>
        </div>
      </div>

      {/* Expanded comparison view */}
      {isExpanded && image.uploadStatus === 'completed' && (
        <div className="card-gradient border-x border-b border-border rounded-b-xl p-6 animate-in slide-in-from-top-2 duration-300">
          {!image.upscaledBeforeResizeUrl && !image.upscaledUrl && (
            <div className="text-sm text-destructive mb-4">
              Final image URLs not available yet. Please wait or retry.
            </div>
          )}
          {comparisonMode ? (
            /* Slider Comparison */
            <div className="space-y-3">
              <h5 className="font-medium text-muted-foreground text-center">Comparison</h5>
              {image.upscaledUrl ? (
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-square">
                {/* Upscaled Image (Background) */}
                <img
                  src={image.upscaledUrl}
                  alt={`Upscaled ${image.name}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Original Image (Clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={image.originalUrl}
                    alt={`Original ${image.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Slider */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />
                {/* Labels */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Original</div>
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Upscaled</div>
              </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center">Final image not ready.</div>
              )}
            </div>
          ) : (
            /* Side by Side */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Original */}
              <div className="space-y-3">
                <h5 className="font-medium text-muted-foreground">Original</h5>
                <div
                  className="relative rounded-lg overflow-hidden bg-muted aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImageModal(image.originalUrl, `Original ${image.name}`)}
                >
                  <img
                    src={image.originalUrl}
                    alt={`Original ${image.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Upscaled (Raw) */}
              {image.upscaledBeforeResizeUrl && (
                <div className="space-y-3">
                  <h5 className="font-medium text-muted-foreground">Upscaled</h5>
                  <div
                    className="relative rounded-lg overflow-hidden bg-muted aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(image.upscaledBeforeResizeUrl!, `Upscaled ${image.name}`)}
                  >
                    <img
                      src={image.upscaledBeforeResizeUrl}
                      alt={`Upscaled ${image.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Final */}
              <div className="space-y-3">
                <h5 className="font-medium text-muted-foreground">Downsized <span className="text-muted-foreground/60">200 PPI</span></h5>
                <div
                  className="relative rounded-lg overflow-hidden bg-muted aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => image.upscaledUrl && openImageModal(image.upscaledUrl!, `Final ${image.name}`)}
                >
                  {image.upscaledUrl ? (
                    <img
                      src={image.upscaledUrl}
                      alt={`Final ${image.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">
                      Final image pending
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{modalImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            {modalImage && (
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};