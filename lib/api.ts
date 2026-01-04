/**
 * API Configuration and Utility Functions
 * Handles environment-based API URL configuration for development and production
 */

// API Base URL Configuration
const getApiBaseUrl = (): string => {
  // In production, use the environment variable or fallback to Render URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://breast-cancer-detection-using-ml-okdd.onrender.com';
  }
  
  // In development, use local backend
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // ML Prediction endpoints
  PREDICT_IMAGE: '/predict/image',
  PREDICT_TABULAR: '/predict/tabular',
  PREDICT_MULTIMODAL: '/predict/multimodal',
  
  // Results endpoints
  RESULTS: '/results',
  RESULTS_SHARE: '/results/share',
  
  // Health check
  HEALTH: '/',
} as const;

/**
 * Create full API URL
 */
export const createApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * API Request Configuration
 */
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Enhanced fetch wrapper with error handling and timeout
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000, // 30 seconds default timeout
  } = config;

  const url = createApiUrl(endpoint);
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
    
    throw new Error('Unknown API error occurred');
  }
};

/**
 * File upload wrapper for multipart/form-data requests
 */
export const apiUpload = async <T = any>(
  endpoint: string,
  formData: FormData,
  config: Omit<ApiRequestConfig, 'body'> = {}
): Promise<T> => {
  const {
    method = 'POST',
    headers = {},
    timeout = 60000, // 60 seconds for file uploads
  } = config;

  const url = createApiUrl(endpoint);
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        // Don't set Content-Type for FormData - let browser set it with boundary
        ...headers,
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout - please try again');
      }
      throw error;
    }
    
    throw new Error('Unknown upload error occurred');
  }
};

/**
 * Prediction API Functions
 */
export const predictionApi = {
  /**
   * Image prediction with file upload
   */
  predictImage: async (file: File, returnGradcam: boolean = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('return_gradcam', returnGradcam.toString());

    return apiUpload(API_ENDPOINTS.PREDICT_IMAGE, formData);
  },

  /**
   * Tabular data prediction
   */
  predictTabular: async (data: {
    radius_mean: number;
    texture_mean: number;
    perimeter_mean: number;
    area_mean: number;
    smoothness_mean: number;
    compactness_mean: number;
    concavity_mean: number;
    concave_points_mean: number;
    symmetry_mean: number;
    fractal_dimension_mean: number;
  }) => {
    return apiRequest(API_ENDPOINTS.PREDICT_TABULAR, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Multimodal prediction (image + tabular)
   */
  predictMultimodal: async (file: File, features: number[], returnShap: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('features', JSON.stringify(features));
    formData.append('return_shap', returnShap.toString());

    return apiUpload(API_ENDPOINTS.PREDICT_MULTIMODAL, formData);
  },
};

/**
 * Health check function
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await apiRequest(API_ENDPOINTS.HEALTH);
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Get API status information
 */
export const getApiStatus = async () => {
  try {
    const response = await apiRequest(API_ENDPOINTS.HEALTH);
    return {
      online: true,
      baseUrl: API_BASE_URL,
      environment: process.env.NODE_ENV,
      ...response,
    };
  } catch (error) {
    return {
      online: false,
      baseUrl: API_BASE_URL,
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Export for debugging
export const debugApi = {
  baseUrl: API_BASE_URL,
  environment: process.env.NODE_ENV,
  endpoints: API_ENDPOINTS,
};