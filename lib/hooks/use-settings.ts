'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage, extractData } from '@/lib/api'
import { toast } from 'sonner'
import { settingsService, type PrivacySettings } from '@/lib/services/settings.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'
import type { PaginationParams } from '@/types/api'

export function usePrivacySettings() {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['settings', 'privacy'],
    queryFn: () => settingsService.getPrivacy().then(extractData),
    enabled: authReady,
  })
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<PrivacySettings>) => settingsService.updatePrivacy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'privacy'] })
      toast.success('Pengaturan privasi berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memperbarui pengaturan privasi'))
    },
  })
}

export function useUpdateLanguage() {
  return useMutation({
    mutationFn: settingsService.updateLanguage,
    onSuccess: () => {
      toast.success('Bahasa berhasil diubah')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengubah bahasa'))
    },
  })
}

export function useBlockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: settingsService.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'blocked'] })
      toast.success('Pengguna berhasil diblokir')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memblokir pengguna'))
    },
  })
}

export function useUnblockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: settingsService.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'blocked'] })
      toast.success('Pengguna berhasil di-unblokir')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal meng-unblokir pengguna'))
    },
  })
}

export function useBlockedList() {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['settings', 'blocked'],
    queryFn: () => settingsService.getBlockedList().then(extractData),
    enabled: authReady,
  })
}

export function useReportUser() {
  return useMutation({
    mutationFn: settingsService.reportUser,
    onSuccess: () => {
      toast.success('Laporan berhasil dikirim')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim laporan'))
    },
  })
}

export function useMyReports(params?: PaginationParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['settings', 'my-reports', params],
    queryFn: () => settingsService.getMyReports(params).then(extractData),
    enabled: authReady,
  })
}
