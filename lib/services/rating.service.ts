import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { Rating } from '@/types/rating'

export const ratingService = {
  // BUG-H02 FIX: Removed create() — it targeted the wrong generic endpoint
  // (API.RATINGS_CREATE) and was only used by the now-removed useCreateRating hook.
  // All callers should use submit() which is order-scoped (API.RATINGS_SUBMIT).

  submit(orderId: string, data: { stars: number; comment?: string }) {
    return api.post<ApiResponse<Rating>>(API.RATINGS_SUBMIT(orderId), data)
  },

  update(ratingId: string, data: { stars?: number; comment?: string }) {
    return api.put<ApiResponse<Rating>>(API.RATINGS_UPDATE(ratingId), data)
  },

  getMyRatings(params?: PaginationParams) {
    return api.get<PaginatedResponse<Rating>>(API.RATINGS_MY, { params })
  },
}
