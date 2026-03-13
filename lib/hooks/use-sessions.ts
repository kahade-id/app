'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { sessionService } from '@/lib/services/session.service'
import { useAuthStore } from '@/lib/stores/auth.store'

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

  return useMutation({
    mutationFn: sessionService.revokeAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Semua sesi telah dihapus. Silakan login kembali.')
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
