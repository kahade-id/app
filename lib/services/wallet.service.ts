import { api, withIdempotencyKey } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginationParams } from '@/types/api'
import type { Wallet, WalletTransaction, TopUpResponse, WithdrawRequest, WalletTransactionType } from '@/types/wallet'

interface WalletTransactionListData {
  transactions: WalletTransaction[]
  total: number
  page: number
  limit: number
}

export interface WalletHistoryParams extends PaginationParams {
  type?: WalletTransactionType
  startDate?: string
  endDate?: string
}

// #063 FIX: Proper return type for withdraw initiation response.
// withdraw() returns txId needed for OTP confirmation step —
// WalletTransaction type doesn't have this field at the top level.
export interface WithdrawInitiationResponse {
  txId: string
  status: string
  amount: number
  bankAccountId: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: string
  enabled: boolean
  iconUrl?: string
}

export const walletService = {
  get() {
    return api.get<ApiResponse<Wallet>>(API.WALLET_GET)
  },

  topUp(data: { amount: number; method: string }, idempotencyKey?: string) {
    return api.post<ApiResponse<TopUpResponse>>(API.WALLET_TOPUP, data, {
      headers: withIdempotencyKey(idempotencyKey),
    })
  },

  cancelTopUp(txId: string) {
    return api.post<ApiResponse<null>>(API.WALLET_TOPUP_CANCEL(txId))
  },

  // #063 FIX: Changed return type from WalletTransaction to WithdrawInitiationResponse
  // because the withdraw endpoint returns { txId, status, amount, bankAccountId }
  // — not a WalletTransaction. TarikDanaPage needs txId for the OTP step.
  withdraw(data: WithdrawRequest, idempotencyKey?: string) {
    return api.post<ApiResponse<WithdrawInitiationResponse>>(API.WALLET_WITHDRAW, data, {
      headers: withIdempotencyKey(idempotencyKey),
    })
  },

  confirmWithdrawOtp(data: { otp: string; txId: string }) {
    return api.post<ApiResponse<WalletTransaction>>(API.WALLET_WITHDRAW_CONFIRM_OTP, data)
  },

  getHistory(params?: WalletHistoryParams) {
    return api.get<ApiResponse<WalletTransactionListData>>(API.WALLET_HISTORY, { params })
  },

  getTransactionDetail(txId: string) {
    return api.get<ApiResponse<WalletTransaction>>(API.WALLET_TRANSACTION_DETAIL(txId))
  },

  getTopUpHistory(params?: PaginationParams) {
    return api.get<ApiResponse<WalletTransactionListData>>(API.WALLET_TOPUP_HISTORY, { params })
  },

  getWithdrawHistory(params?: PaginationParams) {
    return api.get<ApiResponse<WalletTransactionListData>>(API.WALLET_WITHDRAW_HISTORY, { params })
  },

  getPaymentMethods() {
    return api.get<ApiResponse<{ methods: PaymentMethod[] }>>(API.WALLET_PAYMENT_METHODS)
  },

  setPin(data: { pin: string }) {
    return api.post<ApiResponse<null>>(API.WALLET_PIN_SET, data)
  },

  changePin(data: { currentPin: string; newPin: string }) {
    return api.post<ApiResponse<null>>(API.WALLET_PIN_CHANGE, data)
  },

  verifyPin(data: { pin: string }) {
    return api.post<ApiResponse<{ valid: boolean }>>(API.WALLET_PIN_VERIFY, data)
  },
}
