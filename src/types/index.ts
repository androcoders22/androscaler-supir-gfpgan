export interface UploadedImage {
  id: string;
  file: File;
  originalUrl: string;
  upscaledUrl?: string;
  uploadProgress: number;
  uploadStatus: 'uploading' | 'uploaded' | 'upscaling' | 'color-grading' | 'completed' | 'error';
  name: string;
  size: number;
  folderName?: string;
  apiOriginalUrl?: string;
}

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed';