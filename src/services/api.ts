import axios from 'axios';

const API_BASE = 'https://upscaler.mfdcmaharashtra.co.in';
const COLOR_GRADE_API = 'https://color.mfdcmaharashtra.co.in';
const FIX_IMAGE_API = 'https://color.mfdcmaharashtra.co.in/fix-image-misc';

export interface UploadResponse {
  view_url: string;
  folder_name: string;
}

export interface UpscaleResponse {
  message: string;
  upscaled_url: string;
}

export interface ColorGradeResponse {
  message: string;
  view_url: string;
}

export interface FixImageResponse {
  final_image: {
    message: string;
    view_url: string;
  };
}

const api = axios.create({
  baseURL: API_BASE,
});

export const apiService = {
  async uploadImage(file: File, folderName: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_name', folderName);

    const response = await api.post('/image_upload', formData);
    return response.data;
  },

  async upscaleImage(imageUrl: string): Promise<UpscaleResponse> {
    const response = await api.post('/upscale', { image_url: imageUrl });
    return response.data;
  },

  async colorGrade(imageUrl: string): Promise<ColorGradeResponse> {
    const response = await axios.post(`${COLOR_GRADE_API}/process-image`, {
      image_link: imageUrl
    });
    return response.data;
  },

  async saveProcessedImage(processedUrl: string, folderName: string): Promise<UploadResponse> {
    const response = await api.post('/save_processed', {
      processed_url: processedUrl,
      folder_name: folderName
    });
    return response.data;
  },

  async fixImageMetadata(beforeUrl: string, afterUrl: string): Promise<FixImageResponse> {
    const response = await axios.post(FIX_IMAGE_API, {
      before: beforeUrl,
      after: afterUrl
    });
    return response.data;
  },
};