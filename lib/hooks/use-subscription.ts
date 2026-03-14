'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage, extractData } from '@/lib/api'
import { toast } from 'sonner'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'
import { subscriptionService } from '@/lib/services/subscription.service'
import type { SubscriptionPlan } from '@/types/subscription'
import type { PaginationParams } from '@/types/api'

export function useSubscriptionStatus() {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: () => subscriptionService.getStatus().then(extractData),
    enabled: authReady,
    retry: false,
  })
}

export function useSubscriptionPlans() {
  // Public endpoint — no auth guard needed
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: () => subscriptionService.getPlans().then((res) => res.data.data),
    staleTime: 10 * 60 * 1000,
  })
}

// L-6 FIX: useSubscriptionBenefits is confirmed unused — no page or component imports it.
// Marked for removal. Delete this function once confirmed the subscription benefits
// feature will not be using this hook (or re-wire it in langganan/page.tsx when needed).
// @deprecated — remove in next cleanup sprint
export function useSubscriptionBenefits() {
  return useQuery({
    queryKey: ['subscription', 'benefits'],
    queryFn: () => subscriptionService.getBenefits().then((res) => res.data.data),
    staleTime: 10 * 60 * 1000,
    enabled: false, // L-6 FIX: Disabled until actually wired up in UI — prevents unnecessary API calls
  })
}

export function useSubscribe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { plan: SubscriptionPlan; paymentMethod?: string }) =>
      subscriptionService.subscribe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      toast.success('Langganan Kahade+ berhasil diaktifkan!')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal berlangganan'))
    },
  })
}

export function useRenewSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionService.renew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      toast.success('Langganan berhasil diperpanjang')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memperpanjang langganan'))
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Langganan berhasil dibatalkan')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal membatalkan langganan'))
    },
  })
}

export function useToggleAutoRenew() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => subscriptionService.toggleAutoRenew(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Pengaturan perpanjangan otomatis berhasil diubah')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengubah pengaturan'))
    },
  })
}

export function useSubscriptionHistory(params?: PaginationParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['subscription', 'history', params],
    queryFn: () => subscriptionService.getHistory(params).then(extractData),
    enabled: authReady,
  })
}
