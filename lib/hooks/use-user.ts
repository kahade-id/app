'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { userService } from '@/lib/services/user.service'
import { useAuthStore } from '@/lib/stores/auth.store'
import type { PaginationParams } from '@/types/api'

export function useMe(options?: { refetchInterval?: number | false }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userService.getMe().then((res) => res.data.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: ({ data: res }) => {
      if (res.data) {
        updateUser(res.data)
      }
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Profil berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memperbarui profil'))
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userService.uploadAvatar,
    // #005 FIX: Removed premature toast.success from useUploadAvatar.
    // Upload only stages the file — the avatar isn't confirmed yet.
    // Toast is shown by useConfirmAvatar.onSuccess after the full flow completes.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengupload avatar'))
    },
  })
}

export function useConfirmAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userService.confirmAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Avatar berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengkonfirmasi avatar'))
    },
  })
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => userService.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Avatar berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus avatar'))
    },
  })
}

export function useUserStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => userService.getStats().then((res) => res.data.data),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  })
}

export function useDeleteRequest() {
  return useMutation({
    mutationFn: userService.deleteRequest,
    onSuccess: () => {
      toast.success('Permintaan penghapusan akun berhasil dikirim')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim permintaan penghapusan'))
    },
  })
}

export function useCheckAvailability() {
  return useMutation({
    mutationFn: userService.checkAvailability,
  })
}

// #064 FIX: Added JSDoc — consumers MUST apply debounce (e.g. useDebounce) before
// passing `query` to avoid per-keystroke API requests (10+ req/s on fast typing).
/**
 * Search users by query string.
 * ⚠️ IMPORTANT: Apply debounce to the `query` parameter before using this hook.
 * Without debounce every keystroke triggers an API request.
 * @example
 *   const debouncedQ = useDebounce(inputValue, 300)
 *   const { data } = useSearchUsers({ query: debouncedQ })
 */
export function useSearchUsers(params: { query: string; limit?: number }) {
  // H-5 FIX: Added isAuthenticated guard. Without it, query fires when params.query.length >= 2
  // even while unauthenticated — e.g. on the login/register pages.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['users', 'search', params],
    queryFn: () => userService.search(params).then((res) => res.data.data?.users ?? []),
    enabled: isAuthenticated && !!params.query && params.query.length >= 2,
  })
}

export function useUserDevices() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['user', 'devices'],
    queryFn: () => userService.getDevices().then((res) => res.data.data?.devices ?? []),
    enabled: isAuthenticated,
  })
}

export function useRemoveDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userService.removeDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'devices'] })
      toast.success('Perangkat berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus perangkat'))
    },
  })
}

// #017 FIX: Added enabled: isAuthenticated guard
export function useActivityLog(params?: PaginationParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['user', 'activity-log', params],
    queryFn: () => userService.getActivityLog(params).then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}

export function useUserProfile(username: string) {
  // H-4 FIX: Added isAuthenticated guard for pattern consistency with other hooks.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['user', 'profile', username],
    queryFn: () => userService.getProfile(username).then((res) => res.data.data),
    enabled: isAuthenticated && !!username,
  })
}

export function useUserRatings(username: string, params?: { page?: number; limit?: number }) {
  // H-4 FIX: Added isAuthenticated guard for pattern consistency.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['user', 'ratings', username, params],
    queryFn: () => userService.getUserRatings(username, params).then((res) => res.data.data),
    enabled: isAuthenticated && !!username,
  })
}

// L-5 FIX: useAuditLog is confirmed unused — no page or component imports it.
// Marked for removal. Delete once confirmed audit trail feature is not planned.
// @deprecated — remove in next cleanup sprint
export function useAuditLog(params?: { page?: number; limit?: number }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['user', 'audit-log', params],
    queryFn: () => userService.getAuditLog(params).then((res) => res.data.data),
    enabled: false, // L-5 FIX: Disabled until actually wired up in UI
  })
}
