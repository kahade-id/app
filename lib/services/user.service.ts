import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { AuthUser } from '@/types/auth'
import type { Rating, UserRatingSummary } from '@/types/rating'

export interface UserStats {
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  activeOrders: number
  disputeCount: number
  activeDisputes: number
  averageRating: number
  totalRatings: number
  walletBalance: number
  membershipRank: string
  referralCount: number
}

export interface UserProfile {
  id: string
  userId: string
  username: string | null
  fullName: string
  avatarUrl: string | null
  accountType: string
  kycStatus: string
  membershipRank: string
  averageRating: number
  totalOrdersCompleted: number
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  action: string
  description: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface UserDevice {
  id: string
  deviceName: string
  platform: string
  lastActiveAt: string
  createdAt: string
}

export const userService = {
  getMe() {
    return api.get<ApiResponse<AuthUser>>(API.USERS_ME)
  },

  updateProfile(data: { fullName?: string; accountType?: string; bio?: string }) {
    return api.put<ApiResponse<AuthUser>>(API.USERS_UPDATE_PROFILE, data)
  },

  uploadAvatar(file: FormData) {
    return api.put<ApiResponse<{ avatarUrl: string; fileKey?: string }>>(API.USERS_UPLOAD_AVATAR, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  confirmAvatar(data: { fileKey: string }) {
    return api.post<ApiResponse<{ avatarUrl: string }>>(API.USERS_AVATAR_CONFIRM, data)
  },

  deleteAvatar() {
    return api.delete<ApiResponse<null>>(API.USERS_DELETE_AVATAR)
  },

  getStats() {
    return api.get<ApiResponse<UserStats>>(API.USERS_STATS)
  },

  deleteRequest(data: { reason?: string; password: string }) {
    return api.post<ApiResponse<{ message: string }>>(API.USERS_DELETE_REQUEST, data)
  },

  checkAvailability(params: { username?: string; email?: string }) {
    return api.get<ApiResponse<{ available: boolean }>>(API.USERS_AVAILABILITY, { params })
  },

  search(params: { query: string; limit?: number }) {
    return api.get<ApiResponse<{ users: UserProfile[]; total: number; page: number; limit: number }>>(API.USERS_SEARCH, { params })
  },

  getDevices() {
    return api.get<ApiResponse<{ devices: UserDevice[] }>>(API.USERS_DEVICES)
  },

  removeDevice(deviceId: string) {
    return api.delete<ApiResponse<null>>(API.USERS_DEVICE_DELETE(deviceId))
  },

  getActivityLog(params?: PaginationParams) {
    return api.get<PaginatedResponse<AuditLogEntry>>(API.USERS_ACTIVITY_LOG, { params })
  },

  getProfile(username: string) {
    return api.get<ApiResponse<UserProfile>>(API.USERS_PROFILE(username))
  },

  getUserRatings(username: string, params?: { page?: number; limit?: number }) {
    return api.get<ApiResponse<{ ratings: Rating[]; total: number; averageRating: number; page: number; limit: number }>>(
      API.USERS_RATINGS(username),
      { params }
    )
  },

  getAuditLog(params?: { page?: number; limit?: number }) {
    return api.get<PaginatedResponse<AuditLogEntry>>(API.USERS_AUDIT_LOG, { params })
  },
}
