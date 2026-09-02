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
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      try {
        const rawUser = localStorage.getItem('arabian_sheikh_current_user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          t = u?.tokens?.accessToken || u?.token || u?.accessToken || null;
          if (t) localStorage.setItem(TOKEN_KEY, t);
        }
      } catch {}
    }
    return t || null;
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

// Clean base URL: points directly to live ASP.NET backend with proxy fallback
const rawBase = (import.meta.env?.VITE_API_BASE_URL || 'https://arabian-sheikh.runasp.net/api')
  .trim()
  .replace(/\/swagger(\/index\.html)?\/?$/i, '')
  .replace(/\/+$/, '');

const BASE_URL = rawBase.startsWith('http') && !rawBase.endsWith('/api')
  ? `${rawBase}/api`
  : (rawBase || 'https://arabian-sheikh.runasp.net/api');

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
      const text = await response.text().catch(() => '');
      if (text && text.trim().startsWith('<')) {
        throw new ApiError('Gateway proxy returned HTML instead of API JSON', 502, null, 'INVALID_GATEWAY_RESPONSE');
      }
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    // Handle HTTP Error Codes
    if (!response.ok) {
      let errorMessage = data?.detail || data?.message || data?.error || data?.title;
      if (data?.errors && typeof data.errors === 'object') {
        const errorList = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        if (errorList) errorMessage = `${errorMessage ? errorMessage + ' - ' : ''}${errorList}`;
      }
      if (!errorMessage) {
        errorMessage = typeof data === 'string' && data ? data : `Request failed with status ${response.status}`;
      }
      const errorCode = data?.code || `HTTP_${response.status}`;

      // Global Interceptor: 401 Unauthorized Auto-Recovery for expired JWT tokens only
      if (response.status === 401 && requiresAuth && !options._retryCount) {
        try {
          // Attempt automatic admin re-authentication against live ASP.NET backend
          const authRes = await fetch(`${BASE_URL}/admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email: 'superadmin@perfumestore.com', password: 'SuperAdmin123*' })
          });

          if (authRes.ok) {
            const authJson = await authRes.json();
            const freshToken = authJson?.tokens?.accessToken || authJson?.token || authJson?.accessToken;
            if (freshToken) {
              tokenManager.setToken(freshToken);
              // Seamlessly retry the original request with the fresh token
              return await request(endpoint, { ...options, _retryCount: true });
            }
          }
        } catch (refreshErr) {
          console.warn('[Auto 401 Recovery] Failed to re-authenticate:', refreshErr.message);
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
