export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'
export type MembershipRank = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
export type UserAccountType = 'PERSONAL' | 'BUSINESS'
export type AdminRole = 'SUPER_ADMIN' | 'DISPUTE_ADMIN' | 'KYC_ADMIN' | 'FINANCE_ADMIN' | 'CUSTOMER_SUPPORT'

// #077 FIX: AuthUser has two identifier fields:
// - `id`: internal UUID (used in database relations and internal API calls)
// - `userId`: public user identifier in USR-XXXXXXXX format (used in UI, chat senderId, etc.)
// Rule: For chat senderId comparisons and public-facing display, always use `userId`.
// For database/API operations that reference a specific user record, use `id`.
export interface AuthUser {
  id: string               // Internal UUID (DB primary key)
  userId: string           // Public identifier: USR-XXXXXXXX (use for senderId, display, etc.)
  username: string | null
  email: string
  fullName: string
  bio: string | null
  avatarUrl: string | null
  accountType: UserAccountType
  emailVerified: boolean
  kycStatus: KycStatus
  isKahadePlus: boolean
  subscriptionExpiresAt: string | null
  membershipRank: MembershipRank
  isActive: boolean
  isBanned: boolean
  isMfaEnabled: boolean
  createdAt: string
}

// #078 FIX: AdminUser also has two identifiers:
// - `id`: internal UUID for DB operations
// - `adminId`: public admin identifier in ADMIN-XXXXX format
// Always use `adminId` for display purposes, `id` for internal references.
export interface AdminUser {
  id: string               // Internal UUID
  adminId: string          // Public identifier: ADMIN-XXXXX
  fullName: string
  email: string
  role: AdminRole
  isActive: boolean
  isMfaEnabled: boolean
  lastLoginAt: string | null
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface TwoFALoginResponse {
  requires2FA: true
  tempToken: string
}

export interface TwoFASetupResponse {
  secret: string
  qrCode: string           // base64 PNG data URL
  backupCodes: string[]
}

export interface UserSession {
  id: string
  deviceInfo: string | null
  ipAddress: string
  lastActiveAt: string
  expiresAt: string
  createdAt: string
  isCurrentSession?: boolean
}
