import axios from 'axios';
import { File, FileFilters, StorageStats } from '../types/file';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const fileService = {
  async uploadFile(file: FormData): Promise<File> {
    const response = await axios.post(`${API_URL}/files/`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getFiles(filters: FileFilters = {}): Promise<File[]> {
    console.log('Fetching files with filters:', filters);
    const response = await axios.get(`${API_URL}/files/`, {
      params: filters,
    });
    return response.data;
  },

  async deleteFile(id: string): Promise<void> {
    await axios.delete(`${API_URL}/files/${id}/`);
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  },

  async getStorageStats(): Promise<StorageStats> {
    const response = await axios.get(`${API_URL}/files/storage_statistics/`);
    return response.data;
  },
}; 