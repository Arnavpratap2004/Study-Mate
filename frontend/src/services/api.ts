import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

export interface UploadResponse {
  fileId: string;
  fileName: string;
  s3Url: string;
  keywords: string[];
  topics: string[];
  message: string;
}

export interface SearchResult {
  fileId: string;
  fileName: string;
  s3Url: string;
  keywords: string[];
  topics: string[];
  uploadDate: string;
  fileSize: number;
  error?: string;
}

export interface SearchResponse {
  keyword: string;
  totalResults: number;
  results: SearchResult[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  environment: {
    nodeEnv: string;
    awsRegion: string;
    s3Bucket: string;
    dynamoTable: string;
  };
}

// Upload PDF file
export const uploadPDF = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Search files by keyword
export const searchFiles = async (keyword: string): Promise<SearchResponse> => {
  const response = await api.get<SearchResponse>('/search', {
    params: { keyword },
  });

  return response.data;
};

// Get all files (for debugging)
export const getAllFiles = async (): Promise<{ totalFiles: number; files: SearchResult[] }> => {
  const response = await api.get<{ totalFiles: number; files: SearchResult[] }>('/files');
  return response.data;
};

// Health check
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
};

export default api;
