export type WalletTransactionType =
  | 'TOP_UP' | 'WITHDRAW' | 'ORDER_LOCK' | 'ORDER_RELEASE'
  | 'ORDER_REFUND' | 'FEE_DEDUCT' | 'REFERRAL_REWARD'
  | 'SUBSCRIPTION_PAYMENT' | 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'DISPUTE_RELEASE'

export type WalletTransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REVERSED'
export type WithdrawStatus = 'PENDING_OTP' | 'PENDING_PROCESS' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
export type PaymentMethod =
  | 'VIRTUAL_ACCOUNT_BCA' | 'VIRTUAL_ACCOUNT_BNI' | 'VIRTUAL_ACCOUNT_BRI'
  | 'VIRTUAL_ACCOUNT_MANDIRI' | 'VIRTUAL_ACCOUNT_CIMB' | 'VIRTUAL_ACCOUNT_PERMATA'
  | 'VIRTUAL_ACCOUNT_OTHER' | 'QRIS' | 'GOPAY' | 'SHOPEEPAY' | 'OVO' | 'DANA'
  | 'CREDIT_CARD' | 'KAHADE_WALLET'

export interface Wallet {
  availableBalance: number    // IDR
  escrowBalance: number       // IDR
  totalBalance: number        // IDR
  todayTopupAmount: number    // IDR
  todayWithdrawAmount: number // IDR
  dailyTopupLimit: number     // IDR
  dailyWithdrawLimit: number  // IDR
  isLocked: boolean
  lockReason: string | null
  hasPin?: boolean
}

export interface WalletTransaction {
  id: string
  txId: string                // WLT-YYYYMMDD-SERIAL
  type: WalletTransactionType
  status: WalletTransactionStatus
  amount: number              // IDR
  balanceBefore: number       // IDR
  balanceAfter: number        // IDR
  description: string
  orderId: string | null
  withdrawStatus: WithdrawStatus | null
  createdAt: string
  completedAt: string | null
}

export interface TopUpResponse {
  transactionId: string
  paymentMethod: PaymentMethod
  amount: number
  expiresAt: string
  // VA specific
  vaNumber?: string
  vaBank?: string
  // QRIS specific
  qrCodeUrl?: string
  // E-wallet specific
  deepLinkUrl?: string
}

export interface WithdrawRequest {
  amount: number              // IDR
  bankAccountId: string
  pin: string
}
