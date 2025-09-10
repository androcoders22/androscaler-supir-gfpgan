import { useCallback } from "react";
import { ImageIcon, CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const DropZone = ({ onFilesSelected, disabled }: DropZoneProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
      e.target.value = "";
    },
    [onFilesSelected, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    document.getElementById("file-input")?.click();
  }, [disabled]);

  return (
    <div className="overflow-hidden flex flex-col min-h-screen">
      <div className="flex items-center justify-center flex-1 p-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
          className={cn(
            "card-gradient relative overflow-hidden",
            "border-2 border-dashed border-border rounded-xl",
            "w-full max-w-2xl aspect-[3/2] flex flex-col items-center justify-center",
            "cursor-pointer transition-all duration-300 group",
            "hover:border-primary hover:shadow-card",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="absolute inset-0 primary-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

          <div className="relative z-10 text-center space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="relative flex items-center gap-4 bg-primary/10 p-6 rounded-full border border-primary/20">
                <CloudUpload className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Drop your images here
              </h3>
              <p className="text-muted-foreground max-w-md">
                Select images to upscale. Supports JPG, PNG, WEBP formats.
              </p>
            </div>

            <div className="flex justify-center items-center gap-2 text-sm text-foreground/80">
              <ImageIcon className="w-4 h-4" />
              <span>Click to browse or drag and drop</span>
            </div>
          </div>

          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <div
          className="text-secondary cursor-default w-5 h-5"
          onClick={() => window.open("https://mohammad.is-a.dev", "_blank")}
        ></div>
      </div>
    </div>
  );
};
