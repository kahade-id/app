import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { Voucher, VoucherValidateResponse } from '@/types/voucher'

export interface VoucherUsage {
  id: string
  voucherCode: string
  orderId: string
  discountAmount: number
  usedAt: string
}

export const voucherService = {
  validate(data: { code: string; orderValue: number }) {
    return api.post<ApiResponse<VoucherValidateResponse>>(API.VOUCHERS_VALIDATE, data)
  },

  getAvailable(params?: PaginationParams) {
    return api.get<PaginatedResponse<Voucher>>(API.VOUCHERS_AVAILABLE, { params })
  },

  getMyUsage(params?: PaginationParams) {
    return api.get<PaginatedResponse<VoucherUsage>>(API.VOUCHERS_MY_USAGE, { params })
  },
}
