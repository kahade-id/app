"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/stores/auth.store"
import { getQueryClient } from "@/components/providers/QueryProvider"

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const isLoading = useAuthStore((s) => s.isLoading)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    const { accessToken, isAuthenticated, logout, isSessionExpired, refreshActivity } = useAuthStore.getState()

    if (isAuthenticated && accessToken && isTokenExpired(accessToken)) {
      // UX-012 FIX: Show toast so user understands why they're being redirected to login
      toast.info("Sesi Anda telah berakhir. Silakan login kembali.")
      getQueryClient()?.clear()
      logout()
      // Redirect to login so user must re-authenticate; prevents broken state where
      // local auth is cleared but server-side refresh cookie is still valid.
      window.location.href = '/login?session=expired'
      return
    }

    // #26 FIX: Periksa session timeout 8 jam (activity-based) bukan hanya JWT expiry
    if (isAuthenticated && isSessionExpired()) {
      toast.info("Sesi tidak aktif selama 8 jam. Silakan login kembali.")
      getQueryClient()?.clear()
      logout()
      window.location.href = '/login?session=expired'
      return
    }

    setLoading(false)

    // M-1 FIX: Removed keydown listener from AuthProvider — AppShell already registers
    // click + keydown activity listeners. Having both caused double-registration of keydown,
    // resulting in refreshActivity() being called twice per keystroke.
    const ACTIVITY_EVENTS = ["mousemove", "pointerdown", "scroll", "touchstart"] as const
    const handleActivity = () => refreshActivity()
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }))

    // H-03 FIX: Periodically check session expiry (every 60s) so long-open tabs
    // are logged out without needing a page reload or navigation event.
    const sessionCheckInterval = setInterval(() => {
      const state = useAuthStore.getState()
      if (state.isAuthenticated && state.isSessionExpired()) {
        toast.info("Sesi tidak aktif selama 8 jam. Silakan login kembali.")
        getQueryClient()?.clear()
        state.logout()
        window.location.href = '/login?session=expired'
      }
    }, 60_000)

    // H-10 FIX: Listen for storage changes from other tabs so logout in tab A
    // also logs out tab B immediately (cross-tab logout synchronization).
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kahade-auth' && !e.newValue) {
        // Another tab cleared auth storage (logged out)
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
  // Previously opacity:0 + minHeight:100vh made the page look hung with no feedback.
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
