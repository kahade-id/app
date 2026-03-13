import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '@/types/auth'

// #202 — Session timeout: auto-logout after 8 hours of inactivity
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000 // 8 hours
const LAST_ACTIVE_KEY = 'kahade-last-active'

function updateLastActive(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
  }
}

// M-13 FIX: Use typeof localStorage check (same as updateLastActive) instead of
// typeof window to stay consistent with the rest of the store and prevent
// potential SSR crashes if isSessionExpired() is ever called server-side.
function isSessionExpired(): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY)
    if (!lastActive) return false
    return Date.now() - parseInt(lastActive, 10) > SESSION_TIMEOUT_MS
  } catch {
    return false
  }
}

const TOKEN_COOKIE_NAME = 'access_token'
const STORAGE_KEY = 'kahade-auth'

// C-02 FIX: setTokenCookie removed entirely. The access_token cookie MUST be
// set server-side with HttpOnly flag so JavaScript cannot read it (anti-XSS).
// Client JS should never set the auth cookie directly.

function removeTokenCookie(): void {
  // C-02 FIX: This only clears the non-HttpOnly fallback cookie (if any).
  // The real HttpOnly cookie is cleared by the server on the /auth/logout response.
  // We still attempt a client-side clear in case a non-HttpOnly cookie exists.
  if (typeof document === 'undefined') return
  try {
    document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`
    // Also clear with Secure flag in case it was set that way
    document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict; Secure`
  } catch (error) {
    console.error('Failed to remove auth cookie:', error)
  }
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: AuthUser) => void
  setAccessToken: (token: string) => void
  login: (user: AuthUser, token: string) => void
  logout: () => Promise<void>
  updateUser: (partial: Partial<AuthUser>) => void
  setLoading: (loading: boolean) => void
  isSessionExpired: () => boolean
  refreshActivity: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: true }),

      setAccessToken: (token) => {
        // #2 FIX: Hapus setTokenCookie() dari client-side. Cookie harus di-set
        // server-side dengan HttpOnly agar tidak bisa diakses oleh JS (anti-XSS).
        set({ accessToken: token })
      },

      login: (user, token) => {
        // #2 FIX: Tidak set cookie dari client-side — biarkan server yang set HttpOnly cookie.
        updateLastActive()
        set({ user, accessToken: token, isAuthenticated: true, isLoading: false })
      },

      logout: async () => {
        removeTokenCookie()
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(LAST_ACTIVE_KEY)
          } catch (error) {
            console.error('Failed to clear localStorage:', error)
          }
        }
        // CQ-012 FIX: Clear sessionStorage on logout to remove kahade_2fa_temp
        // that could persist from a previous 2FA session.
        // Use typeof window (same guard as localStorage block above) for consistency.
        if (typeof window !== 'undefined') {
          try { sessionStorage.clear() } catch { /* SSR safe */ }
        }
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
      },

      updateUser: (partial) => {
        const current = get().user
        if (current) {
          set({ user: { ...current, ...partial } })
        }
      },

      setLoading: (loading) =>
        set({ isLoading: loading }),

      isSessionExpired: () => isSessionExpired(),

      refreshActivity: () => updateLastActive(),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        user: state.user,
        // C-01 FIX: DO NOT persist accessToken to localStorage.
        // JWT in localStorage is readable by any JS (XSS vulnerability).
        // accessToken lives in Zustand memory only. On hard refresh, the token
        // is fetched via the /auth/refresh endpoint using the HttpOnly refresh
        // cookie that the server sets — this is the correct pattern.
        // The api interceptor handles the initial 401 → refresh → retry cycle.
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false)
        }
      },
    }
  )
)
