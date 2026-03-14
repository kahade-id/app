'use client'

import { useAuthStore } from '@/lib/stores/auth.store'

/**
 * Returns true only when the user is authenticated AND the auth bootstrap
 * (token restore via /auth/refresh on hard reload) has completed.
 *
 * Use this as the `enabled` guard on ALL authenticated React Query hooks
 * instead of bare `isAuthenticated`. Without the `!isLoading` check, queries
 * can fire immediately after Zustand rehydrates with isAuthenticated=true but
 * accessToken=null — before AuthProvider has had a chance to restore the token
 * via the HttpOnly refresh cookie. This causes 401s on every page load that
 * resolve only after the interceptor's refresh-and-retry cycle.
 *
 * @example
 *   const authReady = useAuthReady()
 *   return useQuery({ ..., enabled: authReady })
 *
 *   // With an additional condition:
 *   return useQuery({ ..., enabled: authReady && !!id })
 */
export function useAuthReady(): boolean {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  return isAuthenticated && !isLoading
}
