'use client'

import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/lib/services/public.service'

export function usePublicConfig() {
  return useQuery({
    queryKey: ['public', 'config'],
    queryFn: () => publicService.getConfig().then((res) => res.data.data?.configs ?? []),
    staleTime: 10 * 60 * 1000,
  })
}

export function useFeeSchedule() {
  return useQuery({
    queryKey: ['public', 'fee-schedule'],
    queryFn: () => publicService.getFeeSchedule().then((res) => res.data.data?.feeSchedule ?? null),
    staleTime: 10 * 60 * 1000,
  })
}

export function useBanks() {
  return useQuery({
    queryKey: ['public', 'banks'],
    queryFn: () => publicService.getBanks().then((res) => res.data.data?.banks ?? []),
    staleTime: 30 * 60 * 1000,
  })
}

