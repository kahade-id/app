'use client'

import { useQuery } from '@tanstack/react-query'
import { badgeService } from '@/lib/services/badge.service'
import { useAuthStore } from '@/lib/stores/auth.store'

export function useAllBadges() {
  return useQuery({
    queryKey: ['badges', 'all'],
    queryFn: () => badgeService.listAll().then((res) => res.data.data ?? []),
    staleTime: 10 * 60 * 1000,
  })
}

export function useMyBadges() {
  // AUTH-008 FIX: Added isAuthenticated guard
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['badges', 'my'],
    queryFn: () => badgeService.getMyBadges().then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}
