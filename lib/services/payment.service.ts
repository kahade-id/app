import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'

export interface PaymentStatus {
  transactionId: string
  orderId: string
  status: string
  paymentMethod: string
  amount: number
  paidAt: string | null
  expiresAt: string | null
}

export const paymentService = {
  getStatus(midtransOrderId: string) {
    return api.get<ApiResponse<PaymentStatus>>(API.PAYMENT_STATUS(midtransOrderId))
  },
}
