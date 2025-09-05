import { DropZone } from './DropZone';
import { ImageChip } from './ImageChip';
import { useImageUploader } from '@/hooks/useImageUploader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export const ImageUploader = () => {
  const {
    images,
    expandedImageId,
    addFiles,
    removeImage,
    toggleExpanded,
    resetAll,
  } = useImageUploader();

  const hasImages = images.length > 0;

  if (!hasImages) {
    return <DropZone onFilesSelected={addFiles} />;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Upscaler</h1>
            <p className="text-muted-foreground">
              {images.length} images • {images.filter(img => img.uploadStatus === 'completed').length} completed
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Images List */}
        <div className="space-y-4">
          {images.map((image) => (
            <ImageChip
              key={image.id}
              image={image}
              isExpanded={expandedImageId === image.id}
              onToggleExpand={() => toggleExpanded(image.id)}
            />
          ))}
        </div>

        <div className="pt-6">
          <div
            onClick={() => document.getElementById('file-input')?.click()}
            className="card-gradient border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-primary/50 group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ArrowLeft className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Add more images
              </p>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files || []).filter(file =>
              file.type.startsWith('image/')
            );
            if (files.length > 0) {
              addFiles(files);
            }
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};