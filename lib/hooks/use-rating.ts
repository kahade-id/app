'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { ratingService } from '@/lib/services/rating.service'
import { useAuthStore } from '@/lib/stores/auth.store'
import type { PaginationParams } from '@/types/api'

export function useMyRatings(params?: PaginationParams) {
  // AUTH-004 FIX: Added isAuthenticated guard
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['ratings', 'my', params],
    queryFn: () => ratingService.getMyRatings(params).then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}

// BUG-H02 FIX: Removed useCreateRating — it used ratingService.create() which
// targeted the wrong generic endpoint. No page was calling useCreateRating.
// Use useSubmitRating instead for all order rating submissions.

export function useSubmitRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: { stars: number; comment?: string } }) =>
      ratingService.submit(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['transactions', orderId] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Rating berhasil diberikan')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memberikan rating'))
    },
  })
}

export function useUpdateRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ratingId, data }: { ratingId: string; data: { stars?: number; comment?: string } }) =>
      ratingService.update(ratingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', 'my'] })
      toast.success('Rating berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal memperbarui rating'))
    },
  })
}
