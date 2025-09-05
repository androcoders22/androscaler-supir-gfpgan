import axios from 'axios';

const API_BASE = 'http://45.194.3.227:8000';

export interface UploadResponse {
  view_url: string;
  folder_name: string;
}

export interface UpscaleResponse {
  message: string;
  upscaled_url: string;
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 0, // No timeout
});

export const apiService = {
  async uploadImage(file: File, folderName: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_name', folderName);

    const response = await api.post('/image_upload/', formData);
    return response.data;
  },

  async upscaleImage(imageUrl: string): Promise<UpscaleResponse> {
    const formData = new FormData();
    formData.append('image_url', imageUrl);

    const response = await api.post('/upscale/', formData);
    return response.data;
  },

  async colorGrade(imageUrl: string): Promise<UpscaleResponse> {
    const response = await api.post('/color_grade/', { image_url: imageUrl });
    return response.data;
  },

  async saveProcessedImage(processedUrl: string, folderName: string): Promise<UploadResponse> {
    const response = await api.post('/save_processed/', {
      processed_url: processedUrl,
      folder_name: folderName
    });
    return response.data;
  },
};