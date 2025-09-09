import axios from 'axios';

const API_BASE = 'http://45.194.3.227:8000';
const COLOR_GRADE_API = 'http://45.194.3.227:8001/process-image/';

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
    const response = await api.post('/upscale/', { image_url: imageUrl });
    return response.data;
  },

  async colorGrade(imageUrl: string): Promise<ColorGradeResponse> {
    const response = await axios.post(COLOR_GRADE_API, {
      image_link: imageUrl
    });
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