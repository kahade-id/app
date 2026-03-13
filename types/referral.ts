export interface ReferralCode {
  id: string
  userId: string
  code: string
  isActive: boolean
  totalReferrals: number
  totalRewardEarned: number
  pendingRewardCount: number
  createdAt: string
}

export interface ReferralRelation {
  id: string
  referrerId: string
  refereeId: string
  isReferrerKyc: boolean
  isRefereeKyc: boolean
  isRewardActive: boolean
  appliedAt: string
  rewardActivatedAt: string | null
}

export interface ReferralReward {
  id: string
  feeAmount: number
  rewardAmount: number
  isCredited: boolean
  creditedAt: string | null
  createdAt: string
}
