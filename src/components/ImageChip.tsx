import { useState } from 'react';
import { Check, Loader2, ArrowUpCircle, Download } from 'lucide-react';
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
            <span className="text-xs text-destructive-foreground font-bold">!</span>
          </div>
        );
      default:
        return null;
    }
  };

  const canExpand = image.uploadStatus === 'completed' && !imageError;

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `upscaled_${filename}`;
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
              {image.uploadStatus === 'upscaling' && ' • Upscaling...'}
              {image.uploadStatus === 'completed' && ' • Ready'}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center">
            {getStatusIcon()}
          </div>
        </div>


      </div>

      {/* Expanded comparison view */}
      {isExpanded && image.uploadStatus === 'completed' && image.upscaledUrl && (
        <div className="card-gradient border-x border-b border-border rounded-b-xl p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Upscaled */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-muted-foreground">Upscaled</h5>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(image.upscaledUrl!, image.name)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
              <div 
                className="relative rounded-lg overflow-hidden bg-muted aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImageModal(image.upscaledUrl!, `Upscaled ${image.name}`)}
              >
                <img
                  src={image.upscaledUrl}
                  alt={`Upscaled ${image.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
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