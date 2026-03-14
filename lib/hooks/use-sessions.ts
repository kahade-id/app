'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { sessionService } from '@/lib/services/session.service'
import { useAuthStore } from '@/lib/stores/auth.store'
import { authService } from '@/lib/services/auth.service'

export function useSessions() {
  // AUTH-003 FIX: Added isAuthenticated guard — session list is sensitive data
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionService.list().then((res) => res.data.data?.sessions ?? []),
    enabled: isAuthenticated,
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionService.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Sesi berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus sesi'))
    },
  })
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: sessionService.revokeAll,
    onSuccess: async () => {
      // AUTH-05 FIX: DELETE /sessions revokes ALL sessions including the current one.
      // Server has already invalidated the current session and refresh cookie.
      // We must: 1) call POST /auth/logout to clear the server-side refresh cookie,
      // 2) clear the query cache, 3) clear local auth state, 4) redirect to login.
      // Without this, the next API call gets 401, the interceptor tries /auth/refresh,
      // fails (cookie already revoked), then does a jarring redirect to login.
      try {
        await authService.logout()
      } catch {
        // Logout call may fail if session already fully expired — that's fine,
        // we still clear local state below.
      }
      queryClient.clear()
      await logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus semua sesi'))
    },
  })
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionService.revokeOthers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Semua sesi lain berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus sesi lain'))
    },
  })
}
