import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { Subscription, SubscriptionPlan } from '@/types/subscription'
import type { WalletTransaction } from '@/types/wallet'

export interface SubscriptionPlanDetail {
  id: string
  name: string
  price: number
  duration: number
  features: string[]
  isPopular: boolean
}

export interface SubscriptionBenefitData {
  plan: string
  label: string
  benefits: string[]
  feeSavingsRemaining: string
  currentPeriodEnd: string
}

export const subscriptionService = {
  getStatus() {
    return api.get<ApiResponse<Subscription>>(API.SUBSCRIPTIONS_STATUS)
  },

  getPlans() {
    return api.get<ApiResponse<SubscriptionPlanDetail[]>>(API.SUBSCRIPTIONS_PLANS)
  },

  getBenefits() {
    return api.get<ApiResponse<SubscriptionBenefitData>>(API.SUBSCRIPTIONS_BENEFITS)
  },

  subscribe(data: { plan: SubscriptionPlan; paymentMethod?: string }) {
    return api.post<ApiResponse<Subscription>>(API.SUBSCRIPTIONS_SUBSCRIBE, data)
  },

  renew() {
    return api.post<ApiResponse<Subscription>>(API.SUBSCRIPTIONS_RENEW)
  },

  cancel() {
    return api.post<ApiResponse<Subscription>>(API.SUBSCRIPTIONS_CANCEL)
  },

  toggleAutoRenew() {
    return api.patch<ApiResponse<Subscription>>(API.SUBSCRIPTIONS_TOGGLE_AUTO_RENEW)
  },

  getHistory(params?: PaginationParams) {
    return api.get<PaginatedResponse<WalletTransaction>>(API.SUBSCRIPTIONS_HISTORY, { params })
  },
}
