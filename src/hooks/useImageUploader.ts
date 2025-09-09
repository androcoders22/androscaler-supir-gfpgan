import { useState, useCallback } from 'react';
import { UploadedImage } from '@/types';
import { apiService } from '@/services/api';

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
      folderName: `folder_${Date.now()}_${index}`,
      startTime: Date.now(),
      originalFileName: file.name,
    }));

    setImages(prev => [...prev, ...newImages]);

    newImages.forEach((image) => {
      setTimeout(() => processImage(image.id), 100);
    });
  }, []);

  const processImage = useCallback(async (imageId: string) => {
    try {
      let currentImage: UploadedImage | undefined;
      setImages(prev => {
        currentImage = prev.find(img => img.id === imageId);
        return prev.map(img =>
          img.id === imageId ? { ...img, uploadProgress: 25, uploadStatus: 'uploading' as const } : img
        );
      });

      if (!currentImage) return;

      const uploadResult = await apiService.uploadImage(currentImage.file, currentImage.folderName!);
      console.log('✅ UPLOAD DONE:', uploadResult.view_url);

      setImages(prev => prev.map(img =>
        img.id === imageId ? {
          ...img,
          uploadProgress: 50,
          uploadStatus: 'color-grading' as const,
          apiOriginalUrl: uploadResult.view_url
        } : img
      ));

      const colorGradeResult = await apiService.colorGrade(uploadResult.view_url);
      console.log('✅ COLOR GRADING DONE:', colorGradeResult.view_url);

      setImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, uploadProgress: 70, uploadStatus: 'upscaling' as const } : img
      ));

      const upscaleResult = await apiService.upscaleImage(colorGradeResult.view_url);
      console.log('✅ UPSCALE DONE:', upscaleResult.upscaled_url);

      setImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, uploadProgress: 85, uploadStatus: 'uploading' as const } : img
      ));

      const fixResult = await apiService.fixImageMetadata(uploadResult.view_url, upscaleResult.upscaled_url);
      console.log('✅ FIX METADATA DONE:', fixResult.final_image.view_url);

      setImages(prev => prev.map(img => {
        if (img.id === imageId) {
          const processingTime = img.startTime ? Math.round((Date.now() - img.startTime) / 1000) : 0;
          return {
            ...img,
            uploadProgress: 100,
            uploadStatus: 'completed' as const,
            upscaledUrl: fixResult.final_image.view_url,
            processingTime
          };
        }
        return img;
      }));
    } catch (error) {
      console.error('❌ ERROR:', error);
      setImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, uploadStatus: 'error' as const } : img
      ));
    }
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