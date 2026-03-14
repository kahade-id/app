'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage, extractData } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { disputeService, type DisputeListParams } from '@/lib/services/dispute.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'
import { ROUTES } from '@/lib/constants'

export function useMyDisputes(params?: DisputeListParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['disputes', 'my', params],
    queryFn: () => disputeService.getMyDisputes(params).then(extractData),
    enabled: authReady,
  })
}

export function useDisputeDetail(id: string) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['disputes', id],
    queryFn: () => disputeService.getDetail(id).then(extractData),
    enabled: authReady && !!id,
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
