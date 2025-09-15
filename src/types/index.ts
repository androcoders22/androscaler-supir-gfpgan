export interface UploadedImage {
  id: string;
  file: File;
  originalUrl: string;
  upscaledUrl?: string;
  upscaledBeforeResizeUrl?: string;
  uploadProgress: number;
  uploadStatus:
    | "queued"
    | "uploading"
    | "uploaded"
    | "upscaling"
    | "color-grading"
    | "completed"
    | "error";
  name: string;
  size: number;
  folderName?: string;
  apiOriginalUrl?: string;
  startTime?: number;
  processingTime?: number;
  originalFileName?: string;
  /** Which processing pipeline this image belongs to */
  pipeline?: "upscale" | "color";
}

export type UploadStatus = "idle" | "uploading" | "processing" | "completed";
