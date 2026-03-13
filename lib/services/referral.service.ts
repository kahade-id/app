import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { ReferralCode, ReferralReward } from '@/types/referral'

export interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  totalRewards: number
  pendingRewards: number
}

export const referralService = {
  getMy() {
    return api.get<ApiResponse<ReferralCode>>(API.REFERRAL_MY)
  },

  getStats() {
    return api.get<ApiResponse<ReferralStats>>(API.REFERRAL_STATS)
  },

  getRewards(params?: PaginationParams) {
    return api.get<PaginatedResponse<ReferralReward>>(API.REFERRAL_REWARDS, { params })
  },

  regenerate() {
    return api.post<ApiResponse<{ code: string }>>(API.REFERRAL_REGENERATE)
  },

  apply(data: { code: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.REFERRAL_APPLY, data)
  },

  getHistory(params?: PaginationParams) {
    return api.get<PaginatedResponse<ReferralReward>>(API.REFERRAL_HISTORY, { params })
  },
}
