'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { getApiErrorMessage, extractData } from '@/lib/api'
import { toast } from 'sonner'
import { voucherService } from '@/lib/services/voucher.service'
import { useAuthReady } from '@/lib/hooks/use-auth-ready'
import type { PaginationParams } from '@/types/api'

export function useValidateVoucher() {
  return useMutation({
    mutationFn: voucherService.validate,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Voucher tidak valid'))
    },
  })
}

export function useAvailableVouchers(params?: PaginationParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['vouchers', 'available', params],
    queryFn: () => voucherService.getAvailable(params).then(extractData),
    enabled: authReady,
  })
}

export function useMyVoucherUsage(params?: PaginationParams) {
  const authReady = useAuthReady()
  return useQuery({
    queryKey: ['vouchers', 'my-usage', params],
    queryFn: () => voucherService.getMyUsage(params).then(extractData),
    enabled: authReady,
  })
}
