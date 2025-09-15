import { useState, useCallback, useRef } from "react";
import { UploadedImage } from "@/types";
import { apiService } from "@/services/api";

// We keep a per-hook queue instead of global so multiple pipelines can run independently
export const useImageUploader = (pipeline: "upscale" | "color") => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const queueRef = useRef<UploadedImage[]>([]);

  const processNext = async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    const image = queueRef.current.shift()!;

    try {
      console.log("🚀 Processing:", image.name);

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, uploadProgress: 25, uploadStatus: "uploading" as const }
            : img
        )
      );

      const uploadResult = await apiService.uploadImage(
        image.file,
        image.folderName!
      );
      console.log("✅ UPLOAD DONE", uploadResult);

      if (image.pipeline === "color") {
        // COLOR PIPELINE: Upload -> Color Grade -> Fix
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploadProgress: 50,
                  uploadStatus: "color-grading" as const,
                  apiOriginalUrl: uploadResult.view_url,
                }
              : img
          )
        );

        const colorGradeResult = await apiService.colorGrade(
          uploadResult.view_url
        );
        console.log("✅ COLOR GRADING DONE", colorGradeResult);

        // Save processed (optional future) or go directly to fix metadata
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploadProgress: 75,
                  uploadStatus: "uploading" as const,
                  // In color pipeline, treat color graded version as 'upscaledBeforeResize'
                  upscaledBeforeResizeUrl: colorGradeResult.view_url,
                  upscaledUrl: img.upscaledUrl || colorGradeResult.view_url,
                }
              : img
          )
        );

        const fixResult = await apiService.fixImageMetadata(
          uploadResult.view_url,
          colorGradeResult.view_url
        );
        console.log("✅ FIX METADATA DONE", fixResult);

        setImages((prev) =>
          prev.map((img) => {
            if (img.id === image.id) {
              const processingTime = img.startTime
                ? Math.round((Date.now() - img.startTime) / 1000)
                : 0;
              const finalUrl =
                fixResult?.final_image?.view_url ||
                img.upscaledUrl ||
                img.upscaledBeforeResizeUrl;
              return {
                ...img,
                uploadProgress: 100,
                uploadStatus: "completed" as const,
                upscaledUrl: finalUrl,
                processingTime,
              };
            }
            return img;
          })
        );
      } else {
        // UPSCALE PIPELINE: Upload -> Upscale -> Fix (no color grading first)
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploadProgress: 50,
                  uploadStatus: "upscaling" as const,
                  apiOriginalUrl: uploadResult.view_url,
                }
              : img
          )
        );

        const upscaleResult = await apiService.upscaleImage(
          uploadResult.view_url
        );
        console.log("✅ UPSCALE DONE", upscaleResult);

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploadProgress: 85,
                  uploadStatus: "uploading" as const,
                  upscaledBeforeResizeUrl: upscaleResult.upscaled_url,
                  upscaledUrl: img.upscaledUrl || upscaleResult.upscaled_url,
                }
              : img
          )
        );

        const fixResult = await apiService.fixImageMetadata(
          uploadResult.view_url,
          upscaleResult.upscaled_url
        );
        console.log("✅ FIX METADATA DONE", fixResult);

        setImages((prev) =>
          prev.map((img) => {
            if (img.id === image.id) {
              const processingTime = img.startTime
                ? Math.round((Date.now() - img.startTime) / 1000)
                : 0;
              const finalUrl =
                fixResult?.final_image?.view_url ||
                img.upscaledUrl ||
                img.upscaledBeforeResizeUrl;
              if (!finalUrl) {
                console.warn(
                  "⚠️ No final URL found for image",
                  image.id,
                  fixResult
                );
              }
              return {
                ...img,
                uploadProgress: 100,
                uploadStatus: "completed" as const,
                upscaledUrl: finalUrl,
                processingTime,
              };
            }
            return img;
          })
        );
      }
    } catch (error) {
      console.error("❌ ERROR:", error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, uploadStatus: "error" as const } : img
        )
      );
    } finally {
      isProcessingRef.current = false;
      setTimeout(() => processNext(), 100);
    }
  };

  const addFiles = useCallback(
    (files: File[]) => {
      const newImages: UploadedImage[] = files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        originalUrl: URL.createObjectURL(file),
        uploadProgress: 0,
        uploadStatus: "queued",
        name: file.name,
        size: file.size,
        folderName: `folder_${Date.now()}_${index}`,
        startTime: Date.now(),
        originalFileName: file.name,
        pipeline,
      }));

      setImages((prev) => [...prev, ...newImages]);
      queueRef.current.push(...newImages);
      processNext();
    },
    [pipeline]
  );

  const removeImage = useCallback(
    (imageId: string) => {
      setImages((prev) => {
        const image = prev.find((img) => img.id === imageId);
        if (image?.originalUrl) {
          URL.revokeObjectURL(image.originalUrl);
        }
        return prev.filter((img) => img.id !== imageId);
      });

      if (expandedImageId === imageId) {
        setExpandedImageId(null);
      }
    },
    [expandedImageId]
  );

  const toggleExpanded = useCallback((imageId: string) => {
    setExpandedImageId((prev) => (prev === imageId ? null : imageId));
  }, []);

  const resetAll = useCallback(() => {
    images.forEach((image) => {
      if (image.originalUrl) {
        URL.revokeObjectURL(image.originalUrl);
      }
    });
    setImages([]);
    setExpandedImageId(null);
    queueRef.current = [];
    isProcessingRef.current = false;
  }, [images]);

  return {
    images,
    expandedImageId,
    addFiles,
    removeImage,
    toggleExpanded,
    resetAll,
    pipeline,
  };
};
