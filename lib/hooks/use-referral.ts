'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage, extractData } from '@/lib/api'
import { toast } from 'sonner'
import { referralService } from '@/lib/services/referral.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'
import type { PaginationParams } from '@/types/api'

export function useMyReferral() {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['referral', 'my'],
    queryFn: () => referralService.getMy().then(extractData),
    enabled: authReady,
  })
}

// CQ-005 FIX: Added missing useReferralStats hook (service method existed, hook didn't)
export function useReferralStats() {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['referral', 'stats'],
    queryFn: () => referralService.getStats().then(extractData),
    enabled: authReady,
  })
}

// CQ-005 FIX: Added missing useReferralRewards hook
export function useReferralRewards(params?: PaginationParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['referral', 'rewards', params],
    queryFn: () => referralService.getRewards(params).then(extractData),
    enabled: authReady,
  })
}

export function useRegenerateReferralCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: referralService.regenerate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral'] })
      toast.success('Kode referral berhasil dibuat ulang')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal membuat ulang kode referral'))
    },
  })
}

export function useApplyReferral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: referralService.apply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral', 'my'] })
      toast.success('Kode referral berhasil diterapkan!')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Kode referral tidak valid'))
    },
  })
}

export function useReferralHistory(params?: PaginationParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['referral', 'history', params],
    queryFn: () => referralService.getHistory(params).then(extractData),
    enabled: authReady,
  })
}
