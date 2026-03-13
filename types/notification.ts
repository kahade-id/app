export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PUSH_NOTIFICATION'

export type NotificationType =
  | 'ORDER_NEW'
  | 'ORDER_CONFIRMED'
  | 'ORDER_REJECTED'
  | 'ORDER_PAID'
  | 'ORDER_PROCESSING'
  | 'ORDER_SHIPPED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'ORDER_TIMEOUT_WARNING'
  | 'ORDER_EXTENSION_REQUESTED'
  | 'ORDER_EXTENSION_APPROVED'
  | 'ORDER_EXTENSION_REJECTED'
  | 'DISPUTE_SUBMITTED'
  | 'DISPUTE_ASSIGNED'
  | 'DISPUTE_EVIDENCE_ADDED'
  | 'DISPUTE_RESOLVED'
  | 'DISPUTE_ESCALATED'
  | 'DISPUTE_DECISION_MADE'
  | 'WALLET_TOPUP_SUCCESS'
  | 'WALLET_TOPUP_FAILED'
  | 'WALLET_TOPUP_EXPIRED'
  | 'WALLET_WITHDRAW_SUCCESS'
  | 'WALLET_WITHDRAW_FAILED'
  | 'WALLET_WITHDRAW_OTP'
  | 'WALLET_ESCROW_LOCKED'
  | 'WALLET_ESCROW_RELEASED'
  | 'WALLET_REFUNDED'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'KYC_REVOKED'
  | 'SECURITY_NEW_LOGIN'
  | 'SECURITY_PASSWORD_CHANGED'
  | 'SECURITY_2FA_ENABLED'
  | 'SECURITY_2FA_DISABLED'
  | 'SECURITY_SESSION_REVOKED'
  | 'CHAT_NEW_MESSAGE'
  | 'RANKING_UPDATED'
  | 'RANKING_PROMOTION'
  | 'REFERRAL_REGISTERED'
  | 'REFERRAL_REWARD_CREDITED'
  | 'SUBSCRIPTION_ACTIVATED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_EXPIRED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'BADGE_EARNED'
  | 'MARKETING_PROMO'
  | 'SYSTEM_MAINTENANCE'
  | 'SYSTEM_ANNOUNCEMENT'

export interface Notification {
  id: string
  notifId: string
  userId: string
  type: NotificationType
  channel: NotificationChannel
  title: string
  body: string
  actionUrl: string | null
  isRead: boolean
  readAt: string | null
  isSent: boolean
  refType: string | null
  refId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  expiresAt: string | null
}

export interface NotificationPreference {
  orderInApp: boolean
  orderEmail: boolean
  walletInApp: boolean
  walletEmail: boolean
  securityInApp: boolean
  securityEmail: boolean
  chatInApp: boolean
  disputeInApp: boolean
  disputeEmail: boolean
  rankingInApp: boolean
  marketingEmail: boolean
}
