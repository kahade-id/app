import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'
import type { SubscriptionPlanInfo } from '@/types/subscription'

export interface PublicConfig {
  maintenanceMode: boolean
  maintenanceMessage: string | null
  minAppVersion: string
  termsVersion: string
  privacyVersion: string
  supportEmail: string
  supportPhone: string
  maxOrderValue: number
  minOrderValue: number
  maxDeliveryDays: number
  minDeliveryDays: number
}

export interface FeeSchedule {
  standardFeeRate: number
  kahadePlusFeeRate: number
  standardFeeDescription: string
  kahadePlusFeeDescription: string
  orderMinValue: number
  orderMaxValue: number
  currency: string
  feeResponsibilityOptions: string[]
}

export interface BankInfo {
  code: string
  name: string
  iconUrl: string | null
}

export const publicService = {
  getConfig() {
    return api.get<ApiResponse<{ configs: Array<{ key: string; value: string; description: string }> }>>(API.PUBLIC_CONFIG)
  },

  getFeeSchedule() {
    return api.get<ApiResponse<{ feeSchedule: FeeSchedule }>>(API.PUBLIC_FEE_SCHEDULE)
  },

  getBanks() {
    return api.get<ApiResponse<{ banks: BankInfo[] }>>(API.PUBLIC_BANKS)
  },

  getSubscriptionPlans() {
    return api.get<ApiResponse<{ plans: SubscriptionPlanInfo[] }>>(API.PUBLIC_SUBSCRIPTION_PLANS)
  },

  healthCheck() {
    return api.get<ApiResponse<{ status: string }>>(API.HEALTH)
  },
}
