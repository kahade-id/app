export type SubscriptionPlan = 'MONTHLY' | 'ANNUAL'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'SUSPENDED'

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  price: number
  currentPeriodStart: string
  currentPeriodEnd: string
  isAutoRenew: boolean
  cancelledAt: string | null
  lastPaymentAt: string | null
  nextPaymentAt: string | null
  feeSavingsUsed: number
  feeSavingsLimit: number
  feeSavingsRemaining: number
  createdAt: string
}

export interface SubscriptionPlanInfo {
  plan: SubscriptionPlan
  name: string
  price: number
  currency: string
  period: string
  feeRate: number
  feeSavingsLimit: number
  features: string[]
}
