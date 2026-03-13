import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'

export interface PrivacySettings {
  showProfile: boolean
  showRatings: boolean
  showOrderCount: boolean
}

export interface UserReport {
  id: string
  targetId: string
  targetName: string
  category: string
  description: string
  status: string
  createdAt: string
  resolvedAt: string | null
}

export const settingsService = {
  getPrivacy() {
    return api.get<ApiResponse<PrivacySettings>>(API.SETTINGS_PRIVACY)
  },

  updatePrivacy(data: Partial<PrivacySettings>) {
    return api.put<ApiResponse<PrivacySettings>>(API.SETTINGS_PRIVACY, data)
  },

  updateLanguage(data: { language: string }) {
    return api.put<ApiResponse<null>>(API.SETTINGS_LANGUAGE, data)
  },

  blockUser(userId: string) {
    return api.post<ApiResponse<null>>(API.SETTINGS_BLOCK_USER(userId))
  },

  unblockUser(userId: string) {
    return api.delete<ApiResponse<null>>(API.SETTINGS_UNBLOCK_USER(userId))
  },

  getBlockedList() {
    return api.get<ApiResponse<Array<{ id: string; userId: string; fullName: string; username: string | null; blockedAt: string }>>>(API.SETTINGS_BLOCKED_LIST)
  },

  reportUser(data: { targetId: string; category: string; description: string; evidenceUrls?: string[]; relatedOrderId?: string }) {
    return api.post<ApiResponse<{ reportId: string }>>(API.SETTINGS_REPORT_USER, data)
  },

  getMyReports(params?: PaginationParams) {
    return api.get<PaginatedResponse<UserReport>>(API.SETTINGS_MY_REPORTS, { params })
  },
}
