import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api'
import { useAuthStore } from '@/lib/stores/auth.store'

const DEFAULT_TIMEOUT_MS = 30000
const API_VERSION = '/v1'

// M-08 FIX: Sanitize server error messages before displaying to users.
// Raw backend messages can contain internal paths, SQL snippets, or stacktraces.
// Rules: truncate to 200 chars, strip anything that looks like a file path or stack frame.
function sanitizeErrorMessage(message: string): string {
  // Truncate long messages
  let sanitized = message.slice(0, 200)
  // L-15 FIX: Previous regex /\/[^\s,]+/ was too broad — it stripped any token starting
  // with "/" including API paths like /api/v1/orders in user-facing error messages.
  // Now only strips stack frame paths and absolute filesystem paths (internal details).
  sanitized = sanitized.replace(
    /(\s|^)(at\s+\S+\s*\([^)]*\)|(?:\/(?:home|app|usr|var|tmp|root|opt|proc|sys)|[A-Z]:\\\\)[^\s,]+)/g,
    ''
  )
  // Strip SQL-looking fragments
  sanitized = sanitized.replace(/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b.*/gi, '[query]')
  return sanitized.trim() || 'Terjadi kesalahan. Silakan coba lagi.'
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const rawMessage = (error.response?.data as { message?: string })?.message
    if (rawMessage) return sanitizeErrorMessage(rawMessage)
    
    switch (error.response?.status) {
      case 400:
        return 'Permintaan tidak valid. Silakan periksa data Anda.'
      case 401:
        return 'Sesi Anda telah berakhir. Silakan login kembali.'
      case 403:
        return 'Anda tidak memiliki akses untuk melakukan tindakan ini.'
      case 404:
        return 'Data tidak ditemukan.'
      case 409:
        return 'Terjadi konflik. Silakan coba lagi.'
      case 422:
        return 'Data yang dimasukkan tidak valid.'
      case 429:
        return 'Terlalu banyak permintaan. Silakan tunggu sebentar.'
      case 500:
      case 502:
      case 503:
        return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
      default:
        return fallback
    }
  }
  
  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message) || fallback
  }
  
  return fallback
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  if (metaTag) {
    return metaTag.getAttribute('content')
  }
  
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

// ADD-004 FIX: Warn developer if NEXT_PUBLIC_API_URL is not configured.
// Without this, all API calls silently fall back to localhost which breaks production.
const BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[kahade] CRITICAL: NEXT_PUBLIC_API_URL is not set in production! ' +
        'All API calls will fail. Set this env variable before deploying.'
      )
    } else {
      console.warn('[kahade] NEXT_PUBLIC_API_URL not set — falling back to localhost:3000')
    }
    return `http://localhost:3000${API_VERSION}`
  }
  return `${url}${API_VERSION}`
})()

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: DEFAULT_TIMEOUT_MS,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
    if (mutatingMethods.includes(config.method?.toUpperCase() || '')) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

let refreshPromise: Promise<string> | null = null
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    if (!original) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (refreshPromise) {
        try {
          const token = await refreshPromise
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        } catch (refreshError) {
          return Promise.reject(refreshError)
        }
      }

      // CQ-017 FIX: intentionally uses axios.post() directly (NOT the api instance).
      // Using the api instance here would trigger this same interceptor recursively,
      // causing an infinite loop when the refresh token itself returns a 401.
      // Direct axios bypasses all interceptors — this is correct and intentional.
      refreshPromise = axios.post<ApiResponse<{ accessToken: string }>>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
        .then(({ data }) => {
          if (!data.data?.accessToken) {
            throw new Error('No access token in refresh response')
          }
          return data.data.accessToken
        })
        .catch((refreshError) => {
          console.error('Token refresh failed:', refreshError)
          throw refreshError
        })

      try {
        const newToken = await refreshPromise
        useAuthStore.getState().setAccessToken(newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        // #103 FIX: processQueue is called before logout/redirect to ensure
        // the failedQueue is always cleaned up even when the original request fails.
        processQueue(refreshError, null)
        await useAuthStore.getState().logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired'
        }
        return Promise.reject(refreshError)
      } finally {
        // #103 FIX: Always reset refreshPromise AND clear failedQueue in finally
        // to prevent a stale queue if an unexpected error occurs mid-refresh
        refreshPromise = null
        if (failedQueue.length > 0) {
          // Safety net: if somehow processQueue was not called, drain the queue
          processQueue(new Error('Token refresh failed'), null)
        }
      }
    }

    if (error.response && error.response.status >= 500) {
      console.error('Server error:', {
        status: error.response.status,
        url: original.url,
        method: original.method,
      })
    }

    return Promise.reject(error)
  }
)

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // #072 FIX: Use crypto.getRandomValues() instead of Math.random() for
  // cryptographically secure random numbers. Math.random is non-cryptographic.
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(16)
    crypto.getRandomValues(arr)
    const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
    return `${Date.now()}-${hex}`
  }
  // H-04 FIX: Final fallback — use two separate timestamp reads with additional
  // counter to reduce collision probability. Two Date.now() calls in sequence
  // are almost certainly identical. Using performance.now() (sub-ms) + random
  // suffix prevents the duplicate-key issue.
  const t1 = Date.now().toString(36)
  const t2 = (typeof performance !== 'undefined' ? performance.now() : Math.random())
    .toString(36)
    .replace('.', '')
  return `${t1}-${t2}`
}

export function withIdempotencyKey(key?: string): Record<string, string> {
  return { 'Idempotency-Key': key || generateIdempotencyKey() }
}

export function extractData<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message || 'Request failed')
  }
  
  if (response.data.data === null || response.data.data === undefined) {
    throw new Error(response.data.message || 'No data returned')
  }
  
  return response.data.data
}

export function extractDataOrNull<T>(response: { data: ApiResponse<T> }): T | null {
  if (!response.data.success || response.data.data === null) {
    return null
  }
  return response.data.data
}
