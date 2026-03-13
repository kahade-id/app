'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { notificationService, type NotificationListParams } from '@/lib/services/notification.service'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useNotificationStore } from '@/lib/stores/notification.store'

// Query key factory
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: NotificationListParams) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

export function useNotifications(params?: NotificationListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.list(params).then((res) => res.data.data),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  })
}

export function useUnreadNotificationCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const query = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () =>
      notificationService.getUnreadCount().then((res) => res.data.data?.count ?? 0),
    enabled: isAuthenticated,
    // #24 FIX: Gunakan function refetchInterval dengan visibility check agar tab
    // yang di-background tidak terus polling setiap menit — sama seperti
    // useChatMessages dan useChatRooms yang sudah menerapkan pola ini.
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible'
        ? 60 * 1000
        : false,
    staleTime: 30 * 1000,
  })

  // M-11 FIX: Added equality check before calling setUnreadCount.
  // Previously the store was updated on every polling interval even when the value
  // hadn't changed, triggering unnecessary re-renders across all subscribers.
  useEffect(() => {
    if (query.data !== undefined) {
      const current = useNotificationStore.getState().unreadCount
      if (current !== query.data) {
        useNotificationStore.getState().setUnreadCount(query.data)
      }
    }
  }, [query.data])

  return query
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success('Semua notifikasi ditandai telah dibaca')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menandai semua notifikasi'))
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success('Notifikasi berhasil dihapus')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus notifikasi'))
    },
  })
}

// CRH-2 FIX: useNotificationPreferences was imported in pengaturan/page.tsx but did not
// exist, causing a crash on mount. Implemented using the existing notificationService.
export function useNotificationPreferences() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: [...notificationKeys.all, 'preferences'] as const,
    queryFn: () => notificationService.getPreferences().then((res) => res.data.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

// CRH-2 FIX: useUpdateNotificationPreferences was imported in pengaturan/page.tsx but did not
// exist. Implemented using the existing notificationService.updatePreferences endpoint.
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Parameters<typeof notificationService.updatePreferences>[0]) =>
      notificationService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'preferences'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memperbarui preferensi notifikasi'))
    },
  })
}
