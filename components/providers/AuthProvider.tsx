"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/stores/auth.store"
import { getQueryClient } from "@/components/providers/QueryProvider"
import { refreshAccessToken } from "@/lib/api"

// SEC-3 FIX: Made atob() call base64url-safe.
// JWTs use base64url encoding (- instead of +, _ instead of /, no padding).
// atob() requires standard base64, so we convert: replace - → +, _ → /, then
// pad to a multiple of 4 before calling atob(). This matches the same decode
// logic used in middleware.ts and prevents silent JSON.parse failures for tokens
// whose payload contains those characters.
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    const payload = JSON.parse(atob(padded))
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return true
    if (!payload.exp) return false
    const exp = Number(payload.exp)
    if (!Number.isFinite(exp) || exp <= 0) return true
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function forceLogout(message: string) {
  toast.info(message)
  getQueryClient()?.clear()
  useAuthStore.getState().logout()
  window.location.href = '/login?session=expired'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isLoading = useAuthStore((s) => s.isLoading)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    // ── Bootstrap: runs once on mount ────────────────────────────────────
    // Handles all possible auth states in the correct priority order.
    async function bootstrap() {
      const state = useAuthStore.getState()

      // ── 1. Has in-memory token but it's already expired ──────────────
      // This catches the edge case where the user kept the tab open across
      // a device sleep/suspend long enough for the JWT to expire.
      if (state.isAuthenticated && state.accessToken && isTokenExpired(state.accessToken)) {
        forceLogout("Sesi Anda telah berakhir. Silakan login kembali.")
        return
      }

      // ── 2. 8-hour activity-based session timeout ──────────────────────
      if (state.isAuthenticated && state.isSessionExpired()) {
        forceLogout("Sesi tidak aktif selama 8 jam. Silakan login kembali.")
        return
      }

      // ── 3. Hard-refresh / tab restore: authenticated but no access token ─
      // accessToken is NEVER persisted to localStorage (C-01 security fix:
      // no XSS surface). After a hard refresh the Zustand store rehydrates
      // with isAuthenticated=true but accessToken=null.
      //
      // onRehydrateStorage (auth.store.ts) intentionally keeps isLoading=true
      // in this case so no React Query hooks fire before we restore the token.
      //
      // We call /auth/refresh directly (bare axios, not the api instance) to
      // exchange the HttpOnly refresh cookie for a new access token. If the
      // cookie is expired/missing the user is sent to login.
      if (state.isAuthenticated && !state.accessToken) {
        try {
          const newToken = await refreshAccessToken()
          state.setAccessToken(newToken)
          state.refreshActivity()
          // Token restored — fall through to setLoading(false) below.
        } catch {
          // Refresh cookie expired or invalid → must re-authenticate.
          // Do NOT show a toast here: the user didn't explicitly "do" anything,
          // so a silent redirect is less jarring than a surprise toast.
          getQueryClient()?.clear()
          await state.logout()
          window.location.href = '/login?session=expired'
          return
        }
      }

      // ── All checks passed — allow queries to fire ─────────────────────
      setLoading(false)
    }

    bootstrap()

    // ── Activity tracking ─────────────────────────────────────────────────
    // M-1 FIX: keydown is handled by AppShell to avoid double-registration.
    // mousemove / pointerdown / scroll / touchstart are registered here only.
    const ACTIVITY_EVENTS = ["mousemove", "pointerdown", "scroll", "touchstart"] as const
    const handleActivity = () => useAuthStore.getState().refreshActivity()
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }))

    // H-03 FIX: Periodically check session expiry (every 60s) so long-open tabs
    // are logged out without needing a page reload or navigation event.
    const sessionCheckInterval = setInterval(() => {
      const s = useAuthStore.getState()
      if (s.isAuthenticated && s.isSessionExpired()) {
        forceLogout("Sesi tidak aktif selama 8 jam. Silakan login kembali.")
      }
    }, 60_000)

    // H-10 FIX: Listen for storage changes from other tabs so logout in tab A
    // also logs out tab B immediately (cross-tab logout synchronization).
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kahade-auth' && !e.newValue) {
        getQueryClient()?.clear()
        useAuthStore.getState().logout()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity))
      clearInterval(sessionCheckInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [setLoading])

  // H-09 FIX: Use aria-busy instead of aria-hidden.
  // M-2 FIX: Show centered spinner during loading instead of invisible white screen.
  if (isLoading) {
    return (
      <div
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-busy="true"
        aria-label="Memuat aplikasi..."
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid #e5e7eb',
          borderTopColor: '#111827',
          animation: 'spin 0.75s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div
      style={{ opacity: 1, transition: 'opacity 0.1s ease-in', minHeight: '100vh' }}
      aria-busy={false}
    >
      {children}
    </div>
  )
}
