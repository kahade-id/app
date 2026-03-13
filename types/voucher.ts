export type VoucherType = 'FEE_DISCOUNT_FLAT' | 'FEE_DISCOUNT_PERCENT'
export type VoucherApplicability = 'ALL' | 'BUYER_ONLY' | 'SELLER_ONLY' | 'NEW_USER'

export interface Voucher {
  id: string
  voucherId: string
  code: string
  name: string
  description: string
  voucherType: VoucherType
  discountAmount: number | null
  discountPercent: number | null
  maxDiscountAmount: number | null
  maxUsageTotal: number
  maxUsagePerUser: number
  currentUsage: number
  isActive: boolean
  validFrom: string
  validUntil: string
  minOrderValue: number
  applicableTo: VoucherApplicability
}

export interface VoucherValidateResponse {
  isValid: boolean
  discountAmount: number
  discountPercent: number | null
  maxDiscountAmount: number | null
  message: string
}
