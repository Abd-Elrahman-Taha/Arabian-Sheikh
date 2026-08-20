/**
 * Arabian Sheikh - Enterprise HTTP API Client
 * 
 * Provides centralized network request handling, automatic JWT Bearer token injection,
 * query parameter serialization, timeout management, response normalization, and error interceptors.
 */

// Custom API Error Class
export class ApiError extends Error {
  constructor(message, status = 500, data = null, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

// Token Storage Keys
export const TOKEN_KEY = 'arabian_sheikh_token';
export const REFRESH_TOKEN_KEY = 'arabian_sheikh_refresh_token';

// Token Management Utilities
export const tokenManager = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY) || null;
  },
  setToken: (token) => {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY) || null;
  },
  setRefreshToken: (token) => {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
};

// Configuration
const DEFAULT_TIMEOUT = 15000;
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const IS_MOCK_ENABLED = import.meta.env?.VITE_USE_MOCK_API === 'true';

/**
 * Builds full URL with path and query parameters
 */
function buildUrl(endpoint, params = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${BASE_URL}${cleanEndpoint}`;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(`${key}[]`, v));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  if (queryString) {
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  return url;
}

/**
 * Core Request Method with Timeout & Interceptors
 */
async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    params = {},
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    signal: externalSignal = null,
    requiresAuth = true,
    isFormData = false
  } = options;

  const url = buildUrl(endpoint, params);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combine external abort signal if provided
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  // Request Headers
  const requestHeaders = new Headers(headers);

  if (!isFormData && !requestHeaders.has('Content-Type') && method !== 'GET') {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  // Inject Authorization Bearer Token
  if (requiresAuth) {
    const token = tokenManager.getToken();
    if (token && !requestHeaders.has('Authorization')) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const fetchOptions = {
    method,
    headers: requestHeaders,
    signal: controller.signal
  };

  if (body) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // Parse Response Body
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }

    // Handle HTTP Error Codes
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
      const errorCode = data?.code || `HTTP_${response.status}`;

      // Global Interceptor: 401 Unauthorized
      if (response.status === 401) {
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { endpoint } }));
        }
      }

      throw new ApiError(errorMessage, response.status, data, errorCode);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection.', 408, null, 'TIMEOUT');
    }

    if (err instanceof ApiError) {
      throw err;
    }

    // Network / Offline Error
    throw new ApiError(
      err.message || 'Unable to connect to Arabian Sheikh API. Please verify server connectivity.',
      0,
      null,
      'NETWORK_ERROR'
    );
  }
}

// Exported REST API Client Methods
export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  upload: (endpoint, formData, options = {}) => request(endpoint, { ...options, method: 'POST', body: formData, isFormData: true }),
  getBaseUrl: () => BASE_URL,
  isMockEnabled: () => IS_MOCK_ENABLED
};

export default apiClient;
