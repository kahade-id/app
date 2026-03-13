'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { disputeService, type DisputeListParams } from '@/lib/services/dispute.service'
import { useAuthStore } from '@/lib/stores/auth.store'
import { ROUTES } from '@/lib/constants'

export function useMyDisputes(params?: DisputeListParams) {
  // AUTH-001 FIX: Added isAuthenticated guard to prevent 401 requests before login
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['disputes', 'my', params],
    queryFn: () => disputeService.getMyDisputes(params).then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}

export function useDisputeDetail(id: string) {
  // H-3 FIX: Added isAuthenticated guard. Previously query fired even when unauthenticated,
  // causing unnecessary 401 requests and leaking request metadata to the backend.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['disputes', id],
    queryFn: () => disputeService.getDetail(id).then((res) => res.data.data),
    enabled: isAuthenticated && !!id,
  })
}

export function useSubmitClaim() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: { claim: string } }) =>
      disputeService.submitClaim(orderId, data),
    onSuccess: ({ data: res }) => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Klaim dispute berhasil diajukan')
      if (res.data) {
        router.push(ROUTES.DISPUTE_DETAIL(res.data.id))
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengajukan dispute'))
    },
  })
}

export function useSubmitEvidence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { description: string; fileUrls: string[]; fileTypes: string[] } }) =>
      disputeService.submitEvidence(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['disputes', id] })
      toast.success('Bukti berhasil dikirim')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengirim bukti'))
    },
  })
}
