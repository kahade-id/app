import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'
import type { UserSession } from '@/types/auth'

export const sessionService = {
  list() {
    return api.get<ApiResponse<{ sessions: UserSession[] }>>(API.SESSIONS_LIST)
  },

  revoke(id: string) {
    return api.delete<ApiResponse<null>>(API.SESSIONS_REVOKE(id))
  },

  revokeAll() {
    return api.delete<ApiResponse<null>>(API.SESSIONS_REVOKE_ALL)
  },

  revokeOthers() {
    return api.delete<ApiResponse<null>>(API.SESSIONS_REVOKE_OTHERS)
  },
}
