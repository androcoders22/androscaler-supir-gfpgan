import { useState, useCallback } from 'react';
import { UploadedImage } from '@/types';

// Demo upscaled images (placeholder URLs)
const DEMO_UPSCALED_URLS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200',
];

export const useImageUploader = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);

  const addFiles = useCallback((files: File[]) => {
    const newImages: UploadedImage[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      originalUrl: URL.createObjectURL(file),
      uploadProgress: 0,
      uploadStatus: 'uploading',
      name: file.name,
      size: file.size,
    }));

    setImages(prev => [...prev, ...newImages]);

    // Simulate concurrent uploads
    newImages.forEach((image, index) => {
      simulateUpload(image.id, index * 500); // Stagger uploads slightly
    });
  }, []);

  const simulateUpload = useCallback((imageId: string, delay: number = 0) => {
    setTimeout(() => {
      let progress = 0;
      const uploadInterval = setInterval(() => {
        progress += Math.random() * 20 + 5; // Random progress increment
        
        if (progress >= 100) {
          clearInterval(uploadInterval);
          
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, uploadProgress: 100, uploadStatus: 'uploaded' }
              : img
          ));

          // Start upscaling after upload completes
          setTimeout(() => {
            simulateUpscaling(imageId);
          }, 500);
        } else {
          setImages(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, uploadProgress: Math.min(progress, 100) }
              : img
          ));
        }
      }, 200);
    }, delay);
  }, []);

  const simulateUpscaling = useCallback((imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, uploadStatus: 'upscaling' }
        : img
    ));

    // Simulate upscaling process (2-4 seconds)
    const upscalingDuration = Math.random() * 2000 + 2000;
    
    setTimeout(() => {
      const randomUpscaledUrl = DEMO_UPSCALED_URLS[Math.floor(Math.random() * DEMO_UPSCALED_URLS.length)];
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              uploadStatus: 'completed',
              upscaledUrl: randomUpscaledUrl 
            }
          : img
      ));
    }, upscalingDuration);
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === imageId);
      if (image?.originalUrl) {
        URL.revokeObjectURL(image.originalUrl);
      }
      return prev.filter(img => img.id !== imageId);
    });
    
    if (expandedImageId === imageId) {
      setExpandedImageId(null);
    }
  }, [expandedImageId]);

  const toggleExpanded = useCallback((imageId: string) => {
    setExpandedImageId(prev => prev === imageId ? null : imageId);
  }, []);

  const resetAll = useCallback(() => {
    images.forEach(image => {
      if (image.originalUrl) {
        URL.revokeObjectURL(image.originalUrl);
      }
    });
    setImages([]);
    setExpandedImageId(null);
  }, [images]);

  return {
    images,
    expandedImageId,
    addFiles,
    removeImage,
    toggleExpanded,
    resetAll,
  };
};