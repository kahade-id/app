import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'
import type { Dispute, DisputeEvidence } from '@/types/dispute'

export interface DisputeListParams extends PaginationParams {
  status?: string
  search?: string
}

export const disputeService = {
  getMyDisputes(params?: DisputeListParams) {
    return api.get<PaginatedResponse<Dispute>>(API.DISPUTES_MY, { params })
  },

  submitClaim(orderId: string, data: { claim: string }) {
    return api.post<ApiResponse<Dispute>>(API.DISPUTES_SUBMIT_CLAIM(orderId), data)
  },

  getDetail(id: string) {
    return api.get<ApiResponse<Dispute>>(API.DISPUTES_DETAIL(id))
  },

  submitEvidence(id: string, data: { description: string; fileUrls: string[]; fileTypes: string[] }) {
    return api.post<ApiResponse<DisputeEvidence>>(API.DISPUTES_SUBMIT_EVIDENCE(id), data)
  },
}
