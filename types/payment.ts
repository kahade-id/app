import type { PaymentMethod } from './wallet'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface PaymentInstruction {
  paymentMethod: PaymentMethod
  paymentUrl?: string
  virtualAccountNumber?: string
  bankName?: string
  qrCodeUrl?: string
  amount: number
  expiresAt: string
  status: PaymentStatus
  midtransOrderId: string
}

export interface PaymentStatusResponse {
  orderId: string
  midtransOrderId: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  amount: number
  paidAt?: string
  expiresAt: string
}
