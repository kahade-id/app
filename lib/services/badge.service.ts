import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'
// NOTE-L10 FIX: Import Badge from @/types/badge instead of re-declaring it locally.
// The local re-declaration had a different shape (extra `category` field) which
// could diverge from the canonical type silently.
import type { Badge, UserBadge } from '@/types/badge'

export type { Badge }

export const badgeService = {
  listAll() {
    return api.get<ApiResponse<Badge[]>>(API.BADGES_LIST)
  },

  getMyBadges() {
    return api.get<ApiResponse<UserBadge[]>>(API.BADGES_MY)
  },
}
