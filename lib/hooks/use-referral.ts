'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { referralService } from '@/lib/services/referral.service'
import { useAuthStore } from '@/lib/stores/auth.store'
import type { PaginationParams } from '@/types/api'

export function useMyReferral() {
  // AUTH-005 FIX: Added isAuthenticated guard
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['referral', 'my'],
    queryFn: () => referralService.getMy().then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}

// CQ-005 FIX: Added missing useReferralStats hook (service method existed, hook didn't)
export function useReferralStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['referral', 'stats'],
    queryFn: () => referralService.getStats().then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}

// CQ-005 FIX: Added missing useReferralRewards hook
export function useReferralRewards(params?: PaginationParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['referral', 'rewards', params],
    queryFn: () => referralService.getRewards(params).then((res) => res.data.data),
    enabled: isAuthenticated,
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['referral', 'history', params],
    queryFn: () => referralService.getHistory(params).then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}
