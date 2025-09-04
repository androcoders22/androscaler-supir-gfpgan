export interface UploadedImage {
  id: string;
  file: File;
  originalUrl: string;
  upscaledUrl?: string;
  uploadProgress: number;
  uploadStatus: 'uploading' | 'uploaded' | 'upscaling' | 'completed' | 'error';
  name: string;
  size: number;
}

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed';