'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth.store'
import { kycService } from '@/lib/services/kyc.service'
import type { PaginationParams } from '@/types/api'

export function useKycStatus() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['kyc', 'status'],
    queryFn: () => kycService.getStatus().then((res) => res.data.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubmitKyc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: kycService.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Dokumen KYC berhasil dikirim. Menunggu review.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim dokumen KYC'))
    },
  })
}

export function useKycHistory(params?: PaginationParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['kyc', 'history', params],
    queryFn: () => kycService.getHistory(params).then((res) => res.data.data),
    // #017 FIX: Added enabled guard — don't query before authenticated
    enabled: isAuthenticated,
  })
}

export function useResubmitKyc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => kycService.resubmit(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['kyc', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('KYC berhasil dikirim ulang. Menunggu review.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim ulang KYC'))
    },
  })
}
