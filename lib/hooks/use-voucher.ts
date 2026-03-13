'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { voucherService } from '@/lib/services/voucher.service'
import { useAuthStore } from '@/lib/stores/auth.store'
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
  // AUTH-007 FIX: Added isAuthenticated guard
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['vouchers', 'available', params],
    queryFn: () => voucherService.getAvailable(params).then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}

export function useMyVoucherUsage(params?: PaginationParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['vouchers', 'my-usage', params],
    queryFn: () => voucherService.getMyUsage(params).then((res) => res.data.data),
    enabled: isAuthenticated,
  })
}
