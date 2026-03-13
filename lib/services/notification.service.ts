import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { Notification, NotificationPreference } from '@/types/notification'

export interface NotificationListParams extends PaginationParams {
  isRead?: boolean
}

export const notificationService = {
  list(params?: NotificationListParams) {
    return api.get<PaginatedResponse<Notification>>(API.NOTIFICATIONS_LIST, { params })
  },

  getUnreadCount() {
    return api.get<ApiResponse<{ count: number }>>(API.NOTIFICATIONS_UNREAD_COUNT)
  },

  markRead(id: string) {
    return api.post<ApiResponse<null>>(API.NOTIFICATIONS_MARK_READ(id))
  },

  deleteNotification(id: string) {
    return api.delete<ApiResponse<null>>(API.NOTIFICATIONS_DELETE(id))
  },

  markAllRead() {
    return api.post<ApiResponse<null>>(API.NOTIFICATIONS_MARK_ALL_READ)
  },

  getPreferences() {
    return api.get<ApiResponse<NotificationPreference>>(API.NOTIFICATIONS_PREFERENCES)
  },

  updatePreferences(data: Partial<NotificationPreference>) {
    return api.put<ApiResponse<NotificationPreference>>(API.NOTIFICATIONS_UPDATE_PREFERENCES, data)
  },

  registerDevice(data: { token: string; platform: string }) {
    return api.post<ApiResponse<null>>(API.NOTIFICATIONS_REGISTER_DEVICE, data)
  },
}
