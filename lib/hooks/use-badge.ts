'use client'

import { useQuery } from '@tanstack/react-query'
import { extractData } from '@/lib/api'
import { badgeService } from '@/lib/services/badge.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'

export function useAllBadges() {
  // Public endpoint — no auth guard needed. Fallback to [] is intentional
  // since badge list is public and an empty array is a valid response.
  return useQuery({
    queryKey: ['badges', 'all'],
    queryFn: () => badgeService.listAll().then((res) => res.data.data ?? []),
    staleTime: 10 * 60 * 1000,
  })
}

export function useMyBadges() {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['badges', 'my'],
    queryFn: () => badgeService.getMyBadges().then(extractData),
    enabled: authReady,
  })
}
