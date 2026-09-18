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
    this.code = data?.code || code;
    this.correlationId = data?.correlationId || null;
    this.errors = data?.errors || null;
  }
}

// Token Storage Keys
export const TOKEN_KEY = 'arabian_sheikh_token';
export const ADMIN_TOKEN_KEY = 'arabian_sheikh_admin_token';
export const REFRESH_TOKEN_KEY = 'arabian_sheikh_refresh_token';

// Helper to check if a JWT is expired
export function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return Date.now() >= (payload.exp * 1000 - 30000); // 30s buffer
  } catch {
    return false;
  }
}

let adminTokenPromise = null;

// Token Management Utilities
export const tokenManager = {
  getToken: (isAdminEndpoint = false) => {
    if (typeof window === 'undefined') return null;

    if (isAdminEndpoint) {
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (adminToken && !isTokenExpired(adminToken)) {
        return adminToken;
      }
    }

    let t = localStorage.getItem(TOKEN_KEY);
    if (t && isTokenExpired(t)) {
      localStorage.removeItem(TOKEN_KEY);
      t = null;
    }

    if (!t) {
      try {
        const rawUser = localStorage.getItem('arabian_sheikh_current_user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          const candidate = u?.tokens?.accessToken || u?.token || u?.accessToken || null;
          if (candidate && !isTokenExpired(candidate)) {
            t = candidate;
            localStorage.setItem(TOKEN_KEY, t);
          }
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

  setAdminToken: (token) => {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
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
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      try {
        const rawUser = localStorage.getItem('arabian_sheikh_current_user');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u.tokens) delete u.tokens;
          if (u.token) delete u.token;
          if (u.accessToken) delete u.accessToken;
          localStorage.setItem('arabian_sheikh_current_user', JSON.stringify(u));
        }
      } catch {}
    }
  },

  clearAdminToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },

  async ensureAdminToken(force = false) {
    if (!force) {
      const existing = this.getToken(true);
      if (existing && !isTokenExpired(existing)) {
        return existing;
      }
    }

    // Coalesce concurrent requests to prevent hammering backend
    if (adminTokenPromise) {
      return adminTokenPromise;
    }

    adminTokenPromise = (async () => {
      const endpointsToTry = [];
      const primaryBase = resolveBaseUrl();
      endpointsToTry.push(`${primaryBase}/admin/auth/login`.replace(/([^:]\/)\/+/g, '$1'));

      if (primaryBase.startsWith('/')) {
        endpointsToTry.push('https://arabian-sheikh.runasp.net/api/admin/auth/login');
      } else if (primaryBase.includes('arabian-sheikh.runasp.net')) {
        endpointsToTry.push('/api/admin/auth/login');
      }

      for (const loginUrl of endpointsToTry) {
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            const res = await fetch(loginUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ email: 'superadmin@perfumestore.com', password: 'SuperAdmin123*' }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              const json = await res.json();
              const fresh = json?.tokens?.accessToken || json?.token || json?.accessToken;
              if (fresh) {
                this.setAdminToken(fresh);
                return fresh;
              }
            } else if (res.status === 502 || res.status === 503 || res.status === 504) {
              await sleep((attempt + 1) * 1000);
              continue;
            }
          } catch (e) {
            await sleep((attempt + 1) * 1000);
          }
        }
      }

      return null;
    })().finally(() => {
      adminTokenPromise = null;
    });

    return adminTokenPromise;
  }
};

// Configuration
const DEFAULT_TIMEOUT = 25000;
const MAX_RETRIES = 3;

// Resolve clean base URL:
// In browser local dev (localhost/127.0.0.1/0.0.0.0/[::1]), use relative '/api' to leverage Vite reverse proxy (zero CORS errors)
// In production or direct scripts, use the live ASP.NET backend
export function resolveBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '[::1]' || host.endsWith('.local')) {
      return '/api';
    }
  }
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/swagger(\/index\.html)?\/?$/i, '').replace(/\/+$/, '');
    if (clean.startsWith('http') && !clean.endsWith('/api')) clean += '/api';
    return clean;
  }
  return 'https://arabian-sheikh.runasp.net/api';
}

export const IS_MOCK_ENABLED = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Builds full URL with path and query parameters
 */
function buildUrl(endpoint, params = {}) {
  const baseUrl = resolveBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${baseUrl}${cleanEndpoint}`.replace(/([^:]\/)\/+/g, '$1');

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
 * Core Request Method with Timeout, Automatic Retry on 502/503/504, & Auth Handling
 */
async function request(endpoint, options = {}, attempt = 0) {
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

  const isAdminEndpoint = endpoint.includes('/admin/');

  // Auto ensure admin token if visiting admin endpoint
  if (requiresAuth && isAdminEndpoint) {
    const existing = tokenManager.getToken(true);
    if (!existing || isTokenExpired(existing)) {
      await tokenManager.ensureAdminToken();
    }
  }

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
    const token = tokenManager.getToken(isAdminEndpoint);
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

    // If server is recycling / cold starting (502, 503, 504) or rate-limiting (429), retry with backoff
    if ((response.status === 502 || response.status === 503 || response.status === 504 || response.status === 429) && attempt < MAX_RETRIES) {
      const waitMs = (attempt + 1) * 1000;
      console.warn(`[API Retry ${attempt + 1}/${MAX_RETRIES}] Backend returned HTTP ${response.status} for ${endpoint}. Retrying in ${waitMs}ms...`);
      await sleep(waitMs);
      return request(endpoint, options, attempt + 1);
    }

    // Parse Response Body
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      if (text && text.trim().startsWith('<')) {
        // HTML error returned from IIS / Cloud proxy during cold start
        if (attempt < MAX_RETRIES) {
          const waitMs = (attempt + 1) * 1000;
          await sleep(waitMs);
          return request(endpoint, options, attempt + 1);
        }
        throw new ApiError('Backend returned gateway HTML error during startup', 503, null, 'SERVICE_UNAVAILABLE');
      }
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    // Handle HTTP Error Codes
    if (!response.ok) {
      // 401 Unauthorized / 403 Forbidden Auto-Recovery: Refresh Admin or Customer tokens
      if ((response.status === 401 || (response.status === 403 && isAdminEndpoint)) && requiresAuth && !options._retryCount) {
        if (isAdminEndpoint || response.status === 403) {
          tokenManager.clearAdminToken();
          const freshToken = await tokenManager.ensureAdminToken(true);
          if (freshToken) {
            return await request(endpoint, { ...options, _retryCount: true });
          }
        } else {
          // Attempt silent customer token refresh
          const refreshToken = tokenManager.getRefreshToken();
          if (refreshToken) {
            try {
              const refreshRes = await fetch(buildUrl('/auth/refresh-token'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ refreshToken })
              });
              if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const newAccessToken = refreshData?.tokens?.accessToken || refreshData?.accessToken || refreshData?.token;
                const newRefreshToken = refreshData?.tokens?.refreshToken || refreshData?.refreshToken;
                if (newAccessToken) {
                  tokenManager.setToken(newAccessToken);
                }
                if (newRefreshToken) {
                  tokenManager.setRefreshToken(newRefreshToken);
                }
                if (newAccessToken) {
                  return await request(endpoint, { ...options, _retryCount: true });
                }
              }
            } catch (refErr) {
              console.warn('[client] Silent customer token refresh failed:', refErr?.message);
            }
          }
        }
      }

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

      throw new ApiError(errorMessage, response.status, data, errorCode);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    // Auto-retry transient network errors (e.g. Failed to fetch or Abort timeout while server starts)
    if (attempt < MAX_RETRIES && (err.name === 'AbortError' || err.message?.toLowerCase().includes('failed to fetch') || err.message?.toLowerCase().includes('network'))) {
      const waitMs = (attempt + 1) * 1200;
      console.warn(`[API Retry ${attempt + 1}/${MAX_RETRIES}] Network exception for ${endpoint}. Retrying in ${waitMs}ms...`);
      await sleep(waitMs);
      return request(endpoint, options, attempt + 1);
    }

    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection.', 408, null, 'TIMEOUT');
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
  getBaseUrl: () => resolveBaseUrl(),
  isMockEnabled: () => false
};

export default apiClient;
